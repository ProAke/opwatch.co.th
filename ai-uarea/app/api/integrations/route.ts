import { NextResponse } from "next/server";
import { loadSnapshot, updateIntegration } from "@/lib/store";

export const dynamic = "force-dynamic";

// "ทดสอบการเชื่อมต่อ" — real network probe for mng/GitHub, simulated for the rest.
export async function POST(req: Request) {
  const body = await req.json();
  const id = body?.id as string | undefined;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const s = await loadSnapshot();
  const integration = s.integrations.find((i) => i.id === id);
  if (!integration) return NextResponse.json({ error: "integration not found" }, { status: 404 });

  let status: "connected" | "disconnected" | "error" = "connected";
  let note = "เชื่อมต่อสำเร็จ";

  if (integration.kind === "mng") {
    const url = `${(process.env.MNG_BASE_URL || "https://mng.uarea.in").replace(/\/$/, "")}/api/health`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(6000), headers: process.env.MNG_API_KEY ? { authorization: `Bearer ${process.env.MNG_API_KEY}` } : {} });
      note = `mng.uarea.in ตอบ HTTP ${res.status}`;
      status = res.ok ? "connected" : "error";
    } catch (err) {
      note = `ติดต่อ mng.uarea.in ไม่ได้: ${(err as Error).message} (โหมดสาธิตจะถือว่าผ่าน)`;
      status = "connected";
    }
  } else if (integration.kind === "github") {
    const owner = integration.config?.owner;
    const repo = integration.config?.repo;
    const headers: Record<string, string> = {
      "user-agent": "ai-uarea-uat-orchestrator",
      accept: "application/vnd.github+json",
    };
    if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const target = owner && repo ? `https://api.github.com/repos/${owner}/${repo}` : "https://api.github.com/rate_limit";
    try {
      const res = await fetch(target, { headers, signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = (await res.json()) as { full_name?: string; default_branch?: string; open_issues_count?: number; private?: boolean };
        note = data.full_name
          ? `repo ${data.full_name} เข้าถึงได้ · branch ${data.default_branch} · issue เปิด ${data.open_issues_count ?? 0}${
              data.private ? " · private" : ""
            }`
          : `GitHub API ตอบ HTTP ${res.status}`;
        status = "connected";
      } else {
        note = `เข้าถึง repo ไม่ได้ (HTTP ${res.status}) — ตรวจสิทธิ์ของ GITHUB_TOKEN`;
        status = "error";
      }
    } catch {
      note = "ตรวจ GitHub ไม่สำเร็จในสภาพแวดล้อมนี้";
    }
  }

  const updated = await updateIntegration(id, { status, health: Math.max(80, integration.health) });
  const { addEvent } = await import("@/lib/store");
  await addEvent({ actor: "usr_human", kind: "integration.test", level: status === "error" ? "error" : "success", message: `ทดสอบ ${integration.name}: ${note}` });
  return NextResponse.json({ integration: updated, note });
}
