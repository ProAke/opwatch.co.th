<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const officeAuth = useOfficeAuth()
const toast = useToast()

const lang = ref<'th' | 'en'>('th')
const activeChapter = ref<string>('all')
const query = ref('')

const { data: shopeeAudit } = await useFetch<any>('/api/admin/products/shopee-audit', {
  default: () => null
})

const roleMatrix = [
  {
    role: 'CEO (ผู้บริหารสูงสุด)',
    email: 'ceo@opwatch.co.th',
    initialPw: 'Opwatch@2026',
    color: '#6c5ce7',
    accessTh: 'เข้าถึงทุกเมนู รายได้รวม สต็อก 5 ช่องทาง ดึงข้อมูล Shopee จัดการเจ้าหน้าที่ และตั้งค่ารหัสผ่านทั้งหมด',
    accessEn: 'Full access to KPIs, 5-channel stock, Shopee sync, staff & dealer RBAC, and master security settings.'
  },
  {
    role: 'IT. Admin (ผู้ดูแลระบบ)',
    email: 'it@opwatch.co.th',
    initialPw: 'Opwatch@2026',
    color: '#3ba7ff',
    accessTh: 'ดูแลเทคนิค ฐานข้อมูล MariaDB/JSON ตั้งค่า AI/Hermes Pool กำหนดรหัสผ่าน และจัดการทุกโมดูลหลังบ้าน',
    accessEn: 'System administration, MariaDB/JSON audit, AI/Hermes keys, password resets, and full ERP control.'
  },
  {
    role: 'Marketing / Sales',
    email: 'marketing@opwatch.co.th',
    initialPw: 'Opwatch@2026',
    color: '#ff6b9d',
    accessTh: 'ปุ่มดึงข้อมูล Shopee จัดการสินค้า ราคาปลีก โปรโมชั่น คูปอง บทความรีวิวสินค้า Tree CMS และตอบแชทลูกค้า',
    accessEn: 'Shopee product/promo sync, retail catalog, promotions, review articles, Tree CMS, orders & live chat.'
  },
  {
    role: 'คลังสินค้า (Warehouse)',
    email: 'warehouse@opwatch.co.th',
    initialPw: 'Opwatch@2026',
    color: '#22c793',
    accessTh: 'บริหารสต็อกแยก 5 ช่องทาง (Web · Shopee · Lazada · TikTok · ตัวแทน) แพ็กส่งพัสดุ และรับงานซ่อม',
    accessEn: '5-channel inventory (Web, Shopee, Lazada, TikTok, Dealer), order fulfillment & warranty repairs.'
  },
  {
    role: 'ตัวแทนจำหน่าย (Dealer)',
    email: 'dealer@opwatch.co.th',
    initialPw: 'Opwatch@2026',
    color: '#ffb020',
    accessTh: 'ดูราคาส่งเฉพาะตัวแทน จัดการคลังหน้าร้านตนเอง รายการนัดรับสินค้า Click & Collect และส่งแจ้งซ่อม',
    accessEn: 'Wholesale dealer catalog, own boutique stock, Click & Collect pickup orders, and warranty registration.'
  }
]

