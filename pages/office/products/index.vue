<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const localePath = useLocalePath()
const route = useRoute()
const officeAuth = useOfficeAuth()
const { site } = useSite()
const toast = useToast()

const isDealer = computed(() => officeAuth.role.value === 'dealer')
const canEditProduct = computed(() => officeAuth.hasPermission('products_edit'))

const search = ref('')
const brandFilter = ref('')
const page = ref(1)

const [{ data, refresh, pending }, { data: shopeeAudit, refresh: refreshAudit }] = await Promise.all([
  useFetch<any>('/api/admin/products', {
    query: computed(() => ({
      q: search.value || undefined,
      brand: brandFilter.value || undefined,
      page: page.value,
      limit: 25
    }))
  }),
  useFetch<any>('/api/admin/products/shopee-audit', {
    default: () => null
  })
])

const items = computed(() => data.value?.items || data.value?.products || [])
const total = computed(() => Number(data.value?.total || items.value.length))

const auditSummary = computed(() => shopeeAudit.value?.summary || null)
const requireSyncPw = computed(() => shopeeAudit.value?.requireSyncPassword !== false)

// Shopee Comparison, Seller Center CSV & Staging Studio
const quickShopeeOpen = ref(Boolean(route.query.shopee === '1'))
const quickShopeeUrl = ref('https://shopee.co.th/opwatchthailand')
const quickShopeeRaw = ref('')
const showRawShopeePaste = ref(false)
const showBookmarkletHelp = ref(false)
const shopeeInspecting = ref(false)
const quickShopeeSaving = ref(false)
const csvFileInput = ref<HTMLInputElement | null>(null)

const stagedReport = ref<any>(null)
const stagedFilter = ref<'all' | 'missing' | 'needs_sync' | 'synced'>('all')
const selectedStagedSkus = ref<string[]>([])
const selectedStagedPromos = ref<string[]>([])
const optImportImages = ref(true)
const optImportContent = ref(true)
const optImportPromotions = ref(true)

// Password Confirmation Modal before writing Shopee items into Website DB
const syncPwModalOpen = ref(false)
const syncPasswordInput = ref('')
const syncPwError = ref('')
const pendingCommitMode = ref<'quick_missing' | 're_sync_all' | 'selected'>('quick_missing')

const filteredStagedItems = computed(() => {
  const list = stagedReport.value?.items || []
  if (stagedFilter.value === 'all') return list
  return list.filter((it: any) => it.syncStatus === stagedFilter.value)
})

async function inspectShopeeBeforeImport(defaultFilter: 'all' | 'missing' | 'needs_sync' | 'synced' = 'all') {
  if (!quickShopeeUrl.value.trim() && !quickShopeeRaw.value.trim()) return
  shopeeInspecting.value = true
  quickShopeeOpen.value = true
  try {
    const res = await $fetch<any>('/api/admin/products/shopee-import', {
      method: 'POST',
      body: {
        url: quickShopeeUrl.value.trim(),
        rawPayload: quickShopeeRaw.value.trim() || undefined,
        commit: false
      }
    })
    stagedReport.value = res
    stagedFilter.value = defaultFilter
    const pendingItems = (res.items || []).filter((it: any) => it.syncStatus !== 'synced')
    selectedStagedSkus.value =
      pendingItems.length > 0
        ? pendingItems.map((it: any) => String(it.sku))
        : (res.items || []).map((it: any) => String(it.sku))
    selectedStagedPromos.value = (res.promotions || []).map((pr: any) => String(pr.slug))
    toast.success(
      `ตรวจสอบเทียบสำเร็จ: พบใน Shopee ${res.summary?.totalItems || 0} รุ่น · ยังไม่มีในเว็บ ${res.summary?.missingCount || 0} รุ่น · รอซิงก์โปร ${res.summary?.needsPromoSyncCount || 0} รุ่น`
    )
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'ไม่สามารถตรวจสอบข้อมูล Shopee ได้')
  } finally {
    shopeeInspecting.value = false
  }
}

function handleCsvUpload(e: Event) {
  const inputEl = e.target as HTMLInputElement
  const file = inputEl?.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async () => {
    quickShopeeRaw.value = String(reader.result || '')
    showRawShopeePaste.value = true
    toast.success(`อ่านไฟล์ "${file.name}" เรียบร้อย กำลังตรวจสอบเทียบกับเว็บไซต์...`)
    await inspectShopeeBeforeImport('all')
    if (inputEl) inputEl.value = ''
  }
  reader.readAsText(file, 'utf-8')
}

async function copyBookmarklet() {
  const script = shopeeAudit.value?.bookmarkletScript || stagedReport.value?.bookmarkletScript || ''
  if (!script || !import.meta.client) return
  await navigator.clipboard.writeText(script)
  toast.success('คัดลอกโค้ด Bookmarklet แล้ว! นำไปวางเป็น URL ของบุ๊กมาร์กบนเบราว์เซอร์ได้ทันที')
}

