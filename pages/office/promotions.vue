<script setup lang="ts">
import { autoEnhanceFile, autoEnhanceExistingUrl } from '~/utils/autoImageEnhance'

definePageMeta({ layout: 'office', middleware: ['office'] })

const toast = useToast()
const { hasPerm, isDealer } = useOfficeAuth()
const canEditPromos = computed(() => hasPerm('promotions'))
const canEditBranches = computed(() => hasPerm('branches'))
const tab = ref<'banners' | 'coupons' | 'branches'>('banners')

const { data: promoData, refresh: refreshPromos } = await useFetch<any>('/api/admin/promotions')
const { data: couponData, refresh: refreshCoupons } = await useFetch<any>('/api/admin/coupons')
const { data: branchData, refresh: refreshBranches } = await useFetch<any>('/api/admin/branches')

// --- 1. Promotion Banner Form ---
const editingPromoId = ref<number | null>(null)
const aiBannerBusy = ref(false)
const promoForm = reactive({
  titleTh: '',
  titleEn: '',
  subtitleTh: '',
  subtitleEn: '',
  bannerImage: '/images/op/banner-899832ags.jpg',
  channel: 'website',
  targetUrl: '/products',
  ctaTh: 'ช้อปโปรโมชั่นนี้',
  badgeText: 'SPECIAL OFFER',
  couponCode: '',
  showOnHome: true,
  active: true,
  sortOrder: 10
})

function resetPromoForm() {
  editingPromoId.value = null
  promoForm.titleTh = ''
  promoForm.titleEn = ''
  promoForm.subtitleTh = ''
  promoForm.subtitleEn = ''
  promoForm.bannerImage = '/images/op/banner-899832ags.jpg'
  promoForm.channel = 'website'
  promoForm.targetUrl = '/products'
  promoForm.ctaTh = 'ช้อปโปรโมชั่นนี้'
  promoForm.badgeText = 'SPECIAL OFFER'
  promoForm.couponCode = ''
  promoForm.showOnHome = true
  promoForm.active = true
  promoForm.sortOrder = 10
}

function editPromo(p: any) {
  editingPromoId.value = p.id
  Object.assign(promoForm, {
    titleTh: p.titleTh || '',
    titleEn: p.titleEn || '',
    subtitleTh: p.subtitleTh || '',
    subtitleEn: p.subtitleEn || '',
    bannerImage: p.bannerImage || '/images/op/banner-899832ags.jpg',
    channel: p.channel || 'website',
    targetUrl: p.targetUrl || '/products',
    ctaTh: p.ctaTh || 'ช้อปโปรโมชั่นนี้',
    badgeText: p.badgeText || '',
    couponCode: p.couponCode || '',
    showOnHome: Boolean(p.showOnHome),
    active: p.active !== false,
    sortOrder: Number(p.sortOrder ?? 10)
  })
}

const autoEnhanceBanner = ref(true)
const enhancingBanner = ref(false)
const aiCouponBusy = ref(false)

async function uploadBannerFile(e: any) {
  let f = e.target?.files?.[0]
  if (!f) return
  if (autoEnhanceBanner.value && import.meta.client) {
    try {
      f = await autoEnhanceFile(f, { preset: 'banner-wide', autoTrim: false, cleanWhiteBg: false })
    } catch {}
  }
  const fd = new FormData()
  fd.append('files', f, f.name)
  try {
    const res = await $fetch<{ urls: string[] }>('/api/admin/upload', { method: 'POST', body: fd })
    if (res.urls?.[0]) {
      promoForm.bannerImage = res.urls[0]
      toast.success(autoEnhanceBanner.value ? '✨ อัปโหลดและปรับภาพแบนเนอร์ 16:9 อัตโนมัติสำเร็จ!' : 'อัปโหลดภาพแบนเนอร์สำเร็จ!')
    }
  } catch {
    toast.error('อัปโหลดภาพไม่สำเร็จ')
  }
}

