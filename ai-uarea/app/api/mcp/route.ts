import { NextResponse } from "next/server";
import { advanceRun, createIssue, createRun, loadSnapshot } from "@/lib/store";
import { TOOLS } from "@/lib/mcp-tools";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// MCP Gateway — lets Claude Code / Antigravity / Gemini drive the orchestrator:
//   run.create → run.status → run.events → issue.create → report.push
// Auth: `Authorization: Bearer $MCP_TOKEN` (when MCP_TOKEN is set).
// Supports JSON-RPC 2.0 (initialize / tools/list / tools/call) and the compact
// { tool, arguments } form used by simple agents.
// ─────────────────────────────────────────────────────────────────────────────

function unauthorized() {
  return NextResponse.json({ error: "invalid token" }, { status: 401 });
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "project.list": {
      const s = await loadSnapshot();
      return s.projects.map((p) => ({
        id: p.id,
        key: p.key,
        name: p.name,
        env: p.env,
        baseUrl: p.baseUrl,
        openIssues: s.issues.filter((i) => i.projectId === p.id && !["closed", "wontfix"].includes(i.status)).length,
      }));
    }
    case "flow.list": {
      const s = await loadSnapshot();
      return s.flows
        .filter((f) => (args.projectId ? f.projectId === args.projectId : true))
        .filter((f) => (args.status ? f.status === args.status : true))
        .map((f) => ({ id: f.id, name: f.name, module: f.module, steps: f.steps.length, status: f.status, lastPassRate: f.lastPassRate }));
    }
    case "run.create": {
      const s = await loadSnapshot();
      const flow = s.flows.find((f) => f.id === args.flowId);
      if (!flow) throw new Error("flow not found");
      const run = await createRun({
        flowId: flow.id,
        projectId: (args.projectId as string) ?? flow.projectId,
        agentId: args.agentId as string | undefined,
        browser: args.browser as string | undefined,
        trigger: "mcp",
      });
      return run ? { runId: run.id, status: run.status, poll: "/api/mcp run.status" } : null;
    }
    case "run.status": {
      const run = await advanceRun(String(args.runId));
      if (!run) throw new Error("run not found");
      return {
        runId: run.id,
        status: run.status,
        verdict: run.verdict,
        passed: run.passed,
        failed: run.failed,
        total: run.total,
        durationMs: run.durationMs,
        aiAnalysis: run.aiAnalysis,
      };
    }
    case "run.events": {
      const run = await advanceRun(String(args.runId));
      if (!run) throw new Error("run not found");
      return run.steps.map((st) => ({ idx: st.idx, kind: st.kind, name: st.name, status: st.status, detail: st.detail, evidence: st.evidence }));
    }
    case "issue.create": {
      const issue = await createIssue({
        projectId: String(args.projectId),
        title: String(args.title),
        description: String(args.description ?? ""),
        severity: (args.severity as "S1" | "S2" | "S3" | "S4") ?? "S3",
        source: "mcp",
        runId: (args.runId as string) ?? null,
        agentId: "agt_issue",
      });
      return { id: issue.id, key: issue.key, status: issue.status };
    }
    case "report.push": {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/sync`, { method: "POST" });
      return await res.json();
    }
    default:
      throw new Error(`unknown tool: ${name}`);
  }
}

export async function GET(req: Request) {
  const token = process.env.MCP_TOKEN;
  if (token) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${token}`) return unauthorized();
  }
  return NextResponse.json({
    server: { name: "uarea-uat-orchestrator", version: "1.0.0", transport: "http", endpoint: "/api/mcp" },
    auth: token ? "Bearer token required" : "open (ตั้ง MCP_TOKEN เพื่อบังคับใช้ token)",
    tools: TOOLS,
  });
}

export async function POST(req: Request) {
  const token = process.env.MCP_TOKEN;
  if (token) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${token}`) return unauthorized();
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ jsonrpc: "2.0", error: { code: -32700, message: "parse error" }, id: null }, { status: 400 });
  }

  const rpc = typeof body.method === "string";
  const id = (body.id as string | number | null) ?? null;
  const method = rpc ? (body.method as string) : (body.tool as string);
  const params = rpc ? ((body.params as Record<string, unknown>) ?? {}) : ((body.arguments as Record<string, unknown>) ?? {});

  try {
    if (method === "initialize") {
      const result = {
        protocolVersion: "2025-06-18",
        serverInfo: { name: "uarea-uat-orchestrator", version: "1.0.0" },
        capabilities: { tools: { listChanged: false } },
        instructions:
          "ใช้ flow.list เพื่อเลือก flow, run.create เพื่อสั่งทดสอบ, run.status/run.events เพื่อติดตาม, issue.create เพื่อเปิด Ticket",
      };
      return NextResponse.json(rpc ? { jsonrpc: "2.0", id, result } : result);
    }
    if (method === "tools/list" || method === "list_tools") {
      const result = { tools: TOOLS };
      return NextResponse.json(rpc ? { jsonrpc: "2.0", id, result } : result);
    }
    if (method === "tools/call" || method === "call_tool" || body.tool) {
      const name = rpc ? String(params.name) : String(body.tool);
      const args = rpc ? ((params.arguments as Record<string, unknown>) ?? {}) : params;
      const data = await callTool(name, args);
      const result = {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data,
        isError: false,
      };
      return NextResponse.json(rpc ? { jsonrpc: "2.0", id, result } : result);
    }
    if (method === "ping") {
      return NextResponse.json(rpc ? { jsonrpc: "2.0", id, result: {} } : { ok: true });
    }
    throw new Error(`unknown method: ${method}`);
  } catch (err) {
    const message = (err as Error).message;
    if (rpc) return NextResponse.json({ jsonrpc: "2.0", id, error: { code: -32603, message } }, { status: 200 });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
