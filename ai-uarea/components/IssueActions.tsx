"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCheck, Loader2, RotateCw, Wrench } from "lucide-react";

export default function IssueActions({
  issueId,
  flowId,
  projectId,
  status,
  hasBranch,
}: {
  issueId: string;
  flowId: string | null;
  projectId: string;
  status: string;
  hasBranch: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>, label: string) {
    setBusy(label);
    const res = await fetch(`/api/issues/${issueId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(null);
    if (res.ok) {
      setNotice("อัปเดตแล้ว");
      router.refresh();
    }
  }

  async function startFix() {
    const branch = `fix/${issueId.replace("iss_", "uat-")}`;
    await patch({ status: "fixing", fixBranch: branch, assignee: "Auto Fixer (Claude Code)" }, "fix");
    setNotice(`Auto Fixer รับงานแล้ว — branch ${branch} (จะเปิด PR เมื่อแก้เสร็จ)`);
  }

  async function recheck() {
    if (!flowId) return;
    setBusy("recheck");
    const res = await fetch("/api/runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId, projectId, trigger: "fix_recheck" }),
    });
    const data = await res.json();
    if (data?.run?.id) {
      await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "in_review", recheckRunId: data.run.id }),
      });
      router.push(`/runs/${data.run.id}`);
    } else {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button onClick={startFix} disabled={busy !== null || status === "closed"} className="btn btn-sm btn-violet">
          {busy === "fix" ? <Loader2 size={12} className="animate-spin" /> : <Wrench size={12} />}
          {hasBranch ? "มอบหมาย Auto Fixer อีกครั้ง" : "ให้ Auto Fixer แก้"}
        </button>
        <button onClick={recheck} disabled={busy !== null || !flowId} className="btn btn-sm btn-primary">
          {busy === "recheck" ? <Loader2 size={12} className="animate-spin" /> : <RotateCw size={12} />} สั่งตรวจซ้ำ
        </button>
        <button onClick={() => patch({ status: "closed" }, "close")} disabled={busy !== null || status === "closed"} className="btn btn-sm">
          {busy === "close" ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={12} />} ปิด Issue
        </button>
      </div>
      {notice && <div className="rounded-lg border border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.07)] px-2.5 py-1.5 text-[11px] text-mint">{notice}</div>}
    </div>
  );
}
