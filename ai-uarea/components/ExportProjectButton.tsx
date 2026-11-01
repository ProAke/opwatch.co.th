"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export default function ExportProjectButton({ projectId, keyName }: { projectId: string; keyName: string }) {
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/export?download=1`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${keyName.toLowerCase()}-project-bundle.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={download} disabled={busy} className="btn btn-sm" title="ดาวน์โหลด bundle เพื่อย้ายไประบบอื่น">
      {busy ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} ส่งออก bundle
    </button>
  );
}