const chapters = computed(() => [
  {
    id: 'auth',
    num: '01',
    icon: '🔐',
    titleTh: 'การเข้าสู่ระบบ สิทธิ์ 5 บทบาท และการกำหนดรหัสผ่าน',
    titleEn: 'Login, 5-Role RBAC & Password Configuration',
    link: '/office/settings?tab=security',
    linkLabelTh: 'ไปหน้ากำหนดรหัสผ่าน →',
    stepsTh: [
      'เข้าสู่ระบบจัดการหลังบ้านได้ที่ /office/login เฉพาะบัญชีเจ้าหน้าที่และตัวแทนจำหน่ายเท่านั้น (บัญชีสมาชิก/ลูกค้าหน้าเว็บจะถูกบล็อกอัตโนมัติ 100%)',
      'เปลี่ยนรหัสผ่านของตนเองได้ตลอดเวลาโดยคลิกที่ปุ่มชื่อผู้ใช้มุมขวาบน "🔑 เปลี่ยนรหัสผ่าน" กรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)',
      'ผู้บริหาร (CEO / IT. Admin) สามารถกำหนดรหัสผ่านใหม่ให้พนักงานหรือตัวแทนจำหน่ายรายบุคคลได้ที่เมนู "เจ้าหน้าที่ & ตัวแทนจำหน่าย" (/office/staff) กดปุ่ม "🔑 ตั้งรหัสผ่าน" หรือที่เมนู "ตั้งค่าระบบ > แท็บ 6 กำหนดรหัสผ่าน & ความปลอดภัย"',
      'รหัสผ่านยืนยันปุ่มดึงข้อมูล Shopee (Sync Password): ค่าเริ่มต้นคือ Shopee@2324 (หรือใช้รหัสผ่านบัญชีเจ้าหน้าที่ของคุณเองได้) สามารถเปลี่ยนรหัสซิงก์ใหม่ หรือเปิด/ปิดการถามรหัสผ่านได้ที่เมนู ตั้งค่าระบบ > แท็บ 6'
    ],
    stepsEn: [
      'Sign in at /office/login using an Officer or Authorized Dealer account (storefront customer accounts are strictly isolated and blocked from /office).',
      'Any logged-in officer can change their own password anytime via the top-right "🔑 เปลี่ยนรหัสผ่าน" profile button.',
      'CEO and IT. Admin can reset passwords for any staff or dealer in /office/staff ("🔑 ตั้งรหัสผ่าน") or /office/settings?tab=security.',
      'Shopee Sync Password defaults to Shopee@2324 (your own officer password is also accepted) and can be customized or toggled in Settings > Tab 6.'
    ]
  },
  {
    id: 'shopee',
    num: '02',
    icon: '🛍',
    titleTh: 'การตรวจสอบและใช้ปุ่มดึงข้อมูลจาก Shopee (opwatchthailand) เข้าเว็บไซต์',
    titleEn: 'Auditing & Pulling Products from Shopee (opwatchthailand) to Website',
    link: '/office/products?shopee=1',
    linkLabelTh: 'เปิดปุ่มดึงข้อมูล Shopee →',
    stepsTh: [
      'ไปที่เมนู "สินค้า & ปรับภาพอัตโนมัติ" (/office/products) ด้านบนสุดจะมีแถบตรวจสอบสดเทียบข้อมูลระหว่าง https://shopee.co.th/opwatchthailand (Shop ID: 232486539) กับ www.opwatch.co.th แยกตามแบรนด์ Olym Pianus, Olympia Star และ Ogival',
      'วิธีที่ 1 — ดึงข้อมูลที่ยังขาดในคลิกเดียว (แนะนำ): กดปุ่มสีส้ม "⚡ ดึงไอเท็มที่ยังขาดเข้าเว็บไซต์ทันที" → กรอกรหัสผ่านยืนยัน (ค่าเริ่มต้น Shopee@2324 หรือรหัสผ่านบัญชีของคุณ) ระบบจะสร้างสินค้าใหม่ รูปภาพ สเปกภาษาไทย/อังกฤษ แบ่งสต็อก 5 ช่องทาง และผูกแคมเปญโปรโมชั่นเข้าเว็บไซต์อัตโนมัติทันที',
      'วิธีที่ 2 — ตรวจสอบเทียบรายรุ่นก่อนดึง: กดปุ่ม "🔍 ดูตารางเทียบครบทุกรุ่น / เลือกรายการเอง" สามารถกรองดูเฉพาะ "❌ ยังไม่มีในเว็บ", "⚠️ รอซิงก์ราคาโปร" หรือ "✅ มีครบในเว็บแล้ว" ติ๊กเลือกรุ่นที่ต้องการ แล้วกดปุ่มยืนยันขั้นตอนที่ 2',
      'วิธีที่ 3 — เมื่อร้าน opwatchthailand ลงสินค้าใหม่บน Shopee ในอนาคต: เนื่องจาก Shopee มีระบบป้องกันบอท (/verify/traffic) สำหรับการดึงแบบไม่ล็อกอิน เจ้าหน้าที่สามารถ (ก) ดาวน์โหลดไฟล์ .CSV จาก Shopee Seller Center มาอัปโหลดผ่านปุ่ม "📄 นำเข้าไฟล์ .CSV" หรือ (ข) ลากปุ่ม "🔖 ดึงหน้า Shopee เข้า OPWatch" ไปไว้บนแถบ Bookmark ของเบราว์เซอร์ เปิดหน้าเว็บ Shopee ขณะล็อกอิน แล้วคลิกปุ่มเพื่อคัดลอกสินค้าทั้งหมดมาวางในระบบได้ 100%'
    ],
    stepsEn: [
      'Open /office/products to view the live SKU-by-SKU comparison banner against https://shopee.co.th/opwatchthailand (Shop ID: 232486539).',
      'Method 1 (1-Click Pull): Click "⚡ ดึงไอเท็มที่ยังขาดเข้าเว็บไซต์ทันที", enter Sync Password (default Shopee@2324), and all missing watches, studio images, specs, 5-channel stocks, and promotions are imported automatically.',
      'Method 2 (2-Step Selective Checklist): Click "🔍 ดูตารางเทียบครบทุกรุ่น", filter by Missing / Promo Diff / Synced, tick desired SKUs, and confirm.',
      'Method 3 (Future New Shopee Listings): Upload a Shopee Seller Center .CSV export or use the built-in 1-Click Browser Bookmarklet while logged into Shopee to bypass Shopee anti-bot walls cleanly.'
    ]
  },
  {
    id: 'catalog',
    num: '03',
    icon: '⌚',
    titleTh: 'การจัดการสินค้า ปรับภาพสตูดิโอพื้นขาว และคลังสินค้า 5 ช่องทาง',
    titleEn: 'Product Editor, Studio White-BG Processor & 5-Channel Warehouse',
    link: '/office/warehouse',
    linkLabelTh: 'ไปหน้าคลังสินค้า 5 ช่องทาง →',
    stepsTh: [
      'การเพิ่ม/แก้ไขนาฬิกา (/office/products/new หรือกด "แก้ไข / AI"): รองรับทั้ง 3 แบรนด์หลัก (Olym Pianus, Olympia Star, Ogival) กำหนดราคาปลีก ราคาป้าย ราคาส่งตัวแทน และสเปกนาฬิกาครบชุด',
      'การปรับภาพพื้นขาวอัตโนมัติ: เมื่ออัปโหลดภาพถ่ายสินค้า ระบบสามารถจัดสัดส่วน 1:1 พื้นหลังขาวคลีนระดับบูติกและเร่งความคมชัดหน้าปัดแซฟไฟร์อัตโนมัติ',
      'ปุ่ม AI SEO & ASEO: กดปุ่มให้ AI เขียนคำบรรยายไทย-อังกฤษ Meta Title, Description และชุดคำถาม-คำตอบ (FAQ) เพื่อติดอันดับ Google และ AI Search',
      'คลังสินค้า 5 ช่องทาง (/office/warehouse): ปรับยอดคงเหลือแยกตาม 5 ช่องทางจริง ได้แก่ (1) Opwatch Web, (2) Shopee, (3) Lazada, (4) TikTok Shop และ (5) โควตาตัวแทนจำหน่าย พร้อมแจ้งเตือนเมื่อสต็อกต่ำกว่าเกณฑ์'
    ],
    stepsEn: [
      'Add or edit timepieces across Olym Pianus, Olympia Star, and Ogival with retail, compare-at, and wholesale dealer pricing.',
      'Enable automatic 1:1 white-studio image enhancement when uploading watch photography.',
      'Use 1-click AI SEO & ASEO generation to create bilingual descriptions, meta tags, and structured FAQs.',
      'Manage real-time inventory across all 5 channels (Opwatch Web, Shopee, Lazada, TikTok Shop, Authorized Dealers) in /office/warehouse.'
    ]
  },
  {
    id: 'orders',
    num: '04',
    icon: '🚚',
    titleTh: 'คำสั่งซื้อ การจัดส่งพัสดุด่วน และการรับสินค้าที่สาขา (Click & Collect)',
    titleEn: 'Orders, Insured Express Shipping & Branch Click & Collect',
    link: '/office/orders',
    linkLabelTh: 'ไปหน้าจัดการคำสั่งซื้อ →',
    stepsTh: [
      'ตรวจสอบคำสั่งซื้อใหม่ที่เมนู "คำสั่งซื้อ & การส่งสินค้า" (/office/orders) ดูรายละเอียดรุ่นนาฬิกา บริการห่อของขวัญฟรี และคูปองส่วนลดที่ลูกค้าใช้',
      'อัปเดตสถานะเป็น ชำระแล้ว → กำลังแพ็ก → จัดส่งแล้ว พร้อมกรอกบริษัทขนส่ง (EMS / Kerry / Flash) และเลขพัสดุ เพื่อให้ลูกค้าเช็คสถานะได้ที่หน้า /track-order',
      'กรณีลูกค้าเลือก "รับสินค้าที่เคาน์เตอร์ห้าง / ร้านตัวแทนจำหน่าย (Click & Collect)" บัญชีตัวแทนจำหน่ายของสาขานั้นจะเห็นรายการนัดรับและกดยืนยันการส่งมอบหน้าร้านได้ทันที',
      'ตอบแชทลูกค้าสดผ่านกล่องข้อความบนแดชบอร์ด โดยกดปุ่ม "✨ ให้ AI ร่างคำตอบ" (OP-CARE) เพื่อช่วยร่างคำตอบอย่างสุภาพรวดเร็ว'
    ],
    stepsEn: [
      'Inspect incoming orders, complimentary gift-wrap notes, and applied vouchers in /office/orders.',
      'Update order status and tracking numbers so shoppers can track shipments live at /track-order.',
      'Click & Collect orders automatically appear in the assigned Authorized Dealer portal for counter handover.',
      'Reply to live customer inquiries from the dashboard with 1-click OP-CARE AI draft assistance.'
    ]
  },
  {
    id: 'cms',
    num: '05',
    icon: '📝',
    titleTh: 'โปรโมชั่น คูปอง บทความ-รีวิวสินค้า และโครงสร้างเว็บ Tree CMS',
    titleEn: 'Promotions, Coupons, Watch Reviews & Tree-Menu CMS',
    link: '/office/reviews',
    linkLabelTh: 'ไปหน้าบทความ & รีวิวสินค้า →',
    stepsTh: [
      'โปรโมชั่น & คูปอง (/office/promotions): สร้างแคมเปญแสดงบนหน้าแรก (เลือกเลย์เอาต์ 3, 4 หรือ 6 คอลัมน์ได้) ผูกสินค้าร่วมรายการ และกำหนดโค้ดคูปองลดเปอร์เซ็นต์หรือลดเป็นจำนวนเงิน (เช่น SHP2324, OGIVAL1000, OP1111)',
      'บทความ & รีวิวสินค้า (/office/reviews): เขียนบทความรีวิวเจาะลึกเรือนเวลา หรือกดปุ่มให้ AI ช่วยร่างบทความรีวิวพร้อมผูกสินค้าที่เกี่ยวข้อง เพื่อแสดงผลที่เมนูหน้าบ้าน "/reviews" (บทความ-รีวิวสินค้า) รวมถึงอนุมัติรีวิวจากลูกค้าจริง',
      'เนื้อหาเว็บ Tree Menu CMS (/office/pages): จัดการโครงสร้างหน้าเว็บไซต์แบบลำดับขั้น (Tree) ทั้งหน้าประวัติแบรนด์ ซีรีส์นาฬิกา นโยบายรับประกัน และหน้าบริการสาขา พร้อมผู้ช่วย AI แปลไทย-อังกฤษ'
    ],
    stepsEn: [
      'Configure homepage promotion grids (3, 4, or 6 columns) and discount coupons in /office/promotions.',
      'Publish editorial watch reviews (with 1-click AI drafting) and moderate verified buyer reviews in /office/reviews -> live at /reviews.',
      'Edit hierarchical brand story, series landing, and policy pages via the Tree-Menu CMS (/office/pages).'
    ]
  },
  {
    id: 'warranty',
    num: '06',
    icon: '🛡',
    titleTh: 'ระบบลงทะเบียนรับประกันศูนย์ไทย (E-Warranty) และรับแจ้งซ่อมออนไลน์',
    titleEn: 'Official 2-Year E-Warranty & Online Repair Service Center',
    link: '/office/warranty',
    linkLabelTh: 'ไปหน้าประกัน & แจ้งซ่อม →',
    stepsTh: [
      'ลูกค้าและตัวแทนจำหน่ายสามารถลงทะเบียนใบรับประกันออนไลน์ (E-Warranty 2 ปี โดย บริษัท อินเตอร์ไทมส์ จำกัด) และส่งคำร้องแจ้งซ่อมผ่านหน้าเว็บไซต์ /warranty',
      'เจ้าหน้าที่ตรวจสอบหมายเลขเครื่อง/รุ่น วันที่ซื้อ และหลักฐานใบเสร็จได้ที่เมนู "แจ้งซ่อม & ลงทะเบียนประกัน" (/office/warranty) เพื่อกดอนุมัติสถานะความคุ้มครอง',
      'สำหรับงานซ่อม (เปลี่ยนถ่านสวิส/ญี่ปุ่น ล้างเครื่อง ขัดตัวเรือน เคลมกระจกแซฟไฟร์) สามารถบันทึกประเมินราคา อัปเดตขั้นตอนงานช่าง และแจ้งนัดรับคืนให้ลูกค้าทราบได้ครบวงจร'
    ],
    stepsEn: [
      'Customers and dealers submit 2-year official Thailand E-Warranty registrations and repair requests at /warranty.',
      'Officers verify serial/model numbers and approve warranty coverage in /office/warranty.',
      'Track movement servicing, battery replacement, and repair status updates end-to-end.'
    ]
  },
  {
    id: 'deploy',
    num: '07',
    icon: '🚀',
    titleTh: 'การตั้งค่าระบบ ฐานข้อมูล MariaDB และการขึ้นใช้งานจริง www.opwatch.co.th',
    titleEn: 'Master Settings, MariaDB Database & www.opwatch.co.th Deployment',
    link: '/office/settings',
    linkLabelTh: 'ไปหน้าตั้งค่าระบบทั้งหมด →',
    stepsTh: [
      'ตั้งค่าข้อมูลบริษัท อินเตอร์ไทมส์ จำกัด เบอร์โทร 02 251 5777 LINE ID: opwatch.th Facebook: OPwatchThailand และลิงก์ Shopee ได้ที่เมนู "ตั้งค่าระบบ" (/office/settings)',
      'ตั้งค่า AI Engine (OpenRouter / OpenAI / Google Gemini) โดยวาง API Key ในแท็บที่ 4 เพื่อให้ AI เขียนเนื้อหาได้ไม่จำกัด',
      'การเชื่อมต่อฐานข้อมูล MariaDB บนเซิร์ฟเวอร์จริง www.opwatch.co.th: สามารถตั้งค่าผ่านหน้าติดตั้ง /install หรือไฟล์ config/site.config.json โดยกำหนด db.driver = "mysql" พร้อม host, port (3306), user, password และ database ระบบจะสร้างตารางอัตโนมัติครบทั้ง 18 ตารางทันที'
    ],
    stepsEn: [
      'Update Inter Times Co., Ltd. contact details, LINE opwatch.th, Facebook, Shopee links, and store announcements in /office/settings.',
      'Configure OpenRouter, OpenAI, or Gemini API keys in Settings > Tab 4.',
      'For production www.opwatch.co.th deployment, point config/site.config.json (or /install wizard) to MariaDB (driver: "mysql") — all 18 tables auto-migrate on startup.'
    ]
  }
])

