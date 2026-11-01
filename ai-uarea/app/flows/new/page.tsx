import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { loadSnapshot } from "@/lib/store";
import FlowBuilder from "@/components/FlowBuilder";

export const dynamic = "force-dynamic";

export default async function NewFlowPage() {
  const s = await loadSnapshot();
  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-2 text-[11.5px] text-txt-mute">
        <Link href="/flows" className="inline-flex items-center gap-1 hover:text-cyan-glow">
          <ChevronLeft size={13} /> Flow ทดสอบ
        </Link>
        <span>/</span>
        <span className="text-txt-dim">สร้างใหม่</span>
      </nav>
      <div>
        <div className="label mb-1">Flow builder</div>
        <h1 className="text-[22px] font-semibold tracking-tight">สร้าง Flow ทดสอบใหม่</h1>
        <p className="mt-1 text-[12.5px] text-txt-mute">
          เขียน SPEC เป็นภาษาคน — AI จะแปลงเป็นขั้นตอนที่ Playwright เรียกได้จริง
        </p>
      </div>
      <FlowBuilder
        projects={s.projects.map((p) => ({ id: p.id, name: p.name, key: p.key }))}
        agents={s.agents.map((a) => ({ id: a.id, name: a.name, role: a.role }))}
      />
    </div>
  );
}
