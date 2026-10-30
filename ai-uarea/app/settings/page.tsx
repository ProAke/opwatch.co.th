import { Database, KeyRound, Server, Settings2, Users } from "lucide-react";
import { loadSnapshot, storageMode } from "@/lib/store";
import { Card, KV, SectionTitle, StatusPill } from "@/components/ui";
import PolicyEditor from "@/components/PolicyEditor";
import { fmtDateTime } from "@/lib/metrics";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  owner: "เจ้าของ",
  admin: "ผู้ดูแล",
  tester: "ผู้ทดสอบ",
  viewer: "ผู้ชม",
  ai_agent: "AI service",
};

export default async function SettingsPage() {
  const s = await loadSnapshot();
  const mode = storageMode();
  const envs = [
    "ANTHROPIC_API_KEY",
    "OPENAI_API_KEY",
    "GEMINI_API_KEY",
    "ZHIPU_API_KEY",
    "DEEPSEEK_API_KEY",
    "OLLAMA_API_KEY",
    "GITHUB_TOKEN",
    "GOOGLE_DRIVE_FOLDER_ID",
    "MNG_API_KEY",
    "MCP_TOKEN",
    "SESSION_SECRET",
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="label mb-1">Policies & platform</div>
        <h1 className="text-[22px] font-semibold tracking-tight">นโยบาย & ตั้งค่า</h1>
        <p className="mt-1 max-w-3xl text-[12.5px] text-txt-mute">
          นโยบายคือสิ่งที่ทำให้ “Zero Touch” ปลอดภัย — กำหนดว่า AI เปิด Issue เองได้แค่ไหน แก้โค้ดได้ไหม และเข้าถึงข้อมูลอะไรได้
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <PolicyEditor policies={s.policies} />
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <SectionTitle title="สถานะแพลตฟอร์ม" icon={<Server size={15} />} />
            <div className="mt-2">
              <KV k="โหมดจัดเก็บ" v={mode === "mariadb" ? "MariaDB (persistent)" : "Demo (in-memory)"} />
              <KV k="ฐานข้อมูล" v={<span className="font-mono">{process.env.DB_NAME || "ai_uarea"}</span>} />
              <KV k="โฮสต์" v={<span className="font-mono">{process.env.DB_HOST || "—"}</span>} />
              <KV k="Runtime" v="Next.js 15 · Node 22" />
              <KV k="โซนเวลา" v="Asia/Bangkok (ICT)" />
              <KV k="URL" v={<span className="font-mono">ai.uarea.in</span>} />
              <KV k="ระบบหลัก" v={<a className="font-mono text-cyan-glow" href="https://mng.uarea.in">mng.uarea.in</a>} />
            </div>
            {mode === "demo" && (
              <div className="mt-2 rounded-lg border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.07)] px-2.5 py-2 text-[10.5px] leading-relaxed text-[#fbbf24]">
                กำลังใช้ชุดข้อมูลสาธิต — ตั้งค่า <span className="font-mono">DB_HOST / DB_NAME / DB_USER / DB_PASSWORD</span>{" "}
                แล้วรัน <span className="font-mono">npm run db:migrate</span> เพื่อใช้ MariaDB จริง
              </div>
            )}
          </Card>

          <Card className="p-4">
            <SectionTitle title="กุญแจ & ความลับ" subtitle="อ่านจาก environment เท่านั้น ไม่เก็บในฐานข้อมูล" icon={<KeyRound size={15} />} />
            <div className="mt-2 space-y-1">
              {envs.map((e) => {
                const on = Boolean(process.env[e]);
                return (
                  <div key={e} className="flex items-center justify-between gap-2 rounded-lg border border-line bg-[#0a1220]/70 px-2 py-1">
                    <span className="font-mono text-[10px] text-txt-dim">{e}</span>
                    <span className={`text-[9.5px] font-semibold ${on ? "text-mint" : "text-txt-mute"}`}>{on ? "ตั้งแล้ว" : "—"}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle title="ผู้ใช้ & สิทธิ์" icon={<Users size={15} />} />
            <div className="mt-2 space-y-1.5">
              {s.users.map((u) => (
                <div key={u.id} className="flex items-center gap-2 rounded-lg border border-line bg-[#0a1220]/70 px-2 py-1.5">
                  <span className="grid h-6 w-6 place-items-center rounded-md border border-line bg-[#0f1a2c] text-[11px]">{u.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-medium">{u.name}</div>
                    <div className="truncate font-mono text-[9px] text-txt-mute">{u.email}</div>
                  </div>
                  <span className="chip py-0 text-[9px]">{ROLE_LABEL[u.role]}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-[9.5px] text-txt-mute">
              เข้าสู่ระบบล่าสุด:{" "}
              {fmtDateTime(
                s.users
                  .map((u) => u.lastLoginAt)
                  .filter((x): x is string => Boolean(x))
                  .sort()
                  .at(-1) ?? null,
              )}
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle title="โครงสร้างฐานข้อมูล" subtitle="MariaDB · 13 ตาราง" icon={<Database size={15} />} />
            <div className="mt-2 grid grid-cols-2 gap-1 font-mono text-[9.5px] text-txt-mute">
              {[
                "projects", "ai_models", "agents", "flows", "runs", "run_steps",
                "issues", "schedules", "events", "docs", "integrations", "policies", "users",
              ].map((t) => (
                <div key={t} className="flex items-center gap-1 rounded border border-line bg-[#0a1220]/60 px-1.5 py-1">
                  <Settings2 size={8} /> {t}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle title="มาตรฐานคุณภาพที่บังคับใช้" />
            <div className="mt-2 space-y-1.5">
              {[
                "ห้ามรันกับฐานข้อมูล production โดยไม่ได้รับอนุมัติ",
                "ทุก run ต้องมี commit hash และหลักฐานขั้นต่ำ 1 ไฟล์/ขั้น",
                "ห้าม AI merge PR เอง — ต้องมีคนรีวิวเสมอ",
                "ข้อมูลส่วนบุคคลในหลักฐานต้องถูกมาสก์ก่อนอัปโหลด",
                "S1 ต้องแจ้ง Slack และ mng.uarea.in ภายใน 60 วินาที",
              ].map((x) => (
                <div key={x} className="flex items-start gap-1.5 text-[10.5px] text-txt-dim">
                  <StatusPill status="active" dot={false} className="mt-[1px] scale-90" />
                  <span>{x}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
