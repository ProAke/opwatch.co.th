import { NextResponse } from "next/server";
import { loadSnapshot, storageMode } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await loadSnapshot();
  return NextResponse.json({
    ok: true,
    service: "ai.uarea.in",
    storage: storageMode(),
    counts: {
      projects: s.projects.length,
      flows: s.flows.length,
      runs: s.runs.length,
      issues: s.issues.length,
      agents: s.agents.length,
    },
    time: new Date().toISOString(),
  });
}
