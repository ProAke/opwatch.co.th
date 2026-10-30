import { NextResponse } from "next/server";
import { z } from "zod";
import { createIssue, loadSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

const CreateIssue = z.object({
  projectId: z.string().min(1),
  title: z.string().min(4).max(240),
  description: z.string().default(""),
  severity: z.enum(["S1", "S2", "S3", "S4"]).default("S3"),
  source: z.enum(["uat", "mcp", "manual", "monitor"]).default("manual"),
  runId: z.string().nullable().optional(),
  flowId: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const status = searchParams.get("status");
  const s = await loadSnapshot();
  const issues = s.issues
    .filter((i) => (projectId ? i.projectId === projectId : true))
    .filter((i) => (status ? i.status === status : true))
    .map((i) => ({
      ...i,
      projectKey: s.projects.find((p) => p.id === i.projectId)?.key ?? "",
      flowName: s.flows.find((f) => f.id === i.flowId)?.name ?? null,
    }));
  return NextResponse.json({ issues });
}

export async function POST(req: Request) {
  try {
    const parsed = CreateIssue.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน", detail: parsed.error.flatten() }, { status: 400 });
    }
    const issue = await createIssue({ ...parsed.data, agentId: "agt_issue" });
    return NextResponse.json({ issue }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
