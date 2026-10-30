import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, ChevronLeft, Layers, Sparkles } from "lucide-react";
import { loadSnapshot } from "@/lib/store";
import { fmtDateTime, fmtDuration, relTime } from "@/lib/metrics";
import { Card, KV, Progress, SectionTitle, StatusPill } from "@/components/ui";
import { STEP_LABEL } from "@/lib/types";
import FlowActions from "@/components/FlowActions";

export const dynamic = "force-dynamic";

const KIND_COLOR: Record<string, string> = {
  navigate: "#22d3ee",
  click: "#a78bfa",
  fill: "#f472b6",
  expect: "#34d399",
  "api.request": "#38bdf8",
  "db.query": "#fbbf24",
  "report.check": "#c084fc",
  "ai.review": "#22d3ee",
  "issue.create": "#fb7185",
  notify: "#94a3b8",
};

export default async function FlowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await loadSnapshot();
  const flow = s.flows.find((f) => f.id === id);
  if (!flow) notFound();
  const project = s.projects.find((p) => p.id === flow.projectId);
  const runs = s.runs.filter((r) => r.flowId === flow.id);
  const done = runs.filter((r) => ["passed", "failed"].includes(r.status));
  const rate = flow.lastPassRate ?? (done.length ? Math.round((done.filter((r) => r.status === "passed").length / done.length) * 100) : 0);
  const schedules = s.schedules.filter((x) => x.flowId === flow.id);

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-2 text-[11.5px] text-txt-mute">
        <Link href="/flows" className="inline-flex items-center gap-1 hover:text-cyan-glow">
          <ChevronLeft size={13} /> Flow ทดสอบ
        </Link>
        <span>/</span>
        <span className="text-txt-dim">{flow.name}</span>
      </nav>

      <Card className="relative overflow-hidden p-5">
        <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.16),transparent_65%)] blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[10.5px] text-txt-mute">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: project?.color }} />
              {project?.key} · {flow.module} · v{flow.version}
              <StatusPill status={flow.status} />
            </div>
            <h1 className="mt-1.5 text-[21px] font-semibold leading-snug tracking-tight">{flow.name}</h1>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-txt-dim">{flow.description}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {flow.tags.map((t) => (
                <span key={t} className="chip">
                  #{t}
                </span>
              ))}
              {flow.browsers.map((b) => (
                <span key={b} className="chip border-[rgba(167,139,250,0.3)] text-[#c4b5fd]">
                  {b}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <FlowActions flowId={flow.id} projectId={flow.projectId} />
            <div className="flex items-center gap-3 rounded-xl border border-line bg-[#0a1220] px-3 py-2">
              <div>
                <div className="label">อัตราผ่าน</div>
                <div className="kpi-value text-[19px] font-semibold" style={{ color: rate >= 90 ? "#34d399" : rate >= 70 ? "#fbbf24" : "#fb7185" }}>
                  {rate}%
                </div>
              </div>
              <div className="h-8 w-[1px] bg-line" />
              <div>
                <div className="label">รันทั้งหมด</div>
                <div className="kpi-value text-[19px] font-semibold text-txt">{runs.length}</div>
              </div>
              <div className="h-8 w-[1px] bg-line" />
              <div>
                <div className="label">ขั้นตอน</div>
                <div className="kpi-value text-[19px] font-semibold text-cyan-glow">{flow.steps.length}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-4">
          <SectionTitle
            title="ลำดับขั้นตอนที่ AI จะเล่น"
            subtitle="ขั้นวิกฤตต้องผ่านทุกข้อ · ขั้นอื่นถูกบันทึกเป็นหลักฐาน"
            icon={<Layers size={15} />}
          />
          <ol className="mt-3 space-y-2">
            {flow.steps.map((st, i) => {
              const color = KIND_COLOR[st.kind] ?? "#22d3ee";
              return (
                <li key={st.id} className="flex gap-3 rounded-xl border border-line-soft bg-[#0a1220]/60 p-2.5">
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-md font-mono text-[10px] font-bold"
                    style={{ background: `${color}18`, color, border: `1px solid ${color}44` }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[12px] font-medium">{st.name}</span>
                      <span className="chip py-0 font-mono text-[9.5px]">{STEP_LABEL[st.kind]}</span>
                      {st.critical === false && <span className="chip py-0 text-[9.5px]">ไม่วิกฤต</span>}
                    </div>
                    <div className="mt-1 grid gap-1 text-[10.5px] text-txt-mute sm:grid-cols-2">
                      {st.target && (
                        <div>
                          <span className="text-[#4a5a78]">เป้าหมาย:</span> <span className="font-mono">{st.target}</span>
                        </div>
                      )}
                      {(st.expect || st.assertion) && (
                        <div>
                          <span className="text-[#4a5a78]">ตรวจ:</span>{" "}
                          <span className="font-mono text-mint">{st.expect ?? st.assertion}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <SectionTitle title="ข้อมูล flow" icon={<Sparkles size={15} />} />
            <div className="mt-2">
              <KV k="โปรเจกต์" v={project?.name ?? "—"} />
              <KV k="ผู้สร้าง" v={s.agents.find((a) => a.id === flow.createdBy)?.name ?? "usr_human"} />
              <KV k="เวอร์ชัน" v={`v${flow.version}`} />
              <KV k="อัปเดต" v={fmtDateTime(flow.updatedAt)} />
              <KV k="เบราว์เซอร์" v={flow.browsers.join(", ")} />
              <KV k="แท็ก" v={flow.tags.join(", ") || "—"} />
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle title="ตารางที่ผูกกับ flow นี้" icon={<CalendarClock size={15} />} right={<Link href="/schedule" className="text-[11px] font-semibold text-cyan-glow hover:underline">จัดการ</Link>} />
            <div className="mt-2 space-y-2">
              {schedules.length === 0 && <div className="text-[11.5px] text-txt-mute">ยังไม่มีตาราง — ตั้งเวลาเพื่อให้ AI รันเองอัตโนมัติ</div>}
              {schedules.map((sc) => (
                <div key={sc.id} className="rounded-lg border border-line bg-[#0a1220] p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-medium">{sc.name}</span>
                    <StatusPill status={sc.status} dot={false} />
                  </div>
                  <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-txt-mute">
                    <span>
                      {sc.cadence} {sc.timeOfDay}
                    </span>
                    <span>ถัดไป {relTime(sc.nextRunAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle title="ประวัติการรัน" subtitle="10 รอบล่าสุด" />
            <div className="mt-2 space-y-1.5">
              {runs.slice(0, 10).map((r) => (
                <Link key={r.id} href={`/runs/${r.id}`} className="flex items-center gap-2 rounded-lg border border-line-soft bg-[#0a1220]/60 px-2.5 py-1.5 transition hover:border-[#2b405f]">
                  <StatusPill status={r.status} dot={false} />
                  <span className="min-w-0 flex-1 truncate text-[10.5px] text-txt-dim">{r.verdict}</span>
                  <span className="shrink-0 font-mono text-[9.5px] text-txt-mute">{fmtDuration(r.durationMs)}</span>
                </Link>
              ))}
              {runs.length === 0 && <div className="text-[11.5px] text-txt-mute">ยังไม่เคยรัน</div>}
            </div>
            <div className="mt-3">
              <Progress value={rate} color={rate >= 90 ? "#34d399" : "#fbbf24"} height={4} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
