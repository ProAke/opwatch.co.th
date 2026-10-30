"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CloudUpload,
  Database,
  FolderGit2,
  HardDrive,
  Loader2,
  Plug,
  RefreshCw,
  Slack,
  Terminal,
} from "lucide-react";
import type { Integration } from "@/lib/types";
import { Card, Progress, SectionTitle, StatusPill } from "@/components/ui";
import { relTime } from "@/lib/metrics";

const META: Record<string, { icon: React.ElementType; color: string }> = {
  github: { icon: FolderGit2, color: "#e2e8f0" },
  drive: { icon: HardDrive, color: "#34d399" },
  mng: { icon: CloudUpload, color: "#22d3ee" },
  slack: { icon: Slack, color: "#a78bfa" },
  mcp_client: { icon: Terminal, color: "#fbbf24" },
};

export default function IntegrationCards({ integrations }: { integrations: Integration[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function test(id: string) {
    setBusy(id);
    const res = await fetch("/api/integrations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    setBusy(null);
    setNotes((n) => ({ ...n, [id]: data?.note ?? "ตรวจสอบแล้ว" }));
    router.refresh();
  }

  async function sync() {
    setBusy("sync");
    const res = await fetch("/api/sync", { method: "POST" });
    const data = await res.json();
    setBusy(null);
    setNotes((n) => ({ ...n, int_mng: `ซิงก์แล้ว — ${data.note}` }));
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label mb-1">Connections</div>
          <h1 className="text-[22px] font-semibold tracking-tight">การเชื่อมต่อระบบภายนอก</h1>
          <p className="mt-1 max-w-3xl text-[12.5px] text-txt-mute">
            GitHub สำหรับ Issue/PR · Google Drive สำหรับหลักฐาน · mng.uarea.in สำหรับรายงาน และ MCP สำหรับให้ AI ภายนอกสั่งงาน
          </p>
        </div>
        <button onClick={sync} disabled={busy !== null} className="btn btn-primary btn-sm">
          {busy === "sync" ? <Loader2 size={12} className="animate-spin" /> : <CloudUpload size={12} />} ซิงก์เข้า mng.uarea.in
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((int) => {
          const meta = META[int.kind] ?? { icon: Plug, color: "#22d3ee" };
          const Icon = meta.icon;
          return (
            <Card key={int.id} hover className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-[#0f1a2c]" style={{ color: meta.color }}>
                    <Icon size={16} />
                  </span>
                  <div>
                    <div className="text-[13px] font-semibold">{int.name}</div>
                    <div className="font-mono text-[9.5px] text-txt-mute">{int.kind}</div>
                  </div>
                </div>
                <StatusPill status={int.status} dot={false} />
              </div>

              <p className="mt-2 text-[11.5px] leading-relaxed text-txt-mute">{int.description}</p>

              <div className="mt-2 rounded-lg border border-line bg-[#0a1220] px-2.5 py-1.5">
                <div className="label text-[9px]">บัญชี / ปลายทาง</div>
                <div className="truncate font-mono text-[10px] text-txt-dim">{int.account}</div>
              </div>

              <div className="mt-2 space-y-1">
                {Object.entries(int.config).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-2 text-[10px]">
                    <span className="text-txt-mute">{k}</span>
                    <span className="truncate font-mono text-txt-dim">{v}</span>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex items-center gap-2">
                <Progress value={int.health} color={int.health >= 95 ? "#34d399" : "#fbbf24"} height={4} />
                <span className="kpi-value text-[10px] text-txt-dim">{int.health}%</span>
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-line-soft pt-2">
                <span className="text-[9.5px] text-txt-mute">ซิงก์ล่าสุด {relTime(int.lastSyncAt)}</span>
                <button onClick={() => test(int.id)} disabled={busy !== null} className="btn btn-sm">
                  {busy === int.id ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />} ทดสอบ
                </button>
              </div>
              {notes[int.id] && (
                <div className="mt-2 rounded-lg border border-[rgba(34,211,238,0.25)] bg-[rgba(34,211,238,0.06)] px-2 py-1 text-[10px] text-cyan-glow">
                  {notes[int.id]}
                </div>
              )}
            </Card>
          );
        })}

        <Card className="border-dashed p-4">
          <SectionTitle title="เชื่อมต่อเพิ่ม" subtitle="ตั้งค่าใน .env แล้วระบบจะแสดงที่นี่" icon={<Database size={15} />} />
          <div className="mt-3 space-y-1.5 font-mono text-[10px] text-txt-mute">
            <div>GITHUB_TOKEN / GITHUB_OWNER</div>
            <div>GOOGLE_DRIVE_FOLDER_ID</div>
            <div>MNG_BASE_URL / MNG_API_KEY</div>
            <div>SLACK_WEBHOOK_URL</div>
            <div>MCP_TOKEN</div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <SectionTitle title="สัญญาการเชื่อมต่อกับ mng.uarea.in" subtitle="ระบบหลักรับข้อมูลจาก ai.uarea.in ผ่าน REST + webhook" icon={<CloudUpload size={15} />} />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-line bg-[#080f1c] p-3">
            <div className="label mb-1">POST /api/uat/report</div>
            <pre className="overflow-x-auto font-mono text-[10px] leading-relaxed text-txt-dim">{`{
  "workspace": "uarea",
  "generatedAt": "2026-10-30T04:00:00Z",
  "projects": [
    { "key": "SMLAIACC", "passRate": 91, "openIssues": 4 }
  ],
  "latestRuns": [
    { "id": "run_0042", "flowId": "flw_tax", "status": "failed" }
  ]
}`}</pre>
          </div>
          <div className="rounded-xl border border-line bg-[#080f1c] p-3">
            <div className="label mb-1">Webhook ฝั่ง mng → ai</div>
            <pre className="overflow-x-auto font-mono text-[10px] leading-relaxed text-txt-dim">{`POST https://ai.uarea.in/api/mcp
Authorization: Bearer $MCP_TOKEN

{ "tool": "run.create",
  "arguments": { "flowId": "flw_tax" } }`}</pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
