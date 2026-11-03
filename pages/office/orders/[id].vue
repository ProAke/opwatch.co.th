<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const route = useRoute()
const localePath = useLocalePath()
const { site } = useSite()
const toast = useToast()

const id = computed(() => Number(route.params.id))
const { data, refresh } = await useFetch<any>(() => `/api/admin/orders/${id.value}`)
const order = computed(() => data.value?.order || data.value)

const form = reactive({
  status: 'pending',
  carrier: 'Kerry Express',
  trackingNo: '',
  adminNote: ''
})

watch(
  order,
  (o) => {
    if (!o) return
    form.status = o.status || 'pending'
    form.carrier = o.carrier || 'Kerry Express'
    form.trackingNo = o.trackingNo || ''
    form.adminNote = o.adminNote || ''
  },
  { immediate: true }
)

const saving = ref(false)
const aiMsgBusy = ref(false)
const aiCustomerMsg = ref('')

async function draftCustomerNotify() {
  if (!order.value) return
  aiMsgBusy.value = true
  try {
    const res = await $fetch<any>('/api/admin/ai/generate', {
      method: 'POST',
      body: {
        task: 'order_reply',
        agentCode: 'OP-CARE',
        input: {
          orderNo: order.value.orderNo,
          customerName: order.value.customer?.name || order.value.customerName,
          trackingNumber: form.trackingNo,
          shippingCarrier: form.carrier,
          status: form.status
        }
      }
    })
    aiCustomerMsg.value = res?.result?.message || ''
    toast.success('✨ AI ร่างข้อความแจ้งลูกค้าเรียบร้อยแล้ว')
  } catch {
    toast.error('ร่างข้อความด้วย AI ไม่สำเร็จ')
  } finally {
    aiMsgBusy.value = false
  }
}

async function copyCustomerNotify() {
  if (!aiCustomerMsg.value || !import.meta.client) return
  await navigator.clipboard.writeText(aiCustomerMsg.value)
  toast.success('คัดลอกข้อความสำหรับส่ง LINE / แชทลูกค้าแล้ว')
}

