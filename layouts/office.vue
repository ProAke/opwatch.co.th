<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const { customer, logout } = useAuth()
const route = useRoute()

const sidebarOpen = ref(false)
const clockText = ref('')

function tickClock() {
  clockText.value = new Date().toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Bangkok'
  })
}

let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  tickClock()
  timer = setInterval(tickClock, 1000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

watch(() => route.fullPath, () => {
  sidebarOpen.value = false
})

const userRole = computed(() => {
  const r = String(customer.value?.role || (customer.value?.isAdmin ? 'admin' : 'member')).toLowerCase()
  if (r === 'ceo') return { code: 'CEO', label: 'ประธานบริหาร (CEO)', cls: 'erp-chip--amber' }
  if (r === 'admin') return { code: 'ADMIN', label: 'ผู้ดูแลระบบ (Admin)', cls: 'erp-chip--cyan' }
  return { code: 'STAFF', label: 'เจ้าหน้าที่ (Staff)', cls: 'erp-chip--mint' }
})

const navGroups = [
  {
    title: 'COMMAND & ANALYTICS',
    items: [
      { to: '/office', exact: true, icon: '◈', label: '7.1 ภาพรวมเว็บไซต์ (Overview)' },
      { to: '/office/reports', icon: '📊', label: '7.7 กราฟรายงาน (Visual Reports)' }
    ]
  },
  {
    title: 'COMMERCE & CATALOGUE',
    items: [
      { to: '/office/products', icon: '⌚', label: '7.2 สินค้า & ดึง Shopee + AI' },
      { to: '/office/orders', icon: '📦', label: '7.4 บริหารคำสั่งซื้อ & พัสดุ' },
      { to: '/office/promotions', icon: '🎁', label: 'โปรโมชั่น · คูปอง · สาขา' },
      { to: '/office/brands', icon: '🏷', label: 'แบรนด์ & หมวดหมู่สินค้า' }
    ]
  },
  {
    title: 'CMS · PEOPLE · SYSTEM',
    items: [
      { to: '/office/pages', icon: '📄', label: '7.3 จัดการหน้าเว็บไซต์ (CMS)' },
      { to: '/office/staff', icon: '👥', label: '7.5 บริหารเจ้าหน้าที่ & สิทธิ์' },
      { to: '/office/settings', icon: '⚙', label: '7.6 ตั้งค่าทั้งหมด & AI API' }
    ]
  }
]

function isActive(item: { to: string; exact?: boolean }) {
  const p = route.path.replace(/^\/(th|en)(?=\/|$)/, '') || '/'
  if (item.exact) return p === item.to
  return p === item.to || p.startsWith(item.to + '/')
}

async function signOut() {
  await logout()
  await navigateTo(localePath('/'))
}
</script>

<template>
  <div class="uarea-erp">
    <!-- Mobile Backdrop -->
    <div v-if="sidebarOpen" class="uarea-backdrop" @click="sidebarOpen = false" />

    <!-- Sidebar (mng.uarea.in Dark Glassmorphic Rail) -->
    <aside class="uarea-side" :class="{ 'is-open': sidebarOpen }">
      <div class="uarea-side__brand">
        <div class="uarea-side__orb">OP</div>
        <div>
          <div class="uarea-side__title">OPWATCH · ERP</div>
          <div class="uarea-side__sub">INTER TIMES MANAGEMENT</div>
        </div>
      </div>

      <!-- Live AI & System Pulse -->
      <div class="uarea-side__pulse">
        <span class="uarea-dot" />
        <span>AI WORKFORCE &amp; ERP ONLINE</span>
      </div>

      <nav class="uarea-side__nav">
        <div v-for="grp in navGroups" :key="grp.title" class="uarea-side__group">
          <div class="uarea-side__gtitle">{{ grp.title }}</div>
          <NuxtLink
            v-for="item in grp.items"
            :key="item.to"
            :to="localePath(item.to)"
            class="uarea-side__link"
            :class="{ 'is-active': isActive(item) }"
          >
            <span class="uarea-side__ico">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </NuxtLink>
        </div>
      </nav>

      <div class="uarea-side__foot">
        <div class="uarea-side__user">
          <div class="uarea-side__avatar">{{ (customer?.name || 'A').slice(0, 1).toUpperCase() }}</div>
          <div style="min-width:0;flex:1">
            <div class="uarea-side__uname">{{ customer?.name || 'Administrator' }}</div>
            <span class="erp-chip" :class="userRole.cls">{{ userRole.code }}</span>
          </div>
        </div>

        <div class="uarea-side__foot-btns">
          <NuxtLink :to="localePath('/')" class="erp-btn erp-btn--sm" style="flex:1;justify-content:center">
            ↗ เปิดหน้าร้าน
          </NuxtLink>
          <button type="button" class="erp-btn erp-btn--sm" @click="signOut">ออก</button>
        </div>
      </div>
    </aside>

    <!-- Main Workspace -->
    <div class="uarea-main">
      <!-- Top Command Bar -->
      <header class="uarea-top">
        <div class="uarea-top__left">
          <button type="button" class="uarea-burger" @click="sidebarOpen = !sidebarOpen">☰</button>
          <div>
            <div class="uarea-top__eyebrow">MNG · ENTERPRISE RESOURCE PLANNING · THAILAND</div>
            <div class="uarea-top__crumb">{{ route.path }}</div>
          </div>
        </div>

        <div class="uarea-top__right">
          <div class="uarea-clock">
            <span class="uarea-dot" />
            <span>BKK {{ clockText || '--:--:--' }} ICT</span>
          </div>
          <NuxtLink :to="localePath('/office/products/new')" class="erp-btn erp-btn--primary erp-btn--sm">
            + เพิ่มสินค้า / ดึง Shopee
          </NuxtLink>
        </div>
      </header>

      <main class="uarea-body">
        <slot />
      </main>
    </div>

    <ToastHost />
  </div>
</template>

<style>
/* Global mng.uarea.in Dark Glassmorphic ERP Design System (Scoped under .uarea-erp) */
.uarea-erp {
  --erp-ink-950: #04070e;
  --erp-ink-900: #070c17;
  --erp-ink-850: #0a1120;
  --erp-ink-800: #0e172a;
  --erp-line: #1b2842;
  --erp-line-bright: #2a3e66;
  --erp-txt: #e8eefc;
  --erp-dim: #93a4c4;
  --erp-mute: #64748b;
  --erp-cyan: #22d3ee;
  --erp-mint: #34d399;
  --erp-violet: #a78bfa;
  --erp-amber: #fbbf24;
  --erp-rose: #fb7185;

  min-height: 100vh;
  display: grid;
  grid-template-columns: 256px minmax(0, 1fr);
  color: var(--erp-txt);
  font-family: 'Prompt', 'Inter', system-ui, sans-serif;
  background:
    radial-gradient(900px 480px at 14% -8%, rgba(34, 211, 238, 0.09), transparent 60%),
    radial-gradient(800px 480px at 92% 4%, rgba(167, 139, 250, 0.08), transparent 60%),
    var(--erp-ink-950);
}

.uarea-side {
  background: linear-gradient(180deg, #060b15 0%, #040811 100%);
  border-right: 1px solid var(--erp-line);
  display: flex;
  flex-direction: column;
  padding: 18px 14px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 50;
}
.uarea-side__brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 4px 6px 14px;
  border-bottom: 1px solid var(--erp-line);
}
.uarea-side__orb {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 14px;
  color: #03111c;
  background: linear-gradient(135deg, #22d3ee, #34d399);
  box-shadow: 0 0 22px rgba(34, 211, 238, 0.35);
}
.uarea-side__title { font-size: 14.5px; font-weight: 800; letter-spacing: 0.08em; color: #f8fafc; }
.uarea-side__sub { font-size: 10px; letter-spacing: 0.14em; color: var(--erp-mute); }

.uarea-side__pulse {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 4px 6px;
  padding: 7px 10px;
  border-radius: 8px;
  background: rgba(34, 211, 238, 0.07);
  border: 1px solid rgba(34, 211, 238, 0.2);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.09em;
  color: #67e8f9;
}
.uarea-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 10px #34d399;
}

.uarea-side__nav { flex: 1; display: flex; flex-direction: column; gap: 14px; margin-top: 10px; }
.uarea-side__gtitle {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--erp-mute);
  padding: 0 8px 5px;
}
.uarea-side__link {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 10px;
  border-radius: 9px;
  font-size: 13px;
  color: var(--erp-dim);
  border: 1px solid transparent;
  transition: all 0.15s ease;
}
.uarea-side__link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.04);
}
.uarea-side__link.is-active {
  color: #ffffff;
  font-weight: 600;
  background: linear-gradient(90deg, rgba(34, 211, 238, 0.16), rgba(52, 211, 153, 0.06));
  border-color: rgba(34, 211, 238, 0.35);
}
.uarea-side__ico { width: 18px; text-align: center; font-size: 14px; }

