<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const { site } = useSite()
const { data: stats, refresh } = await useFetch<any>('/api/admin/stats')

const fmt = (v: number) =>
  formatPrice(Number(v || 0), site.value.currencySymbol || '฿', 'th-TH')

const daily = computed(() => stats.value?.dailySeries || [])
const brands = computed(() => stats.value?.brandBreakdown || [])
const categories = computed(() => stats.value?.categoryBreakdown || [])
const payments = computed(() => stats.value?.paymentBreakdown || [])
const funnel = computed(() => stats.value?.funnel || [])

const palette = ['#22d3ee', '#34d399', '#a78bfa', '#fbbf24', '#fb7185', '#60a5fa']

// 1. Multi-bar + Line combo coordinates (14-Day Revenue & Orders)
const barChart = computed(() => {
  const list = daily.value
  const maxRev = Math.max(...list.map((d: any) => Number(d.revenue || 0)), 1000)
  return list.map((d: any, idx: number) => ({
    ...d,
    pct: Math.max(4, Math.round((Number(d.revenue || 0) / maxRev) * 100)),
    color: idx % 2 === 0 ? '#22d3ee' : '#34d399'
  }))
})

// 2. Pure-SVG Donut Segments for Brand Share (by Catalog Value or Revenue)
const brandDonut = computed(() => {
  const list = brands.value
  const useRevenue = list.some((b: any) => Number(b.revenue) > 0)
  const metricKey = useRevenue ? 'revenue' : 'stockValue'
  const total = list.reduce((s: number, b: any) => s + Number(b[metricKey] || 0), 0) || 1
  const r = 64
  const c = 2 * Math.PI * r
  let offset = 0
  const slices = list.map((b: any, i: number) => {
    const val = Number(b[metricKey] || 0)
    const frac = val / total
    const len = frac * c
    const seg = {
      name: b.name,
      count: b.count,
      val,
      pct: Math.round(frac * 100),
      color: palette[i % palette.length],
      dasharray: `${len} ${c - len}`,
      dashoffset: -offset
    }
    offset += len
    return seg
  })
  return { slices, total, c, r, label: useRevenue ? 'ยอดขายจริงตามแบรนด์' : 'มูลค่าพอร์ตสินค้าตามแบรนด์' }
})

const maxCatValue = computed(() =>
  Math.max(...categories.value.map((c: any) => Number(c.stockValue || c.count || 1)), 1)
)

