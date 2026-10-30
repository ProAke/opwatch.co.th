import { NextResponse } from "next/server";
import { loadSnapshot } from "@/lib/store";
import { exportProject } from "@/lib/project-bundle";

export const dynamic = "force-dynamic";

// GET /api/projects/:id/export → portable JSON bundle (ไฟล์ .json ดาวน์โหลดได้)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await loadSnapshot();
  const project = s.projects.find((p) => p.id === id);
  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });

  const bundle = exportProject(s, id);
  const download = new URL(req.url).searchParams.get("download") === "1";
  const filename = `${project.key.toLowerCase()}-project-bundle.json`;

  return new NextResponse(JSON.stringify(bundle, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(download ? { "content-disposition": `attachment; filename="${filename}"` } : {}),
    },
  });
}
