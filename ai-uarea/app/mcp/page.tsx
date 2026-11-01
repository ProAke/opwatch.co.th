import { Bot, KeyRound, Terminal, Workflow } from "lucide-react";
import { loadSnapshot } from "@/lib/store";
import { TOOLS } from "@/lib/mcp-tools";
import { Card, SectionTitle } from "@/components/ui";
import McpPlayground from "@/components/McpPlayground";

export const dynamic = "force-dynamic";

export default async function McpPage() {
  const s = await loadSnapshot();
  const tokenRequired = Boolean(process.env.MCP_TOKEN);

  return (
    <div className="space-y-4">
      <div>
        <div className="label mb-1">MCP gateway</div>
        <h1 className="text-[22px] font-semibold tracking-tight">ให้ AI ภายนอกสั่งงานระบบนี้</h1>
        <p className="mt-1 max-w-3xl text-[12.5px] text-txt-mute">
          Claude Code, Antigravity หรือ agent ใด ๆ ที่รองรับ MCP เชื่อมเข้ามาสั่งรัน flow ตรวจสถานะ และเปิด Ticket ได้ผ่าน{" "}
          <span className="font-mono text-cyan-glow">https://ai.uarea.in/api/mcp</span>
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="p-4">
          <div className="label mb-1">Endpoint</div>
          <div className="font-mono text-[11.5px] text-cyan-glow">POST /api/mcp</div>
          <div className="mt-1 text-[10.5px] text-txt-mute">JSON-RPC 2.0 · initialize / tools/list / tools/call</div>
        </Card>
        <Card className="p-4">
          <div className="label mb-1">Authentication</div>
          <div className="font-mono text-[11.5px]" style={{ color: tokenRequired ? "#34d399" : "#fbbf24" }}>
            {tokenRequired ? "Bearer MCP_TOKEN" : "เปิด (ยังไม่ตั้ง MCP_TOKEN)"}
          </div>
          <div className="mt-1 text-[10.5px] text-txt-mute">
            {tokenRequired ? "ต้องส่ง Authorization header ทุกครั้ง" : "แนะนำให้ตั้ง MCP_TOKEN ก่อนใช้งานจริง"}
          </div>
        </Card>
        <Card className="p-4">
          <div className="label mb-1">Tools</div>
          <div className="kpi-value text-[18px] font-semibold text-txt">{TOOLS.length} รายการ</div>
          <div className="mt-1 text-[10.5px] text-txt-mute">ครอบคลุม project → flow → run → issue → report</div>
        </Card>
      </div>

      <Card className="p-4">
        <SectionTitle title="เชื่อมต่อจาก Claude Code / Antigravity" subtitle="ใส่ในการตั้งค่า MCP servers" icon={<KeyRound size={15} />} />
        <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-[#080f1c] p-3 font-mono text-[10.5px] leading-relaxed text-txt-dim">{`{
  "mcpServers": {
    "uarea-uat": {
      "type": "http",
      "url": "https://ai.uarea.in/api/mcp",
      "headers": { "Authorization": "Bearer $MCP_TOKEN" }
    }
  }
}`}</pre>
        <div className="mt-2 text-[10.5px] text-txt-mute">
          หรือเรียกแบบง่ายด้วย REST: <span className="font-mono">{`{ "tool": "run.create", "arguments": { "flowId": "flw_tax" } }`}</span>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {TOOLS.map((t) => (
          <Card key={t.name} className="p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg border border-line bg-[#0f1a2c] text-cyan-glow">
                <Terminal size={13} />
              </span>
              <div className="font-mono text-[12px] font-semibold text-txt">{t.name}</div>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-txt-mute">{t.description}</p>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-line bg-[#080f1c] p-2 font-mono text-[9.5px] leading-relaxed text-txt-dim">
              {JSON.stringify(t.inputSchema, null, 2)}
            </pre>
          </Card>
        ))}
      </div>

      <McpPlayground tools={TOOLS.map((t) => ({ name: t.name, inputSchema: t.inputSchema }))} flows={s.flows.map((f) => ({ id: f.id, name: f.name }))} />

      <Card className="p-4">
        <SectionTitle title="วงจรที่ AI ภายนอกทำได้ทั้งหมด" subtitle="ตัวอย่างการใช้จาก Claude Code" icon={<Bot size={15} />} />
        <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-[#080f1c] p-3 font-mono text-[10.5px] leading-relaxed text-txt-dim">{`1) flow.list          → เลือก flow ที่ต้องตรวจ
2) run.create         → ได้ runId กลับมา
3) run.status         → poll ทุก 2 วินาทีจนจบ
4) run.events         → ดูว่าขั้นไหนไม่ผ่าน พร้อมหลักฐาน
5) issue.create       → เปิด Ticket S1–S4 ให้ทีมแก้
6) แก้โค้ด + เปิด PR  → แล้วเรียก run.create อีกครั้งเพื่อตรวจซ้ำ`}</pre>
        <div className="mt-2 inline-flex items-center gap-1.5 text-[10.5px] text-txt-mute">
          <Workflow size={11} /> ทุกการเรียกถูกบันทึกใน event log และส่งเข้า mng.uarea.in
        </div>
      </Card>
    </div>
  );
}
