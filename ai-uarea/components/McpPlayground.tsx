"use client";

import { useState } from "react";
import { Loader2, Play, Terminal } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui";

export default function McpPlayground({
  tools,
  flows,
}: {
  tools: { name: string; inputSchema: unknown }[];
  flows: { id: string; name: string }[];
}) {
  const [tool, setTool] = useState("flow.list");
  const [args, setArgs] = useState("{}");
  const [out, setOut] = useState<string>("");
  const [busy, setBusy] = useState(false);

  function preset(name: string) {
    setTool(name);
    if (name === "flow.list") setArgs(JSON.stringify({ status: "ready" }, null, 2));
    else if (name === "run.create") setArgs(JSON.stringify({ flowId: flows[0]?.id ?? "flw_tax" }, null, 2));
    else if (name === "run.status") setArgs(JSON.stringify({ runId: "run_live" }, null, 2));
    else if (name === "issue.create")
      setArgs(JSON.stringify({ projectId: "prj_sml", title: "ตัวอย่าง issue จาก playground", severity: "S3" }, null, 2));
    else setArgs("{}");
  }

  async function send() {
    setBusy(true);
    setOut("");
    try {
      const parsedArgs = JSON.parse(args || "{}");
      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "tools/call",
          params: { name: tool, arguments: parsedArgs },
        }),
      });
      const data = await res.json();
      setOut(JSON.stringify(data, null, 2));
    } catch (err) {
      setOut(`error: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-4">
      <SectionTitle title="MCP Playground" subtitle="ยิง tools/call จริงเข้า /api/mcp" icon={<Terminal size={15} />} />
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <label className="label">Tool</label>
          <select
            className="input mt-1 font-mono text-[11.5px]"
            value={tool}
            onChange={(e) => {
              setTool(e.target.value);
              preset(e.target.value);
            }}
          >
            {tools.map((t) => (
              <option key={t.name} value={t.name} className="bg-[#0a1220]">
                {t.name}
              </option>
            ))}
          </select>
          <label className="label mt-3 block">Arguments (JSON)</label>
          <textarea
            className="input mt-1 min-h-[140px] font-mono text-[11px] leading-relaxed"
            value={args}
            onChange={(e) => setArgs(e.target.value)}
          />
          <button onClick={send} disabled={busy} className="btn btn-sm btn-primary mt-2">
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} เรียก tool
          </button>
        </div>
        <div>
          <label className="label">Response</label>
          <pre className="mt-1 min-h-[215px] overflow-auto rounded-lg border border-line bg-[#080f1c] p-3 font-mono text-[10.5px] leading-relaxed text-txt-dim">
            {out || "// ผลลัพธ์จะแสดงที่นี่ — ลองเรียก flow.list ก่อน"}
          </pre>
        </div>
      </div>
    </Card>
  );
}