const filteredChapters = computed(() => {
  const q = query.value.trim().toLowerCase()
  return chapters.value.filter((ch) => {
    if (activeChapter.value !== 'all' && ch.id !== activeChapter.value) return false
    if (!q) return true
    const hay = `${ch.titleTh} ${ch.titleEn} ${ch.stepsTh.join(' ')} ${ch.stepsEn.join(' ')}`.toLowerCase()
    return hay.includes(q)
  })
})

async function copyText(val: string, label = 'คัดลอกข้อมูลแล้ว') {
  if (!import.meta.client) return
  await navigator.clipboard.writeText(val)
  toast.success(label)
}

function printManual() {
  if (import.meta.client) window.print()
}

useHead({ title: 'คู่มือระบบจัดการเว็บไซต์ (ERP User Manual) — OPWatch Thailand' })
</script>

<template>
  <div class="manual-page">
    <!-- Header -->
    <div class="erp-page-head no-print">
      <div>
        <div class="erp-kicker">OFFICIAL ADMINISTRATOR &amp; STAFF HANDBOOK · INTER TIMES CO., LTD.</div>
        <h1 class="erp-h1">
          📘 {{ lang === 'th' ? 'คู่มือการใช้งานระบบจัดการเว็บไซต์ www.opwatch.co.th' : 'OPWatch Website Management System Manual' }}
        </h1>
        <p class="erp-sub">
          {{
            lang === 'th'
              ? 'รวมขั้นตอนการกำหนดรหัสผ่าน การตรวจสอบและดึงสินค้าจาก Shopee (opwatchthailand) การจัดการสต็อก 5 ช่องทาง คำสั่งซื้อ รีวิว และการดูแลระบบครบทุกเมนู'
              : 'Complete step-by-step guide covering password management, Shopee (opwatchthailand) catalog sync, 5-channel stock, orders, reviews, and CMS.'
          }}
        </p>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button
          type="button"
          class="erp-btn erp-btn--ghost"
          @click="lang = lang === 'th' ? 'en' : 'th'"
        >
          🌐 {{ lang === 'th' ? 'Switch to English' : 'สลับเป็นภาษาไทย' }}
        </button>
        <NuxtLink to="/office/products?shopee=1" class="erp-btn erp-btn--violet">
          🛍 ปุ่มดึงข้อมูล Shopee
        </NuxtLink>
        <button type="button" class="erp-btn erp-btn--primary" @click="printManual">
          🖨 {{ lang === 'th' ? 'พิมพ์คู่มือ / บันทึก PDF' : 'Print / Save PDF' }}
        </button>
      </div>
    </div>

    <!-- Quick Credentials & Security Reference Card -->
    <div class="erp-panel" style="margin-bottom:18px;border:1.5px solid #ddd6fe;background:linear-gradient(135deg,#faf9ff 0%,#ffffff 100%)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:14px">
        <div>
          <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;color:#6c5ce7">
            QUICK ACCESS &amp; PASSWORD SUMMARY · ข้อมูลรหัสผ่านและการเข้าใช้งานระบบ
          </div>
          <h2 style="margin:4px 0 0;font-size:17.5px;color:#23264d">
            🔑 ตารางบัญชีเข้าใช้งาน 5 บทบาท และรหัสผ่านยืนยันปุ่มดึงข้อมูล Shopee
          </h2>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap" class="no-print">
          <NuxtLink v-if="officeAuth.hasPermission('settings_manage')" to="/office/settings?tab=security" class="erp-btn erp-btn--sm erp-btn--primary">
            🔐 เปลี่ยนรหัสผ่าน &amp; รหัสซิงก์ Shopee
          </NuxtLink>
          <NuxtLink v-if="officeAuth.hasPermission('staff_manage')" to="/office/staff" class="erp-btn erp-btn--sm erp-btn--ghost">
            👥 จัดการบัญชีเจ้าหน้าที่
          </NuxtLink>
        </div>
      </div>

      <!-- Sync Password Highlight -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:12px;margin-bottom:14px">
        <div style="padding:12px 14px;border-radius:12px;background:#fff4f0;border:1px solid #fed7aa">
          <div style="font-size:11.5px;color:#9a3412;font-weight:700">รหัสผ่านปุ่มดึงข้อมูล Shopee (ค่าเริ่มต้น)</div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px">
            <code style="font-size:16px;font-weight:700;color:#ee4d2d">Shopee@2324</code>
            <button type="button" class="erp-btn erp-btn--sm no-print" @click="copyText('Shopee@2324', 'คัดลอกรหัส Shopee@2324 แล้ว')">
              คัดลอก
            </button>
          </div>
          <div style="font-size:11.5px;color:#7c2d12;margin-top:4px">
            * ใช้กรอกยืนยันเมื่อกดปุ่มดึงข้อมูล Shopee เข้าเว็บไซต์ (หรือใช้รหัสผ่านบัญชีเจ้าหน้าที่ของคุณเองได้เช่นกัน)
          </div>
        </div>

        <div style="padding:12px 14px;border-radius:12px;background:#eefbf6;border:1px solid #a7f3d0">
          <div style="font-size:11.5px;color:#065f46;font-weight:700">สถานะข้อมูล Shopee เทียบกับ www.opwatch.co.th ล่าสุด</div>
          <div style="font-size:14px;font-weight:700;color:#047857;margin-top:4px">
            <template v-if="shopeeAudit?.summary">
              ซิงก์แล้ว {{ shopeeAudit.summary.alreadySyncedCount }} / {{ shopeeAudit.summary.totalItems }} รุ่น
              <span v-if="!shopeeAudit.summary.isComplete" style="color:#e11d48">
                (ยังขาด {{ shopeeAudit.summary.missingCount }} รุ่น · รอโปร {{ shopeeAudit.summary.needsPromoSyncCount }} รุ่น)
              </span>
              <span v-else>— ครบ 100% ✅</span>
            </template>
            <template v-else>พร้อมตรวจสอบสดที่เมนูจัดการสินค้า</template>
          </div>
          <div style="font-size:11.5px;color:#065f46;margin-top:4px">
            รวมสินค้าทั้งหมดบนเว็บปัจจุบัน: <strong>{{ shopeeAudit?.summary?.totalWebsiteProducts || 414 }}</strong> รุ่น
          </div>
        </div>
      </div>

      <!-- 5-Role Table -->
      <div class="erp-table-wrap">
        <table class="erp-table">
          <thead>
            <tr>
              <th>บทบาท (Role)</th>
              <th>อีเมลเข้าสู่ระบบ (/office/login)</th>
              <th>รหัสผ่านเริ่มต้น</th>
              <th>ขอบเขตสิทธิ์การใช้งานในระบบ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rm in roleMatrix" :key="rm.email">
              <td>
                <span style="display:inline-flex;align-items:center;gap:6px;font-weight:700;color:#23264d">
                  <span :style="{ width: '10px', height: '10px', borderRadius: '50%', background: rm.color, display: 'inline-block' }" />
                  {{ rm.role }}
                </span>
              </td>
              <td>
                <code style="font-weight:700;color:#6c5ce7">{{ rm.email }}</code>
              </td>
              <td>
                <code>{{ rm.initialPw }}</code>
              </td>
              <td style="font-size:12.5px;color:#475569">
                {{ lang === 'th' ? rm.accessTh : rm.accessEn }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Search & Chapter Filter Bar -->
    <div class="erp-panel no-print" style="margin-bottom:18px">
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between">
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button
            type="button"
            class="erp-btn erp-btn--sm"
            :class="activeChapter === 'all' ? 'erp-btn--primary' : 'erp-btn--ghost'"
            @click="activeChapter = 'all'"
          >
            {{ lang === 'th' ? 'ทุกบท (7 หมวด)' : 'All Chapters (7)' }}
          </button>
          <button
            v-for="ch in chapters"
            :key="ch.id"
            type="button"
            class="erp-btn erp-btn--sm"
            :class="activeChapter === ch.id ? 'erp-btn--primary' : 'erp-btn--ghost'"
            @click="activeChapter = ch.id"
          >
            {{ ch.icon }} {{ ch.num }}
          </button>
        </div>

        <input
          v-model="query"
          class="erp-input"
          style="max-width:320px"
          :placeholder="lang === 'th' ? 'ค้นหาหัวข้อคู่มือ เช่น Shopee, รหัสผ่าน, สต็อก...' : 'Search manual topics...'"
        />
      </div>
    </div>

    <!-- Manual Chapters -->
    <div style="display:flex;flex-direction:column;gap:16px">
      <section
        v-for="ch in filteredChapters"
        :key="ch.id"
        :id="ch.id"
        class="erp-panel manual-chapter"
      >
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:12px">
            <div class="manual-num">{{ ch.num }}</div>
            <div>
              <h2 style="margin:0;font-size:18px;color:#23264d">
                {{ ch.icon }} {{ lang === 'th' ? ch.titleTh : ch.titleEn }}
              </h2>
              <div style="font-size:12px;color:#8a8fb1">
                {{ lang === 'th' ? ch.titleEn : ch.titleTh }}
              </div>
            </div>
          </div>

          <NuxtLink :to="ch.link" class="erp-btn erp-btn--sm erp-btn--ghost no-print">
            {{ ch.linkLabelTh }}
          </NuxtLink>
        </div>

        <ol class="manual-steps">
          <li v-for="(step, sIdx) in (lang === 'th' ? ch.stepsTh : ch.stepsEn)" :key="sIdx">
            {{ step }}
          </li>
        </ol>

        <!-- Extra Bookmarklet Box inside Chapter 02 -->
        <div
          v-if="ch.id === 'shopee' && shopeeAudit?.bookmarkletScript"
          class="no-print"
          style="margin-top:14px;padding:12px 16px;border-radius:12px;background:#fff8f6;border:1px dashed #ee4d2d;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"
        >
          <div style="font-size:12.5px;color:#7c2d12">
            <strong>🔖 เครื่องมือเสริม Bookmarklet ดึงหน้า Shopee สด:</strong>
            ลากปุ่มสีส้มไปวางบนแถบ Bookmarks Bar ของเบราว์เซอร์ หรือคลิกเพื่อคัดลอกโค้ดไว้ใช้เมื่อลงสินค้าใหม่บน Shopee
          </div>
          <a
            :href="shopeeAudit.bookmarkletScript"
            style="background:#ee4d2d;color:#fff;padding:7px 14px;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none"
            @click.prevent="copyText(shopeeAudit.bookmarkletScript, 'คัดลอกโค้ด Bookmarklet ดึงหน้า Shopee แล้ว!')"
          >
            📋 คัดลอก / ลากปุ่มดึงหน้า Shopee
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.manual-num {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6c5ce7, #8b7cf6);
  color: #ffffff;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 15px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.manual-steps {
  margin: 0;
  padding-left: 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #334155;
  font-size: 13.5px;
  line-height: 1.7;
}
@media print {
  .no-print {
    display: none !important;
  }
  .manual-chapter {
    break-inside: avoid;
    box-shadow: none !important;
    border: 1px solid #cbd5e1 !important;
  }
}
</style>
