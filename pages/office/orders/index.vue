<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const localePath = useLocalePath()
const { site } = useSite()
const { isDealer, officer } = useOfficeAuth()
const toast = useToast()

const statusFilter = ref('')
const search = ref('')

const { data, refresh } = await useFetch<any>('/api/admin/orders', {
  query: computed(() => ({
    status: statusFilter.value || undefined,
    q: search.value || undefined
  }))
})

const orders = computed(() => data.value?.items || data.value?.orders || [])

const summary = computed(() => {
  const all = orders.value
  const valid = all.filter((o: any) => o.status !== 'cancelled')
  return {
    totalCount: all.length,
    revenue: valid.reduce((s: number, o: any) => s + Number(o.total || 0), 0),
    pending: all.filter((o: any) => o.status === 'pending').length,
    confirmed: all.filter((o: any) => o.status === 'paid').length,
    shipped: all.filter((o: any) => o.status === 'shipped').length,
    completed: all.filter((o: any) => o.status === 'completed').length
  }
})

// Quick inline confirm or tracking dispatch
const quickTracking = reactive<Record<number, string>>({})
const quickCarrier = reactive<Record<number, string>>({})

async function quickConfirm(o: any) {
  try {
    await $fetch(`/api/admin/orders/${o.id}`, {
      method: 'PUT',
      body: { status: 'paid' }
    })
    toast.success(`ยืนยันคำสั่งซื้อ ${o.orderNo} เรียบร้อย`)
    await refresh()
  } catch {
    toast.error('อัปเดตสถานะไม่สำเร็จ')
  }
}

async function quickDispatch(o: any) {
  const trk = (quickTracking[o.id] || o.trackingNo || '').trim()
  const car = quickCarrier[o.id] || o.carrier || 'Kerry Express'
  if (!trk) {
    toast.error('กรุณากรอกเลขพัสดุก่อนกดจัดส่ง')
    return
  }
  try {
    await $fetch(`/api/admin/orders/${o.id}`, {
      method: 'PUT',
      body: { status: 'shipped', carrier: car, trackingNo: trk }
    })
    toast.success(`บันทึกการจัดส่ง ${o.orderNo} (${car}: ${trk}) เรียบร้อย!`)
    await refresh()
  } catch {
    toast.error('บันทึกเลขพัสดุไม่สำเร็จ')
  }
}

async function quickConfirmPickup(o: any) {
  try {
    await $fetch(`/api/admin/orders/${o.id}`, {
      method: 'PUT',
      body: { status: 'delivered', note: `ลูกค้ารับสินค้าหน้าร้านเรียบร้อย (${officer.value?.dealerName || officer.value?.name || 'Dealer'})` }
    })
    toast.success(`บันทึกการรับสินค้าหน้าร้าน ${o.orderNo} เรียบร้อย!`)
    await refresh()
  } catch {
    toast.error('บันทึกสถานะการรับสินค้าไม่สำเร็จ')
  }
}

function statusChip(st: string) {
  if (st === 'completed' || st === 'delivered') return 'erp-chip--mint'
  if (st === 'paid' || st === 'confirmed') return 'erp-chip--violet'
  if (st === 'shipped') return 'erp-chip--cyan'
  if (st === 'cancelled') return 'erp-chip--rose'
  return 'erp-chip--amber'
}

const fmt = (v: number) => formatPrice(Number(v || 0), site.value.currencySymbol || '฿', 'th-TH')

useHead({ title: 'บริหารจัดการคำสั่งซื้อ & จัดส่งพัสดุ — OPWatch Office' })
</script>

