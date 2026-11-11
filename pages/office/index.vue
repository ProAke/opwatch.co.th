<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const officeAuth = useOfficeAuth()
const toast = useToast()

const [{ data: stats, refresh: refreshStats }, { data: chatData, refresh: refreshChats }, { data: aiStatus, refresh: refreshAi }, { data: calData }, { data: shopeeAudit }] =
  await Promise.all([
    useFetch<any>('/api/admin/stats'),
    useFetch<any>('/api/admin/chats'),
    useFetch<any>('/api/admin/ai/status'),
    useFetch<any>('/api/admin/calendar'),
    useFetch<any>('/api/admin/products/shopee-audit', { default: () => null })
  ])

const chartMode = ref<'revenue' | 'orders' | 'bar'>('revenue')
const replyMap = reactive<Record<number, string>>({})
const aiDraftingId = ref<number | null>(null)

// Quick Dispatch AI Modal from Dashboard Strip
const dispatchModal = ref(false)
const activeAgent = ref<any>(null)
const dispatchPrompt = ref('')
const dispatchBusy = ref(false)
const dispatchResult = ref('')

const TH_DOW_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']
const TH_DOW_FULL = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์']
const TH_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']

function d2s(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const todayDate = new Date()
const todayStr = d2s(todayDate)
const todayThaiFull = computed(() => {
  const d = todayDate
  return `${TH_DOW_FULL[d.getDay()]}ที่ ${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`
})

// 7-Day Mini Week Grid (Monday -> Sunday) matched to mng.uarea.in/#/dashboard
const weekDays = computed(() => {
  const base = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())
  const monOffset = -((base.getDay() + 6) % 7)
  const allEvs = calData.value?.items || []
  return Array.from({ length: 7 }, (_, idx) => {
    const dt = new Date(base.getFullYear(), base.getMonth(), base.getDate() + monOffset + idx)
    const ds = d2s(dt)
    const evs = allEvs.filter((e: any) => e.date === ds)
    return {
      ds,
      dow: TH_DOW_SHORT[dt.getDay()],
      dayNum: dt.getDate(),
      isToday: ds === todayStr,
      events: evs.slice(0, 3),
      moreCount: Math.max(0, evs.length - 3)
    }
  })
})

const todayEvents = computed(() => (calData.value?.items || []).filter((e: any) => e.date === todayStr))

// Smooth SVG Bezier / Bar Chart from dailySeries
const chartData = computed(() => {
  const series = (stats.value?.dailySeries || []).slice(-12)
  const W = 560
  const H = 200
  const padL = 36
  const padR = 16
  const padT = 18
  const padB = 28
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  if (!series.length) return { W, H, linePath: '', areaPath: '', points: [], bars: [] }

  const vals = series.map((d: any) =>
    chartMode.value === 'orders' ? Number(d.orders || 0) : Number(d.revenue || 0)
  )
  const maxVal = Math.max(1, ...vals)

  const pts = series.map((d: any, i: number) => {
    const v = vals[i]
    const x = padL + (series.length === 1 ? plotW / 2 : (i / (series.length - 1)) * plotW)
    const y = padT + plotH - (v / maxVal) * plotH
    return {
      x,
      y,
      val: v,
      label: String(d.date || '').slice(5),
      barH: Math.max(4, (v / maxVal) * plotH),
      barY: padT + plotH - Math.max(4, (v / maxVal) * plotH)
    }
  })

  let dPath = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1]
    const p1 = pts[i]
    const cx = ((p0.x + p1.x) / 2).toFixed(1)
    dPath += ` C ${cx},${p0.y.toFixed(1)} ${cx},${p1.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`
  }
  const areaPath = `${dPath} L ${pts[pts.length - 1].x.toFixed(1)},${padT + plotH} L ${pts[0].x.toFixed(1)},${padT + plotH} Z`

  return { W, H, linePath: dPath, areaPath, points: pts, baselineY: padT + plotH }
})

// Order Status Donut (matched to mng.uarea.in .status-split)
const statusDonut = computed(() => {
  const counts = stats.value?.orderStatusCounts || {}
  const segs = [
    { key: 'pending', label: 'รอยืนยัน', count: Number(counts.pending || 0), color: '#FFB020' },
    { key: 'paid', label: 'ชำระแล้ว/กำลังแพ็ก', count: Number(counts.paid || 0) + Number(counts.confirmed || 0) + Number(counts.processing || 0), color: '#3BA7FF' },
    { key: 'shipped', label: 'จัดส่งแล้ว', count: Number(counts.shipped || 0), color: '#6C5CE7' },
    { key: 'completed', label: 'สำเร็จ', count: Number(counts.completed || 0) + Number(counts.delivered || 0), color: '#22C793' },
    { key: 'cancelled', label: 'ยกเลิก', count: Number(counts.cancelled || 0), color: '#FF5C7A' }
  ]
  const total = Math.max(1, segs.reduce((s, x) => s + x.count, 0))
  const C = 2 * Math.PI * 52
  let offset = 0
  const arcs = segs.map((s) => {
    const dash = (s.count / total) * C
    const item = { ...s, dash, gap: C - dash, offset: -offset }
    offset += dash
    return item
  })
  return { total: segs.reduce((s, x) => s + x.count, 0), arcs }
})