function toggleAllStagedSkus(checked: boolean) {
  const visible = filteredStagedItems.value
  if (!visible.length) return
  if (checked) {
    const merged = new Set([...selectedStagedSkus.value, ...visible.map((it: any) => String(it.sku))])
    selectedStagedSkus.value = [...merged]
  } else {
    const removeSet = new Set(visible.map((it: any) => String(it.sku)))
    selectedStagedSkus.value = selectedStagedSkus.value.filter((sku) => !removeSet.has(sku))
  }
}

function selectOnlyMissingSkus() {
  if (!stagedReport.value?.items) return
  selectedStagedSkus.value = stagedReport.value.items
    .filter((it: any) => it.syncStatus !== 'synced')
    .map((it: any) => String(it.sku))
}

function initiateShopeePull(mode: 'quick_missing' | 're_sync_all' | 'selected') {
  if (mode === 'selected' && !selectedStagedSkus.value.length && !(optImportPromotions.value && selectedStagedPromos.value.length)) {
    toast.error('กรุณาเลือกรายการสินค้าหรือโปรโมชั่นอย่างน้อย 1 รายการ')
    return
  }
  pendingCommitMode.value = mode
  syncPwError.value = ''
  if (requireSyncPw.value) {
    syncPasswordInput.value = ''
    syncPwModalOpen.value = true
  } else {
    executeShopeeCommit()
  }
}

async function executeShopeeCommit() {
  if (requireSyncPw.value && !syncPasswordInput.value.trim()) {
    syncPwError.value = 'กรุณากรอกรหัสผ่านยืนยันการดึงข้อมูลก่อนดำเนินการ'
    return
  }
  quickShopeeSaving.value = true
  syncPwError.value = ''
  try {
    const mode = pendingCommitMode.value
    const payload: Record<string, any> = {
      url: quickShopeeUrl.value.trim() || 'https://shopee.co.th/opwatchthailand',
      rawPayload: mode === 'selected' ? quickShopeeRaw.value.trim() || undefined : undefined,
      commit: true,
      syncPassword: syncPasswordInput.value.trim(),
      importImages: optImportImages.value,
      importContent: optImportContent.value,
      importPromotions: optImportPromotions.value
    }

    if (mode === 'quick_missing') {
      payload.onlyPending = true
    } else if (mode === 'selected') {
      payload.selectedSkus = selectedStagedSkus.value
      payload.selectedPromotionSlugs = selectedStagedPromos.value
    }

    const res = await $fetch<any>('/api/admin/products/shopee-import', {
      method: 'POST',
      body: payload
    })

    syncPwModalOpen.value = false
    syncPasswordInput.value = ''
    toast.success(
      `ดึงข้อมูลเข้าเว็บไซต์สำเร็จ! เพิ่มใหม่ ${res.createdCount || 0} รุ่น · อัปเดต ${res.updatedCount || 0} รุ่น · โปรโมชั่น ${res.promotionsCount || 0} แคมเปญ`
    )
    await Promise.all([refresh(), refreshAudit()])
    if (stagedReport.value) {
      await inspectShopeeBeforeImport('all')
    }
  } catch (e: any) {
    const msg = e?.data?.statusMessage || 'บันทึกข้อมูลจาก Shopee ไม่สำเร็จ'
    syncPwError.value = msg
    toast.error(msg)
  } finally {
    quickShopeeSaving.value = false
  }
}

async function removeProduct(p: any) {
  if (!import.meta.client || !window.confirm(`ยืนยันการลบสินค้า "${p.nameTh || p.sku}"?`)) return
  try {
    await $fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' })
    toast.success('ลบสินค้าเรียบร้อย')
    await Promise.all([refresh(), refreshAudit()])
  } catch {
    toast.error('ลบสินค้าไม่สำเร็จ')
  }
}

onMounted(() => {
  if (route.query.shopee === '1' && canEditProduct.value && !stagedReport.value) {
    inspectShopeeBeforeImport('all')
  }
})

const fmt = (v: number) => formatPrice(Number(v || 0), site.value.currencySymbol || '฿', 'th-TH')

useHead({ title: 'จัดการสินค้า & ดึงข้อมูล Shopee opwatchthailand — OPWatch Office' })
</script>