async function enhanceCurrentBanner() {
  if (!promoForm.bannerImage || !import.meta.client) return
  enhancingBanner.value = true
  try {
    const enhanced = await autoEnhanceExistingUrl(promoForm.bannerImage, { preset: 'banner-wide', autoTrim: false, cleanWhiteBg: false })
    const fd = new FormData()
    fd.append('files', enhanced, enhanced.name)
    const res = await $fetch<{ urls: string[] }>('/api/admin/upload', { method: 'POST', body: fd })
    if (res.urls?.[0]) {
      promoForm.bannerImage = res.urls[0]
      toast.success('✨ ปรับแสงและความคมชัดภาพแบนเนอร์อัตโนมัติเรียบร้อย!')
    }
  } catch {
    toast.error('ปรับภาพแบนเนอร์ไม่สำเร็จ')
  } finally {
    enhancingBanner.value = false
  }
}

async function generateCouponAi() {
  aiCouponBusy.value = true
  try {
    const res = await $fetch<any>('/api/admin/ai/generate', {
      method: 'POST',
      body: {
        task: 'coupon_copy',
        input: {
          code: couponForm.code || 'OPVIP500',
          type: couponForm.type,
          value: couponForm.value,
          minSpend: couponForm.minSpend
        }
      }
    })
    if (res?.result) {
      if (!couponForm.code && res.result.code) couponForm.code = res.result.code
      if (res.result.titleTh) couponForm.titleTh = res.result.titleTh
      toast.success('✨ AI คิดชื่อสิทธิพิเศษคูปองให้เรียบร้อย!')
    }
  } catch {
    toast.error('เรียก AI ไม่สำเร็จ')
  } finally {
    aiCouponBusy.value = false
  }
}

async function generatePromoAi() {
  aiBannerBusy.value = true
  try {
    const res = await $fetch<any>('/api/admin/ai/generate', {
      method: 'POST',
      body: {
        task: 'promo-copy',
        input: { topic: promoForm.titleTh || 'โปรโมชั่นนาฬิกาของแท้ศูนย์ไทย', channel: promoForm.channel }
      }
    })
    const r = res.result || {}
    if (r.titleTh) promoForm.titleTh = r.titleTh
    if (r.titleEn) promoForm.titleEn = r.titleEn
    if (r.subtitleTh) promoForm.subtitleTh = r.subtitleTh
    if (r.subtitleEn) promoForm.subtitleEn = r.subtitleEn
    if (r.badgeText) promoForm.badgeText = r.badgeText
    if (r.ctaTh) promoForm.ctaTh = r.ctaTh
    toast.success('AI ร่างแคมเปญโปรโมชั่นเรียบร้อย!')
  } catch {
    toast.error('เรียก AI ไม่สำเร็จ')
  } finally {
    aiBannerBusy.value = false
  }
}

async function savePromo() {
  if (!promoForm.titleTh.trim()) {
    toast.error('กรุณาระบุชื่อแคมเปญโปรโมชั่น')
    return
  }
  try {
    if (editingPromoId.value) {
      await $fetch(`/api/admin/promotions/${editingPromoId.value}`, { method: 'PUT', body: promoForm })
    } else {
      await $fetch('/api/admin/promotions', { method: 'POST', body: promoForm })
    }
    toast.success('บันทึกแบนเนอร์โปรโมชั่นเรียบร้อย')
    resetPromoForm()
    await refreshPromos()
  } catch {
    toast.error('บันทึกโปรโมชั่นไม่สำเร็จ')
  }
}

async function deletePromo(id: number) {
  if (!import.meta.client || !window.confirm('ต้องการลบแบนเนอร์นี้?')) return
  await $fetch(`/api/admin/promotions/${id}`, { method: 'DELETE' })
  await refreshPromos()
}

// --- 2. Coupon / Gift Card Form ---
const editingCouponId = ref<number | null>(null)
const couponForm = reactive({
  code: '',
  titleTh: '',
  type: 'fixed',
  value: 300,
  minSpend: 3000,
  maxDiscount: 0,
  usageLimit: 500,
  isGiftCard: false,
  active: true
})

