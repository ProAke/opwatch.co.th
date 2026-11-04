<script setup lang="ts">
const { locale } = useI18n()
const route = useRoute()
const { site } = useSite()

const orderNo = ref(String(route.query.order || ''))
const contact = ref('')
const loading = ref(false)
const errMsg = ref('')
const order = ref<any>(null)

const fmt = (v: number) =>
  formatPrice(Number(v || 0), site.value.currencySymbol, locale.value === 'en' ? 'en-US' : 'th-TH')

const steps = [
  { key: 'pending', th: 'รับคำสั่งซื้อแล้ว', en: 'Order Placed' },
  { key: 'paid', th: 'ยืนยันคำสั่งซื้อ / ชำระเงิน', en: 'Confirmed' },
  { key: 'shipped', th: 'ส่งมอบขนส่งพร้อมเลขพัสดุ', en: 'Shipped' },
  { key: 'completed', th: 'จัดส่งสำเร็จ', en: 'Delivered' }
]

const currentStepIdx = computed(() => {
  const s = order.value?.status
  if (s === 'completed') return 3
  if (s === 'shipped') return 2
  if (s === 'paid' || s === 'confirmed') return 1
  return 0
})

async function lookup() {
  const code = orderNo.value.trim()
  if (!code) return
  loading.value = true
  errMsg.value = ''
  try {
    const q = contact.value.trim() ? `?contact=${encodeURIComponent(contact.value.trim())}` : ''
    const res = await $fetch<any>(`/api/orders/${encodeURIComponent(code)}${q}`)
    order.value = res?.order ? { ...res.order, items: res.items || [] } : res
  } catch (e: any) {
    order.value = null
    errMsg.value = e?.data?.statusMessage || 'ไม่พบหมายเลขคำสั่งซื้อนี้ กรุณาตรวจสอบรหัสคำสั่งซื้ออีกครั้ง'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (orderNo.value) lookup()
})

useHead(() => ({
  title: locale.value === 'th' ? 'ติดตามสถานะคำสั่งซื้อ & เลขพัสดุ — OPWatch' : 'Track Your Order — OPWatch'
}))
</script>

<template>
  <div class="op-track">
    <section class="op-track__hero">
      <div class="container">
        <span class="eyebrow" style="color:#ffffff">REAL-TIME SHIPMENT TRACKING</span>
        <h1>{{ locale === 'th' ? 'ติดตามสถานะคำสั่งซื้อ & เลขพัสดุจัดส่ง' : 'Track Your Order & Parcel Status' }}</h1>
        <p>{{ locale === 'th' ? 'กรอกหมายเลขคำสั่งซื้อ (เช่น OP-2026...) เพื่อตรวจสอบขั้นตอนการยืนยันออเดอร์ เลขพัสดุขนส่ง และรายละเอียดสินค้า' : 'Enter your OPWatch order number (e.g. OP-2026...) to check confirmation and courier tracking.' }}</p>
      </div>
    </section>

    <section class="section">
      <div class="container" style="max-width: 860px">
        <form class="card op-track__form" @submit.prevent="lookup">
          <input v-model="orderNo" class="input" placeholder="หมายเลขคำสั่งซื้อ เช่น OP-2026..." required />
          <input v-model="contact" class="input" placeholder="อีเมล หรือ เบอร์โทรศัพท์ผู้สั่งซื้อ (เพื่อดูที่อยู่เต็ม)" />
          <button type="submit" class="btn" :disabled="loading">
            {{ loading ? 'กำลังค้นหา...' : locale === 'th' ? 'ค้นหาสถานะ' : 'Track Order' }}
          </button>
        </form>

        <div v-if="errMsg" class="card" style="margin-top:18px;border-color:#fca5a5;color:#b91c1c">
          {{ errMsg }}
        </div>

        <div v-if="order" class="card stack gap-20" style="margin-top:22px">
          <div class="between wrap gap-12">
            <div>
              <span class="eyebrow">ORDER NUMBER</span>
              <h2 style="font-size:22px;font-weight:700">{{ order.orderNo }}</h2>
              <p class="muted tiny">สั่งซื้อเมื่อ: {{ new Date(order.createdAt).toLocaleString('th-TH') }}</p>
            </div>
            <span class="badge badge--accent" style="font-size:13px;padding:6px 14px">
              สถานะปัจจุบัน: {{ order.status?.toUpperCase() }}
            </span>
          </div>

          <!-- Visual Progress Stepper -->
          <div v-if="order.status !== 'cancelled'" class="op-track__steps">
            <div
              v-for="(st, idx) in steps"
              :key="st.key"
              class="op-track__step"
              :class="{ 'is-done': idx <= currentStepIdx }"
            >
              <div class="op-track__dot">{{ idx + 1 }}</div>
              <span>{{ locale === 'th' ? st.th : st.en }}</span>
            </div>
          </div>

          <!-- Carrier & Tracking Number Box -->
          <div v-if="order.trackingNo || order.carrier || order.branchSlug" class="op-track__carrier">
            <div v-if="order.branchSlug">
              <strong>📍 เลือกรับสินค้าที่สาขา (Click &amp; Collect):</strong> {{ order.branchSlug }}
            </div>
            <div v-if="order.carrier || order.trackingNo">
              <strong>🚚 ขนส่ง (Carrier):</strong> {{ order.carrier || 'EMS / Kerry Express' }}
              · <strong>เลขพัสดุ (Tracking No.):</strong>
              <code style="background:#eef0ff;padding:3px 9px;border-radius:4px;color:var(--sapphire);font-weight:700">
                {{ order.trackingNo || 'กำลังเตรียมเลขพัสดุ' }}
              </code>
            </div>
          </div>

          <!-- Items Summary -->
          <div class="stack gap-10">
            <div v-for="(it, i) in order.items || []" :key="i" class="between" style="padding:8px 0;border-bottom:1px solid var(--line)">
              <div>
                <strong>{{ it.name }}</strong> × {{ it.quantity }}
                <span v-if="it.wristSize" class="muted tiny"> (ขนาดข้อมือ: {{ it.wristSize }})</span>
              </div>
              <strong>{{ fmt(Number(it.price) * Number(it.quantity)) }}</strong>
            </div>
          </div>

          <div class="between" style="font-size:17px;font-weight:700">
            <span>ยอดชำระสุทธิ</span>
            <span style="color:var(--sapphire)">{{ fmt(order.total) }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.op-track__hero {
  background: linear-gradient(135deg, #101444 0%, #1d2088 100%);
  color: #ffffff;
  padding: 64px 0 46px;
}
.op-track__hero h1 { color: #ffffff; font-family: var(--font-display); font-size: clamp(1.9rem, 3vw, 2.6rem); margin-top: 8px; }
.op-track__hero p { color: #ffffff; max-width: 680px; opacity: 0.94; margin-top: 8px; }
.op-track__form { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; }
.op-track__steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 16px;
  background: #f6f8fd;
  border-radius: 10px;
}
.op-track__step { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; opacity: 0.45; }
.op-track__step.is-done { opacity: 1; }
.op-track__dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #cbd5e1;
  color: #1e293b;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 13px;
}
.op-track__step.is-done .op-track__dot { background: var(--sapphire); color: #ffffff; }
.op-track__step span { font-size: 12.5px; font-weight: 600; }
.op-track__carrier {
  background: #f0f4ff;
  border: 1px solid #c7d2fe;
  padding: 14px 16px;
  border-radius: 8px;
  font-size: 14px;
  display: grid;
  gap: 6px;
}
@media (max-width: 768px) {
  .op-track__form, .op-track__steps { grid-template-columns: 1fr; }
}
</style>
