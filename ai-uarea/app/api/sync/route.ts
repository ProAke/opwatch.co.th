import { NextResponse } from "next/server";
import { addEvent, loadSnapshot, updateIntegration } from "@/lib/store";

export const dynamic = "force-dynamic";

// Manual "push everything to mng.uarea.in" — the same payload the scheduler sends.
export async function POST() {
  const s = await loadSnapshot();
  const base = (process.env.MNG_BASE_URL || "https://mng.uarea.in").replace(/\/$/, "");
  const payload = {
    workspace: "uarea",
    generatedAt: new Date().toISOString(),
    projects: s.projects.map((p) => ({
      key: p.key,
      name: p.name,
      passRate: (() => {
        const runs = s.runs.filter((r) => r.projectId === p.id && ["passed", "failed"].includes(r.status));
        return runs.length ? Math.round((runs.filter((r) => r.status === "passed").length / runs.length) * 100) : null;
      })(),
      openIssues: s.issues.filter((i) => i.projectId === p.id && !["closed", "wontfix"].includes(i.status)).length,
    })),
    latestRuns: s.runs.slice(0, 10).map((r) => ({ id: r.id, flowId: r.flowId, status: r.status, verdict: r.verdict })),
  };

  let sent = false;
  let note = "โหมดสาธิต: บันทึกเหตุการณ์ไว้ในระบบ (ตั้ง MNG_API_KEY เพื่อยิงจริง)";
  if (process.env.MNG_API_KEY) {
    try {
      const res = await fetch(`${base}/api/uat/report`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${process.env.MNG_API_KEY}` },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });
      sent = res.ok;
      note = `HTTP ${res.status}`;
    } catch (err) {
      note = (err as Error).message;
    }
  }
  await updateIntegration("int_mng", { status: sent || !process.env.MNG_API_KEY ? "connected" : "error" });
  await addEvent({
    actor: "agt_orch",
    kind: "report.pushed",
    level: "success",
    message: `ส่งสรุปสถานะทั้ง workspace ไป ${base} — ${note}`,
  });
  return NextResponse.json({ ok: true, sent, note, payload });
}