.uarea-side__foot {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--erp-line);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.uarea-side__user { display: flex; align-items: center; gap: 9px; }
.uarea-side__avatar {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #16243e;
  border: 1px solid #29416b;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #67e8f9;
}
.uarea-side__uname { font-size: 12.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.uarea-side__foot-btns { display: flex; gap: 6px; }

.uarea-main { display: flex; flex-direction: column; min-width: 0; }
.uarea-top {
  height: 62px;
  padding: 0 26px;
  border-bottom: 1px solid var(--erp-line);
  background: rgba(6, 11, 21, 0.82);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 40;
}
.uarea-top__left { display: flex; align-items: center; gap: 12px; }
.uarea-top__eyebrow { font-size: 10px; letter-spacing: 0.16em; color: var(--erp-mute); font-weight: 700; }
.uarea-top__crumb { font-size: 12.5px; color: var(--erp-dim); font-family: ui-monospace, monospace; }
.uarea-top__right { display: flex; align-items: center; gap: 12px; }
.uarea-clock {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 11px;
  border-radius: 999px;
  background: #0a1324;
  border: 1px solid var(--erp-line);
  font-family: ui-monospace, monospace;
  font-size: 11.5px;
  color: #cbd5e1;
}
.uarea-burger {
  display: none;
  background: #0f1b33;
  color: #fff;
  border: 1px solid var(--erp-line);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
}

.uarea-body {
  padding: 26px 28px 60px;
  max-width: 1480px;
  width: 100%;
  margin: 0 auto;
}

/* Reusable ERP UI Primitives */
.erp-page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}
.erp-kicker {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #22d3ee;
}
.erp-h1 {
  font-size: clamp(1.4rem, 2.2vw, 1.85rem);
  font-weight: 700;
  color: #f8fafc;
  margin-top: 2px;
}
.erp-sub { font-size: 13px; color: var(--erp-dim); margin-top: 4px; }

