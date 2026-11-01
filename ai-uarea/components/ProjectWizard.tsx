"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Cpu,
  FileJson,
  FolderGit2,
  Layers,
  Loader2,
  Play,
  Rocket,
  Sparkles,
  Upload,
  Wand2,
  Workflow,
} from "lucide-react";
import type { StepKind } from "@/lib/types";
import { STEP_LABEL } from "@/lib/types";
import { Card, SectionTitle } from "@/components/ui";

type TemplateMeta = { id: string; name: string; description: string; bestFor: string; agentCount: number; roles: string[] };
type ModelMeta = { id: string; name: string; vendor: string; status: string; keyConfigured: boolean };
type PreviewStep = { id: string; kind: StepKind; name: string; target?: string; expect?: string; assertion?: string };

const STEPS = ["โปรเจกต์", "ชุด Agent", "Flow แรก", "ตารางรัน", "เสร็จสิ้น"];
const CADENCES = [
  { key: "manual", label: "ไม่ตั้ง (manual)" },
  { key: "hourly", label: "ทุกชั่วโมง" },
  { key: "daily", label: "ทุกวัน" },
  { key: "weekdays", label: "จันทร์–ศุกร์" },
  { key: "weekly", label: "ทุกสัปดาห์" },
  { key: "monthly", label: "ทุกเดือน" },
];

