import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Bot,
  CalendarClock,
  CircleAlert,
  Clock3,
  Cpu,
  FolderGit2,
  Gauge,
  PlayCircle,
  Radio,
  ShieldAlert,
  Sparkles,
  Timer,
  Workflow,
} from "lucide-react";
import { loadSnapshot } from "@/lib/store";
import { dashboardStats, fmtDateTime, fmtDuration, relTime, countdown } from "@/lib/metrics";
import { Bar, Card, EmptyState, Metric, Progress, Ring, SectionTitle, SeverityTag, Sparkline, StatusPill } from "@/components/ui";
import { TrendChart } from "@/components/charts";
import QuickRun from "@/components/QuickRun";
import { ROLE_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";

const SEV_COLOR: Record<string, string> = { S1: "#fb7185", S2: "#fb923c", S3: "#facc15", S4: "#38bdf8" };

export default async function DashboardPage() {
  const s = await loadSnapshot();
  const m = dashboardStats(s);
  const liveRuns = s.runs.filter((r) => r.status === "running");
  const recentRuns = s.runs.slice(0, 6);
  const recentEvents = s.events.slice(0, 8);
  const delta = m.passRate7d - m.passRatePrev7d;

  return (
    <div className="space-y-5">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-[linear-gradient(120deg,rgba(13,22,38,0.95),rgba(8,14,26,0.88))] p-5 md:p-6">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.22),transparent_65%)] blur-2xl" />
        <div className="pointer-events-none absolute bottom-0 right-40 h-40 w-72 rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.16),transparent_70%)] blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[rgba(34,211,238,0.3)] bg-[rgba(34,211,238,0.08)] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-cyan-glow">
              <Sparkles size={11} /> Zero Touch Control Room
            </div>
            <h1 className="text-[23px] font-semibold leading-snug tracking-tight md:text-[26px]">
              ฝูง AI กำลังทดสอบระบบให้คุณ —{" "}
              <span className="bg-[linear-gradient(90deg,#22d3ee,#34d399,#a78bfa)] bg-clip-text text-transparent">
                ไม่ต้องกดเองแม้แต่ปุ่มเดียว
              </span>
            </h1>
            <p className="mt-2 text-[12.5px] leading-relaxed text-txt-dim">
              ออกแบบ Flow จาก SPEC → ให้ AI เล่นเหมือนผู้ใช้จริง (Playwright · Stagehand · Computer Use) → ตรวจ UI / API /
              ฐานข้อมูล / รายงาน → เปิด Issue → สั่ง Auto Fixer แก้ → ตรวจซ้ำวนจนผ่าน แล้วส่งรายงานเข้า{" "}
              <span className="font-mono text-mint">mng.uarea.in</span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="chip">
                <FolderGit2 size={11} /> {m.totalProjects} โปรเจกต์
              </span>
              <span className="chip">
                <Workflow size={11} /> {m.totalFlows} flow
              </span>
              <span className="chip">
                <Bot size={11} /> {m.agentsActive} agent ทำงานอยู่
              </span>
              <span className="chip">
                <Cpu size={11} /> {s.models.filter((x) => x.status === "active").length} โมเดลพร้อมใช้
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <QuickRun flows={s.flows.filter((f) => f.status !== "paused").map((f) => ({ id: f.id, name: f.name, projectId: f.projectId }))} />
            <div className="flex gap-2">
              <Link href="/flows/new" className="btn btn-sm">
                <Workflow size={13} /> สร้าง Flow
              </Link>
              <Link href="/schedule" className="btn btn-sm">
                <CalendarClock size={13} /> ตั้งเวลา
              </Link>
            </div>
            <div className="text-right text-[10.5px] text-txt-mute">
              รอบถัดไป:{" "}
              <span className="font-mono text-cyan-glow">
                {m.upcoming[0] ? `${m.upcoming[0].name} · ${countdown(m.upcoming[0].nextRunAt)}` : "ยังไม่มีตาราง"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live banner ──────────────────────────────────────── */}
      {liveRuns.length > 0 && (
        <Link
          href={`/runs/${liveRuns[0].id}`}
          className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-[rgba(34,211,238,0.28)] bg-[rgba(34,211,238,0.06)] px-4 py-2.5"
        >
          <span className="pulse-dot shrink-0 text-cyan-glow" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] font-semibold text-cyan-glow">
              LIVE · {liveRuns[0].verdict}
            </div>
            <div className="truncate text-[11px] text-txt-mute">
              {s.flows.find((f) => f.id === liveRuns[0].flowId)?.name} · {liveRuns[0].browser} · agent{" "}
              {s.agents.find((a) => a.id === liveRuns[0].agentId)?.name}
            </div>
          </div>
          <div className="hidden w-40 sm:block">
            <Progress value={(liveRuns[0].passed / Math.max(liveRuns[0].total, 1)) * 100} />
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-cyan-glow">
            ดูสด <ArrowUpRight size={12} className="transition group-hover:translate-x-0.5" />
          </span>
          <div className="pointer-events-none absolute bottom-0 left-0 h-[1px] w-1/3 scan-line" />
        </Link>
      )}

      {/* ── KPI ──────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Metric
          label="อัตราผ่าน 7 วัน"
          value={`${m.passRate7d}%`}
          delta={delta}
          accent="#34d399"
          icon={<Gauge size={16} />}
          hint={`${m.runs7d} runs · เทียบสัปดาห์ก่อน ${m.passRatePrev7d}%`}
        />
        <Metric
          label="Issue ค้าง"
          value={m.openIssues}
          accent="#fb7185"
          icon={<ShieldAlert size={16} />}
          hint={`S1 วิกฤต ${m.criticalIssues} รายการ`}
        />
        <Metric
          label="Run ทั้งหมด"
          value={m.totalRuns}
          accent="#22d3ee"
          icon={<Activity size={16} />}
          hint={`กำลังรัน ${m.liveRuns} · เฉลี่ย ${fmtDuration(m.avgDuration)}/run`}
        />
        <Metric
          label="AI Agent"
          value={m.agentsActive}
          accent="#a78bfa"
          icon={<Bot size={16} />}
          hint={`${s.models.filter((x) => x.status === "active").length} โมเดล · ${s.agents.filter((a) => a.autonomy === "zero_touch").length} zero-touch`}
        />
        <Metric
          label="Flow ที่ครอบคลุม"
          value={m.totalFlows}
          accent="#fbbf24"
          icon={<Workflow size={16} />}
          hint={`${s.flows.reduce((n, f) => n + f.steps.length, 0)} ขั้นตอนตรวจสอบ`}
        />
      </section>

      {/* ── Main grid ────────────────────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-[1.62fr_1fr]">
        <div className="space-y-4">
          <Card className="p-4">
            <SectionTitle
              title="ผลทดสอบ 14 วันย้อนหลัง"
              subtitle="แท่ง = จำนวน run (เขียว = ผ่าน), เส้น = อัตราผ่านสะสมรายวัน"
              icon={<Activity size={15} />}
              right={
                <div className="flex items-center gap-2">
                  <span className="chip">
                    <Timer size={11} /> เฉลี่ย {fmtDuration(m.avgDuration)}
                  </span>
                  <Link href="/runs" className="btn btn-sm">
                    ดูทั้งหมด
                  </Link>
                </div>
              }
            />
            <div className="mt-3">
              <TrendChart data={m.trend} />
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle
              title="โปรเจกต์ที่ฝูง AI ดูแลอยู่"
              subtitle="แต่ละโปรเจกต์มี agent เฉพาะทาง แยก env และหลักฐานของตัวเอง"
              icon={<FolderGit2 size={15} />}
              right={
                <Link href="/projects" className="btn btn-sm">
                  จัดการโปรเจกต์
                </Link>
              }
            />
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {m.projectStats.map((ps) => (
                <Link
                  key={ps.project.id}
                  href={`/projects/${ps.project.id}`}
                  className="group rounded-xl border border-line bg-[#0a1220]/70 p-3.5 transition hover:border-[#2b405f] hover:bg-[#0c1626]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="grid h-7 w-7 place-items-center rounded-lg text-[11px] font-bold"
                        style={{ background: `${ps.project.color}1f`, color: ps.project.color, border: `1px solid ${ps.project.color}44` }}
                      >
                        {ps.project.key.slice(0, 2)}
                      </span>
                      <div>
                        <div className="text-[12.5px] font-semibold leading-tight">{ps.project.name}</div>
                        <div className="font-mono text-[10px] text-txt-mute">
                          {ps.project.key} · {ps.project.env}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight size={13} className="text-txt-mute transition group-hover:text-cyan-glow" />
                  </div>

                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <div className="kpi-value text-[20px] font-semibold" style={{ color: ps.project.color }}>
                        {ps.passRate}%
                      </div>
                      <div className="text-[10px] text-txt-mute">
                        {ps.runs.filter((r) => ["passed", "failed"].includes(r.status)).length} runs · {ps.flows} flow
                      </div>
                    </div>
                    <Sparkline data={ps.trend} color={ps.project.color} width={90} height={30} />
                  </div>
                  <div className="mt-2">
                    <Progress value={ps.passRate} color={ps.project.color} height={4} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10.5px] text-txt-mute">
                    <span className="inline-flex items-center gap-1">
                      <Bot size={10} /> {ps.agents} agent
                    </span>
                    <span className={ps.openIssues ? "text-[#fdba74]" : "text-mint"}>
                      {ps.openIssues ? `${ps.openIssues} issue ค้าง` : "ไม่มี issue ค้าง"}
                    </span>
                    <span>{relTime(ps.lastRunAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4">
              <SectionTitle title="ผลการทดสอบล่าสุด" subtitle="ทุก run มีหลักฐานและ AI วิเคราะห์แนบ" icon={<PlayCircle size={15} />} />
              <Link href="/runs" className="btn btn-sm">
                ดูทั้งหมด
              </Link>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr>
                    <th className="table-th">Flow / โปรเจกต์</th>
                    <th className="table-th">Agent · โมเดล</th>
                    <th className="table-th">ผล</th>
                    <th className="table-th">ขั้นตอน</th>
                    <th className="table-th">ระยะเวลา</th>
                    <th className="table-th">เมื่อ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRuns.map((r) => {
                    const flow = s.flows.find((f) => f.id === r.flowId);
                    const project = s.projects.find((p) => p.id === r.projectId);
                    const agent = s.agents.find((a) => a.id === r.agentId);
                    const model = s.models.find((mo) => mo.id === r.modelId);
                    return (
                      <tr key={r.id} className="transition hover:bg-[#0c1626]/70">
                        <td className="table-td">
                          <Link href={`/runs/${r.id}`} className="group block">
                            <div className="font-medium text-txt group-hover:text-cyan-glow">{flow?.name ?? r.flowId}</div>
                            <div className="font-mono text-[10px] text-txt-mute">
                              {project?.key} · {r.trigger} · {r.browser}
                            </div>
                          </Link>
                        </td>
                        <td className="table-td">
                          <div className="flex items-center gap-1.5 text-[11.5px]">
                            <span>{agent?.avatar}</span>
                            <span className="text-txt-dim">{agent?.name.split(" ")[0]}</span>
                          </div>
                          <div className="font-mono text-[10px] text-txt-mute">{model?.name}</div>
                        </td>
                        <td className="table-td">
                          <StatusPill status={r.status} />
                        </td>
                        <td className="table-td">
                          <div className="flex items-center gap-2">
                            <span className="kpi-value text-[11px] text-txt-dim">
                              {r.passed}/{r.total}
                            </span>
                            <div className="w-16">
                              <Progress
                                value={(r.passed / Math.max(r.total, 1)) * 100}
                                color={r.status === "failed" ? "#fb7185" : r.status === "running" ? "#22d3ee" : "#34d399"}
                                height={4}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="table-td font-mono text-[11px] text-txt-dim">{fmtDuration(r.durationMs)}</td>
                        <td className="table-td text-[11px] text-txt-mute">{relTime(r.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ── Right rail ────────────────────────────────────── */}
        <div className="space-y-4">
          <Card className="p-4">
            <SectionTitle title="คุณภาพโดยรวม" subtitle="อัตราผ่านของทุกรอบที่ปิดผลแล้ว" icon={<Gauge size={15} />} />
            <div className="mt-3 flex items-center gap-4">
              <Ring value={m.passRate7d} sub="7 วัน" color={m.passRate7d >= 85 ? "#34d399" : m.passRate7d >= 70 ? "#fbbf24" : "#fb7185"} />
              <div className="flex-1 space-y-2">
                {m.severity.map((sv) => (
                  <div key={sv.key} className="flex items-center gap-2">
                    <SeverityTag severity={sv.key} />
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#131d30]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(sv.count / Math.max(m.openIssues, 1)) * 100}%`, background: SEV_COLOR[sv.key] }}
                      />
                    </div>
                    <span className="kpi-value w-4 text-right text-[10.5px] text-txt-dim">{sv.count}</span>
                  </div>
                ))}
                <div className="pt-1 text-[10.5px] text-txt-mute">
                  Issue ค้างทั้งหมด {m.openIssues} · ปิดแล้ว {s.issues.filter((i) => i.status === "closed").length}
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { k: "ตรวจขั้นตอน", v: s.flows.reduce((n, f) => n + f.steps.length, 0) },
                { k: "หลักฐาน", v: s.runs.reduce((n, r) => n + r.evidenceCount, 0) },
                { k: "Auto Fix", v: s.issues.filter((i) => i.fixBranch).length },
              ].map((x) => (
                <div key={x.k} className="rounded-lg border border-line bg-[#0a1220] px-2 py-1.5 text-center">
                  <div className="kpi-value text-[15px] font-semibold text-txt">{x.v}</div>
                  <div className="text-[9.5px] uppercase tracking-wider text-txt-mute">{x.k}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle
              title="ตารางทดสอบถัดไป"
              subtitle="Calendar • Asia/Bangkok"
              icon={<CalendarClock size={15} />}
              right={
                <Link href="/schedule" className="text-[11px] font-semibold text-cyan-glow hover:underline">
                  ทั้งหมด
                </Link>
              }
            />
            <div className="mt-3 space-y-2">
              {m.upcoming.length === 0 && <EmptyState title="ยังไม่มีตารางที่เปิดใช้งาน" />}
              {m.upcoming.map((sc) => {
                const project = s.projects.find((p) => p.id === sc.projectId);
                return (
                  <div key={sc.id} className="rounded-lg border border-line bg-[#0a1220]/70 p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-medium">{sc.name}</div>
                        <div className="font-mono text-[10px] text-txt-mute">
                          {sc.cadence} {sc.timeOfDay} · {project?.key}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-mono text-[11px] text-cyan-glow">{countdown(sc.nextRunAt)}</div>
                        {sc.lastStatus && (
                          <div className="mt-0.5 flex justify-end">
                            <StatusPill status={sc.lastStatus} dot={false} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-txt-mute">
                      <span>{fmtDateTime(sc.nextRunAt)}</span>
                      <span className="inline-flex items-center gap-1">
                        <Bot size={9} /> {s.agents.find((a) => a.id === sc.agentId)?.avatar}{" "}
                        {s.agents.find((a) => a.id === sc.agentId)?.name.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle
              title="ฟีดการทำงานของ AI"
              subtitle="ทุกการกระทำถูกบันทึกและส่งเข้า mng.uarea.in"
              icon={<Radio size={15} />}
            />
            <div className="mt-3 space-y-0">
              {recentEvents.map((ev, i) => {
                const color =
                  ev.level === "error" ? "#fb7185" : ev.level === "warn" ? "#fbbf24" : ev.level === "success" ? "#34d399" : "#7dd3fc";
                return (
                  <div key={ev.id} className="relative flex gap-2.5 pb-3">
                    {i < recentEvents.length - 1 && (
                      <span className="absolute left-[4.5px] top-3 h-full w-[1px] bg-line" />
                    )}
                    <span className="relative mt-[5px] h-[9px] w-[9px] shrink-0 rounded-full border-2" style={{ borderColor: color, background: "#070c17" }} />
                    <div className="min-w-0">
                      <div className="text-[11.5px] leading-snug text-txt-dim">{ev.message}</div>
                      <div className="mt-0.5 font-mono text-[9.5px] text-txt-mute">
                        {ev.actor} · {relTime(ev.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle title="Flow ที่ถูกใช้มากที่สุด" subtitle="เรียงตามจำนวนครั้งที่รัน" icon={<Workflow size={15} />} />
            <div className="mt-3 space-y-2.5">
              {m.topFlows.map((f) => {
                const project = s.projects.find((p) => p.id === f.projectId);
                return (
                  <div key={f.id}>
                    <div className="flex items-center justify-between gap-2 text-[11.5px]">
                      <Link href={`/flows/${f.id}`} className="truncate font-medium text-txt-dim hover:text-cyan-glow">
                        {f.name}
                      </Link>
                      <span className="kpi-value shrink-0 text-[11px]" style={{ color: f.rate >= 90 ? "#34d399" : f.rate >= 70 ? "#fbbf24" : "#fb7185" }}>
                        {f.rate}%
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Progress value={f.rate} color={f.rate >= 90 ? "#34d399" : f.rate >= 70 ? "#fbbf24" : "#fb7185"} height={4} />
                      <span className="shrink-0 font-mono text-[9.5px] text-txt-mute">
                        {project?.key} · {f.runs}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle title="ฝูง AI ที่ทำงานหนักสุด" subtitle="ตามจำนวน run ที่รับผิดชอบ" icon={<Bot size={15} />} right={<Link href="/agents" className="text-[11px] font-semibold text-cyan-glow hover:underline">ทั้งหมด</Link>} />
            <div className="mt-3 space-y-2">
              {[...s.agents]
                .sort((a, b) => b.runsTotal - a.runsTotal)
                .slice(0, 5)
                .map((a) => (
                  <div key={a.id} className="flex items-center gap-2.5 rounded-lg border border-line bg-[#0a1220]/60 p-2">
                    <span className="grid h-6 w-6 place-items-center rounded-md border border-line bg-[#0f1a2c] text-[12px]">{a.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[11.5px] font-medium">{a.name}</div>
                      <div className="text-[9.5px] text-txt-mute">{ROLE_LABEL[a.role]}</div>
                    </div>
                    <div className="text-right">
                      <div className="kpi-value text-[11px] text-txt">{a.runsTotal}</div>
                      <div className="text-[9px] text-mint">{a.passRate}%</div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle title="Issue ค้างที่ต้องจับตา" icon={<CircleAlert size={15} />} right={<Link href="/issues" className="text-[11px] font-semibold text-cyan-glow hover:underline">ทั้งหมด</Link>} />
            <div className="mt-3 space-y-2">
              {m.recentIssues.length === 0 && <EmptyState title="ไม่มี issue ค้าง" />}
              {m.recentIssues.map((i) => (
                <Link key={i.id} href={`/issues/${i.id}`} className="block rounded-lg border border-line bg-[#0a1220]/60 p-2.5 transition hover:border-[#2b405f]">
                  <div className="flex items-start gap-2">
                    <SeverityTag severity={i.severity} />
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-2 text-[11.5px] leading-snug text-txt-dim">{i.title}</div>
                      <div className="mt-1 flex items-center justify-between font-mono text-[9.5px] text-txt-mute">
                        <span>{i.key}</span>
                        <StatusPill status={i.status} dot={false} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-4">
        <SectionTitle
          title="สัดส่วนระดับความรุนแรง & ช่องทางที่พบ"
          subtitle="S1 ต้องแก้ทันที · S2 ก่อนปล่อยรอบถัดไป · S3–S4 เข้าคิวปกติ"
          icon={<ShieldAlert size={15} />}
        />
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          <Bar items={m.severity.map((sv) => ({ label: sv.key, value: sv.count, color: SEV_COLOR[sv.key] }))} />
          <Bar
            items={[
              { label: "UAT", value: s.issues.filter((i) => i.source === "uat").length, color: "#22d3ee" },
              { label: "MCP", value: s.issues.filter((i) => i.source === "mcp").length, color: "#a78bfa" },
              { label: "MAN", value: s.issues.filter((i) => i.source === "manual").length, color: "#34d399" },
              { label: "MON", value: s.issues.filter((i) => i.source === "monitor").length, color: "#fbbf24" },
            ]}
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="text-txt-mute">Cycle time เฉลี่ย (เปิด → ปิด)</span>
              <span className="font-mono text-txt-dim">1.8 วัน</span>
            </div>
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="text-txt-mute">Auto Fix ที่เปิด PR แล้ว</span>
              <span className="font-mono text-txt-dim">{s.issues.filter((i) => i.fixPrUrl).length} / {s.issues.filter((i) => i.fixBranch).length}</span>
            </div>
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="text-txt-mute">ตรวจซ้ำผ่านแล้ว</span>
              <span className="font-mono text-mint">{s.issues.filter((i) => i.recheckRunId).length} รายการ</span>
            </div>
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="text-txt-mute">หลักฐานที่จัดเก็บ</span>
              <span className="font-mono text-txt-dim">{s.runs.reduce((n, r) => n + r.evidenceCount, 0)} ไฟล์</span>
            </div>
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="text-txt-mute">SLA ส่งรายงานเข้า mng.uarea.in</span>
              <span className="font-mono text-mint">≤ 90 วินาที</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