function openAgentDispatch(agent: any) {
  activeAgent.value = agent
  dispatchResult.value = ''
  dispatchPrompt.value =
    agent.code === 'OP-PROMO'
      ? 'วางแผนโปรโมชั่นลดราคาประจำเดือนพร้อมข้อความบรอดแคสต์ LINE @opwatch.th'
      : agent.code === 'OP-SEO'
        ? 'สร้างชุดคีย์เวิร์ดและ FAQ สำหรับนาฬิกากระจกแซฟไฟร์ Olym Pianus ของแท้ศูนย์ไทย'
        : 'เขียนแคปชั่นแนะนำคอลเลกชันนาฬิกาหรู Olym Pianus & Ogival ประกันศูนย์ไทย 2 ปี'
  dispatchModal.value = true
}

async function submitAgentDispatch() {
  if (!dispatchPrompt.value.trim()) return
  dispatchBusy.value = true
  try {
    const res = await $fetch<any>('/api/admin/ai/generate', {
      method: 'POST',
      body: {
        task: 'freeform_draft',
        agentCode: activeAgent.value?.code || 'OP-COPY',
        input: { prompt: dispatchPrompt.value, agentCode: activeAgent.value?.code || 'OP-COPY' }
      }
    })
    dispatchResult.value = res?.result?.content || JSON.stringify(res?.result || {}, null, 2)
    await refreshAi()
    toast.success(`✨ ${activeAgent.value?.code} ดำเนินการเสร็จสมบูรณ์`)
  } catch {
    toast.error('ไม่สามารถสั่งงาน AI ได้')
  } finally {
    dispatchBusy.value = false
  }
}

async function draftChatWithAi(c: any) {
  aiDraftingId.value = c.id
  try {
    const res = await $fetch<any>('/api/admin/ai/generate', {
      method: 'POST',
      body: {
        task: 'chat_reply',
        agentCode: 'OP-CARE',
        input: { message: c.message, customerName: c.customerName }
      }
    })
    if (res?.result?.reply) {
      replyMap[c.id] = res.result.reply
      toast.success('✨ AI ร่างคำตอบให้เรียบร้อยแล้ว ตรวจสอบก่อนกดส่งได้เลย')
    }
  } catch {
    toast.error('ร่างคำตอบ AI ไม่สำเร็จ')
  } finally {
    aiDraftingId.value = null
  }
}

async function sendChatReply(chatId: number) {
  const txt = (replyMap[chatId] || '').trim()
  if (!txt) return
  try {
    await $fetch(`/api/admin/chats/${chatId}`, {
      method: 'PUT',
      body: { reply: txt, status: 'replied' }
    })
    toast.success('บันทึกคำตอบแชทลูกค้าแล้ว')
    await refreshChats()
    await refreshStats()
  } catch {
    toast.error('ส่งคำตอบไม่สำเร็จ')
  }
}

function formatPrice(v: number) {
  return `฿${Number(v || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 })}`
}

useHead({ title: 'แดชบอร์ดภาพรวม · OPWatch Smart ERP' })
</script>

