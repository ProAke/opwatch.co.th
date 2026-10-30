import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Copy } from "lucide-react";
import { loadSnapshot } from "@/lib/store";
import { fmtDateTime } from "@/lib/metrics";
import { Card, StatusPill } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DocDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await loadSnapshot();
  const doc = s.docs.find((d) => d.id === id);
  if (!doc) notFound();
  const project = s.projects.find((p) => p.id === doc.projectId);

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-2 text-[11.5px] text-txt-mute">
        <Link href="/docs" className="inline-flex items-center gap-1 hover:text-cyan-glow">
          <ChevronLeft size={13} /> คู่มือ & วิดีโอ
        </Link>
        <span>/</span>
        <span className="text-txt-dim">{doc.title}</span>
      </nav>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <StatusPill status={doc.status} dot={false} />
              <span className="chip py-0 font-mono text-[9.5px]">{doc.kind}</span>
              <span className="chip py-0 text-[9.5px]">{project?.key}</span>
            </div>
            <h1 className="mt-2 text-[19px] font-semibold leading-snug">{doc.title}</h1>
            <div className="mt-1 text-[10.5px] text-txt-mute">
              {doc.words.toLocaleString()} คำ · อัปเดต {fmtDateTime(doc.updatedAt)} · ภาษา {doc.language}
            </div>
          </div>
          <button className="btn btn-sm">
            <Copy size={12} /> คัดลอก Markdown
          </button>
        </div>
      </Card>

      <Card className="p-5">
        <pre className="whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-txt-dim">{doc.content || "AI กำลังเขียน…"}</pre>
      </Card>
    </div>
  );
}