export default function ProjectWizard({
  templates,
  models,
}: {
  templates: TemplateMeta[];
  models: ModelMeta[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"new" | "import">("new");
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    projectId: string;
    projectName: string;
    projectKey: string;
    agents: number;
    flowId?: string | null;
    flowName?: string | null;
    steps?: number;
    schedule?: string | null;
    next?: string[];
  } | null>(null);

  // ── project form
  const [p, setP] = useState({
    name: "",
    key: "",
    description: "",
    baseUrl: "https://",
    repoUrl: "",
    driveFolder: "",
    env: "staging",
    owner: "",
    menus: 0,
    color: "#22d3ee",
  });

  // ── github repos (quick pick)
  const [ghRepos, setGhRepos] = useState<{ fullName: string; private: boolean }[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  async function loadRepos() {
    setLoadingRepos(true);
    try {
      const res = await fetch("/api/github/repos", { cache: "no-store" });
      const json = await res.json();
      setGhRepos(json?.repos ?? []);
    } catch {
      setGhRepos([]);
    } finally {
      setLoadingRepos(false);
    }
  }

  // ── agents
  const [template, setTemplate] = useState("full");
  const [modelId, setModelId] = useState(models.find((m) => m.status === "active")?.id ?? models[0]?.id ?? "");
  const [autonomy, setAutonomy] = useState("zero_touch");

  // ── first flow
  const [spec, setSpec] = useState(
    "เปิดหน้าภาพรวมของระบบ\nเข้าสู่ระบบด้วยบัญชีผู้ดูแล\nเปิดเมนูหลักที่สำคัญที่สุด\nกรอกข้อมูลตัวอย่างและบันทึก\nคาดหวัง บันทึกสำเร็จและเห็นข้อมูลใหม่\nตรวจ API /api/… ว่าตอบ 200\nตรวจฐานข้อมูลว่าบันทึกครบ",
  );
  const [moduleName, setModuleName] = useState("ทั่วไป");
  const [flowName, setFlowName] = useState("");
  const [preview, setPreview] = useState<PreviewStep[] | null>(null);
  const [previewNote, setPreviewNote] = useState<string | null>(null);

  // ── schedule
  const [cadence, setCadence] = useState("daily");
  const [timeOfDay, setTimeOfDay] = useState("09:00");

  // ── import
  const [bundleText, setBundleText] = useState("");
  const [bundleInfo, setBundleInfo] = useState<{ name: string; flows: number; agents: number } | null>(null);
  const [importName, setImportName] = useState("");
  const [importKey, setImportKey] = useState("");

  const selectedTemplate = useMemo(() => templates.find((t) => t.id === template), [templates, template]);
  const activeModels = models.filter((m) => m.status === "active");

  function set<K extends keyof typeof p>(key: K, value: (typeof p)[K]) {
    setP((prev) => ({ ...prev, [key]: value }));
  }

  async function designPreview() {
    if (spec.trim().length < 5) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/flows/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          projectName: p.name || "โปรเจกต์ใหม่",
          projectKey: (p.key || "NEW").toUpperCase(),
          projectBaseUrl: p.baseUrl,
          spec,
          module: moduleName,
          name: flowName || undefined,
        }),
      });
      const data = await res.json();
      if (data?.steps) {
        setPreview(data.steps);
        setPreviewNote(data.note ?? null);
      } else {
        setError(data?.error ?? "ออกแบบไม่สำเร็จ");
      }
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/projects/onboard", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          project: { ...p, key: p.key ? p.key.toUpperCase() : undefined },
          agents: { template, modelId, autonomy },
          flow: spec.trim().length >= 5 ? { spec, module: moduleName, name: flowName || undefined } : undefined,
          schedule: spec.trim().length >= 5 && cadence !== "manual" ? { cadence, timeOfDay, notify: ["mng"] } : undefined,
        }),
      });
      const data = await res.json();
      if (data?.project?.id) {
        setResult({
          projectId: data.project.id,
          projectName: data.project.name,
          projectKey: data.project.key,
          agents: data.agents?.length ?? 0,
          flowId: data.flow?.id,
          flowName: data.flow?.name,
          steps: data.flow?.steps?.length,
          schedule: data.schedule ? `${data.schedule.cadence} ${data.schedule.timeOfDay}` : null,
          next: data.next,
        });
        setStep(4);
        router.refresh();
      } else {
        setError(data?.error ?? "สร้างโปรเจกต์ไม่สำเร็จ");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function readBundleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setBundleText(text);
      try {
        const parsed = JSON.parse(text);
        setBundleInfo({
          name: parsed?.project?.name ?? "ไม่ทราบชื่อ",
          flows: parsed?.flows?.length ?? 0,
          agents: parsed?.agents?.length ?? 0,
        });
        setImportName(parsed?.project?.name ? `${parsed.project.name} (สำเนา)` : "");
        setImportKey(parsed?.project?.key ? `${parsed.project.key}` : "");
        setError(null);
      } catch {
        setBundleInfo(null);
        setError("ไฟล์ JSON ไม่ถูกต้อง");
      }
    };
    reader.readAsText(file);
  }

  async function importProject() {
    setBusy(true);
    setError(null);
    try {
      const bundle = JSON.parse(bundleText);
      const res = await fetch("/api/projects/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bundle, name: importName || undefined, key: importKey || undefined }),
      });
      const data = await res.json();
      if (data?.project?.id) {
        setResult({
          projectId: data.project.id,
          projectName: data.project.name,
          projectKey: data.project.key,
          agents: data.imported?.agents ?? 0,
          flowName: `นำเข้า ${data.imported?.flows ?? 0} flow`,
          schedule: data.imported?.schedules ? `${data.imported.schedules} ตาราง` : null,
          next: [
            "ตรวจ schema ของ API/ฐานข้อมูลใน flow ที่นำเข้ามา",
            "อัปเดต baseUrl / repo / Drive ให้ชี้ระบบใหม่",
            "กดรัน 1 รอบเพื่อยืนยันว่า flow ยังใช้ได้กับระบบใหม่",
          ],
        });
        setStep(4);
        router.refresh();
      } else {
        setError(data?.error ?? "นำเข้าไม่สำเร็จ");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const canNext =
    step === 0 ? p.name.trim().length >= 2 : step === 1 ? Boolean(template) : step === 2 ? spec.trim().length >= 5 : true;

  // ── import view ────────────────────────────────────────────────────────────
  if (mode === "import" && step < 4) {
    return (
      <div className="space-y-4">
        <Tabs mode={mode} setMode={setMode} />
        <Card className="p-5">
          <SectionTitle
            title="ย้ายโปรเจกต์เดิมเข้ามาที่นี่"
            subtitle="อัปโหลดไฟล์ bundle (.json) ที่ได้จาก /api/projects/:id/export — ระบบจะสร้างโปรเจกต์ใหม่และ remap id ให้ทั้งหมด"
            icon={<Upload size={15} />}
          />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">ไฟล์ bundle</label>
              <input
                type="file"
                accept="application/json,.json"
                onChange={(e) => e.target.files?.[0] && readBundleFile(e.target.files[0])}
                className="input mt-1 cursor-pointer text-[11.5px] file:mr-2 file:rounded-md file:border-0 file:bg-[#16223a] file:px-2 file:py-1 file:text-[11px] file:text-txt"
              />
              <textarea
                className="input mt-2 min-h-[150px] font-mono text-[10.5px]"
                placeholder='หรือวาง JSON ที่นี่: { "schema": "uarea-project-bundle@1", "project": { … } }'
                value={bundleText}
                onChange={(e) => {
                  setBundleText(e.target.value);
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setBundleInfo({
                      name: parsed?.project?.name ?? "ไม่ทราบชื่อ",
                      flows: parsed?.flows?.length ?? 0,
                      agents: parsed?.agents?.length ?? 0,
                    });
                  } catch {
                    setBundleInfo(null);
                  }
                }}
              />
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-line bg-[#0a1220] p-3">
                <div className="label mb-1">ข้อมูลที่อ่านได้</div>
                {bundleInfo ? (
                  <div className="space-y-1 text-[12px]">
                    <div className="font-medium text-txt">{bundleInfo.name}</div>
                    <div className="text-[11px] text-txt-mute">
                      {bundleInfo.flows} flow · {bundleInfo.agents} agent · จะถูกสร้างเป็นโปรเจกต์ใหม่ทั้งหมด
                    </div>
                  </div>
                ) : (
                  <div className="text-[11.5px] text-txt-mute">ยังไม่มีไฟล์ — เลือกไฟล์หรือวาง JSON ทางซ้าย</div>
                )}
              </div>
              <div>
                <label className="label">ชื่อโปรเจกต์ใหม่</label>
                <input className="input mt-1" value={importName} onChange={(e) => setImportName(e.target.value)} placeholder="เช่น SML HR (ย้าย)" />
              </div>
              <div>
                <label className="label">รหัส (key)</label>
                <input className="input mt-1 font-mono" value={importKey} onChange={(e) => setImportKey(e.target.value.toUpperCase())} placeholder="SMLHR" />
              </div>
              <div className="rounded-lg border border-[rgba(251,191,36,0.28)] bg-[rgba(251,191,36,0.06)] px-2.5 py-2 text-[10.5px] leading-relaxed text-[#fbbf24]">
                หลังนำเข้าแล้วต้องแก้ baseUrl / repo / Drive และกดรัน 1 รอบเพื่อยืนยันว่า selector ยังตรงกับระบบใหม่
              </div>
              <button onClick={importProject} disabled={busy || !bundleText} className="btn btn-primary w-full">
                {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} นำเข้าโปรเจกต์
              </button>
            </div>
          </div>
          {error && <ErrBox msg={error} />}
        </Card>
        <HelpCard />
      </div>
    );
  }

  // ── result view ────────────────────────────────────────────────────────────
  if (step === 4 && result) {
    return (
      <div className="space-y-4">
        <Card className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.22),transparent_65%)] blur-2xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(52,211,153,0.35)] bg-[rgba(52,211,153,0.1)] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-mint">
              <CheckCircle2 size={12} /> พร้อมใช้งาน
            </div>
            <h1 className="mt-2 text-[22px] font-semibold tracking-tight">
              {result.projectName} <span className="font-mono text-[13px] text-txt-mute">({result.projectKey})</span>
            </h1>
            <p className="mt-1 text-[12.5px] text-txt-mute">ฝูง AI ถูกตั้งค่าเรียบร้อย — ต่อไปแค่แก้ SPEC/นโยบายแล้วปล่อยให้ระบบวิ่งเอง</p>

            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              {[
                { k: "AI Agent", v: result.agents, icon: Bot },
                { k: "Flow แรก", v: result.steps ? `${result.steps} ขั้น` : "—", icon: Workflow },
                { k: "ตารางรัน", v: result.schedule ?? "manual", icon: CalendarClock },
                { k: "สถานะ", v: "active", icon: CheckCircle2 },
              ].map((x) => {
                const Icon = x.icon;
                return (
                  <div key={x.k} className="rounded-xl border border-line bg-[#0a1220] px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-txt-mute">
                      <Icon size={11} /> {x.k}
                    </div>
                    <div className="mt-1 text-[14px] font-semibold text-txt">{x.v}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/projects/${result.projectId}`} className="btn btn-primary btn-sm">
                <Layers size={12} /> เปิดโปรเจกต์
              </Link>
              {result.flowId && (
                <>
                  <Link href={`/flows/${result.flowId}`} className="btn btn-sm">
                    <Workflow size={12} /> ดู flow
                  </Link>
                  <Link href={`/flows/${result.flowId}/edit`} className="btn btn-sm">
                    <Wand2 size={12} /> แก้ขั้นตอน
                  </Link>
                </>
              )}
              <Link href="/integrations" className="btn btn-sm">
                <FolderGit2 size={12} /> ต่อ GitHub / Drive
              </Link>
              <Link href="/settings" className="btn btn-sm">
                <Sparkles size={12} /> ตั้งนโยบาย
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <SectionTitle title="ขั้นต่อไปที่แนะนำ" subtitle="เรียงตามลำดับที่ควรทำ" />
          <ol className="mt-3 space-y-2">
            {(result.next ?? []).map((n, i) => (
              <li key={n} className="flex items-start gap-2 text-[12px] text-txt-dim">
                <span className="mt-[1px] grid h-4 w-4 shrink-0 place-items-center rounded-full border border-[rgba(34,211,238,0.4)] bg-[rgba(34,211,238,0.12)] font-mono text-[9px] text-cyan-glow">
                  {i + 1}
                </span>
                {n}
              </li>
            ))}
          </ol>
        </Card>

        <HelpCard />
      </div>
    );
  }

  // ── wizard ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <Tabs mode={mode} setMode={setMode} />

      <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-line bg-[#0a1220] p-1.5">
        {STEPS.map((label, i) => {
          const done = i < step;
          const now = i === step;
          return (
            <div key={label} className="flex flex-1 items-center gap-1">
              <div
                className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] transition ${
                  now ? "bg-[rgba(34,211,238,0.12)] text-cyan-glow" : done ? "text-mint" : "text-txt-mute"
                }`}
              >
                <span
                  className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border font-mono text-[9px] ${
                    done ? "border-[rgba(52,211,153,0.5)] bg-[rgba(52,211,153,0.15)]" : now ? "border-[rgba(34,211,238,0.55)]" : "border-line"
                  }`}
                >
                  {done ? <Check size={9} /> : i + 1}
                </span>
                <span className="truncate">{label}</span>
              </div>
              {i < STEPS.length - 1 && <ChevronRight size={11} className="shrink-0 text-[#31405c]" />}
            </div>
          );
        })}
      </div>

      {/* step 0 — project */}
      {step === 0 && (
        <Card className="p-5">
          <SectionTitle
            title="1. ข้อมูลโปรเจกต์ใหม่"
            subtitle="ระบบจะแยก flow, agent, หลักฐาน และรายงานของโปรเจกต์นี้จากของเดิมทั้งหมด"
            icon={<Layers size={15} />}
          />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Field label="ชื่อโปรเจกต์ *">
              <input className="input" value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="เช่น SML HR / คลังสินค้า" />
            </Field>
            <Field label="รหัส (key) — ใช้ขึ้นต้นเลข Ticket">
              <input
                className="input font-mono"
                value={p.key}
                onChange={(e) => set("key", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                placeholder="SMLHR"
              />
            </Field>
            <Field label="Environment">
              <select className="input" value={p.env} onChange={(e) => set("env", e.target.value)}>
                {["staging", "demo", "production", "local"].map((x) => (
                  <option key={x} value={x} className="bg-[#0a1220]">
                    {x}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="URL ระบบ">
              <input className="input font-mono" value={p.baseUrl} onChange={(e) => set("baseUrl", e.target.value)} placeholder="https://app.example.com" />
            </Field>
            <Field label="GitHub repo">
              <input className="input font-mono" value={p.repoUrl} onChange={(e) => set("repoUrl", e.target.value)} placeholder="https://github.com/org/repo" />
              <div className="mt-1">
                <button type="button" onClick={loadRepos} disabled={loadingRepos} className="text-[10px] font-semibold text-cyan-glow hover:underline">
                  {loadingRepos ? "กำลังดึงรายการ…" : "เลือกจาก GitHub repo ที่มีสิทธิ์"}
                </button>
                {ghRepos.length > 0 && (
                  <div className="mt-1 flex max-h-[92px] flex-wrap gap-1 overflow-y-auto">
                    {ghRepos.slice(0, 12).map((r) => (
                      <button
                        key={r.fullName}
                        type="button"
                        onClick={() => set("repoUrl", `https://github.com/${r.fullName}`)}
                        className={`chip py-0 font-mono text-[8.5px] ${
                          p.repoUrl.includes(r.fullName) ? "border-[rgba(34,211,238,0.45)] text-cyan-glow" : ""
                        }`}
                      >
                        {r.fullName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Field>
            <Field label="โฟลเดอร์ Google Drive">
              <input
                className="input font-mono"
                value={p.driveFolder}
                onChange={(e) => set("driveFolder", e.target.value)}
                placeholder="drive://PROJECT/uat-evidence"
              />
            </Field>
            <Field label="เจ้าของ / ผู้ดูแล">
              <input className="input" value={p.owner} onChange={(e) => set("owner", e.target.value)} placeholder="ชื่อทีมหรือผู้รับผิดชอบ" />
            </Field>
            <Field label="จำนวนเมนูโดยประมาณ">
              <input type="number" className="input" value={p.menus} onChange={(e) => set("menus", Number(e.target.value))} />
            </Field>
            <Field label="สีประจำโปรเจกต์">
              <input type="color" className="input h-[36px] p-1" value={p.color} onChange={(e) => set("color", e.target.value)} />
            </Field>
            <div className="md:col-span-3">
              <Field label="คำอธิบายสั้น ๆ">
                <input className="input" value={p.description} onChange={(e) => set("description", e.target.value)} placeholder="ระบบนี้ทำอะไร และอะไรคือความเสี่ยงหลักที่ต้องทดสอบ" />
              </Field>
            </div>
          </div>
        </Card>
      )}

      {/* step 1 — agents */}
      {step === 1 && (
        <Card className="p-5">
          <SectionTitle title="2. ชุด AI Agent ตั้งต้น" subtitle="เลือกชุดที่จะสร้างให้โปรเจกต์นี้ — แก้/เพิ่ม/สลับโมเดลทีหลังได้ที่หน้า Agent" icon={<Bot size={15} />} />
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {templates.map((t) => {
              const on = template === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    on ? "border-[rgba(34,211,238,0.5)] bg-[rgba(34,211,238,0.07)]" : "border-line bg-[#0a1220]/70 hover:border-[#2b405f]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12.5px] font-semibold">{t.name}</span>
                    <span className={`chip py-0 text-[9.5px] ${on ? "border-[rgba(34,211,238,0.45)] text-cyan-glow" : ""}`}>{t.agentCount} agent</span>
                  </div>
                  <div className="mt-1 text-[11px] leading-snug text-txt-mute">{t.description}</div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {t.roles.map((r) => (
                      <span key={r} className="chip py-0 font-mono text-[8.5px]">
                        {r}
                      </span>
                    ))}
                  </div>
                  <div className="mt-1.5 text-[9.5px] text-txt-mute">เหมาะกับ: {t.bestFor}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field label="โมเดลเริ่มต้นของ agent ทุกตัว">
              <select className="input" value={modelId} onChange={(e) => setModelId(e.target.value)}>
                {activeModels.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#0a1220]">
                    {m.name} · {m.vendor}
                    {m.keyConfigured ? " · พร้อมใช้" : ""}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-txt-mute">
                ระบบจะเลือกโมเดลให้เหมาะกับบทบาทอัตโนมัติถ้าไม่ระบุ — สลับรายตัวได้ที่หน้า Agent
              </p>
            </Field>
            <Field label="ระดับความเป็นอิสระ">
              <select className="input" value={autonomy} onChange={(e) => setAutonomy(e.target.value)}>
                <option value="advise" className="bg-[#0a1220]">แนะนำ — AI เสนอ คนกดเอง</option>
                <option value="semi" className="bg-[#0a1220]">กึ่งอัตโนมัติ — ขออนุมัติจุดสำคัญ</option>
                <option value="zero_touch" className="bg-[#0a1220]">Zero Touch — ทำครบวงจร</option>
              </select>
            </Field>
          </div>

          {selectedTemplate && (
            <div className="mt-3 rounded-xl border border-line bg-[#0a1220] p-3">
              <div className="label mb-1.5">Agent ที่จะถูกสร้าง</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedTemplate.roles.map((r) => (
                  <span key={r} className="chip font-mono text-[9.5px]">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* step 2 — first flow */}
      {step === 2 && (
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Card className="p-5">
            <SectionTitle title="3. Flow แรกจาก SPEC" subtitle="เขียนความต้องการทีละบรรทัด — AI จะแปลงเป็นขั้นตอนที่รันได้จริง" icon={<Wand2 size={15} />} />
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Field label="โมดูล">
                <input className="input" value={moduleName} onChange={(e) => setModuleName(e.target.value)} />
              </Field>
              <Field label="ชื่อ flow (ไม่บังคับ)">
                <input className="input" value={flowName} onChange={(e) => setFlowName(e.target.value)} placeholder="เช่น ทดสอบล็อกอิน" />
              </Field>
            </div>
            <textarea
              className="input mt-3 min-h-[230px] font-mono text-[11.5px] leading-relaxed"
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10.5px] text-txt-mute">แต่ละบรรทัด = 1 ขั้นตอน · ระบบเติม AI review + Issue ให้เอง</span>
              <button onClick={designPreview} disabled={busy} className="btn btn-sm btn-violet">
                {busy ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} ดูก่อน
              </button>
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle title="ตัวอย่างขั้นตอนที่ AI ออกแบบ" subtitle={previewNote ?? "กด “ดูก่อน” เพื่อให้ AI แปลง SPEC"} icon={<Cpu size={15} />} />
            <div className="mt-3 space-y-1.5">
              {!preview && (
                <div className="rounded-xl border border-dashed border-line px-4 py-10 text-center text-[11.5px] text-txt-mute">
                  ยังไม่มีตัวอย่าง — เขียน SPEC ทางซ้ายแล้วกด “ดูก่อน”
                </div>
              )}
              {preview?.map((st, i) => (
                <div key={`${st.id}-${i}`} className="flex items-start gap-2 rounded-lg border border-line bg-[#0a1220]/70 px-2.5 py-1.5">
                  <span className="mt-[1px] grid h-4 w-4 shrink-0 place-items-center rounded bg-[#16223a] font-mono text-[9px] text-txt-dim">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[11.5px] text-txt-dim">{st.name}</div>
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      <span className="chip py-0 font-mono text-[8.5px]">{STEP_LABEL[st.kind] ?? st.kind}</span>
                      {st.target && <span className="chip py-0 font-mono text-[8.5px]">{st.target}</span>}
                      {(st.expect || st.assertion) && (
                        <span className="chip border-[rgba(52,211,153,0.3)] py-0 text-[8.5px] text-mint">{st.expect ?? st.assertion}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* step 3 — schedule */}
      {step === 3 && (
        <Card className="p-5">
          <SectionTitle
            title="4. ตารางรันอัตโนมัติ"
            subtitle="ตั้งรอบให้ AI รันเองหลังสร้างเสร็จ — ข้ามได้ถ้าอยากกดเองก่อน"
            icon={<CalendarClock size={15} />}
          />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field label="ความถี่">
              <select className="input" value={cadence} onChange={(e) => setCadence(e.target.value)}>
                {CADENCES.map((c) => (
                  <option key={c.key} value={c.key} className="bg-[#0a1220]">
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="เวลา (Asia/Bangkok)">
              <input type="time" className="input" value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} disabled={cadence === "manual"} />
            </Field>
          </div>
          <div className="mt-3 rounded-xl border border-line bg-[#0a1220] p-3 text-[11.5px] text-txt-dim">
            <div className="mb-1 font-medium">สรุปก่อนสร้าง</div>
            <ul className="space-y-0.5 text-[11px] text-txt-mute">
              <li>• โปรเจกต์: {p.name || "—"} ({p.key || "auto"}) · {p.env}</li>
              <li>• Agent: {selectedTemplate?.name} ({selectedTemplate?.agentCount} ตัว) · {autonomy}</li>
              <li>• Flow แรก: {moduleName} · {spec.split(/\r?\n/).filter((l) => l.trim()).length} บรรทัด SPEC</li>
              <li>• ตาราง: {cadence === "manual" ? "ไม่ตั้ง (manual)" : `${cadence} ${timeOfDay}`}</li>
            </ul>
          </div>
        </Card>
      )}

      {error && <ErrBox msg={error} />}

      <div className="flex items-center justify-between">
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || busy} className="btn btn-sm">
          <ArrowLeft size={12} /> ย้อนกลับ
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[10.5px] text-txt-mute">
            ขั้น {step + 1} จาก {STEPS.length - 1}
          </span>
          {step < 3 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="btn btn-sm btn-primary">
              ถัดไป <ArrowRight size={12} />
            </button>
          ) : (
            <button onClick={finish} disabled={busy || !canNext} className="btn btn-sm btn-primary">
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Rocket size={12} />} สร้างโปรเจกต์ & เริ่มใช้งาน
            </button>
          )}
        </div>
      </div>

      <HelpCard />
    </div>
  );
}

function Tabs({ mode, setMode }: { mode: "new" | "import"; setMode: (m: "new" | "import") => void }) {
  return (
    <div className="inline-flex rounded-xl border border-line bg-[#0a1220] p-1">
      {[
        { key: "new" as const, label: "เริ่มโปรเจกต์ใหม่", icon: Rocket },
        { key: "import" as const, label: "ย้ายโปรเจกต์เดิมเข้ามา", icon: FileJson },
      ].map((t) => {
        const Icon = t.icon;
        const on = mode === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setMode(t.key)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition ${
              on ? "bg-[rgba(34,211,238,0.12)] text-cyan-glow" : "text-txt-mute hover:text-txt"
            }`}
          >
            <Icon size={12} /> {t.label}
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ErrBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-[rgba(251,113,133,0.35)] bg-[rgba(251,113,133,0.08)] px-3 py-2 text-[11.5px] text-danger">
      {msg}
    </div>
  );
}

function HelpCard() {
  return (
    <Card className="p-4">
      <SectionTitle title="ย้ายระบบทั้งชุดไปโดเมน/เซิร์ฟเวอร์ใหม่?" subtitle="ทำตาม checklist ใน docs/MOVE-PROJECT.md" icon={<Play size={15} />} />
      <ol className="mt-2 space-y-1 text-[11.5px] text-txt-dim">
        <li>1. `mysqldump` ฐาน `ai_uarea` → นำเข้าเครื่องใหม่ → ตั้ง `DB_*` ใน `.env`</li>
        <li>2. ชี้ DNS + reverse proxy ไปที่ instance ใหม่ (HTTPS) แล้วตั้ง `MCP_TOKEN` / `MNG_API_KEY` ใหม่</li>
        <li>3. แจ้ง mng.uarea.in เปลี่ยน base URL ของ webhook มายังโดเมนใหม่</li>
        <li>4. ยิง smoke test: `/api/health` → `/runs` → `/api/cron`</li>
      </ol>
    </Card>
  );
}
