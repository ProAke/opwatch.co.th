"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Clapperboard, Code2, FileText, Loader2, Sparkles, Terminal } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui";

const KINDS = [
  { kind: "user_guide", label: "คู่มือผู้ใช้", icon: BookOpen, desc: "ทุกเมนู ภาษาคน" },
  { kind: "reference", label: "คู่มืออ้างอิง", icon: FileText, desc: "ตารางโมดูล + ขั้นตอน" },
  { kind: "api", label: "เอกสาร API", icon: Code2, desc: "endpoint + ตัวอย่าง curl" },
  { kind: "mcp", label: "เอกสาร MCP", icon: Terminal, desc: "tools + config" },
  { kind: "video_script", label: "วิดีโอภาพรวม", icon: Clapperboard, desc: "สคริปต์ 6 นาที", detail: "overview" },
  { kind: "video_script", label: "วิดีโอละเอียด", icon: Clapperboard, desc: "สคริปต์ 18 นาที", detail: "deep" },
] as const;

export default function DocGenerator({ projects }: { projects: { id: string; name: string; key: string }[] }) {
  const router = useRouter();
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function generate(kind: string, label: string, detail?: string) {
    setBusy(label);
    setNotice(null);
    const res = await fetch("/api/docs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ projectId, kind, detail, language: "th" }),
    });
    const data = await res.json();
    setBusy(null);
    if (data?.doc) {
      setNotice(`สร้าง “${data.doc.title}” สำเร็จ (${data.doc.words.toLocaleString()} คำ)`);
      router.refresh();
    } else {
      setNotice(data?.error ?? "สร้างไม่สำเร็จ");
    }
  }

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionTitle
          title="ให้ AI ผลิตเอกสาร & สคริปต์วิดีโอ"
          subtitle="ดึงจาก flow และหลักฐานการทดสอบจริง — ไม่ต้องเขียนเอง"
          icon={<Sparkles size={15} />}
        />
        <select className="input w-[220px] text-[12px]" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          {projects.map((p) => (
            <option key={p.id} value={p.id} className="bg-[#0a1220]">
              {p.key} — {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {KINDS.map((k) => {
          const Icon = k.icon;
          return (
            <button
              key={k.label}
              onClick={() => generate(k.kind, k.label, (k as { detail?: string }).detail)}
              disabled={busy !== null || !projectId}
              className="flex items-center gap-2.5 rounded-xl border border-line bg-[#0a1220]/70 p-2.5 text-left transition hover:border-[rgba(34,211,238,0.4)] hover:bg-[#0c1626] disabled:opacity-60"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-[#0f1a2c] text-cyan-glow">
                {busy === k.label ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] font-medium">{k.label}</span>
                <span className="block text-[10px] text-txt-mute">{k.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
      {notice && (
        <div className="mt-2 rounded-lg border border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.07)] px-2.5 py-1.5 text-[11.5px] text-mint">
          {notice}
        </div>
      )}
    </Card>
  );
}
