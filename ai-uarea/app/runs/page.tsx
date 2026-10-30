import Link from "next/link";
import { Activity, ArrowRight, Filter, Gauge, Radio, Timer, XCircle } from "lucide-react";
import { advanceRun, loadSnapshot } from "@/lib/store";
import { fmtDateTime, fmtDuration, relTime } from "@/lib/metrics";
import { Card, EmptyState, Metric, Progress, SectionTitle, StatusPill } from "@/components/ui";
import QuickRun from "@/components/QuickRun";

export const dynamic = "force-dynamic";

const STATUSES = ["all", "running", "passed", "failed"] as const;

export default async function RunsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  // Keep any in-flight run moving when the list is opened.
  const snap = await loadSnapshot();
  const liveIds = snap.runs.filter((r) => r.status === "running").map((r) => r.id);
  if (liveIds.length) await Promise.all(liveIds.map((id) => advanceRun(id)));

  const s = await loadSnapshot();
  const projectFilter = sp.project ?? "all";
  const statusFilter = sp.status ?? "all";
  const q = (sp.q ?? "").toLowerCase();

  const runs = s.runs
    .filter((r) => (projectFilter === "all" ? true : r.projectId === projectFilter))
    .filter((r) => (statusFilter === "all" ? true : r.status === statusFilter))
    .filter((r) => {
      if (!q) return true;
      const flow = s.flows.find((f) => f.id === r.flowId);
      return `${flow?.name} ${r.id} ${r.verdict}`.toLowerCase().includes(q);
    });

  const done = runs.filter((r) => ["passed", "failed"].includes(r.status));
  const rate = done.length ? Math.round((done.filter((r) => r.status === "passed").length / done.length) * 100) : 0;
  const avg = done.length ? Math.round(done.reduce((a, b) => a + b.durationMs, 0) / done.length) : 0;

  const href = (patch: Record<string, string>) => {
    const u = new URLSearchParams();
    const merged = { project: projectFilter, status: statusFilter, q: sp.q ?? "", ...patch };
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== "all") u.set(k, v);
    });
    const qs = u.toString();
    return `/runs${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label mb-1">Test runs</div>
          <h1 className="text-[22px] font-semibold tracking-tight">ผลการทดสอบทั้งหมด</h1>
          <p className="mt-1 text-[12.5px] text-txt-mute">
            ทุก run ถูกเก็บหลักฐานและ AI วิเคราะห์ — เรียกดูรายละเอียดแบบเรียลไทม์ได้
          </p>
        </div>
        <QuickRun
          flows={s.flows.map((f) => ({ id: f.id, name: f.name, projectId: f.projectId }))}
          label="เริ่มรันใหม่"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Run ทั้งหมด" value={runs.length} accent="#22d3ee" icon={<Activity size={15} />} hint={`${s.runs.length} run ในระบบ`} />
        <Metric label="อัตราผ่าน" value={`${rate}%`} accent="#34d399" icon={<Gauge size={15} />} hint="เฉพาะรอบที่ปิดผล" />
        <Metric
          label="ไม่ผ่าน"
          value={runs.filter((r) => r.status === "failed").length}
          accent="#fb7185"
          icon={<XCircle size={15} />}
          hint="ต้องเปิด Issue / ตรวจซ้ำ"
        />
        <Metric label="ระยะเวลาเฉลี่ย" value={fmtDuration(avg)} accent="#a78bfa" icon={<Timer size={15} />} hint={`กำลังรัน ${s.runs.filter((r) => r.status === "running").length} รอบ`} />
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-txt-mute">
            <Filter size={12} /> ตัวกรอง
          </span>
          <div className="flex items-center gap-1 rounded-lg border border-line bg-[#0a1220] p-0.5">
            {STATUSES.map((st) => (
              <Link
                key={st}
                href={href({ status: st })}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                  statusFilter === st ? "bg-[rgba(34,211,238,0.14)] text-cyan-glow" : "text-txt-mute hover:text-txt"
                }`}
              >
                {st === "all" ? "ทั้งหมด" : st === "running" ? "กำลังรัน" : st === "passed" ? "ผ่าน" : "ไม่ผ่าน"}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <Link
              href={href({ project: "all" })}
              className={`chip ${projectFilter === "all" ? "border-[rgba(34,211,238,0.4)] text-cyan-glow" : ""}`}
            >
              ทุกโปรเจกต์
            </Link>
            {s.projects.map((p) => (
              <Link
                key={p.id}
                href={href({ project: p.id })}
                className={`chip ${projectFilter === p.id ? "border-[rgba(34,211,238,0.4)] text-cyan-glow" : ""}`}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} /> {p.key}
              </Link>
            ))}
          </div>
          <form action="/runs" className="ml-auto flex items-center gap-2">
            {projectFilter !== "all" && <input type="hidden" name="project" value={projectFilter} />}
            {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}
            <input name="q" defaultValue={sp.q ?? ""} placeholder="ค้นหา flow / run id…" className="input w-[190px] text-[11.5px]" />
            <button className="btn btn-sm">ค้นหา</button>
          </form>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4">
          <SectionTitle title={`รายการ run (${runs.length})`} subtitle="เรียงจากใหม่ไปเก่า" icon={<Radio size={15} />} />
        </div>
        {runs.length === 0 ? (
          <div className="p-4">
            <EmptyState title="ไม่พบ run ตามตัวกรอง" hint="ลองล้างตัวกรองหรือเริ่มรัน flow ใหม่" />
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr>
                  <th className="table-th">Flow</th>
                  <th className="table-th">โปรเจกต์</th>
                  <th className="table-th">ผล</th>
                  <th className="table-th">ขั้นตอน</th>
                  <th className="table-th">Agent / โมเดล</th>
                  <th className="table-th">Trigger</th>
                  <th className="table-th">ระยะเวลา</th>
                  <th className="table-th">เริ่ม</th>
                  <th className="table-th" />
                </tr>
              </thead>
              <tbody>
                {runs.slice(0, 60).map((r) => {
                  const flow = s.flows.find((f) => f.id === r.flowId);
                  const project = s.projects.find((p) => p.id === r.projectId);
                  const agent = s.agents.find((a) => a.id === r.agentId);
                  const model = s.models.find((m) => m.id === r.modelId);
                  return (
                    <tr key={r.id} className="transition hover:bg-[#0c1626]/70">
                      <td className="table-td">
                        <div className="font-medium text-txt">{flow?.name ?? r.flowId}</div>
                        <div className="font-mono text-[10px] text-txt-mute">{r.id}</div>
                      </td>
                      <td className="table-td">
                        <span className="chip">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: project?.color }} />
                          {project?.key}
                        </span>
                      </td>
                      <td className="table-td">
                        <StatusPill status={r.status} />
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <span className="kpi-value text-[11px]">
                            {r.passed}/{r.total}
                          </span>
                          <div className="w-14">
                            <Progress
                              value={(r.passed / Math.max(r.total, 1)) * 100}
                              color={r.failed ? "#fb7185" : r.status === "running" ? "#22d3ee" : "#34d399"}
                              height={4}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="text-[11.5px]">
                          {agent?.avatar} {agent?.name.split(" ")[0]}
                        </div>
                        <div className="font-mono text-[10px] text-txt-mute">{model?.name}</div>
                      </td>
                      <td className="table-td">
                        <span className="chip font-mono">{r.trigger}</span>
                      </td>
                      <td className="table-td font-mono text-[11px] text-txt-dim">{fmtDuration(r.durationMs)}</td>
                      <td className="table-td">
                        <div className="text-[11px] text-txt-dim">{relTime(r.createdAt)}</div>
                        <div className="font-mono text-[9.5px] text-txt-mute">{fmtDateTime(r.createdAt)}</div>
                      </td>
                      <td className="table-td text-right">
                        <Link href={`/runs/${r.id}`} className="btn btn-sm">
                          ดู <ArrowRight size={11} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
