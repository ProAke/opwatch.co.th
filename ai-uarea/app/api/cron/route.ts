import { NextResponse } from "next/server";
import { runDueSchedules } from "@/lib/scheduler";

export const dynamic = "force-dynamic";

// Hook this from system cron / mng.uarea.in / Vercel Cron:
//   */5 * * * * curl -X POST https://ai.uarea.in/api/cron -H "Authorization: Bearer $CRON_SECRET"
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET || process.env.MCP_TOKEN;
  if (!secret) return true;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

async function handle(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "invalid token" }, { status: 401 });
  const result = await runDueSchedules();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
