import { addEvent } from "@/lib/store";
import type { FlowStep, StepKind } from "@/lib/types";
import { aiConfigured, completeJson } from "@/lib/ai";

// ─────────────────────────────────────────────────────────────────────────────
// Test designer — turns a SPEC written by a human into executable steps.
//   1) If an LLM key exists, ask the designer model (structured JSON).
//   2) Otherwise fall back to a deterministic line-by-line classifier.
// Both return the same shape so callers never care which path ran.
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED: StepKind[] = [
  "navigate",
  "click",
  "fill",
  "expect",
  "api.request",
  "db.query",
  "report.check",
  "ai.review",
  "issue.create",
  "notify",
];

export interface DesignInput {
  projectId: string;
  projectName: string;
  projectKey: string;
  baseUrl?: string;
  spec: string;
  module?: string;
  name?: string;
}

export interface DesignResult {
  name: string;
  module: string;
  steps: FlowStep[];
  note: string;
  engine: "llm" | "heuristic";
}

function normalizeLines(spec: string): string[] {
  return spec
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s\-•*\d.)]+/, "").trim())
    .filter((l) => l.length > 2);
}

function classify(line: string): { kind: StepKind; target?: string; expect?: string; assertion?: string } {
  const l = line.toLowerCase();
  const url = line.match(/https?:\/\/\S+|\/[\w\-/{}.[\]]+/)?.[0];
  if (/(api|endpoint|http|json)/.test(l)) {
    return {
      kind: "api.request",
      target: url ?? "/api/…",
      assertion: /40\d/.test(l) ? "status 403" : "HTTP 200 && schema ถูกต้อง",
    };
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

export function heuristicSteps(input: Pick<DesignInput, "spec" | "projectName" | "module">): FlowStep[] {
  const { spec, projectName, module } = input;
  const lines = normalizeLines(spec);
  const steps: FlowStep[] = [];

  if (!lines.some((l) => /^(เปิด|ไปที่|navigate)/i.test(l))) {
    steps.push({ id: "s1", kind: "navigate", name: `เปิดหน้า ${module ?? projectName}`, target: "/", critical: true });
  }

  for (const line of lines) {
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
  }

  steps.push({ id: `s${steps.length + 1}`, kind: "ai.review", name: "AI ตรวจทานหลักฐานเทียบกับ SPEC", critical: false });
  steps.push({ id: `s${steps.length + 1}`, kind: "issue.create", name: "เปิด Issue อัตโนมัติเมื่อผลไม่ตรง SPEC", critical: false });
  return steps;
}

export async function designFlow(input: DesignInput): Promise<DesignResult> {
  const module = input.module ?? "ทั่วไป";
  const fallbackName = input.name ?? `${module} — ${input.projectKey}`;

  if (aiConfigured()) {
    const design = await completeJson<{
      steps?: { kind?: string; name?: string; target?: string; expect?: string; assertion?: string; critical?: boolean }[];
    }>({
      system:
        'You are a senior QA test designer for a Thai ERP web app. Convert the SPEC into an ordered list of executable test steps. Reply ONLY with JSON: {"steps":[{"kind":"navigate|click|fill|expect|api.request|db.query|report.check|ai.review|issue.create|notify","name":"ภาษาไทย","target":"selector/url/table","expect":"ค่าที่คาดหวัง","assertion":"เงื่อนไข","critical":true}]}',
      prompt: `โปรเจกต์: ${input.projectName} (${input.projectKey})\nระบบ: ${input.baseUrl ?? "-"}\nโมดูล: ${module}\nSPEC:\n${input.spec}`,
      maxTokens: 2500,
    });

    if (design?.steps?.length) {
      const steps: FlowStep[] = design.steps.slice(0, 30).map((st, i) => ({
        id: `s${i + 1}`,
        kind: (ALLOWED.includes(st.kind as StepKind) ? st.kind : "click") as StepKind,
        name: String(st.name ?? `ขั้นตอน ${i + 1}`).slice(0, 160),
        target: st.target ? String(st.target).slice(0, 160) : undefined,
        expect: st.expect ? String(st.expect).slice(0, 160) : undefined,
        assertion: st.assertion ? String(st.assertion).slice(0, 160) : undefined,
        critical: st.critical ?? true,
      }));
      await addEvent({
        actor: "agt_design",
        kind: "flow.generated",
        level: "success",
        message: `AI (LLM) ออกแบบ flow “${fallbackName}” ได้ ${steps.length} ขั้นตอน`,
        projectId: input.projectId,
      });
      return { name: fallbackName, module, steps, note: "สร้างด้วย LLM จริงตาม SPEC", engine: "llm" };
    }
  }

  const steps = heuristicSteps(input);
  await addEvent({
    actor: "agt_design",
    kind: "flow.generated",
    level: "success",
    message: `AI ออกแบบ flow “${fallbackName}” จาก SPEC ได้ ${steps.length} ขั้นตอน`,
    projectId: input.projectId,
  });
  return {
    name: fallbackName,
    module,
    steps,
    note: aiConfigured() ? "เชื่อม LLM ไม่สำเร็จ — ใช้ heuristic ภายในแทน" : "ใช้ test-designer heuristic ของระบบ (ยังไม่ตั้งกุญแจ LLM)",
    engine: "heuristic",
  };
}