async function saveCoupon() {
  if (!couponForm.code.trim()) {
    toast.error('กรุณาระบุรหัสคูปอง')
    return
  }
  try {
    const body = { ...couponForm, maxDiscount: couponForm.maxDiscount > 0 ? couponForm.maxDiscount : null }
    if (editingCouponId.value) {
      await $fetch(`/api/admin/coupons/${editingCouponId.value}`, { method: 'PUT', body })
    } else {
      await $fetch('/api/admin/coupons', { method: 'POST', body })
    }
    toast.success('บันทึกคูปอง/บัตรของขวัญเรียบร้อย')
    editingCouponId.value = null
    couponForm.code = ''
    couponForm.titleTh = ''
    await refreshCoupons()
  } catch {
    toast.error('บันทึกคูปองไม่สำเร็จ')
  }
}

async function deleteCoupon(id: number) {
  if (!import.meta.client || !window.confirm('ต้องการลบคูปองนี้?')) return
  await $fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
  await refreshCoupons()
}

// --- 3. Thailand Branch Form ---
const editingBranchId = ref<number | null>(null)
const branchForm = reactive({
  nameTh: '',
  province: 'กรุงเทพมหานคร',
  district: '',
  addressTh: '',
  phone: '02 251 5777',
  hours: 'ทุกวัน 10:30 - 21:00 น.',
  mapUrl: '',
  stockNote: 'มีบริการ Click & Collect และตัดสายนาฬิกาฟรี',
  hasPickup: true,
  active: true
})

async function saveBranch() {
  if (!branchForm.nameTh.trim()) return
  if (editingBranchId.value) {
    await $fetch(`/api/admin/branches/${editingBranchId.value}`, { method: 'PUT', body: branchForm })
  } else {
    await $fetch('/api/admin/branches', { method: 'POST', body: branchForm })
  }
  toast.success('บันทึกข้อมูลสาขาเรียบร้อย')
  editingBranchId.value = null
  branchForm.nameTh = ''
  branchForm.addressTh = ''
  await refreshBranches()
}

async function deleteBranch(id: number) {
  if (!import.meta.client || !window.confirm('ต้องการลบสาขานี้?')) return
  await $fetch(`/api/admin/branches/${id}`, { method: 'DELETE' })
  await refreshBranches()
}

useHead({ title: 'จัดการโปรโมชั่นทุกช่องทาง คูปอง & สาขา — OPWatch Office' })
</script>

