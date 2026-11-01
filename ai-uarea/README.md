# AI UAREAnizer — Zero-Touch UAT Orchestrator

> **ai.uarea.in** · ศูนย์ควบคุมฝูง AI สำหรับทดสอบระบบแบบ Zero Touch
> Next.js 15 (App Router) + MariaDB · multi-project · multi-agent · multi-model

ระบบนี้สร้างจากไอเดียในภาพที่ 1–3 (UAT Tester ของ SML AI Account) แล้วยกระดับเป็น
**แพลตฟอร์มมาตรฐาน** ที่รองรับหลายโปรเจกต์ เลือกโมเดล AI ได้ สร้าง Flow ได้เอง
มีปฏิทิน/ตารางรัน ตรวจสอบการทำงานของ AI และเชื่อม GitHub / Google Drive / mng.uarea.in

---

## 1. แนวคิด (Zero Touch Loop)

```
SPEC / นโยบาย
   │
   ▼
AI ออกแบบ Flow ──► AI เล่นเหมือนผู้ใช้จริง (Playwright · Stagehand · Computer Use)
   ▲                        │
   │                        ▼
   │              ตรวจ UI · API · ฐานข้อมูล · รายงาน
   │                        │
   │                  ผ่าน ─┴─ ไม่ผ่าน
   │                  │         │
   │           ปิดผล + หลักฐาน  ▼
   │                  │   เปิด Issue (S1–S4) + แนบหลักฐาน
   │                  │         ▼
   │                  │   Auto Fixer แก้บน branch แยก → เปิด PR
   │                  │         ▼
   └──────────── ตรวจซ้ำอัตโนมัติ (fix_recheck) ◄─┘
                     │
                     ▼
        รายงานเข้า mng.uarea.in · คู่มือ · วิดีโอ · Release note
```

| ภาพต้นแบบ | สิ่งที่ implement ในระบบนี้ |
| --- | --- |
| **ภาพที่ 1 — ภาพรวมระบบ** | แผนที่โปรเจกต์ → flow → run → agent → หลักฐาน ในหน้า `/projects` และ `/agents` · MCP gateway (`/mcp`) · ระบบภายนอก (ระบบจริง, MariaDB, mng.uarea.in, GitHub, Drive) |
| **ภาพที่ 2 — วงจร AI แก้ → ทดสอบ → แจ้ง → แก้ซ้ำ** | `advanceRun()` จำลอง/เชื่อมผลรันจริง → ตรวจไม่ผ่าน → `autoCreateIssue()` → Auto Fixer (branch `fix/<key>-…` + PR) → recheck run · ดูวงจรได้ที่ `/runs/[id]`, `/issues/[id]` |
| **ภาพที่ 3 — ข้างในการรันสคริปต์ 1 รอบ** | Flow = สคริปต์ (JSON steps) → คิว → executor → เก็บหลักฐานทุกขั้น → ผ่าน/ไม่ผ่าน พร้อม `ai.review` + `issue.create` ปิดท้ายอัตโนมัติ |

---

## 2. ฟีเจอร์

