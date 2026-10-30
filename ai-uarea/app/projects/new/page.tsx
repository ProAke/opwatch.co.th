import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { loadSnapshot } from "@/lib/store";
import { AGENT_TEMPLATES } from "@/lib/agent-templates";
import ProjectWizard from "@/components/ProjectWizard";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const s = await loadSnapshot();

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-2 text-[11.5px] text-txt-mute">
        <Link href="/projects" className="inline-flex items-center gap-1 hover:text-cyan-glow">
          <ChevronLeft size={13} /> โปรเจกต์
        </Link>
        <span>/</span>
        <span className="text-txt-dim">เพิ่มโปรเจกต์</span>
      </nav>

      <div>
        <div className="label mb-1">Onboarding</div>
        <h1 className="text-[22px] font-semibold tracking-tight">ย้ายไป / เริ่มโปรเจกต์ใหม่</h1>
        <p className="mt-1 max-w-3xl text-[12.5px] text-txt-mute">
          ทำทีเดียวจบ 4 ขั้น: ข้อมูลโปรเจกต์ → ชุด AI Agent → Flow แรกจาก SPEC → ตารางรันอัตโนมัติ
          หรือจะย้ายโปรเจกต์เดิมเข้ามาด้วยไฟล์ bundle ก็ได้
        </p>
      </div>

      <ProjectWizard
        templates={AGENT_TEMPLATES.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          bestFor: t.bestFor,
          agentCount: t.agents.length,
          roles: t.agents.map((a) => a.role),
        }))}
        models={s.models.map((m) => ({ id: m.id, name: m.name, vendor: m.vendor, status: m.status, keyConfigured: m.keyConfigured }))}
      />
    </div>
  );
}
