"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Circle,
  CircleDashed,
  Clock,
  CloudUpload,
  Database,
  ExternalLink,
  Eye,
  Globe,
  Loader2,
  MousePointerClick,
  Play,
  RotateCw,
  ScanEye,
  Send,
  Sparkles,
  Ticket,
  XCircle,
} from "lucide-react";
import type { RunWithSteps, StepKind, StepStatus } from "@/lib/types";
import { Card, Progress, StatusPill, SectionTitle, KV } from "@/components/ui";
import { fmtDateTime, fmtDuration } from "@/lib/metrics";

const KIND_ICON: Record<StepKind, React.ElementType> = {
  navigate: Globe,
  click: MousePointerClick,
  fill: ScanEye,
  expect: Eye,
  "api.request": ArrowRight,
  "db.query": Database,
  "report.check": ScanEye,
  "ai.review": Sparkles,
  "issue.create": Ticket,
  notify: Send,
};

const STATUS_ICON: Record<StepStatus, React.ElementType> = {
  passed: CheckCircle2,
  failed: XCircle,
  running: Loader2,
  pending: Circle,
  skipped: CircleDashed,
};

const STATUS_COLOR: Record<StepStatus, string> = {
  passed: "#34d399",
  failed: "#fb7185",
  running: "#22d3ee",
  pending: "#4a5a78",
  skipped: "#64748b",
};

