<script setup lang="ts">
const route = useRoute()
const localePath = useLocalePath()
const { locale } = useI18n()
const toast = useToast()

const activeTab = ref<'register' | 'repair' | 'lookup'>(
  route.query.tab === 'repair' ? 'repair' : route.query.tab === 'lookup' ? 'lookup' : 'register'
)

// Fetch branches & sample SKUs for helpful autocomplete
const { data: branchesRes } = await useFetch<any>('/api/branches')
const { data: cmsRes } = await useFetch<any>('/api/pages/site-warranty', {
  default: () => null
})
const branches = computed(() => branchesRes.value?.branches || branchesRes.value?.items || [])
const cmsPage = computed(() => cmsRes.value?.page || null)

// 1. E-Warranty Registration Form
const regForm = reactive({
  customerName: '',
  phone: '',
  email: '',
  lineId: '',
  brandSlug: 'olympianus',
  productSku: '',
  productName: '',
  serialNo: '',
  purchaseDate: new Date().toISOString().slice(0, 10),
  purchaseChannel: 'website',
  dealerOrBranch: '',
  receiptImage: '',
  watchImage: ''
})
const regSubmitting = ref(false)
const regCreated = ref<any | null>(null)
const uploadingReceipt = ref(false)

async function uploadPublicPhoto(e: Event, target: 'receipt' | 'watch' | 'repair') {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploadingReceipt.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch<any>('/api/warranty/upload', { method: 'POST', body: fd })
    if (res?.url) {
      if (target === 'receipt') regForm.receiptImage = res.url
      else if (target === 'watch') regForm.watchImage = res.url
      else if (target === 'repair') repForm.images.push(res.url)
      toast.success('อัปโหลดรูปภาพเรียบร้อย')
    }
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || 'อัปโหลดรูปไม่สำเร็จ')
  } finally {
    uploadingReceipt.value = false
    input.value = ''
  }
}

async function submitWarranty() {
  regSubmitting.value = true
  try {
    const res = await $fetch<any>('/api/warranty/register', {
      method: 'POST',
      body: { ...regForm }
    })
    regCreated.value = res.item
    toast.success(`ลงทะเบียนรับประกันสำเร็จ หมายเลข ${res.item.warrantyNo}`)
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || 'ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบข้อมูลอีกครั้ง')
  } finally {
    regSubmitting.value = false
  }
}

// 2. Online Watch Repair Form
const repForm = reactive({
  customerName: '',
  phone: '',
  email: '',
  lineId: '',
  warrantyNo: '',
  brandSlug: 'olympianus',
  productSku: '',
  productName: '',
  serialNo: '',
  serviceType: 'warranty_claim',
  symptom: '',
  dropoffMethod: 'parcel_hq',
  branchSlug: '',
  images: [] as string[]
})
const repSubmitting = ref(false)
const repCreated = ref<any | null>(null)

async function submitRepair() {
  repSubmitting.value = true
  try {
    const res = await $fetch<any>('/api/warranty/repair', {
      method: 'POST',
      body: { ...repForm }
    })
    repCreated.value = res.item
    toast.success(`ส่งเรื่องแจ้งซ่อมสำเร็จ หมายเลขใบงาน ${res.item.ticketNo}`)
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || 'ส่งเรื่องแจ้งซ่อมไม่สำเร็จ')
  } finally {
    repSubmitting.value = false
  }
}

// 3. Real-Time Lookup
const lookupQ = ref('')
const lookupLoading = ref(false)
const lookupDone = ref(false)
const foundWarranties = ref<any[]>([])
const foundRepairs = ref<any[]>([])

async function runLookup() {
  if (lookupQ.value.trim().length < 3) {
    toast.error('กรุณากรอกเลขใบรับประกัน, เลขใบซ่อม, Serial No. หรือเบอร์โทรศัพท์อย่างน้อย 3 ตัวอักษร')
    return
  }
  lookupLoading.value = true
  try {
    const res = await $fetch<any>('/api/warranty/lookup', {
      query: { q: lookupQ.value.trim() }
    })
    foundWarranties.value = res.warranties || []
    foundRepairs.value = res.repairs || []
    lookupDone.value = true
  } catch {
    toast.error('ค้นหาข้อมูลไม่สำเร็จ')
  } finally {
    lookupLoading.value = false
  }
}

