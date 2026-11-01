import { NextResponse } from "next/server";
import { z } from "zod";
import { loadSnapshot, saveFlow } from "@/lib/store";

export const dynamic = "force-dynamic";

const Step = z.object({
  id: z.string().optional(),
  kind: z.enum([
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
  ]),
  name: z.string().min(1),
  target: z.string().optional(),
  expect: z.string().optional(),
  assertion: z.string().optional(),
  critical: z.boolean().optional(),
});

const FlowInput = z.object({
  id: z.string().optional(),
  projectId: z.string().min(1),
  name: z.string().min(3),
  module: z.string().default("ทั่วไป"),
  description: z.string().default(""),
  steps: z.array(Step).default([]),
  tags: z.array(z.string()).default([]),
  browsers: z.array(z.string()).default(["chromium"]),
  status: z.enum(["draft", "ready", "paused"]).default("draft"),
});

export async function GET() {
  const s = await loadSnapshot();
  return NextResponse.json({
    flows: s.flows.map((f) => ({
      ...f,
      projectKey: s.projects.find((p) => p.id === f.projectId)?.key ?? "",
      runCount: s.runs.filter((r) => r.flowId === f.id).length,
    })),
  });
}

export async function POST(req: Request) {
  try {
    const parsed = FlowInput.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "ข้อมูล flow ไม่ถูกต้อง", detail: parsed.error.flatten() }, { status: 400 });
    }
    const steps = parsed.data.steps.map((st, i) => ({ ...st, id: st.id ?? `s${i + 1}`, critical: st.critical ?? true }));
    const flow = await saveFlow({ ...parsed.data, steps });
    return NextResponse.json({ flow }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
