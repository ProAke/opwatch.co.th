import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteSchedule, loadSnapshot, saveSchedule } from "@/lib/store";

export const dynamic = "force-dynamic";

const ScheduleInput = z.object({
  id: z.string().optional(),
  projectId: z.string().min(1),
  flowId: z.string().min(1),
  name: z.string().min(2),
  cadence: z.enum(["manual", "hourly", "daily", "weekdays", "weekly", "monthly"]).default("daily"),
  timeOfDay: z.string().regex(/^\d{2}:\d{2}$/).default("09:00"),
  timezone: z.string().default("Asia/Bangkok"),
  agentId: z.string().optional(),
  env: z.string().optional(),
  status: z.enum(["active", "paused"]).default("active"),
  notify: z.array(z.string()).default(["mng"]),
});

export async function GET() {
  const s = await loadSnapshot();
  return NextResponse.json({
    schedules: s.schedules.map((sc) => ({
      ...sc,
      projectName: s.projects.find((p) => p.id === sc.projectId)?.name ?? "",
      flowName: s.flows.find((f) => f.id === sc.flowId)?.name ?? "",
      agentName: s.agents.find((a) => a.id === sc.agentId)?.name ?? "",
    })),
  });
}

export async function POST(req: Request) {
  const parsed = ScheduleInput.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "ข้อมูลตารางไม่ถูกต้อง", detail: parsed.error.flatten() }, { status: 400 });
  const schedule = await saveSchedule(parsed.data);
  return NextResponse.json({ schedule }, { status: 201 });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await deleteSchedule(id);
  return NextResponse.json({ ok: true });
}
