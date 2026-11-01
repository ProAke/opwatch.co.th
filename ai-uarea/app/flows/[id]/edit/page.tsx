import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { loadSnapshot } from "@/lib/store";
import FlowBuilder from "@/components/FlowBuilder";

export const dynamic = "force-dynamic";

export default async function EditFlowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await loadSnapshot();
  const flow = s.flows.find((f) => f.id === id);
  if (!flow) notFound();

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-2 text-[11.5px] text-txt-mute">
        <Link href="/flows" className="inline-flex items-center gap-1 hover:text-cyan-glow">
          <ChevronLeft size={13} /> Flow ทดสอบ
        </Link>
        <span>/</span>
        <Link href={`/flows/${flow.id}`} className="hover:text-cyan-glow">
          {flow.name}
        </Link>
        <span>/</span>
        <span className="text-txt-dim">แก้ไข</span>
      </nav>
      <div>
        <div className="label mb-1">Edit flow · v{flow.version}</div>
        <h1 className="text-[22px] font-semibold tracking-tight">แก้ไข Flow</h1>
        <p className="mt-1 text-[12.5px] text-txt-mute">บันทึกแล้วจะได้เวอร์ชันใหม่ (v{flow.version + 1}) โดยประวัติการรันเดิมยังอยู่</p>
      </div>
      <FlowBuilder
        existing={flow}
        projects={s.projects.map((p) => ({ id: p.id, name: p.name, key: p.key }))}
        agents={s.agents.map((a) => ({ id: a.id, name: a.name, role: a.role }))}
      />
    </div>
  );
}