| หมวด | รายละเอียด |
| --- | --- |
| **ศูนย์ควบคุม** | KPI อัตราผ่าน 7 วัน, เทรนด์ 14 วัน, สุขภาพโปรเจกต์, ฟีดการทำงานของ AI, Issue ที่ต้องจับตา, run สด |
| **หลายโปรเจกต์** | แต่ละโปรเจกต์มี env, repo, โฟลเดอร์ Drive, agent, flow, ตาราง และเอกสารของตัวเอง (`/projects/[id]`) |
| **Onboarding wizard** | `/projects/new` — เพิ่ม/ย้ายโปรเจกต์ 4 ขั้น: ข้อมูล → ชุด agent (4 แม่แบบ) → flow แรกจาก SPEC → ตารางรัน · หรือย้ายด้วย bundle (`/api/projects/:id/export` → `/api/projects/import`) |
| **Flow Builder + AI** | เขียน SPEC เป็นภาษาคน → AI แปลงเป็นขั้นตอน (LLM จริงถ้ามีคีย์ / heuristic ภายในถ้าไม่มี) แก้/เลื่อน/ลบขั้นได้ (`/flows/new`) |
| **Run แบบเรียลไทม์** | Timeline ทีละขั้น + progress + หลักฐาน + AI วิเคราะห์, poll ทุก 1.5s (`/runs/[id]`) |
| **ตรวจหลายชั้น** | UI (`click/expect`), API (`api.request`), DB (`db.query`), รายงาน (`report.check`), AI ตรวจทาน (`ai.review`) |
| **IssueMate** | เปิด Ticket อัตโนมัติเมื่อไม่ผ่าน (กันซ้ำด้วย flow ที่ยังเปิดอยู่), ระดับ S1–S4, มอบหมาย Auto Fixer, สั่งตรวจซ้ำ |
| **AI Agent หลายบทบาท** | orchestrator / test designer / web executor / api validator / db validator / report validator / issue writer / fixer / doc writer — สลับโมเดลและระดับอิสระ (advise / semi / zero_touch) ได้ |
| **Model registry** | Anthropic, Google, OpenAI-compatible (DeepSeek/GLM), Ollama — แสดง ctx/cost/strengths และสถานะกุญแจ |
| **ตาราง & ปฏิทิน** | cadence (hourly/daily/weekdays/weekly/monthly), โซนเวลา Asia/Bangkok, ปฏิทินรายเดือน, หยุด/เปิด/ลบ, รันเดี๋ยวนี้ |
| **คู่มือ & วิดีโอ** | สร้างคู่มือผู้ใช้ / reference / API / MCP / สคริปต์วิดีโอภาพรวม–ละเอียด / release note จาก flow + หลักฐานจริง |
| **Integrations** | GitHub (Issue/PR), Google Drive (หลักฐาน), mng.uarea.in (รายงาน + webhook), Slack, MCP — พร้อมปุ่มทดสอบการเชื่อมต่อจริง |
| **เลือก GitHub repo ได้** | หน้า Integrations มี repo picker: ดึงรายการ repo จาก GitHub จริง (ถ้าตั้ง `GITHUB_TOKEN`) หรือรายการตัวอย่าง, เลือก branch, ตั้งเป็นค่าเริ่มต้นของ integration และผูกแยกรายโปรเจกต์ได้ |
| **MCP Gateway** | JSON-RPC 2.0 (initialize / tools/list / tools/call) + REST ย่อ — 6 tools สำหรับ Claude Code / Antigravity |
| **Policies** | นโยบาย Zero Touch, เกณฑ์ผ่าน, auto-issue, auto-fix, DB read-only, masking, SLA 90 วินาที |
| **2 โหมดข้อมูล** | MariaDB เมื่อตั้ง `DB_*` · โหมดสาธิต in-memory เมื่อไม่ตั้ง (เดโมได้ทันที) |

---

## 3. เริ่มใช้งาน

### โหมดสาธิต (ไม่ต้องมีฐานข้อมูล)

```bash
cd ai-uarea
npm install
npm run dev          # http://localhost:3000
```

ระบบจะโหลดชุดข้อมูลตัวอย่าง (3 โปรเจกต์ · 11 agent · 7 flow · 43 run · 8 issue) และ
จำลองการรันให้เห็นสด ๆ (เปิด `/runs`, กดเปิด run ที่ `running` อยู่)

### ใช้งานกับ MariaDB จริง

```bash
cp .env.example .env
# แก้ DB_HOST / DB_NAME / DB_USER / DB_PASSWORD
npm run db:migrate -- --seed     # สร้างฐาน + ตาราง 13 ตาราง + ข้อมูลตัวอย่าง
npm run dev
```

หรือด้วย Docker:

```bash
docker compose up -d --build
docker compose exec app npm run db:migrate -- --seed
# เปิด http://localhost:3000
```

> โครงสร้างฐานข้อมูลอยู่ที่ [`db/schema.sql`](db/schema.sql) — utf8mb4, 13 ตาราง
> (`projects`, `ai_models`, `agents`, `flows`, `runs`, `run_steps`, `issues`,
> `schedules`, `events`, `docs`, `integrations`, `policies`, `users`)

---

## 3.1 ย้ายไปโปรเจกต์ใหม่ (สรุปสั้น)

| อยากทำอะไร | ทำแบบนี้ |
| --- | --- |
| เพิ่มโปรเจกต์ใหม่ | `/projects` → **เพิ่มโปรเจกต์** → `/projects/new` กรอก 4 ขั้น (ข้อมูล → agent crew → flow จาก SPEC → ตาราง) แล้วกดสร้างครั้งเดียวจบ |
| ย้ายโปรเจกต์เดิม (มี flow/agent อยู่แล้ว) | `/projects/[id]` → **ส่งออก bundle** → `/projects/new` → แท็บ **ย้ายโปรเจกต์เดิมเข้ามา** → ตั้งชื่อ/รหัสใหม่ → นำเข้า (id ถูก remap ให้ทั้งหมด) |
| ย้ายทั้งแพลตฟอร์ม (โดเมน/เซิร์ฟเวอร์) | `mysqldump` → `.env` ใหม่ → `npm run build && npm start` หรือ `docker compose up -d` → อัปเดต webhook ที่ mng.uarea.in → ยิง smoke test |

