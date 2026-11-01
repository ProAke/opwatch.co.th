"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Play, Loader2 } from "lucide-react";

export default function QuickRun({
  flows,
  label = "รันเลย",
  variant = "primary",
  compact = false,
}: {
  flows: { id: string; name: string; projectId: string }[];
  label?: string;
  variant?: "primary" | "ghost" | "violet";
  compact?: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(flows[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  async function run() {
    if (!selected) return;
    const flow = flows.find((f) => f.id === selected);
    if (!flow) return;
    setBusy(true);
    try {
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ flowId: flow.id, projectId: flow.projectId, trigger: "manual" }),
      });
      const data = await res.json();
      if (data?.run?.id) {
        startTransition(() => router.push(`/runs/${data.run.id}`));
      } else {
        setBusy(false);
      }
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "rounded-xl border border-line bg-[#0a1220] p-1.5"}`}>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="input max-w-[240px] border-0 bg-transparent text-[12px]"
      >
        {flows.map((f) => (
          <option key={f.id} value={f.id} className="bg-[#0a1220]">
            {f.name}
          </option>
        ))}
      </select>
      <button
        onClick={run}
        disabled={busy || !selected}
        className={`btn btn-sm ${variant === "primary" ? "btn-primary" : variant === "violet" ? "btn-violet" : ""}`}
      >
        {busy ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
        {busy ? "กำลังเริ่ม…" : label}
      </button>
    </div>
  );
}
