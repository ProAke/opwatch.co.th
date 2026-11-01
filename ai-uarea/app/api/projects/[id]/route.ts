import { NextResponse } from "next/server";
import { z } from "zod";
import { addEvent, loadSnapshot, saveProject } from "@/lib/store";

export const dynamic = "force-dynamic";

const Patch = z.object({
  repoUrl: z.string().optional(),
  baseUrl: z.string().optional(),
  driveFolder: z.string().optional(),
  env: z.enum(["production", "staging", "demo", "local"]).optional(),
  owner: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["active", "paused", "archived"]).optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await loadSnapshot();
  const project = s.projects.find((p) => p.id === id);
  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = Patch.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง", detail: parsed.error.flatten() }, { status: 400 });
  const s = await loadSnapshot();
  const project = s.projects.find((p) => p.id === id);
  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });
  const next = await saveProject({ ...project, ...parsed.data });
  if (parsed.data.repoUrl !== undefined) {
    await addEvent({
      actor: "usr_human",
      kind: "project.repo.updated",
      level: "info",
      message: `เปลี่ยน repo ของ “${next.name}” เป็น ${parsed.data.repoUrl || "—"}`,
      projectId: next.id,
    });
  }
  return NextResponse.json({ project: next });
}