รายละเอียดทั้งหมด (พร้อมคำสั่ง curl, checklist และตารางแก้ปัญหา) อยู่ที่
**[`docs/MOVE-PROJECT.md`](docs/MOVE-PROJECT.md)**

หลังสร้างโปรเจกต์ใหม่ 5 อย่างที่ควรทำต่อ: ต่อ GitHub/Drive → ตรวจนโยบาย → สลับโมเดลราย agent →
รันมือ 1 รอบ → เปิดตารางอัตโนมัติที่ `/schedule`

## 3.2 เชื่อมต่อ / เปลี่ยน GitHub repo

ไปที่ **`/integrations`** → การ์ด GitHub กด **“เปลี่ยน repo”** (หรือเลื่อนลงไปที่หัวข้อ *เลือก GitHub repository ที่จะเชื่อมต่อ*)

| ทำอะไร | วิธี |
| --- | --- |
| ดู repo ที่มีสิทธิ์ | ระบบเรียก `GET /api/github/repos` → มี `GITHUB_TOKEN` จะได้ repo จริงสูงสุด 100 รายการ (เรียงตามที่อัปเดตล่าสุด) + repo ของ `GITHUB_OWNER` ถ้าตั้งไว้ · ไม่มี token = รายการตัวอย่าง |
| เปลี่ยน repo หลัก | เลือก repo → เลือก **Branch เริ่มต้น** (ดึงจาก GitHub จริง) → *นำไปใช้กับ: ค่าเริ่มต้นของ integration* → **เชื่อมต่อ repo นี้** |
| ผูกเฉพาะโปรเจกต์ | เลือก repo → *นำไปใช้กับ: ผูกเฉพาะโปรเจกต์…* → **ผูกกับโปรเจกต์นี้** (หรือใช้ dropdown ในตาราง “repo ของแต่ละโปรเจกต์”) |
| ยกเลิกการผูก | เลือก “— ไม่ผูก —” ในตารางรายโปรเจกต์ หรือกดปุ่มถังขยะเพื่อยกเลิกทั้ง integration |

ผลที่ตามมา:

- `projects.repoUrl` ของโปรเจกต์นั้นเปลี่ยน → หน้าโปรเจกต์/flow แสดง repo ใหม่
- Issue ที่ระบบสร้าง (`IssueMate`) จะได้ `githubUrl` ชี้ repo ของ **โปรเจกต์นั้น** ไม่ใช่ค่า global
- Auto Fixer จะสร้าง branch `fix/<issue-key>` และเปิด PR ใน repo ที่ผูกไว้

ผ่าน API:

```bash
# ผูก repo ให้โปรเจกต์เดียว (ไม่กระทบค่าเริ่มต้น)
curl -X POST https://ai.uarea.in/api/github/connect \
  -H 'content-type: application/json' \
  -d '{"repo":"ProAke/mng-erp","projectId":"prj_opwatch","projectOnly":true}'

# ตั้ง repo หลักของ integration พร้อม branch
curl -X POST https://ai.uarea.in/api/github/connect \
  -H 'content-type: application/json' \
  -d '{"repo":"ProAke/csf.co.th","branch":"main"}'
```

> **ในเครื่องที่ผ่าน proxy/self-signed CA** (เช่น sandbox, corporate proxy) ให้รัน
> `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt npm run dev`
> ไม่งั้น Node จะเรียก `api.github.com` ไม่ได้ (ระบบจะ fallback ไปรายการตัวอย่างพร้อมข้อความบอก)

## 4. Environment variables

| ตัวแปร | ใช้ทำอะไร |
| --- | --- |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | เปิดโหมด MariaDB (ว่าง = โหมดสาธิต) |
| `MCP_TOKEN` | บังคับ Bearer token ที่ `/api/mcp` |
| `MNG_BASE_URL` / `MNG_API_KEY` | ส่งรายงานเข้า mng.uarea.in (`POST /api/uat/report`) |
| `GITHUB_TOKEN` / `GITHUB_OWNER` | `GITHUB_TOKEN` = ใช้ดึงรายการ repo จริง + เปิด Issue/PR; `GITHUB_OWNER` (ไม่บังคับ) = ดึง repo ขององค์กรเพิ่ม |
| `GOOGLE_DRIVE_FOLDER_ID` | ปลายทางหลักฐาน/คู่มือ |
| `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` / `OPENAI_API_KEY` / `ZHIPU_API_KEY` / `OLLAMA_API_KEY` | เปิดใช้ LLM จริง (มีตัวไหนใช้ตัวนั้น) |

