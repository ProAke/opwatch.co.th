# เปลี่ยน GitHub repo → `ProAke/aixaccountuat`

> สถานะปัจจุบันของระบบ: **integration GitHub ผูกกับ `ProAke/aixaccountuat` (branch `main`) แล้ว**
> และโปรเจกต์ **SMLAIACC** ชี้ repo นี้ด้วย — เอกสารนี้บอกวิธีเปลี่ยนซ้ำ/เปลี่ยนเป็น repo อื่นในอนาคต

---

## 1. เปลี่ยนผ่านหน้าเว็บ (แนะนำ — ไม่ต้องรีสตาร์ต)

### 1.1 เปลี่ยน repo หลักของ integration

```
/integrations  →  การ์ด GitHub  →  ปุ่ม “เปลี่ยน repo”
              (หรือเลื่อนลงหัวข้อ “เลือก GitHub repository ที่จะเชื่อมต่อ”)
```

1. ในช่องค้นหา monta **หรือ** วาง URL ลงช่อง *“วาง URL / owner/name ของ repo ที่ไม่แสดงในรายการ”*
   ```
   https://github.com/ProAke/aixaccountuat.git
   ```
   → กด **“ใช้ repo นี้”** (ระบบตัด `https://github.com/` และ `.git` ให้เอง)
2. เลือก **Branch เริ่มต้น** = `main`
3. *นำไปใช้กับ:* → **“ค่าเริ่มต้นของ integration (ใช้ทุกโปรเจกต์ที่ยังไม่ระบุ)”**
4. กด **“เชื่อมต่อ repo นี้”**

### 1.2 ผูก repo ให้โปรเจกต์ที่ต้องการใช้ repo นี้

ในตาราง **“repo ของแต่ละโปรเจกต์”** → เปลี่ยน dropdown ของโปรเจกต์นั้นเป็น `ProAke/aixaccountuat`
(หรือในหน้าต่างเลือก repo ให้เลือก *“ผูกเฉพาะโปรเจกต์: SMLAIACC — SML AI Account”*)

> ถ้าโปรเจกต์ไหน **ไม่ผูก** ระบบจะใช้ค่าเริ่มต้นของ integration ให้อัตโนมัติ

---

## 2. เปลี่ยนผ่าน API (ใช้ใน CI / สคริปต์)

```bash
BASE=https://ai.uarea.in

# 2.1 ตั้งเป็นค่าเริ่มต้นของ integration (รับได้ทั้ง slug และ URL เต็ม)
curl -X POST $BASE/api/github/connect \
  -H 'content-type: application/json' \
  -d '{"repo":"https://github.com/ProAke/aixaccountuat.git","branch":"main"}'

# 2.2 ผูกเฉพาะโปรเจกต์ (ไม่กระทบค่าเริ่มต้น)
curl -X POST $BASE/api/github/connect \
  -H 'content-type: application/json' \
  -d '{"repo":"ProAke/aixaccountuat","projectId":"prj_sml","projectOnly":true}'

# 2.3 ตรวจว่าผูกถูก
curl -s $BASE/api/github/connect | jq '.integration.account, .integration.config, .projects'

# 2.4 ยกเลิกการผูก (ทั้ง integration หรือรายโปรเจกต์)
curl -X POST $BASE/api/github/connect -H 'content-type: application/json' -d '{"repo":null}'
curl -X POST $BASE/api/github/connect -H 'content-type: application/json' -d '{"repo":null,"projectId":"prj_sml"}'
```

หรือแก้ที่โปรเจกต์ตรง ๆ:

```bash
curl -X PATCH $BASE/api/projects/prj_sml \
  -H 'content-type: application/json' \
  -d '{"repoUrl":"https://github.com/ProAke/aixaccountuat"}'
```

---

## 3. ต้องทำอะไรต่อหลังเปลี่ยน repo

