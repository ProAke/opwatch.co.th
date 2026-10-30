import { NextResponse } from "next/server";
import { z } from "zod";
import { addEvent, loadSnapshot, saveAgent, saveFlow, saveProject, saveSchedule } from "@/lib/store";
import { designFlow } from "@/lib/designer";
import { AGENT_TEMPLATES, buildAgentBlueprints } from "@/lib/agent-templates";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// One-shot onboarding: project + starter agents + first flow + schedule.
// Used by /projects/new so "ย้ายไปโปรเจกต์ใหม่" is a single guided wizard.
// ─────────────────────────────────────────────────────────────────────────────

const Input = z.object({
  project: z.object({
    name: z.string().min(2),
    key: z.string().optional(),
    description: z.string().optional(),
    baseUrl: z.string().optional(),
    repoUrl: z.string().optional(),
    driveFolder: z.string().optional(),
    env: z.enum(["production", "staging", "demo", "local"]).default("staging"),
    color: z.string().optional(),
    owner: z.string().optional(),
    menus: z.number().int().min(0).optional(),
  }),
  agents: z
    .object({
      template: z.enum(["web", "api_db", "full", "erp"]).default("full"),
      modelId: z.string().optional(),
      autonomy: z.enum(["advise", "semi", "zero_touch"]).default("zero_touch"),
    })
    .default({ template: "full", autonomy: "zero_touch" }),
  flow: z
    .object({
      module: z.string().optional(),
      name: z.string().optional(),
      spec: z.string().min(5),
    })
    .optional(),
  schedule: z
    .object({
      name: z.string().optional(),
      cadence: z.enum(["manual", "hourly", "daily", "weekdays", "weekly", "monthly"]).default("daily"),
      timeOfDay: z.string().regex(/^\d{2}:\d{2}$/).default("09:00"),
      timezone: z.string().default("Asia/Bangkok"),
      notify: z.array(z.string()).default(["mng"]),
    })
    .optional(),
});

export async function GET() {
  return NextResponse.json({
    templates: AGENT_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      bestFor: t.bestFor,
      agentCount: t.agents.length,
      roles: t.agents.map((a) => a.role),
    })),
    steps: ["ข้อมูลโปรเจกต์", "ชุด AI Agent", "Flow แรกจาก SPEC", "ตารางรัน (ไม่บังคับ)"],
  });
}

export async function POST(req: Request) {
  try {
    const parsed = Input.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน", detail: parsed.error.flatten() }, { status: 400 });
    }
    const { project: pInput, agents: aInput, flow: fInput, schedule: sInput } = parsed.data;

    // 1) project
    const project = await saveProject({
      name: pInput.name,
      key: pInput.key,
      description: pInput.description,
      baseUrl: pInput.baseUrl,
      repoUrl: pInput.repoUrl,
      driveFolder: pInput.driveFolder,
      env: pInput.env,
      color: pInput.color ?? "#22d3ee",
      owner: pInput.owner,
      menus: pInput.menus ?? 0,
    });

    // 2) starter agents
    const snapshot = await loadSnapshot();
    const blueprints = buildAgentBlueprints(aInput.template, project.name, project.key);
    const createdAgents = [];
    for (const bp of blueprints) {
      const agent = await saveAgent({
        projectId: project.id,
        name: bp.name,
        role: bp.role,
        modelId: aInput.modelId ?? defaultModelFor(snapshot.models.map((m) => ({ id: m.id, provider: m.provider, status: m.status })), bp.role),
        avatar: bp.avatar,
        systemPrompt: bp.systemPrompt,
        tools: bp.tools,
        autonomy: aInput.autonomy,
        status: "active",
      });
      createdAgents.push(agent);
    }

    // 3) first flow (optional)
    let flow = null;
    if (fInput?.spec) {
      const designed = await designFlow({
        projectId: project.id,
        projectName: project.name,
        projectKey: project.key,
        baseUrl: project.baseUrl,
        spec: fInput.spec,
        module: fInput.module,
        name: fInput.name,
      });
      flow = await saveFlow({
        projectId: project.id,
        name: designed.name,
        module: designed.module,
        description: `สร้างจาก SPEC ตอน onboarding · ${designed.engine === "llm" ? "LLM" : "heuristic"}`,
        steps: designed.steps,
        tags: [designed.module, "onboarding"],
        browsers: ["chromium"],
        status: "ready",
        createdBy: "agt_design",
      });
    }

    // 4) schedule (optional)
    let schedule = null;
    if (sInput && flow) {
      const webAgent = createdAgents.find((a) => a.role === "web_executor") ?? createdAgents[0];
      schedule = await saveSchedule({
        projectId: project.id,
        flowId: flow.id,
        name: sInput.name ?? `${flow.name} · อัตโนมัติ`,
        cadence: sInput.cadence,
        timeOfDay: sInput.timeOfDay,
        timezone: sInput.timezone,
        agentId: webAgent?.id,
        env: project.env,
        status: sInput.cadence === "manual" ? "paused" : "active",
        notify: sInput.notify,
      });
    }

    await addEvent({
      actor: "agt_orch",
      kind: "project.onboarded",
      level: "success",
      message: `เริ่มโปรเจกต์ “${project.name}” (${project.key}) · ${createdAgents.length} agent${
        flow ? ` · flow แรก ${flow.steps.length} ขั้น` : ""
      }${schedule ? ` · ตาราง ${schedule.cadence} ${schedule.timeOfDay}` : ""}`,
      projectId: project.id,
    });

    return NextResponse.json(
      {
        project,
        agents: createdAgents,
        flow,
        schedule,
        next: [
          "ต่อ GitHub / Drive ในหน้า Integrations",
          "ตั้ง MCP_TOKEN เพื่อให้ Claude Code / Antigravity สั่งรันได้",
          "เปิด /runs เพื่อดูรอบแรก หรือกดรันจากหน้าโปรเจกต์",
        ],
      },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

function defaultModelFor(
  models: { id: string; provider: string; status: string }[],
  role: string,
): string {
  const active = models.filter((m) => m.status === "active");
  const pick = (provider: string) => active.find((m) => m.provider === provider)?.id;
  switch (role) {
    case "web_executor":
      return pick("ollama") ?? pick("google") ?? active[0]?.id ?? "mdl_deepseek";
    case "api_validator":
      return pick("openai") ?? pick("google") ?? active[0]?.id ?? "mdl_glm";
    case "db_validator":
      return pick("ollama") ?? pick("google") ?? active[0]?.id ?? "mdl_deepseek";
    case "test_designer":
    case "doc_writer":
      return pick("google") ?? pick("anthropic") ?? active[0]?.id ?? "mdl_gemini_pro";
    case "orchestrator":
    case "fixer":
      return pick("anthropic") ?? pick("openai") ?? active[0]?.id ?? "mdl_claude_sonnet";
    default:
      return pick("openai") ?? pick("google") ?? active[0]?.id ?? "mdl_gemini_flash";
  }
}