const heroStyle = computed(() => {
  const sc = cmsPage.value?.styleConfig || {}
  const bg = cmsPage.value?.banner || '/images/op/banner-899832ags.jpg'
  return {
    backgroundImage: `linear-gradient(135deg, rgba(13,20,56,${sc.overlayOpacity ?? 0.82}), rgba(29,32,136,0.78)), url('${bg}')`,
    fontFamily: sc.fontFamily ? `'${sc.fontFamily}', sans-serif` : undefined
  }
})

useHead({
  title: computed(() =>
    cmsPage.value?.seoTitle || 'ลงทะเบียนรับประกันออนไลน์ & แจ้งซ่อมนาฬิกา | OPWatch Thailand'
  ),
  meta: [
    {
      name: 'description',
      content: cmsPage.value?.seoDescription || 'ระบบลงทะเบียนใบรับประกันศูนย์ไทย 2 ปี (E-Warranty) และแจ้งซ่อมนาฬิกา Olym Pianus, Olympia Star, Ogival ออนไลน์ โดย บริษัท อินเตอร์ไทมส์ จำกัด'
    }
  ]
})
</script>

<template>
  <div class="wrt-page">
    <!-- Hero Banner (customizable via Tree CMS `site-warranty`) -->
    <section class="wrt-hero" :style="heroStyle">
      <div class="container wrt-hero__inner">
        <span class="wrt-eyebrow">{{ cmsPage?.heroEyebrow || 'OFFICIAL E-WARRANTY & HOROLOGY CARE CENTER' }}</span>
        <h1 :style="{ color: cmsPage?.styleConfig?.headingColor || '#ffffff' }">
          {{ locale === 'en' ? (cmsPage?.titleEn || 'Online E-Warranty & Watch Repair Portal') : (cmsPage?.titleTh || 'ลงทะเบียนรับประกันศูนย์ไทย 2 ปี & แจ้งซ่อมออนไลน์') }}
        </h1>
        <p>{{ cmsPage?.summary || 'กรอกข้อมูลผ่านหน้าเว็บไซต์เพื่อจัดเก็บเข้าสู่คลังข้อมูลศูนย์บริการ บริษัท อินเตอร์ไทมส์ จำกัด โดยตรง พร้อมตรวจสอบสถานะได้ตลอด 24 ชั่วโมง' }}</p>

        <div class="wrt-tabs">
          <button type="button" :class="{ active: activeTab === 'register' }" @click="activeTab = 'register'">
            🛡 ลงทะเบียนรับประกันออนไลน์
          </button>
          <button type="button" :class="{ active: activeTab === 'repair' }" @click="activeTab = 'repair'">
            🔧 แจ้งซ่อมนาฬิกาออนไลน์
          </button>
          <button type="button" :class="{ active: activeTab === 'lookup' }" @click="activeTab = 'lookup'">
            🔍 ตรวจสอบสถานะประกัน / งานซ่อม
          </button>
        </div>
      </div>
    </section>

    <div class="container wrt-body">
      <!-- ==================== TAB 1: ONLINE WARRANTY REGISTRATION ==================== -->
      <div v-if="activeTab === 'register'" class="wrt-card">
        <div v-if="regCreated" class="wrt-cert">
          <div class="wrt-cert__badge">✓ บันทึกลงคลังข้อมูลรับประกันศูนย์ไทยเรียบร้อย</div>
          <h2>ใบรับประกันอิเล็กทรอนิกส์ (E-Warranty Certificate)</h2>
          <div class="wrt-cert__code">{{ regCreated.warrantyNo }}</div>
          <div class="wrt-cert__grid">
            <div><span>ชื่อผู้ถือสิทธิ์</span><strong>{{ regCreated.customerName }}</strong></div>
            <div><span>รุ่น / รหัสสินค้า</span><strong>{{ regCreated.productName }} ({{ regCreated.productSku }})</strong></div>
            <div><span>หมายเลขตัวเรือน (Serial)</span><strong>{{ regCreated.serialNo }}</strong></div>
            <div><span>คุ้มครองถึงวันที่</span><strong style="color:#0e9f6e">{{ regCreated.warrantyUntil }} (2 ปีเต็ม)</strong></div>
          </div>
          <p class="wrt-cert__note">กรุณาบันทึกหมายเลข <strong>{{ regCreated.warrantyNo }}</strong> ไว้ใช้ตรวจสอบสิทธิ์หรืออ้างอิงเมื่อส่งซ่อม</p>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
            <button type="button" class="wrt-btn wrt-btn--primary" @click="regCreated = null">ลงทะเบียนเรือนถัดไป</button>
            <button type="button" class="wrt-btn wrt-btn--outline" @click="lookupQ = regCreated.warrantyNo; activeTab = 'lookup'; runLookup()">
              ดูสถานะในระบบ
            </button>
          </div>
        </div>

        <form v-else class="wrt-form" @submit.prevent="submitWarranty">
          <div class="wrt-form__hd">
            <h2>แบบฟอร์มลงทะเบียนรับประกันศูนย์ไทย 2 ปี (Online E-Warranty)</h2>
            <p>รองรับนาฬิกา Olym Pianus, Olympia Star และ Ogival ที่ซื้อจากเว็บไซต์, Shopee, Lazada, TikTok Shop, ห้างสรรพสินค้า และร้านตัวแทนจำหน่ายทางการทั่วประเทศ</p>
          </div>

          <div class="wrt-grid">
            <div class="wrt-field">
              <label>ชื่อ-นามสกุลผู้ซื้อ *</label>
              <input v-model="regForm.customerName" required placeholder="เช่น คุณณัฐพล รัตนโชติ" />
            </div>
            <div class="wrt-field">
              <label>เบอร์โทรศัพท์มือถือ *</label>
              <input v-model="regForm.phone" required placeholder="08x-xxx-xxxx" />
            </div>
            <div class="wrt-field">
              <label>อีเมล (สำหรับรับข้อมูลยืนยัน)</label>
              <input v-model="regForm.email" type="email" placeholder="name@example.com" />
            </div>
            <div class="wrt-field">
              <label>LINE ID (สำหรับแจ้งเตือนสถานะ)</label>
              <input v-model="regForm.lineId" placeholder="เช่น @lineid" />
            </div>

            <div class="wrt-field">
              <label>แบรนด์นาฬิกา *</label>
              <select v-model="regForm.brandSlug">
                <option value="olympianus">Olym Pianus (OP)</option>
                <option value="olympia-star">Olympia Star (OPA)</option>
                <option value="ogival">Ogival (Swiss Since 1903)</option>
              </select>
            </div>
            <div class="wrt-field">
              <label>รหัสรุ่นสินค้า (SKU / Reference) *</label>
              <input v-model="regForm.productSku" required placeholder="เช่น OP-899832AGS หรือ OG-358-61AGR" />
            </div>
            <div class="wrt-field">
              <label>หมายเลขตัวเรือน / ฝาหลัง (Serial Number) *</label>
              <input v-model="regForm.serialNo" required placeholder="ระบุตัวเลขสลักฝาหลังหรือในใบรับประกัน" />
            </div>
            <div class="wrt-field">
              <label>วันที่ซื้อสินค้า *</label>
              <input v-model="regForm.purchaseDate" type="date" required />
            </div>

            <div class="wrt-field">
              <label>ช่องทางที่สั่งซื้อ *</label>
              <select v-model="regForm.purchaseChannel">
                <option value="website">เว็บไซต์หลัก opwatch.co.th</option>
                <option value="shopee">Shopee Official Mall</option>
                <option value="lazada">Lazada LazMall</option>
                <option value="tiktok">TikTok Shop Official</option>
                <option value="department_store">เคาน์เตอร์ห้างสรรพสินค้า (เซ็นทรัล / พารากอน ฯลฯ)</option>
                <option value="dealer">ร้านตัวแทนจำหน่ายทางการ (Authorized Dealer)</option>
              </select>
            </div>
            <div class="wrt-field">
              <label>ชื่อสาขา / ชื่อร้านตัวแทน / เลขคำสั่งซื้อ</label>
              <input v-model="regForm.dealerOrBranch" placeholder="เช่น เซ็นทรัลชิดลม หรือ เลขคำสั่งซื้อ OPW-..." />
            </div>

            <div class="wrt-field">
              <label>แนบรูปใบเสร็จ / ใบรับประกัน (ถ้ามี)</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" @change="uploadPublicPhoto($event, 'receipt')" />
              <small v-if="regForm.receiptImage" style="color:#0e9f6e">✓ แนบรูปใบเสร็จแล้ว</small>
            </div>
            <div class="wrt-field">
              <label>แนบรูปเรือนเวลาจริง (ถ้ามี)</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" @change="uploadPublicPhoto($event, 'watch')" />
              <small v-if="regForm.watchImage" style="color:#0e9f6e">✓ แนบรูปนาฬิกาแล้ว</small>
            </div>
          </div>

          <div class="wrt-submit-bar">
            <span>ข้อมูลจะถูกจัดเก็บในคลังข้อมูลศูนย์บริการ บริษัท อินเตอร์ไทมส์ จำกัด ตามมาตรฐาน PDPA</span>
            <button type="submit" class="wrt-btn wrt-btn--primary" :disabled="regSubmitting || uploadingReceipt">
              {{ regSubmitting ? 'กำลังบันทึกข้อมูล...' : '🛡 ยืนยันลงทะเบียนรับประกันออนไลน์' }}
            </button>
          </div>
        </form>
      </div>

      <!-- ==================== TAB 2: ONLINE WATCH REPAIR SUBMISSION ==================== -->
      <div v-else-if="activeTab === 'repair'" class="wrt-card">
        <div v-if="repCreated" class="wrt-cert">
          <div class="wrt-cert__badge" style="background:#eef2ff;color:#1d2088">✓ เปิดใบแจ้งซ่อมเข้าสู่ระบบศูนย์บริการสำเร็จ</div>
          <h2>ใบรับแจ้งซ่อมออนไลน์ (Official Service Ticket)</h2>
          <div class="wrt-cert__code">{{ repCreated.ticketNo }}</div>
          <div class="wrt-cert__grid">
            <div><span>ชื่อผู้ส่งซ่อม</span><strong>{{ repCreated.customerName }}</strong></div>
            <div><span>รุ่นนาฬิกา</span><strong>{{ repCreated.productSku }}</strong></div>
            <div><span>ประเภทบริการ</span><strong>{{ repCreated.serviceType }}</strong></div>
            <div><span>สถานะเริ่มต้น</span><strong style="color:#1d2088">รับเรื่องเข้าศูนย์บริการแล้ว</strong></div>
          </div>
          <p class="wrt-cert__note">
            หากเลือกส่งพัสดุ กรุณาเขียนหมายเลข <strong>{{ repCreated.ticketNo }}</strong> แนบในกล่อง ส่งมาที่:<br />
            <strong>ฝ่ายบริการเทคนิค บริษัท อินเตอร์ไทมส์ จำกัด 1091/229 ซอย 35 ถนนเพชรบุรีตัดใหม่ แขวงมักกะสัน เขตราชเทวี กรุงเทพฯ 10400 (โทร. 02 251 5777)</strong>
          </p>
          <button type="button" class="wrt-btn wrt-btn--primary" @click="repCreated = null">แจ้งซ่อมรายการใหม่</button>
        </div>

        <form v-else class="wrt-form" @submit.prevent="submitRepair">
          <div class="wrt-form__hd">
            <h2>แบบฟอร์มแจ้งซ่อมและบริการดูแลเรือนเวลาออนไลน์</h2>
            <p>แจ้งอาการเบื้องต้นเพื่อให้ทีมช่างเทคนิคประเมินและออกรหัสใบงานซ่อมก่อนนำส่งที่สาขาหรือส่งพัสดุเข้าสำนักงานใหญ่</p>
          </div>

          <div class="wrt-grid">
            <div class="wrt-field">
              <label>ชื่อ-นามสกุลผู้ติดต่อ *</label>
              <input v-model="repForm.customerName" required placeholder="ระบุชื่อ-นามสกุล" />
            </div>
            <div class="wrt-field">
              <label>เบอร์โทรศัพท์ติดต่อกลับ *</label>
              <input v-model="repForm.phone" required placeholder="08x-xxx-xxxx" />
            </div>
            <div class="wrt-field">
              <label>หมายเลข E-Warranty (ถ้าเคยลงทะเบียนไว้)</label>
              <input v-model="repForm.warrantyNo" placeholder="เช่น WRT-2026..." />
            </div>
            <div class="wrt-field">
              <label>LINE ID (สำหรับให้ช่างส่งรูปประเมินอาการ)</label>
              <input v-model="repForm.lineId" placeholder="เช่น opwatch.customer" />
            </div>

            <div class="wrt-field">
              <label>แบรนด์นาฬิกา *</label>
              <select v-model="repForm.brandSlug">
                <option value="olympianus">Olym Pianus (OP)</option>
                <option value="olympia-star">Olympia Star (OPA)</option>
                <option value="ogival">Ogival (Swiss Since 1903)</option>
              </select>
            </div>
            <div class="wrt-field">
              <label>รหัสรุ่นสินค้า (SKU / ชื่อรุ่น) *</label>
              <input v-model="repForm.productSku" required placeholder="เช่น OP-89322AGSK" />
            </div>
            <div class="wrt-field">
              <label>ประเภทบริการที่ต้องการ *</label>
              <select v-model="repForm.serviceType">
                <option value="warranty_claim">เคลมซ่อมในระยะรับประกันศูนย์ 2 ปี</option>
                <option value="battery_seal">เปลี่ยนถ่านสวิสแท้ + ซีลยางกันน้ำ</option>
                <option value="movement_overhaul">ล้างเครื่อง / ปรับตั้งความเที่ยงตรง (Overhaul)</option>
                <option value="crystal_strap">เปลี่ยนกระจกแซฟไฟร์ / สาย / อะไหล่ตัวเรือน</option>
                <option value="general_check">ตรวจเช็กอาการทั่วไปและทำความสะอาด Ultrasonic</option>
              </select>
            </div>
            <div class="wrt-field">
              <label>ช่องทางการส่งมอบนาฬิกาเข้าซ่อม *</label>
              <select v-model="repForm.dropoffMethod">
                <option value="parcel_hq">จัดส่งพัสดุด่วนมายังสำนักงานใหญ่ (เพชรบุรีตัดใหม่)</option>
                <option value="head_office">นำเข้ามาด้วยตนเองที่ศูนย์บริการสำนักงานใหญ่</option>
                <option value="branch_dropoff">ฝากส่งผ่านเคาน์เตอร์สาขาห้างสรรพสินค้า</option>
                <option value="dealer_dropoff">ฝากส่งผ่านร้านตัวแทนจำหน่ายใกล้บ้าน</option>
              </select>
            </div>

            <div v-if="repForm.dropoffMethod === 'branch_dropoff'" class="wrt-field" style="grid-column:1 / -1">
              <label>เลือกสาขาเคาน์เตอร์ที่สะดวกนำส่ง</label>
              <select v-model="repForm.branchSlug">
                <option value="">-- เลือกสาขา --</option>
                <option v-for="br in branches" :key="br.slug" :value="br.slug">{{ br.nameTh || br.name }}</option>
              </select>
            </div>

            <div class="wrt-field" style="grid-column:1 / -1">
              <label>รายละเอียดอาการที่พบหรือสิ่งที่ต้องการให้ช่างดูแล *</label>
              <textarea
                v-model="repForm.symptom"
                rows="4"
                required
                placeholder="อธิบายอาการ เช่น นาฬิกาหยุดเดิน, เดินช้า/เร็วผิดปกติ, เม็ดมะยมหมุนฝืด หรือต้องการตัดสาย..."
              />
            </div>

            <div class="wrt-field" style="grid-column:1 / -1">
              <label>แนบรูปถ่ายสภาพเรือนเวลาหรือจุดที่มีปัญหา (สูงสุด 4 รูป)</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" @change="uploadPublicPhoto($event, 'repair')" />
              <div v-if="repForm.images.length" style="display:flex;gap:10px;margin-top:8px;flex-wrap:wrap">
                <img
                  v-for="(img, idx) in repForm.images"
                  :key="idx"
                  :src="img"
                  alt="repair upload"
                  style="width:74px;height:74px;object-fit:cover;border-radius:10px;border:1px solid #d7dce8"
                />
              </div>
            </div>
          </div>

          <div class="wrt-submit-bar">
            <span>ทีมช่างเทคนิคจะติดต่อกลับเพื่อแจ้งผลประเมินภายใน 1 วันทำการ</span>
            <button type="submit" class="wrt-btn wrt-btn--primary" :disabled="repSubmitting || uploadingReceipt">
              {{ repSubmitting ? 'กำลังส่งคำร้อง...' : '🔧 ส่งเรื่องแจ้งซ่อมและรับเลขใบงาน' }}
            </button>
          </div>
        </form>
      </div>

      <!-- ==================== TAB 3: LIVE STATUS LOOKUP ==================== -->
      <div v-else class="wrt-card">
        <div class="wrt-form__hd">
          <h2>ตรวจสอบสถานะการรับประกันและงานซ่อมแบบเรียลไทม์</h2>
          <p>ค้นหาด้วยหมายเลข E-Warranty (WRT-...), เลขใบงานซ่อม (REP-...), Serial Number หรือเบอร์โทรศัพท์ของคุณ</p>
        </div>

        <form class="wrt-lookup-bar" @submit.prevent="runLookup">
          <input
            v-model="lookupQ"
            placeholder="เช่น WRT-20261101-A91, REP-20261101-701 หรือเบอร์โทร 089-412-8899"
          />
          <button type="submit" class="wrt-btn wrt-btn--primary" :disabled="lookupLoading">
            {{ lookupLoading ? 'กำลังค้นหา...' : '🔍 ค้นหาข้อมูล' }}
          </button>
        </form>

        <div v-if="lookupDone" style="margin-top:22px;display:flex;flex-direction:column;gap:18px">
          <div v-if="!foundWarranties.length && !foundRepairs.length" style="text-align:center;padding:28px;color:#64748b;background:#f8fafc;border-radius:14px">
            ไม่พบข้อมูลที่ตรงกับคำค้นหา กรุณาตรวจสอบตัวสะกดหรือหมายเลขอีกครั้ง
          </div>

          <div v-for="w in foundWarranties" :key="'w-' + w.id" class="lookup-item">
            <div class="lookup-item__top">
              <div>
                <span class="lookup-tag is-wrt">E-WARRANTY · {{ w.warrantyNo }}</span>
                <h3>{{ w.productName }} ({{ w.productSku }})</h3>
              </div>
              <span class="lookup-status" :class="w.status === 'verified' ? 'ok' : 'wait'">
                {{ w.status === 'verified' ? '✓ ยืนยันรับประกันศูนย์ไทยแล้ว' : '⏳ รอตรวจสอบใบเสร็จ' }}
              </span>
            </div>
            <div class="lookup-meta">
              <span>ผู้ลงทะเบียน: <strong>{{ w.customerName }}</strong> ({{ w.phoneMasked }})</span>
              <span>Serial: <strong>{{ w.serialNo }}</strong></span>
              <span>คุ้มครองถึง: <strong style="color:#0e9f6e">{{ w.warrantyUntil }}</strong></span>
            </div>
            <p v-if="w.adminNote" class="lookup-note">หมายเหตุศูนย์บริการ: {{ w.adminNote }}</p>
          </div>

          <div v-for="r in foundRepairs" :key="'r-' + r.id" class="lookup-item">
            <div class="lookup-item__top">
              <div>
                <span class="lookup-tag is-rep">SERVICE TICKET · {{ r.ticketNo }}</span>
                <h3>{{ r.productName }} ({{ r.productSku }})</h3>
              </div>
              <span class="lookup-status ok">{{ r.status.toUpperCase() }}</span>
            </div>
            <div class="lookup-meta">
              <span>ผู้แจ้งซ่อม: <strong>{{ r.customerName }}</strong> ({{ r.phoneMasked }})</span>
              <span>อาการ: <strong>{{ r.symptom }}</strong></span>
              <span>ประเมินค่าใช้จ่าย: <strong>{{ Number(r.estimatedCost) > 0 ? `฿${Number(r.estimatedCost).toLocaleString()}` : 'ฟรีในประกัน / รอประเมิน' }}</strong></span>
              <span v-if="r.trackingReturn">เลขพัสดุส่งคืน: <strong>{{ r.trackingReturn }}</strong></span>
            </div>
            <p v-if="r.technicianNote" class="lookup-note">ความคืบหน้าจากทีมช่าง: {{ r.technicianNote }}</p>
          </div>
        </div>
      </div>

      <!-- Editable CMS Detail Block if configured in Tree CMS -->
      <div v-if="cmsPage?.contentTh" class="wrt-cms-extra" v-html="cmsPage.contentTh" />
    </div>
  </div>