<template>
  <div>
    <div class="erp-page-head">
      <div>
        <div class="erp-kicker">{{ isDealer ? 'DEALER PORTAL · CLICK & COLLECT' : 'MODULE 7.4 · ORDER FULFILLMENT & LOGISTICS' }}</div>
        <h1 class="erp-h1">
          {{ isDealer ? 'การรับสินค้าหน้าร้าน (In-Store Pickup Portal)' : 'บริหารจัดการสั่งสินค้าและการส่งสินค้า (Order & Dispatch Center)' }}
        </h1>
        <p class="erp-sub">
          {{
            isDealer
              ? `รายการที่ลูกค้าเลือกมารับสินค้าที่หน้าร้านตัวแทนจำหน่าย (${officer?.dealerName || officer?.branchSlug || 'สาขาพาร์ทเนอร์'})`
              : 'ภาพรวมยอดขาย ยืนยันคำสั่งซื้อ บันทึกขนส่งและเลขพัสดุจัดส่ง พร้อมติดตามสถานะคำสั่งซื้อแบบครบวงจร'
          }}
        </p>
      </div>
      <button type="button" class="erp-btn" @click="refresh()">↻ รีเฟรชคำสั่งซื้อ</button>
    </div>

    <!-- Sales & Fulfillment KPIs -->
    <div class="erp-kpis">
      <div class="erp-kpi">
        <div class="erp-kpi__label">{{ isDealer ? 'รายการรับสินค้าหน้าร้านทั้งหมด' : 'ยอดขายตามตัวกรอง' }}</div>
        <div class="erp-kpi__val">{{ isDealer ? `${summary.totalCount} รายการ` : fmt(summary.revenue) }}</div>
        <div class="erp-kpi__meta">{{ isDealer ? 'เฉพาะรายการ Click & Collect' : `ทั้งหมด ${summary.totalCount} คำสั่งซื้อ` }}</div>
      </div>
      <div class="erp-kpi">
        <div class="erp-kpi__label">1. รอยืนยันคำสั่งซื้อ</div>
        <div class="erp-kpi__val" style="color:#fbbf24">{{ summary.pending }}</div>
        <div class="erp-kpi__meta">รอตรวจสอบยอด / ยืนยัน</div>
      </div>
      <div class="erp-kpi">
        <div class="erp-kpi__label">2. ยืนยันแล้ว / รอแพ็กส่ง</div>
        <div class="erp-kpi__val" style="color:#a78bfa">{{ summary.confirmed }}</div>
        <div class="erp-kpi__meta">พร้อมบรรจุและออกเลขพัสดุ</div>
      </div>
      <div class="erp-kpi">
        <div class="erp-kpi__label">3. จัดส่งแล้ว (Shipped)</div>
        <div class="erp-kpi__val" style="color:#22d3ee">{{ summary.shipped }}</div>
        <div class="erp-kpi__meta">อยู่ระหว่างขนส่งถึงลูกค้า</div>
      </div>
      <div class="erp-kpi">
        <div class="erp-kpi__label">4. สำเร็จสมบูรณ์</div>
        <div class="erp-kpi__val" style="color:#34d399">{{ summary.completed }}</div>
        <div class="erp-kpi__meta">ส่งมอบเรียบร้อย</div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="erp-panel">
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">
        <input v-model="search" class="erp-input" style="flex:1;min-width:220px" placeholder="ค้นหาเลขที่คำสั่งซื้อ ชื่อลูกค้า เบอร์โทร..." />
        <select v-model="statusFilter" class="erp-select" style="width:220px">
          <option value="">ทุกสถานะคำสั่งซื้อ</option>
          <option value="pending">รอยืนยัน (pending)</option>
          <option value="paid">ยืนยันแล้ว / ชำระแล้ว (paid)</option>
          <option value="shipped">จัดส่งแล้ว (shipped)</option>
          <option value="completed">สำเร็จ (completed)</option>
          <option value="cancelled">ยกเลิก (cancelled)</option>
        </select>
      </div>

      <div class="erp-table-wrap">
        <table class="erp-table">
          <thead>
            <tr>
              <th>เลขคำสั่งซื้อ / วันที่</th>
              <th>ลูกค้า &amp; รูปแบบรับสินค้า</th>
              <th>ยอดสุทธิ</th>
              <th>สถานะ</th>
              <th>จัดส่งด่วน (ขนส่ง + เลขพัสดุ)</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id">
              <td>
                <div style="font-family:monospace;font-weight:700;color:#6c5ce7">{{ o.orderNo }}</div>
                <div style="font-size:11px;color:#94a3b8">{{ new Date(o.createdAt).toLocaleString('th-TH') }}</div>
                <span v-if="o.giftWrap" class="erp-chip erp-chip--violet" style="margin-top:4px">🎁 ห่อของขวัญ</span>
              </td>
              <td>
                <strong>{{ o.customer?.name }}</strong>
                <div style="font-size:11.5px;color:#94a3b8">{{ o.customer?.phone }} · {{ o.customer?.city }}</div>
                <span v-if="o.branchSlug" class="erp-chip erp-chip--mint">📍 รับที่สาขา: {{ o.branchSlug }}</span>
              </td>
              <td>
                <strong>{{ fmt(o.total) }}</strong>
                <div style="font-size:11px;color:#64748b">{{ o.paymentMethod }}</div>
              </td>
              <td>
                <span class="erp-chip" :class="statusChip(o.status)">{{ o.status }}</span>
              </td>
              <td>
                <div v-if="isDealer" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                  <span class="erp-chip erp-chip--mint">📍 {{ o.branchSlug || 'รับที่หน้าร้าน' }}</span>
                  <button
                    v-if="o.status !== 'delivered' && o.status !== 'completed' && o.status !== 'cancelled'"
                    type="button"
                    class="erp-btn erp-btn--sm erp-btn--primary"
                    @click="quickConfirmPickup(o)"
                  >
                    ✓ ยืนยันลูกค้ารับสินค้าแล้ว
                  </button>
                </div>
                <div v-else-if="o.trackingNo" style="font-size:12px">
                  <strong style="color:#0e9f6e">{{ o.carrier || 'Express' }}:</strong>
                  <code style="margin-left:4px;color:#6c5ce7">{{ o.trackingNo }}</code>
                </div>
                <div v-else style="display:flex;gap:5px;align-items:center">
                  <select v-model="quickCarrier[o.id]" class="erp-select" style="width:118px;padding:4px 6px;font-size:11.5px">
                    <option value="Kerry Express">Kerry Express</option>
                    <option value="Thailand Post EMS">ไปรษณีย์ EMS</option>
                    <option value="Flash Express">Flash Express</option>
                    <option value="DHL Thailand">DHL Thailand</option>
                  </select>
                  <input
                    v-model="quickTracking[o.id]"
                    class="erp-input"
                    style="width:130px;padding:4px 7px;font-size:11.5px"
                    placeholder="เลขพัสดุ..."
                  />
                  <button type="button" class="erp-btn erp-btn--sm erp-btn--primary" @click="quickDispatch(o)">ส่ง</button>
                </div>
              </td>
              <td>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                  <button
                    v-if="o.status === 'pending'"
                    type="button"
                    class="erp-btn erp-btn--sm erp-btn--primary"
                    @click="quickConfirm(o)"
                  >
                    ✓ ยืนยันออเดอร์
                  </button>
                  <NuxtLink :to="localePath(`/office/orders/${o.id}`)" class="erp-btn erp-btn--sm">
                    รายละเอียด / ติดตาม
                  </NuxtLink>
                </div>
              </td>
            </tr>
            <tr v-if="!orders.length">
              <td colspan="6" style="text-align:center;padding:30px;color:#64748b">ยังไม่มีรายการคำสั่งซื้อ</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
