import type { AgentRole } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Starter agent crews — used when onboarding a new project so nobody starts
// from an empty roster. Each template is a role + avatar + tools + system prompt
// that the project name/key is interpolated into.
// ─────────────────────────────────────────────────────────────────────────────

export interface AgentBlueprint {
  role: AgentRole;
  label: string;
  avatar: string;
  tools: string[];
  systemPrompt: string;
}

export interface AgentTemplate {
  id: "web" | "api_db" | "full" | "erp";
  name: string;
  description: string;
  bestFor: string;
  agents: AgentBlueprint[];
}

const ctx = (projectName: string, projectKey: string) => `โปรเจกต์ ${projectName} (${projectKey})`;

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: "web",
    name: "เล่นหน้าเว็บอย่างเดียว",
    description: "1 agent สำหรับ walkthrough UI — เหมาะกับโปรเจกต์เล็กที่เพิ่งเริ่ม",
    bestFor: "ระบบเล็ก / MVP / ตรวจ smoke test",
    agents: [
      {
        role: "web_executor",
        label: "ผู้เล่นหน้าเว็บ",
        avatar: "🖱️",
        tools: ["playwright", "stagehand", "screenshot"],
        systemPrompt: "เล่นระบบเหมือนผู้ใช้จริงด้วย Playwright + Stagehand เก็บภาพหน้าจอทุกขั้นตอนสำคัญ และรายงานผลทันที",
      },
    ],
  },
  {
    id: "api_db",
    name: "ตรวจ API + ฐานข้อมูล",
    description: "เน้นตรวจเบื้องหลัง ไม่ต้องกดหน้าจอ — เหมาะกับ backend / integration",
    bestFor: "API service / งาน data pipeline",
    agents: [
      {
        role: "api_validator",
        label: "ผู้ตรวจ API",
        avatar: "🔗",
        tools: ["http", "json_schema", "network_trace"],
        systemPrompt: "เรียก API จริง ตรวจ HTTP status, JSON schema และเวลาตอบสนอง ห้ามถือว่าผ่านถ้า response ว่าง",
      },
      {
        role: "db_validator",
        label: "ผู้ตรวจฐานข้อมูล",
        avatar: "🗄️",
        tools: ["mysql.select", "diff"],
        systemPrompt: "ตรวจข้อมูลจริงด้วย SELECT เท่านั้น และแสดงผลต่างของยอดก่อน/หลังให้เห็นทุกครั้ง",
      },
    ],
  },
  {
    id: "full",
    name: "ครบวงจร (UI + API + DB + Issue)",
    description: "ชุดมาตรฐานที่แนะนำ: เล่นจริง ตรวจลึก และเปิด Ticket อัตโนมัติ",
    bestFor: "เว็บแอปทั่วไป / ระบบหลังบ้าน",
    agents: [
      {
        role: "web_executor",
        label: "ผู้เล่นหน้าเว็บ",
        avatar: "🖱️",
        tools: ["playwright", "stagehand", "computer_use", "screenshot"],
        systemPrompt: "เล่นระบบเหมือนผู้ใช้จริงด้วย Playwright + Stagehand + Computer Use แยกตามช่วงอายุผู้ใช้ เก็บภาพหน้าจอทุกขั้นตอนสำคัญ",
      },
      {
        role: "api_validator",
        label: "ผู้ตรวจ API",
        avatar: "🔗",
        tools: ["http", "json_schema", "network_trace"],
        systemPrompt: "เรียก API จริง ตรวจ HTTP status, JSON schema และความสอดคล้องกับ UI ห้ามถือว่าผ่านถ้า response ว่าง",
      },
      {
        role: "db_validator",
        label: "ผู้ตรวจฐานข้อมูล",
        avatar: "🗄️",
        tools: ["mysql.select", "fixtures", "diff"],
        systemPrompt: "ตรวจข้อมูลจริงหลังจบ flow ด้วย SELECT เท่านั้น ตรวจเฉพาะฐานที่อนุญาต และแสดงผลต่างก่อน/หลังให้เห็นทุกครั้ง",
      },
      {
        role: "issue_writer",
        label: "IssueMate Writer",
        avatar: "🎫",
        tools: ["issues.create", "github.issue", "evidence.attach"],
        systemPrompt: "เขียน Issue ภาษาไทยให้ทีม dev และ AI แก้ได้ทันที: อาการ, ขั้นตอนทำซ้ำ, ผลที่คาดหวัง, ผลที่ได้, หลักฐาน, ระดับ S1–S4",
      },
    ],
  },
  {
    id: "erp",
    name: "ERP เต็มรูปแบบ (ฝูงใหญ่)",
    description: "ครบทั้งออกแบบบททดสอบ ตรวจรายงาน และผลิตคู่มือ — สำหรับระบบใหญ่หลายพันเมนู",
    bestFor: "ERP / ระบบบัญชี / ระบบที่มีรายงานการเงิน",
    agents: [
      {
        role: "test_designer",
        label: "นักออกแบบบททดสอบ",
        avatar: "📐",
        tools: ["spec.read", "flows.write", "repo.read"],
        systemPrompt: "อ่าน SPEC และโครงสร้างเมนู แล้วสร้าง Flow ที่ครอบคลุม happy path, edge case, สิทธิ์ผู้ใช้ และข้อมูลการเงิน",
      },
      {
        role: "web_executor",
        label: "ผู้เล่นหน้าเว็บ",
        avatar: "🖱️",
        tools: ["playwright", "stagehand", "computer_use", "screenshot"],
        systemPrompt: "เล่นระบบเหมือนผู้ใช้จริง แยกตามช่วงอายุผู้ใช้ เก็บภาพหน้าจอทุกขั้นตอนสำคัญ",
      },
      {
        role: "api_validator",
        label: "ผู้ตรวจ API",
        avatar: "🔗",
        tools: ["http", "json_schema"],
        systemPrompt: "เรียก API จริง ตรวจ HTTP status, JSON schema และความสอดคล้องกับ UI",
      },
      {
        role: "db_validator",
        label: "ผู้ตรวจฐานข้อมูล",
        avatar: "🗄️",
        tools: ["mysql.select", "diff"],
        systemPrompt: "ตรวจข้อมูลจริงด้วย SELECT เท่านั้น และต้องแสดงผลต่างของยอดก่อน/หลังทุกครั้ง",
      },
      {
        role: "report_validator",
        label: "ผู้ตรวจรายงาน",
        avatar: "📊",
        tools: ["report.fetch", "excel.read", "db.query"],
        systemPrompt: "ตรวจรายงานเทียบกับ GL และฐานข้อมูล ต้องบอกราคาที่คาดหวังกับที่ได้ทุกครั้งที่ผิด",
      },
      {
        role: "issue_writer",
        label: "IssueMate Writer",
        avatar: "🎫",
        tools: ["issues.create", "github.issue", "evidence.attach"],
        systemPrompt: "เขียน Issue ภาษาไทยให้ทีม dev และ AI แก้ได้ทันที พร้อมหลักฐานและระดับ S1–S4",
      },
      {
        role: "doc_writer",
        label: "นักเขียนคู่มือ & วิดีโอ",
        avatar: "📚",
        tools: ["docs.write", "flow.read", "video.script"],
        systemPrompt: "สร้างคู่มือผู้ใช้ คู่มืออ้างอิง API/MCP และสคริปต์วิดีโอ 2 ระดับ จาก Flow และหลักฐานจริง",
      },
    ],
  },
];

export function buildAgentBlueprints(templateId: AgentTemplate["id"], projectName: string, projectKey: string) {
  const template = AGENT_TEMPLATES.find((t) => t.id === templateId) ?? AGENT_TEMPLATES[2];
  return template.agents.map((a) => ({
    ...a,
    name: `${a.label} · ${projectKey}`,
    systemPrompt: `${ctx(projectName, projectKey)} — ${a.systemPrompt}`,
  }));
}
