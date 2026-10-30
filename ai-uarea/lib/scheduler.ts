import { addEvent, computeNextRun, createRun, loadSnapshot, saveSchedule } from "@/lib/store";

// ─────────────────────────────────────────────────────────────────────────────
// Zero-touch scheduler — fires every schedule whose nextRunAt is due.
// Called by /api/cron (external cron / mng.uarea.in) and by instrumentation.ts
// (built-in 60s tick) so the platform runs by itself.
// ─────────────────────────────────────────────────────────────────────────────

export interface ScheduleTickResult {
  fired: { scheduleId: string; name: string; runId: string }[];
  skipped: number;
  checkedAt: string;
}

export async function runDueSchedules(): Promise<ScheduleTickResult> {
  const s = await loadSnapshot();
  const now = Date.now();
  const due = s.schedules.filter(
    (sc) => sc.status === "active" && sc.cadence !== "manual" && sc.nextRunAt && new Date(sc.nextRunAt).getTime() <= now,
  );

  const fired: ScheduleTickResult["fired"] = [];
  for (const sc of due) {
    const run = await createRun({
      flowId: sc.flowId,
      projectId: sc.projectId,
      agentId: sc.agentId,
      trigger: "schedule",
      env: sc.env,
    });
    if (!run) continue;
    fired.push({ scheduleId: sc.id, name: sc.name, runId: run.id });
    await saveSchedule({
      ...sc,
      nextRunAt: computeNextRun(sc.cadence, sc.timeOfDay),
      lastRunAt: new Date().toISOString(),
      lastStatus: "running",
    });
    await addEvent({
      actor: "agt_orch",
      kind: "schedule.fired",
      level: "success",
      message: `ถึงกำหนด “${sc.name}” — เริ่มรันอัตโนมัติ (${sc.cadence} ${sc.timeOfDay})`,
      projectId: sc.projectId,
      runId: run.id,
    });
  }

  return {
    fired,
    skipped: s.schedules.filter((sc) => sc.status === "active").length - due.length,
    checkedAt: new Date().toISOString(),
  };
}