async function saveOrder(presetStatus?: string) {
  if (presetStatus) form.status = presetStatus
  saving.value = true
  try {
    await $fetch(`/api/admin/orders/${id.value}`, {
      method: 'PUT',
      body: form
    })
    toast.success('อัปเดตสถานะและข้อมูลจัดส่งเรียบร้อย!')
    await refresh()
  } catch {
    toast.error('บันทึกข้อมูลไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}

function printPackingSlip() {
  if (import.meta.client) window.print()
}

const fmt = (v: number) => formatPrice(Number(v || 0), site.value.currencySymbol || '฿', 'th-TH')

useHead({ title: 'รายละเอียดคำสั่งซื้อ & ติดตามการจัดส่ง — OPWatch Office' })
</script>

<template>
  <div v-if="order">
    <div class="erp-page-head">
      <div>
        <div class="erp-kicker">MODULE 7.4 · ORDER TIMELINE &amp; DISPATCH</div>
        <h1 class="erp-h1">คำสั่งซื้อ {{ order.orderNo }}</h1>
        <p class="erp-sub">สั่งซื้อเมื่อ {{ new Date(order.createdAt).toLocaleString('th-TH') }}</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <NuxtLink :to="localePath('/office/orders')" class="erp-btn">← กลับหน้ารวมออเดอร์</NuxtLink>
        <button type="button" class="erp-btn" @click="printPackingSlip">🖨 พิมพ์ใบปะหน้าพัสดุ</button>
        <button v-if="order.status === 'pending'" type="button" class="erp-btn erp-btn--violet" @click="saveOrder('paid')">
          ✓ ยืนยันคำสั่งซื้อทันที
        </button>
        <button v-if="order.status !== 'completed'" type="button" class="erp-btn erp-btn--primary" @click="saveOrder('completed')">
          ★ ปิดงานส่งมอบสำเร็จ
        </button>
      </div>
    </div>

    <!-- Visual Status Stepper -->
    <div class="erp-panel">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
        <div style="padding:12px;border-radius:12px;border:1px solid var(--violet);background:var(--violet-soft)">
          <div style="font-size:11px;color:var(--violet);font-weight:600">1. สั่งซื้อสำเร็จ</div>
          <strong style="font-size:13px">{{ new Date(order.createdAt).toLocaleString('th-TH') }}</strong>
        </div>
        <div :style="{ padding: '12px', borderRadius: '12px', border: '1px solid #e9ebf6', background: '#f6f7fc', opacity: order.confirmedAt || order.status !== 'pending' ? 1 : 0.5 }">
          <div style="font-size:11px;color:#2f7bf0;font-weight:600">2. ยืนยันคำสั่งซื้อ</div>
          <strong style="font-size:13px">{{ order.confirmedAt ? new Date(order.confirmedAt).toLocaleString('th-TH') : 'รอยืนยัน' }}</strong>
        </div>
        <div :style="{ padding: '12px', borderRadius: '12px', border: '1px solid #e9ebf6', background: '#f6f7fc', opacity: order.shippedAt || order.trackingNo ? 1 : 0.5 }">
          <div style="font-size:11px;color:var(--violet);font-weight:600">3. ส่งมอบขนส่ง</div>
          <strong style="font-size:13px">{{ order.trackingNo || 'รอกรอกเลขพัสดุ' }}</strong>
        </div>
        <div :style="{ padding: '12px', borderRadius: '12px', border: '1px solid #e9ebf6', background: '#f6f7fc', opacity: order.status === 'completed' ? 1 : 0.5 }">
          <div style="font-size:11px;color:#0e9f6e;font-weight:600">4. จัดส่งถึงลูกค้า</div>
          <strong style="font-size:13px">{{ order.deliveredAt ? new Date(order.deliveredAt).toLocaleString('th-TH') : 'รอนำจ่าย' }}</strong>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1.35fr 1fr;gap:18px" class="ord-split">
      <!-- Left: Items & Customer -->
      <div>
        <div class="erp-panel">
          <div class="erp-panel__title" style="margin-bottom:12px">รายการสินค้าที่สั่งซื้อ</div>
          <div class="erp-table-wrap">
            <table class="erp-table">
              <thead>
                <tr>
                  <th>สินค้า</th>
                  <th>จำนวน</th>
                  <th>ราคาต่อเรือน</th>
                  <th>รวม</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, idx) in order.items || []" :key="idx">
                  <td>
                    <strong>{{ it.name }}</strong>
                    <div style="font-size:11.5px;color:#6c5ce7">SKU: {{ it.sku || '-' }} <span v-if="it.wristSize">· ขนาดข้อมือ: {{ it.wristSize }}</span></div>
                  </td>
                  <td>{{ it.quantity }}</td>
                  <td>{{ fmt(it.price) }}</td>
                  <td><strong>{{ fmt(Number(it.price) * Number(it.quantity)) }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="margin-top:14px;display:grid;gap:6px;max-width:340px;margin-left:auto;font-size:13.5px">
            <div style="display:flex;justify-content:space-between"><span>ยอดรวมสินค้า</span><span>{{ fmt(order.subtotal) }}</span></div>
            <div v-if="order.discount > 0" style="display:flex;justify-content:space-between;color:#0e9f6e"><span>ส่วนลดรวม ({{ order.couponCode || 'Member/Points' }})</span><span>-{{ fmt(order.discount) }}</span></div>
            <div style="display:flex;justify-content:space-between"><span>ค่าจัดส่ง</span><span>{{ fmt(order.shippingFee) }}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:17px;font-weight:700;color:var(--violet);border-top:1px solid #e9ebf6;padding-top:8px">
              <span>ยอดชำระสุทธิ</span><span>{{ fmt(order.total) }}</span>
            </div>
          </div>
        </div>

        <div class="erp-panel">
          <div class="erp-panel__title" style="margin-bottom:10px">ข้อมูลผู้รับและสิทธิพิเศษ</div>
          <div style="font-size:13.5px;line-height:1.8;color:#454a75">
            <div><strong>ชื่อผู้รับ:</strong> {{ order.customer?.name }}</div>
            <div><strong>เบอร์โทร / อีเมล:</strong> {{ order.customer?.phone }} · {{ order.customer?.email }}</div>
            <div><strong>ที่อยู่จัดส่ง:</strong> {{ order.customer?.address }} {{ order.customer?.city }} {{ order.customer?.postalCode }}</div>
            <div v-if="order.branchSlug" style="color:#0e9f6e"><strong>📍 รับสินค้าที่สาขา (Click &amp; Collect):</strong> {{ order.branchSlug }}</div>
            <div v-if="order.giftWrap" style="color:var(--violet)"><strong>🎁 บริการห่อของขวัญ:</strong> ต้องการห่อของขวัญ · การ์ด: "{{ order.giftMessage || '-' }}"</div>
            <div v-if="order.note"><strong>หมายเหตุจากลูกค้า:</strong> {{ order.note }}</div>
          </div>
        </div>
      </div>

      <!-- Right: Confirm & Carrier Dispatch Form -->
      <div class="erp-panel" style="height:fit-content">
        <div class="erp-panel__title" style="margin-bottom:14px">จัดการสถานะ &amp; บันทึกเลขพัสดุจัดส่ง</div>

        <div class="erp-field" style="margin-bottom:12px">
          <label class="erp-label">สถานะคำสั่งซื้อ</label>
          <select v-model="form.status" class="erp-select">
            <option value="pending">pending — รอยืนยันคำสั่งซื้อ</option>
            <option value="paid">paid — ยืนยันคำสั่งซื้อ / ชำระเงินแล้ว</option>
            <option value="shipped">shipped — จัดส่งสินค้าออกแล้ว</option>
            <option value="completed">completed — ลูกค้าได้รับสินค้าเรียบร้อย</option>
            <option value="cancelled">cancelled — ยกเลิกรายการ</option>
          </select>
        </div>

        <div class="erp-field" style="margin-bottom:12px">
          <label class="erp-label">บริษัทขนส่ง (Carrier)</label>
          <select v-model="form.carrier" class="erp-select">
            <option value="Kerry Express">Kerry Express</option>
            <option value="Thailand Post EMS">ไปรษณีย์ไทย EMS</option>
            <option value="Flash Express">Flash Express</option>
            <option value="J&T Express">J&amp;T Express</option>
            <option value="DHL Domestic">DHL eCommerce Thailand</option>
            <option value="รับที่สาขา (Click & Collect)">รับที่สาขา (Click &amp; Collect)</option>
          </select>
        </div>

        <div class="erp-field" style="margin-bottom:12px">
          <label class="erp-label">หมายเลขพัสดุ (Tracking Number)</label>
          <input v-model="form.trackingNo" class="erp-input" placeholder="เช่น KEX2026998877TH" />
        </div>

        <div class="erp-field" style="margin-bottom:16px">
          <label class="erp-label">บันทึกภายในสำหรับเจ้าหน้าที่ (Admin Note)</label>
          <textarea v-model="form.adminNote" class="erp-textarea" rows="3" placeholder="บันทึกการตรวจเช็คเวลา กันน้ำ หรือการตัดสายก่อนจัดส่ง..." />
        </div>

        <button type="button" class="erp-btn erp-btn--primary" style="width:100%;justify-content:center" :disabled="saving" @click="saveOrder()">
          {{ saving ? 'กำลังบันทึก...' : '💾 บันทึกสถานะและเลขพัสดุ' }}
        </button>

        <!-- AI Customer Notification Drafter -->
        <div style="margin-top:16px;padding-top:14px;border-top:1px solid #e9ebf6">
          <button
            type="button"
            class="erp-btn erp-btn--violet"
            style="width:100%;justify-content:center"
            :disabled="aiMsgBusy"
            @click="draftCustomerNotify"
          >
            {{ aiMsgBusy ? 'กำลังร่างข้อความ...' : '✨ ให้ AI ร่างข้อความแจ้งเลขพัสดุให้ลูกค้า' }}
          </button>
          <div v-if="aiCustomerMsg" style="margin-top:10px;padding:12px;border-radius:12px;background:#f6f7fc;border:1px solid #e9ebf6">
            <p style="margin:0 0 8px;font-size:12.5px;line-height:1.6;color:#23264d">{{ aiCustomerMsg }}</p>
            <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="copyCustomerNotify">📋 คัดลอกส่ง LINE / อีเมล</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 980px) {
  .ord-split { grid-template-columns: 1fr !important; }
}
</style>
