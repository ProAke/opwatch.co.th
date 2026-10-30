import Link from "next/link";
import { notFound } from "next/navigation";
import { Bot, ChevronLeft, ExternalLink, FileText, FolderGit2, HardDrive, Play, Ticket, Workflow } from "lucide-react";
import { loadSnapshot } from "@/lib/store";
import { fmtDateTime, fmtDuration, relTime } from "@/lib/metrics";
import { Card, EmptyState, KV, Metric, Progress, SectionTitle, SeverityTag, StatusPill } from "@/components/ui";
import QuickRun from "@/components/QuickRun";
import ExportProjectButton from "@/components/ExportProjectButton";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await loadSnapshot();
  const project = s.projects.find((p) => p.id === id);
  if (!project) notFound();

  const flows = s.flows.filter((f) => f.projectId === project.id);
  const runs = s.runs.filter((r) => r.projectId === project.id);
  const done = runs.filter((r) => ["passed", "failed"].includes(r.status));
  const rate = done.length ? Math.round((done.filter((r) => r.status === "passed").length / done.length) * 100) : 0;
  const issues = s.issues.filter((i) => i.projectId === project.id);
  const agents = s.agents.filter((a) => a.projectId === project.id);
  const docs = s.docs.filter((d) => d.projectId === project.id);
  const schedules = s.schedules.filter((x) => x.projectId === project.id);

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-2 text-[11.5px] text-txt-mute">
        <Link href="/projects" className="inline-flex items-center gap-1 hover:text-cyan-glow">
          <ChevronLeft size={13} /> โปรเจกต์
        </Link>
        <span>/</span>
        <span className="text-txt-dim">{project.key}</span>
      </nav>

      <Card className="relative overflow-hidden p-5">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-2xl" style={{ background: `radial-gradient(circle,${project.color}26,transparent 65%)` }} />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span
                className="grid h-9 w-9 place-items-center rounded-xl text-[12px] font-bold"
                style={{ background: `${project.color}1f`, color: project.color, border: `1px solid ${project.color}44` }}
              >
                {project.key.slice(0, 2)}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[20px] font-semibold tracking-tight">{project.name}</h1>
                  <StatusPill status={project.status} dot={false} />
                </div>
                <div className="font-mono text-[10.5px] text-txt-mute">
                  {project.key} · {project.env} · {project.menus.toLocaleString()} เมนู · เจ้าของ {project.owner}
                </div>
              </div>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-txt-dim">{project.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10.5px]">
              <a href={project.baseUrl} target="_blank" rel="noreferrer" className="chip hover:text-cyan-glow">
                <ExternalLink size={10} /> {project.baseUrl.replace(/^https?:\/\//, "")}
              </a>
              <a href={project.repoUrl} target="_blank" rel="noreferrer" className="chip hover:text-cyan-glow">
                <FolderGit2 size={10} /> repo
              </a>
              <span className="chip">
                <HardDrive size={10} /> {project.driveFolder || "—"}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <QuickRun flows={flows.map((f) => ({ id: f.id, name: f.name, projectId: f.projectId }))} label="รัน flow ของโปรเจกต์นี้" />
            <div className="flex items-center gap-2">
              <ExportProjectButton projectId={project.id} keyName={project.key} />
              <Link href="/projects/new" className="btn btn-sm">
                <Workflow size={12} /> สร้างโปรเจกต์ใหม่
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/flows/new" className="btn btn-sm">
                <Workflow size={12} /> สร้าง flow
              </Link>
              <Link href={`/issues?project=${project.id}`} className="btn btn-sm">
                <Ticket size={12} /> Ticket ({issues.filter((i) => !["closed", "wontfix"].includes(i.status)).length})
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Metric label="อัตราผ่าน" value={`${rate}%`} accent={rate >= 90 ? "#34d399" : rate >= 70 ? "#fbbf24" : "#fb7185"} icon={<Play size={15} />} hint={`${done.length} รอบที่ปิดผล`} />
        <Metric label="Flow" value={flows.length} accent="#22d3ee" icon={<Workflow size={15} />} hint={`${flows.reduce((n, f) => n + f.steps.length, 0)} ขั้นตอน`} />
        <Metric label="Run" value={runs.length} accent="#a78bfa" icon={<Play size={15} />} hint={`เฉลี่ย ${fmtDuration(Math.round(runs.reduce((n, r) => n + r.durationMs, 0) / Math.max(runs.length, 1)))}`} />
        <Metric label="Agent" value={agents.length} accent="#fbbf24" icon={<Bot size={15} />} hint={`${schedules.filter((x) => x.status === "active").length} ตารางที่เปิด`} />
        <Metric label="เอกสาร" value={docs.length} accent="#f472b6" icon={<FileText size={15} />} hint={`${docs.filter((d) => d.status === "ready").length} พร้อมส่งมอบ`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <Card className="p-4">
            <SectionTitle title="Flow ของโปรเจกต์" subtitle="เรียงตามที่ถูกใช้ล่าสุด" icon={<Workflow size={15} />} right={<Link href="/flows" className="btn btn-sm">ทั้งหมด</Link>} />
            <div className="mt-3 space-y-2">
              {flows.length === 0 && <EmptyState title="ยังไม่มี flow" hint="สร้าง flow แรกจาก SPEC" />}
              {flows.map((f) => {
                const fruns = runs.filter((r) => r.flowId === f.id);
                const frate = f.lastPassRate ?? 0;
                return (
                  <div key={f.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-[#0a1220]/60 p-2.5">
                    <div className="min-w-0 flex-1">
                      <Link href={`/flows/${f.id}`} className="text-[12px] font-medium hover:text-cyan-glow">
                        {f.name}
                      </Link>
                      <div className="font-mono text-[9.5px] text-txt-mute">
                        {f.module} · v{f.version} · {f.steps.length} ขั้น · {fruns.length} runs · อัปเดต {relTime(f.updatedAt)}
                      </div>
                    </div>
                    <div className="flex w-24 items-center gap-2">
                      <Progress value={frate} color={frate >= 90 ? "#34d399" : frate >= 70 ? "#fbbf24" : "#fb7185"} height={4} />
                      <span className="kpi-value text-[10px] text-txt-dim">{frate}%</span>
                    </div>
                    <StatusPill status={f.status} dot={false} />
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="px-4 pt-4">
              <SectionTitle title="Run ล่าสุด" subtitle="10 รอบของโปรเจกต์นี้" icon={<Play size={15} />} right={<Link href={`/runs?project=${project.id}`} className="btn btn-sm">ทั้งหมด</Link>} />
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr>
                    <th className="table-th">Flow</th>
                    <th className="table-th">ผล</th>
                    <th className="table-th">ขั้น</th>
                    <th className="table-th">ระยะเวลา</th>
                    <th className="table-th">เมื่อ</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.slice(0, 10).map((r) => (
                    <tr key={r.id} className="hover:bg-[#0c1626]/70">
                      <td className="table-td">
                        <Link href={`/runs/${r.id}`} className="text-[11.5px] hover:text-cyan-glow">
                          {flows.find((f) => f.id === r.flowId)?.name ?? r.flowId}
                        </Link>
                        <div className="font-mono text-[9px] text-txt-mute">{r.trigger}</div>
                      </td>
                      <td className="table-td">
                        <StatusPill status={r.status} dot={false} />
                      </td>
                      <td className="table-td kpi-value text-[11px]">
                        {r.passed}/{r.total}
                      </td>
                      <td className="table-td font-mono text-[10.5px] text-txt-dim">{fmtDuration(r.durationMs)}</td>
                      <td className="table-td text-[10.5px] text-txt-mute">{relTime(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <SectionTitle title="สรุปโปรเจกต์" />
            <div className="mt-2">
              <KV k="เริ่มใช้งาน" v={fmtDateTime(project.createdAt)} />
              <KV k="Environment" v={project.env} />
              <KV k="เมนูทั้งหมด" v={`${project.menus.toLocaleString()} เมนู`} />
              <KV k="ตารางที่เปิด" v={`${schedules.filter((x) => x.status === "active").length} ตาราง`} />
              <KV k="Run ล่าสุด" v={runs[0] ? relTime(runs[0].createdAt) : "—"} />
              <KV k="หลักฐาน" v={`${runs.reduce((n, r) => n + r.evidenceCount, 0)} ไฟล์`} />
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle title="Ticket ค้าง" right={<Link href={`/issues?project=${project.id}`} className="text-[11px] font-semibold text-cyan-glow hover:underline">ทั้งหมด</Link>} />
            <div className="mt-2 space-y-1.5">
              {issues.filter((i) => !["closed", "wontfix"].includes(i.status)).length === 0 && (
                <div className="text-[11.5px] text-mint">ไม่มี Ticket ค้าง 🎉</div>
              )}
              {issues
                .filter((i) => !["closed", "wontfix"].includes(i.status))
                .slice(0, 5)
                .map((i) => (
                  <Link key={i.id} href={`/issues/${i.id}`} className="flex items-start gap-2 rounded-lg border border-line bg-[#0a1220]/60 p-2 hover:border-[#2b405f]">
                    <SeverityTag severity={i.severity} />
                    <div className="min-w-0">
                      <div className="line-clamp-2 text-[11px] leading-snug text-txt-dim">{i.title}</div>
                      <div className="font-mono text-[9px] text-txt-mute">{i.key}</div>
                    </div>
                  </Link>
                ))}
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle title="Agent ของโปรเจกต์" right={<Link href="/agents" className="text-[11px] font-semibold text-cyan-glow hover:underline">จัดการ</Link>} />
            <div className="mt-2 space-y-1.5">
              {agents.map((a) => (
                <div key={a.id} className="flex items-center gap-2 rounded-lg border border-line bg-[#0a1220]/60 p-2">
                  <span className="text-[14px]">{a.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-medium">{a.name}</div>
                    <div className="text-[9.5px] text-txt-mute">
                      {s.models.find((x) => x.id === a.modelId)?.name}
                    </div>
                  </div>
                  <StatusPill status={a.status} dot={false} />
                </div>
              ))}
              {agents.length === 0 && <div className="text-[11.5px] text-txt-mute">ยังไม่มี agent เฉพาะโปรเจกต์</div>}
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle title="เอกสารที่ AI ผลิต" icon={<FileText size={15} />} right={<Link href="/docs" className="text-[11px] font-semibold text-cyan-glow hover:underline">ไปที่คลัง</Link>} />
            <div className="mt-2 space-y-1.5">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-2 rounded-lg border border-line bg-[#0a1220]/60 px-2 py-1.5">
                  <span className="truncate text-[11px] text-txt-dim">{d.title}</span>
                  <StatusPill status={d.status} dot={false} />
                </div>
              ))}
              {docs.length === 0 && <div className="text-[11.5px] text-txt-mute">ยังไม่มีเอกสาร</div>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
