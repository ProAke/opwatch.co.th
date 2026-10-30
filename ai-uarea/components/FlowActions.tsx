"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Pencil, Play, Trash2 } from "lucide-react";

export default function FlowActions({ flowId, projectId }: { flowId: string; projectId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"run" | "delete" | null>(null);

  async function run() {
    setBusy("run");
    const res = await fetch("/api/runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId, projectId, trigger: "manual" }),
    });
    const data = await res.json();
    setBusy(null);
    if (data?.run?.id) router.push(`/runs/${data.run.id}`);
  }

  async function remove() {
    if (!confirm("ลบ flow นี้และตารางที่ผูกอยู่ทั้งหมด?")) return;
    setBusy("delete");
    await fetch(`/api/flows/${flowId}`, { method: "DELETE" });
    setBusy(null);
    router.push("/flows");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={run} disabled={busy !== null} className="btn btn-sm btn-primary">
        {busy === "run" ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} รันเดี๋ยวนี้
      </button>
      <a href={`/flows/${flowId}/edit`} className="btn btn-sm">
        <Pencil size={12} /> แก้ไข
      </a>
      <button onClick={remove} disabled={busy !== null} className="btn btn-sm text-danger">
        {busy === "delete" ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
      </button>
    </div>
  );
}
