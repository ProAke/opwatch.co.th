<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const localePath = useLocalePath()
const officeAuth = useOfficeAuth()
const { site } = useSite()
const toast = useToast()

const isDealer = computed(() => officeAuth.role.value === 'dealer')
const canEditProduct = computed(() => officeAuth.hasPermission('products_edit'))

const search = ref('')
const brandFilter = ref('')
const page = ref(1)

const { data, refresh, pending } = await useFetch<any>('/api/admin/products', {
  query: computed(() => ({
    q: search.value || undefined,
    brand: brandFilter.value || undefined,
    page: page.value,
    limit: 25
  }))
})

const items = computed(() => data.value?.items || data.value?.products || [])
const total = computed(() => Number(data.value?.total || items.value.length))

// Shopee Pre-Import Inspection & Staging Studio (`ตรวจสอบแล้วทำรายการก่อนดึงข้อมูล ภาพเนื้อหา พร้อมโปรโมชั่น`)
const quickShopeeOpen = ref(false)
const quickShopeeUrl = ref('https://shopee.co.th/shop/232486539/recommendation-landing?pageNumber=1&upstream=pdp')
const quickShopeeRaw = ref('')
const showRawShopeePaste = ref(false)
const shopeeInspecting = ref(false)
const quickShopeeSaving = ref(false)

const stagedReport = ref<any>(null)
const selectedStagedSkus = ref<string[]>([])
const selectedStagedPromos = ref<string[]>([])
const optImportImages = ref(true)
const optImportContent = ref(true)
const optImportPromotions = ref(true)

async function inspectShopeeBeforeImport() {
  if (!quickShopeeUrl.value.trim() && !quickShopeeRaw.value.trim()) return
  shopeeInspecting.value = true
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
    selectedStagedSkus.value = (res.items || []).map((it: any) => String(it.sku))
    selectedStagedPromos.value = (res.promotions || []).map((pr: any) => String(pr.slug))
    toast.success(`ตรวจสอบสำเร็จ: พบสินค้า ${res.items?.length || 0} รายการ และโปรโมชั่น ${res.promotions?.length || 0} แคมเปญ`)
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'ไม่สามารถตรวจสอบข้อมูล Shopee ได้')
  } finally {
    shopeeInspecting.value = false
  }
}

function toggleAllStagedSkus(checked: boolean) {
  if (!stagedReport.value?.items) return
  selectedStagedSkus.value = checked ? stagedReport.value.items.map((it: any) => String(it.sku)) : []
}

async function commitSelectedShopeeImport() {
  if (!selectedStagedSkus.value.length && !(optImportPromotions.value && selectedStagedPromos.value.length)) {
    toast.error('กรุณาเลือกรายการสินค้าหรือโปรโมชั่นอย่างน้อย 1 รายการ')
    return
  }
  quickShopeeSaving.value = true
  try {
    const res = await $fetch<any>('/api/admin/products/shopee-import', {
      method: 'POST',
      body: {
        url: quickShopeeUrl.value.trim(),
        rawPayload: quickShopeeRaw.value.trim() || undefined,
        commit: true,
        selectedSkus: selectedStagedSkus.value,
        selectedPromotionSlugs: selectedStagedPromos.value,
        importImages: optImportImages.value,
        importContent: optImportContent.value,
        importPromotions: optImportPromotions.value
      }
    })
    toast.success(`ดึงข้อมูลสำเร็จ: สินค้า ${res.count || 0} รุ่น · โปรโมชั่น ${res.promotionsCount || 0} แคมเปญ · คูปอง ${res.couponsCount || 0} รายการ!`)
    stagedReport.value = null
    quickShopeeOpen.value = false
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'บันทึกข้อมูลจาก Shopee ไม่สำเร็จ')
  } finally {
    quickShopeeSaving.value = false
  }
}

async function removeProduct(p: any) {
  if (!import.meta.client || !window.confirm(`ยืนยันการลบสินค้า "${p.nameTh || p.sku}"?`)) return
  try {
    await $fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' })
    toast.success('ลบสินค้าเรียบร้อย')
    await refresh()
  } catch {
    toast.error('ลบสินค้าไม่สำเร็จ')
  }
}

const fmt = (v: number) => formatPrice(Number(v || 0), site.value.currencySymbol || '฿', 'th-TH')

