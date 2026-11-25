# รายงานตรวจสอบการอัปเกรดและสถานะปัจจุบัน — OPWatch

**วันที่ตรวจสอบ:** 27 ตุลาคม 2026 (UTC)  
**Branch:** `arena/2846059f-opwatch-co-th`  
**จุดเริ่มต้นจาก `main`:** `704944a861107153b7aef7293fe65b22f8f52fc0` (PR #18)  
**ขอบเขต:** dependency upgrades, npm security audit, build, และตรวจหน้า production ที่เข้าถึงได้โดยไม่ต้องล็อกอิน

## สรุปผู้บริหาร

- Production แสดง UI หลัง PR #18 และหน้า product detail รูปแบบใหม่จาก PR #17 แล้ว — ตรวจพบการ deploy ล่าสุดจากหน้า `/office/login` และ product detail จริง
- อัปเดต dependency แบบไม่เปลี่ยน major ที่ทำได้อย่างปลอดภัยใน lockfile แล้ว: **Vue 3.5.44 → 3.5.46** และ **Vue Router 4.6.4 → 4.6.5** รวมถึง refresh transitive dependencies ด้วย `npm audit fix` แบบไม่ใช้ `--force`
- **Build ผ่าน** ด้วย Nuxt 3; `package.json` ไม่เปลี่ยน และไม่มีการบังคับอัปเกรด Nuxt 4
- Security audit หลังอัปเดตยังพบ **13 package-level findings: 5 High, 8 Moderate, 0 Critical** — รายการ High หลักมาจาก Vue I18n/Intlify; Nuxt 3 มีรายการ Moderate ที่ต้องใช้การย้าย major เพื่อแก้ครบ
- **เรื่องเร่งด่วน:** หน้าเข้าสู่ระบบสาธารณะและ bundle ฝั่ง browser เปิดเผยค่า credential เริ่มต้นของเจ้าหน้าที่และรหัสซิงก์ Shopee รายงานนี้ไม่แสดงค่ารหัสผ่าน แต่ควรถือว่าค่าเหล่านั้นถูกเปิดเผยแล้วและรีบหมุนรหัสผ่าน
- Production ใช้ `dbDriver: json` ตาม `/api/install/status` ไม่ใช่ MariaDB ในขณะตรวจสอบ

## สถานะ Production ที่ตรวจพบ

| จุดตรวจ | ผล |
|---|---|
| `/api/install/status` | `installed: true`, `dbDriver: json`, `defaultLocale: th` |
| `/office/login` | หน้า OPWatch Workspace รุ่นล่าสุด, ป้าย 5 บทบาท และปุ่มแสดง/ซ่อนรหัสผ่าน; มีแผงช่วยเหลือบัญชีเริ่มต้นแบบพับได้ |
| `/products/olympianus-899832ags-black` | พบหน้า product detail รูปแบบใหม่ มี Variations, Features และ Technical Data — แสดงว่า production ได้รับ layout จาก PR #17 แล้ว |
| `/office/branches`, `/office/promotions` แบบไม่ล็อกอิน | ถูกส่งกลับหน้า login ตามการป้องกันสิทธิ์ จึงยืนยันหน้าเหล่านี้จาก production โดยไม่มี session เจ้าหน้าที่ไม่ได้ |

การทดสอบ role × page จำนวน 5 บทบาท × 19 หน้า และ CRUD สาขาผ่าน API เคยผ่านบน local seeded build หลัง PR #18; การตรวจ production รอบนี้ไม่ได้ใช้หรือส่ง credential เจ้าหน้าที่ไปยังเว็บไซต์จริง

## Dependency และการอัปเกรด

### เวอร์ชันปัจจุบันหลังอัปเดตแบบไม่เปลี่ยน major

| Package | เวอร์ชันที่ตรวจได้ | สถานะการอัปเกรด |
|---|---:|---|
| `nuxt` | 3.21.11 | รุ่นล่าสุดใน Nuxt 3 ที่ range ปัจจุบันอนุญาต; Nuxt 4.7.0 เป็น major upgrade |
| `@nuxtjs/i18n` | 9.5.6 | รุ่นล่าสุดใน major 9; 10.6.0 เป็น major upgrade |
| `@pinia/nuxt` | 0.5.5 | รุ่นล่าสุดใน major ปัจจุบัน; 1.0.3 เป็น major upgrade |
| `pinia` | 3.0.4 | major ปัจจุบัน; 4.1.0 เป็น major upgrade |
| `vue` | **3.5.46** | อัปเดต patch ภายใน range แล้ว |
| `vue-router` | **4.6.5** | อัปเดต patch ภายใน range แล้ว |
| `mysql2` | 3.24.6 | ตรงกับรุ่นล่าสุดที่รายงานโดย registry ตอนตรวจ |
| `bcryptjs` | 3.0.3 | ตรงกับรุ่นล่าสุดที่รายงานโดย registry ตอนตรวจ |

`npm audit fix` แบบปกติและ `npm update vue vue-router` ปรับ `package-lock.json` โดยไม่เปลี่ยน `package.json`; ไม่มีการใช้ `npm audit fix --force` เพราะจะดัน Nuxt ข้าม major โดยไม่ผ่านการย้ายระบบและทดสอบเต็มชุด

### ผล Security Audit

**หลังอัปเดต:** 13 findings — **5 High, 8 Moderate, 0 Critical** (npm audit นับ package ที่ได้รับผลกระทบ ไม่ใช่จำนวน advisory ที่ไม่ซ้ำกัน)  
ก่อนทำ compatible updates พบ 20 findings; การแก้แบบไม่เปลี่ยน major ลดลงเหลือ 13 แต่ยังไม่สามารถล้างทั้งหมดได้

- **High — Vue I18n / Intlify:** ปัจจุบันมี `vue-i18n` และแพ็กเกจ `@intlify/*` เวอร์ชัน 10.0.8 ที่อยู่ในช่วง advisory เกี่ยวกับการ escape ค่าแปลภาษาและ XSS ใน `srcdoc`:
  - [GHSA-8rc2-428q-7ww3](https://github.com/advisories/GHSA-8rc2-428q-7ww3)
  - [GHSA-83rm-6c8r-g728](https://github.com/advisories/GHSA-83rm-6c8r-g728)
- **Moderate — Nuxt 3 / Nitro:** dependency tree ยังแจ้งปัญหาเกี่ยวกับ route rules กับ path variants/encoded slash, server islands และข้อมูล error ฝั่ง SSR; npm ระบุการแก้ครบผ่าน Nuxt 4.7.0 ซึ่งเป็น breaking major:
  - [GHSA-vjh5-4x84-xrqp](https://github.com/advisories/GHSA-vjh5-4x84-xrqp)
  - [GHSA-hf59-9xwc-2g4p](https://github.com/advisories/GHSA-hf59-9xwc-2g4p)
  - [GHSA-f3x9-2chm-73c8](https://github.com/advisories/GHSA-f3x9-2chm-73c8)
  - [GHSA-96x6-fvhx-49hg](https://github.com/advisories/GHSA-96x6-fvhx-49hg)
- ยังมี Moderate ใน dependency tree ของ `archiver`, `readdir-glob` และ `minimatch`; ต้องตรวจเวอร์ชัน/แนวทาง override แยกต่างหาก ไม่ควรบังคับ override ที่อาจขัดกับ dependency range โดยไม่ build และทดสอบ

`@nuxtjs/i18n` 10.6.0 อาศัย Nuxt Kit 4 และ Vue Router 5; `@pinia/nuxt` 1.0.3 อาศัย Nuxt Kit 4 และ Pinia 4. การแก้ High และ Nuxt Moderate จึงควรวางเป็น **งาน migration Nuxt 4 แบบ coordinated** ไม่ใช่ bump ทีละ package บน production

## ประเด็นเร่งด่วนด้านความปลอดภัย

### Credential เริ่มต้นถูกเผยแพร่ให้ผู้ไม่ล็อกอิน

หน้า `/office/login` มีข้อความชวนเปิดดูบัญชี/รหัสผ่านเริ่มต้นและรหัสซิงก์ Shopee; ค่าเหล่านี้อยู่ใน client bundle ที่ผู้เข้าชมทั่วไปดาวน์โหลดได้ นอกจากนี้ยังพบค่าเริ่มต้นใน source ของคู่มือ, หน้าจัดการ และ seed/auth utilities

**ผลกระทบ:** หากบัญชี production ยังใช้รหัสเริ่มต้น ผู้เข้าชมเว็บไซต์อาจลองเข้าสู่ระบบหลังบ้านหรือยืนยันการดึงข้อมูลได้ ควรถือว่าค่าที่เผยแพร่ถูก compromise แม้จะยังยืนยันไม่ได้จากการตรวจแบบไม่ล็อกอินว่าบัญชีใดถูกเปลี่ยนแล้ว

**การดำเนินการที่แนะนำโดยเร่งด่วน:**
1. เข้าระบบด้วยผู้ดูแลที่ได้รับอนุญาต แล้วตั้งรหัสผ่านใหม่ที่ไม่ซ้ำให้เจ้าหน้าที่/Dealer ทุกบัญชี และเปลี่ยนรหัส Sync ของ Shopee
2. ตรวจสอบ login/session logs และยกเลิก session ที่ไม่รู้จัก
3. นำรหัสผ่านและรหัส Sync ออกจากหน้า login สาธารณะ, client bundles, placeholder, คู่มือ และข้อความที่แสดงต่อผู้ใช้; อย่าแสดง secret ใน UI แม้พับ panel ไว้
4. ปรับการติดตั้งใหม่ให้ใช้ secret แบบสุ่มต่อ installation และบังคับเปลี่ยนรหัสครั้งแรก แทนรหัสเริ่มต้นร่วมกัน

## ประเด็นระบบและข้อมูลที่ควรยืนยัน

1. **ฐานข้อมูล production:** API สาธารณะรายงาน JSON storage อยู่ หากต้องใช้ MariaDB ตามเป้าหมาย ให้กำหนดแผน migration, backup/restore test และตรวจความสมบูรณ์ของข้อมูลก่อนเปลี่ยน driver; หาก JSON เป็นการตั้งใจ ให้บันทึกเป็นข้อยกเว้นพร้อมแผนสำรอง
2. **ตรวจข้อกล่าวอ้างบนหน้าสินค้า:** หน้า Olym Pianus 899832AGS-Black แสดงข้อกำหนดบางรายการ เช่น Master Chronometer/METAS, helium valve และความทนสนามแม่เหล็กสูง ควรเทียบกับสเปกจากผู้ผลิตก่อนใช้เป็นข้อความขาย เพื่อหลีกเลี่ยงการระบุสเปกไม่ตรงรุ่น

## ผลการตรวจใน workspace

- Runtime: Node.js 22.22.3, npm 10.9.8
- `NODE_OPTIONS='--max-old-space-size=4096' npm run build` — **ผ่าน**; Nuxt 3.21.11, Nitro output ประมาณ 9.14 MB (1.62 MB gzip)
- Package manifest: `package.json` ไม่มีการเปลี่ยนแปลง; มีการอัปเดต lockfile เท่านั้น
- Working tree สำหรับงานนี้ประกอบด้วย `package-lock.json` ที่ปรับปรุงแล้วและรายงานฉบับนี้; ยังไม่ได้สร้าง PR สำหรับการอัปเดต/รายงานรอบนี้

## แผนงานแนะนำ

| ลำดับ | งาน | เกณฑ์เสร็จ |
|---|---|---|
| P0 | หมุนรหัสเจ้าหน้าที่/Dealer และ Shopee Sync ใน production; ลบการเผยแพร่ secret จากหน้า login/คู่มือ/client | ไม่มี secret ใน HTML/client assets; login เก่าถูกปฏิเสธ; ยืนยัน session และ audit log |
| P1 | วางแผน migration Nuxt 3 → Nuxt 4 พร้อม i18n, Vue Router, Pinia และ Pinia Nuxt module | Build + SSR, TH/EN, 5-role authorization, office APIs, install wizard, MariaDB/JSON, product flows ผ่าน regression tests |
| P1 | ตัดสินใจและดำเนินการ MariaDB production migration หรือบันทึกการใช้ JSON พร้อม backup policy | ทดสอบ backup/restore และตรวจจำนวน record/ไฟล์แนบ |
| P2 | ตรวจสอบสเปกหน้าสินค้ากับ catalog ทางการและแก้ข้อความที่ไม่มีหลักฐานยืนยัน | ผู้รับผิดชอบแบรนด์อนุมัติสเปกต่อรุ่น |
| P2 | ตรวจ `npm audit` ซ้ำทุก release และติดตาม patch ใน major ที่ใช้งาน | รายงาน audit ไม่มี finding ที่ยังไม่ผ่านการประเมิน |
