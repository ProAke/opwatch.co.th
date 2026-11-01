import { buildSeed } from "@/lib/seed-data";
import {
  dbEnabled,
  getPool,
  insertRow,
  normalizeRow,
  selectAll,
  updateRow,
  upsertRow,
  type Row,
} from "@/lib/db";
import type {
  ActivityEvent,
  Agent,
  AiModel,
  Doc,
  EventLevel,
  Flow,
  FlowStep,
  Integration,
  Issue,
  Policy,
  Project,
  Run,
  RunStep,
  RunWithSteps,
  Schedule,
  Snapshot,
} from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Store — one API for both backends (MariaDB when DB_* is set, in-memory demo).
// ─────────────────────────────────────────────────────────────────────────────

type FullState = Snapshot & { runSteps: RunStep[] };

const g = globalThis as unknown as { __uareaState?: FullState };

export const storageMode = (): "mariadb" | "demo" => (dbEnabled() ? "mariadb" : "demo");

function demo(): FullState {
  if (!g.__uareaState) g.__uareaState = buildSeed();
  return g.__uareaState;
}

const TABLES = {
  projects: "projects",
  agents: "agents",
  models: "ai_models",
  flows: "flows",
  runs: "runs",
  issues: "issues",
  schedules: "schedules",
  events: "events",
  docs: "docs",
  integrations: "integrations",
  policies: "policies",
  users: "users",
  runSteps: "run_steps",
} as const;

type TableKey = keyof typeof TABLES;

async function loadTable<K extends TableKey>(key: K, orderBy?: string): Promise<FullState[K]> {
  const rows = await selectAll(TABLES[key], orderBy);
  return rows as unknown as FullState[K];
}

export async function loadSnapshot(): Promise<FullState> {
  if (!dbEnabled()) return demo();
  try {
    const [
      projects,
      agents,
      models,
      flows,
      runs,
      issues,
      schedules,
      events,
      docs,
      integrations,
      policies,
      users,
      runSteps,
    ] = await Promise.all([
      loadTable("projects"),
      loadTable("agents"),
      loadTable("models"),
      loadTable("flows"),
      loadTable("runs", "createdAt DESC"),
      loadTable("issues", "createdAt DESC"),
      loadTable("schedules"),
      loadTable("events", "createdAt DESC"),
      loadTable("docs", "updatedAt DESC"),
      loadTable("integrations"),
      loadTable("policies"),
      loadTable("users"),
      loadTable("runSteps", "runId, idx"),
    ]);
    return {
      projects,
      agents,
      models: (models as AiModel[]).map((m) => ({ ...m, keyConfigured: Boolean(m.keyEnv && process.env[m.keyEnv]) })),
      flows,
      runs,
      issues,
      schedules,
      events,
      docs,
      integrations,
      policies,
      users,
      runSteps,
    };
  } catch (err) {
    console.error("[store] MariaDB read failed, falling back to demo dataset:", (err as Error).message);
    return demo();
  }
}

