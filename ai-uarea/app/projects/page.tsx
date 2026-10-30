import Link from "next/link";
import { ArrowUpRight, Boxes, ExternalLink, FolderGit2, HardDrive, Layers, ShieldCheck } from "lucide-react";
import { loadSnapshot } from "@/lib/store";
import { dashboardStats, fmtDuration, relTime } from "@/lib/metrics";
import { Card, Metric, Progress, SectionTitle, Sparkline, StatusPill } from "@/components/ui";
import Link2 from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const s = await loadSnapshot();
  const m = dashboardStats(s);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label mb-1">Workspace</div>
          <h1 className="text-[22px] font-semibold tracking-tight">โปรเจกต์ที่ดูแล</h1>
          <p className="mt-1 max-w-3xl text-[12.5px] text-txt-mute">
            ฝูง AI หนึ่งชุดรองรับได้หลายโปรเจกต์ — แยก environment, หลักฐาน, repository และโฟลเดอร์ Drive ของแต่ละงาน
          </p>
        </div>
        <Link2 href="/projects/new" className="btn btn-primary btn-sm">
          <Plus size={13} /> เพิ่มโปรเจกต์
        </Link2>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="โปรเจกต์ที่ใช้งาน" value={m.totalProjects} accent="#22d3ee" icon={<Boxes size={15} />} hint={`${s.projects.length} โปรเจกต์ในระบบ`} />
        <Metric label="Flow รวม" value={m.totalFlows} accent="#a78bfa" icon={<Layers size={15} />} hint={`${s.flows.reduce((n, f) => n + f.steps.length, 0)} ขั้นตอน`} />
        <Metric label="Run สะสม" value={m.totalRuns} accent="#34d399" icon={<ShieldCheck size={15} />} hint={`เฉลี่ย ${fmtDuration(m.avgDuration)}/run`} />
        <Metric label="Issue ค้างทุกโปรเจกต์" value={m.openIssues} accent="#fb7185" icon={<FolderGit2 size={15} />} hint={`S1 ${m.criticalIssues} รายการ`} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {m.projectStats.map((ps) => (
          <Card key={ps.project.id} hover className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl text-[13px] font-bold"
                  style={{ background: `${ps.project.color}1f`, color: ps.project.color, border: `1px solid ${ps.project.color}44` }}
                >
                  {ps.project.key.slice(0, 2)}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/projects/${ps.project.id}`} className="text-[14px] font-semibold hover:text-cyan-glow">
                      {ps.project.name}
                    </Link>
                    <StatusPill status={ps.project.status} dot={false} />
                  </div>
                  <div className="font-mono text-[10px] text-txt-mute">
                    {ps.project.key} · {ps.project.env} · {ps.project.menus.toLocaleString()} เมนู
                  </div>
                </div>
              </div>
              <Link href={`/projects/${ps.project.id}`} className="btn btn-sm">
                เปิด <ArrowUpRight size={11} />
              </Link>
            </div>

            <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-txt-mute">{ps.project.description}</p>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {[
                { k: "ผ่าน", v: `${ps.passRate}%`, c: ps.passRate >= 90 ? "#34d399" : ps.passRate >= 70 ? "#fbbf24" : "#fb7185" },
                { k: "Flow", v: ps.flows, c: "#22d3ee" },
                { k: "Agent", v: ps.agents, c: "#a78bfa" },
                { k: "Issue", v: ps.openIssues, c: ps.openIssues ? "#fb7185" : "#34d399" },
              ].map((x) => (
                <div key={x.k} className="rounded-lg border border-line bg-[#0a1220] px-2 py-1.5 text-center">
                  <div className="kpi-value text-[15px] font-semibold" style={{ color: x.c }}>
                    {x.v}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-txt-mute">{x.k}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Progress value={ps.passRate} color={ps.project.color} height={4} />
              <Sparkline data={ps.trend} color={ps.project.color} width={70} height={20} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-soft pt-2 text-[10px] text-txt-mute">
              <a href={ps.project.baseUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-cyan-glow">
                <ExternalLink size={10} /> ระบบจริง
              </a>
              <a href={ps.project.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-cyan-glow">
                <FolderGit2 size={10} /> repo
              </a>
              <span className="inline-flex items-center gap-1">
                <HardDrive size={10} /> {ps.project.driveFolder || "—"}
              </span>
              <span className="ml-auto">{ps.lastRunAt ? relTime(ps.lastRunAt) : "ยังไม่เคยรัน"}</span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <SectionTitle
          title="โครงสร้างที่ระบบสร้างให้ต่อโปรเจกต์"
          subtitle="แยกข้อมูลขาดจากกัน — agent หนึ่งตัวจะเห็นเฉพาะโปรเจกต์ที่ได้รับมอบหมาย"
        />
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          {[
            { t: "Flow & Evidence", d: "flow ทดสอบ + หลักฐานภาพ/DOM/network แยกโฟลเดอร์ Drive ต่อโปรเจกต์" },
            { t: "Agents", d: "agent เฉพาะทางของโปรเจกต์ เช่นผู้เล่นหน้าเว็บ/ผู้ตรวจรายงาน" },
            { t: "Schedules", d: "ตารางรันของตัวเอง พร้อมโซนเวลาแยก" },
            { t: "Reports → mng.uarea.in", d: "รายงานผลถูกส่งเข้าหน้ากากของโปรเจกต์ในระบบหลัก" },
          ].map((x) => (
            <div key={x.t} className="rounded-xl border border-line bg-[#0a1220]/60 p-3">
              <div className="text-[12px] font-semibold">{x.t}</div>
              <div className="mt-1 text-[11px] leading-relaxed text-txt-mute">{x.d}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
