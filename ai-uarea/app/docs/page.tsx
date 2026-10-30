import Link from "next/link";
import { BookOpen, Clapperboard, Code2, Download, FileText, Library, Terminal } from "lucide-react";
import { loadSnapshot } from "@/lib/store";
import { relTime } from "@/lib/metrics";
import { Card, EmptyState, Metric, SectionTitle, StatusPill } from "@/components/ui";
import DocGenerator from "@/components/DocGenerator";

export const dynamic = "force-dynamic";

const KIND_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  user_guide: { label: "คู่มือผู้ใช้", icon: BookOpen, color: "#22d3ee" },
  reference: { label: "คู่มืออ้างอิง", icon: FileText, color: "#a78bfa" },
  api: { label: "API", icon: Code2, color: "#34d399" },
  mcp: { label: "MCP", icon: Terminal, color: "#fbbf24" },
  video_script: { label: "สคริปต์วิดีโอ", icon: Clapperboard, color: "#f472b6" },
  release_note: { label: "Release note", icon: Download, color: "#38bdf8" },
};

export default async function DocsPage() {
  const s = await loadSnapshot();
  const words = s.docs.reduce((n, d) => n + d.words, 0);

  return (
    <div className="space-y-4">
      <div>
        <div className="label mb-1">Deliverables</div>
        <h1 className="text-[22px] font-semibold tracking-tight">คู่มือ & วิดีโอ</h1>
        <p className="mt-1 max-w-3xl text-[12.5px] text-txt-mute">
          เมื่องานทดสอบจบ AI จะผลิตคู่มือผู้ใช้ คู่มืออ้างอิง เอกสาร API/MCP และสคริปต์วิดีโอ 2 ระดับ
          เพื่อส่งมอบพร้อมผล UAT
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="เอกสารทั้งหมด" value={s.docs.length} accent="#22d3ee" icon={<Library size={15} />} hint={`${words.toLocaleString()} คำที่ AI เขียน`} />
        <Metric label="พร้อมส่งมอบ" value={s.docs.filter((d) => d.status === "ready").length} accent="#34d399" icon={<BookOpen size={15} />} hint="ตรวจภาษาไทย/อังกฤษแล้ว" />
        <Metric label="สคริปต์วิดีโอ" value={s.docs.filter((d) => d.kind === "video_script").length} accent="#f472b6" icon={<Clapperboard size={15} />} hint="ภาพรวม + ละเอียด" />
        <Metric label="กำลังสร้าง" value={s.docs.filter((d) => d.status === "generating").length} accent="#fbbf24" icon={<FileText size={15} />} hint="AI ยังเขียนไม่จบ" />
      </div>

      <DocGenerator projects={s.projects.map((p) => ({ id: p.id, name: p.name, key: p.key }))} />

      {s.docs.length === 0 ? (
        <EmptyState title="ยังไม่มีเอกสาร" hint="กดปุ่มด้านบนเพื่อให้ AI ผลิตชุดเอกสารแรก" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {s.docs.map((d) => {
            const meta = KIND_META[d.kind] ?? KIND_META.user_guide;
            const Icon = meta.icon;
            const project = s.projects.find((p) => p.id === d.projectId);
            return (
              <Card key={d.id} hover className="flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-[#0f1a2c]" style={{ color: meta.color }}>
                    <Icon size={16} />
                  </span>
                  <StatusPill status={d.status} dot={false} />
                </div>
                <Link href={`/docs/${d.id}`} className="mt-2 text-[13px] font-semibold leading-snug hover:text-cyan-glow">
                  {d.title}
                </Link>
                <div className="mt-1 text-[10.5px] text-txt-mute">
                  {meta.label} · {project?.key} · {d.language === "both" ? "ไทย+อังกฤษ" : d.language === "th" ? "ไทย" : "อังกฤษ"}
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-line-soft pt-2 text-[10px] text-txt-mute">
                  <span>{d.words ? `${d.words.toLocaleString()} คำ` : "กำลังสร้าง…"}</span>
                  <span>{relTime(d.updatedAt)}</span>
                </div>
                <Link href={`/docs/${d.id}`} className="btn btn-sm mt-2 w-full">
                  เปิดอ่าน
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="p-4">
        <SectionTitle title="แพ็กเกจส่งมอบมาตรฐาน" subtitle="ทุกครั้งที่ปิดรอบ UAT ระบบสร้างชุดนี้ให้อัตโนมัติ" />
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          {[
            { t: "1. คู่มือผู้ใช้", d: "แยกตามบทบาท/อายุผู้ใช้ พร้อมภาพหน้าจอจาก run จริง" },
            { t: "2. คู่มืออ้างอิง", d: "ตารางเมนู, สิทธิ์, ฟิลด์ และขั้นตอนทั้งหมด" },
            { t: "3. API/MCP", d: "OpenAPI + MCP tool schema พร้อมตัวอย่างการเรียก" },
            { t: "4. วิดีโอ", d: "สคริปต์ภาพรวม 6 นาที และละเอียด 18 นาที (AI voice)" },
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