export default function LiveRunDetail({
  initial,
  flowName,
  projectName,
  agentName,
  agentAvatar,
  modelName,
  flowId,
  projectId,
}: {
  initial: RunWithSteps;
  flowName: string;
  projectName: string;
  agentName: string;
  agentAvatar: string;
  modelName: string;
  flowId: string;
  projectId: string;
}) {
  const router = useRouter();
  const [run, setRun] = useState<RunWithSteps>(initial);
  const [rerunning, setRerunning] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const done = run.status !== "running" && run.status !== "queued";

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/runs/${run.id}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.run) setRun(data.run);
    } catch {
      /* offline — keep last known state */
    }
  }, [run.id]);

  useEffect(() => {
    if (done) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(poll, 1500);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [done, poll]);

  useEffect(() => {
    if (done) router.refresh();
  }, [done, router]);

  const current = run.steps.find((s) => s.status === "pending");
  const pct = Math.round(((run.passed + run.failed + run.skipped) / Math.max(run.total, 1)) * 100);

  async function rerun() {
    setRerunning(true);
    const res = await fetch("/api/runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId, projectId, trigger: "manual" }),
    });
    const data = await res.json();
    setRerunning(false);
    if (data?.run?.id) router.push(`/runs/${data.run.id}`);
  }

  async function openIssue() {
    setNotice(null);
    const failed = run.steps.find((s) => s.status === "failed");
    const res = await fetch("/api/issues", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        projectId,
        runId: run.id,
        flowId,
        title: `${flowName}: ${failed?.name ?? "ผลการทดสอบไม่ผ่านเกณฑ์"}`,
        description: `Run ${run.id}\nผล: ${run.verdict}\nหลักฐาน: ${run.evidenceCount} ไฟล์\n\n${run.aiAnalysis}`,
        severity: failed?.kind === "db.query" ? "S1" : "S2",
        source: "manual",
      }),
    });
    const data = await res.json();
    if (data?.issue) {
      setNotice(`เปิด ${data.issue.key} แล้ว — ส่งต่อ Auto Fixer`);
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      {notice && (
        <div className="fade-in flex items-center gap-2 rounded-xl border border-[rgba(52,211,153,0.35)] bg-[rgba(52,211,153,0.08)] px-3 py-2 text-[12px] text-mint">
          <CheckCircle2 size={14} /> {notice}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        {/* Timeline */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="relative border-b border-line px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={run.status} />
                    <span className="font-mono text-[10.5px] text-txt-mute">{run.id}</span>
                  </div>
                  <h2 className="mt-1 text-[15px] font-semibold">{flowName}</h2>
                  <div className="mt-0.5 text-[11px] text-txt-mute">
                    {projectName} · {run.env} · {run.browser} · {run.trigger}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={rerun} disabled={rerunning} className="btn btn-sm">
                    {rerunning ? <Loader2 size={12} className="animate-spin" /> : <RotateCw size={12} />} รันซ้ำ
                  </button>
                  {!done && (
                    <button onClick={poll} className="btn btn-sm">
                      <Play size={12} /> อัปเดต
                    </button>
                  )}
                  <button onClick={openIssue} className="btn btn-sm btn-violet">
                    <Ticket size={12} /> เปิด Issue
                  </button>
                </div>
              </div>
              {!done && (
                <div className="absolute inset-x-0 bottom-0 h-[1px] overflow-hidden">
                  <div className="h-full w-1/2 scan-line" />
                </div>
              )}
            </div>

            <div className="px-4 py-3">
              <div className="flex items-center justify-between text-[11px] text-txt-mute">
                <span>
                  ความคืบหน้า {run.passed + run.failed + run.skipped}/{run.total} ขั้นตอน
                </span>
                <span>
                  ผ่าน <span className="text-mint">{run.passed}</span> · ไม่ผ่าน{" "}
                  <span className="text-danger">{run.failed}</span> · ข้าม{" "}
                  <span className="text-txt-dim">{run.skipped}</span>
                </span>
              </div>
              <div className="mt-1.5">
                <Progress value={pct} color={run.failed ? "#fb7185" : run.status === "passed" ? "#34d399" : "#22d3ee"} />
              </div>
              {current && (
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-[rgba(34,211,238,0.22)] bg-[rgba(34,211,238,0.05)] px-2.5 py-1.5 text-[11px] text-cyan-glow">
                  <Loader2 size={11} className="animate-spin" />
                  กำลังทำ: ขั้น {current.idx} — {current.name}
                </div>
              )}
            </div>

            <ol className="px-4 pb-4">
              {run.steps.map((st, i) => {
                const Icon = KIND_ICON[st.kind] ?? Circle;
                const SIcon = STATUS_ICON[st.status];
                const color = STATUS_COLOR[st.status];
                const isLast = i === run.steps.length - 1;
                return (
                  <li key={st.id} className="relative flex gap-3 pb-3">
                    {!isLast && (
                      <span
                        className="absolute left-[13px] top-7 h-[calc(100%-14px)] w-[1px]"
                        style={{ background: st.status === "passed" ? "rgba(52,211,153,0.35)" : "var(--color-line)" }}
                      />
                    )}
                    <span
                      className="relative z-10 mt-0.5 grid h-[27px] w-[27px] shrink-0 place-items-center rounded-lg border"
                      style={{ borderColor: `${color}55`, background: `${color}14`, color }}
                    >
                      <Icon size={13} />
                    </span>
                    <div className="min-w-0 flex-1 rounded-lg border border-line-soft bg-[#0a1220]/50 px-3 py-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-[12px] font-medium">
                            <span className="font-mono text-[10px] text-txt-mute">{String(st.idx).padStart(2, "0")}</span>
                            <span className={st.status === "pending" ? "text-txt-mute" : "text-txt"}>{st.name}</span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-txt-mute">{st.detail}</div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {st.durationMs > 0 && (
                            <span className="font-mono text-[10px] text-txt-mute">{fmtDuration(st.durationMs)}</span>
                          )}
                          <SIcon size={14} style={{ color }} className={st.status === "running" ? "animate-spin" : ""} />
                        </div>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="chip font-mono">{st.kind}</span>
                        {st.evidence && (
                          <span className="chip border-[rgba(34,211,238,0.25)] text-cyan-glow">
                            <Eye size={9} /> {st.evidence}
                          </span>
                        )}
                        {st.aiNote && (
                          <span className="chip border-[rgba(167,139,250,0.3)] text-[#c4b5fd]">
                            <Sparkles size={9} /> {st.aiNote}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card className="p-4">
            <SectionTitle
              title="AI วิเคราะห์ผลรอบนี้"
              subtitle="ตรวจทานหลักฐาน + เทียบกับ SPEC ก่อนสรุป"
              icon={<Sparkles size={15} />}
            />
            <p className="mt-2 text-[12.5px] leading-relaxed text-txt-dim">{run.aiAnalysis}</p>
            <div className="mt-3 rounded-lg border border-line bg-[#0a1220] p-2.5">
              <div className="label mb-1">สรุปผล</div>
              <p className="text-[12px] leading-relaxed text-txt-dim">{run.summary}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={openIssue} className="btn btn-sm">
                <Ticket size={12} /> สร้าง Ticket จากรอบนี้
              </button>
              <Link href={`/flows/${flowId}`} className="btn btn-sm">
                <ExternalLink size={12} /> ดู flow
              </Link>
              <button
                onClick={async () => {
                  await fetch("/api/sync", { method: "POST" });
                  setNotice("ส่งรายงานเข้า mng.uarea.in แล้ว");
                }}
                className="btn btn-sm"
              >
                <CloudUpload size={12} /> ส่งเข้า mng.uarea.in
              </button>
            </div>
          </Card>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <Card className="p-4">
            <SectionTitle title="รายละเอียดรอบทดสอบ" icon={<Clock size={15} />} />
            <div className="mt-2">
              <KV k="Flow" v={flowName} />
              <KV k="โปรเจกต์" v={projectName} />
              <KV
                k="Agent"
                v={
                  <span className="inline-flex items-center gap-1">
                    {agentAvatar} {agentName}
                  </span>
                }
              />
              <KV k="โมเดล" v={<span className="font-mono text-[11px]">{modelName}</span>} />
              <KV k="เบราว์เซอร์" v={run.browser} />
              <KV k="Environment" v={run.env} />
              <KV k="Trigger" v={run.trigger} />
              <KV k="Commit" v={<span className="font-mono text-[11px]">{run.commit ?? "—"}</span>} />
              <KV k="เริ่ม" v={fmtDateTime(run.startedAt)} />
              <KV k="เสร็จ" v={fmtDateTime(run.finishedAt)} />
              <KV k="ระยะเวลา" v={fmtDuration(run.durationMs)} />
              <KV k="หลักฐาน" v={`${run.evidenceCount} ไฟล์`} />
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle title="หลักฐานที่เก็บได้" subtitle="ภาพหน้าจอ · DOM snapshot · network trace" icon={<Eye size={15} />} />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {run.steps
                .filter((st) => st.evidence)
                .slice(0, 9)
                .map((st) => (
                  <div
                    key={st.id}
                    className="group relative overflow-hidden rounded-lg border border-line bg-[linear-gradient(135deg,#0d1728,#0a1220)] p-2"
                    title={st.evidence ?? ""}
                  >
                    <div className="mb-1 h-10 rounded border border-[#182338] bg-[repeating-linear-gradient(45deg,#0f1a2c,#0f1a2c_4px,#111d31_4px,#111d31_8px)]" />
                    <div className="truncate font-mono text-[8.5px] text-txt-mute">{st.evidence}</div>
                    <span
                      className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
                      style={{ background: st.status === "failed" ? "#fb7185" : "#34d399" }}
                    />
                  </div>
                ))}
              {run.evidenceCount === 0 && (
                <div className="col-span-3 rounded-lg border border-dashed border-line px-3 py-6 text-center text-[11px] text-txt-mute">
                  ยังไม่มีหลักฐาน — AI จะเก็บเมื่อเริ่มขั้นแรก
                </div>
              )}
            </div>
            <p className="mt-2 text-[10px] text-txt-mute">
              อัปโหลดอัตโนมัติเข้า Drive: <span className="font-mono">SMLAIACC/uat-evidence/{run.id}</span>
            </p>
          </Card>

          <Card className="p-4">
            <SectionTitle title="ผลรายขั้นตอน" subtitle="สรุปเชิงตัวเลข" icon={<AlertTriangle size={15} />} />
            <div className="mt-3 space-y-2">
              {(["passed", "failed", "skipped"] as StepStatus[]).map((k) => {
                const n = run.steps.filter((s) => s.status === k).length;
                return (
                  <div key={k} className="flex items-center gap-2">
                    <StatusPill status={k} />
                    <div className="flex-1">
                      <Progress value={(n / Math.max(run.total, 1)) * 100} color={STATUS_COLOR[k]} height={5} />
                    </div>
                    <span className="kpi-value w-5 text-right text-[11px] text-txt-dim">{n}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 rounded-lg border border-line bg-[#0a1220] p-2.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-txt-mute">เกณฑ์ผ่าน</span>
                <span className="text-mint">100% ของขั้นวิกฤต</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-txt-mute">ผลตัดสิน</span>
                <StatusPill status={run.status} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