.erp-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(205px, 1fr));
  gap: 14px;
  margin-bottom: 22px;
}
.erp-kpi {
  background: linear-gradient(180deg, rgba(16, 26, 46, 0.92), rgba(9, 15, 28, 0.92));
  border: 1px solid var(--erp-line);
  border-radius: 14px;
  padding: 16px 18px;
  position: relative;
  overflow: hidden;
}
.erp-kpi::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #22d3ee, #34d399, transparent);
}
.erp-kpi__label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--erp-dim); }
.erp-kpi__val { font-size: 25px; font-weight: 700; color: #ffffff; margin-top: 6px; font-variant-numeric: tabular-nums; }
.erp-kpi__meta { font-size: 11.5px; color: var(--erp-mute); margin-top: 4px; }

.erp-panel {
  background: linear-gradient(180deg, rgba(14, 23, 42, 0.9), rgba(8, 14, 26, 0.92));
  border: 1px solid var(--erp-line);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 18px;
}
.erp-panel__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.erp-panel__title { font-size: 15px; font-weight: 700; color: #f1f5f9; }

.erp-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 15px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  background: #111d35;
  border: 1px solid #23365c;
  cursor: pointer;
  transition: all 0.15s ease;
}
.erp-btn:hover { border-color: #38bdf8; color: #ffffff; }
.erp-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.erp-btn--sm { padding: 5px 11px; font-size: 12px; border-radius: 7px; }
.erp-btn--primary {
  background: linear-gradient(135deg, #06b6d4, #10b981);
  color: #02131d;
  border-color: transparent;
  font-weight: 700;
}
.erp-btn--primary:hover { filter: brightness(1.08); color: #02131d; }
.erp-btn--violet {
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  color: #ffffff;
  border-color: transparent;
}
.erp-btn--danger { background: rgba(244, 63, 94, 0.14); color: #fda4af; border-color: rgba(244, 63, 94, 0.35); }

.erp-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(148, 163, 184, 0.14);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.25);
}
.erp-chip--cyan { background: rgba(34, 211, 238, 0.13); color: #67e8f9; border-color: rgba(34, 211, 238, 0.35); }
.erp-chip--mint { background: rgba(52, 211, 153, 0.13); color: #6ee7b7; border-color: rgba(52, 211, 153, 0.35); }
.erp-chip--amber { background: rgba(251, 191, 36, 0.14); color: #fde68a; border-color: rgba(251, 191, 36, 0.35); }
.erp-chip--violet { background: rgba(167, 139, 250, 0.15); color: #ddd6fe; border-color: rgba(167, 139, 250, 0.35); }
.erp-chip--rose { background: rgba(251, 113, 133, 0.14); color: #fecdd3; border-color: rgba(251, 113, 133, 0.35); }

.erp-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.erp-form-grid--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.erp-field { display: flex; flex-direction: column; gap: 5px; }
.erp-label { font-size: 12px; font-weight: 600; color: #9fb0cf; }
.erp-input,
.erp-select,
.erp-textarea {
  width: 100%;
  background: #070e1c;
  color: #f1f5f9;
  border: 1px solid #1e2f4f;
  border-radius: 9px;
  padding: 9px 12px;
  font-size: 13.5px;
  outline: none;
  transition: border-color 0.15s ease;
}
.erp-input:focus,
.erp-select:focus,
.erp-textarea:focus {
  border-color: #22d3ee;
}

.erp-table-wrap { overflow-x: auto; border: 1px solid var(--erp-line); border-radius: 12px; }
.erp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.erp-table th {
  text-align: left;
  padding: 11px 14px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--erp-dim);
  background: #081020;
  border-bottom: 1px solid var(--erp-line);
}
.erp-table td {
  padding: 11px 14px;
  border-bottom: 1px solid rgba(27, 40, 66, 0.7);
  color: #e2e8f0;
  vertical-align: middle;
}
.erp-table tr:hover td { background: rgba(34, 211, 238, 0.04); }

.erp-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 18px;
  padding: 5px;
  background: #070d1a;
  border: 1px solid var(--erp-line);
  border-radius: 11px;
  width: fit-content;
}
.erp-tab {
  padding: 7px 15px;
  border-radius: 8px;
  border: 0;
  background: transparent;
  color: var(--erp-dim);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.erp-tab.is-active {
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(52, 211, 153, 0.15));
  color: #67e8f9;
  border: 1px solid rgba(34, 211, 238, 0.35);
}

.uarea-backdrop {
  display: none;
}

@media (max-width: 980px) {
  .uarea-erp { grid-template-columns: 1fr; }
  .uarea-burger { display: inline-flex; }
  .uarea-side {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 268px;
    transform: translateX(-104%);
    transition: transform 0.22s ease;
  }
  .uarea-side.is-open { transform: translateX(0); }
  .uarea-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    z-index: 45;
  }
  .erp-form-grid,
  .erp-form-grid--3 { grid-template-columns: 1fr; }
}
</style>
