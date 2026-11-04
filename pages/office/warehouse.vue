<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const officeAuth = useOfficeAuth()
const toast = useToast()

const isDealer = computed(() => officeAuth.role.value === 'dealer')
const activeTab = ref<'matrix' | 'dealer_stock' | 'pickup' | 'promos'>('matrix')

const search = ref('')
const brandFilter = ref('')
const lowOnly = ref(false)
const selectedDealerCode = ref('DLR-BKK-01')
const page = ref(1)
const pageSize = 30

const { data, refresh, pending } = await useFetch<any>('/api/admin/warehouse', {
  query: computed(() => ({
    q: search.value || undefined,
    brand: brandFilter.value || undefined,
    low: lowOnly.value ? '1' : undefined,
    dealerCode: !isDealer.value ? selectedDealerCode.value : undefined
  }))
})

const items = computed(() => data.value?.items || [])
const totals = computed(() => data.value?.totals || {})
const dealerProfile = computed(() => data.value?.dealerProfile || null)
const pickupOrders = computed(() => data.value?.pickupOrders || [])
const promotions = computed(() => data.value?.promotions || [])
const dealers = computed(() => data.value?.dealers || [])

watch([search, brandFilter, lowOnly], () => {
  page.value = 1
})

const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / pageSize)))
const pagedItems = computed(() => {
  const start = (page.value - 1) * pageSize
  return items.value.slice(start, start + pageSize)
})

// Track dirty edits on 5-channel matrix
const dirtyMap = reactive<Record<number, {
  stockWeb: number
  stockShopee: number
  stockLazada: number
  stockTiktok: number
  stockDealer: number
}>>({})

function getChVal(row: any, key: 'stockWeb' | 'stockShopee' | 'stockLazada' | 'stockTiktok' | 'stockDealer') {
  if (dirtyMap[row.id]) return dirtyMap[row.id][key]
  return Number(row[key] ?? 0)
}

function setChVal(row: any, key: 'stockWeb' | 'stockShopee' | 'stockLazada' | 'stockTiktok' | 'stockDealer', raw: any) {
  if (!dirtyMap[row.id]) {
    dirtyMap[row.id] = {
      stockWeb: Number(row.stockWeb ?? 0),
      stockShopee: Number(row.stockShopee ?? 0),
      stockLazada: Number(row.stockLazada ?? 0),
      stockTiktok: Number(row.stockTiktok ?? 0),
      stockDealer: Number(row.stockDealer ?? 0)
    }
  }
  dirtyMap[row.id][key] = Math.max(0, Math.floor(Number(raw || 0)))
}

function rowTotal5(row: any) {
  const d = dirtyMap[row.id]
  if (!d) return Number(row.stock ?? 0)
  return d.stockWeb + d.stockShopee + d.stockLazada + d.stockTiktok + d.stockDealer
}

const dirtyIds = computed(() => Object.keys(dirtyMap).map(Number))
const savingBatch = ref(false)

async function saveSingleRow(row: any) {
  const payload = dirtyMap[row.id] || {
    stockWeb: row.stockWeb,
    stockShopee: row.stockShopee,
    stockLazada: row.stockLazada,
    stockTiktok: row.stockTiktok,
    stockDealer: row.stockDealer
  }
  try {
    await $fetch('/api/admin/warehouse/stock', {
      method: 'PUT',
      body: { productId: row.id, ...payload }
    })
    delete dirtyMap[row.id]
    toast.success(`บันทึกสต็อก 5 ช่องทาง ${row.sku} เรียบร้อย`)
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'บันทึกสต็อกไม่สำเร็จ')
  }
}

async function saveAllDirty() {
  if (!dirtyIds.value.length) return
  savingBatch.value = true
  try {
    const batch = dirtyIds.value.map((id) => ({
      productId: id,
      ...dirtyMap[id]
    }))
    await $fetch('/api/admin/warehouse/stock', {
      method: 'PUT',
      body: { items: batch }
    })
    for (const id of dirtyIds.value) delete dirtyMap[id]
    toast.success(`บันทึกสต็อก ${batch.length} รายการครบทั้ง 5 ช่องทางเรียบร้อย`)
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'บันทึกสต็อกไม่สำเร็จ')
  } finally {
    savingBatch.value = false
  }
}