*(กุญแจอ่านจาก environment เท่านั้น ไม่ถูกเก็บในฐานข้อมูล)*

---

## 5. REST API

| Method | Path | คำอธิบาย |
| --- | --- | --- |
| `GET` | `/api/health` | สถานะระบบ + โหมดจัดเก็บ + จำนวนข้อมูล |
| `GET/POST` | `/api/projects/onboard` | แม่แบบ agent / สร้างโปรเจกต์ + agent + flow + ตาราง ในครั้งเดียว |
| `GET` | `/api/projects/:id/export` | ส่งออก bundle ของโปรเจกต์ (`?download=1` เพื่อดาวน์โหลด) |
| `POST` | `/api/projects/import` | นำเข้า bundle เป็นโปรเจกต์ใหม่ (remap id ให้อัตโนมัติ) |
| `GET/POST` | `/api/cron` | ตรวจตารางที่ถึงกำหนดแล้วยิงรัน (มี `[scheduler]` ticker 60 วิในตัว) |
| `GET/POST` | `/api/runs` | list / สั่งรัน (`{flowId, projectId?, trigger?}`) |
| `GET` | `/api/runs/:id` | advance + ดูสถานะ/ขั้นตอน (ใช้ poll) |
| `GET/POST` | `/api/flows` | list / สร้าง–แก้ flow |
| `POST` | `/api/flows/generate` | AI ออกแบบ flow จาก SPEC |
| `PATCH/DELETE` | `/api/flows/:id` | แก้ / ลบ |
| `GET/POST` | `/api/issues` · `PATCH /api/issues/:id` | Ticket |
| `GET/POST/DELETE` | `/api/schedules` | ตารางรัน |
| `PATCH` | `/api/policies` | เปลี่ยนนโยบาย |
| `PATCH` | `/api/agents` · `/api/models` | สลับโมเดล / หยุด agent |
| `POST` | `/api/docs` | ให้ AI ผลิตคู่มือ/สคริปต์วิดีโอ |
| `POST` | `/api/integrations` | ทดสอบการเชื่อมต่อ (mng/GitHub ยิงจริง — ตรวจ repo ที่ผูกอยู่) |
| `GET` | `/api/github/repos` | รายการ repo ที่เลือกเชื่อมต่อได้ (+ repo ที่ผูกกับแต่ละโปรเจกต์) |
| `GET` | `/api/github/branches?repo=` | รายการ branch ของ repo |
| `POST` | `/api/github/connect` | เปลี่ยน repo (ระดับ integration หรือผูกกับ `projectId`) / ยกเลิกการผูก |
| `PATCH` | `/api/projects/:id` | อัปเดต repoUrl / baseUrl / env / owner ของโปรเจกต์ |
| `POST` | `/api/sync` | ดันสรุปทั้ง workspace เข้า mng.uarea.in |
| `GET/POST` | `/api/mcp` | MCP gateway (JSON-RPC 2.0) |

ตัวอย่าง:

```bash
# สั่งรัน flow
curl -X POST https://ai.uarea.in/api/runs \
  -H 'content-type: application/json' \
  -d '{"flowId":"flw_tax","projectId":"prj_sml"}'

# ติดตามผล
curl https://ai.uarea.in/api/runs/<runId>
```

---

## 6. MCP — ให้ Claude Code / Antigravity สั่งงาน

```json
{
  "mcpServers": {
    "uarea-uat": {
      "type": "http",
      "url": "https://ai.uarea.in/api/mcp",
      "headers": { "Authorization": "Bearer $MCP_TOKEN" }
    }
  }
}
```

Tools: `project.list`, `flow.list`, `run.create`, `run.status`, `run.events`,
`issue.create`, `report.push`

```bash
# แบบ JSON-RPC
curl -X POST https://ai.uarea.in/api/mcp -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"run.create","arguments":{"flowId":"flw_tax"}}}'

# แบบย่อ
curl -X POST https://ai.uarea.in/api/mcp -H 'content-type: application/json' \
  -d '{"tool":"flow.list","arguments":{"status":"ready"}}'
```

