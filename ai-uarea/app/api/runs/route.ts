import { NextResponse } from "next/server";
import { createRun, loadSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const flowId = searchParams.get("flowId");
  const status = searchParams.get("status");
  const limit = Number(searchParams.get("limit") ?? 50);
  const s = await loadSnapshot();
  const runs = s.runs
    .filter((r) => (projectId ? r.projectId === projectId : true))
    .filter((r) => (flowId ? r.flowId === flowId : true))
    .filter((r) => (status ? r.status === status : true))
    .slice(0, limit)
    .map((r) => ({
      ...r,
      flowName: s.flows.find((f) => f.id === r.flowId)?.name ?? r.flowId,
      projectKey: s.projects.find((p) => p.id === r.projectId)?.key ?? "",
      agentName: s.agents.find((a) => a.id === r.agentId)?.name ?? "",
      modelName: s.models.find((m) => m.id === r.modelId)?.name ?? "",
    }));
  return NextResponse.json({ runs });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.flowId) return NextResponse.json({ error: "flowId is required" }, { status: 400 });
    const s = await loadSnapshot();
    const flow = s.flows.find((f) => f.id === body.flowId);
    if (!flow) return NextResponse.json({ error: "flow not found" }, { status: 404 });
    const run = await createRun({
      flowId: flow.id,
      projectId: body.projectId ?? flow.projectId,
      agentId: body.agentId,
      trigger: body.trigger ?? "manual",
      browser: body.browser,
      env: body.env,
    });
    return NextResponse.json({ run }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