async function persist(table: TableKey, row: object): Promise<void> {
  if (!dbEnabled()) return;
  await upsertRow(TABLES[table], row as Row);
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

const iso = () => new Date().toISOString();

// ── Events ──────────────────────────────────────────────────────────────────

export async function addEvent(input: {
  actor: string;
  kind: string;
  message: string;
  level?: EventLevel;
  projectId?: string | null;
  runId?: string | null;
  issueId?: string | null;
}): Promise<ActivityEvent> {
  const evt: ActivityEvent = {
    id: uid("evt"),
    actor: input.actor,
    kind: input.kind,
    message: input.message,
    level: input.level ?? "info",
    projectId: input.projectId ?? null,
    runId: input.runId ?? null,
    issueId: input.issueId ?? null,
    createdAt: iso(),
  };
  if (!dbEnabled()) demo().events.unshift(evt);
  else await persist("events", evt);
  return evt;
}

// ── Reads ───────────────────────────────────────────────────────────────────

export async function getRun(id: string): Promise<RunWithSteps | null> {
  const s = await loadSnapshot();
  const run = s.runs.find((r) => r.id === id);
  if (!run) return null;
  return { ...run, steps: s.runSteps.filter((st) => st.runId === id).sort((a, b) => a.idx - b.idx) };
}

export async function getFlow(id: string): Promise<Flow | null> {
  const s = await loadSnapshot();
  return s.flows.find((f) => f.id === id) ?? null;
}

export async function getProject(id: string): Promise<Project | null> {
  const s = await loadSnapshot();
  return s.projects.find((p) => p.id === id) ?? null;
}

// ── Flows ───────────────────────────────────────────────────────────────────

export async function saveFlow(input: Partial<Flow> & { projectId: string; name: string }): Promise<Flow> {
  const s = await loadSnapshot();
  const existing = input.id ? s.flows.find((f) => f.id === input.id) : undefined;
  const flow: Flow = {
    id: existing?.id ?? input.id ?? uid("flw"),
    projectId: input.projectId,
    name: input.name,
    module: input.module ?? existing?.module ?? "ทั่วไป",
    description: input.description ?? existing?.description ?? "",
    steps: (input.steps ?? existing?.steps ?? []) as FlowStep[],
    tags: input.tags ?? existing?.tags ?? [],
    browsers: input.browsers ?? existing?.browsers ?? ["chromium"],
    version: existing ? existing.version + 1 : 1,
    status: input.status ?? existing?.status ?? "draft",
    updatedAt: iso(),
    lastPassRate: existing?.lastPassRate ?? null,
    createdBy: existing?.createdBy ?? input.createdBy ?? "usr_human",
  };
  if (!dbEnabled()) {
    const st = demo();
    const i = st.flows.findIndex((f) => f.id === flow.id);
    if (i >= 0) st.flows[i] = flow;
    else st.flows.unshift(flow);
  } else {
    const row: Row = { ...flow, steps: JSON.stringify(flow.steps), tags: JSON.stringify(flow.tags), browsers: JSON.stringify(flow.browsers) };
    await persist("flows", row);
  }
  await addEvent({
    actor: "usr_human",
    kind: existing ? "flow.updated" : "flow.created",
    level: "info",
    message: `${existing ? "แก้ไข" : "สร้าง"} Flow “${flow.name}” (${flow.steps.length} ขั้นตอน)`,
    projectId: flow.projectId,
  });
  return flow;
}

export async function deleteFlow(id: string): Promise<void> {
  const s = await loadSnapshot();
  const flow = s.flows.find((f) => f.id === id);
  if (!dbEnabled()) {
    const st = demo();
    st.flows = st.flows.filter((f) => f.id !== id);
    st.schedules = st.schedules.filter((sc) => sc.flowId !== id);
  } else {
    const pool = getPool();
    await pool.query("DELETE FROM `flows` WHERE id = ?", [id]);
    await pool.query("DELETE FROM `schedules` WHERE flowId = ?", [id]);
  }
  if (flow) {
    await addEvent({ actor: "usr_human", kind: "flow.deleted", level: "warn", message: `ลบ Flow “${flow.name}”`, projectId: flow.projectId });
  }
}

// ── Run simulation (the "zero-touch" loop) ──────────────────────────────────

const KNOWN_FAILURES: Record<string, number[]> = {
  flw_tax: [7],
  flw_login: [5],
  flw_report: [3, 4],
  flw_checkout: [7],
  flw_leave: [6],
};

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function failurePlan(run: Run, flow: Flow): number[] {
  const known = KNOWN_FAILURES[flow.id];
  if (known) return known;
  const plan: number[] = [];
  flow.steps.forEach((st, i) => {
    if (st.critical === false) return;
    if (hash(`${run.id}:${st.kind}:${i}`) % 100 < 12) plan.push(i);
  });
  return plan.slice(0, 2);
}

const STEP_DETAIL: Record<string, [string, string]> = {
  navigate: ["เปิดหน้าเป้าหมายสำเร็จ", "โหลดหน้าไม่สำเร็จ (timeout 30s)"],
  click: ["คลิกและได้ผลลัพธ์ตามคาด", "องค์ประกอบไม่ตอบสนอง"],
  fill: ["กรอกข้อมูลและ validate ผ่าน", "ฟิลด์ไม่รับค่า / validate ผิด"],
  expect: ["ค่าบนหน้าจอตรงตาม SPEC", "ค่าบนหน้าจอไม่ตรงกับ SPEC"],
  "api.request": ["HTTP 200 และ payload ตรง schema", "HTTP 500 และ payload ไม่ตรง schema"],
  "db.query": ["ข้อมูลในฐานตรงกับที่คาดหวัง", "พบผลต่างในฐานข้อมูล"],
  "report.check": ["รายงานตรงกับ GL", "รายงานไม่ตรงกับ GL"],
  "ai.review": ["AI ตรวจทานแล้วไม่พบความเสี่ยงเพิ่ม", "AI พบความเสี่ยงที่ต้องตรวจซ้ำ"],
  "issue.create": ["เปิด Issue เชื่อมโยงหลักฐานแล้ว", "เปิด Issue ไม่สำเร็จ"],
  notify: ["ส่งแจ้งเตือนสำเร็จ", "ส่งแจ้งเตือนไม่สำเร็จ"],
};

const SEV_ORDER: Record<string, number> = { S1: 1, S2: 2, S3: 3, S4: 4 };

export async function createRun(input: {
  projectId: string;
  flowId: string;
  agentId?: string;
  trigger?: Run["trigger"];
  browser?: string;
  env?: string;
}): Promise<RunWithSteps | null> {
  const s = await loadSnapshot();
  const flow = s.flows.find((f) => f.id === input.flowId);
  const project = s.projects.find((p) => p.id === input.projectId);
  if (!flow || !project) return null;
  const agent = s.agents.find((a) => a.id === (input.agentId ?? aiAgentFor(s.agents, "web_executor")));
  const run: Run = {
    id: uid("run"),
    projectId: project.id,
    flowId: flow.id,
    agentId: agent?.id ?? "agt_web",
    modelId: agent?.modelId ?? "mdl_deepseek",
    trigger: input.trigger ?? "manual",
    status: "running",
    browser: input.browser ?? flow.browsers[0] ?? "chromium",
    env: input.env ?? project.env,
    startedAt: iso(),
    finishedAt: null,
    durationMs: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    total: flow.steps.length,
    verdict: `กำลังรัน · ขั้นที่ 1 จาก ${flow.steps.length}`,
    summary: `AI เริ่มเล่น flow “${flow.name}”`,
    aiAnalysis: "AI กำลังเฝ้าดูหน้าจอและเทียบผลกับ SPEC แบบทันที",
    evidenceCount: 0,
    commit: null,
    createdAt: iso(),
  };
  const steps: RunStep[] = flow.steps.map((st, i) => ({
    id: `${run.id}_st${i}`,
    runId: run.id,
    idx: i + 1,
    kind: st.kind,
    name: st.name,
    status: "pending",
    startedAt: null,
    durationMs: 0,
    detail: "รอคิว",
    evidence: null,
  }));
  if (!dbEnabled()) {
    const st = demo();
    st.runs.unshift(run);
    st.runSteps.push(...steps);
  } else {
    await persist("runs", run);
    for (const st of steps) await persist("runSteps", st);
  }
  await addEvent({
    actor: agent?.name ?? "agt_web",
    kind: "run.started",
    level: "success",
    message: `เริ่มรัน “${flow.name}” บน ${run.browser} (${run.trigger})`,
    projectId: run.projectId,
    runId: run.id,
  });
  return { ...run, steps };
}

function aiAgentFor(agents: Agent[], role: Agent["role"]): string {
  return agents.find((a) => a.role === role && a.status === "active")?.id ?? agents[0]?.id ?? "agt_web";
}

function stepDuration(runId: string, idx: number): number {
  return 1200 + (hash(`${runId}:${idx}`) % 1900);
}

/**
 * Advances a running simulation to match wall-clock time.
 * Called by the UI on poll, so a run visibly walks through its steps.
 */
export async function advanceRun(runId: string): Promise<RunWithSteps | null> {
  const s = await loadSnapshot();
  const run = s.runs.find((r) => r.id === runId);
  if (!run) return null;
  const flow = s.flows.find((f) => f.id === run.flowId);
  const steps = s.runSteps.filter((st) => st.runId === runId).sort((a, b) => a.idx - b.idx);
  if (!flow || steps.length === 0) return { ...run, steps };
  if (run.status !== "running" && run.status !== "queued") return { ...run, steps };

  const started = run.startedAt ? new Date(run.startedAt).getTime() : Date.now();
  const elapsed = Date.now() - started;
  const plan = failurePlan(run, flow);
  const firstFail = plan.length ? Math.min(...plan) : -1;

  let cumulative = 0;
  let finished = false;
  let failedAt = -1;
  const touched: RunStep[] = [];

  for (let i = 0; i < steps.length; i += 1) {
    const st = steps[i];
    const dur = stepDuration(run.id, i);
    cumulative += dur;
    if (st.status === "passed" || st.status === "failed" || st.status === "skipped") {
      if (st.status === "failed") {
        failedAt = i;
        finished = true;
        break;
      }
      continue;
    }
    if (elapsed < cumulative) break;
    const [okDetail, badDetail] = STEP_DETAIL[st.kind] ?? ["ผ่าน", "ไม่ผ่าน"];
    if (plan.includes(i)) {
      st.status = "failed";
      st.detail = badDetail;
      st.durationMs = dur;
      st.startedAt = new Date(started + cumulative - dur).toISOString();
      st.evidence = `${String(i + 1).padStart(3, "0")}-${st.kind}.png`;
      st.aiNote =
        st.kind === "db.query"
          ? "เทียบกับ SPEC แล้วพบผลต่าง: ค่าที่คาดหวังไม่ตรงกับฐานข้อมูล"
          : st.kind === "api.request"
            ? "response ไม่ตรง schema ที่กำหนดใน SPEC"
            : undefined;
      failedAt = i;
      finished = true;
      touched.push(st);
      break;
    }
    st.status = "passed";
    st.detail = okDetail;
    st.durationMs = dur;
    st.startedAt = new Date(started + cumulative - dur).toISOString();
    st.evidence = `${String(i + 1).padStart(3, "0")}-${st.kind}.png`;
    touched.push(st);
  }

  if (!finished && elapsed >= cumulative) finished = true;

  // Steps after a failure are skipped.
  if (finished && failedAt >= 0) {
    for (let i = failedAt + 1; i < steps.length; i += 1) {
      if (steps[i].status === "pending") {
        steps[i].status = "skipped";
        steps[i].detail = "ข้ามเพราะขั้นก่อนหน้าล้มเหลว";
        touched.push(steps[i]);
      }
    }
  }
  if (finished && failedAt < 0) {
    for (const st of steps) {
      if (st.status === "pending") {
        st.status = "passed";
        st.detail = (STEP_DETAIL[st.kind] ?? ["ผ่าน"])[0];
        st.durationMs = 800;
        st.evidence = `${String(st.idx).padStart(3, "0")}-${st.kind}.png`;
        touched.push(st);
      }
    }
  }

  const passed = steps.filter((st) => st.status === "passed").length;
  const failed = steps.filter((st) => st.status === "failed").length;
  const skipped = steps.filter((st) => st.status === "skipped").length;
  const now = Date.now();

  const nextRun: Run = {
    ...run,
    passed,
    failed,
    skipped,
    evidenceCount: passed + failed,
    status: finished ? (failed ? "failed" : "passed") : "running",
    finishedAt: finished ? new Date().toISOString() : null,
    durationMs: finished ? now - started : 0,
    verdict: finished
      ? failed
        ? `ไม่ผ่าน · ${steps[failedAt]?.name ?? "พบข้อผิดพลาด"}`
        : `ผ่านครบทุกขั้น · เก็บหลักฐาน ${passed} รายการ`
      : `กำลังรัน · ขั้นที่ ${Math.min(passed + 1, steps.length)} จาก ${steps.length}`,
    summary: finished
      ? failed
        ? `ขั้น “${steps[failedAt]?.name}” ให้ผลไม่ตรงกับ SPEC — ${steps[failedAt]?.detail ?? ""} ระบบได้แนบหลักฐานและส่งต่อให้ IssueMate แล้ว`
        : `ทุกขั้นตอนผ่านตามเกณฑ์ (${passed}/${steps.length}) หลักฐานถูกส่งเข้า Drive และรายงานผลเข้า mng.uarea.in แล้ว`
      : `AI กำลังเล่นขั้น “${steps.find((x) => x.status === "pending")?.name ?? "-"}”`,
    aiAnalysis: finished
      ? failed
        ? `วิเคราะห์: ความล้มเหลวอยู่ที่ขั้น ${failedAt + 1} (${steps[failedAt]?.kind}) — เสนอเปิด Issue ระดับ ${failed >= 1 && steps[failedAt]?.kind === "db.query" ? "S1" : "S2"} พร้อมแนบหลักฐาน ${passed + failed} ไฟล์ และให้ Auto Fixer แก้บน branch fix/${run.flowId}-${run.id.slice(-4)}`
        : "AI ตรวจทานหลักฐานครบทุกขั้นแล้ว ไม่พบความเสี่ยงเพิ่มเติม — จัดเก็บเข้า Drive และรายงานเข้า mng.uarea.in"
      : "AI กำลังเปรียบเทียบผลจริงกับ SPEC ทุกไบต์",
  };

  if (!dbEnabled()) {
    const st = demo();
    const i = st.runs.findIndex((r) => r.id === run.id);
    if (i >= 0) st.runs[i] = nextRun;
    for (const t of touched) {
      const j = st.runSteps.findIndex((x) => x.id === t.id);
      if (j >= 0) st.runSteps[j] = { ...t };
    }
  } else {
    await persist("runs", nextRun);
    for (const t of touched) await persist("runSteps", t);
  }

  if (finished) {
    if (!dbEnabled()) {
      const st = demo();
      const fi = st.flows.findIndex((f) => f.id === flow.id);
      if (fi >= 0) st.flows[fi].lastPassRate = Math.round((passed / steps.length) * 100);
    } else {
      await persist("flows", { ...flow, lastPassRate: Math.round((passed / steps.length) * 100) });
    }
    await addEvent({
      actor: nextRun.agentId,
      kind: failed ? "run.failed" : "run.passed",
      level: failed ? "error" : "success",
      message: failed
        ? `Run ${run.id.slice(-6)} ล้มเหลวที่ขั้น ${failedAt + 1} — ${steps[failedAt]?.name}`
        : `Run ${run.id.slice(-6)} ผ่านครบ ${passed} ขั้นตอน`,
      projectId: run.projectId,
      runId: run.id,
    });

    if (failed) {
      const settings = (await loadSnapshot()).policies;
      const autoIssue = settings.find((p) => p.id === "pol_auto_issue");
      const threshold = String(autoIssue?.value ?? "S3");
      const severity = steps[failedAt]?.kind === "db.query" || failed > 1 ? "S1" : "S2";
      if (SEV_ORDER[severity] <= SEV_ORDER[threshold]) {
        await autoCreateIssue({ run: nextRun, flow, project: (await getProject(run.projectId))!, step: steps[failedAt], severity });
      }
    }
    await pushToMng(nextRun);
  }

  return { ...nextRun, steps };
}

async function pushToMng(run: Run): Promise<void> {
  const base = process.env.MNG_BASE_URL || "https://mng.uarea.in";
  const endpoint = `${base.replace(/\/$/, "")}/api/uat/report`;
  if (!process.env.MNG_API_KEY) {
    await addEvent({
      actor: "mng.uarea.in",
      kind: "report.pushed",
      level: "success",
      message: `ส่งรายงาน run ${run.id.slice(-6)} ไป ${base} (โหมดสาธิต — ไม่ได้ยิง HTTP จริง)`,
      projectId: run.projectId,
      runId: run.id,
    });
    return;
  }
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${process.env.MNG_API_KEY}` },
      body: JSON.stringify({
        project: run.projectId,
        runId: run.id,
        status: run.status,
        passed: run.passed,
        failed: run.failed,
        verdict: run.verdict,
        finishedAt: run.finishedAt,
      }),
      signal: AbortSignal.timeout(8000),
    });
    await addEvent({
      actor: "mng.uarea.in",
      kind: "report.pushed",
      level: res.ok ? "success" : "warn",
      message: `ส่งรายงานไป ${endpoint} — HTTP ${res.status}`,
      projectId: run.projectId,
      runId: run.id,
    });
  } catch (err) {
    await addEvent({
      actor: "mng.uarea.in",
      kind: "report.failed",
      level: "error",
      message: `ส่งรายงานไม่สำเร็จ: ${(err as Error).message}`,
      projectId: run.projectId,
      runId: run.id,
    });
  }
}

// ── Issues ──────────────────────────────────────────────────────────────────

function nextIssueKey(s: FullState, project: Project): string {
  const nums = s.issues
    .filter((i) => i.projectId === project.id && i.key.startsWith(`${project.key}-`))
    .map((i) => Number(i.key.split("-").pop()))
    .filter((n) => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 100) + 1;
  return `${project.key}-${next}`;
}

export async function createIssue(input: {
  projectId: string;
  title: string;
  description: string;
  severity: Issue["severity"];
  source?: Issue["source"];
  runId?: string | null;
  flowId?: string | null;
  assignee?: string;
  agentId?: string | null;
  labels?: string[];
}): Promise<Issue> {
  const s = await loadSnapshot();
  const project = s.projects.find((p) => p.id === input.projectId);
  if (!project) throw new Error("project not found");
  const key = nextIssueKey(s, project);
  const repoSlug = project.repoUrl
    ? project.repoUrl.replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/i, "").replace(/\/$/, "")
    : process.env.GITHUB_OWNER
      ? `${process.env.GITHUB_OWNER}`
      : null;
  const issue: Issue = {
    id: uid("iss"),
    key,
    projectId: project.id,
    runId: input.runId ?? null,
    flowId: input.flowId ?? null,
    title: input.title,
    description: input.description,
    severity: input.severity,
    status: "open",
    source: input.source ?? "manual",
    assignee: input.assignee ?? "ยังไม่มอบหมาย",
    agentId: input.agentId ?? null,
    // ผูกกับ repo ของโปรเจกต์ (เลือกได้ที่หน้า Integrations) ไม่ใช่ค่า global
    githubUrl: repoSlug ? `https://github.com/${repoSlug}/issues` : null,
    fixBranch: null,
    fixPrUrl: null,
    recheckRunId: null,
    labels: input.labels ?? [],
    createdAt: iso(),
    updatedAt: iso(),
    closedAt: null,
  };
  if (!dbEnabled()) demo().issues.unshift(issue);
  else await persist("issues", issue);
  await addEvent({
    actor: input.agentId ?? "usr_human",
    kind: "issue.created",
    level: issue.severity === "S1" || issue.severity === "S2" ? "warn" : "info",
    message: `เปิด ${issue.key} · ${issue.title} · ${issue.severity}`,
    projectId: issue.projectId,
    runId: issue.runId ?? undefined,
    issueId: issue.id,
  });
  return issue;
}