function exportCsv() {
  if (!import.meta.client) return
  const rows = [
    ['Date', 'Orders', 'Revenue_THB'],
    ...daily.value.map((d: any) => [d.date, d.orders, d.revenue])
  ]
  const csv = rows.map((r) => r.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `opwatch-report-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

useHead({ title: 'กราฟรายงานวิเคราะห์ข้อมูล (Visual Analytics) — OPWatch Office' })
</script>

<template>
  <div>
    <div class="erp-page-head">
      <div>
        <div class="erp-kicker">MODULE 7.7 · MULTI-FORMAT VISUAL INTELLIGENCE</div>
        <h1 class="erp-h1">กราฟรายงานในรูปแบบต่างๆ (Visual Reports &amp; BI Charts)</h1>
        <p class="erp-sub">
          วิเคราะห์ข้อมูลหลายมิติ ทั้งกราฟแท่งเปรียบเทียบรายวัน กราฟวงแหวนสัดส่วน 3 แบรนด์ กราฟแนวนอนหมวดหมู่ และ Funnel การจัดส่ง
        </p>
      </div>
      <div style="display:flex;gap:8px">
        <button type="button" class="erp-btn" @click="refresh()">↻ อัปเดตกราฟ</button>
        <button type="button" class="erp-btn erp-btn--primary" @click="exportCsv">⬇ ส่งออกรายงาน CSV</button>
      </div>
    </div>

    <!-- Format 1: Vertical Column / Bar Chart (14-Day Revenue & Orders) -->
    <div class="erp-panel">
      <div class="erp-panel__head">
        <div>
          <div class="erp-panel__title">1. กราฟแท่งเปรียบเทียบยอดขายและคำสั่งซื้อรายวัน (14-Day Column Chart)</div>
          <div style="font-size:12px;color:#7c8fb0">แสดงแนวโน้มรายได้รวม (บาท) และจำนวนออเดอร์ในแต่ละวัน</div>
        </div>
        <span class="erp-chip erp-chip--cyan">รวมสุทธิ {{ fmt(stats?.totals?.revenue || 0) }}</span>
      </div>

      <div class="rep-cols">
        <div v-for="d in barChart" :key="d.date" class="rep-col">
          <div class="rep-col__val">{{ d.revenue > 0 ? '฿' + Math.round(d.revenue / 1000) + 'k' : '0' }}</div>
          <div class="rep-col__track">
            <div class="rep-col__bar" :style="{ height: d.pct + '%', background: d.color }" :title="`${d.label}: ${fmt(d.revenue)} (${d.orders} orders)`" />
          </div>
          <div class="rep-col__lbl">{{ d.label }}</div>
          <div class="rep-col__ord">{{ d.orders }} ออเดอร์</div>
        </div>
      </div>
    </div>

    <!-- Format 2 & 3: SVG Donut Chart (3 Watch Brands) + Horizontal Category Bar Chart -->
    <div style="display:grid;grid-template-columns:1fr 1.25fr;gap:18px" class="rep-split">
      <!-- Format 2: Donut Chart -->
      <div class="erp-panel">
        <div class="erp-panel__head">
          <div class="erp-panel__title">2. กราฟวงแหวนสัดส่วน 3 แบรนด์หลัก (Donut Chart)</div>
          <span class="erp-chip erp-chip--violet">{{ brandDonut.label }}</span>
        </div>

        <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;padding:8px 0">
          <svg width="170" height="170" viewBox="0 0 170 170" style="flex:none">
            <circle cx="85" cy="85" :r="brandDonut.r" fill="none" stroke="#121e36" stroke-width="22" />
            <circle
              v-for="seg in brandDonut.slices"
              :key="seg.name"
              cx="85"
              cy="85"
              :r="brandDonut.r"
              fill="none"
              :stroke="seg.color"
              stroke-width="22"
              :stroke-dasharray="seg.dasharray"
              :stroke-dashoffset="seg.dashoffset"
              transform="rotate(-90 85 85)"
            />
            <text x="85" y="81" text-anchor="middle" fill="#f8fafc" font-size="14" font-weight="700">3 แบรนด์</text>
            <text x="85" y="99" text-anchor="middle" fill="#94a3b8" font-size="10">Official TH</text>
          </svg>

          <div style="flex:1;display:flex;flex-direction:column;gap:10px;min-width:190px">
            <div v-for="seg in brandDonut.slices" :key="seg.name" style="display:flex;justify-content:space-between;align-items:center;font-size:13px">
              <div style="display:flex;align-items:center;gap:8px">
                <span :style="{ width: '10px', height: '10px', borderRadius: '50%', background: seg.color, display: 'inline-block' }" />
                <strong>{{ seg.name }}</strong>
                <span style="color:#64748b;font-size:11.5px">({{ seg.count }} รุ่น)</span>
              </div>
              <span style="font-family:monospace;color:#67e8f9">{{ seg.pct }}% · {{ fmt(seg.val) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Format 3: Horizontal Bar Chart (Categories) -->
      <div class="erp-panel">
        <div class="erp-panel__head">
          <div class="erp-panel__title">3. กราฟแท่งแนวนอนแยกตามหมวดหมู่ (Category Distribution)</div>
          <span class="erp-chip erp-chip--mint">{{ categories.length }} หมวดหมู่</span>
        </div>

        <div style="display:flex;flex-direction:column;gap:11px">
          <div v-for="(cat, idx) in categories" :key="cat.slug" style="display:grid;gap:4px">
            <div style="display:flex;justify-content:space-between;font-size:12.5px">
              <span><strong>{{ cat.name }}</strong> ({{ cat.count }} รุ่น)</span>
              <span style="font-family:monospace;color:#cbd5e1">มูลค่าสต็อก {{ fmt(cat.stockValue) }}</span>
            </div>
            <div style="height:10px;background:#081122;border-radius:999px;overflow:hidden;border:1px solid #182644">
              <div
                :style="{
                  height: '100%',
                  width: Math.max(5, Math.round(((cat.stockValue || cat.count) / maxCatValue) * 100)) + '%',
                  background: palette[idx % palette.length]
                }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Format 4 & 5: Order Conversion Funnel + Payment Mix Cards -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px" class="rep-split">
      <div class="erp-panel">
        <div class="erp-panel__head">
          <div class="erp-panel__title">4. กราฟ Funnel ขั้นตอนการจัดส่งสินค้า (Fulfillment Funnel)</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div
            v-for="(f, i) in funnel"
            :key="f.stage"
            style="padding:10px 14px;border-radius:10px;background:#091326;border:1px solid #1c2d4f;display:flex;justify-content:space-between;align-items:center"
          >
            <div>
              <span class="erp-chip" style="margin-right:8px">#{{ i + 1 }}</span>
              <strong>{{ f.label }}</strong>
            </div>
            <strong style="font-size:16px;color:#67e8f9">{{ f.count }} ออเดอร์</strong>
          </div>
        </div>
      </div>

      <div class="erp-panel">
        <div class="erp-panel__head">
          <div class="erp-panel__title">5. สัดส่วนช่องทางการชำระเงิน (Payment Channel Matrix)</div>
        </div>
        <div v-if="payments.length" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px">
          <div
            v-for="pm in payments"
            :key="pm.method"
            style="padding:14px;border-radius:12px;background:#081020;border:1px solid #1d2d4e"
          >
            <div style="font-size:11px;text-transform:uppercase;color:#94a3b8">{{ pm.method }}</div>
            <div style="font-size:20px;font-weight:700;color:#34d399;margin-top:4px">{{ fmt(pm.revenue) }}</div>
            <div style="font-size:12px;color:#64748b;margin-top:2px">{{ pm.count }} คำสั่งซื้อ</div>
          </div>
        </div>
        <p v-else style="color:#64748b;font-size:13px">ข้อมูลสัดส่วนการชำระเงินจะแสดงทันทีเมื่อมีคำสั่งซื้อ</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rep-cols {
  display: grid;
  grid-template-columns: repeat(14, minmax(42px, 1fr));
  gap: 8px;
  align-items: end;
  padding-top: 10px;
  overflow-x: auto;
}
.rep-col { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.rep-col__val { font-size: 10px; color: #94a3b8; font-family: monospace; }
.rep-col__track {
  width: 100%;
  max-width: 28px;
  height: 150px;
  background: #081122;
  border: 1px solid #182644;
  border-radius: 7px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.rep-col__bar { width: 100%; border-radius: 6px 6px 0 0; transition: height 0.3s ease; }
.rep-col__lbl { font-size: 10px; color: #cbd5e1; white-space: nowrap; }
.rep-col__ord { font-size: 9.5px; color: #64748b; }
@media (max-width: 1024px) {
  .rep-split { grid-template-columns: 1fr !important; }
}
</style>
