import { NextResponse } from "next/server";
import { z } from "zod";
import { loadSnapshot, saveDoc } from "@/lib/store";
import { generateDoc } from "@/lib/docgen";

export const dynamic = "force-dynamic";

const Input = z.object({
  projectId: z.string().min(1),
  kind: z.enum(["user_guide", "reference", "api", "mcp", "video_script", "release_note"]),
  detail: z.enum(["overview", "deep"]).optional(),
  language: z.enum(["th", "en", "both"]).default("th"),
});

export async function POST(req: Request) {
  const parsed = Input.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง", detail: parsed.error.flatten() }, { status: 400 });
  const { projectId, kind, detail, language } = parsed.data;
  const s = await loadSnapshot();
  const project = s.projects.find((p) => p.id === projectId);
  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });
  const flows = s.flows.filter((f) => f.projectId === projectId);
  const runs = s.runs.filter((r) => r.projectId === projectId).slice(0, 20);
  const generated = generateDoc({ kind, project, flows, runs, snapshot: s, detail });
  const doc = await saveDoc({
    projectId,
    kind,
    title: generated.title,
    status: "ready",
    language,
    words: generated.words,
    content: generated.content,
  });
  return NextResponse.json({ doc }, { status: 201 });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const { deleteDoc } = await import("@/lib/store");
  await deleteDoc(id);
  return NextResponse.json({ ok: true });
}