async function autoCreateIssue(args: {
  run: Run;
  flow: Flow;
  project: Project;
  step: RunStep;
  severity: Issue["severity"];
}): Promise<void> {
  const { run, flow, project, step, severity } = args;
  // Avoid duplicate tickets for the same flow while one is still open.
  const s = await loadSnapshot();
  const duplicate = s.issues.find(
    (i) => i.flowId === flow.id && ["open", "triaged", "fixing", "in_review"].includes(i.status),
  );
  if (duplicate) return;
  const issue = await createIssue({
    projectId: project.id,
    runId: run.id,
    flowId: flow.id,
    severity,
    source: "uat",
    agentId: "agt_issue",
    assignee: "Auto Fixer (Claude Code)",
    labels: [flow.module, "uat", "auto"],
    title: `${flow.name}: ${step.name} ไม่ผ่านตาม SPEC`,
    description: [
      `Flow: ${flow.name} (${flow.module}) · run ${run.id}`,
      ``,
      `ขั้นที่ล้มเหลว: ${step.idx}. ${step.name}`,
      `ผลที่ได้: ${step.detail}`,
      `หลักฐาน: ${step.evidence ?? "-"}`,
      ``,
      `สรุปจาก AI: ${run.aiAnalysis}`,
    ].join("\n"),
  });
  // Hand off to the fixer agent when the policy allows.
  const autoFix = s.policies.find((p) => p.id === "pol_auto_fix");
  if (autoFix?.value) {
    const branch = `fix/${issue.key.toLowerCase()}-${flow.id.replace("flw_", "")}`;
    await updateIssue(issue.id, { status: "fixing", fixBranch: branch });
    await addEvent({
      actor: "agt_fix",
      kind: "fix.started",
      level: "info",
      message: `Auto Fixer เริ่มแก้ ${issue.key} บน branch ${branch}`,
      projectId: project.id,
      issueId: issue.id,
    });
  }
}

