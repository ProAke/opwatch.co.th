import { NextResponse } from "next/server";
import { listBranches } from "@/lib/github";

export const dynamic = "force-dynamic";

// GET /api/github/branches?repo=owner/name
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const repo = searchParams.get("repo") ?? "";
  const fallback = searchParams.get("default") ?? "main";
  if (!repo) return NextResponse.json({ error: "ต้องระบุ repo (owner/name)" }, { status: 400 });
  const result = await listBranches(repo, fallback);
  return NextResponse.json(result);
}
