import { NextResponse } from "next/server";
import { z } from "zod";
import { addEvent, loadSnapshot } from "@/lib/store";
import type { FlowStep, StepKind } from "@/lib/types";
import { aiConfigured, completeJson } from "@/lib/ai";

export const dynamic = "force-dynamic";

const Input = z.object({
  projectId: z.string().min(1),
  spec: z.string().min(5),
  module: z.string().optional(),
  name: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// "ให้ AI ออกแบบ flow จาก SPEC" — deterministic test-designer heuristic.
// Reads the SPEC line by line and maps intent → step kind. (When ANTHROPIC /
// GEMINI keys exist the same SPEC is sent to the model; see lib/ai.ts.)
// ─────────────────────────────────────────────────────────────────────────────

function classify(line: string): { kind: StepKind; target?: string; expect?: string; assertion?: string } {
  const l = line.toLowerCase();
  const url = line.match(/https?:\/\/\S+|\/[\w\-/{}.[\]]+/)?.[0];
  if (/(api|endpoint|http|json)/.test(l)) {
    return { kind: "api.request", target: url ?? "/api/…", assertion: /40\d/.test(l) ? "status 403" : "HTTP 200 && schema ถูกต้อง" };
  }
  if (/(database|ฐานข้อมูล|sql|ตาราง|db )/.test(l)) {
    return { kind: "db.query", target: line.match(/[a-z_]+\.[a-z_]+/)?.[0] ?? "smldemo.…", assertion: "ค่าตรงกับที่คาดหวัง" };
  }
  if (/(รายงาน|report|งบ|p&l|balance)/.test(l)) {
    return { kind: "report.check", target: line.slice(0, 60), assertion: "ผลต่าง ≤ 0.01" };
  }
  if (/(กรอก|พิมพ์|เลือก|fill|input)/.test(l)) {
    return { kind: "fill", target: line.slice(0, 60) };
  }
  if (/(คลิก|กด|เลือกเมนู|click|button)/.test(l)) {
    return { kind: "click", target: line.match(/[\w\-.[\]=]+/)?.[0] ?? "element" };
  }
  if (/(คาดหวัง|ต้อง|แสดง|expect|>=|<=|=)/.test(l)) {
    return { kind: "expect", expect: line.replace(/^(คาดหวัง|expect)[:\s]*/i, "").slice(0, 90) };
  }
  if (/(เปิด|ไปที่|navigate|หน้า)/.test(l)) {
    return { kind: "navigate", target: url ?? "/" };
  }
  return { kind: "click", target: line.slice(0, 50) };
}

export async function POST(req: Request) {
  const parsed = Input.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "ต้องมี projectId และ SPEC" }, { status: 400 });
  const { projectId, spec } = parsed.data;
  const s = await loadSnapshot();
  const project = s.projects.find((p) => p.id === projectId);
  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });

  const lines = spec
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s\-•*\d.)]+/, "").trim())
    .filter((l) => l.length > 2);

  // 1) Try a real model when keys exist (designer agent) — 2) fall back to the
  //    deterministic heuristic so the pipeline never blocks on an LLM outage.
  let modelNote = "โหมดสาธิต: ใช้ test-designer heuristic ของระบบ";
  if (aiConfigured()) {
    const allowed: StepKind[] = ["navigate", "click", "fill", "expect", "api.request", "db.query", "report.check", "ai.review", "issue.create", "notify"];
    const design = await completeJson<{ steps?: { kind?: string; name?: string; target?: string; expect?: string; assertion?: string; critical?: boolean }[] }>({
      system:
        "You are a senior QA test designer for a Thai ERP web app. Convert the SPEC into an ordered list of executable test steps. Reply ONLY with JSON: {\"steps\":[{\"kind\":\"navigate|click|fill|expect|api.request|db.query|report.check|ai.review|issue.create|notify\",\"name\":\"ภาษาไทย\",\"target\":\"selector/url/table\",\"expect\":\"ค่าที่คาดหวัง\",\"assertion\":\"เงื่อนไข\",\"critical\":true}]}",
      prompt: `โปรเจกต์: ${project.name} (${project.key})\nระบบ: ${project.baseUrl}\nโมดูล: ${parsed.data.module ?? "ทั่วไป"}\nSPEC:\n${spec}`,
      maxTokens: 2500,
    });
    if (design?.steps?.length) {
      const aiSteps: FlowStep[] = design.steps.slice(0, 30).map((st, i) => ({
        id: `s${i + 1}`,
        kind: (allowed.includes(st.kind as StepKind) ? st.kind : "click") as StepKind,
        name: String(st.name ?? `ขั้นตอน ${i + 1}`).slice(0, 160),
        target: st.target ? String(st.target).slice(0, 160) : undefined,
        expect: st.expect ? String(st.expect).slice(0, 160) : undefined,
        assertion: st.assertion ? String(st.assertion).slice(0, 160) : undefined,
        critical: st.critical ?? true,
      }));
      const name = parsed.data.name ?? `${parsed.data.module ?? "SPEC"} — ${project.key}`;
      await addEvent({
        actor: "agt_design",
        kind: "flow.generated",
        level: "success",
        message: `AI (LLM) ออกแบบ flow “${name}” ได้ ${aiSteps.length} ขั้นตอน`,
        projectId,
      });
      return NextResponse.json({ name, module: parsed.data.module ?? "ทั่วไป", steps: aiSteps, note: "สร้างด้วย LLM จริงตาม SPEC" });
    }
    modelNote = "เชื่อม LLM ไม่สำเร็จ — ใช้ heuristic ภายในแทน";
  }

  const steps: FlowStep[] = [];
  // Always start at the feature entry point.
  if (!lines.some((l) => /^(เปิด|ไปที่|navigate)/i.test(l))) {
    steps.push({ id: "s1", kind: "navigate", name: `เปิดหน้า ${parsed.data.module ?? project.name}`, target: "/", critical: true });
  }
  lines.forEach((line, i) => {
    const c = classify(line);
    steps.push({
      id: `s${steps.length + 1}`,
      kind: c.kind,
      name: line.slice(0, 120),
      target: c.target,
      expect: c.expect,
      assertion: c.assertion,
      critical: !/แจ้งเตือน|notify/i.test(line),
    });
    void i;
  });

  steps.push({ id: `s${steps.length + 1}`, kind: "ai.review", name: "AI ตรวจทานหลักฐานเทียบกับ SPEC", critical: false });
  steps.push({ id: `s${steps.length + 1}`, kind: "issue.create", name: "เปิด Issue อัตโนมัติเมื่อผลไม่ตรง SPEC", critical: false });

  const name = parsed.data.name ?? `${parsed.data.module ?? "SPEC"} — ${project.key}`;
  await addEvent({
    actor: "agt_design",
    kind: "flow.generated",
    level: "success",
    message: `AI ออกแบบ flow “${name}” จาก SPEC ได้ ${steps.length} ขั้นตอน`,
    projectId,
  });

  return NextResponse.json({
    name,
    module: parsed.data.module ?? "ทั่วไป",
    steps,
    note: modelNote,
  });
}
