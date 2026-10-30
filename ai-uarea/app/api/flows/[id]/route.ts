import { NextResponse } from "next/server";
import { deleteFlow, getFlow, loadSnapshot, saveFlow } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const flow = await getFlow(id);
  if (!flow) return NextResponse.json({ error: "flow not found" }, { status: 404 });
  const s = await loadSnapshot();
  return NextResponse.json({
    flow,
    runs: s.runs.filter((r) => r.flowId === id).slice(0, 20),
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await getFlow(id);
  if (!existing) return NextResponse.json({ error: "flow not found" }, { status: 404 });
  const body = await req.json();
  const flow = await saveFlow({ ...existing, ...body, id });
  return NextResponse.json({ flow });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteFlow(id);
  return NextResponse.json({ ok: true });
}
