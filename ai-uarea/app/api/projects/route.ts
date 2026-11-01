import { NextResponse } from "next/server";
import { z } from "zod";
import { saveProject } from "@/lib/store";

export const dynamic = "force-dynamic";

const ProjectInput = z.object({
  id: z.string().optional(),
  key: z.string().optional(),
  name: z.string().min(2),
  description: z.string().optional(),
  baseUrl: z.string().optional(),
  repoUrl: z.string().optional(),
  driveFolder: z.string().optional(),
  env: z.enum(["production", "staging", "demo", "local"]).optional(),
  color: z.string().optional(),
  status: z.enum(["active", "paused", "archived"]).optional(),
  menus: z.number().optional(),
  owner: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = ProjectInput.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "ข้อมูลโปรเจกต์ไม่ถูกต้อง", detail: parsed.error.flatten() }, { status: 400 });
  const project = await saveProject(parsed.data);
  return NextResponse.json({ project }, { status: 201 });
}
