import { NextResponse } from "next/server";
import { z } from "zod";
import { importBundle, type ProjectBundle } from "@/lib/project-bundle";
import { addEvent } from "@/lib/store";

export const dynamic = "force-dynamic";

const Input = z.object({
  bundle: z.any(),
  name: z.string().optional(),
  key: z.string().optional(),
  env: z.enum(["production", "staging", "demo", "local"]).optional(),
  include: z
    .object({
      agents: z.boolean().optional(),
      flows: z.boolean().optional(),
      schedules: z.boolean().optional(),
      docs: z.boolean().optional(),
      issues: z.boolean().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  try {
    const parsed = Input.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "ต้องส่ง bundle ของโปรเจกต์" }, { status: 400 });
    const { bundle, name, key, env, include } = parsed.data;

    if (!bundle?.project?.name) {
      return NextResponse.json({ error: "bundle ไม่ถูกต้อง — ต้องมี project.name (ใช้ไฟล์จาก /api/projects/:id/export)" }, { status: 400 });
    }

    const result = await importBundle(bundle as ProjectBundle, { name, key, env, include });
    await addEvent({
      actor: "usr_human",
      kind: "project.imported",
      level: "success",
      message: `นำเข้าโปรเจกต์ “${result.project.name}” · flow ${result.imported.flows} · agent ${result.imported.agents} · ตาราง ${result.imported.schedules}`,
      projectId: result.project.id,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