export async function updateIssue(id: string, patch: Partial<Issue>): Promise<Issue | null> {
  const s = await loadSnapshot();
  const issue = s.issues.find((i) => i.id === id);
  if (!issue) return null;
  const next: Issue = { ...issue, ...patch, updatedAt: iso() };
  if (patch.status === "closed" && !next.closedAt) next.closedAt = iso();
  if (!dbEnabled()) {
    const st = demo();
    const i = st.issues.findIndex((x) => x.id === id);
    if (i >= 0) st.issues[i] = next;
  } else {
    await persist("issues", next);
  }
  await addEvent({
    actor: "usr_human",
    kind: "issue.updated",
    level: "info",
    message: `อัปเดต ${next.key} → ${next.status}`,
    projectId: next.projectId,
    issueId: next.id,
  });
  return next;
}

// ── Agents ──────────────────────────────────────────────────────────────────

export async function saveAgent(input: Partial<Agent> & { name: string; role: Agent["role"] }): Promise<Agent> {
  const s = await loadSnapshot();
  const existing = input.id ? s.agents.find((a) => a.id === input.id) : undefined;
  const agent: Agent = {
    id: existing?.id ?? uid("agt"),
    projectId: input.projectId ?? existing?.projectId ?? null,
    name: input.name,
    role: input.role,
    modelId: input.modelId ?? existing?.modelId ?? "mdl_gemini_pro",
    avatar: input.avatar ?? existing?.avatar ?? "🤖",
    systemPrompt: input.systemPrompt ?? existing?.systemPrompt ?? "",
    tools: input.tools ?? existing?.tools ?? [],
    autonomy: input.autonomy ?? existing?.autonomy ?? "semi",
    status: input.status ?? existing?.status ?? "active",
    runsTotal: existing?.runsTotal ?? 0,
    passRate: existing?.passRate ?? 0,
    lastActiveAt: existing?.lastActiveAt ?? null,
  };
  if (!dbEnabled()) {
    const st = demo();
    const i = st.agents.findIndex((a) => a.id === agent.id);
    if (i >= 0) st.agents[i] = agent;
    else st.agents.push(agent);
  } else {
    await persist("agents", { ...agent, tools: JSON.stringify(agent.tools) });
  }
  await addEvent({
    actor: "usr_human",
    kind: existing ? "agent.updated" : "agent.created",
    level: "info",
    message: `${existing ? "อัปเดต" : "สร้าง"} AI Agent “${agent.name}”`,
    projectId: agent.projectId,
  });
  return agent;
}