<template>
  <div class="mng-dash">
    <!-- Live Shopee `opwatchthailand` Audit & Manual Quick Strip -->
    <div
      v-if="shopeeAudit?.summary"
      style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;padding:14px 18px;border-radius:16px;margin-bottom:16px"
      :style="shopeeAudit.summary.isComplete
        ? 'background:linear-gradient(135deg,#f0fdf8 0%,#ffffff 100%);border:1.5px solid #22c793'
        : 'background:linear-gradient(135deg,#fff6f3 0%,#ffffff 100%);border:1.5px solid #ee4d2d'"
    >
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <span
          style="font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px"
          :style="shopeeAudit.summary.isComplete ? 'background:#d1fae5;color:#065f46' : 'background:#ffedd5;color:#c2410c'"
        >
          {{ shopeeAudit.summary.isComplete ? '✅ Shopee Sync ครบ 100%' : '⚠️ Shopee opwatchthailand ยังมาไม่ครบ' }}
        </span>
        <span style="font-size:13.5px;color:#23264d">
          <template v-if="!shopeeAudit.summary.isComplete">
            เทียบกับ <code>shopee.co.th/opwatchthailand</code> ({{ shopeeAudit.summary.totalItems }} รุ่น): ซิงก์แล้ว <b>{{ shopeeAudit.summary.alreadySyncedCount }}</b> รุ่น ·
            <b style="color:#e11d48">ยังขาดอีก {{ shopeeAudit.summary.missingCount }} รุ่น</b>
            <template v-if="shopeeAudit.summary.needsPromoSyncCount > 0">
              + <b style="color:#d97706">รอโปร {{ shopeeAudit.summary.needsPromoSyncCount }} รุ่น</b>
            </template>
          </template>
          <template v-else>
            ข้อมูลจาก <code>shopee.co.th/opwatchthailand</code> ทั้ง <b>{{ shopeeAudit.summary.totalItems }}/{{ shopeeAudit.summary.totalItems }}</b> ไอเท็ม อยู่ในเว็บไซต์ครบแล้ว!
          </template>
        </span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <NuxtLink
          to="/office/products?shopee=1"
          class="erp-btn erp-btn--sm erp-btn--primary"
          :style="!shopeeAudit.summary.isComplete ? 'background:#ee4d2d;border-color:#ee4d2d' : ''"
        >
          {{ !shopeeAudit.summary.isComplete ? '⚡ เปิดปุ่มดึงข้อมูลเข้าเว็บไซต์ →' : '🛍 ดูรายการเทียบ Shopee' }}
        </NuxtLink>
        <NuxtLink v-if="officeAuth.hasPermission('settings_manage')" to="/office/settings?tab=security" class="erp-btn erp-btn--sm erp-btn--ghost">
          🔐 กำหนดรหัสผ่าน
        </NuxtLink>
        <NuxtLink to="/office/manual" class="erp-btn erp-btn--sm erp-btn--ghost">
          📘 คู่มือระบบจัดการเว็บไซต์
        </NuxtLink>
      </div>
    </div>

    <!-- ROW 1: 4 PlayDigital KPI Cards -->
    <div class="kpi-row">
      <div class="kpi">
        <div class="kpi-top">
          <div class="k-ico" style="background: var(--grad-violet)">
            <OfficeMngIcon name="money" :size="20" />
          </div>
          <span class="k-trend up">เดือนนี้ {{ formatPrice(stats?.totals?.monthRevenue || 0) }}</span>
        </div>
        <div class="k-lbl">ยอดขายสุทธิรวม (Net Revenue)</div>
        <div class="k-val">{{ formatPrice(stats?.totals?.revenue || 0) }}</div>
        <div class="k-sub">เฉลี่ยต่อบิล {{ formatPrice(stats?.totals?.avgOrder || 0) }}</div>
      </div>

      <div class="kpi">
        <div class="kpi-top">
          <div class="k-ico" style="background: var(--grad-amber)">
            <OfficeMngIcon name="truck" :size="20" />
          </div>
          <span class="k-trend" :class="(stats?.totals?.pendingOrders || 0) > 0 ? 'warn' : 'up'">
            รอจัดการ {{ stats?.totals?.pendingOrders || 0 }} บิล
          </span>
        </div>
        <div class="k-lbl">คำสั่งซื้อทั้งหมด</div>
        <div class="k-val">{{ stats?.totals?.orders || 0 }} <small>รายการ</small></div>
        <div class="k-sub">จัดส่งแล้ว {{ stats?.totals?.shippedOrders || 0 }} · แชทรอตอบ {{ stats?.totals?.openChats || 0 }}</div>
      </div>

      <div class="kpi">
        <div class="kpi-top">
          <div class="k-ico" style="background: var(--grad-cyan)">
            <OfficeMngIcon name="watch" :size="20" />
          </div>
          <span class="k-trend up">3 แบรนด์ทางการ</span>
        </div>
        <div class="k-lbl">คลังนาฬิกาพร้อมจำหน่าย</div>
        <div class="k-val">{{ (stats?.totals?.activeProducts || 0).toLocaleString() }} <small>รุ่น</small></div>
        <div class="k-sub">โปรโมชั่น {{ stats?.totals?.promotions || 0 }} แคมเปญ · คูปอง {{ stats?.totals?.coupons || 0 }} โค้ด</div>
      </div>

      <div class="kpi">
        <div class="kpi-top">
          <div class="k-ico" style="background: var(--grad-mint)">
            <OfficeMngIcon name="bot" :size="20" />
          </div>
          <span class="k-trend up">{{ aiStatus?.hasExternalKey ? aiStatus.provider.toUpperCase() : 'AI READY' }}</span>
        </div>
        <div class="k-lbl">AI Workforce &amp; ปฏิทินงาน</div>
        <div class="k-val">{{ aiStatus?.agents?.length || 5 }} <small>Agents</small></div>
        <div class="k-sub">ประมวลผลแล้ว {{ aiStatus?.telemetry?.totalRuns || 0 }} งาน · นัดหมาย {{ calData?.items?.length || 0 }} รายการ</div>
      </div>
    </div>

    <!-- ROW 2: AI Workforce Live Strip (exact mng.uarea.in .ai-live-banner) -->
    <div class="card ai-live-banner">
      <div class="ai-live-hd">
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap">
          <span class="ai-pulse-dot" />
          <b>🤖 AI กำลังทำงาน (AI Content &amp; Image Studio)</b>
          <span class="badge b-purple">{{ aiStatus?.model || 'Horology AI Engine' }}</span>
          <small style="color: var(--muted)">คลิกที่ Agent เพื่อสั่งสร้างเนื้อหา แคปชั่น SEO หรือแผนโปรโมชั่นได้ทันที</small>
        </div>
        <div style="display: flex; gap: 8px">
          <NuxtLink to="/office/products" class="erp-btn erp-btn--ghost erp-btn--sm">📸 ปรับภาพอัตโนมัติ</NuxtLink>
          <NuxtLink to="/office/ai" class="erp-btn erp-btn--primary erp-btn--sm">เปิดศูนย์ AI Hub →</NuxtLink>
        </div>
      </div>

      <div class="ai-live-strip">
        <button
          v-for="ag in aiStatus?.agents || []"
          :key="ag.code"
          type="button"
          class="ai-strip-item is-live"
          @click="openAgentDispatch(ag)"
        >
          <div class="ai-av" :style="{ background: ag.color }">{{ ag.avatar }}</div>
          <div class="ai-info">
            <div class="ai-name">
              <b>{{ ag.code }}</b>
              <span class="ai-role-pill">⚡ สั่งงาน</span>
            </div>
            <div class="ai-cur-task">{{ ag.lastTask }}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- ROW 3: Urgent Orders & Chat + Smooth SVG Revenue/Order Trend -->
    <div class="dash-grid-2">
      <!-- Left: Recent Orders & Customer Chat -->
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">📦 คำสั่งซื้อล่าสุด &amp; แชทลูกค้า</div>
            <div class="card-sub">คลิกที่บิลเพื่ออัปเดตสถานะ / เลขพัสดุ หรือกดให้ AI ช่วยร่างคำตอบแชท</div>
          </div>
          <NuxtLink to="/office/orders" class="erp-btn erp-btn--ghost erp-btn--sm">ดูทั้งหมด →</NuxtLink>
        </div>

        <div v-if="(stats?.recentOrders || []).length" class="urgent-list">
          <NuxtLink
            v-for="ord in (stats?.recentOrders || []).slice(0, 5)"
            :key="ord.id"
            :to="`/office/orders/${ord.id}`"
            class="urgent-row"
          >
            <span
              class="u-dot"
              :style="{
                background:
                  ord.status === 'pending' ? 'var(--amber)' : ord.status === 'cancelled' ? 'var(--red)' : 'var(--mint)'
              }"
            />
            <div class="u-main">
              <b>{{ ord.orderNo }} · {{ ord.customerName || ord.customer?.name || 'ลูกค้าทั่วไป' }}</b>
              <small>
                {{ ord.pickupBranch ? `🏬 รับที่สาขา ${ord.pickupBranch}` : '🚚 จัดส่งถึงบ้าน' }}
                <span v-if="ord.giftWrap"> · 🎁 ห่อของขวัญ</span>
              </small>
            </div>
            <strong style="font-family: 'JetBrains Mono', monospace; color: var(--violet)">
              {{ formatPrice(ord.total) }}
            </strong>
            <span
              class="badge"
              :class="ord.status === 'pending' ? 'b-yellow' : ord.status === 'cancelled' ? 'b-red' : 'b-green'"
            >
              {{ ord.status }}
            </span>
          </NuxtLink>
        </div>
        <div v-else style="padding: 18px; text-align: center; color: var(--muted)">
          ยังไม่มีคำสั่งซื้อใหม่ในขณะนี้ — ระบบตะกร้าและคูปองพร้อมรับออร์เดอร์แล้ว
        </div>

        <!-- Quick Live Chat Inbox with AI Draft Button -->
        <div v-if="(chatData?.items || []).length" style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--line)">
          <div style="font-size: 13px; font-weight: 700; margin-bottom: 8px; display: flex; justify-content: space-between">
            <span>💬 ข้อความแชทจากหน้าเว็บล่าสุด</span>
            <span class="badge b-purple">AI ช่วยตอบได้</span>
          </div>
          <div v-for="c in (chatData?.items || []).slice(0, 2)" :key="c.id" class="chat-quick-box">
            <div style="display: flex; justify-content: space-between; gap: 8px">
              <b>{{ c.customerName || 'ลูกค้าหน้าเว็บ' }} <small style="color: var(--muted)">({{ c.customerContact || 'Web' }})</small></b>
              <button
                type="button"
                class="erp-btn erp-btn--ghost erp-btn--sm"
                :disabled="aiDraftingId === c.id"
                @click="draftChatWithAi(c)"
              >
                {{ aiDraftingId === c.id ? 'กำลังร่าง...' : '✨ AI ร่างคำตอบ' }}
              </button>
            </div>
            <p style="margin: 5px 0 8px; font-size: 12.5px; color: var(--ink-2)">“{{ c.message }}”</p>
            <div style="display: flex; gap: 6px">
              <input
                v-model="replyMap[c.id]"
                class="erp-input"
                :placeholder="c.reply ? `ตอบแล้ว: ${c.reply}` : 'พิมพ์ข้อความตอบกลับ หรือกด ✨ AI ร่างคำตอบ...'"
              />
              <button type="button" class="erp-btn erp-btn--primary erp-btn--sm" @click="sendChatReply(c.id)">ส่ง</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Smooth Cubic-Bezier SVG Chart (exact mng.uarea.in style) -->
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">📈 แนวโน้มยอดขาย &amp; คำสั่งซื้อรายวัน</div>
            <div class="card-sub">ข้อมูลจริงจากธุรกรรมบนเว็บไซต์ opwatch.co.th</div>
          </div>
          <div class="chart-tabs">
            <button type="button" :class="{ on: chartMode === 'revenue' }" @click="chartMode = 'revenue'">ยอดขาย (฿)</button>
            <button type="button" :class="{ on: chartMode === 'orders' }" @click="chartMode = 'orders'">จำนวนบิล</button>
            <button type="button" :class="{ on: chartMode === 'bar' }" @click="chartMode = 'bar'">กราฟแท่ง</button>
          </div>
        </div>

        <svg :viewBox="`0 0 ${chartData.W} ${chartData.H}`" class="mng-svg-chart">
          <defs>
            <linearGradient id="mngAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#6c5ce7" stop-opacity="0.28" />
              <stop offset="100%" stop-color="#6c5ce7" stop-opacity="0.01" />
            </linearGradient>
          </defs>
          <line :x1="36" :y1="chartData.baselineY" :x2="chartData.W - 16" :y2="chartData.baselineY" stroke="#e9ebf6" stroke-width="1" />

          <template v-if="chartMode === 'bar'">
            <g v-for="(pt, idx) in chartData.points" :key="idx">
              <rect
                :x="pt.x - 12"
                :y="pt.barY"
                width="24"
                :height="pt.barH"
                rx="6"
                fill="url(#mngAreaGrad)"
                stroke="#6c5ce7"
                stroke-width="1.5"
              />
              <text :x="pt.x" :y="chartData.H - 8" text-anchor="middle" font-size="10" fill="#8a8fb1">{{ pt.label }}</text>
            </g>
          </template>
          <template v-else-if="chartData.points.length">
            <path :d="chartData.areaPath" fill="url(#mngAreaGrad)" />
            <path :d="chartData.linePath" fill="none" stroke="#6c5ce7" stroke-width="2.8" stroke-linecap="round" />
            <g v-for="(pt, idx) in chartData.points" :key="idx">
              <circle :cx="pt.x" :cy="pt.y" r="4.2" fill="#ffffff" stroke="#6c5ce7" stroke-width="2.4">
                <title>{{ pt.label }}: {{ chartMode === 'orders' ? `${pt.val} บิล` : formatPrice(pt.val) }}</title>
              </circle>
              <text :x="pt.x" :y="chartData.H - 8" text-anchor="middle" font-size="10" fill="#8a8fb1">{{ pt.label }}</text>
            </g>
          </template>
        </svg>

        <div class="mng-chart-foot">
          <div><span>ยอดขายรวม</span><b>{{ formatPrice(stats?.totals?.revenue || 0) }}</b></div>
          <div><span>คำสั่งซื้อสำเร็จ</span><b>{{ stats?.totals?.validOrders || 0 }} บิล</b></div>
          <div><span>สมาชิกสะสมแต้ม</span><b>{{ stats?.totals?.customers || 0 }} ท่าน</b></div>
        </div>
      </div>
    </div>

    <!-- ROW 4: 3 Gradient Featured Brand Cards (exact mng.uarea.in .feat-row) -->
    <div class="feat-row">
      <NuxtLink
        v-for="(b, idx) in (stats?.brandBreakdown || []).slice(0, 3)"
        :key="b.slug"
        :to="`/office/products?brand=${b.slug}`"
        class="feat-card"
        :class="['g-purple', 'g-blue', 'g-green'][idx % 3]"
      >
        <div class="fc-top">
          <span class="fc-tag">OFFICIAL SOLE DISTRIBUTOR</span>
          <span class="fc-cnt">{{ b.catalogCount }} รุ่น</span>
        </div>
        <h3>{{ b.name }}</h3>
        <p>มูลค่าคลังสินค้าพร้อมขาย {{ formatPrice(b.stockValue) }} · ยอดขายสะสม {{ formatPrice(b.revenue) }}</p>
        <div class="fc-prog">
          <i :style="{ width: `${Math.min(100, Math.round((b.catalogCount / Math.max(1, stats?.totals?.products || 1)) * 100) + 18)}%` }" />
        </div>
      </NuxtLink>
    </div>

    <!-- ROW 5: ปฏิทินสัปดาห์นี้ (Mini Week 7-Day Grid) + Status Donut -->
    <div class="dash-grid-2">
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">📅 ปฏิทินสัปดาห์นี้ (Weekly Campaign &amp; Task Schedule)</div>
            <div class="card-sub">เชื่อมต่อกับโปรโมชั่น คูปอง และตารางงานทีมอินเตอร์ไทมส์อัตโนมัติ</div>
          </div>
          <NuxtLink to="/office/calendar" class="erp-btn erp-btn--primary erp-btn--sm">เปิดปฏิทินเต็มจอ →</NuxtLink>
        </div>

        <div class="pd-week-grid">
          <NuxtLink
            v-for="wd in weekDays"
            :key="wd.ds"
            to="/office/calendar"
            class="pd-wday"
            :class="{ 'is-today': wd.isToday }"
          >
            <div class="pd-wday-hd">
              <span>{{ wd.dow }}</span>
              <b>{{ wd.dayNum }}</b>
            </div>
            <div class="pd-wday-evs">
              <div
                v-for="ev in wd.events"
                :key="ev.uid"
                class="pd-wev"
                :class="`cat-${ev.cat}`"
                :title="ev.title"
              >
                {{ ev.title }}
              </div>
              <div v-if="!wd.events.length" class="pd-wempty">— ว่าง —</div>
              <small v-if="wd.moreCount > 0" style="color: var(--violet); font-size: 10px">+{{ wd.moreCount }} รายการ</small>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Status Split Donut -->
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">🎯 สัดส่วนสถานะคำสั่งซื้อ</div>
            <div class="card-sub">ภาพรวมการดำเนินงานจัดส่งทั้งหมด</div>
          </div>
          <NuxtLink to="/office/reports" class="erp-btn erp-btn--ghost erp-btn--sm">ดูรายงานละเอียด</NuxtLink>
        </div>

        <div class="status-split">
          <svg viewBox="0 0 140 140" class="mng-donut">
            <circle cx="70" cy="70" r="52" fill="none" stroke="#eef0f8" stroke-width="16" />
            <circle
              v-for="arc in statusDonut.arcs"
              :key="arc.key"
              cx="70"
              cy="70"
              r="52"
              fill="none"
              :stroke="arc.color"
              stroke-width="16"
              :stroke-dasharray="`${arc.dash} ${arc.gap}`"
              :stroke-dashoffset="arc.offset"
              transform="rotate(-90 70 70)"
            />
            <text x="70" y="67" text-anchor="middle" font-size="22" font-weight="700" fill="#23264d">
              {{ statusDonut.total }}
            </text>
            <text x="70" y="84" text-anchor="middle" font-size="10.5" fill="#8a8fb1">คำสั่งซื้อรวม</text>
          </svg>

          <div class="donut-legend">
            <div v-for="arc in statusDonut.arcs" :key="arc.key" class="dl-row">
              <span><i :style="{ background: arc.color }" /> {{ arc.label }}</span>
              <b>{{ arc.count }}</b>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ROW 6: Bottom Today Dock (exact mng.uarea.in .today-dock) -->
    <div class="today-dock">
      <span class="td-badge">วันนี้</span>
      <span class="td-date">{{ todayThaiFull }}</span>
      <div class="td-items">
        <template v-if="todayEvents.length">
          <NuxtLink
            v-for="ev in todayEvents.slice(0, 3)"
            :key="ev.uid"
            to="/office/calendar"
            class="td-pill"
          >
            <i>•</i>
            <span>{{ ev.allday ? 'ตลอดวัน' : ev.startTime }} · {{ ev.title }}</span>
          </NuxtLink>
        </template>
        <span v-else style="color: var(--muted); font-size: 12.5px">วันนี้ไม่มีงานค้างเร่งด่วน — พร้อมลุยแคมเปญใหม่!</span>
      </div>
      <div style="display: flex; gap: 8px; flex-shrink: 0">
        <NuxtLink to="/office/calendar?new=1" class="erp-btn erp-btn--ghost erp-btn--sm">+ เพิ่มนัดหมาย</NuxtLink>
        <NuxtLink to="/office/calendar" class="erp-btn erp-btn--primary erp-btn--sm">เปิดปฏิทิน</NuxtLink>
      </div>
    </div>

    <!-- Agent Dispatch Modal -->
    <div v-if="dispatchModal && activeAgent" class="erp-modal-backdrop" @click.self="dispatchModal = false">
      <div class="erp-modal" style="max-width: 640px">
        <div class="erp-card__head">
          <div style="display: flex; align-items: center; gap: 10px">
            <span class="ai-av" :style="{ background: activeAgent.color }">{{ activeAgent.avatar }}</span>
            <div>
              <div class="erp-card__title">⚡ สั่งงาน {{ activeAgent.code }} — {{ activeAgent.name }}</div>
              <div class="erp-card__sub">{{ activeAgent.role }}</div>
            </div>
          </div>
          <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="dispatchModal = false">✕</button>
        </div>

        <div class="erp-field">
          <label class="erp-label">รายละเอียดคำสั่งที่ต้องการให้ {{ activeAgent.code }} ดำเนินการ</label>
          <textarea v-model="dispatchPrompt" rows="3" class="erp-textarea" />
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px">
          <button type="button" class="erp-btn erp-btn--ghost" @click="dispatchModal = false">ปิด</button>
          <button type="button" class="erp-btn erp-btn--primary" :disabled="dispatchBusy" @click="submitAgentDispatch">
            {{ dispatchBusy ? 'กำลังประมวลผล...' : `✨ สั่งงาน ${activeAgent.code}` }}
          </button>
        </div>

        <div v-if="dispatchResult" class="mng-ai-out">
          <pre>{{ dispatchResult }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mng-dash {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}
.k-ico {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  color: #ffffff;
  display: grid;
  place-items: center;
  box-shadow: 0 6px 14px rgba(108, 92, 231, 0.2);
}
.k-trend {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--violet-soft);
  color: var(--violet);
}
.k-trend.up { background: var(--mint-soft); color: #0e9f6e; }
.k-trend.warn { background: var(--yellow-soft); color: #b45309; }
.k-lbl { font-size: 12.5px; color: var(--muted); font-weight: 500; }
.k-val {
  font-size: 26px;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.02em;
  margin: 2px 0;
}
.k-val small { font-size: 13px; font-weight: 500; color: var(--muted); }
.k-sub { font-size: 11.5px; color: var(--ink-2); }

/* AI Live Banner */
.ai-live-banner {
  background: linear-gradient(135deg, #ffffff 0%, #f7f5ff 100%);
  border-color: #dfd9fb;
}
.ai-live-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.ai-pulse-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--mint);
  box-shadow: 0 0 0 4px rgba(34, 199, 147, 0.22);
}
.ai-live-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 10px;
}
.ai-strip-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid var(--line);
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.ai-strip-item:hover {
  border-color: var(--violet);
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
}
.ai-av {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  font-size: 18px;
  flex-shrink: 0;
  color: #ffffff;
}
.ai-info { min-width: 0; flex: 1; }
.ai-name { display: flex; align-items: center; justify-content: space-between; gap: 6px; font-size: 12.5px; color: var(--ink); }
.ai-role-pill { font-size: 10px; padding: 1px 7px; border-radius: 999px; background: var(--violet-soft); color: var(--violet); font-weight: 600; }
.ai-cur-task {
  font-size: 11px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

/* 2-Col Dashboard Grid */
.dash-grid-2 {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 18px;
}
.urgent-list { display: flex; flex-direction: column; gap: 8px; }
.urgent-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--bg);
  border: 1px solid var(--line);
  text-decoration: none;
  color: var(--ink);
  transition: all 0.14s ease;
}
.urgent-row:hover { background: var(--violet-soft); border-color: #d3cdfb; }
.u-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.u-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.u-main b { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.u-main small { font-size: 11px; color: var(--muted); }

.chat-quick-box {
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--bg);
  border: 1px solid var(--line);
  margin-bottom: 8px;
}

.chart-tabs {
  display: inline-flex;
  background: var(--panel);
  border: 1px solid var(--line);
  padding: 3px;
  border-radius: 10px;
  gap: 3px;
}
.chart-tabs button {
  border: 0;
  background: transparent;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--ink-2);
  font-family: inherit;
  cursor: pointer;
}
.chart-tabs button.on { background: #ffffff; color: var(--violet); box-shadow: var(--shadow-sm); }
.mng-svg-chart { width: 100%; height: auto; max-height: 220px; display: block; }
.mng-chart-foot {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
}
.mng-chart-foot span { display: block; font-size: 11px; color: var(--muted); }
.mng-chart-foot b { font-size: 15px; color: var(--ink); }

/* 3 Gradient Featured Cards */
.feat-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.feat-card {
  padding: 20px 22px;
  border-radius: 18px;
  color: #ffffff;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  box-shadow: 0 12px 26px rgba(60, 52, 140, 0.14);
  transition: transform 0.16s ease;
}
.feat-card:hover { transform: translateY(-3px); }
.feat-card.g-purple { background: var(--grad-violet); }
.feat-card.g-blue { background: var(--grad-cyan); }
.feat-card.g-green { background: var(--grad-mint); }
.fc-top { display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; letter-spacing: 0.06em; opacity: 0.92; }
.feat-card h3 { margin: 8px 0 4px; font-size: 19px; font-weight: 700; }
.feat-card p { margin: 0 0 14px; font-size: 12px; opacity: 0.92; }
.fc-prog { height: 6px; border-radius: 999px; background: rgba(255, 255, 255, 0.25); overflow: hidden; }
.fc-prog i { display: block; height: 100%; border-radius: 999px; background: #ffffff; }

/* Weekly Calendar Strip */
.pd-week-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
}
.pd-wday {
  border: 1px solid var(--line);
  border-radius: 13px;
  padding: 9px 7px;
  background: var(--bg);
  text-decoration: none;
  color: var(--ink);
  min-height: 124px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pd-wday.is-today {
  background: #ffffff;
  border-color: var(--violet);
  box-shadow: 0 0 0 3px var(--violet-soft);
}
.pd-wday-hd { display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; }
.pd-wday-hd span { color: var(--muted); }
.pd-wday.is-today .pd-wday-hd b {
  background: var(--violet);
  color: #ffffff;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 11px;
}
.pd-wday-evs { display: flex; flex-direction: column; gap: 4px; }
.pd-wev {
  font-size: 10.5px;
  padding: 3px 6px;
  border-radius: 6px;
  background: var(--violet-soft);
  color: var(--violet);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}
.pd-wev.cat-order { background: var(--yellow-soft); color: #b45309; }
.pd-wev.cat-meeting { background: var(--blue-soft); color: #2f7bf0; }
.pd-wev.cat-deadline { background: var(--red-soft); color: #e11d48; }
.pd-wev.cat-ai { background: var(--mint-soft); color: #0e9f6e; }
.pd-wempty { font-size: 10.5px; color: var(--muted); text-align: center; margin-top: 16px; }

/* Donut Split */
.status-split {
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 8px 0;
}
.mng-donut { width: 148px; height: 148px; flex-shrink: 0; }
.donut-legend { flex: 1; display: flex; flex-direction: column; gap: 9px; }
.dl-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
.dl-row span { display: inline-flex; align-items: center; gap: 8px; color: var(--ink-2); }
.dl-row i { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }

/* Bottom Today Dock */
.today-dock {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  padding: 14px 18px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid var(--line);
  box-shadow: var(--shadow-soft);
}
.td-badge {
  padding: 4px 11px;
  border-radius: 999px;
  background: var(--grad-violet);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
}
.td-date { font-weight: 700; color: var(--ink); font-size: 13.5px; }
.td-items { flex: 1; display: flex; gap: 8px; flex-wrap: wrap; min-width: 200px; }
.td-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  border-radius: 999px;
  background: var(--panel);
  border: 1px solid var(--line);
  color: var(--ink-2);
  font-size: 12px;
  text-decoration: none;
}
.td-pill:hover { border-color: var(--violet); color: var(--violet); }
.td-pill i { color: var(--violet); font-style: normal; font-weight: 900; }

@media (max-width: 1120px) {
  .dash-grid-2 { grid-template-columns: 1fr; }
  .feat-row { grid-template-columns: 1fr; }
  .pd-week-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .pd-week-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .status-split { flex-direction: column; }
}
</style>