มี Playground ให้ลองยิงจริงได้ที่หน้า `/mcp`

---

## 7. การเชื่อมกับระบบหลัก mng.uarea.in

* **ai.uarea.in → mng** : `POST {MNG_BASE_URL}/api/uat/report` ด้วย Bearer `MNG_API_KEY`
  ทุกครั้งที่ run จบ (payload: project, runId, status, passed, failed, verdict, finishedAt)
  และ `/api/sync` สำหรับสรุปทั้ง workspace
* **mng → ai** : เรียก `/api/mcp` (run.create / issue.create) เป็น webhook หรือใช้ปุ่มในระบบหลัก
* ถ้าไม่ตั้ง `MNG_API_KEY` ระบบจะบันทึกเป็น event ว่า “โหมดสาธิต” เพื่อให้ demo ได้โดยไม่ยิงออกนอก

---

## 8. ต่อยอดเป็น executor จริง (Playwright / Stagehand / Computer Use)

ตัวจำลองการรันอยู่ใน `lib/store.ts` → `advanceRun()` ซึ่งเดินขั้นตามเวลาจริงและสร้างผลลัพธ์
เชิงกำหนด (deterministic) เพื่อให้ UI ทำงานได้ครบวงจรแม้ยังไม่ต่อเบราว์เซอร์

การต่อของจริงทำได้โดยไม่แก้ UI เลย:

1. เพิ่ม worker (แยกโปรเซส/คอนเทนเนอร์) ที่อ่าน `flows.steps` จาก MariaDB
2. แปลง step → คำสั่ง executor:
   * `navigate/click/fill/expect` → Playwright (+ Stagehand `act()` หรือ Computer Use สำหรับหน้าที่ไม่มี selector)
   * `api.request` → fetch พร้อมเก็บ request/response
   * `db.query` → connection แบบ **read-only** ต่อฐาน `smldemo`
   * `report.check` → ดึงรายงาน + เทียบ GL
   * `ai.review` → ส่งหลักฐานให้โมเดลตรวจทาน
3. เขียนผลกลับ `run_steps` / `runs` และอัปโหลดหลักฐานเข้า Drive
4. ให้ `/api/runs/:id` อ่านจาก DB ตรง ๆ (ตอนนี้เรียก `advanceRun()` เป็น fallback)

---

## 9. ความปลอดภัยที่บังคับไว้

- AI เขียนฐานข้อมูลไม่ได้ (นโยบาย `pol_db_write = false`) และจำกัดที่ฐาน `smldemo`
- Auto Fixer แก้ได้เฉพาะ branch `fix/*` และ **ห้าม merge เอง** (ต้องมีคนรีวิว)
- หลักฐานถูกสแกน/มาสก์ข้อมูลลับก่อนอัปโหลด Drive
- MCP ต้องมี `MCP_TOKEN`; ทุกการเรียกถูกบันทึกใน `events`
- S1 ต้องแจ้ง Slack + mng ภายใน 60 วินาที (SLA รายงาน 90 วินาที)

---

## 10. โครงสร้างโค้ด

```
ai-uarea/
├─ app/                  หน้า UI (App Router) + API routes
│  ├─ page.tsx           ศูนย์ควบคุม
│  ├─ runs/ flows/ issues/ schedule/ agents/ models/ projects/ docs/ integrations/ mcp/ settings/
│  └─ api/               runs · flows · issues · schedules · policies · agents · models · docs · integrations · sync · mcp · health
├─ components/           Shell, charts, builder, live run detail, policy editor, …
├─ lib/                  types · seed-data · db (mysql2) · store (business logic) · metrics · docgen · mcp-tools · ai
├─ db/schema.sql         MariaDB schema 13 ตาราง
└─ scripts/              migrate.mjs · seed.mjs
```

---

## 11. Roadmap ที่วางไว้

- [ ] Worker จริง (Playwright + Stagehand) แทน simulation
- [ ] Auth (NextAuth / OIDC) + RBAC ตาม `users.role`
- [ ] Queue (BullMQ/Redis) สำหรับรันพร้อมกันหลายสิบ flow
- [ ] Video pipeline (Playwright record + TTS) แนบในหน้า `/docs`
- [ ] Webhook ผู้ให้บริการ Git (push → รัน regression อัตโนมัติ)
- [ ] Cost dashboard ต่อ run/โปรเจกต์ จาก token usage จริง