<template>
  <div>
    <div class="erp-page-head">
      <div>
        <div class="erp-kicker">{{ isDealer ? 'AUTHORIZED DEALER WHOLESALE CATALOG' : 'MODULE 7.2 · CATALOGUE, SHOPEE SYNC & 5-CHANNEL STOCK' }}</div>
        <h1 class="erp-h1">{{ isDealer ? `แคตตาล็อกราคาเฉพาะตัวแทนจำหน่าย (${total} รุ่น)` : `ระบบจัดการสินค้า (บนเว็บทั้งหมด ${total} รุ่น)` }}</h1>
        <p class="erp-sub">
          <template v-if="isDealer">
            แสดงราคาส่งเฉพาะตัวแทนจำหน่าย เทียบราคาขายปลีก พร้อมสถานะคลังสินค้าหน้าร้านของตัวแทนเอง
          </template>
          <template v-else>
            ตรวจสอบเทียบ <code>shopee.co.th/opwatchthailand</code> · ปุ่มดึงข้อมูลเข้าเว็บในคลิกเดียว · สต็อก 5 ช่องทาง · AI SEO
          </template>
        </p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <NuxtLink to="/office/manual" class="erp-btn erp-btn--ghost">
          📘 คู่มือการดึงข้อมูล &amp; รหัสผ่าน
        </NuxtLink>
        <NuxtLink to="/office/warehouse" class="erp-btn erp-btn--ghost">
          📦 {{ isDealer ? 'คลังสินค้าตัวแทนเอง' : 'คลังสินค้า 5 ช่องทาง' }} →
        </NuxtLink>
        <NuxtLink v-if="canEditProduct" :to="localePath('/office/products/new')" class="erp-btn erp-btn--primary">
          + เพิ่มสินค้าใหม่
        </NuxtLink>
      </div>
    </div>

    <!-- =========================================================================
         LIVE SHOPEE `opwatchthailand` VS `www.opwatch.co.th` AUDIT & PULL BANNER
         ========================================================================= -->
    <div
      v-if="canEditProduct && auditSummary"
      class="erp-panel"
      :style="{
        marginBottom: '18px',
        border: auditSummary.isComplete ? '1.5px solid #22c793' : '1.5px solid #ee4d2d',
        background: auditSummary.isComplete
          ? 'linear-gradient(135deg, #f4fdf9 0%, #ffffff 100%)'
          : 'linear-gradient(135deg, #fff6f3 0%, #ffffff 100%)'
      }"
    >
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap">
        <div style="flex:1;min-width:290px">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px">
            <span
              style="font-size:11px;font-weight:700;letter-spacing:0.06em;padding:3px 10px;border-radius:999px"
              :style="auditSummary.isComplete ? 'background:#d1fae5;color:#065f46' : 'background:#ffedd5;color:#c2410c'"
            >
              {{ auditSummary.isComplete ? '✅ มาครบทุกไอเท็มแล้ว (SYNC COMPLETE)' : '⚠️ ตรวจสอบพบไอเท็มจาก Shopee ยังมาไม่ครบในเว็บไซต์' }}
            </span>
            <a
              href="https://shopee.co.th/opwatchthailand"
              target="_blank"
              rel="noopener"
              style="font-size:12px;color:#ee4d2d;font-weight:600;text-decoration:none"
            >
              shopee.co.th/opwatchthailand (Shop ID: 232486539) ↗
            </a>
          </div>

          <h2 style="margin:0 0 6px;font-size:17.5px;color:#23264d">
            <template v-if="!auditSummary.isComplete">
              พบรายการใน Shopee Official <strong>{{ auditSummary.totalItems }}</strong> ไอเท็ม — ซิงก์ครบแล้ว <strong>{{ auditSummary.alreadySyncedCount }}</strong> รุ่น ·
              <span style="color:#e11d48">ยังไม่มีในเว็บ {{ auditSummary.missingCount }} รุ่น</span>
              <template v-if="auditSummary.needsPromoSyncCount > 0">
                · <span style="color:#d97706">รอซิงก์ราคาโปร {{ auditSummary.needsPromoSyncCount }} รุ่น</span>
              </template>
            </template>
            <template v-else>
              ข้อมูลสินค้าและโปรโมชั่นจาก Shopee Official ทั้ง <strong>{{ auditSummary.totalItems }} / {{ auditSummary.totalItems }}</strong> ไอเท็ม อยู่ใน <code>www.opwatch.co.th</code> ครบถ้วนแล้ว!
            </template>
          </h2>

          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
            <span
              v-for="(bStat, bKey) in auditSummary.byBrand"
              :key="bKey"
              style="font-size:12px;background:#ffffff;border:1px solid #e5e7f3;border-radius:8px;padding:4px 10px;color:#334155"
            >
              <strong>{{ bStat.label }}:</strong>
              ซิงก์แล้ว {{ bStat.synced }}/{{ bStat.total }}
              <span v-if="bStat.missing > 0" style="color:#e11d48;font-weight:700"> (ขาด {{ bStat.missing }})</span>
              <span v-else-if="bStat.needsSync > 0" style="color:#d97706;font-weight:700"> (รอโปร {{ bStat.needsSync }})</span>
              <span v-else style="color:#059669;font-weight:700"> ✓ครบ</span>
            </span>
          </div>
        </div>

        <!-- Primary Pull-to-Website Buttons -->
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button
              v-if="!auditSummary.isComplete"
              type="button"
              class="erp-btn erp-btn--primary"
              style="background:#ee4d2d;border-color:#ee4d2d;font-weight:700;padding:10px 18px;box-shadow:0 8px 20px rgba(238,77,45,0.24)"
              :disabled="quickShopeeSaving"
              @click="initiateShopeePull('quick_missing')"
            >
              ⚡ ดึงไอเท็มที่ยังขาดเข้าเว็บไซต์ทันที ({{ auditSummary.pendingTotalCount }} รายการ)
            </button>
            <button
              v-else
              type="button"
              class="erp-btn erp-btn--violet"
              :disabled="quickShopeeSaving"
              @click="initiateShopeePull('re_sync_all')"
            >
              🔄 ซิงก์อัปเดตราคา &amp; โปรโมชั่นทั้งหมดซ้ำ ({{ auditSummary.totalItems }} รุ่น)
            </button>

            <button
              type="button"
              class="erp-btn erp-btn--ghost"
              :disabled="shopeeInspecting"
              @click="inspectShopeeBeforeImport(auditSummary.isComplete ? 'all' : 'missing')"
            >
              🔍 ดูตารางเทียบครบทั้ง {{ auditSummary.totalItems }} รุ่น / เลือกรายการเอง
            </button>
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:12px">
            <input
              ref="csvFileInput"
              type="file"
              accept=".csv,.tsv,.txt,.json"
              style="display:none"
              @change="handleCsvUpload"
            />
            <button type="button" class="erp-btn erp-btn--sm" @click="csvFileInput?.click()">
              📄 นำเข้าไฟล์ .CSV / JSON จาก Shopee Seller Center
            </button>
            <button type="button" class="erp-btn erp-btn--sm" @click="showBookmarkletHelp = !showBookmarkletHelp; quickShopeeOpen = true">
              🔖 ปุ่มดึงหน้า Shopee สดผ่านเบราว์เซอร์
            </button>
            <NuxtLink v-if="officeAuth.hasPermission('settings_manage')" to="/office/settings?tab=security" style="color:#6c5ce7;font-weight:600;text-decoration:none">
              🔐 ตั้งรหัสผ่านปุ่มดึงข้อมูล
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Shopee Pre-Import Inspection & Staging Panel -->
    <div v-if="quickShopeeOpen && canEditProduct" class="erp-panel" style="border:1.5px solid #ee4d2d;background:#fffdfb;margin-bottom:18px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:12px">
        <div>
          <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;color:#ee4d2d">
            SHOPEE OFFICIAL STAGING INSPECTOR · ตรวจสอบเทียบรายการก่อนดึงข้อมูลเข้า www.opwatch.co.th
          </div>
          <h2 style="margin:4px 0 0;font-size:18px;color:#23264d">
            🛍 ตารางตรวจสอบสินค้า ภาพ เนื้อหา และโปรโมชั่นเทียบกับ Shopee (Shop ID: 232486539)
          </h2>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button type="button" class="erp-btn erp-btn--sm" @click="showBookmarkletHelp = !showBookmarkletHelp">
            {{ showBookmarkletHelp ? 'ซ่อนวิธีใช้ Bookmarklet' : '🔖 วิธีดึงไอเท็มใหม่จากหน้า Shopee สด' }}
          </button>
          <button type="button" class="erp-btn erp-btn--sm" @click="showRawShopeePaste = !showRawShopeePaste">
            {{ showRawShopeePaste ? 'ซ่อนช่องวาง CSV/JSON' : '+ วางข้อมูล CSV / JSON / HTML' }}
          </button>
          <button type="button" class="erp-btn erp-btn--sm" @click="quickShopeeOpen = false">✕ ปิด</button>
        </div>
      </div>

      <!-- Browser Bookmarklet & Seller Center Helper Box -->
      <div
        v-if="showBookmarkletHelp"
        style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:12px 16px;margin-bottom:12px;font-size:12.5px;color:#23264d"
      >
        <div style="font-weight:700;color:#5b21b6;margin-bottom:4px">
          💡 วิธีดึงสินค้าใหม่ที่เพิ่งลงใน Shopee เพิ่มเติมในอนาคต (ข้ามระบบบล็อกบอท /verify/traffic ของ Shopee 100%)
        </div>
        <ol style="margin:6px 0 10px 18px;padding:0;line-height:1.65">
          <li><strong>วิธีที่ 1 (ไฟล์ Seller Center):</strong> เข้า Shopee Seller Center → สินค้าของฉัน → ดาวน์โหลดไฟล์ <code>.csv</code> แล้วกดปุ่ม <strong>"นำเข้าไฟล์ .CSV"</strong> ด้านบน</li>
          <li><strong>วิธีที่ 2 (ปุ่ม Bookmarklet 1 คลิก):</strong> ลากปุ่มสีส้มด้านล่างไปวางบนแถบบุ๊กมาร์กเบราว์เซอร์ → เปิดหน้า <code>shopee.co.th/opwatchthailand</code> ขณะล็อกอิน → กดปุ่มบุ๊กมาร์ก ระบบจะคัดลอกสินค้าทั้งหมดในหน้านั้นเป็น JSON ให้นำมาวางด้านล่างทันที!</li>
        </ol>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <a
            :href="shopeeAudit?.bookmarkletScript || '#'"
            style="display:inline-flex;align-items:center;gap:6px;background:#ee4d2d;color:#fff;padding:6px 14px;border-radius:8px;font-weight:700;text-decoration:none;font-size:12px"
            title="ลากปุ่มนี้ไปวางบนแถบ Bookmarks Bar ของเบราว์เซอร์"
            @click.prevent="copyBookmarklet"
          >
            🔖 ดึงหน้า Shopee เข้า OPWatch (ลากไปแถบ Bookmark หรือคลิกเพื่อคัดลอกโค้ด)
          </a>
          <NuxtLink to="/office/manual" class="erp-btn erp-btn--sm erp-btn--ghost">อ่านขั้นตอนละเอียดในคู่มือ →</NuxtLink>
        </div>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <input
          v-model="quickShopeeUrl"
          class="erp-input"
          style="flex:1;min-width:280px"
          placeholder="https://shopee.co.th/opwatchthailand หรือลิงก์สินค้ารายชิ้น"
        />
        <button
          type="button"
          class="erp-btn erp-btn--violet"
          :disabled="shopeeInspecting"
          @click="inspectShopeeBeforeImport('all')"
        >
          {{ shopeeInspecting ? 'กำลังตรวจสอบรายการ...' : '🔍 1. ตรวจสอบเทียบข้อมูลกับเว็บไซต์' }}
        </button>
      </div>

      <div v-if="showRawShopeePaste" style="margin-top:10px">
        <textarea
          v-model="quickShopeeRaw"
          class="erp-input"
          rows="4"
          style="width:100%;font-family:monospace;font-size:12px"
          placeholder="วางข้อมูล CSV จาก Shopee Seller Center, JSON จากปุ่ม Bookmarklet หรือข้อความรายละเอียดสินค้า แล้วกด '1. ตรวจสอบเทียบข้อมูลกับเว็บไซต์'..."
        />
      </div>

      <!-- Staging Checklist Result -->
      <div v-if="stagedReport" style="margin-top:16px;padding-top:16px;border-top:1px solid #f1e4de">
        <div style="background:#fff4f0;border:1px solid #fed7aa;border-radius:10px;padding:10px 14px;font-size:12.5px;color:#7c2d12;margin-bottom:14px">
          <strong>ร้านค้า:</strong> {{ stagedReport.shop?.shopName }} ·
          <span>{{ stagedReport.shop?.noteTh }}</span>
        </div>

        <!-- Filter Tabs & Scope Checkboxes -->
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px">
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button
              type="button"
              class="erp-btn erp-btn--sm"
              :class="stagedFilter === 'all' ? 'erp-btn--primary' : 'erp-btn--ghost'"
              @click="stagedFilter = 'all'"
            >
              ทั้งหมด ({{ stagedReport.summary?.totalItems || 0 }})
            </button>
            <button
              type="button"
              class="erp-btn erp-btn--sm"
              :class="stagedFilter === 'missing' ? 'erp-btn--primary' : 'erp-btn--ghost'"
              @click="stagedFilter = 'missing'"
            >
              ❌ ยังไม่มีในเว็บ ({{ stagedReport.summary?.missingCount || 0 }})
            </button>
            <button
              type="button"
              class="erp-btn erp-btn--sm"
              :class="stagedFilter === 'needs_sync' ? 'erp-btn--primary' : 'erp-btn--ghost'"
              @click="stagedFilter = 'needs_sync'"
            >
              ⚠️ รอซิงก์ราคาโปร ({{ stagedReport.summary?.needsPromoSyncCount || 0 }})
            </button>
            <button
              type="button"
              class="erp-btn erp-btn--sm"
              :class="stagedFilter === 'synced' ? 'erp-btn--primary' : 'erp-btn--ghost'"
              @click="stagedFilter = 'synced'"
            >
              ✅ มีครบในเว็บแล้ว ({{ stagedReport.summary?.alreadySyncedCount || 0 }})
            </button>
            <button
              v-if="(stagedReport.summary?.pendingTotalCount || 0) > 0"
              type="button"
              class="erp-btn erp-btn--sm erp-btn--violet"
              @click="selectOnlyMissingSkus"
            >
              ติ๊กเฉพาะรุ่นที่ยังขาด ({{ stagedReport.summary?.pendingTotalCount }})
            </button>
          </div>

          <div style="display:flex;gap:14px;flex-wrap:wrap;font-size:13px;font-weight:600;color:#23264d">
            <label style="display:inline-flex;align-items:center;gap:5px;cursor:pointer">
              <input v-model="optImportImages" type="checkbox" /> ดึงภาพสินค้า
            </label>
            <label style="display:inline-flex;align-items:center;gap:5px;cursor:pointer">
              <input v-model="optImportContent" type="checkbox" /> ดึงเนื้อหา &amp; สเปก
            </label>
            <label style="display:inline-flex;align-items:center;gap:5px;cursor:pointer">
              <input v-model="optImportPromotions" type="checkbox" /> ดึงโปรโมชั่น &amp; คูปอง
            </label>
          </div>
        </div>

        <!-- Staged Products Table -->
        <div class="erp-table-wrap" style="max-height:420px;overflow:auto;border:1px solid #e9ebf6;border-radius:12px;background:#ffffff">
          <table class="erp-table">
            <thead>
              <tr>
                <th style="width:36px">
                  <input
                    type="checkbox"
                    :checked="filteredStagedItems.length > 0 && filteredStagedItems.every((it: any) => selectedStagedSkus.includes(String(it.sku)))"
                    @change="(e: any) => toggleAllStagedSkus(e.target.checked)"
                  />
                </th>
                <th>ภาพ</th>
                <th>รหัส SKU / เนื้อหาสินค้าใน Shopee</th>
                <th>แบรนด์</th>
                <th>ราคา Shopee / ปกติ</th>
                <th>โปรโมชั่น / ของแถม</th>
                <th>สถานะเทียบ www.opwatch.co.th</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="st in filteredStagedItems" :key="st.sku">
                <td>
                  <input v-model="selectedStagedSkus" type="checkbox" :value="st.sku" />
                </td>
                <td>
                  <div style="position:relative;width:48px;height:48px">
                    <img
                      :src="(st.images && st.images[0]) || '/images/op/watch-990-083-blue.png'"
                      alt=""
                      style="width:48px;height:48px;object-fit:contain;border:1px solid #e9ebf6;border-radius:8px;background:#fff;padding:2px"
                      referrerpolicy="no-referrer"
                      @error="(e: any) => { if (e?.target) e.target.src = '/images/op/watch-990-083-blue.png' }"
                    />
                    <span style="position:absolute;bottom:-4px;right:-4px;background:#23264d;color:#fff;font-size:9.5px;padding:1px 5px;border-radius:99px">
                      {{ st.imageCount || st.images?.length || 1 }} ภาพ
                    </span>
                  </div>
                </td>
                <td>
                  <div style="display:flex;align-items:center;gap:6px">
                    <span style="font-family:monospace;font-size:11.5px;font-weight:700;color:#ee4d2d">{{ st.sku }}</span>
                    <span v-if="st.shopeeItemId" style="font-size:10.5px;color:#94a3b8">#{{ st.shopeeItemId }}</span>
                  </div>
                  <div style="font-weight:600;font-size:13px;color:#23264d">{{ st.nameTh }}</div>
                  <div style="font-size:11.5px;color:#64748b;max-width:380px">{{ st.shortDescription }}</div>
                </td>
                <td><span class="erp-chip">{{ st.brandSlug }}</span></td>
                <td>
                  <strong style="color:#ee4d2d">{{ fmt(st.price) }}</strong>
                  <div v-if="st.originalPrice > st.price" style="font-size:11px;color:#94a3b8;text-decoration:line-through">
                    {{ fmt(st.originalPrice) }} (-{{ st.discountPct }}%)
                  </div>
                </td>
                <td>
                  <span class="erp-chip erp-chip--rose" style="font-size:11px">{{ st.promoTag || 'ราคาพิเศษ Shopee' }}</span>
                  <div v-if="st.freebieText" style="font-size:11px;color:#0e9f6e;margin-top:3px">🎁 {{ st.freebieText }}</div>
                </td>
                <td>
                  <span v-if="st.syncStatus === 'missing'" class="erp-chip erp-chip--rose">
                    ❌ ยังไม่มีในเว็บ (พร้อมดึงเข้าใหม่)
                  </span>
                  <span v-else-if="st.syncStatus === 'needs_sync'" class="erp-chip" style="background:#fef3c7;color:#92400e">
                    ⚠️ มีรหัส {{ st.existingSku }} (เว็บ {{ fmt(st.existingPrice) }} → โปร {{ fmt(st.price) }})
                  </span>
                  <span v-else class="erp-chip erp-chip--mint">
                    ✅ ซิงก์ครบในเว็บแล้ว ({{ st.existingSku }})
                  </span>
                </td>
              </tr>
              <tr v-if="!filteredStagedItems.length">
                <td colspan="7" style="text-align:center;padding:24px;color:#64748b">
                  ไม่มีรายการในหมวดตัวกรองนี้
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Staged Promotions List -->
        <div v-if="optImportPromotions && stagedReport.promotions?.length" style="margin-top:14px">
          <div style="font-size:12.5px;font-weight:700;color:#23264d;margin-bottom:8px">
            🎁 รายการแคมเปญโปรโมชั่นจาก Shopee ที่จะซิงก์เข้าหน้า /promotions และหน้าแรก:
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px">
            <label
              v-for="pr in stagedReport.promotions"
              :key="pr.slug"
              style="display:flex;gap:10px;align-items:flex-start;padding:10px 12px;background:#ffffff;border:1px solid #e9ebf6;border-radius:10px;cursor:pointer"
            >
              <input v-model="selectedStagedPromos" type="checkbox" :value="pr.slug" style="margin-top:3px" />
              <div style="font-size:12px">
                <div style="font-weight:700;color:#23264d">{{ pr.titleTh }}</div>
                <div style="color:#64748b;margin-top:2px">{{ pr.discountLabel }} · โค้ด <code>{{ pr.couponCode }}</code> · เชื่อม {{ pr.skus?.length || 0 }} รุ่น</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Final Confirm Action -->
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:16px">
          <span style="font-size:12px;color:#64748b">
            🔐 {{ requireSyncPw ? 'ระบบเปิดใช้การยืนยันรหัสผ่านก่อนบันทึกข้อมูลลงเว็บไซต์' : 'โหมดบันทึกทันทีโดยไม่ถามรหัสผ่านซ้ำ' }}
          </span>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button type="button" class="erp-btn" @click="quickShopeeOpen = false">ย่อตารางตรวจสอบ</button>
            <button
              type="button"
              class="erp-btn erp-btn--primary"
              style="background:#ee4d2d;border-color:#ee4d2d"
              :disabled="quickShopeeSaving"
              @click="initiateShopeePull('selected')"
            >
              {{ quickShopeeSaving ? 'กำลังดึงข้อมูลเข้าเว็บไซต์...' : `✅ 2. ยืนยันดึงรายการที่ติ๊กเลือกเข้าเว็บ (${selectedStagedSkus.length} สินค้า + ${optImportPromotions ? selectedStagedPromos.length : 0} โปรโมชั่น)` }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Search & Brand Filter -->
    <div class="erp-panel">
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">
        <input
          v-model="search"
          class="erp-input"
          style="flex:1;min-width:240px"
          placeholder="ค้นหาชื่อรุ่น รหัส SKU หรือคำสำคัญ..."
        />
        <select v-model="brandFilter" class="erp-select" style="width:210px">
          <option value="">ทุกแบรนด์ (Olym Pianus / Olympia Star / Ogival)</option>
          <option value="olympianus">Olym Pianus</option>
          <option value="olympia-star">Olympia Star</option>
          <option value="ogival">Ogival</option>
        </select>
        <button type="button" class="erp-btn" @click="page = 1; refresh()">ค้นหา</button>
      </div>

      <div class="erp-table-wrap">
        <table class="erp-table">
          <thead>
            <tr>
              <th>รูป</th>
              <th>รหัส SKU / ชื่อรุ่น</th>
              <th>แบรนด์</th>
              <th>{{ isDealer ? 'ราคาเฉพาะตัวแทน' : 'ราคาขาย' }}</th>
              <th>{{ isDealer ? 'คลังร้านตัวเอง' : 'สต็อก 5 ช่องทาง' }}</th>
              <th>SEO/ASEO</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in items" :key="p.id">
              <td>
                <img
                  :src="(p.images && p.images[0]) || p.image || '/images/op/watch-990-083-blue.png'"
                  alt=""
                  style="width:46px;height:46px;object-fit:contain;background:#fff;border-radius:7px;padding:3px"
                  referrerpolicy="no-referrer"
                  @error="(e: any) => { if (e?.target) e.target.src = '/images/op/watch-990-083-blue.png' }"
                />
              </td>
              <td>
                <div style="display:flex;align-items:center;gap:6px">
                  <span style="font-family:monospace;font-size:11.5px;color:#6c5ce7">{{ p.sku }}</span>
                  <span v-if="p.shopeeItemId" style="font-size:10px;background:#fff1ee;color:#ee4d2d;padding:1px 6px;border-radius:999px;font-weight:600">
                    Shopee ✓
                  </span>
                </div>
                <div style="font-weight:600">{{ p.nameTh || p.nameEn }}</div>
              </td>
              <td><span class="erp-chip">{{ p.brandSlug }}</span></td>
              <td>
                <template v-if="isDealer">
                  <strong style="color:#6c5ce7">{{ fmt(p.effectiveDealerPrice || p.dealerPrice) }}</strong>
                  <div style="font-size:11px;color:#94a3b8">ป้าย: {{ fmt(p.price) }}</div>
                </template>
                <template v-else>
                  <strong>{{ fmt(p.price) }}</strong>
                  <div v-if="p.originalPrice > p.price" style="font-size:11px;color:#94a3b8;text-decoration:line-through">
                    {{ fmt(p.originalPrice) }}
                  </div>
                  <div v-if="p.dealerPrice" style="font-size:11px;color:#6c5ce7">
                    ตัวแทน: {{ fmt(p.dealerPrice) }}
                  </div>
                </template>
              </td>
              <td>
                <template v-if="isDealer">
                  <span style="font-weight:700;color:#0e9f6e">{{ p.dealerOwnStock || 0 }} เรือน</span>
                </template>
                <template v-else>
                  <span :style="{ color: Number(p.stock) <= 3 ? '#e11d48' : '#0e9f6e', fontWeight: 700 }">
                    รวม {{ p.stock }}
                  </span>
                  <div style="font-size:10.5px;color:#8a8fb1">
                    W:{{ p.stockWeb ?? '-' }} · S:{{ p.stockShopee ?? '-' }} · L:{{ p.stockLazada ?? '-' }} · T:{{ p.stockTiktok ?? '-' }} · D:{{ p.stockDealer ?? '-' }}
                  </div>
                </template>
              </td>
              <td>
                <span class="erp-chip" :class="p.seoTitle || p.aseoSummary ? 'erp-chip--violet' : ''">
                  {{ p.seoTitle || p.aseoSummary ? '✓ SEO/ASEO' : 'Auto' }}
                </span>
              </td>
              <td>
                <span class="erp-chip" :class="p.active !== false ? 'erp-chip--mint' : 'erp-chip--rose'">
                  {{ p.active !== false ? 'เปิดขาย' : 'ซ่อน' }}
                </span>
              </td>
              <td>
                <div style="display:flex;gap:6px">
                  <NuxtLink v-if="canEditProduct" :to="localePath(`/office/products/${p.id}`)" class="erp-btn erp-btn--sm">แก้ไข / AI</NuxtLink>
                  <NuxtLink v-else to="/office/warehouse" class="erp-btn erp-btn--sm">สต็อก</NuxtLink>
                  <NuxtLink :to="localePath(`/products/${p.slug}`)" target="_blank" class="erp-btn erp-btn--sm">ดูหน้าเว็บ</NuxtLink>
                  <button v-if="canEditProduct" type="button" class="erp-btn erp-btn--sm erp-btn--danger" @click="removeProduct(p)">ลบ</button>
                </div>
              </td>
            </tr>
            <tr v-if="!pending && !items.length">
              <td colspan="8" style="text-align:center;padding:28px;color:#64748b">ไม่พบรายการสินค้าตามเงื่อนไข</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px">
        <span style="font-size:12.5px;color:#94a3b8">หน้า {{ page }} · ทั้งหมด {{ total }} รายการ</span>
        <div style="display:flex;gap:6px">
          <button type="button" class="erp-btn erp-btn--sm" :disabled="page <= 1" @click="page--">◀ ก่อนหน้า</button>
          <button type="button" class="erp-btn erp-btn--sm" :disabled="page * 25 >= total" @click="page++">ถัดไป ▶</button>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         SHOPEE SYNC PASSWORD CONFIRMATION MODAL
         ========================================================================= -->
    <div
      v-if="syncPwModalOpen"
      style="position:fixed;inset:0;z-index:1200;background:rgba(20,22,52,0.52);display:grid;place-items:center;padding:20px"
      @click.self="syncPwModalOpen = false"
    >
      <div style="width:100%;max-width:460px;background:#ffffff;border-radius:18px;border:1px solid #e9ebf6;padding:24px;box-shadow:0 24px 60px rgba(25,22,70,0.22)">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;color:#ee4d2d;margin-bottom:4px">
          SHOPEE CATALOG SYNC AUTHORIZATION
        </div>
        <h3 style="margin:0 0 8px;font-size:19px;color:#23264d">
          🔐 ยืนยันรหัสผ่านก่อนดึงข้อมูลเข้าเว็บไซต์
        </h3>
        <p style="margin:0 0 14px;font-size:13px;color:#64748b;line-height:1.55">
          กรุณากรอก <strong>รหัสผ่านซิงก์ข้อมูล Shopee</strong> (ค่าเริ่มต้น <code>Shopee@2324</code>) หรือ <strong>รหัสผ่านบัญชีเจ้าหน้าที่ของคุณ</strong> เพื่อยืนยันการบันทึกสินค้า รูปภาพ และโปรโมชั่นลงใน <code>www.opwatch.co.th</code>
        </p>

        <div v-if="syncPwError" style="background:#fff1f2;border:1px solid #fecdd3;color:#be123c;padding:9px 12px;border-radius:10px;font-size:12.5px;margin-bottom:12px">
          {{ syncPwError }}
        </div>

        <form @submit.prevent="executeShopeeCommit">
          <label class="erp-label">รหัสผ่านยืนยันการดึงข้อมูล (Sync Password)</label>
          <input
            v-model="syncPasswordInput"
            type="password"
            class="erp-input"
            placeholder="กรอกรหัสผ่าน เช่น Shopee@2324"
            autofocus
            required
          />
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;gap:8px">
            <NuxtLink
              v-if="officeAuth.hasPermission('settings_manage')"
              to="/office/settings?tab=security"
              style="font-size:12px;color:#6c5ce7;text-decoration:none"
              @click="syncPwModalOpen = false"
            >
              เปลี่ยนรหัสผ่านซิงก์ →
            </NuxtLink>
            <span v-else />
            <div style="display:flex;gap:8px">
              <button type="button" class="erp-btn" @click="syncPwModalOpen = false">ยกเลิก</button>
              <button
                type="submit"
                class="erp-btn erp-btn--primary"
                style="background:#ee4d2d;border-color:#ee4d2d"
                :disabled="quickShopeeSaving"
              >
                {{ quickShopeeSaving ? 'กำลังดึงข้อมูล...' : '⚡ ยืนยันดึงข้อมูลเข้าเว็บไซต์' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
