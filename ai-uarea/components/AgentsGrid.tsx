"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, ChevronDown, Loader2, Pause, Play, Plus, Sparkles, Wrench } from "lucide-react";
import type { Agent, AiModel, AgentRole, Autonomy, Project } from "@/lib/types";
import { ROLE_LABEL } from "@/lib/types";
import { Card, Progress, SectionTitle, StatusPill } from "@/components/ui";

const ROLES = Object.keys(ROLE_LABEL) as AgentRole[];
const AUTONOMY: { key: Autonomy; label: string; hint: string }[] = [
  { key: "advise", label: "แนะนำ", hint: "AI เสนอ แต่คนกดเอง" },
  { key: "semi", label: "กึ่งอัตโนมัติ", hint: "AI ทำ แต่ขออนุมัติจุดสำคัญ" },
  { key: "zero_touch", label: "Zero Touch", hint: "ทำครบวงจรไม่มีคนกด" },
];

export default function AgentsGrid({
  agents,
  models,
  projects,
}: {
  agents: Agent[];
  models: AiModel[];
  projects: Project[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: "",
    role: "web_executor" as AgentRole,
    modelId: models[0]?.id ?? "",
    projectId: projects[0]?.id ?? "",
    avatar: "🤖",
    autonomy: "semi" as Autonomy,
  });

  async function patch(agent: Agent, body: Partial<Agent>) {
    setBusy(agent.id);
    await fetch("/api/agents", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: agent.id, ...body }),
    });
    setBusy(null);
    router.refresh();
  }

  async function create() {
    if (!newAgent.name.trim()) return;
    setBusy("create");
    await fetch("/api/agents", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...newAgent, tools: ["playwright", "api"], systemPrompt: "ทำงานตามนโยบาย Zero Touch ที่กำหนด" }),
    });
    setBusy(null);
    setShowForm(false);
    setNewAgent({ ...newAgent, name: "" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label mb-1">AI workers</div>
          <h1 className="text-[22px] font-semibold tracking-tight">ฝูง AI Agent</h1>
          <p className="mt-1 max-w-2xl text-[12.5px] text-txt-mute">
            แต่ละ agent มีบทบาท เครื่องมือ และระดับความเป็นอิสระของตัวเอง — สลับโมเดลให้เหมาะกับงานได้ทันที
          </p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn btn-primary btn-sm">
          <Plus size={13} /> เพิ่ม Agent
        </button>
      </div>

      {showForm && (
        <Card className="fade-in p-4">
          <SectionTitle title="สร้าง AI Agent ใหม่" subtitle="กำหนดบทบาทและโมเดลตั้งต้น" icon={<Bot size={15} />} />
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div>
              <label className="label">ชื่อ</label>
              <input className="input mt-1" value={newAgent.name} onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })} placeholder="เช่น ผู้ตรวจใบเสร็จ" />
            </div>
            <div>
              <label className="label">บทบาท</label>
              <select className="input mt-1" value={newAgent.role} onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value as AgentRole })}>
                {ROLES.map((r) => (
                  <option key={r} value={r} className="bg-[#0a1220]">
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">โมเดล</label>
              <select className="input mt-1" value={newAgent.modelId} onChange={(e) => setNewAgent({ ...newAgent, modelId: e.target.value })}>
                {models.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#0a1220]">
                    {m.name} · {m.vendor}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">โปรเจกต์</label>
              <select className="input mt-1" value={newAgent.projectId} onChange={(e) => setNewAgent({ ...newAgent, projectId: e.target.value })}>
                <option value="" className="bg-[#0a1220]">
                  ใช้ร่วมทุกโปรเจกต์
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0a1220]">
                    {p.key} — {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">อีโมจิ</label>
              <input className="input mt-1" value={newAgent.avatar} onChange={(e) => setNewAgent({ ...newAgent, avatar: e.target.value })} />
            </div>
            <div>
              <label className="label">ความเป็นอิสระ</label>
              <select className="input mt-1" value={newAgent.autonomy} onChange={(e) => setNewAgent({ ...newAgent, autonomy: e.target.value as Autonomy })}>
                {AUTONOMY.map((a) => (
                  <option key={a.key} value={a.key} className="bg-[#0a1220]">
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="btn btn-sm">
              ยกเลิก
            </button>
            <button onClick={create} disabled={busy === "create"} className="btn btn-sm btn-primary">
              {busy === "create" ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} สร้าง Agent
            </button>
          </div>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((a) => {
          const model = models.find((m) => m.id === a.modelId);
          const project = projects.find((p) => p.id === a.projectId);
          const open = expanded === a.id;
          return (
            <Card key={a.id} hover className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-[#0f1a2c] text-[17px]">{a.avatar}</span>
                  <div>
                    <div className="text-[12.5px] font-semibold leading-tight">{a.name}</div>
                    <div className="text-[10.5px] text-txt-mute">{ROLE_LABEL[a.role]}</div>
                  </div>
                </div>
                <StatusPill status={a.status} dot={false} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-line bg-[#0a1220] px-2 py-1.5">
                  <div className="label text-[9px]">โมเดล</div>
                  <select
                    className="mt-0.5 w-full bg-transparent text-[11px] text-txt outline-none"
                    value={a.modelId}
                    onChange={(e) => patch(a, { modelId: e.target.value })}
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#0a1220]">
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-0.5 font-mono text-[8.5px] text-txt-mute">
                    {model?.vendor} · {model?.contextK}K ctx
                  </div>
                </div>
                <div className="rounded-lg border border-line bg-[#0a1220] px-2 py-1.5">
                  <div className="label text-[9px]">ความเป็นอิสระ</div>
                  <select
                    className="mt-0.5 w-full bg-transparent text-[11px] text-txt outline-none"
                    value={a.autonomy}
                    onChange={(e) => patch(a, { autonomy: e.target.value as Autonomy })}
                  >
                    {AUTONOMY.map((x) => (
                      <option key={x.key} value={x.key} className="bg-[#0a1220]">
                        {x.label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-0.5 font-mono text-[8.5px] text-txt-mute">{AUTONOMY.find((x) => x.key === a.autonomy)?.hint}</div>
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <Progress value={a.passRate} color={a.passRate >= 90 ? "#34d399" : "#fbbf24"} height={4} />
                <span className="kpi-value shrink-0 text-[10.5px] text-txt-dim">
                  {a.runsTotal} runs · {a.passRate}%
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {a.tools.slice(0, 4).map((t) => (
                  <span key={t} className="chip py-0 font-mono text-[9px]">
                    {t}
                  </span>
                ))}
                {a.tools.length > 4 && <span className="chip py-0 text-[9px]">+{a.tools.length - 4}</span>}
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-line-soft pt-2">
                <button onClick={() => setExpanded(open ? null : a.id)} className="inline-flex items-center gap-1 text-[10.5px] text-txt-mute hover:text-cyan-glow">
                  <ChevronDown size={11} className={open ? "rotate-180 transition" : "transition"} /> คำสั่งระบบ
                </button>
                <div className="flex items-center gap-1">
                  {project && (
                    <Link href={`/projects/${project.id}`} className="chip py-0 text-[9px]">
                      {project.key}
                    </Link>
                  )}
                  <button
                    onClick={() => patch(a, { status: a.status === "active" ? "paused" : "active" })}
                    disabled={busy === a.id}
                    className="btn btn-sm btn-ghost px-1.5"
                    title={a.status === "active" ? "หยุดชั่วคราว" : "เปิดใช้งาน"}
                  >
                    {busy === a.id ? <Loader2 size={11} className="animate-spin" /> : a.status === "active" ? <Pause size={11} /> : <Play size={11} className="text-mint" />}
                  </button>
                </div>
              </div>

              {open && (
                <div className="fade-in mt-2 rounded-lg border border-line bg-[#080f1c] p-2">
                  <div className="label mb-1">System prompt</div>
                  <p className="text-[10.5px] leading-relaxed text-txt-dim">{a.systemPrompt || "—"}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {a.tools.map((t) => (
                      <span key={t} className="chip py-0 font-mono text-[9px]">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-1.5 text-[9.5px] text-txt-mute">
                    ใช้งานล่าสุด: {a.lastActiveAt ? new Date(a.lastActiveAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }) : "—"}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="p-4">
        <SectionTitle title="วิธีที่ฝูงนี้ทำงานร่วมกัน" subtitle="Orchestrator จ่ายงานตามบทบาท แล้ววนกลับเมื่อเจอปัญหา" icon={<Sparkles size={15} />} />
        <div className="mt-3 grid gap-2 md:grid-cols-5">
          {[
            { t: "วางแผน", d: "Orchestrator อ่าน SPEC + flow" },
            { t: "เล่นจริง", d: "Web executor ใช้ Playwright" },
            { t: "ตรวจลึก", d: "API + DB + Report validator" },
            { t: "ตั้ง Ticket", d: "Issue writer เขียน S1–S4" },
            { t: "แก้ + ตรวจซ้ำ", d: "Fixer เปิด PR แล้ววนกลับ" },
          ].map((x, i) => (
            <div key={x.t} className="relative rounded-xl border border-line bg-[#0a1220]/70 p-3">
              <div className="font-mono text-[9.5px] text-cyan-glow">STEP {i + 1}</div>
              <div className="mt-0.5 flex items-center gap-1 text-[12px] font-semibold">
                {i === 4 ? <Wrench size={12} className="text-[#c4b5fd]" /> : <Bot size={12} className="text-cyan-glow" />} {x.t}
              </div>
              <div className="mt-1 text-[10.5px] leading-snug text-txt-mute">{x.d}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
