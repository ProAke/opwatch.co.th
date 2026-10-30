import { NextResponse } from "next/server";
import { advanceRun } from "@/lib/store";

export const dynamic = "force-dynamic";

// GET advances the simulation to wall-clock time and returns the live run.
// The run-detail screen polls this every 1.5s so the console feels alive.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = await advanceRun(id);
  if (!run) return NextResponse.json({ error: "run not found" }, { status: 404 });
  return NextResponse.json({ run });
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = await advanceRun(id);
  if (!run) return NextResponse.json({ error: "run not found" }, { status: 404 });
  return NextResponse.json({ run });
}