export async function updateAgent(id: string, patch: Partial<Agent>): Promise<void> {
  const s = await loadSnapshot();
  const agent = s.agents.find((a) => a.id === id);
  if (!agent) return;
  const next = { ...agent, ...patch };
  if (!dbEnabled()) {
    const st = demo();
    const i = st.agents.findIndex((a) => a.id === id);
    if (i >= 0) st.agents[i] = next;
  } else {
    await persist("agents", { ...next, tools: JSON.stringify(next.tools) });
  }
}

// ── Schedules ───────────────────────────────────────────────────────────────

export function computeNextRun(cadence: Schedule["cadence"], timeOfDay: string, from = new Date()): string | null {
  if (cadence === "manual") return null;
  const [hh, mm] = timeOfDay.split(":").map(Number);
  const d = new Date(from);
  d.setSeconds(0, 0);
  d.setHours(hh || 9, mm || 0, 0, 0);
  const stepToNextDay = () => d.setDate(d.getDate() + 1);
  if (d.getTime() <= from.getTime()) stepToNextDay();
  if (cadence === "hourly") {
    const h = new Date(from);
    h.setSeconds(0, 0);
    h.setMinutes(0, 0);
    h.setHours(h.getHours() + 1);
    return h.toISOString();
  }
  if (cadence === "weekdays") {
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    return d.toISOString();
  }
  if (cadence === "weekly") {
    while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
    return d.toISOString();
  }
  if (cadence === "monthly") {
    while (d.getDate() !== 1) d.setDate(d.getDate() + 1);
    return d.toISOString();
  }
  return d.toISOString();
}

