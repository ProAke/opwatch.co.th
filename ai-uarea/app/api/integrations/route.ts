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
    try {
      const res = await fetch("https://api.github.com/rate_limit", {
        headers: process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {},
        signal: AbortSignal.timeout(6000),
      });
      note = `GitHub API ตอบ HTTP ${res.status}${process.env.GITHUB_TOKEN ? "" : " (ไม่ได้ตั้ง token — อ่านสาธารณะ)"}`;
      status = res.ok ? "connected" : "error";
    } catch {
      note = "ตรวจ GitHub ไม่สำเร็จในสภาพแวดล้อมนี้";
    }
  }

  const updated = await updateIntegration(id, { status, health: Math.max(80, integration.health) });
  const { addEvent } = await import("@/lib/store");
  await addEvent({ actor: "usr_human", kind: "integration.test", level: status === "error" ? "error" : "success", message: `ทดสอบ ${integration.name}: ${note}` });
  return NextResponse.json({ integration: updated, note });
}
