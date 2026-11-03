<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const localePath = useLocalePath()
const { site } = useSite()
const toast = useToast()

const { data: stats, refresh } = await useFetch<any>('/api/admin/stats')
const { data: chatData, refresh: refreshChats } = await useFetch<any>('/api/admin/chats')

const fmt = (v: number) =>
  formatPrice(Number(v || 0), site.value.currencySymbol || '฿', 'th-TH')

const daily = computed(() => stats.value?.dailySeries || [])

// Pure-SVG 14-day Area Path
const areaChart = computed(() => {
  const pts = daily.value
  const w = 680
  const h = 190
  const pad = 20
  if (!pts.length) return { line: '', area: '', dots: [] as any[], max: 0 }
  const vals = pts.map((d: any) => Number(d.revenue || 0))
  const max = Math.max(...vals, 1000)
  const coords = pts.map((d: any, i: number) => {
    const x = pad + (i / Math.max(1, pts.length - 1)) * (w - pad * 2)
    const y = h - pad - (Number(d.revenue || 0) / max) * (h - pad * 2)
    return { x, y, label: d.label, val: Number(d.revenue || 0), orders: d.orders }
  })
  const line = coords.map((c: any, i: number) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
  const area = `${line} L${coords[coords.length - 1].x.toFixed(1)},${h - pad} L${coords[0].x.toFixed(1)},${h - pad} Z`
  return { line, area, dots: coords, max }
})

const replyDrafts = reactive<Record<number, string>>({})

async function sendAdminReply(chatId: number) {
  const txt = (replyDrafts[chatId] || '').trim()
  if (!txt) return
  try {
    await $fetch(`/api/admin/chats/${chatId}`, {
      method: 'PUT',
      body: { reply: txt, status: 'answered' }
    })
    replyDrafts[chatId] = ''
    toast.success('ส่งข้อความตอบกลับลูกค้าเรียบร้อย')
    await refreshChats()
  } catch {
    toast.error('ส่งข้อความไม่สำเร็จ')
  }
}

function statusChip(st: string) {
  if (st === 'completed' || st === 'paid') return 'erp-chip--mint'
  if (st === 'shipped') return 'erp-chip--cyan'
  if (st === 'cancelled') return 'erp-chip--rose'
  return 'erp-chip--amber'
}

useHead({ title: 'ภาพรวมเว็บไซต์ (ERP Overview) — OPWatch Office' })
</script>

<template>
  <div>
    <!-- Header -->
    <div class="erp-page-head">
      <div>
        <div class="erp-kicker">MODULE 7.1 · EXECUTIVE COMMAND CENTER</div>
        <h1 class="erp-h1">รายงานภาพรวมของเว็บไซต์ (Website Overview)</h1>
        <p class="erp-sub">
          ติดตามยอดขาย คำสั่งซื้อ สต็อกนาฬิกา 405+ รุ่น โปรโมชั่น และแชทลูกค้าแบบเรียลไทม์ — บริษัท อินเตอร์ไทมส์ จำกัด
        </p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" class="erp-btn" @click="refresh(); refreshChats()">↻ รีเฟรชข้อมูลสด</button>
        <NuxtLink :to="localePath('/office/reports')" class="erp-btn erp-btn--violet">📊 ดูกราฟรายงานเชิงลึก →</NuxtLink>
      </div>
    </div>

    <!-- 6 Executive KPIs -->
    <div class="erp-kpis">
      <div class="erp-kpi">
        <div class="erp-kpi__label">ยอดขายสุทธิรวม (Total Revenue)</div>
        <div class="erp-kpi__val">{{ fmt(stats?.totals?.revenue || 0) }}</div>
        <div class="erp-kpi__meta">เดือนนี้: {{ fmt(stats?.totals?.monthRevenue || 0) }}</div>
      </div>

      <div class="erp-kpi">
        <div class="erp-kpi__label">คำสั่งซื้อทั้งหมด (Orders)</div>
        <div class="erp-kpi__val">{{ stats?.totals?.orders || 0 }}</div>
        <div class="erp-kpi__meta">รอยืนยัน {{ stats?.totals?.pendingOrders || 0 }} · จัดส่งแล้ว {{ stats?.totals?.shippedOrders || 0 }}</div>
      </div>

      <div class="erp-kpi">
        <div class="erp-kpi__label">สินค้าในแคตตาล็อก (Watches)</div>
        <div class="erp-kpi__val">{{ stats?.totals?.products || 0 }}</div>
        <div class="erp-kpi__meta">เปิดขาย {{ stats?.totals?.activeProducts || 0 }} รุ่น · 3 แบรนด์หลัก</div>
      </div>

      <div class="erp-kpi">
        <div class="erp-kpi__label">แคมเปญ &amp; คูปอง (Promos)</div>
        <div class="erp-kpi__val">{{ (stats?.totals?.promotions || 0) + (stats?.totals?.coupons || 0) }}</div>
        <div class="erp-kpi__meta">แบนเนอร์ {{ stats?.totals?.promotions || 0 }} · คูปอง {{ stats?.totals?.coupons || 0 }}</div>
      </div>

      <div class="erp-kpi">
        <div class="erp-kpi__label">สมาชิก &amp; เจ้าหน้าที่ (Users)</div>
        <div class="erp-kpi__val">{{ (stats?.totals?.customers || 0) + (stats?.totals?.staffCount || 0) }}</div>
        <div class="erp-kpi__meta">ลูกค้า {{ stats?.totals?.customers || 0 }} · เจ้าหน้าที่ {{ stats?.totals?.staffCount || 0 }}</div>
      </div>

      <div class="erp-kpi">
        <div class="erp-kpi__label">แชทลูกค้าหน้าเว็บ (Live Chat)</div>
        <div class="erp-kpi__val">{{ stats?.totals?.openChats || 0 }}</div>
        <div class="erp-kpi__meta">หน้า CMS ทั้งหมด {{ stats?.totals?.pages || 0 }} หน้า</div>
      </div>
    </div>

    <!-- Row 2: 14-Day Revenue SVG Chart + Fulfillment Pipeline -->
    <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:18px;margin-bottom:18px" class="erp-overview-split">
      <div class="erp-panel" style="margin-bottom:0">
        <div class="erp-panel__head">
          <div>
            <div class="erp-panel__title">กราฟแนวโน้มรายได้ 14 วันล่าสุด (Daily Revenue Pulse)</div>
            <div style="font-size:12px;color:#7c8fb0">คำนวณจากคำสั่งซื้อจริงในระบบ (ไม่รวมรายการยกเลิก)</div>
          </div>
          <span class="erp-chip erp-chip--cyan">AOV เฉลี่ย {{ fmt(stats?.totals?.avgOrderValue || 0) }}</span>
        </div>

        <svg viewBox="0 0 680 205" style="width:100%;height:auto;overflow:visible">
          <defs>
            <linearGradient id="erpRevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.38" />
              <stop offset="100%" stop-color="#22d3ee" stop-opacity="0.0" />
            </linearGradient>
          </defs>
          <line x1="20" y1="170" x2="660" y2="170" stroke="#1b2842" stroke-width="1" />
          <path v-if="areaChart.area" :d="areaChart.area" fill="url(#erpRevGrad)" />
          <path v-if="areaChart.line" :d="areaChart.line" fill="none" stroke="#22d3ee" stroke-width="2.5" />
          <g v-for="(d, idx) in areaChart.dots" :key="idx">
            <circle :cx="d.x" :cy="d.y" r="3.6" fill="#34d399" />
            <text v-if="idx % 2 === 0" :x="d.x" y="192" text-anchor="middle" fill="#64748b" font-size="10">
              {{ d.label }}
            </text>
          </g>
        </svg>
      </div>

      <!-- Quick Module Launchpad & Funnel -->
      <div class="erp-panel" style="margin-bottom:0">
        <div class="erp-panel__head">
          <div class="erp-panel__title">สถานะการจัดการคำสั่งซื้อ (Order Pipeline)</div>
          <NuxtLink :to="localePath('/office/orders')" class="erp-btn erp-btn--sm">จัดการทั้งหมด →</NuxtLink>
        </div>

        <div style="display:flex;flex-direction:column;gap:12px">
          <div v-for="f in stats?.funnel || []" :key="f.stage" style="display:grid;gap:4px">
            <div style="display:flex;justify-content:space-between;font-size:12.5px">
              <span>{{ f.label }}</span>
              <strong>{{ f.count }} รายการ</strong>
            </div>
            <div style="height:8px;background:#091121;border-radius:999px;overflow:hidden;border:1px solid #192846">
              <div
                :style="{
                  height: '100%',
                  width: Math.min(100, (f.count / Math.max(1, stats?.totals?.orders || 1)) * 100) + '%',
                  background: f.stage === 'cancelled' ? '#fb7185' : 'linear-gradient(90deg,#22d3ee,#34d399)'
                }"
              />
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px;padding-top:14px;border-top:1px solid #1b2842">
          <NuxtLink :to="localePath('/office/products/new')" class="erp-btn erp-btn--sm">🛍 ดึงสินค้าจาก Shopee</NuxtLink>
          <NuxtLink :to="localePath('/office/promotions')" class="erp-btn erp-btn--sm">🎁 จัดการแบนเนอร์โปรฯ</NuxtLink>
          <NuxtLink :to="localePath('/office/pages')" class="erp-btn erp-btn--sm">📄 แก้ไขหน้า PDPA/CMS</NuxtLink>
          <NuxtLink :to="localePath('/office/staff')" class="erp-btn erp-btn--sm">👥 จัดการสิทธิ์ CEO/Staff</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Row 3: Recent Orders + Low Stock Alerts -->
    <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:18px" class="erp-overview-split">
      <div class="erp-panel">
        <div class="erp-panel__head">
          <div class="erp-panel__title">คำสั่งซื้อล่าสุด (Recent Orders)</div>
          <NuxtLink :to="localePath('/office/orders')" class="erp-btn erp-btn--sm">ดูคำสั่งซื้อทั้งหมด</NuxtLink>
        </div>
        <div class="erp-table-wrap">
          <table class="erp-table">
            <thead>
              <tr>
                <th>เลขที่คำสั่งซื้อ</th>
                <th>ลูกค้า</th>
                <th>ยอดสุทธิ</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in stats?.recentOrders || []" :key="o.id">
                <td style="font-family:monospace;color:#67e8f9">{{ o.orderNo }}</td>
                <td>{{ o.customer?.name || 'ลูกค้าทั่วไป' }}</td>
                <td>{{ fmt(o.total) }}</td>
                <td><span class="erp-chip" :class="statusChip(o.status)">{{ o.status }}</span></td>
                <td>
                  <NuxtLink :to="localePath(`/office/orders/${o.id}`)" class="erp-btn erp-btn--sm">
                    ยืนยัน / ใส่เลขพัสดุ
                  </NuxtLink>
                </td>
              </tr>
              <tr v-if="!(stats?.recentOrders || []).length">
                <td colspan="5" style="text-align:center;color:#64748b;padding:24px">ยังไม่มีคำสั่งซื้อใหม่</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Live Web Chat Inbox + Low Stock -->
      <div class="erp-panel">
        <div class="erp-panel__head">
          <div class="erp-panel__title">💬 แชทลูกค้าล่าสุดจากหน้าเว็บ (Live Concierge Inbox)</div>
        </div>
        <div v-if="(chatData?.items || []).length" style="display:flex;flex-direction:column;gap:10px;max-height:310px;overflow-y:auto">
          <div
            v-for="ch in (chatData?.items || []).slice(0, 5)"
            :key="ch.id"
            style="background:#081020;border:1px solid #1b2a48;border-radius:10px;padding:10px 12px"
          >
            <div style="display:flex;justify-content:space-between;font-size:12px">
              <strong>{{ ch.customerName }} <span style="color:#64748b">{{ ch.customerContact }}</span></strong>
              <span class="erp-chip" :class="ch.status === 'open' ? 'erp-chip--amber' : 'erp-chip--mint'">{{ ch.status }}</span>
            </div>
            <p style="font-size:12.5px;color:#cbd5e1;margin-top:4px">
              {{ ch.message || (ch.messages || [])[ch.messages.length - 1]?.text }}
            </p>
            <p v-if="ch.reply" style="font-size:11.5px;color:#6ee7b7;margin-top:3px">
              ↳ ตอบแล้ว: {{ ch.reply }}
            </p>
            <div style="display:flex;gap:6px;margin-top:8px">
              <input v-model="replyDrafts[ch.id]" class="erp-input" style="padding:5px 8px;font-size:12px" placeholder="พิมพ์ตอบกลับลูกค้า..." />
              <button type="button" class="erp-btn erp-btn--sm erp-btn--primary" @click="sendAdminReply(ch.id)">ตอบ</button>
            </div>
          </div>
        </div>
        <p v-else style="color:#64748b;font-size:13px">ยังไม่มีข้อความแชทใหม่จากหน้าเว็บ</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 1024px) {
  .erp-overview-split { grid-template-columns: 1fr !important; }
}
</style>
