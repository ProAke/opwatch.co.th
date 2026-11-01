// ─────────────────────────────────────────────────────────────────────────────
// Domain types — AI UAREAnizer (ai.uarea.in)
// Zero-touch, multi-agent UAT orchestration for many projects.
// ─────────────────────────────────────────────────────────────────────────────

export type ProviderKind = "anthropic" | "openai" | "google" | "ollama" | "custom";

export interface AiModel {
  id: string;
  name: string;
  vendor: string;
  provider: ProviderKind;
  modelId: string;
  baseUrl?: string;
  keyEnv: string;
  contextK: number;
  costInPerM: number;
  costOutPerM: number;
  strengths: string[];
  status: "active" | "paused";
  keyConfigured: boolean;
}

export type AgentRole =
  | "orchestrator"
  | "test_designer"
  | "web_executor"
  | "api_validator"
  | "db_validator"
  | "report_validator"
  | "issue_writer"
  | "fixer"
  | "doc_writer"
  | "video_writer";

export type Autonomy = "advise" | "semi" | "zero_touch";

export interface Agent {
  id: string;
  projectId: string | null;
  name: string;
  role: AgentRole;
  modelId: string;
  avatar: string;
  systemPrompt: string;
  tools: string[];
  autonomy: Autonomy;
  status: "active" | "paused";
  runsTotal: number;
  passRate: number;
  lastActiveAt: string | null;
}

export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
  baseUrl: string;
  repoUrl: string;
  driveFolder: string;
  env: "production" | "staging" | "demo" | "local";
  color: string;
  status: "active" | "paused" | "archived";
  menus: number;
  owner: string;
  createdAt: string;
}

export type StepKind =
  | "navigate"
  | "click"
  | "fill"
  | "expect"
  | "api.request"
  | "db.query"
  | "report.check"
  | "ai.review"
  | "issue.create"
  | "notify";

export interface FlowStep {
  id: string;
  kind: StepKind;
  name: string;
  target?: string;
  expect?: string;
  assertion?: string;
  critical?: boolean;
}

export interface Flow {
  id: string;
  projectId: string;
  name: string;
  module: string;
  description: string;
  steps: FlowStep[];
  tags: string[];
  browsers: string[];
  version: number;
  status: "draft" | "ready" | "paused";
  updatedAt: string;
  lastPassRate: number | null;
  createdBy: string;
}

export type RunStatus = "queued" | "running" | "passed" | "failed" | "blocked";
export type StepStatus = "pending" | "running" | "passed" | "failed" | "skipped";

export interface RunStep {
  id: string;
  runId: string;
  idx: number;
  kind: StepKind;
  name: string;
  status: StepStatus;
  startedAt: string | null;
  durationMs: number;
  detail: string;
  evidence: string | null;
  aiNote?: string;
}

export interface Run {
  id: string;
  projectId: string;
  flowId: string;
  agentId: string;
  modelId: string;
  trigger: "manual" | "schedule" | "mcp" | "fix_recheck" | "webhook";
  status: RunStatus;
  browser: string;
  env: string;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  verdict: string;
  summary: string;
  aiAnalysis: string;
  evidenceCount: number;
  commit: string | null;
  createdAt: string;
}

export type Severity = "S1" | "S2" | "S3" | "S4";

