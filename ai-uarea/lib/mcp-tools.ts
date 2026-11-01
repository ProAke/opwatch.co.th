// MCP tool catalog — shared by the gateway route and the documentation page.

export const TOOLS = [
  {
    name: "project.list",
    description: "ลิสต์โปรเจกต์ทั้งหมดที่อยู่ในระบบ UAT พร้อมอัตราผ่าน",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "flow.list",
    description: "ลิสต์ flow ทดสอบของโปรเจกต์ (ใช้เลือก flowId ก่อนสั่งรัน)",
    inputSchema: {
      type: "object",
      properties: { projectId: { type: "string" }, status: { type: "string", enum: ["draft", "ready", "paused"] } },
    },
  },
  {
    name: "run.create",
    description: "สั่ง AI รัน flow ทดสอบทันที คืน runId สำหรับติดตามสถานะ",
    inputSchema: {
      type: "object",
      required: ["flowId"],
      properties: {
        flowId: { type: "string" },
        projectId: { type: "string" },
        browser: { type: "string", enum: ["chromium", "firefox", "webkit", "api"] },
        agentId: { type: "string" },
      },
    },
  },
  {
    name: "run.status",
    description: "ดูสถานะ/ผลของ run (เรียกซ้ำเพื่อดูความคืบหน้า)",
    inputSchema: { type: "object", required: ["runId"], properties: { runId: { type: "string" } } },
  },
  {
    name: "run.events",
    description: "ดู event ระหว่างการรัน (ขั้นตอนไหนผ่าน/ไม่ผ่าน พร้อมหลักฐาน)",
    inputSchema: { type: "object", required: ["runId"], properties: { runId: { type: "string" } } },
  },
  {
    name: "issue.create",
    description: "เปิด Ticket เข้า IssueMate พร้อมระดับความรุนแรง S1–S4",
    inputSchema: {
      type: "object",
      required: ["projectId", "title"],
      properties: {
        projectId: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        severity: { type: "string", enum: ["S1", "S2", "S3", "S4"] },
        runId: { type: "string" },
      },
    },
  },
  {
    name: "report.push",
    description: "ส่งสรุปสถานะทั้งหมดเข้า mng.uarea.in",
    inputSchema: { type: "object", properties: {} },
  },
];


export default TOOLS;
