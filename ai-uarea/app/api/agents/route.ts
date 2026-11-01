import { NextResponse } from "next/server";
import { z } from "zod";
import { loadSnapshot, saveAgent, updateAgent } from "@/lib/store";

export const dynamic = "force-dynamic";

const AgentInput = z.object({
  id: z.string().optional(),
  projectId: z.string().nullable().optional(),
  name: z.string().min(2),
  role: z.enum([
    "orchestrator",
    "test_designer",
    "web_executor",
    "api_validator",
    "db_validator",
    "report_validator",
    "issue_writer",
    "fixer",
    "doc_writer",
    "video_writer",
  ]),
  modelId: z.string().optional(),
  avatar: z.string().optional(),
  systemPrompt: z.string().optional(),
  tools: z.array(z.string()).optional(),
  autonomy: z.enum(["advise", "semi", "zero_touch"]).optional(),
  status: z.enum(["active", "paused"]).optional(),
});

export async function GET() {
  const s = await loadSnapshot();
  return NextResponse.json({ agents: s.agents, models: s.models });
}

export async function POST(req: Request) {
  const parsed = AgentInput.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "ข้อมูล agent ไม่ถูกต้อง", detail: parsed.error.flatten() }, { status: 400 });
  const agent = await saveAgent(parsed.data);
  return NextResponse.json({ agent }, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  if (!body?.id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const { id, ...patch } = body;
  await updateAgent(id, patch);
  const s = await loadSnapshot();
  return NextResponse.json({ agent: s.agents.find((a) => a.id === id) });
}