export async function saveSchedule(input: Partial<Schedule> & { projectId: string; flowId: string; name: string }): Promise<Schedule> {
  const s = await loadSnapshot();
  const existing = input.id ? s.schedules.find((x) => x.id === input.id) : undefined;
  const cadence = input.cadence ?? existing?.cadence ?? "daily";
  const timeOfDay = input.timeOfDay ?? existing?.timeOfDay ?? "09:00";
  const schedule: Schedule = {
    id: existing?.id ?? uid("sch"),
    projectId: input.projectId,
    flowId: input.flowId,
    name: input.name,
    cadence,
    timeOfDay,
    timezone: input.timezone ?? existing?.timezone ?? "Asia/Bangkok",
    agentId: input.agentId ?? existing?.agentId ?? "agt_web",
    env: input.env ?? existing?.env ?? "demo",
    nextRunAt: input.status === "paused" ? null : computeNextRun(cadence, timeOfDay),
    lastRunAt: existing?.lastRunAt ?? null,
    lastStatus: existing?.lastStatus ?? null,
    status: input.status ?? existing?.status ?? "active",
    notify: input.notify ?? existing?.notify ?? ["mng"],
  };
  if (!dbEnabled()) {
    const st = demo();
    const i = st.schedules.findIndex((x) => x.id === schedule.id);
    if (i >= 0) st.schedules[i] = schedule;
    else st.schedules.unshift(schedule);
  } else {
    await persist("schedules", { ...schedule, notify: JSON.stringify(schedule.notify) });
  }
  await addEvent({
    actor: "usr_human",
    kind: existing ? "schedule.updated" : "schedule.created",
    level: "info",
    message: `${existing ? "อัปเดต" : "สร้าง"} ตาราง “${schedule.name}” (${cadence} ${timeOfDay})`,
    projectId: schedule.projectId,
  });
  return schedule;
}