export interface Issue {
  id: string;
  key: string;
  projectId: string;
  runId: string | null;
  flowId: string | null;
  title: string;
  description: string;
  severity: Severity;
  status: "open" | "triaged" | "fixing" | "in_review" | "closed" | "wontfix";
  source: "uat" | "mcp" | "manual" | "monitor";
  assignee: string;
  agentId: string | null;
  githubUrl: string | null;
  fixBranch: string | null;
  fixPrUrl: string | null;
  recheckRunId: string | null;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

export type Cadence = "manual" | "hourly" | "daily" | "weekdays" | "weekly" | "monthly";

export interface Schedule {
  id: string;
  projectId: string;
  flowId: string;
  name: string;
  cadence: Cadence;
  timeOfDay: string; // HH:mm
  timezone: string;
  agentId: string;
  env: string;
  nextRunAt: string | null;
  lastRunAt: string | null;
  lastStatus: RunStatus | null;
  status: "active" | "paused";
  notify: string[];
}

export type EventLevel = "info" | "success" | "warn" | "error";

export interface ActivityEvent {
  id: string;
  projectId: string | null;
  runId: string | null;
  issueId: string | null;
  actor: string;
  kind: string;
  level: EventLevel;
  message: string;
  createdAt: string;
}

export type DocKind = "user_guide" | "reference" | "api" | "mcp" | "video_script" | "release_note";

export interface Doc {
  id: string;
  projectId: string;
  kind: DocKind;
  title: string;
  status: "draft" | "generating" | "ready";
  language: "th" | "en" | "both";
  words: number;
  content: string;
  updatedAt: string;
}

export type IntegrationKind = "github" | "drive" | "mng" | "slack" | "mcp_client";

export interface Integration {
  id: string;
  kind: IntegrationKind;
  name: string;
  description: string;
  status: "connected" | "disconnected" | "error";
  account: string;
  config: Record<string, string>;
  lastSyncAt: string | null;
  health: number;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  value: string | number | boolean;
  kind: "toggle" | "number" | "text" | "select";
  options?: string[];
  group: "zero_touch" | "quality" | "security" | "reporting";
}

export interface UserRow {
  id: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "tester" | "viewer" | "ai_agent";
  avatar: string;
  lastLoginAt: string | null;
}

export interface Snapshot {
  projects: Project[];
  agents: Agent[];
  models: AiModel[];
  flows: Flow[];
  runs: Run[];
  issues: Issue[];
  schedules: Schedule[];
  events: ActivityEvent[];
  docs: Doc[];
  integrations: Integration[];
  policies: Policy[];
  users: UserRow[];
}

export interface RunWithSteps extends Run {
  steps: RunStep[];
}

export const ROLE_LABEL: Record<AgentRole, string> = {
  orchestrator: "ผู้ควบคุมฝูง",
  test_designer: "ออกแบบบททดสอบ",
  web_executor: "เล่นหน้าเว็บ",
  api_validator: "ตรวจ API",
  db_validator: "ตรวจฐานข้อมูล",
  report_validator: "ตรวจรายงาน",
  issue_writer: "เปิด Issue",
  fixer: "แก้ไขอัตโนมัติ",
  doc_writer: "เขียนคู่มือ",
  video_writer: "ผลิตวิดีโอ",
};

export const STEP_LABEL: Record<StepKind, string> = {
  navigate: "เปิดหน้า",
  click: "คลิก",
  fill: "กรอกข้อมูล",
  expect: "ตรวจ UI",
  "api.request": "เรียก API",
  "db.query": "ตรวจฐานข้อมูล",
  "report.check": "ตรวจรายงาน",
  "ai.review": "AI ตรวจทาน",
  "issue.create": "เปิด Issue",
  notify: "แจ้งเตือน",
};

export const STATUS_LABEL: Record<string, string> = {
  queued: "รอคิว",
  running: "กำลังรัน",
  passed: "ผ่าน",
  failed: "ไม่ผ่าน",
  blocked: "ติดบล็อก",
  pending: "รอ",
  skipped: "ข้าม",
  open: "เปิด",
  triaged: "คัดกรอง",
  fixing: "กำลังแก้",
  in_review: "รอตรวจซ้ำ",
  closed: "ปิดแล้ว",
  wontfix: "ไม่แก้",
  active: "ใช้งาน",
  paused: "หยุดชั่วคราว",
  draft: "ฉบับร่าง",
  ready: "พร้อมใช้",
  archived: "เก็บถาวร",
  connected: "เชื่อมต่อแล้ว",
  disconnected: "ยังไม่เชื่อมต่อ",
  error: "ผิดพลาด",
  generating: "กำลังสร้าง",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  S1: "S1 · วิกฤต",
  S2: "S2 · สูง",
  S3: "S3 · กลาง",
  S4: "S4 · ต่ำ",
};
