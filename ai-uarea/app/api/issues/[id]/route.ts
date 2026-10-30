import { NextResponse } from "next/server";
import { z } from "zod";
import { loadSnapshot, updateIssue } from "@/lib/store";

export const dynamic = "force-dynamic";

const PatchIssue = z.object({
  status: z.enum(["open", "triaged", "fixing", "in_review", "closed", "wontfix"]).optional(),
  severity: z.enum(["S1", "S2", "S3", "S4"]).optional(),
  assignee: z.string().optional(),
  fixBranch: z.string().nullable().optional(),
  fixPrUrl: z.string().nullable().optional(),
  recheckRunId: z.string().nullable().optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await loadSnapshot();
  const issue = s.issues.find((i) => i.id === id);
  if (!issue) return NextResponse.json({ error: "issue not found" }, { status: 404 });
  return NextResponse.json({ issue });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = PatchIssue.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  const issue = await updateIssue(id, parsed.data);
  if (!issue) return NextResponse.json({ error: "issue not found" }, { status: 404 });
  return NextResponse.json({ issue });
}