export async function deleteSchedule(id: string): Promise<void> {
  if (!dbEnabled()) {
    const st = demo();
    st.schedules = st.schedules.filter((x) => x.id !== id);
  } else {
    await getPool().query("DELETE FROM `schedules` WHERE id = ?", [id]);
  }
  await addEvent({ actor: "usr_human", kind: "schedule.deleted", level: "warn", message: `ลบตารางทดสอบ ${id}` });
}

// ── Policies & settings ─────────────────────────────────────────────────────

export async function updatePolicy(id: string, value: Policy["value"]): Promise<Policy | null> {
  const s = await loadSnapshot();
  const policy = s.policies.find((p) => p.id === id);
  if (!policy) return null;
  const next = { ...policy, value };
  if (!dbEnabled()) {
    const st = demo();
    const i = st.policies.findIndex((p) => p.id === id);
    if (i >= 0) st.policies[i] = next;
  } else {
    await persist("policies", { ...next, value: JSON.stringify(value), options: JSON.stringify(next.options ?? null) });
  }
  await addEvent({
    actor: "usr_human",
    kind: "policy.updated",
    level: "info",
    message: `ปรับนโยบาย “${policy.name}” เป็น ${String(value)}`,
  });
  return next;
}

export async function updateIntegration(id: string, patch: Partial<Integration>): Promise<Integration | null> {
  const s = await loadSnapshot();
  const int = s.integrations.find((i) => i.id === id);
  if (!int) return null;
  const next = { ...int, ...patch, lastSyncAt: iso() };
  if (!dbEnabled()) {
    const st = demo();
    const i = st.integrations.findIndex((x) => x.id === id);
    if (i >= 0) st.integrations[i] = next;
  } else {
    await persist("integrations", { ...next, config: JSON.stringify(next.config) });
  }
  await addEvent({
    actor: "usr_human",
    kind: "integration.updated",
    level: "info",
    message: `อัปเดตการเชื่อมต่อ ${next.name} → ${next.status}`,
  });
  return next;
}

