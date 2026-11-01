import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink, GitBranch, GitPullRequest, History, Sparkles } from "lucide-react";
import { loadSnapshot } from "@/lib/store";
import { fmtDateTime, relTime } from "@/lib/metrics";
import { Card, KV, SectionTitle, SeverityTag, StatusPill } from "@/components/ui";
import IssueActions from "@/components/IssueActions";

export const dynamic = "force-dynamic";

export default async function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await loadSnapshot();
  const issue = s.issues.find((i) => i.id === id);
  if (!issue) notFound();
  const project = s.projects.find((p) => p.id === issue.projectId);
  const flow = s.flows.find((f) => f.id === issue.flowId);
  const run = s.runs.find((r) => r.id === issue.runId);
  const recheck = s.runs.find((r) => r.id === issue.recheckRunId);
  const timeline = s.events.filter((e) => e.issueId === issue.id);

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-2 text-[11.5px] text-txt-mute">
        <Link href="/issues" className="inline-flex items-center gap-1 hover:text-cyan-glow">
          <ChevronLeft size={13} /> Issue / Ticket
        </Link>
        <span>/</span>
        <span className="font-mono text-txt-dim">{issue.key}</span>
      </nav>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-cyan-glow">{issue.key}</span>
              <SeverityTag severity={issue.severity} />
              <StatusPill status={issue.status} />
              <span className="chip py-0 font-mono text-[9.5px]">{issue.source}</span>
              <span className="ml-auto text-[10.5px] text-txt-mute">อัปเดต {relTime(issue.updatedAt)}</span>
            </div>
            <h1 className="mt-2 text-[19px] font-semibold leading-snug">{issue.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10.5px] text-txt-mute">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: project?.color }} />
              {project?.name}
              {flow && (
                <>
                  <span>·</span>
                  <Link href={`/flows/${flow.id}`} className="hover:text-cyan-glow">
                    {flow.name}
                  </Link>
                </>
              )}
              {run && (
                <>
                  <span>·</span>
                  <Link href={`/runs/${run.id}`} className="font-mono hover:text-cyan-glow">
                    {run.id}
                  </Link>
                </>
              )}
            </div>

            <div className="mt-3 rounded-xl border border-line bg-[#0a1220] p-3">
              <div className="label mb-1">รายละเอียด / ขั้นตอนทำซ้ำ</div>
              <pre className="whitespace-pre-wrap font-sans text-[12px] leading-relaxed text-txt-dim">{issue.description}</pre>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {issue.labels.map((l) => (
                <span key={l} className="chip">
                  #{l}
                </span>
              ))}
            </div>

            <div className="mt-4 border-t border-line pt-3">
              <IssueActions
                issueId={issue.id}
                flowId={issue.flowId}
                projectId={issue.projectId}
                status={issue.status}
                hasBranch={Boolean(issue.fixBranch)}
              />
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle title="ไทม์ไลน์ของ Ticket" subtitle="ทุกการกระทำของคนและ AI" icon={<History size={15} />} />
            <div className="mt-3 space-y-0">
              {timeline.length === 0 && <div className="text-[11.5px] text-txt-mute">ยังไม่มีเหตุการณ์</div>}
              {timeline.map((ev, i) => {
                const color = ev.level === "error" ? "#fb7185" : ev.level === "warn" ? "#fbbf24" : ev.level === "success" ? "#34d399" : "#7dd3fc";
                return (
                  <div key={ev.id} className="relative flex gap-2.5 pb-3">
                    {i < timeline.length - 1 && <span className="absolute left-[4.5px] top-3 h-full w-[1px] bg-line" />}
                    <span className="relative mt-[5px] h-[9px] w-[9px] shrink-0 rounded-full border-2" style={{ borderColor: color, background: "#070c17" }} />
                    <div>
                      <div className="text-[11.5px] text-txt-dim">{ev.message}</div>
                      <div className="font-mono text-[9.5px] text-txt-mute">
                        {ev.actor} · {fmtDateTime(ev.createdAt)} · {relTime(ev.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <SectionTitle title="ข้อมูล Ticket" />
            <div className="mt-2">
              <KV k="ผู้รับผิดชอบ" v={issue.assignee} />
              <KV k="Agent" v={s.agents.find((a) => a.id === issue.agentId)?.name ?? "—"} />
              <KV k="เปิดเมื่อ" v={fmtDateTime(issue.createdAt)} />
              <KV k="ปิดเมื่อ" v={issue.closedAt ? fmtDateTime(issue.closedAt) : "—"} />
              <KV k="Run ต้นทาง" v={run ? <Link className="font-mono text-cyan-glow" href={`/runs/${run.id}`}>{run.id}</Link> : "—"} />
              <KV k="Run ตรวจซ้ำ" v={recheck ? <Link className="font-mono text-cyan-glow" href={`/runs/${recheck.id}`}>{recheck.id}</Link> : "ยังไม่มี"} />
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle title="การแก้ไขอัตโนมัติ" subtitle="Auto Fixer ทำงานบน branch แยกเสมอ" icon={<GitBranch size={15} />} />
            <div className="mt-3 space-y-2">
              <div className="rounded-lg border border-line bg-[#0a1220] p-2.5">
                <div className="label">Branch</div>
                <div className="mt-0.5 font-mono text-[11px] text-[#c4b5fd]">{issue.fixBranch ?? "ยังไม่เริ่ม"}</div>
              </div>
              <div className="rounded-lg border border-line bg-[#0a1220] p-2.5">
                <div className="label">Pull request</div>
                <div className="mt-0.5 font-mono text-[11px] text-mint">
                  {issue.fixPrUrl ? (
                    <a href={issue.fixPrUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                      {issue.fixPrUrl.replace("https://github.com/", "")} <ExternalLink size={10} />
                    </a>
                  ) : (
                    "ยังไม่เปิด PR"
                  )}
                </div>
              </div>
              {issue.githubUrl && (
                <a href={issue.githubUrl} target="_blank" rel="noreferrer" className="btn btn-sm w-full">
                  <GitPullRequest size={12} /> ดูบน GitHub
                </a>
              )}
            </div>
          </Card>

          {run && (
            <Card className="p-4">
              <SectionTitle title="หลักฐานจากรอบที่พบ" icon={<Sparkles size={15} />} />
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-txt-mute">ผลรวม</span>
                  <StatusPill status={run.status} />
                </div>
                <div className="text-[11.5px] leading-relaxed text-txt-dim">{run.verdict}</div>
                <div className="flex items-center justify-between text-[10.5px] text-txt-mute">
                  <span>หลักฐาน {run.evidenceCount} ไฟล์</span>
                  <Link href={`/runs/${run.id}`} className="font-semibold text-cyan-glow hover:underline">
                    เปิดดู run
                  </Link>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-4">
            <SectionTitle title="ผลกระทบต่อคุณภาพ" />
            <div className="mt-2 space-y-1.5 text-[11.5px]">
              <div className="flex items-center justify-between">
                <span className="text-txt-mute">ระดับความรุนแรง</span>
                <SeverityTag severity={issue.severity} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-txt-mute">ต้องแก้ก่อนปล่อย</span>
                <span className={["S1", "S2"].includes(issue.severity) ? "text-danger" : "text-txt-dim"}>
                  {["S1", "S2"].includes(issue.severity) ? "ใช่" : "ไม่บังคับ"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-txt-mute">SLA ตรวจซ้ำ</span>
                <span className="font-mono text-txt-dim">≤ 15 นาทีหลัง PR เปิด</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
