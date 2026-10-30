import { NextResponse } from "next/server";
import { loadSnapshot, updateAgent } from "@/lib/store";
import { dbEnabled, updateRow } from "@/lib/db";

export const dynamic = "force-dynamic";

// Toggle a model on/off, or point an agent at another model.
export async function PATCH(req: Request) {
  const body = await req.json();
  if (body?.agentId) {
    await updateAgent(body.agentId, { modelId: body.modelId });
    return NextResponse.json({ ok: true });
  }
  if (!body?.modelId) return NextResponse.json({ error: "modelId is required" }, { status: 400 });
  if (dbEnabled()) {
    await updateRow("ai_models", body.modelId, { status: body.status });
  } else {
    const s = await loadSnapshot();
    const m = s.models.find((x) => x.id === body.modelId);
    if (m) m.status = body.status;
  }
  return NextResponse.json({ ok: true });
}
