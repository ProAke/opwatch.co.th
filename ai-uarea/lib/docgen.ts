import type { Doc, Flow, Project, Run, Snapshot } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Doc factory — turns real flows + run evidence into manuals and video scripts.
// If an LLM key is configured the same prompts are sent to the provider
// (see lib/ai.ts); otherwise this deterministic template keeps the pipeline
// complete so the "zero touch deliverable" is never blocked.
// ─────────────────────────────────────────────────────────────────────────────

const KIND_TITLE: Record<Doc["kind"], string> = {
  user_guide: "คู่มือผู้ใช้",
  reference: "คู่มืออ้างอิง",
  api: "เอกสาร API",
  mcp: "เอกสาร MCP",
  video_script: "สคริปต์วิดีโอ",
  release_note: "Release note",
};

export const DOC_KIND_TITLE = KIND_TITLE;

export function generateDoc(args: {
  kind: Doc["kind"];
  project: Project;
  flows: Flow[];
  runs: Run[];
  snapshot: Snapshot;
  detail?: "overview" | "deep";
}): { title: string; content: string; words: number } {
  const { kind, project, flows, runs } = args;
  const passed = runs.filter((r) => r.status === "passed").length;
  const head = `# ${KIND_TITLE[kind]} — ${project.name}\n\n> สร้างโดย AI UAREAnizer · โปรเจกต์ ${project.key} · ${flows.length} flow · ${
    runs.length
  } run (ผ่าน ${passed})\n\n`;

  const flowSection = flows
    .map((f, i) => {
      const steps = f.steps
        .map((s, idx) => `${idx + 1}. **${s.name}** _(${s.kind})_${s.expect ? ` — คาดหวัง: ${s.expect}` : ""}${s.assertion ? ` — เงื่อนไข: \`${s.assertion}\`` : ""}`)
        .join("\n");
      return `## ${i + 1}. ${f.name}\n\nโมดูล: ${f.module} · เวอร์ชัน ${f.version} · อัตราผ่านล่าสุด ${
        f.lastPassRate ?? "—"
      }%\n\n${f.description}\n\n${steps}\n`;
    })
    .join("\n");

  switch (kind) {
    case "user_guide": {
      const content =
        head +
        `## การเริ่มต้นใช้งาน\n\n1. เปิด ${project.baseUrl}\n2. เข้าสู่ระบบด้วยบัญชีขององค์กร\n3. เลือกเมนูตามบทบาทของคุณ\n\n` +
        flowSection +
        `\n## การขอความช่วยเหลือ\n\n- เปิด Issue ผ่านเมนู “แจ้งปัญหา” ระบบจะแนบข้อมูลหน้าจอให้อัตโนมัติ\n- ติดต่อ ${project.owner}\n`;
      return { title: `${KIND_TITLE[kind]} ${project.name}`, content, words: countWords(content) };
    }
    case "reference": {
      const content =
        head +
        `## ตารางโมดูล\n\n| โมดูล | Flow | ขั้นตอน | อัตราผ่าน |\n| --- | --- | --- | --- |\n` +
        flows.map((f) => `| ${f.module} | ${f.name} | ${f.steps.length} | ${f.lastPassRate ?? "—"}% |`).join("\n") +
        `\n\n## รายละเอียดขั้นตอนทั้งหมด\n\n` +
        flowSection;
      return { title: `${KIND_TITLE[kind]} ${project.name}`, content, words: countWords(content) };
    }
    case "api": {
      const content =
        head +
        `## Authentication\n\n\`\`\`http\nAuthorization: Bearer <token>\n\`\`\`\n\n## Endpoints ที่ถูกตรวจโดย UAT\n\n` +
        flows
          .flatMap((f) => f.steps.filter((s) => s.kind === "api.request"))
          .map(
            (s) =>
              `### ${s.target ?? "—"}\n\n- การตรวจ: ${s.assertion ?? s.name}\n- ตัวอย่าง\n\n\`\`\`bash\ncurl -H "Authorization: Bearer $TOKEN" ${project.baseUrl}${
                s.target ?? ""
              }\n\`\`\`\n`,
          )
          .join("\n") +
        `\n## Response ที่คาดหวัง\n\nทุก endpoint ต้องตอบภายใน 3 วินาที และไม่คืนค่า null ในฟิลด์บังคับ\n`;
      return { title: `${KIND_TITLE[kind]} ${project.name}`, content, words: countWords(content) };
    }
    case "mcp": {
      const content =
        head +
        `## การเชื่อมต่อ\n\n\`\`\`json\n{\n  "mcpServers": {\n    "uarea-uat": {\n      "url": "https://ai.uarea.in/api/mcp",\n      "headers": { "Authorization": "Bearer $MCP_TOKEN" }\n    }\n  }\n}\n\`\`\`\n\n` +
        `## Tools\n\n| Tool | คำอธิบาย | พารามิเตอร์ |\n| --- | --- | --- |\n` +
        `| \`run.create\` | สั่งรัน flow | \`flowId\`, \`projectId\`, \`browser\` |\n` +
        `| \`run.status\` | ดูสถานะ run | \`runId\` |\n` +
        `| \`run.events\` | ดู event ระหว่างรัน | \`runId\` |\n` +
        `| \`issue.create\` | เปิด Ticket | \`projectId\`, \`title\`, \`severity\` |\n` +
        `| \`flow.list\` | ดู flow ทั้งหมด | \`projectId\` |\n` +
        `| \`report.push\` | ส่งรายงานเข้า mng.uarea.in | \`runId\` |\n`;
      return { title: `${KIND_TITLE[kind]} ${project.name}`, content, words: countWords(content) };
    }
    case "video_script": {
      const deep = args.detail !== "overview";
      const blocks = flows.flatMap((f, i) => {
        const intro = `### ฉาก ${i + 1}: ${f.name}\n\n- ภาพ: หน้าจอ ${f.module}\n- เสียง: “ต่อไปจะเป็นการทดสอบ ${f.name}”\n`;
        if (!deep) return [intro];
        const steps = f.steps
          .map((s, idx) => `  - ${idx + 1}. ${s.name}${s.expect ? ` (คาดหวัง ${s.expect})` : ""}`)
          .join("\n");
        return [intro + steps + "\n"];
      });
      const content =
        head +
        `## ข้อมูลวิดีโอ\n\n- ระยะเวลาโดยประมาณ: ${deep ? 18 : 6} นาที\n- ผู้อ่าน: AI Voice (ไทย)\n- ความละเอียด: 1920×1080\n\n` +
        `### เปิดเรื่อง\n\nภาพรวมระบบ ${project.name} — ${project.description}\n\n` +
        blocks.join("\n") +
        `\n### ปิดเรื่อง\n\n- สรุปผล: ${runs.length} รอบทดสอบ ล่าสุด ${
          runs[0]?.status === "passed" ? "ผ่านทั้งหมด" : "พบประเด็นที่ต้องแก้"
        }\n- ช่องทางติดต่อ: ${project.owner}\n`;
      return { title: `${KIND_TITLE[kind]} ${deep ? "ละเอียด" : "ภาพรวม"} — ${project.name}`, content, words: countWords(content) };
    }
    default: {
      const content =
        head +
        `## สรุปการเปลี่ยนแปลง\n\n` +
        runs
          .slice(0, 10)
          .map((r) => `- ${r.createdAt.slice(0, 10)} · ${r.status === "passed" ? "✅" : "❌"} ${r.verdict}`)
          .join("\n") +
        `\n\n## Issue ที่ปิดในรอบนี้\n\n` +
        args.snapshot.issues
          .filter((i) => i.projectId === project.id && i.status === "closed")
          .map((i) => `- ${i.key} · ${i.title}`)
          .join("\n");
      return { title: `${KIND_TITLE[kind]} — ${project.name}`, content, words: countWords(content) };
    }
  }
}

function countWords(text: string): number {
  const th = (text.match(/[\u0E00-\u0E7F]{2,}/g) ?? []).length;
  const en = (text.match(/[A-Za-z]+/g) ?? []).length;
  return th + en;
}
