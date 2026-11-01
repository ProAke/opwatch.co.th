import Link from "next/link";
import { ArrowUpRight, Bot, Layers, Plus, Workflow } from "lucide-react";
import { loadSnapshot } from "@/lib/store";
import { relTime } from "@/lib/metrics";
import { Card, EmptyState, Metric, Progress, SectionTitle, StatusPill } from "@/components/ui";
import { STEP_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function FlowsPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const sp = await searchParams;
  const s = await loadSnapshot();
  const projectFilter = sp.project ?? "all";
  const flows = s.flows.filter((f) => (projectFilter === "all" ? true : f.projectId === projectFilter));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label mb-1">Test flows</div>
          <h1 className="text-[22px] font-semibold tracking-tight">Flow ทดสอบ</h1>
          <p className="mt-1 max-w-2xl text-[12.5px] text-txt-mute">
            หนึ่ง flow = ลำดับการเล่นของผู้ใช้จริง 1 เส้นทาง ครอบคลุม UI · API · ฐานข้อมูล · รายงาน
            พร้อมเก็บหลักฐานทุกขั้น
          </p>
        </div>
        <Link href="/flows/new" className="btn btn-primary btn-sm">
          <Plus size={13} /> สร้าง Flow ใหม่
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Flow ทั้งหมด" value={s.flows.length} accent="#22d3ee" icon={<Workflow size={15} />} hint={`${s.flows.filter((f) => f.status === "ready").length} พร้อมใช้`} />
        <Metric label="ขั้นตอนตรวจสอบ" value={s.flows.reduce((n, f) => n + f.steps.length, 0)} accent="#a78bfa" icon={<Layers size={15} />} hint="ทุกขั้นมีหลักฐาน" />
        <Metric
          label="อัตราผ่านเฉลี่ย"
          value={`${Math.round(s.flows.filter((f) => f.lastPassRate !== null).reduce((n, f) => n + (f.lastPassRate ?? 0), 0) / Math.max(s.flows.filter((f) => f.lastPassRate !== null).length, 1))}%`}
          accent="#34d399"
          icon={<Workflow size={15} />}
          hint="จากรอบล่าสุดของแต่ละ flow"
        />
        <Metric label="ฉบับร่าง" value={s.flows.filter((f) => f.status === "draft").length} accent="#fbbf24" icon={<Bot size={15} />} hint="รอ AI ตรวจความครบถ้วน" />
      </div>

      <Card className="flex flex-wrap items-center gap-2 p-3">
        <span className="text-[11px] text-txt-mute">โปรเจกต์:</span>
        <Link href="/flows" className={`chip ${projectFilter === "all" ? "border-[rgba(34,211,238,0.4)] text-cyan-glow" : ""}`}>
          ทั้งหมด ({s.flows.length})
        </Link>
        {s.projects.map((p) => (
          <Link
            key={p.id}
            href={`/flows?project=${p.id}`}
            className={`chip ${projectFilter === p.id ? "border-[rgba(34,211,238,0.4)] text-cyan-glow" : ""}`}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} /> {p.key} (
            {s.flows.filter((f) => f.projectId === p.id).length})
          </Link>
        ))}
      </Card>

      {flows.length === 0 ? (
        <EmptyState
          title="ยังไม่มี flow ในโปรเจกต์นี้"
          hint="เขียน SPEC แล้วให้ AI ออกแบบขั้นตอนให้อัตโนมัติ"
          action={
            <Link href="/flows/new" className="btn btn-sm btn-primary">
              <Plus size={12} /> สร้าง Flow
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {flows.map((f) => {
            const project = s.projects.find((p) => p.id === f.projectId);
            const runs = s.runs.filter((r) => r.flowId === f.id);
            const rate =
              f.lastPassRate ??
              (runs.filter((r) => ["passed", "failed"].includes(r.status)).length
                ? Math.round(
                    (runs.filter((r) => r.status === "passed").length /
                      runs.filter((r) => ["passed", "failed"].includes(r.status)).length) *
                      100,
                  )
                : 0);
            return (
              <Card key={f.id} hover className="flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[10.5px] text-txt-mute">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: project?.color }} />
                      {project?.key} · {f.module}
                    </div>
                    <Link href={`/flows/${f.id}`} className="mt-1 block text-[13.5px] font-semibold leading-snug hover:text-cyan-glow">
                      {f.name}
                    </Link>
                  </div>
                  <StatusPill status={f.status} />
                </div>

                <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-txt-mute">{f.description}</p>

                <div className="mt-2.5 space-y-1">
                  {f.steps.slice(0, 4).map((st, i) => (
                    <div key={st.id} className="flex items-center gap-2 text-[10.5px]">
                      <span className="w-3 shrink-0 font-mono text-txt-mute">{i + 1}</span>
                      <span className="chip shrink-0 py-0 font-mono text-[9px]">{STEP_LABEL[st.kind]}</span>
                      <span className="truncate text-txt-dim">{st.name}</span>
                    </div>
                  ))}
                  {f.steps.length > 4 && (
                    <div className="pl-5 text-[10px] text-txt-mute">+ อีก {f.steps.length - 4} ขั้นตอน</div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Progress value={rate} color={rate >= 90 ? "#34d399" : rate >= 70 ? "#fbbf24" : "#fb7185"} height={4} />
                  <span className="kpi-value shrink-0 text-[11px]" style={{ color: rate >= 90 ? "#34d399" : rate >= 70 ? "#fbbf24" : "#fb7185" }}>
                    {rate}%
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-line-soft pt-2 text-[10px] text-txt-mute">
                  <span>
                    {runs.length} runs · v{f.version}
                  </span>
                  <span>{relTime(f.updatedAt)}</span>
                  <Link href={`/flows/${f.id}`} className="inline-flex items-center gap-0.5 font-semibold text-cyan-glow hover:underline">
                    เปิด <ArrowUpRight size={10} />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="p-4">
        <SectionTitle
          title="หลักการออกแบบ Flow ของระบบนี้"
          subtitle="ทุก flow ต้องผ่าน checklist ต่อไปนี้ก่อนถูกใช้ในโหมด Zero Touch"
        />
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          {[
            { t: "1. มีจุดเข้าและข้อมูลตั้งต้น", d: "ระบุ URL/เมนู และข้อมูลทดสอบที่สร้างใหม่ทุกครั้ง ไม่ใช้ข้อมูลจริง" },
            { t: "2. ตรวจได้หลายชั้น", d: "อย่างน้อย UI + API หรือ DB เพื่อไม่ให้ผ่านแบบหลอก" },
            { t: "3. เก็บหลักฐานทุกขั้น", d: "ภาพหน้าจอ, DOM snapshot, network trace และค่าที่คาดหวัง" },
            { t: "4. วนกลับได้", d: "ถ้าไม่ผ่านต้องเปิด Issue พร้อมข้อมูลพอให้ AI แก้ได้ทันที" },
          ].map((x) => (
            <div key={x.t} className="rounded-xl border border-line bg-[#0a1220]/60 p-3">
              <div className="text-[12px] font-semibold text-txt">{x.t}</div>
              <div className="mt-1 text-[11px] leading-relaxed text-txt-mute">{x.d}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