| # | งาน | ที่ไหน | หมายเหตุ |
| --- | --- | --- | --- |
| 1 | ให้สิทธิ์ `GITHUB_TOKEN` กับ repo ใหม่ | GitHub → Settings → Developer settings / App installation | ต้องมี **Contents: read**, **Issues: write**, **Pull requests: write** (ถ้าใช้ GitHub App เลือก repo นี้ใน installation ด้วย) |
| 2 | กดปุ่ม **“ทดสอบ”** ที่การ์ด GitHub | `/integrations` | ต้องขึ้น *“repo ProAke/aixaccountuat เข้าถึงได้ · branch main”* ถ้า 403/404 → token ยังไม่มีสิทธิ์ |
| 3 | ตรวจว่า Auto Fixer ใช้ repo ใหม่ | `/issues/[id]` | ช่อง *Pull request* และปุ่ม GitHub จะชี้ `github.com/ProAke/aixaccountuat` |
| 4 | อัปเดต branch เริ่มต้น | `/integrations` | ถ้า repo ใช้ `main` อยู่แล้วไม่ต้องแก้ |
| 5 | อัปเดต webhook (ถ้ามี) | ฝั่ง GitHub repo ใหม่ | ตั้ง webhook → `https://ai.uarea.in/api/mcp` หรือ `/api/cron` ตามที่ใช้ |

---

## 4. อาการที่เจอได้ และวิธีแก้

| อาการ | ความหมาย | แก้ |
| --- | --- | --- |
| ขึ้น `HTTP 403 Resource not accessible by integration` | token (หรือ GitHub App installation) ไม่มีสิทธิ์ใน repo นี้ | เพิ่ม repo เข้า installation / ออก token ใหม่ที่มี scope `repo` |
| ขึ้น `HTTP 404` | ไม่พบ repo หรือ token มองไม่เห็น (private) | ตรวจชื่อ `ProAke/aixaccountuat` และสิทธิ์ |
| dropdown “repo ของแต่ละโปรเจกต์” ไม่มีชื่อ repo | repo ไม่อยู่ใน 100 รายการแรก หรือเป็น private | พิมพ์ `owner/name` ในช่อง manual ของหน้าเลือก repo แล้วกด “ใช้ repo นี้” (ระบบจะปักหมุดไว้ให้) |
| เปลี่ยน repo แล้ว Issue เก่ายังชี้ repo เดิม | Issue ที่สร้างก่อนเปลี่ยนจะเก็บ URL เดิมไว้ | เปิด Issue นั้นแล้วแก้ `githubUrl` หรือปล่อยเป็นประวัติ |
| ต้องการให้ทุกโปรเจกต์ใช้ repo เดียวกัน | โปรเจกต์ที่ผูก repo เดิมไว้จะยังใช้ของตัวเอง | ยกเลิกการผูก (`{"repo":null,"projectId":…}`) แล้วระบบจะใช้ค่าเริ่มต้นแทน |

---

## 5. ค่าที่ระบบตั้งไว้ให้แล้ว (ในชุดข้อมูลเริ่มต้น)

| ที่ | ค่า |
| --- | --- |
| `integrations` → `int_github` | `account = ProAke/aixaccountuat`, `config = { owner: ProAke, repo: aixaccountuat, branch: main }`, `status = connected` |
| `projects.repoUrl` (SMLAIACC) | `https://github.com/ProAke/aixaccountuat` |
| Issue ตัวอย่าง (SMLAIACC-119/120/121) | `githubUrl` / `fixPrUrl` ชี้ `ProAke/aixaccountuat` |

> ถ้าใช้โหมดสาธิต (ไม่ตั้ง `DB_HOST`) ค่าเหล่านี้มาจาก `lib/seed-data.ts`
> ถ้าใช้ MariaDB ให้เปลี่ยนผ่าน UI/API ตามข้อ 1–2 (บันทึกลงตาราง `integrations` / `projects`)