useHead({ title: 'จัดการสินค้า 405+ รุ่น & ดึง Shopee — OPWatch Office' })
</script>

<template>
  <div>
    <div class="erp-page-head">
      <div>
        <div class="erp-kicker">{{ isDealer ? 'AUTHORIZED DEALER WHOLESALE CATALOG' : 'MODULE 7.2 · CATALOGUE & 5-CHANNEL STOCK' }}</div>
        <h1 class="erp-h1">{{ isDealer ? `แคตตาล็อกราคาเฉพาะตัวแทนจำหน่าย (${total} รุ่น)` : `ระบบจัดการสินค้า (ทั้งหมด ${total} รุ่น)` }}</h1>
        <p class="erp-sub">
          <template v-if="isDealer">
            แสดงราคาส่งเฉพาะตัวแทนจำหน่าย เทียบราคาขายปลีก พร้อมสถานะคลังสินค้าหน้าร้านของตัวแทนเอง
          </template>
          <template v-else>
            ดึงสินค้าจาก Shopee, จัดการราคาขายปลีก, สต็อก 5 ช่องทาง, ปรับภาพสตูดิโออัตโนมัติ และ AI SEO + ASEO
          </template>
        </p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <NuxtLink to="/office/warehouse" class="erp-btn erp-btn--ghost">
          📦 {{ isDealer ? 'คลังสินค้าตัวแทนเอง' : 'คลังสินค้า 5 ช่องทาง' }} →
        </NuxtLink>
        <button
          v-if="canEditProduct"
          type="button"
          class="erp-btn erp-btn--violet"
          @click="quickShopeeOpen = !quickShopeeOpen; if (quickShopeeOpen && !stagedReport) inspectShopeeBeforeImport()"
        >
          🛍 ตรวจสอบ &amp; ดึงข้อมูล Shopee (Shop 232486539)
        </button>
        <NuxtLink v-if="canEditProduct" :to="localePath('/office/products/new')" class="erp-btn erp-btn--primary">
          + เพิ่มสินค้าใหม่
        </NuxtLink>
      </div>
    </div>

    <!-- Shopee Pre-Import Inspection & Staging Panel -->
    <div v-if="quickShopeeOpen" class="erp-panel" style="border:1.5px solid #ee4d2d;background:#fffdfb;margin-bottom:18px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:12px">
        <div>
          <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;color:#ee4d2d">
            SHOPEE OFFICIAL STAGING INSPECTOR · ตรวจสอบแล้วทำรายการก่อนดึงข้อมูล
          </div>
          <h2 style="margin:4px 0 0;font-size:18px;color:#23264d">
            🛍 ตรวจสอบรายการสินค้า ภาพ เนื้อหา และโปรโมชั่นจาก Shopee (Shop ID: 232486539)
          </h2>
        </div>
        <button type="button" class="erp-btn erp-btn--sm" @click="showRawShopeePaste = !showRawShopeePaste">
          {{ showRawShopeePaste ? 'ซ่อนช่องวาง JSON/HTML' : '+ วาง JSON / HTML จาก Shopee เพิ่มเติม' }}
        </button>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <input
          v-model="quickShopeeUrl"
          class="erp-input"
          style="flex:1;min-width:280px"
          placeholder="https://shopee.co.th/shop/232486539/recommendation-landing?pageNumber=1&upstream=pdp"
        />
        <button
          type="button"
          class="erp-btn erp-btn--violet"
          :disabled="shopeeInspecting"
          @click="inspectShopeeBeforeImport"
        >
          {{ shopeeInspecting ? 'กำลังตรวจสอบรายการ...' : '🔍 1. ตรวจสอบ & ทำรายการก่อนดึงข้อมูล' }}
        </button>
      </div>

      <div v-if="showRawShopeePaste" style="margin-top:10px">
        <textarea
          v-model="quickShopeeRaw"
          class="erp-input"
          rows="4"
          style="width:100%;font-family:monospace;font-size:12px"
          placeholder="วาง JSON จาก Network API ของ Shopee (เช่น recommendation_v2 / search_items) หรือข้อความรายละเอียดสินค้าเพื่อแปลงเป็นรายการอัตโนมัติ..."
        />
      </div>

      <!-- Staging Checklist Result -->
      <div v-if="stagedReport" style="margin-top:16px;padding-top:16px;border-top:1px solid #f1e4de">
        <div style="background:#fff4f0;border:1px solid #fed7aa;border-radius:10px;padding:10px 14px;font-size:12.5px;color:#7c2d12;margin-bottom:14px">
          <strong>ร้านค้า:</strong> {{ stagedReport.shop?.shopName }} ·
          <span>{{ stagedReport.shop?.noteTh }}</span>
        </div>

        <!-- Summary Chips & Import Scope Checkboxes -->
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px">
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <span class="erp-chip erp-chip--violet">สินค้าทั้งหมด {{ stagedReport.summary?.totalItems }} รุ่น</span>
            <span class="erp-chip erp-chip--mint">+ รุ่นใหม่ยังไม่มีในเว็บ {{ stagedReport.summary?.newItemsCount }} รุ่น</span>
            <span class="erp-chip">↻ มีในเว็บแล้ว (ซิงก์ราคา/โปร) {{ stagedReport.summary?.existingUpdateCount }} รุ่น</span>
            <span class="erp-chip erp-chip--rose">🎁 โปรโมชั่น {{ stagedReport.summary?.totalPromotions }} แคมเปญ + {{ stagedReport.summary?.totalCoupons }} คูปอง</span>
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
        <div class="erp-table-wrap" style="max-height:380px;overflow:auto;border:1px solid #e9ebf6;border-radius:12px;background:#ffffff">
          <table class="erp-table">
            <thead>
              <tr>
                <th style="width:36px">
                  <input
                    type="checkbox"
                    :checked="selectedStagedSkus.length === (stagedReport.items?.length || 0)"
                    @change="(e: any) => toggleAllStagedSkus(e.target.checked)"
                  />
                </th>
                <th>ภาพ</th>
                <th>รหัส SKU / เนื้อหาสินค้า</th>
                <th>แบรนด์</th>
                <th>ราคา Shopee / ปกติ</th>
                <th>โปรโมชั่น / ของแถม</th>
                <th>สถานะเทียบเว็บ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="st in stagedReport.items" :key="st.sku">
                <td>
                  <input v-model="selectedStagedSkus" type="checkbox" :value="st.sku" />
                </td>
                <td>
                  <div style="position:relative;width:48px;height:48px">
                    <img
                      :src="(st.images && st.images[0]) || '/images/op/watch-990-083-blue.png'"
                      alt=""
                      style="width:48px;height:48px;object-fit:contain;border:1px solid #e9ebf6;border-radius:8px;background:#fff;padding:2px"
                    />
                    <span style="position:absolute;bottom:-4px;right:-4px;background:#23264d;color:#fff;font-size:9.5px;padding:1px 5px;border-radius:99px">
                      {{ st.imageCount || st.images?.length || 1 }} ภาพ
                    </span>
                  </div>
                </td>
                <td>
                  <div style="font-family:monospace;font-size:11.5px;font-weight:700;color:#ee4d2d">{{ st.sku }}</div>
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
                  <span v-if="st.action === 'create'" class="erp-chip erp-chip--mint">+ รุ่นใหม่ (เพิ่มเข้าเว็บ)</span>
                  <span v-else class="erp-chip erp-chip--violet">↻ มีแล้ว ({{ st.existingSku }} · ซิงก์ข้อมูล)</span>
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
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px">
          <button type="button" class="erp-btn" @click="stagedReport = null; quickShopeeOpen = false">ปิดหน้าต่างตรวจสอบ</button>
          <button
            type="button"
            class="erp-btn erp-btn--primary"
            style="background:#ee4d2d;border-color:#ee4d2d"
            :disabled="quickShopeeSaving"
            @click="commitSelectedShopeeImport"
          >
            {{ quickShopeeSaving ? 'กำลังดึงข้อมูลเข้าเว็บไซต์...' : `✅ 2. ยืนยันดึงข้อมูลที่เลือก (${selectedStagedSkus.length} สินค้า + ${optImportPromotions ? selectedStagedPromos.length : 0} โปรโมชั่น)` }}
          </button>
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
                <div style="font-family:monospace;font-size:11.5px;color:#6c5ce7">{{ p.sku }}</div>
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
  </div>
</template>
