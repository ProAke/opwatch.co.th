import Link from "next/link";
import { Bot, Filter, ShieldAlert, Ticket, Timer, Wrench } from "lucide-react";
import { loadSnapshot } from "@/lib/store";
import { relTime } from "@/lib/metrics";
import { Card, EmptyState, Metric, SectionTitle, SeverityTag, StatusPill } from "@/components/ui";

export const dynamic = "force-dynamic";

const STATES = [
  { key: "all", label: "ทั้งหมด" },
  { key: "open", label: "เปิดใหม่" },
  { key: "triaged", label: "คัดกรอง" },
  { key: "fixing", label: "กำลังแก้" },
  { key: "in_review", label: "รอตรวจซ้ำ" },
  { key: "closed", label: "ปิดแล้ว" },
];

export default async function IssuesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; project?: string; sev?: string }>;
}) {
  const sp = await searchParams;
  const s = await loadSnapshot();
  const statusFilter = sp.status ?? "all";
  const projectFilter = sp.project ?? "all";
  const sevFilter = sp.sev ?? "all";

  const issues = s.issues
    .filter((i) => (statusFilter === "all" ? true : statusFilter === "closed" ? ["closed", "wontfix"].includes(i.status) : i.status === statusFilter))
    .filter((i) => (projectFilter === "all" ? true : i.projectId === projectFilter))
    .filter((i) => (sevFilter === "all" ? true : i.severity === sevFilter));

  const open = s.issues.filter((i) => !["closed", "wontfix"].includes(i.status));
  const href = (patch: Record<string, string>) => {
    const merged = { status: statusFilter, project: projectFilter, sev: sevFilter, ...patch };
    const u = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => v !== "all" && u.set(k, v));
    const qs = u.toString();
    return `/issues${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label mb-1">IssueMate</div>
          <h1 className="text-[22px] font-semibold tracking-tight">Issue / Ticket</h1>
          <p className="mt-1 max-w-2xl text-[12.5px] text-txt-mute">
            ทุก Ticket ถูกสร้างพร้อมหลักฐานและขั้นตอนทำซ้ำ — AI แก้บน branch แยก เปิด PR แล้วส่งกลับเข้าคิวตรวจซ้ำอัตโนมัติ
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/mcp" className="btn btn-sm">
            <Ticket size={12} /> เปิดผ่าน MCP
          </Link>
          <Link href="/runs" className="btn btn-sm btn-primary">
            ไปตรวจซ้ำ
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="ค้างทั้งหมด" value={open.length} accent="#fb7185" icon={<ShieldAlert size={15} />} hint={`S1 ${open.filter((i) => i.severity === "S1").length} · S2 ${open.filter((i) => i.severity === "S2").length}`} />
        <Metric label="กำลังแก้ (AI)" value={s.issues.filter((i) => i.status === "fixing").length} accent="#a78bfa" icon={<Wrench size={15} />} hint={`${s.issues.filter((i) => i.fixBranch).length} branch ที่เปิดอยู่`} />
        <Metric label="รอตรวจซ้ำ" value={s.issues.filter((i) => i.status === "in_review").length} accent="#22d3ee" icon={<Timer size={15} />} hint="จะถูกตรวจอัตโนมัติเมื่อ PR เปิด" />
        <Metric
          label="ปิดแล้ว"
          value={s.issues.filter((i) => i.status === "closed").length}
          accent="#34d399"
          icon={<Bot size={15} />}
          hint={`ตรวจซ้ำผ่าน ${s.issues.filter((i) => i.recheckRunId).length} รายการ`}
        />
      </div>

      <Card className="flex flex-wrap items-center gap-2 p-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-txt-mute">
          <Filter size={12} /> สถานะ
        </span>
        {STATES.map((st) => (
          <Link key={st.key} href={href({ status: st.key })} className={`chip ${statusFilter === st.key ? "border-[rgba(34,211,238,0.45)] text-cyan-glow" : ""}`}>
            {st.label}
          </Link>
        ))}
        <span className="mx-1 h-4 w-[1px] bg-line" />
        <span className="text-[11px] text-txt-mute">ความรุนแรง</span>
        {["all", "S1", "S2", "S3", "S4"].map((sv) => (
          <Link key={sv} href={href({ sev: sv })} className={`chip ${sevFilter === sv ? "border-[rgba(34,211,238,0.45)] text-cyan-glow" : ""}`}>
            {sv === "all" ? "ทุกระดับ" : sv}
          </Link>
        ))}
        <span className="mx-1 h-4 w-[1px] bg-line" />
        <Link href={href({ project: "all" })} className={`chip ${projectFilter === "all" ? "border-[rgba(34,211,238,0.45)] text-cyan-glow" : ""}`}>
          ทุกโปรเจกต์
        </Link>
        {s.projects.map((p) => (
          <Link key={p.id} href={href({ project: p.id })} className={`chip ${projectFilter === p.id ? "border-[rgba(34,211,238,0.45)] text-cyan-glow" : ""}`}>
            {p.key}
          </Link>
        ))}
      </Card>

      <Card className="overflow-hidden">
        <div className="px-4 pt-4">
          <SectionTitle title={`Ticket (${issues.length})`} subtitle="เรียงจากใหม่ไปเก่า · คลิกเพื่อดูรายละเอียดและสั่งแก้" icon={<Ticket size={15} />} />
        </div>
        {issues.length === 0 ? (
          <div className="p-4">
            <EmptyState title="ไม่มี Ticket ตามตัวกรองนี้" hint="ลองเปลี่ยนสถานะหรือระดับความรุนแรง" />
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[940px]">
              <thead>
                <tr>
                  <th className="table-th">คีย์</th>
                  <th className="table-th">หัวข้อ</th>
                  <th className="table-th">ระดับ</th>
                  <th className="table-th">สถานะ</th>
                  <th className="table-th">ผู้รับผิดชอบ</th>
                  <th className="table-th">ที่มา</th>
                  <th className="table-th">Auto Fix</th>
                  <th className="table-th">อัปเดต</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((i) => {
                  const project = s.projects.find((p) => p.id === i.projectId);
                  return (
                    <tr key={i.id} className="transition hover:bg-[#0c1626]/70">
                      <td className="table-td">
                        <Link href={`/issues/${i.id}`} className="font-mono text-[11px] font-semibold text-cyan-glow hover:underline">
                          {i.key}
                        </Link>
                        <div className="font-mono text-[9.5px] text-txt-mute">{project?.key}</div>
                      </td>
                      <td className="table-td max-w-[330px]">
                        <Link href={`/issues/${i.id}`} className="line-clamp-1 text-[12px] font-medium hover:text-cyan-glow">
                          {i.title}
                        </Link>
                        <div className="mt-0.5 flex gap-1">
                          {i.labels.slice(0, 3).map((l) => (
                            <span key={l} className="chip py-0 text-[9px]">
                              {l}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="table-td">
                        <SeverityTag severity={i.severity} />
                      </td>
                      <td className="table-td">
                        <StatusPill status={i.status} dot={false} />
                      </td>
                      <td className="table-td text-[11px] text-txt-dim">{i.assignee}</td>
                      <td className="table-td">
                        <span className="chip py-0 font-mono text-[9.5px]">{i.source}</span>
                      </td>
                      <td className="table-td">
                        {i.fixBranch ? (
                          <span className="chip border-[rgba(167,139,250,0.35)] py-0 font-mono text-[9px] text-[#c4b5fd]">{i.fixBranch}</span>
                        ) : (
                          <span className="text-[10.5px] text-txt-mute">—</span>
                        )}
                        {i.fixPrUrl && <div className="mt-0.5 text-[9px] text-mint">PR เปิดแล้ว</div>}
                      </td>
                      <td className="table-td text-[10.5px] text-txt-mute">{relTime(i.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