// Channel-to-channel transfer modal
const transferOpen = ref(false)
const transferSaving = ref(false)
const transferForm = reactive({
  productId: 0,
  sku: '',
  name: '',
  fromChannel: 'stockWeb',
  toChannel: 'stockShopee',
  qty: 2
})

const channelOptions = [
  { key: 'stockWeb', label: '🌐 Opwatch Web (เว็บไซต์หลัก)' },
  { key: 'stockShopee', label: '🛍 Shopee Mall' },
  { key: 'stockLazada', label: '💙 Lazada LazMall' },
  { key: 'stockTiktok', label: '🎵 TikTok Shop' },
  { key: 'stockDealer', label: '🏪 ตัวแทนจำหน่าย (Dealers)' }
]

function openTransfer(row: any) {
  Object.assign(transferForm, {
    productId: row.id,
    sku: row.sku,
    name: row.name,
    fromChannel: 'stockWeb',
    toChannel: 'stockShopee',
    qty: 1
  })
  transferOpen.value = true
}

async function submitTransfer() {
  transferSaving.value = true
  try {
    await $fetch('/api/admin/warehouse/stock', {
      method: 'PUT',
      body: {
        action: 'transfer',
        productId: transferForm.productId,
        fromChannel: transferForm.fromChannel,
        toChannel: transferForm.toChannel,
        qty: transferForm.qty
      }
    })
    toast.success(`โอนย้ายสต็อก ${transferForm.sku} จำนวน ${transferForm.qty} เรือนเรียบร้อย`)
    transferOpen.value = false
    delete dirtyMap[transferForm.productId]
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'โอนย้ายสต็อกไม่สำเร็จ')
  } finally {
    transferSaving.value = false
  }
}

// Dealer Own Stock inline editor (`คลังสินค้าตัวแทนเอง`)
const dealerEdits = reactive<Record<number, { onHand: number; reserved: number; reorderPoint: number; notes: string }>>({})

function getDealerEdit(row: any) {
  if (!dealerEdits[row.id]) {
    dealerEdits[row.id] = {
      onHand: Number(row.dealerOnHand ?? 0),
      reserved: Number(row.dealerReserved ?? 0),
      reorderPoint: Number(row.dealerReorderPoint ?? 2),
      notes: String(row.dealerNotes || '')
    }
  }
  return dealerEdits[row.id]
}

async function saveDealerStock(row: any) {
  const ed = getDealerEdit(row)
  try {
    await $fetch('/api/admin/dealer/stock', {
      method: 'POST',
      body: {
        productId: row.id,
        dealerCode: isDealer.value ? undefined : selectedDealerCode.value,
        onHand: ed.onHand,
        reserved: ed.reserved,
        reorderPoint: ed.reorderPoint,
        notes: ed.notes
      }
    })
    toast.success(`บันทึกคลังตัวแทนรุ่น ${row.sku} เรียบร้อย`)
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'บันทึกคลังตัวแทนไม่สำเร็จ')
  }
}

async function markPickupDelivered(order: any) {
  try {
    await $fetch(`/api/admin/orders/${order.id}`, {
      method: 'PUT',
      body: { status: 'delivered' }
    })
    toast.success(`ยืนยันส่งมอบหน้าร้านคำสั่งซื้อ ${order.orderNo} เรียบร้อย`)
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'อัปเดตสถานะไม่สำเร็จ')
  }
}