</template>

<style scoped>
.wrt-page {
  background: #f6f8fc;
  min-height: 75vh;
  padding-bottom: 64px;
}
.wrt-hero {
  background-size: cover;
  background-position: center;
  color: #ffffff;
  padding: 58px 0 42px;
}
.wrt-hero__inner {
  max-width: 960px;
  text-align: center;
}
.wrt-eyebrow {
  display: inline-block;
  padding: 5px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.45);
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}
.wrt-hero h1 {
  color: #ffffff;
  margin: 0 0 10px;
  font-size: clamp(26px, 4vw, 38px);
  font-weight: 700;
}
.wrt-hero p {
  margin: 0 auto 24px;
  max-width: 720px;
  color: #ffffff;
  opacity: 0.94;
  font-size: 15px;
  line-height: 1.6;
}
.wrt-tabs {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.12);
  padding: 6px;
  border-radius: 14px;
  backdrop-filter: blur(8px);
}
.wrt-tabs button {
  padding: 10px 18px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #ffffff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.wrt-tabs button.active {
  background: #ffffff;
  color: #1d2088;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
}
.wrt-body {
  max-width: 980px;
  margin-top: -18px;
}
.wrt-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  border: 1px solid #e4e8f2;
  box-shadow: 0 18px 44px rgba(18, 26, 62, 0.07);
}
.wrt-form__hd h2 {
  margin: 0 0 6px;
  font-size: 22px;
  color: #141936;
}
.wrt-form__hd p {
  margin: 0 0 22px;
  color: #64748b;
  font-size: 14px;
}
.wrt-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
@media (max-width: 720px) {
  .wrt-grid {
    grid-template-columns: 1fr;
  }
  .wrt-card {
    padding: 20px;
  }
}
.wrt-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.wrt-field label {
  font-size: 13px;
  font-weight: 600;
  color: #26304d;
}
.wrt-field input,
.wrt-field select,
.wrt-field textarea {
  border-radius: 11px;
  border: 1px solid #d5dbe8;
  padding: 10px 13px;
  font-family: inherit;
  font-size: 14px;
  color: #141936;
  background: #fbfcfe;
}
.wrt-field input:focus,
.wrt-field select:focus,
.wrt-field textarea:focus {
  outline: none;
  border-color: #1d2088;
  background: #ffffff;
}
.wrt-submit-bar {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid #edf0f7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 12.5px;
  color: #64748b;
}
.wrt-btn {
  padding: 12px 22px;
  border-radius: 11px;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}
