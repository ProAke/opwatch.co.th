import type { Project, Run, Snapshot } from "@/lib/types";

export interface ProjectStats {
  project: Project;
  runs: Run[];
  passRate: number;
  openIssues: number;
  lastRunAt: string | null;
  flows: number;
  agents: number;
  trend: number[];
}

export interface DashboardStats {
  totalProjects: number;
  totalFlows: number;
  totalRuns: number;
  runs7d: number;
  passRate7d: number;
  passRatePrev7d: number;
  openIssues: number;
  criticalIssues: number;
  agentsActive: number;
  liveRuns: number;
  avgDuration: number;
  trend: { day: string; label: string; runs: number; passed: number; passRate: number }[];
  severity: { key: string; label: string; count: number; color: string }[];
  projectStats: ProjectStats[];
  upcoming: Snapshot["schedules"];
  recentIssues: Snapshot["issues"];
  topFlows: { id: string; name: string; module: string; rate: number; runs: number; projectId: string }[];
}

const DAY = 86_400_000;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function dashboardStats(s: Snapshot): DashboardStats {
  const now = Date.now();
  const runs7 = s.runs.filter((r) => r.createdAt && now - new Date(r.createdAt).getTime() <= 7 * DAY);
  const runsPrev = s.runs.filter((r) => {
    const t = new Date(r.createdAt).getTime();
    return t <= now - 7 * DAY && t > now - 14 * DAY;
  });
  const finished = runs7.filter((r) => r.status === "passed" || r.status === "failed");
  const prevFinished = runsPrev.filter((r) => r.status === "passed" || r.status === "failed");
  const rate = (arr: Run[]) =>
    arr.length ? Math.round((arr.filter((r) => r.status === "passed").length / arr.length) * 100) : 0;

  const trend: DashboardStats["trend"] = [];
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const dayRuns = s.runs.filter((r) => r.createdAt?.slice(0, 10) === key);
    const done = dayRuns.filter((r) => r.status === "passed" || r.status === "failed");
    trend.push({
      day: key,
      label: d.toLocaleDateString("th-TH", { day: "numeric", month: "short" }),
      runs: dayRuns.length,
      passed: dayRuns.filter((r) => r.status === "passed").length,
      passRate: rate(done),
    });
  }

  const open = s.issues.filter((i) => !["closed", "wontfix"].includes(i.status));
  const severity = (["S1", "S2", "S3", "S4"] as const).map((k, idx) => ({
    key: k,
    label: k,
    count: open.filter((i) => i.severity === k).length,
    color: ["#f43f5e", "#fb923c", "#facc15", "#38bdf8"][idx],
  }));

  const projectStats: ProjectStats[] = s.projects.map((p) => {
    const runs = s.runs.filter((r) => r.projectId === p.id);
    const done = runs.filter((r) => r.status === "passed" || r.status === "failed");
    const trendArr = trend.map((t) => {
      const dayRuns = runs.filter((r) => r.createdAt?.slice(0, 10) === t.day && ["passed", "failed"].includes(r.status));
      return dayRuns.length ? rate(dayRuns) : 0;
    });
    return {
      project: p,
      runs,
      passRate: rate(done),
      openIssues: open.filter((i) => i.projectId === p.id).length,
      lastRunAt: runs[0]?.createdAt ?? null,
      flows: s.flows.filter((f) => f.projectId === p.id).length,
      agents: s.agents.filter((a) => a.projectId === p.id).length,
      trend: trendArr,
    };
  });

  const topFlows = s.flows
    .map((f) => {
      const runs = s.runs.filter((r) => r.flowId === f.id && ["passed", "failed"].includes(r.status));
      return { id: f.id, name: f.name, module: f.module, rate: f.lastPassRate ?? rate(runs), runs: runs.length, projectId: f.projectId };
    })
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 6);

  const durations = s.runs.filter((r) => r.durationMs > 0).map((r) => r.durationMs);

  return {
    totalProjects: s.projects.filter((p) => p.status === "active").length,
    totalFlows: s.flows.length,
    totalRuns: s.runs.length,
    runs7d: runs7.length,
    passRate7d: rate(finished),
    passRatePrev7d: rate(prevFinished),
    openIssues: open.length,
    criticalIssues: open.filter((i) => i.severity === "S1").length,
    agentsActive: s.agents.filter((a) => a.status === "active").length,
    liveRuns: s.runs.filter((r) => r.status === "running").length,
    avgDuration: durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
    trend,
    severity,
    projectStats,
    upcoming: [...s.schedules]
      .filter((x) => x.status === "active" && x.nextRunAt)
      .sort((a, b) => (a.nextRunAt! < b.nextRunAt! ? -1 : 1))
      .slice(0, 5),
    recentIssues: [...open].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5),
    topFlows,
  };
}

export function relTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const abs = Math.abs(diff);
  const future = diff < 0;
  const units: [number, string][] = [
    [60_000, "วินาที"],
    [3_600_000, "นาที"],
    [86_400_000, "ชั่วโมง"],
    [30 * 86_400_000, "วัน"],
  ];
  if (abs < 45_000) return future ? "อีกไม่กี่วินาที" : "เมื่อสักครู่";
  if (abs < 3_600_000) {
    const v = Math.round(abs / 60_000);
    return future ? `อีก ${v} นาที` : `${v} นาทีที่แล้ว`;
  }
  if (abs < 86_400_000) {
    const v = Math.round(abs / 3_600_000);
    return future ? `อีก ${v} ชั่วโมง` : `${v} ชั่วโมงที่แล้ว`;
  }
  const v = Math.round(abs / 86_400_000);
  void units;
  return future ? `อีก ${v} วัน` : `${v} วันที่แล้ว`;
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  });
}

export function fmtDuration(ms: number): string {
  if (!ms) return "—";
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
}

export function countdown(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "ถึงกำหนดแล้ว";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.round((diff % 3_600_000) / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)} วัน ${h % 24} ชม.`;
  if (h > 0) return `${h} ชม. ${m} น.`;
  return `${m} นาที`;
}