function exportWarehouseCsv() {
  if (!import.meta.client) return
  const headers = isDealer.value
    ? ['SKU', 'Name', 'Brand', 'Retail_Price_THB', 'Dealer_Price_THB', 'Margin_THB', 'My_Shop_OnHand', 'Reserved', 'Notes']
    : ['SKU', 'Name', 'Brand', 'Retail_Price_THB', 'Opwatch_Web', 'Shopee', 'Lazada', 'TikTok_Shop', 'Dealers', 'Total_Stock']

  const rows = items.value.map((r: any) =>
    isDealer.value
      ? [r.sku, `"${String(r.name || '').replace(/"/g, '""')}"`, r.brandSlug, r.price, r.dealerPrice, r.marginAmount, r.dealerOnHand, r.dealerReserved, `"${String(r.dealerNotes || '').replace(/"/g, '""')}"`]
      : [r.sku, `"${String(r.name || '').replace(/"/g, '""')}"`, r.brandSlug, r.price, r.stockWeb, r.stockShopee, r.stockLazada, r.stockTiktok, r.stockDealer, r.stock]
  )
  const blob = new Blob(['\uFEFF' + [headers, ...rows].map((x) => x.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = isDealer.value ? `dealer-stock-${new Date().toISOString().slice(0, 10)}.csv` : `opwatch-5channel-warehouse-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

useHead({
  title: computed(() =>
    isDealer.value
      ? 'พอร์ทัลและคลังสินค้าตัวแทนจำหน่าย — OPWatch ERP'
      : 'ระบบคลังสินค้า 5 ช่องทาง (Web · Shopee · Lazada · TikTok · ตัวแทน) — OPWatch ERP'
  )
})
</script>

<template>
  <div>
    <!-- ==================== AUTHORIZED DEALER HEADER ==================== -->
    <template v-if="isDealer">
      <div class="erp-page-head">
        <div>
          <div class="erp-kicker">AUTHORIZED DEALER PORTAL · พอร์ทัลตัวแทนจำหน่ายทางการ</div>
          <h1 class="erp-h1">{{ dealerProfile?.dealerName || officeAuth.officer.value?.name }}</h1>
          <p class="erp-sub">
            รหัสตัวแทน: <strong>{{ dealerProfile?.dealerCode }}</strong> · ระดับ <strong>{{ dealerProfile?.dealerTier }}</strong> ·
            ส่วนลดราคาส่งตัวแทน <strong>{{ dealerProfile?.discountPct }}%</strong> · ตรวจสอบราคาตัวแทน จัดการคลังร้านตนเอง ดูโปรโมชั่น และการรับสินค้าหน้าร้าน
          </p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button type="button" class="erp-btn erp-btn--ghost" @click="exportWarehouseCsv">
            ⬇ Export ราคา &amp; สต็อกตัวแทน
          </button>
          <NuxtLink to="/office/warranty" class="erp-btn erp-btn--primary">
            🛠 แจ้งซ่อม / ลงทะเบียนประกันให้ลูกค้า →
          </NuxtLink>
        </div>
      </div>

      <div class="wh-kpi-grid wh-kpi-grid--4">
        <div class="wh-kpi" style="--kc:#6c5ce7">
          <span>รุ่นนาฬิกาในแคตตาล็อกตัวแทน</span>
          <strong>{{ totals.skus || 0 }} รุ่น</strong>
          <small>แสดงราคาเฉพาะตัวแทนจำหน่ายทุกเรือน</small>
        </div>
        <div class="wh-kpi" style="--kc:#22c793">
          <span>คลังสินค้าตัวแทนเอง (หน้าร้าน)</span>
          <strong>{{ totals.dealerOwnUnits || 0 }} เรือน</strong>
          <small>{{ totals.dealerOwnSkus || 0 }} รุ่นที่มีในตู้โชว์ร้านของคุณ</small>
        </div>
        <div class="wh-kpi" style="--kc:#ffb020">
          <span>รายการรับสินค้าหน้าร้าน (Click &amp; Collect)</span>
          <strong>{{ pickupOrders.length }} รายการ</strong>
          <small>คำสั่งซื้อที่ลูกค้านัดรับผ่านสาขา/ตัวแทน</small>
        </div>
        <div class="wh-kpi" style="--kc:#ff6b9d">
          <span>โปรโมชั่นที่ร่วมรายการ</span>
          <strong>{{ promotions.length }} แคมเปญ</strong>
          <small>สิทธิพิเศษส่งเสริมการขายประจำเดือน</small>
        </div>
      </div>

      <!-- Dealer Tabs -->
      <div class="wh-tabs">
        <button type="button" :class="{ active: activeTab === 'matrix' }" @click="activeTab = 'matrix'">
          💎 ราคาเฉพาะตัวแทน &amp; คลังสินค้าตัวแทนเอง
        </button>
        <button type="button" :class="{ active: activeTab === 'pickup' }" @click="activeTab = 'pickup'">
          🏬 การรับสินค้าหน้าร้าน ({{ pickupOrders.length }})
        </button>
        <button type="button" :class="{ active: activeTab === 'promos' }" @click="activeTab = 'promos'">
          🎁 โปรโมชั่นตัวแทน ({{ promotions.length }})
        </button>
      </div>
    </template>

    <!-- ==================== INTERNAL WAREHOUSE / CEO / IT ADMIN HEADER ==================== -->
    <template v-else>
      <div class="erp-page-head">
        <div>
          <div class="erp-kicker">OMNICHANNEL 5-CHANNEL WAREHOUSE MANAGEMENT</div>
          <h1 class="erp-h1">บริหารคลังสินค้า 5 ช่องทาง ({{ totals.skus || 0 }} รุ่น)</h1>
          <p class="erp-sub">
            แยกจัดการสต็อกแบบเรียลไทม์ทั้ง 5 ช่องทาง: <strong>Opwatch Web</strong>, <strong>Shopee</strong>, <strong>Lazada</strong>, <strong>TikTok Shop</strong> และ <strong>ตัวแทนจำหน่าย</strong>
          </p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button
            v-if="dirtyIds.length"
            type="button"
            class="erp-btn erp-btn--primary"
            :disabled="savingBatch"
            @click="saveAllDirty"
          >
            {{ savingBatch ? 'กำลังบันทึก...' : `💾 บันทึกสต็อกที่แก้ไข (${dirtyIds.length} รุ่น)` }}
          </button>
          <button type="button" class="erp-btn erp-btn--ghost" @click="exportWarehouseCsv">
            ⬇ Export CSV สต็อก 5 ช่องทาง
          </button>
        </div>
      </div>

      <!-- 5-Channel Live KPI Strip -->
      <div class="wh-kpi-grid">
        <div class="wh-kpi" style="--kc:#6c5ce7">
          <span>🌐 Opwatch Web</span>
          <strong>{{ Number(totals.stockWeb || 0).toLocaleString() }}</strong>
          <small>สต็อกหน้าเว็บไซต์หลัก</small>
        </div>
        <div class="wh-kpi" style="--kc:#f97316">
          <span>🛍 Shopee</span>
          <strong>{{ Number(totals.stockShopee || 0).toLocaleString() }}</strong>
          <small>สต็อก Shopee Mall</small>
        </div>
        <div class="wh-kpi" style="--kc:#3ba7ff">
          <span>💙 Lazada</span>
          <strong>{{ Number(totals.stockLazada || 0).toLocaleString() }}</strong>
          <small>สต็อก Lazada LazMall</small>
        </div>
        <div class="wh-kpi" style="--kc:#23264d">
          <span>🎵 TikTok Shop</span>
          <strong>{{ Number(totals.stockTiktok || 0).toLocaleString() }}</strong>
          <small>สต็อก TikTok Live / Shop</small>
        </div>
        <div class="wh-kpi" style="--kc:#ffb020">
          <span>🏪 ตัวแทนจำหน่าย</span>
          <strong>{{ Number(totals.stockDealer || 0).toLocaleString() }}</strong>
          <small>โควตาคลังส่งตัวแทน</small>
        </div>
        <div class="wh-kpi" style="--kc:#22c793">
          <span>📦 รวมทั้ง 5 ช่องทาง</span>
          <strong>{{ Number(totals.grandTotal || 0).toLocaleString() }}</strong>
          <small>ใกล้หมด {{ totals.lowStockCount || 0 }} รุ่น</small>
        </div>
      </div>

      <div class="wh-tabs">
        <button type="button" :class="{ active: activeTab === 'matrix' }" @click="activeTab = 'matrix'">
          📊 ตารางสต็อก 5 ช่องทาง (Opwatch Web · Shopee · Lazada · TikTok · ตัวแทน)
        </button>
        <button type="button" :class="{ active: activeTab === 'dealer_stock' }" @click="activeTab = 'dealer_stock'">
          🏪 ดูคลังสินค้าหน้าร้านของตัวแทนจำหน่าย
        </button>
        <button type="button" :class="{ active: activeTab === 'pickup' }" @click="activeTab = 'pickup'">
          🏬 รายการรับสินค้าหน้าร้าน ({{ pickupOrders.length }})
        </button>
      </div>
    </template>

    <!-- ==================== TAB 1: MATRIX (5-CHANNEL OR DEALER WHOLESALE + OWN STOCK) ==================== -->
    <div v-if="activeTab === 'matrix' || activeTab === 'dealer_stock'" class="erp-panel">
      <!-- Filter Bar -->
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <input
            v-model="search"
            class="erp-input"
            style="width:270px"
            placeholder="ค้นหา SKU หรือชื่อรุ่นนาฬิกา..."
          />
          <select v-model="brandFilter" class="erp-select" style="width:190px">
            <option value="">ทุกแบรนด์หลัก (3 แบรนด์)</option>
            <option value="olympianus">Olym Pianus (OP)</option>
            <option value="olympia-star">Olympia Star (OPA)</option>
            <option value="ogival">Ogival (Swiss 1903)</option>
          </select>
          <label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#454a75;cursor:pointer">
            <input v-model="lowOnly" type="checkbox" />
            <span>เฉพาะรุ่นสต็อกต่ำ / ต้องเติมของ</span>
          </label>
          <select
            v-if="!isDealer && activeTab === 'dealer_stock' && dealers.length"
            v-model="selectedDealerCode"
            class="erp-select"
            style="width:240px"
            @change="refresh()"
          >
            <option v-for="dl in dealers" :key="dl.dealerCode" :value="dl.dealerCode">
              {{ dl.dealerName }} ({{ dl.dealerCode }})
            </option>
          </select>
        </div>

        <div style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:#8a8fb1">
          <span>หน้า {{ page }} / {{ totalPages }} ({{ items.length }} รุ่น)</span>
          <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" :disabled="page <= 1" @click="page--">← ก่อนหน้า</button>
          <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" :disabled="page >= totalPages" @click="page++">ถัดไป →</button>
        </div>
      </div>

      <!-- 1A. INTERNAL 5-CHANNEL TABLE -->
      <div v-if="!isDealer && activeTab === 'matrix'" class="erp-table-wrap">
        <table class="erp-table">
          <thead>
            <tr>
              <th>รุ่นนาฬิกา</th>
              <th>ราคาขายปลีก</th>
              <th style="text-align:center">🌐 Opwatch Web</th>
              <th style="text-align:center">🛍 Shopee</th>
              <th style="text-align:center">💙 Lazada</th>
              <th style="text-align:center">🎵 TikTok Shop</th>
              <th style="text-align:center">🏪 ตัวแทนจำหน่าย</th>
              <th style="text-align:center">รวมสต็อก</th>
              <th style="text-align:right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagedItems" :key="row.id" :class="{ 'is-dirty': Boolean(dirtyMap[row.id]) }">
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <img :src="row.image" :alt="row.name" style="width:42px;height:42px;object-fit:contain;border-radius:10px;background:#f6f7fc;border:1px solid #e9ebf6" />
                  <div>
                    <div style="font-weight:600;color:#23264d;font-size:13px">{{ row.name }}</div>
                    <div style="font-size:11.5px;color:#8a8fb1">
                      <code style="color:#6c5ce7">{{ row.sku }}</code> · {{ row.brandName }}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <strong>฿{{ Number(row.price || 0).toLocaleString() }}</strong>
                <div v-if="row.dealerPrice" style="font-size:11px;color:#8a8fb1">ส่งตัวแทน: ฿{{ Number(row.dealerPrice).toLocaleString() }}</div>
              </td>
              <td style="text-align:center">
                <input :value="getChVal(row, 'stockWeb')" type="number" min="0" class="ch-input" @input="setChVal(row, 'stockWeb', ($event.target as HTMLInputElement).value)" />
              </td>
              <td style="text-align:center">
                <input :value="getChVal(row, 'stockShopee')" type="number" min="0" class="ch-input" @input="setChVal(row, 'stockShopee', ($event.target as HTMLInputElement).value)" />
              </td>
              <td style="text-align:center">
                <input :value="getChVal(row, 'stockLazada')" type="number" min="0" class="ch-input" @input="setChVal(row, 'stockLazada', ($event.target as HTMLInputElement).value)" />
              </td>
              <td style="text-align:center">
                <input :value="getChVal(row, 'stockTiktok')" type="number" min="0" class="ch-input" @input="setChVal(row, 'stockTiktok', ($event.target as HTMLInputElement).value)" />
              </td>
              <td style="text-align:center">
                <input :value="getChVal(row, 'stockDealer')" type="number" min="0" class="ch-input" @input="setChVal(row, 'stockDealer', ($event.target as HTMLInputElement).value)" />
              </td>
              <td style="text-align:center">
                <span class="erp-badge" :class="rowTotal5(row) <= 5 ? 'erp-badge--amber' : 'erp-badge--emerald'">
                  {{ rowTotal5(row) }} เรือน
                </span>
              </td>
              <td style="text-align:right">
                <div style="display:inline-flex;gap:6px">
                  <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="openTransfer(row)">⇄ โอนช่องทาง</button>
                  <button
                    v-if="dirtyMap[row.id]"
                    type="button"
                    class="erp-btn erp-btn--primary erp-btn--sm"
                    @click="saveSingleRow(row)"
                  >
                    บันทึก
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 1B. DEALER PORTAL / DEALER OWN STOCK TABLE -->
      <div v-else class="erp-table-wrap">
        <table class="erp-table">
          <thead>
            <tr>
              <th>รุ่นนาฬิกา</th>
              <th>ราคาป้าย (Retail)</th>
              <th v-if="isDealer || officeAuth.isRole('ceo', 'it_admin')">ราคาเฉพาะตัวแทน</th>
              <th v-if="isDealer">กำไรขั้นต้น/เรือน</th>
              <th style="text-align:center">คลังสินค้าตัวแทนเอง</th>
              <th style="text-align:center">ติดจองลูกค้า</th>
              <th>หมายเหตุประจำร้านตัวแทน</th>
              <th style="text-align:right">บันทึกคลังร้าน</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagedItems" :key="row.id">
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <img :src="row.image" :alt="row.name" style="width:42px;height:42px;object-fit:contain;border-radius:10px;background:#f6f7fc;border:1px solid #e9ebf6" />
                  <div>
                    <div style="font-weight:600;color:#23264d;font-size:13px">{{ row.name }}</div>
                    <div style="font-size:11.5px;color:#8a8fb1">
                      <code style="color:#6c5ce7">{{ row.sku }}</code> · {{ row.brandName }}
                      <span v-if="isDealer" style="color:#22c793"> · โควตาเบิกศูนย์ {{ row.centralDealerAvailable || 0 }} เรือน</span>
                    </div>
                  </div>
                </div>
              </td>
              <td style="color:#8a8fb1;text-decoration:line-through">฿{{ Number(row.price || 0).toLocaleString() }}</td>
              <td v-if="isDealer || officeAuth.isRole('ceo', 'it_admin')">
                <strong style="color:#6c5ce7;font-size:15px">฿{{ Number(row.dealerPrice || 0).toLocaleString() }}</strong>
              </td>
              <td v-if="isDealer">
                <span class="erp-badge erp-badge--emerald">+฿{{ Number(row.marginAmount || 0).toLocaleString() }}</span>
              </td>
              <td style="text-align:center">
                <input v-model.number="getDealerEdit(row).onHand" type="number" min="0" class="ch-input" />
              </td>
              <td style="text-align:center">
                <input v-model.number="getDealerEdit(row).reserved" type="number" min="0" class="ch-input" />
              </td>
              <td>
                <input v-model="getDealerEdit(row).notes" class="erp-input" style="height:34px;font-size:12.5px" placeholder="เช่น โชว์ตู้หน้าเคาน์เตอร์ / รอเติมของ" />
              </td>
              <td style="text-align:right">
                <button type="button" class="erp-btn erp-btn--primary erp-btn--sm" @click="saveDealerStock(row)">
                  💾 บันทึกสต็อกร้าน
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== TAB 2: IN-STORE PICKUP ORDERS (`การรับสินค้าหน้าร้าน`) ==================== -->
    <div v-else-if="activeTab === 'pickup'" class="erp-panel">
      <div style="margin-bottom:12px">
        <h3 style="margin:0;color:#23264d;font-size:17px">🏬 รายการรับสินค้าหน้าร้าน (Click &amp; Collect / In-Store Pickup)</h3>
        <p style="margin:4px 0 0;font-size:13px;color:#8a8fb1">
          ตรวจสอบลูกค้าที่ทำรายการสั่งซื้อและเลือกเข้ามารับนาฬิกาพร้อมปรับขนาดสายข้อมือที่หน้าร้าน/สาขา
        </p>
      </div>
      <div class="erp-table-wrap">
        <table class="erp-table">
          <thead>
            <tr>
              <th>เลขที่คำสั่งซื้อ</th>
              <th>ชื่อลูกค้า / เบอร์ติดต่อ</th>
              <th>สาขาที่นัดรับหน้าร้าน</th>
              <th>ยอดสุทธิ</th>
              <th>สถานะ</th>
              <th style="text-align:right">การดำเนินการหน้าร้าน</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ord in pickupOrders" :key="ord.id">
              <td><code style="color:#6c5ce7;font-weight:700">{{ ord.orderNo }}</code></td>
              <td>
                <div style="font-weight:600">{{ ord.customerName }}</div>
                <div style="font-size:12px;color:#8a8fb1">{{ ord.phone }}</div>
              </td>
              <td><span class="erp-badge erp-badge--violet">{{ ord.branchSlug || 'สำนักงานใหญ่ / เคาน์เตอร์สาขา' }}</span></td>
              <td><strong>฿{{ Number(ord.total || 0).toLocaleString() }}</strong></td>
              <td><span class="erp-badge erp-badge--emerald">{{ ord.status }}</span></td>
              <td style="text-align:right">
                <button
                  v-if="ord.status !== 'delivered'"
                  type="button"
                  class="erp-btn erp-btn--primary erp-btn--sm"
                  @click="markPickupDelivered(ord)"
                >
                  ✓ ยืนยันลูกค้ารับสินค้าหน้าร้านแล้ว
                </button>
                <span v-else style="font-size:12px;color:#22c793;font-weight:600">ส่งมอบเรียบร้อย</span>
              </td>
            </tr>
            <tr v-if="!pickupOrders.length">
              <td colspan="6" style="text-align:center;padding:28px;color:#8a8fb1">
                ยังไม่มีรายการรอนัดรับสินค้าหน้าร้านในขณะนี้
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== TAB 3: DEALER PROMOTIONS (`โปรโมชั่น`) ==================== -->
    <div v-else-if="activeTab === 'promos'" class="promo-cards-grid">
      <div v-for="pr in promotions" :key="pr.id" class="erp-panel" style="display:flex;flex-direction:column;gap:10px">
        <span class="erp-badge erp-badge--violet" style="align-self:flex-start">{{ pr.badge || 'CAMPAIGN' }}</span>
        <h3 style="margin:0;font-size:17px;color:#23264d">{{ pr.titleTh || pr.title }}</h3>
        <p style="margin:0;font-size:13px;color:#6b7196;line-height:1.55">{{ pr.subtitleTh || pr.subtitle }}</p>
        <div style="margin-top:auto;padding-top:10px;border-top:1px solid #e9ebf6;display:flex;justify-content:space-between;font-size:12.5px">
          <strong style="color:#ff6b9d">{{ pr.discountLabel || 'สิทธิพิเศษตัวแทนและหน้าร้าน' }}</strong>
          <span style="color:#8a8fb1">ช่องทาง: {{ pr.channel || 'Omnichannel' }}</span>
        </div>
      </div>
    </div>

    <!-- ==================== CHANNEL TRANSFER MODAL ==================== -->
    <div v-if="transferOpen" class="wh-modal-bg" @click.self="transferOpen = false">
      <div class="wh-modal">
        <h3 style="margin:0 0 6px;color:#23264d">⇄ โอนย้ายสต็อกระหว่าง 5 ช่องทาง</h3>
        <p style="margin:0 0 16px;font-size:13px;color:#8a8fb1">
          รุ่น <strong>{{ transferForm.sku }}</strong> — {{ transferForm.name }}
        </p>
        <div class="erp-grid-2">
          <div class="erp-field">
            <label class="erp-label">โอนออกจากช่องทางต้นทาง</label>
            <select v-model="transferForm.fromChannel" class="erp-select">
              <option v-for="ch in channelOptions" :key="ch.key" :value="ch.key">{{ ch.label }}</option>
            </select>
          </div>
          <div class="erp-field">
            <label class="erp-label">ไปยังช่องทางปลายทาง</label>
            <select v-model="transferForm.toChannel" class="erp-select">
              <option v-for="ch in channelOptions" :key="ch.key" :value="ch.key">{{ ch.label }}</option>
            </select>
          </div>
          <div class="erp-field" style="grid-column:1 / -1">
            <label class="erp-label">จำนวนเรือนที่ต้องการโอนย้าย</label>
            <input v-model.number="transferForm.qty" type="number" min="1" class="erp-input" />
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:18px">
          <button type="button" class="erp-btn erp-btn--ghost" @click="transferOpen = false">ยกเลิก</button>
          <button type="button" class="erp-btn erp-btn--primary" :disabled="transferSaving" @click="submitTransfer">
            {{ transferSaving ? 'กำลังโอนสต็อก...' : 'ยืนยันโอนย้ายสต็อก' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wh-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.wh-kpi-grid--4 {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
.wh-kpi {
  background: #ffffff;
  border: 1px solid #e9ebf6;
  border-top: 3px solid var(--kc, #6c5ce7);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.wh-kpi span {
  font-size: 12.5px;
  font-weight: 600;
  color: #454a75;
}
.wh-kpi strong {
  font-size: 22px;
  font-weight: 700;
  color: #23264d;
  font-family: 'JetBrains Mono', 'Prompt', sans-serif;
}
.wh-kpi small {
  font-size: 11.5px;
  color: #8a8fb1;
}
.wh-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}
.wh-tabs button {
  padding: 9px 16px;
  border-radius: 12px;
  border: 1px solid #dfe2f2;
  background: #ffffff;
  color: #454a75;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.wh-tabs button.active {
  background: linear-gradient(135deg, #8e7cf3 0%, #6c5ce7 60%, #4a3fd1 100%);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 8px 18px rgba(108, 92, 231, 0.22);
}
.ch-input {
  width: 66px;
  height: 34px;
  text-align: center;
  border-radius: 9px;
  border: 1px solid #dfe2f2;
  background: #fbfbfe;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  color: #23264d;
}
.ch-input:focus {
  outline: none;
  border-color: #6c5ce7;
  background: #ffffff;
}
.is-dirty {
  background: #f8f6ff;
}
.promo-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 14px;
}
.wh-modal-bg {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(35, 38, 77, 0.42);
  display: grid;
  place-items: center;
  padding: 16px;
}
.wh-modal {
  width: 100%;
  max-width: 520px;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #e9ebf6;
}
</style>