.wrt-btn--primary {
  background: #1d2088;
  color: #ffffff;
}
.wrt-btn--primary:hover:not(:disabled) {
  background: #15186b;
}
.wrt-btn--outline {
  background: #ffffff;
  border-color: #1d2088;
  color: #1d2088;
}
.wrt-cert {
  text-align: center;
  padding: 18px 10px;
}
.wrt-cert__badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  background: #e5f9f2;
  color: #0e9f6e;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 10px;
}
.wrt-cert__code {
  font-family: monospace;
  font-size: 26px;
  font-weight: 800;
  color: #1d2088;
  letter-spacing: 0.05em;
  margin: 8px 0 18px;
}
.wrt-cert__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  text-align: left;
  background: #f8fafd;
  border: 1px solid #e4e9f5;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 16px;
}
.wrt-cert__grid span {
  display: block;
  font-size: 12px;
  color: #64748b;
}
.wrt-cert__grid strong {
  font-size: 14px;
  color: #141936;
}
.wrt-cert__note {
  font-size: 13.5px;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 18px;
}
.wrt-lookup-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.wrt-lookup-bar input {
  flex: 1;
  min-width: 240px;
  height: 46px;
  border-radius: 11px;
  border: 1px solid #cbd5e1;
  padding: 0 14px;
  font-size: 14.5px;
  font-family: inherit;
}
.lookup-item {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px;
  background: #fbfdff;
}
.lookup-item__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}
.lookup-item__top h3 {
  margin: 6px 0 10px;
  font-size: 17px;
  color: #141936;
}
.lookup-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
}
.lookup-tag.is-wrt {
  background: #e5f9f2;
  color: #0e9f6e;
}
.lookup-tag.is-rep {
  background: #eef2ff;
  color: #1d2088;
}
.lookup-status {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}
.lookup-status.ok {
  background: #e5f9f2;
  color: #0e9f6e;
}
.lookup-status.wait {
  background: #fff6e4;
  color: #b45309;
}
.lookup-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: #475569;
}
.lookup-note {
  margin: 12px 0 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f1f5f9;
  font-size: 13px;
  color: #1e293b;
}
.wrt-cms-extra {
  margin-top: 22px;
  padding: 20px 24px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e5e9f4;
  color: #334155;
  font-size: 14px;
  line-height: 1.7;
}
</style>