export async function saveProject(input: Partial<Project> & { name: string }): Promise<Project> {
  const s = await loadSnapshot();
  const existing = input.id ? s.projects.find((p) => p.id === input.id) : undefined;
  const key = (input.key ?? existing?.key ?? input.name.slice(0, 6)).toUpperCase().replace(/[^A-Z0-9]/g, "");
  const project: Project = {
    id: existing?.id ?? uid("prj"),
    key: key || "PRJ",
    name: input.name,
    description: input.description ?? existing?.description ?? "",
    baseUrl: input.baseUrl ?? existing?.baseUrl ?? "",
    repoUrl: input.repoUrl ?? existing?.repoUrl ?? "",
    driveFolder: input.driveFolder ?? existing?.driveFolder ?? "",
    env: input.env ?? existing?.env ?? "staging",
    color: input.color ?? existing?.color ?? "#22d3ee",
    status: input.status ?? existing?.status ?? "active",
    menus: input.menus ?? existing?.menus ?? 0,
    owner: input.owner ?? existing?.owner ?? "ยังไม่ระบุ",
    createdAt: existing?.createdAt ?? iso(),
  };
  if (!dbEnabled()) {
    const st = demo();
    const i = st.projects.findIndex((p) => p.id === project.id);
    if (i >= 0) st.projects[i] = project;
    else st.projects.unshift(project);
  } else {
    await persist("projects", project);
  }
  await addEvent({
    actor: "usr_human",
    kind: existing ? "project.updated" : "project.created",
    level: "info",
    message: `${existing ? "อัปเดต" : "สร้าง"} โปรเจกต์ “${project.name}”`,
    projectId: project.id,
  });
  return project;
}

export async function saveDoc(input: Partial<Doc> & { projectId: string; title: string; kind: Doc["kind"] }): Promise<Doc> {
  const s = await loadSnapshot();
  const existing = input.id ? s.docs.find((d) => d.id === input.id) : undefined;
  const doc: Doc = {
    id: existing?.id ?? uid("doc"),
    projectId: input.projectId,
    kind: input.kind,
    title: input.title,
    status: input.status ?? existing?.status ?? "draft",
    language: input.language ?? existing?.language ?? "th",
    words: input.words ?? existing?.words ?? 0,
    content: input.content ?? existing?.content ?? "",
    updatedAt: iso(),
  };
  if (!dbEnabled()) {
    const st = demo();
    const i = st.docs.findIndex((d) => d.id === doc.id);
    if (i >= 0) st.docs[i] = doc;
    else st.docs.unshift(doc);
  } else {
    await persist("docs", doc);
  }
  return doc;
}

export async function deleteDoc(id: string): Promise<void> {
  if (!dbEnabled()) {
    const st = demo();
    st.docs = st.docs.filter((d) => d.id !== id);
  } else {
    await getPool().query("DELETE FROM `docs` WHERE id = ?", [id]);
  }
}

// ── Stats helpers ───────────────────────────────────────────────────────────

export function passRate(runs: Run[]): number {
  const done = runs.filter((r) => r.status === "passed" || r.status === "failed");
  if (!done.length) return 0;
  return Math.round((done.filter((r) => r.status === "passed").length / done.length) * 100);
}

export { iso as nowIso, uid };
