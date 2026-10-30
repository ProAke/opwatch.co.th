"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Bot,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import type { Flow, FlowStep, StepKind } from "@/lib/types";
import { STEP_LABEL } from "@/lib/types";
import { Card, SectionTitle } from "@/components/ui";

const KINDS: StepKind[] = [
  "navigate",
  "click",
  "fill",
  "expect",
  "api.request",
  "db.query",
  "report.check",
  "ai.review",
  "issue.create",
  "notify",
];

const KIND_COLOR: Record<StepKind, string> = {
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

export default function FlowBuilder({
  projects,
  agents,
  existing,
}: {
  projects: { id: string; name: string; key: string }[];
  agents: { id: string; name: string; role: string }[];
  existing?: Flow;
}) {
  const router = useRouter();
  const [projectId, setProjectId] = useState(existing?.projectId ?? projects[0]?.id ?? "");
  const [name, setName] = useState(existing?.name ?? "");
  const [module, setModule] = useState(existing?.module ?? "ทั่วไป");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [spec, setSpec] = useState(
    existing
      ? existing.steps.map((s) => s.name).join("\n")
      : "เปิดหน้า /sales/invoice/new\nเลือกประเภทเอกสาร ใบกำกับภาษี\nกรอกผู้ซื้อ FAS6909-0001\nเพิ่มรายการ 10 ชิ้น × 10,000 บาท\nคาดหวัง ยอดรวม 107,000.00\nตรวจ API /api/invoice/{id} ว่า vat = 7000\nตรวจฐานข้อมูล smldemo.invoice ว่า total = 107000\nตรวจรายงาน ภ.พ.30 ตรงกับ GL",
  );
  const [steps, setSteps] = useState<FlowStep[]>(existing?.steps ?? []);
  const [tags, setTags] = useState((existing?.tags ?? []).join(", "));
  const [browsers, setBrowsers] = useState<string[]>(existing?.browsers ?? ["chromium"]);
  const [status, setStatus] = useState<Flow["status"]>(existing?.status ?? "ready");
  const [busy, setBusy] = useState(false);
  const [designing, setDesigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const designerAgent = useMemo(
    () => agents.find((a) => a.role === "test_designer") ?? agents[0],
    [agents],
  );

  function updateStep(idx: number, patch: Partial<FlowStep>) {
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }

  function move(idx: number, dir: -1 | 1) {
    setSteps((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next.map((s, i) => ({ ...s, id: `s${i + 1}` }));
    });
  }

  async function design() {
    setDesigning(true);
    setError(null);
    try {
      const res = await fetch("/api/flows/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId, spec, module, name: name || undefined }),
      });
      const data = await res.json();
      if (data?.steps) {
        setSteps(data.steps);
        if (!name) setName(data.name);
        if (data.module) setModule(data.module);
      } else {
        setError(data?.error ?? "AI ออกแบบไม่สำเร็จ");
      }
    } finally {
      setDesigning(false);
    }
  }

  async function save() {
    if (!name.trim() || steps.length === 0) {
      setError("ต้องมีชื่อ flow และอย่างน้อย 1 ขั้นตอน");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/flows", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...(existing ? { id: existing.id } : {}),
          projectId,
          name,
          module,
          description,
          steps,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          browsers,
          status,
        }),
      });
      const data = await res.json();
      if (data?.flow?.id) {
        router.push(`/flows/${data.flow.id}`);
        router.refresh();
      } else {
        setError(data?.error ?? "บันทึกไม่สำเร็จ");
        setBusy(false);
      }
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1.35fr]">
      {/* Left: metadata + spec */}
      <div className="space-y-4">
        <Card className="p-4">
          <SectionTitle title="ข้อมูล Flow" subtitle="เลือกโปรเจกต์และระบุชื่อ" />
          <div className="mt-3 space-y-3">
            <div>
              <label className="label">โปรเจกต์</label>
              <select className="input mt-1" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0a1220]">
                    {p.key} — {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">ชื่อ Flow</label>
                <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น ตรวจ VAT 7%" />
              </div>
              <div>
                <label className="label">โมดูล</label>
                <input className="input mt-1" value={module} onChange={(e) => setModule(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">คำอธิบาย</label>
              <textarea
                className="input mt-1 min-h-[70px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="สิ่งที่ flow นี้ต้องพิสูจน์"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">แท็ก (คั่นด้วย ,)</label>
                <input className="input mt-1" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="ภาษี, การเงิน" />
              </div>
              <div>
                <label className="label">สถานะ</label>
                <select className="input mt-1" value={status} onChange={(e) => setStatus(e.target.value as Flow["status"])}>
                  <option value="draft" className="bg-[#0a1220]">ฉบับร่าง</option>
                  <option value="ready" className="bg-[#0a1220]">พร้อมใช้</option>
                  <option value="paused" className="bg-[#0a1220]">หยุดชั่วคราว</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">เบราว์เซอร์</label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {["chromium", "firefox", "webkit", "api"].map((b) => {
                  const on = browsers.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBrowsers((prev) => (on ? prev.filter((x) => x !== b) : [...prev, b]))}
                      className={`chip ${on ? "border-[rgba(34,211,238,0.45)] text-cyan-glow" : ""}`}
                    >
                      {on ? "✓ " : ""}
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <SectionTitle
            title="SPEC → AI ออกแบบขั้นตอน"
            subtitle={`เขียนความต้องการทีละบรรทัด แล้วให้ ${designerAgent?.name ?? "AI"} แปลงเป็น flow`}
            icon={<Wand2 size={15} />}
          />
          <textarea
            className="input mt-3 min-h-[210px] font-mono text-[11.5px] leading-relaxed"
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10.5px] text-txt-mute">แต่ละบรรทัด = 1 ขั้นตอน · ระบบเติม AI review + Issue ให้เอง</span>
            <button onClick={design} disabled={designing || !projectId} className="btn btn-sm btn-violet">
              {designing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              ให้ AI ออกแบบ
            </button>
          </div>
        </Card>
      </div>

      {/* Right: steps */}
      <div className="space-y-4">
        <Card className="p-4">
          <SectionTitle
            title={`ขั้นตอนทดสอบ (${steps.length})`}
            subtitle="เรียงตามลำดับที่ AI จะเล่นจริง — ปรับแก้ได้ทุกจุด"
            right={
              <button
                onClick={() => setSteps((p) => [...p, { id: `s${p.length + 1}`, kind: "click", name: "", critical: true }])}
                className="btn btn-sm"
              >
                <Plus size={12} /> เพิ่มขั้นตอน
              </button>
            }
          />

          <div className="mt-3 space-y-2">
            {steps.length === 0 && (
              <div className="rounded-xl border border-dashed border-line px-4 py-10 text-center text-[12px] text-txt-mute">
                ยังไม่มีขั้นตอน — เขียน SPEC แล้วกด “ให้ AI ออกแบบ” หรือเพิ่มเอง
              </div>
            )}
            {steps.map((st, idx) => (
              <div key={st.id + idx} className="rounded-xl border border-line bg-[#0a1220]/70 p-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-md font-mono text-[10px] font-bold"
                    style={{ background: `${KIND_COLOR[st.kind]}1f`, color: KIND_COLOR[st.kind], border: `1px solid ${KIND_COLOR[st.kind]}44` }}
                  >
                    {idx + 1}
                  </span>
                  <select
                    value={st.kind}
                    onChange={(e) => updateStep(idx, { kind: e.target.value as StepKind })}
                    className="input w-[132px] py-1 text-[11px]"
                  >
                    {KINDS.map((k) => (
                      <option key={k} value={k} className="bg-[#0a1220]">
                        {STEP_LABEL[k]}
                      </option>
                    ))}
                  </select>
                  <input
                    value={st.name}
                    onChange={(e) => updateStep(idx, { name: e.target.value })}
                    placeholder="อธิบายขั้นตอนนี้"
                    className="input flex-1 py-1 text-[11.5px]"
                  />
                  <div className="flex items-center gap-0.5">
                    <button onClick={() => move(idx, -1)} className="btn btn-sm btn-ghost px-1.5" title="เลื่อนขึ้น">
                      <ArrowUp size={11} />
                    </button>
                    <button onClick={() => move(idx, 1)} className="btn btn-sm btn-ghost px-1.5" title="เลื่อนลง">
                      <ArrowDown size={11} />
                    </button>
                    <button
                      onClick={() => setSteps((p) => p.filter((_, i) => i !== idx))}
                      className="btn btn-sm btn-ghost px-1.5 text-danger"
                      title="ลบ"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
                <div className="mt-1.5 grid grid-cols-2 gap-2 pl-8">
                  <input
                    value={st.target ?? ""}
                    onChange={(e) => updateStep(idx, { target: e.target.value })}
                    placeholder="selector / url / ตาราง"
                    className="input py-1 font-mono text-[10.5px]"
                  />
                  <input
                    value={st.expect ?? st.assertion ?? ""}
                    onChange={(e) =>
                      updateStep(idx, st.kind === "api.request" || st.kind === "db.query" || st.kind === "report.check"
                        ? { assertion: e.target.value }
                        : { expect: e.target.value })
                    }
                    placeholder={st.kind === "expect" ? "ค่าที่คาดหวัง" : "เงื่อนไขตรวจสอบ"}
                    className="input py-1 font-mono text-[10.5px]"
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between pl-8">
                  <label className="inline-flex items-center gap-1.5 text-[10.5px] text-txt-mute">
                    <input
                      type="checkbox"
                      checked={st.critical !== false}
                      onChange={(e) => updateStep(idx, { critical: e.target.checked })}
                      className="accent-[#22d3ee]"
                    />
                    ขั้นวิกฤต (ถ้าไม่ผ่าน = ทั้ง flow ไม่ผ่าน)
                  </label>
                  <span className="font-mono text-[9.5px] text-txt-mute">{st.id}</span>
                </div>
              </div>
            ))}
          </div>

          {error && <div className="mt-3 rounded-lg border border-[rgba(251,113,133,0.35)] bg-[rgba(251,113,133,0.08)] px-3 py-2 text-[11.5px] text-danger">{error}</div>}

          <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
            <div className="flex items-center gap-2 text-[11px] text-txt-mute">
              <Bot size={13} /> จะถูกมอบหมายให้ agent ที่มีบทบาท “เล่นหน้าเว็บ”
            </div>
            <div className="flex gap-2">
              <Link href={existing ? `/flows/${existing.id}` : "/flows"} className="btn btn-sm">
                ยกเลิก
              </Link>
              <button onClick={save} disabled={busy} className="btn btn-sm btn-primary">
                {busy ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                {existing ? "บันทึกเวอร์ชันใหม่" : "สร้าง Flow"}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