<template>
  <div>
    <div class="erp-page-head">
      <div>
        <div class="erp-kicker">OMNICHANNEL CAMPAIGNS · VOUCHERS · CLICK &amp; COLLECT</div>
        <h1 class="erp-h1">
          {{ isDealer ? 'โปรโมชั่นแคมเปญ คูปองส่วนลด & สาขารับสินค้าหน้าร้าน' : 'จัดการโปรโมชั่นทุกช่องทาง คูปองส่วนลด & สาขาใกล้บ้าน' }}
        </h1>
        <p class="erp-sub">
          {{
            isDealer
              ? 'ตรวจสอบโปรโมชั่นปัจจุบัน คูปองส่วนลด และจุดรับสินค้าของศูนย์ไทย เพื่อแนะนำสิทธิพิเศษให้ลูกค้าหน้าร้าน (มุมมองสำหรับตัวแทนจำหน่าย)'
              : 'จัดการแบนเนอร์โปรโมชั่นหน้าแรก (ใต้โลโก้ 3 แบรนด์), รวมแคมเปญลิงก์ออกทุกช่องทาง (Shopee, TikTok, LINE, FB), คูปอง และสาขาทั่วไทย'
          }}
        </p>
      </div>
    </div>

    <div class="erp-tabs">
      <button type="button" class="erp-tab" :class="{ 'is-active': tab === 'banners' }" @click="tab = 'banners'">
        🖼 แบนเนอร์โปรโมชั่นทุกช่องทาง ({{ (promoData?.items || []).length }})
      </button>
      <button type="button" class="erp-tab" :class="{ 'is-active': tab === 'coupons' }" @click="tab = 'coupons'">
        🎟 คูปอง &amp; บัตรของขวัญ ({{ (couponData?.items || []).length }})
      </button>
      <button type="button" class="erp-tab" :class="{ 'is-active': tab === 'branches' }" @click="tab = 'branches'">
        📍 สาขาใกล้บ้านทั่วไทย ({{ (branchData?.items || []).length }})
      </button>
    </div>

    <!-- TAB 1: PROMOTION BANNERS -->
    <template v-if="tab === 'banners'">
      <div v-if="canEditPromos" class="erp-panel">
        <div class="erp-panel__head">
          <div class="erp-panel__title">{{ editingPromoId ? 'แก้ไขแบนเนอร์โปรโมชั่น' : '+ เพิ่มแบนเนอร์โปรโมชั่นใหม่' }}</div>
          <button type="button" class="erp-btn erp-btn--sm erp-btn--violet" :disabled="aiBannerBusy" @click="generatePromoAi">
            {{ aiBannerBusy ? 'AI กำลังเขียน...' : '✨ ให้ AI ช่วยคิดคำโฆษณาแคมเปญ' }}
          </button>
        </div>

        <div class="erp-form-grid erp-form-grid--3">
          <div class="erp-field">
            <label class="erp-label">ช่องทางจำหน่าย (Channel)</label>
            <select v-model="promoForm.channel" class="erp-select">
              <option value="website">เว็บไซต์ OPWatch.co.th</option>
              <option value="shopee">Shopee Official Store</option>
              <option value="tiktok">TikTok Shop</option>
              <option value="line">LINE Official (opwatch.th)</option>
              <option value="facebook">Facebook Page</option>
              <option value="store">เคาน์เตอร์ห้างสรรพสินค้า</option>
            </select>
          </div>
          <div class="erp-field">
            <label class="erp-label">ลิงก์ปลายทางเมื่อคลิกแบนเนอร์ (URL ภายนอก หรือภายในเว็บ)</label>
            <input v-model="promoForm.targetUrl" class="erp-input" placeholder="เช่น https://shopee.co.th/opwatchthailand หรือ /products" />
          </div>
          <div class="erp-field">
            <label class="erp-label">รหัสคูปองที่ผูกกับแบนเนอร์ (ถ้ามี)</label>
            <input v-model="promoForm.couponCode" class="erp-input" placeholder="เช่น OPWELCOME300" />
          </div>
        </div>

        <div class="erp-form-grid" style="margin-top:12px">
          <div class="erp-field">
            <label class="erp-label">หัวข้อโปรโมชั่น (ไทย) *</label>
            <input v-model="promoForm.titleTh" class="erp-input" placeholder="เช่น Shopee Brand Day ลดสูงสุด 35% + โค้ดลดเพิ่ม" />
          </div>
          <div class="erp-field">
            <label class="erp-label">คำอธิบายรอง (ไทย)</label>
            <input v-model="promoForm.subtitleTh" class="erp-input" placeholder="เช่น ผ่อน 0% ของแท้ประกันศูนย์ไทย 2 ปี" />
          </div>
        </div>

        <div class="erp-form-grid erp-form-grid--3" style="margin-top:12px">
          <div class="erp-field">
            <label class="erp-label">รูปภาพกราฟิกแบนเนอร์ (URL หรืออัปโหลดไฟล์ + ปรับภาพอัตโนมัติ)</label>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <input v-model="promoForm.bannerImage" class="erp-input" style="flex:1;min-width:160px" />
              <label class="erp-btn erp-btn--sm" style="white-space:nowrap">
                📸 อัปโหลด
                <input type="file" accept="image/*" hidden @change="uploadBannerFile" />
              </label>
              <button
                type="button"
                class="erp-btn erp-btn--violet erp-btn--sm"
                :disabled="enhancingBanner"
                @click="enhanceCurrentBanner"
              >
                {{ enhancingBanner ? 'กำลังปรับ...' : '✨ ปรับภาพ' }}
              </button>
            </div>
          </div>
          <div class="erp-field">
            <label class="erp-label">ป้ายกำกับเด่น (Badge)</label>
            <input v-model="promoForm.badgeText" class="erp-input" placeholder="เช่น MEGA CAMPAIGN" />
          </div>
          <div class="erp-field">
            <label class="erp-label">ข้อความบนปุ่มคลิก (CTA)</label>
            <input v-model="promoForm.ctaTh" class="erp-input" />
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;flex-wrap:wrap;gap:12px">
          <div style="display:flex;gap:18px">
            <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
              <input v-model="promoForm.showOnHome" type="checkbox" /> ★ แสดงบนหน้าแรก (ถัดจากโลโก้ 3 แบรนด์)
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
              <input v-model="promoForm.active" type="checkbox" /> เปิดใช้งาน
            </label>
          </div>
          <div style="display:flex;gap:8px">
            <button v-if="editingPromoId" type="button" class="erp-btn" @click="resetPromoForm">ยกเลิกแก้ไข</button>
            <button type="button" class="erp-btn erp-btn--primary" @click="savePromo">💾 บันทึกแบนเนอร์</button>
          </div>
        </div>
      </div>

      <div class="erp-panel">
        <div class="erp-table-wrap">
          <table class="erp-table">
            <thead>
              <tr>
                <th>ภาพ</th>
                <th>แคมเปญ</th>
                <th>ช่องทาง</th>
                <th>ลิงก์ปลายทาง</th>
                <th>แสดงหน้าแรก</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in promoData?.items || []" :key="p.id">
                <td><img :src="p.bannerImage" alt="" style="width:92px;height:48px;object-fit:cover;border-radius:6px" /></td>
                <td>
                  <strong>{{ p.titleTh }}</strong>
                  <div style="font-size:11.5px;color:#94a3b8">{{ p.subtitleTh }}</div>
                </td>
                <td><span class="erp-chip erp-chip--cyan">{{ p.channel }}</span></td>
                <td style="font-family:monospace;font-size:11.5px;max-width:220px;overflow:hidden;text-overflow:ellipsis">{{ p.targetUrl }}</td>
                <td>
                  <span class="erp-chip" :class="p.showOnHome ? 'erp-chip--mint' : ''">{{ p.showOnHome ? '✓ หน้าแรก' : 'หน้าโปรฯ' }}</span>
                </td>
                <td>
                  <div v-if="canEditPromos" style="display:flex;gap:6px">
                    <button type="button" class="erp-btn erp-btn--sm" @click="editPromo(p)">แก้ไข</button>
                    <button type="button" class="erp-btn erp-btn--sm erp-btn--danger" @click="deletePromo(p.id)">ลบ</button>
                  </div>
                  <span v-else class="erp-chip">ดูข้อมูลแคมเปญ</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- TAB 2: COUPONS & GIFT CARDS -->
    <template v-else-if="tab === 'coupons'">
      <div v-if="canEditPromos" class="erp-panel">
        <div class="erp-panel__head">
          <div class="erp-panel__title">+ สร้างคูปองส่วนลด / บัตรของขวัญ (Gift Card)</div>
          <button type="button" class="erp-btn erp-btn--violet erp-btn--sm" :disabled="aiCouponBusy" @click="generateCouponAi">
            {{ aiCouponBusy ? 'กำลังคิด...' : '✨ ให้ AI คิดชื่อสิทธิพิเศษคูปอง' }}
          </button>
        </div>
        <div class="erp-form-grid erp-form-grid--3">
          <div class="erp-field">
            <label class="erp-label">รหัสโค้ด (Code) *</label>
            <input v-model="couponForm.code" class="erp-input" placeholder="เช่น OPMEGA500 หรือ GIFT2000" />
          </div>
          <div class="erp-field">
            <label class="erp-label">ชื่อสิทธิพิเศษ</label>
            <input v-model="couponForm.titleTh" class="erp-input" placeholder="เช่น ลดทันที 500 บาท เมื่อช้อปครบ 5,000" />
          </div>
          <div class="erp-field">
            <label class="erp-label">รูปแบบส่วนลด</label>
            <select v-model="couponForm.type" class="erp-select">
              <option value="fixed">ลดเป็นจำนวนเงินบาท (฿)</option>
              <option value="percent">ลดเป็นเปอร์เซ็นต์ (%)</option>
            </select>
          </div>
          <div class="erp-field">
            <label class="erp-label">มูลค่าส่วนลด</label>
            <input v-model.number="couponForm.value" type="number" class="erp-input" />
          </div>
          <div class="erp-field">
            <label class="erp-label">ยอดซื้อขั้นต่ำ (บาท)</label>
            <input v-model.number="couponForm.minSpend" type="number" class="erp-input" />
          </div>
          <div class="erp-field">
            <label class="erp-label">ลดสูงสุด (บาท · 0 = ไม่จำกัด)</label>
            <input v-model.number="couponForm.maxDiscount" type="number" class="erp-input" />
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px">
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
            <input v-model="couponForm.isGiftCard" type="checkbox" /> เป็นบัตรของขวัญ (Gift Card)
          </label>
          <button type="button" class="erp-btn erp-btn--primary" @click="saveCoupon">💾 บันทึกคูปอง</button>
        </div>
      </div>

      <div class="erp-panel">
        <div class="erp-table-wrap">
          <table class="erp-table">
            <thead>
              <tr>
                <th>รหัสโค้ด</th>
                <th>รายละเอียด</th>
                <th>มูลค่า</th>
                <th>ขั้นต่ำ</th>
                <th>ใช้ไปแล้ว</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in couponData?.items || []" :key="c.id">
                <td style="font-family:monospace;font-weight:700;color:#6c5ce7">{{ c.code }}</td>
                <td>{{ c.titleTh }}</td>
                <td>{{ c.type === 'percent' ? `${c.value}%` : `฿${c.value}` }}</td>
                <td>฿{{ c.minSpend }}</td>
                <td>{{ c.usedCount || 0 }} / {{ c.usageLimit || 999 }}</td>
                <td>
                  <button v-if="canEditPromos" type="button" class="erp-btn erp-btn--sm erp-btn--danger" @click="deleteCoupon(c.id)">ลบ</button>
                  <span v-else class="erp-chip erp-chip--mint">ใช้งานได้</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- TAB 3: THAILAND BRANCHES -->
    <template v-else>
      <div v-if="canEditBranches" class="erp-panel">
        <div class="erp-panel__title" style="margin-bottom:12px">+ เพิ่มสาขาเคาน์เตอร์ / จุดรับสินค้าใกล้บ้าน (ประเทศไทย)</div>
        <div class="erp-form-grid erp-form-grid--3">
          <div class="erp-field">
            <label class="erp-label">ชื่อสาขา *</label>
            <input v-model="branchForm.nameTh" class="erp-input" placeholder="เช่น เคาน์เตอร์ เซ็นทรัล พระราม 9" />
          </div>
          <div class="erp-field">
            <label class="erp-label">จังหวัด</label>
            <input v-model="branchForm.province" class="erp-input" />
          </div>
          <div class="erp-field">
            <label class="erp-label">เขต / อำเภอ</label>
            <input v-model="branchForm.district" class="erp-input" />
          </div>
          <div class="erp-field">
            <label class="erp-label">ที่อยู่สาขา</label>
            <input v-model="branchForm.addressTh" class="erp-input" />
          </div>
          <div class="erp-field">
            <label class="erp-label">เบอร์โทรศัพท์</label>
            <input v-model="branchForm.phone" class="erp-input" />
          </div>
          <div class="erp-field">
            <label class="erp-label">เวลาทำการ</label>
            <input v-model="branchForm.hours" class="erp-input" />
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:14px">
          <button type="button" class="erp-btn erp-btn--primary" @click="saveBranch">💾 บันทึกสาขา</button>
        </div>
      </div>

      <div class="erp-panel">
        <div class="erp-table-wrap">
          <table class="erp-table">
            <thead>
              <tr>
                <th>ชื่อสาขา</th>
                <th>จังหวัด</th>
                <th>โทรศัพท์</th>
                <th>เวลาทำการ</th>
                <th>Click &amp; Collect</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in branchData?.items || []" :key="b.id">
                <td><strong>{{ b.nameTh }}</strong><div style="font-size:11.5px;color:#94a3b8">{{ b.addressTh }}</div></td>
                <td>{{ b.province }}</td>
                <td>{{ b.phone }}</td>
                <td>{{ b.hours }}</td>
                <td><span class="erp-chip erp-chip--mint">{{ b.hasPickup ? 'พร้อมรับที่สาขา' : 'โชว์รูม' }}</span></td>
                <td>
                  <button v-if="canEditBranches" type="button" class="erp-btn erp-btn--sm erp-btn--danger" @click="deleteBranch(b.id)">ลบ</button>
                  <span v-else class="erp-chip">จุดบริการ</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
