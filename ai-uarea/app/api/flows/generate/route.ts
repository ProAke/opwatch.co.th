import { NextResponse } from "next/server";
import { z } from "zod";
import { loadSnapshot } from "@/lib/store";
import { designFlow } from "@/lib/designer";

export const dynamic = "force-dynamic";

const Input = z.object({
  // projectId is optional for "preview before the project exists" (onboarding).
  projectId: z.string().optional(),
  projectName: z.string().optional(),
  projectKey: z.string().optional(),
  projectBaseUrl: z.string().optional(),
  spec: z.string().min(5),
  module: z.string().optional(),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = Input.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "ต้องมี projectId และ SPEC" }, { status: 400 });
  const { projectId, spec, module, name } = parsed.data;
  const s = await loadSnapshot();
  const project = projectId ? s.projects.find((p) => p.id === projectId) : undefined;
  if (projectId && !project) return NextResponse.json({ error: "project not found" }, { status: 404 });
  if (!project && !parsed.data.projectName) {
    return NextResponse.json({ error: "ต้องระบุ projectId หรือ projectName" }, { status: 400 });
  }

  const result = await designFlow({
    projectId: project?.id ?? "preview",
    projectName: project?.name ?? parsed.data.projectName!,
    projectKey: project?.key ?? parsed.data.projectKey ?? "NEW",
    baseUrl: project?.baseUrl ?? parsed.data.projectBaseUrl,
    spec,
    module,
    name,
  });

  return NextResponse.json({
    name: result.name,
    module: result.module,
    steps: result.steps,
    note: result.note,
    engine: result.engine,
  });
}
