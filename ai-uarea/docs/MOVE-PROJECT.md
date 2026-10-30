# ย้ายไปโปรเจกต์ใหม่ — คู่มือปฏิบัติ

ระบบ **AI UAREAnizer (ai.uarea.in)** ออกแบบให้รองรับหลายโปรเจกต์พร้อมกัน จึงมีคำว่า “ย้าย” อยู่ 3 ความหมาย
เลือกหัวข้อที่ตรงกับสถานการณ์ของคุณ

| สถานการณ์ | ไปที่ |
| --- | --- |
| **A. อยากเพิ่มโปรเจกต์ใหม่** (ระบบเดิมยังอยู่ครบ) | [A](#a-เพิ่มโปรเจกต์ใหม่-แนะนำ) |
| **B. ย้ายโปรเจกต์เดิมที่มี flow/agent อยู่แล้ว** ไปเป็นโปรเจกต์ใหม่ (เช่น แยก env, ทำสำเนา, ย้ายไป instance อื่น) | [B](#b-ย้ายโปรเจกต์เดิม-ด้วย-bundle) |
| **C. ย้ายแพลตฟอร์มทั้งชุด** (ai.uarea.in) ไปเซิร์ฟเวอร์/โดเมนใหม่ | [C](#c-ย้ายแพลตฟอร์มทั้งชุด-โดเมน--เซิร์ฟเวอร์ใหม่) |

---

## A. เพิ่มโปรเจกต์ใหม่ (แนะนำ)

**ทุกอย่างทำได้จากหน้าเว็บ 4 ขั้น — ไม่ต้องแก้โค้ด ไม่ต้องรีสตาร์ต**

```
/projects  →  ปุ่ม “เพิ่มโปรเจกต์”  →  /projects/new
```

1. **ข้อมูลโปรเจกต์** — ชื่อ, key (ขึ้นต้นเลข Ticket เช่น `SMLHR-101`), environment, URL ระบบจริง,
   repo GitHub, โฟลเดอร์ Drive, เจ้าของ, จำนวนเมนู, สีประจำโปรเจกต์
2. **ชุด AI Agent** — เลือกแม่แบบ
   | แม่แบบ | ได้อะไร | เหมาะกับ |
   | --- | --- | --- |
   | `web` | ผู้เล่นหน้าเว็บ 1 ตัว | MVP / smoke test |
   | `api_db` | ผู้ตรวจ API + ฐานข้อมูล | backend / integration |
   | `full` *(แนะนำ)* | UI + API + DB + IssueMate | เว็บแอปทั่วไป |
   | `erp` | เพิ่ม test designer, report validator, doc writer | ERP / ระบบบัญชี |
3. **Flow แรกจาก SPEC** — พิมพ์ความต้องการทีละบรรทัด กด **“ดูก่อน”** เพื่อดูขั้นตอนที่ AI ออกแบบ
   (ถ้าตั้ง `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` / `OPENAI_API_KEY` จะใช้ LLM จริง ไม่ตั้งก็ใช้ heuristic ภายใน)
4. **ตารางรันอัตโนมัติ** — daily / weekdays / weekly / monthly (Asia/Bangkok) หรือเลือก *ไม่ตั้ง* เพื่อกดเองก่อน

กด **“สร้างโปรเจกต์ & เริ่มใช้งาน”** ระบบจะสร้างให้ทั้งหมดในครั้งเดียว:

- โปรเจกต์ + agent crew (พร้อม system prompt ที่อ้างชื่อโปรเจกต์)
- Flow แรก (บันทึกเป็น `ready`) + ตารางรัน
- event `project.onboarded` ในฟีด และหน้าโปรเจกต์พร้อม dashboard ของตัวเอง

หลังสร้างเสร็จ 5 อย่างที่ควรทำต่อ:

1. `/integrations` → ต่อ GitHub (repo ของโปรเจกต์นี้) และ Google Drive (โฟลเดอร์หลักฐาน)
2. `/settings` → ตรวจนโยบาย: เกณฑ์ผ่าน, auto-issue (S1–S4), auto-fix, DB read-only, SLA 90 วินาที
3. `/agents` → สลับโมเดล/ระดับอิสระรายตัว
4. `/runs` → กดรัน 1 รอบด้วยมือเพื่อยืนยันว่า selector/ข้อมูลตรงกับระบบจริง
5. `/schedule` → เปิดรอบอัตโนมัติเมื่อมั่นใจ

> เทียบเท่า API: `POST /api/projects/onboard` (ใช้ได้จาก CI หรือสคริปต์ภายใน)
> ```bash
> curl -X POST https://ai.uarea.in/api/projects/onboard \
>   -H "authorization: Bearer $MCP_TOKEN" -H 'content-type: application/json' \
>   -d '{"project":{"name":"SML HR","key":"SMLHR","baseUrl":"https://hr.smlwork.com","env":"demo"},
>        "agents":{"template":"full","autonomy":"zero_touch"},
>        "flow":{"module":"ลา","spec":"เปิดหน้า /leave/new\nกรอก 2 วัน\nคลิกส่ง\nคาดหวัง รออนุมัติ"},
>        "schedule":{"cadence":"daily","timeOfDay":"08:30"}}'
> ```

---

## B. ย้ายโปรเจกต์เดิม ด้วย bundle

ใช้เมื่อ: ต้องการสำเนาโปรเจกต์ (เช่น แยก demo vs staging), ย้ายข้าม instance
หรือย้ายจากโหมดสาธิตไป MariaDB โดยไม่ต้องพิมพ์ flow ใหม่

### B1. ส่งออก (ฝั่งต้นทาง)

```bash
# ดาวน์โหลดไฟล์ .json (มีโปรเจกต์ + agent + flow + ตาราง + เอกสาร + issue)
curl -OJ https://ai.uarea.in/api/projects/<projectId>/export?download=1
```

หรือกดปุ่ม **“ส่งออก bundle”** ที่หน้า `/projects/[id]`

รูปแบบไฟล์ (`uarea-project-bundle@1`):

```json
{
  "schema": "uarea-project-bundle@1",
  "exportedAt": "2026-10-30T05:12:00.000Z",
  "source": { "projectId": "prj_sml", "name": "SML AI Account", "key": "SMLAIACC" },
  "project": { "name": "…", "key": "…", "baseUrl": "…", "env": "demo", "…": "…" },
  "agents":   [ { "id": "agt_web", "role": "web_executor", "modelId": "mdl_deepseek", "…": "…" } ],
  "flows":    [ { "id": "flw_tax", "name": "ภาษี VAT 7%", "steps": [ … ], "…": "…" } ],
  "schedules":[ … ],
  "docs":     [ … ],
  "issues":   [ … ],
  "counts":   { "agents": 4, "flows": 1, "steps": 8, "schedules": 1, "docs": 0, "issues": 0 }
}
```

### B2. นำเข้า (ฝั่งปลายทาง)

หน้า `/projects/new` → แท็บ **“ย้ายโปรเจกต์เดิมเข้ามา”** → เลือกไฟล์ หรือวาง JSON →
ตั้งชื่อ/รหัสใหม่ → **“นำเข้าโปรเจกต์”**

หรือผ่าน API:

```bash
curl -X POST https://ai.uarea.in/api/projects/import \
  -H 'content-type: application/json' \
  -d "{\"bundle\": $(cat smlaiacc-project-bundle.json), \"name\": \"SML AI Account (ย้าย)\", \"key\": \"SMLAICC2\"}"
```

สิ่งที่ระบบทำให้อัตโนมัติ:

- สร้างโปรเจกต์ใหม่ + **remap id ทั้งหมด** (agent/flow/schedule ผูกกันถูกต้องเหมือนเดิม)
- เลือกได้ว่าจะนำเข้าส่วนไหน (`include: { agents, flows, schedules, docs, issues }`)
- ถ้าไม่ส่ง `name` / `key` จะใช้ค่าเดิม แต่ระบบจะสร้างเป็นโปรเจกต์ใหม่ (key ที่ชนกันจะถูกสร้างเป็นโปรเจกต์แยก)

### B3. หลังนำเข้า — ปรับให้ชี้ระบบใหม่

| ต้องแก้ | ที่ไหน | หมายเหตุ |
| --- | --- | --- |
| `baseUrl` | `/projects/[id]` (หรือ `PATCH /api/projects`) | ให้ชี้โดเมนของระบบใหม่ |
| repo / Drive | หน้าเดียวกัน | แยก Issue/หลักฐานของโปรเจกต์ใหม่ |
| env | `staging` / `demo` | อย่าให้ชี้ `production` ระหว่างทดสอบรอบแรก |
| selector ในขั้นตอน | `/flows/[id]/edit` | ถ้า UI เปลี่ยน ต้องแก้ `target` |
| ตารางรัน | `/schedule` | เปิดหลังยืนยันว่า flow ผ่าน |

แล้ว **กดรัน 1 รอบ** (`/flows/[id]` → “รันเดี๋ยวนี้”) เพื่อยืนยันก่อนเปิดตารางอัตโนมัติ

---

## C. ย้ายแพลตฟอร์มทั้งชุด (โดเมน / เซิร์ฟเวอร์ใหม่)

### C1. ฐานข้อมูล

```bash
# ต้นทาง
mysqldump --single-transaction --routines --default-character-set=utf8mb4 \
  -h $OLD_HOST -u $DB_USER -p ai_uarea > ai_uarea.sql

# ปลายทาง
mysql -h $NEW_HOST -u $DB_USER -p -e "CREATE DATABASE ai_uarea CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
mysql -h $NEW_HOST -u $DB_USER -p ai_uarea < ai_uarea.sql
```

ถ้าเริ่มใหม่ทั้งหมด: `npm run db:migrate -- --seed` บนเครื่องใหม่

### C2. แอปพลิเคชัน

```bash
git clone <repo> && cd ai-uarea
cp .env.example .env      # ใส่ DB_*, MCP_TOKEN, MNG_API_KEY, LLM keys
npm ci
npm run build && npm run start      # หรือ docker compose up -d --build
```

Reverse proxy (nginx) ตัวอย่าง:

```nginx
server {
  listen 443 ssl http2;
  server_name ai.uarea.in;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

> `next.config.ts` อนุญาต dev-origin ของ `*.uarea.in` และ preview แล้ว — ถ้าใช้โดเมนอื่นให้เพิ่มใน
> `allowedDevOrigins`

### C3. หลังย้าย — checklist

- [ ] `GET /api/health` คืน `{"ok":true,"storage":"mariadb", ...}`
- [ ] หน้า `/` โหลดได้ และตัวเลข KPI ตรงกับต้นทาง
- [ ] `POST /api/cron` คืน `{"ok":true,"fired":[…]}` (ตรวจ scheduler)
- [ ] ตั้ง `MCP_TOKEN` ใหม่ + แจ้งทีมที่ใช้ Claude Code/Antigravity เปลี่ยน URL
- [ ] แจ้ง **mng.uarea.in** เปลี่ยน base URL ของ webhook มาที่โดเมนใหม่
- [ ] หมุนคีย์ที่อาจหลุด (LLM keys, `MNG_API_KEY`, `GITHUB_TOKEN`)
- [ ] อัปเดต Google Drive / GitHub integration ให้ชี้ปลายทางใหม่
- [ ] ลบ/ปิดระบบเก่าเมื่อครบ 7 วัน และเก็บ dump ไว้ 30 วัน

### C4. ถ้าใช้ Docker

```bash
docker compose up -d --build
docker compose exec app npm run db:migrate      # ครั้งแรก
docker compose logs -f app                      # ดู [scheduler] ticker
```

ข้อมูลถาวรอยู่ใน volume `db_data` — ย้ายเครื่องให้ `docker run --rm -v db_data:/data alpine tar czf - /data > db_data.tgz`

---

## ตารางแก้ปัญหา

| อาการ | สาเหตุ | แก้ |
| --- | --- | --- |
| สร้างโปรเจกต์แล้ว key ซ้ำ | key ถูกใช้แล้ว | เปลี่ยน key หรือปล่อยว่างให้ระบบสร้างให้ |
| นำเข้า bundle แล้ว flow ไม่มี | `include.flows = false` | ส่ง `include` ใหม่ หรือ import ซ้ำด้วยชื่ออื่น |
| flow รันแล้วไม่ผ่านตั้งแต่ขั้นแรก | `baseUrl` ยังชี้ระบบเก่า / selector เปลี่ยน | แก้ baseUrl และขั้นตอนใน `/flows/[id]/edit` |
| ข้อมูลหายหลังรีสตาร์ต | ยังไม่ตั้ง `DB_HOST` (โหมดสาธิต in-memory) | ตั้ง `DB_*` แล้ว `npm run db:migrate -- --seed` |
| `/api/cron` ตอบ 401 | ตั้ง `CRON_SECRET`/`MCP_TOKEN` ไว้ | ส่ง header `authorization: Bearer …` |
| mng ไม่ได้รับรายงาน | ไม่ได้ตั้ง `MNG_API_KEY` | ระบบจะบันทึกเป็น event “โหมดสาธิต” แทนการยิงจริง |

---

## ภาพรวมสิ่งที่ “ติดไปกับโปรเจกต์”

| ติดไปด้วย (ใน bundle) | ไม่ติดไป (ต้องตั้งใหม่ราย instance) |
| --- | --- |
| โปรเจกต์, agent + system prompt, flow + steps, ตาราง, เอกสาร, issue | กุญแจ API ทั้งหมด (อ่านจาก environment) |
| ประวัติ run/หลักฐาน | ไฟล์หลักฐานจริงใน Drive |
| | สิทธิ์ GitHub / webhook endpoint |
| | โดเมน, TLS, reverse proxy |
