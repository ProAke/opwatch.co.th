<script setup lang="ts">
const officeAuth = useOfficeAuth()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const menuFilter = ref('')

// Global Search (⌘K)
const searchQ = ref('')
const searchFocused = ref(false)
const searchInputEl = ref<HTMLInputElement | null>(null)

// Pomodoro Focus Timer (matched to mng.uarea.in topbar)
const pomoRunning = ref(false)
const pomoSec = ref(25 * 60)
let pomoTimer: any = null

// Quick AI Dispatch Modal (accessible from any /office page)
const quickAiOpen = ref(false)
const quickAiAgent = ref('OP-COPY')
const quickAiPrompt = ref('')
const quickAiLoading = ref(false)
const quickAiOutput = ref('')

// Self-Service Password Change Modal (accessible for all 5 back-office roles)
const pwModalOpen = ref(false)
const pwSaving = ref(false)
const pwForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

async function submitMyPassword() {
  if (!pwForm.currentPassword.trim()) {
    toast.error('กรุณากรอกรหัสผ่านปัจจุบัน')
    return
  }
  if (pwForm.newPassword.trim().length < 6) {
    toast.error('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร')
    return
  }
  if (pwForm.newPassword.trim() !== pwForm.confirmPassword.trim()) {
    toast.error('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน')
    return
  }
  pwSaving.value = true
  try {
    await $fetch('/api/office/auth/password', {
      method: 'POST',
      body: {
        currentPassword: pwForm.currentPassword.trim(),
        newPassword: pwForm.newPassword.trim()
      }
    })
    pwModalOpen.value = false
    pwForm.currentPassword = ''
    pwForm.newPassword = ''
    pwForm.confirmPassword = ''
    toast.success('เปลี่ยนรหัสผ่านของคุณเรียบร้อยแล้ว!')
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
  } finally {
    pwSaving.value = false
  }
}

// Notifications Popover
const notifOpen = ref(false)

// Live Workspace Summary (for sidebar badges, global search & theme color)
const { data: shellStats, refresh: refreshShellStats } = await useFetch<any>('/api/admin/stats', {
  default: () => null
})
const { data: shellSettings } = await useFetch<any>('/api/admin/settings', {
  default: () => null
})

const themeAccent = computed(() => shellSettings.value?.site?.erpThemeColor || '#6C5CE7')

const navSections = computed(() => {
  const pendingOrders = Number(shellStats.value?.totals?.pendingOrders || 0)
  const eventCount = Number(shellStats.value?.totals?.events || 0)
  const openChats = Number(shellStats.value?.totals?.openChats || 0)
  const warrantyCount =
    Number(shellStats.value?.totals?.openRepairs || 0) +
    Number(shellStats.value?.totals?.pendingWarranties || 0)
  const role = officeAuth.role.value || 'ceo'
  const isDealer = role === 'dealer'
  const can = (p: string | string[]) => officeAuth.hasPermission(p)

  const raw = [
    {
      group: 'WORKSPACE & AI',
      groupTh: isDealer ? 'พอร์ทัลตัวแทนจำหน่าย' : 'ภาพรวม & ระบบอัจฉริยะ',
      items: [
        can('dashboard') && { to: '/office', label: 'แดชบอร์ดภาพรวม', sub: 'KPI · กราฟ · AI สด', icon: 'dash', exact: true, tone: 'violet' },
        can('calendar') && { to: '/office/calendar', label: 'ปฏิทินงาน & แคมเปญ', sub: 'เดือน · สัปดาห์ · วัน · กำหนดการ', icon: 'cal', tone: 'blue', badge: eventCount || undefined },
        can('ai') && { to: '/office/ai', label: 'AI Workforce & เชื่อมต่อ', sub: 'OpenRouter · Gemini · Hermes', icon: 'bot', tone: 'pink', badge: 'LIVE', badgeTone: 'mint' },
        can('reports') && { to: '/office/reports', label: 'รายงานผู้บริหาร', sub: 'วิเคราะห์ยอดขาย · Export CSV', icon: 'report', tone: 'mint' }
      ].filter(Boolean) as any[]
    },
    {
      group: 'COMMERCE & WAREHOUSE',
      groupTh: isDealer ? 'ราคาตัวแทน · คลังตัวเอง · รับหน้าร้าน' : 'คลัง 5 ช่องทาง · สินค้า · การขาย',
      items: [
        can(['warehouse', 'warehouse_5ch', 'warehouse_dealer', 'dealer_portal']) && {
          to: '/office/warehouse',
          label: isDealer ? 'พอร์ทัล & คลังสินค้าตัวแทน' : 'คลังสินค้า 5 ช่องทาง',
          sub: isDealer ? 'ราคาตัวแทน · สต็อกร้าน · รับหน้าร้าน' : 'Web · Shopee · Lazada · TikTok · ตัวแทน',
          icon: 'warehouse',
          tone: 'mint',
          badge: isDealer ? 'DEALER' : '5CH',
          badgeTone: 'mint'
        },
        can(['products_view', 'products_retail', 'products_stock', 'products_dealer']) && {
          to: '/office/products',
          label: isDealer ? 'แคตตาล็อกราคาตัวแทน' : 'สินค้า & ปรับภาพอัตโนมัติ',
          sub: isDealer ? 'ราคาส่งตัวแทน · สเปกนาฬิกา' : 'ราคาขาย · Shopee Sync · SEO',
          icon: 'watch',
          tone: 'violet'
        },
        can(['orders', 'orders_fulfill', 'orders_pickup']) && {
          to: '/office/orders',
          label: isDealer ? 'การรับสินค้าหน้าร้าน' : 'คำสั่งซื้อ & การส่งสินค้า',
          sub: isDealer ? 'Click & Collect ประจำสาขา/ร้าน' : 'จัดส่งสินค้า · เลขพัสดุ · แชท',
          icon: 'truck',
          tone: 'amber',
          badge: !isDealer && (pendingOrders + openChats) ? (pendingOrders + openChats) : undefined,
          badgeTone: 'amber'
        },
        can(['promotions', 'promotions_view']) && {
          to: '/office/promotions',
          label: isDealer ? 'โปรโมชั่น & แคมเปญแบรนด์' : 'โปรโมชั่น · คูปอง · สาขา',
          sub: isDealer ? 'สิทธิพิเศษและสื่อส่งเสริมการขาย' : 'แคมเปญหน้าแรก · โค้ดลด',
          icon: 'tag',
          tone: 'pink'
        },
        can('warranty') && {
          to: '/office/warranty',
          label: 'แจ้งซ่อม & ลงทะเบียนประกัน',
          sub: 'E-Warranty · งานซ่อมออนไลน์',
          icon: 'wrench',
          tone: 'blue',
          badge: warrantyCount || undefined,
          badgeTone: 'amber'
        },
        can('customers') && {
          to: '/office/customers',
          label: 'ข้อมูลสมาชิกและลูกค้า',
          sub: 'สมาชิกหน้าเว็บ · แต้ม OP Point',
          icon: 'client',
          tone: 'mint'
        },
        can('brands') && {
          to: '/office/brands',
          label: 'แบรนด์ & หมวดหมู่',
          sub: 'Olym Pianus · Ogival · ซีรีส์',
          icon: 'proj',
          tone: 'blue'
        }
      ].filter(Boolean) as any[]
    },
    {
      group: 'TREE CMS & GOVERNANCE',
      groupTh: 'โครงสร้างเว็บ Tree · เจ้าหน้าที่ · ตั้งค่า',
      items: [
        can('pages') && {
          to: '/office/reviews',
          label: 'บทความ & รีวิวสินค้า',
          sub: 'รีวิวเจาะลึก · AI เขียนรีวิว · รีวิวลูกค้า',
          icon: 'doc',
          tone: 'mint',
          badge: 'NEW',
          badgeTone: 'mint'
        },
        can('pages') && {
          to: '/office/pages',
          label: 'เนื้อหาเว็บ (Tree Menu CMS)',
          sub: 'หน้ากั้นแบรนด์ · Story ซีรีส์ · AI',
          icon: 'tree',
          tone: 'blue'
        },
        can('staff_manage') && {
          to: '/office/staff',
          label: 'เจ้าหน้าที่ & ตัวแทนจำหน่าย',
          sub: '5 บทบาท: CEO · IT · Mkt · คลัง · ตัวแทน',
          icon: 'team',
          tone: 'violet'
        },
        can('settings_manage') && {
          to: '/office/settings',
          label: 'ตั้งค่าระบบ & รหัสผ่าน',
          sub: 'องค์กร · รหัสซิงก์ · AI · DB',
          icon: 'gear',
          tone: 'amber'
        },
        {
          to: '/office/manual',
          label: 'คู่มือระบบจัดการเว็บไซต์',
          sub: 'ขั้นตอนดึง Shopee · รหัสผ่าน · ERP',
          icon: 'doc',
          tone: 'violet',
          badge: 'GUIDE',
          badgeTone: 'mint'
        }
      ].filter(Boolean) as any[]
    }
  ].filter((sec) => sec.items.length > 0)

  const q = menuFilter.value.trim().toLowerCase()
  if (!q) return raw
  return raw
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((it) => `${it.label} ${it.sub} ${it.to}`.toLowerCase().includes(q))
    }))
    .filter((sec) => sec.items.length > 0)
})

function isActive(item: { to: string; exact?: boolean }) {
  if (item.exact) return route.path === item.to
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

const currentMeta = computed(() => {
  for (const sec of navSections.value) {
    for (const item of sec.items) {
      if (isActive(item)) return item
    }
  }
  return { label: 'แดชบอร์ดภาพรวม', sub: 'OPWatch Smart ERP Workspace', icon: 'dash' }
})

const searchResults = computed(() => {
  const q = searchQ.value.trim().toLowerCase()
  if (!q) return []
  const out: { title: string; sub: string; to: string; tag: string }[] = []

  for (const sec of navSections.value) {
    for (const it of sec.items) {
      if (`${it.label} ${it.sub}`.toLowerCase().includes(q)) {
        out.push({ title: it.label, sub: it.sub, to: it.to, tag: 'เมนูระบบ' })
      }
    }
  }
  for (const ord of shellStats.value?.recentOrders || []) {
    if (`${ord.orderNo} ${ord.customerName || ''}`.toLowerCase().includes(q)) {
      out.push({
        title: `คำสั่งซื้อ ${ord.orderNo}`,
        sub: `${ord.customerName || 'ลูกค้า'} · ฿${Number(ord.total || 0).toLocaleString()}`,
        to: `/office/orders/${ord.id}`,
        tag: 'คำสั่งซื้อ'
      })
    }
  }
  for (const ev of shellStats.value?.calendarEvents || []) {
    if (`${ev.title} ${ev.location || ''}`.toLowerCase().includes(q)) {
      out.push({
        title: ev.title,
        sub: `${ev.date} · ${ev.location || 'ปฏิทินกิจกรรม'}`,
        to: '/office/calendar',
        tag: 'ปฏิทิน'
      })
    }
  }
  return out.slice(0, 8)
})

const pomoDisplay = computed(() => {
  const m = String(Math.floor(pomoSec.value / 60)).padStart(2, '0')
  const s = String(pomoSec.value % 60).padStart(2, '0')
  return `${m}:${s}`
})

function togglePomo() {
  pomoRunning.value = !pomoRunning.value
  if (pomoRunning.value) {
    pomoTimer = setInterval(() => {
      if (pomoSec.value > 0) pomoSec.value--
      else {
        pomoRunning.value = false
        clearInterval(pomoTimer)
        pomoSec.value = 25 * 60
        toast.success('ครบเวลาโฟกัส 25 นาทีแล้ว พักสายตาได้เลย!')
      }
    }, 1000)
  } else if (pomoTimer) {
    clearInterval(pomoTimer)
  }
}

async function runQuickAi() {
  if (!quickAiPrompt.value.trim()) {
    toast.error('กรุณาพิมพ์หัวข้อหรือคำสั่งที่ต้องการให้ AI ช่วยสร้างเนื้อหา')
    return
  }
  quickAiLoading.value = true
  try {
    const res = await $fetch<any>('/api/admin/ai/generate', {
      method: 'POST',
      body: {
        task: 'freeform_draft',
        agentCode: quickAiAgent.value,
        input: { prompt: quickAiPrompt.value, agentCode: quickAiAgent.value }
      }
    })
    quickAiOutput.value = res?.result?.content || JSON.stringify(res?.result || {}, null, 2)
    refreshShellStats()
    toast.success(`✨ ${quickAiAgent.value} สร้างเนื้อหาเรียบร้อยแล้ว`)
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || 'เรียกใช้ AI ไม่สำเร็จ')
  } finally {
    quickAiLoading.value = false
  }
}

async function copyQuickAi() {
  if (!quickAiOutput.value || !import.meta.client) return
  await navigator.clipboard.writeText(quickAiOutput.value)
  toast.success('คัดลอกเนื้อหาลงคลิปบอร์ดแล้ว')
}

async function signOut() {
  await officeAuth.logout()
  router.push('/office/login')
}

onMounted(() => {
  if (!import.meta.client) return
  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      searchInputEl.value?.focus()
    }
  }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => {
    window.removeEventListener('keydown', onKey)
    if (pomoTimer) clearInterval(pomoTimer)
  })
})
</script>

<template>
  <div
    class="mng-office"
    :class="{ 'is-rail-collapsed': sidebarCollapsed }"
    :style="{ '--violet': themeAccent }"
  >
    <!-- Mobile Backdrop -->
    <div v-if="sidebarOpen" class="mng-backdrop" @click="sidebarOpen = false" />

    <!-- Left Navigation Sidebar (PlayDigital Light Theme + MNG Icons) -->
    <aside class="mng-sidebar" :class="{ 'is-open': sidebarOpen, 'is-collapsed': sidebarCollapsed }">
      <div class="mng-brand">
        <NuxtLink to="/office" class="mng-brand__link" @click="sidebarOpen = false">
          <img
            :src="sidebarCollapsed ? '/images/logos/opwatch-emblem-color.png' : '/images/logos/opwatch-logo-color.png'"
            alt="OPWatch Official"
            class="mng-brand__logo"
            :class="{ 'is-collapsed': sidebarCollapsed }"
          />
          <div v-if="!sidebarCollapsed" class="mng-brand__txt">
            <strong>OPWATCH ERP</strong>
            <span>ปฏิทิน · สินค้า · AI · อีคอมเมิร์ซ</span>
          </div>
        </NuxtLink>
        <button
          type="button"
          class="mng-collapse-btn"
          :title="sidebarCollapsed ? 'ขยายเมนูซ้าย' : 'ย่อเมนูเป็นไอคอน'"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <OfficeMngIcon :name="sidebarCollapsed ? 'chevR' : 'chevL'" :size="16" />
        </button>
      </div>

      <!-- Quick Menu Filter -->
      <div v-if="!sidebarCollapsed" class="mng-side-filter">
        <OfficeMngIcon name="search" :size="14" />
        <input v-model="menuFilter" placeholder="กรองเมนูซ้ายมือ..." />
      </div>

      <!-- Menu Groups -->
      <nav class="mng-nav">
        <div v-for="sec in navSections" :key="sec.group" class="mng-nav__sec">
          <div v-if="!sidebarCollapsed" class="mng-nav__head">{{ sec.groupTh }}</div>
          <NuxtLink
            v-for="item in sec.items"
            :key="item.to"
            :to="item.to"
            class="mng-nav__item"
            :class="{ 'is-active': isActive(item) }"
            :title="sidebarCollapsed ? `${item.label} — ${item.sub}` : undefined"
            @click="sidebarOpen = false"
          >
            <span class="mng-nav__ico" :class="`tone-${item.tone}`">
              <OfficeMngIcon :name="item.icon" :size="18" />
            </span>
            <span v-if="!sidebarCollapsed" class="mng-nav__body">
              <span class="mng-nav__lbl">{{ item.label }}</span>
              <small class="mng-nav__sub">{{ item.sub }}</small>
            </span>
            <span
              v-if="!sidebarCollapsed && item.badge"
              class="mng-nav__badge"
              :class="item.badgeTone ? `is-${item.badgeTone}` : ''"
            >
              {{ item.badge }}
            </span>
          </NuxtLink>
        </div>
      </nav>

      <!-- MNG-ERP Signature Promo Card -->
      <div v-if="!sidebarCollapsed" class="mng-promo-card">
        <div class="mng-promo-card__title">✨ AI &amp; Image Studio</div>
        <p>สั่ง AI เขียนเนื้อหา SEO/แคมเปญ และปรับภาพพื้นขาวอัตโนมัติในคลิกเดียว</p>
        <button type="button" class="mng-promo-card__btn" @click="quickAiOpen = true">
          ⚡ เปิดผู้ช่วย AI ทันที
        </button>
      </div>

      <!-- User Footer -->
      <div class="mng-side-foot">
        <NuxtLink to="/" target="_blank" class="mng-store-pill" :title="sidebarCollapsed ? 'เปิดหน้าร้านค้า' : undefined">
          <OfficeMngIcon name="globe" :size="16" />
          <span v-if="!sidebarCollapsed">ดูหน้าร้าน opwatch.co.th ↗</span>
        </NuxtLink>
        <div class="mng-user-row">
          <div class="mng-av" :style="{ background: officeAuth.officer.value?.roleBadgeColor || '#6c5ce7' }">
            {{ (officeAuth.officer.value?.name || officeAuth.officer.value?.email || 'OP').slice(0, 2).toUpperCase() }}
          </div>
          <div v-if="!sidebarCollapsed" class="mng-user-info">
            <strong>{{ officeAuth.officer.value?.name || 'เจ้าหน้าที่ระบบ' }}</strong>
            <small>{{ officeAuth.officer.value?.roleLabelTh || officeAuth.officer.value?.role }} · {{ officeAuth.officer.value?.email }}</small>
          </div>
          <button type="button" class="mng-icon-btn" title="ออกจากระบบเจ้าหน้าที่/ตัวแทน" @click="signOut">
            <OfficeMngIcon name="logout" :size="16" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Fluid Full-Width Main Workspace ("เนื้อหาให้ยืดตามเดิม") -->
    <div class="mng-main">
      <!-- Topbar matched to https://mng.uarea.in/#/dashboard -->
      <header class="mng-topbar">
        <button type="button" class="mng-burger" aria-label="เปิดเมนู" @click="sidebarOpen = !sidebarOpen">
          ☰
        </button>

        <div class="mng-tb-title">
          <small>{{ currentMeta.sub }}</small>
          <div class="mng-tb-title__row">
            <h1>{{ currentMeta.label }}</h1>
            <span class="mng-live-pill">
              <i />
              {{ officeAuth.officer.value?.roleLabelTh || (shellStats?.driver === 'mysql' ? 'MariaDB Live' : 'Database Ready') }}
            </span>
          </div>
        </div>

        <!-- Global Search -->
        <div class="mng-search">
          <OfficeMngIcon name="search" :size="16" />
          <input
            ref="searchInputEl"
            v-model="searchQ"
            placeholder="ค้นหาเมนู คำสั่งซื้อ กิจกรรมปฏิทิน… (⌘K)"
            @focus="searchFocused = true"
            @blur="setTimeout(() => (searchFocused = false), 180)"
          />
          <kbd>⌘K</kbd>

          <div v-if="searchFocused && searchResults.length" class="mng-search__pop">
            <NuxtLink
              v-for="(r, idx) in searchResults"
              :key="idx"
              :to="r.to"
              class="mng-search__item"
              @click="searchQ = ''"
            >
              <div>
                <strong>{{ r.title }}</strong>
                <small>{{ r.sub }}</small>
              </div>
              <span class="badge b-purple">{{ r.tag }}</span>
            </NuxtLink>
          </div>
        </div>

        <div class="mng-tb-right">
          <NuxtLink to="/office/manual" class="erp-btn erp-btn--ghost erp-btn--sm" title="เปิดคู่มือระบบจัดการเว็บไซต์">
            <span>📘 คู่มือระบบ</span>
          </NuxtLink>

          <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="quickAiOpen = true">
            <OfficeMngIcon name="sparkles" :size="15" />
            <span>ช่วยเขียน AI</span>
          </button>

          <button
            type="button"
            class="mng-pomo-pill"
            :class="{ running: pomoRunning }"
            title="จับเวลาโฟกัสงาน 25 นาที (Pomodoro)"
            @click="togglePomo"
          >
            <OfficeMngIcon name="clock" :size="15" />
            <span>{{ pomoDisplay }}</span>
          </button>

          <div style="position: relative">
            <button type="button" class="mng-icon-btn" title="การแจ้งเตือน" @click="notifOpen = !notifOpen">
              <OfficeMngIcon name="bell" :size="18" />
              <span v-if="(shellStats?.totals?.pendingOrders || 0) + (shellStats?.totals?.openChats || 0) > 0" class="mng-dot" />
            </button>
            <div v-if="notifOpen" class="mng-notif-pop" @mouseleave="notifOpen = false">
              <div class="mng-notif-pop__hd">
                <strong>การแจ้งเตือนล่าสุด</strong>
                <NuxtLink to="/office/orders" @click="notifOpen = false">ดูทั้งหมด →</NuxtLink>
              </div>
              <NuxtLink to="/office/orders" class="mng-notif-row" @click="notifOpen = false">
                <span>📦 คำสั่งซื้อรอดำเนินการ</span>
                <b class="badge b-yellow">{{ shellStats?.totals?.pendingOrders || 0 }} รายการ</b>
              </NuxtLink>
              <NuxtLink to="/office/calendar" class="mng-notif-row" @click="notifOpen = false">
                <span>📅 กิจกรรมในปฏิทิน</span>
                <b class="badge b-blue">{{ shellStats?.totals?.events || 0 }} นัดหมาย</b>
              </NuxtLink>
              <NuxtLink to="/office/ai" class="mng-notif-row" @click="notifOpen = false">
                <span>🤖 งานที่ AI ประมวลผลแล้ว</span>
                <b class="badge b-green">{{ shellStats?.totals?.aiRuns || 0 }} ครั้ง</b>
              </NuxtLink>
            </div>
          </div>

          <button
            type="button"
            class="mng-user-chip"
            style="border:none;cursor:pointer;text-align:left"
            title="คลิกเพื่อเปลี่ยนรหัสผ่านบัญชีของคุณ"
            @click="pwModalOpen = true"
          >
            <span class="mng-av mng-av--sm" :style="{ background: officeAuth.officer.value?.roleBadgeColor || '#6c5ce7' }">
              {{ (officeAuth.officer.value?.name || officeAuth.officer.value?.email || 'OP').slice(0, 2).toUpperCase() }}
            </span>
            <span class="mng-user-chip__txt">
              <b>{{ officeAuth.officer.value?.name || 'เจ้าหน้าที่' }}</b>
              <small>🔑 เปลี่ยนรหัสผ่าน</small>
            </span>
          </button>
        </div>
      </header>

      <!-- Fluid Full-Width Page Content -->
      <main class="mng-view">
        <slot />
      </main>
    </div>

    <!-- PlayDigital Toast Stack -->
    <div v-if="toast.toasts.value.length" class="mng-toast-stack">
      <div
        v-for="t in toast.toasts.value"
        :key="t.id"
        class="mng-toast"
        :class="`is-${t.type}`"
        @click="toast.dismiss(t.id)"
      >
        <span>{{ t.type === 'error' ? '⚠️' : '✓' }}</span>
        <span>{{ t.message }}</span>
      </div>
    </div>

    <!-- Global Quick AI Content Generator Modal -->
    <div v-if="quickAiOpen" class="erp-modal-backdrop" @click.self="quickAiOpen = false">
      <div class="erp-modal" style="max-width: 680px">
        <div class="erp-card__head" style="margin-bottom: 12px">
          <div>
            <div class="erp-card__title">⚡ สั่งงานผู้ช่วย AI ด่วน (Quick AI Content Studio)</div>
            <div class="erp-card__sub">สร้างแคปชั่นขายนาฬิกา คำบรรยายสินค้า ข้อความตอบลูกค้า หรือแผนโปรโมชั่นได้ทันทีจากทุกหน้า</div>
          </div>
          <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="quickAiOpen = false">✕</button>
        </div>

        <div class="erp-form-grid">
          <div class="erp-field">
            <label class="erp-label">เลือก AI Agent ผู้เชี่ยวชาญ</label>
            <select v-model="quickAiAgent" class="erp-select">
              <option value="OP-COPY">✍️ OP-COPY — นักเขียนคำบรรยายนาฬิกา &amp; บทความ</option>
              <option value="OP-SEO">🔎 OP-SEO — ผู้เชี่ยวชาญ SEO &amp; ASEO FAQ</option>
              <option value="OP-PROMO">🎯 OP-PROMO — นักวางแคมเปญโปรโมชั่น &amp; คูปอง</option>
              <option value="OP-CARE">💬 OP-CARE — ผู้ช่วยร่างข้อความตอบแชทลูกค้า</option>
            </select>
          </div>
          <div class="erp-field">
            <label class="erp-label">ตัวอย่างคำสั่งลัด</label>
            <div style="display: flex; gap: 6px; flex-wrap: wrap">
              <button
                type="button"
                class="chip"
                @click="quickAiPrompt = 'เขียนโพสต์โปรโมต Olym Pianus Sportmaster กระจกแซฟไฟร์ ลดพิเศษพร้อมส่งฟรี'"
              >
                โพสต์ขายนาฬิกา
              </button>
              <button
                type="button"
                class="chip"
                @click="quickAiPrompt = 'ร่างข้อความบรอดแคสต์ LINE @opwatch.th แจ้งคูปองลด 500 บาท'"
              >
                LINE Broadcast
              </button>
            </div>
          </div>
          <div class="erp-field erp-field--full">
            <label class="erp-label">คำสั่ง / หัวข้อที่ต้องการให้ AI เขียน</label>
            <textarea
              v-model="quickAiPrompt"
              rows="3"
              class="erp-textarea"
              placeholder="พิมพ์โจทย์ เช่น เขียนแคปชั่นเปิดตัว Ogival Lucky Fish Swiss Automatic สำหรับลูกค้าผู้บริหาร..."
            />
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; gap: 10px; flex-wrap: wrap">
          <NuxtLink to="/office/ai" class="erp-btn erp-btn--ghost erp-btn--sm" @click="quickAiOpen = false">
            ⚙️ ตั้งค่า API Key / เปิดหน้า AI Hub เต็มรูปแบบ →
          </NuxtLink>
          <button type="button" class="erp-btn erp-btn--primary" :disabled="quickAiLoading" @click="runQuickAi">
            {{ quickAiLoading ? 'กำลังสร้างเนื้อหา...' : '✨ สร้างเนื้อหาด้วย AI' }}
          </button>
        </div>

        <div v-if="quickAiOutput" class="mng-ai-out">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px">
            <strong style="font-size: 12.5px; color: var(--violet)">ผลลัพธ์จาก {{ quickAiAgent }}</strong>
            <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="copyQuickAi">📋 คัดลอกข้อความ</button>
          </div>
          <pre>{{ quickAiOutput }}</pre>
        </div>
      </div>
    </div>

    <!-- Global Self-Service Change Password Modal -->
    <div v-if="pwModalOpen" class="erp-modal-backdrop" @click.self="pwModalOpen = false">
      <div class="erp-modal" style="max-width: 460px">
        <div class="erp-card__head" style="margin-bottom: 12px">
          <div>
            <div class="erp-card__title">🔑 เปลี่ยนรหัสผ่านบัญชีของฉัน</div>
            <div class="erp-card__sub">
              บัญชี: {{ officeAuth.officer.value?.email }} ({{ officeAuth.officer.value?.roleLabelTh }})
            </div>
          </div>
          <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="pwModalOpen = false">✕</button>
        </div>

        <form @submit.prevent="submitMyPassword">
          <div class="erp-field" style="margin-bottom: 10px">
            <label class="erp-label">รหัสผ่านปัจจุบัน</label>
            <input v-model="pwForm.currentPassword" type="password" class="erp-input" required autocomplete="current-password" />
          </div>
          <div class="erp-field" style="margin-bottom: 10px">
            <label class="erp-label">รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)</label>
            <input v-model="pwForm.newPassword" type="password" class="erp-input" required minlength="6" autocomplete="new-password" />
          </div>
          <div class="erp-field" style="margin-bottom: 14px">
            <label class="erp-label">ยืนยันรหัสผ่านใหม่อีกครั้ง</label>
            <input v-model="pwForm.confirmPassword" type="password" class="erp-input" required minlength="6" autocomplete="new-password" />
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap">
            <NuxtLink
              v-if="officeAuth.hasPermission('settings_manage')"
              to="/office/settings?tab=security"
              class="erp-btn erp-btn--ghost erp-btn--sm"
              @click="pwModalOpen = false"
            >
              🔐 จัดการรหัสผ่านทั้งระบบ →
            </NuxtLink>
            <span v-else />
            <div style="display: flex; gap: 8px">
              <button type="button" class="erp-btn erp-btn--ghost" @click="pwModalOpen = false">ยกเลิก</button>
              <button type="submit" class="erp-btn erp-btn--primary" :disabled="pwSaving">
                {{ pwSaving ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
/* ==========================================================================
   MNG ERP — PlayDigital Light Workspace Theme (https://mng.uarea.in/#/dashboard)
   Ported faithfully from ProAke/mng-erp for OPWatch /office
   ========================================================================== */
.mng-office {
  --bg: #f6f7fc;
  --bg-2: #fbfbfe;
  --card: #ffffff;
  --panel: #f6f7fc;
  --panel-2: #f1f2fa;
  --tint-1: #f3f4fb;
  --tint-2: #eef0f8;
  --tint-3: #e6e8f6;
  --hover: #f3f4fb;

  --ink: #23264d;
  --ink-2: #454a75;
  --muted: #8a8fb1;

  --line: #e9ebf6;
  --line-2: #dfe2f2;

  --violet: #6c5ce7;
  --violet-2: #8e7cf3;
  --violet-soft: #efedfd;
  --purple: var(--violet);
  --purple-2: var(--violet-2);
  --purple-soft: var(--violet-soft);

  --blue: #3ba7ff;
  --blue-2: #2f7bf0;
  --blue-soft: #e9f3ff;

  --pink: #ff6b9d;
  --pink-soft: #ffeef4;

  --mint: #22c793;
  --teal: #14c4b2;
  --mint-soft: #e5f9f2;
  --green: var(--mint);
  --green-soft: var(--mint-soft);

  --amber: #ffb020;
  --orange: #ff9a5a;
  --yellow-soft: #fff6e4;

  --red: #ff5c7a;
  --red-soft: #ffecef;

  --grad-violet: linear-gradient(135deg, #8e7cf3 0%, var(--violet) 60%, #4a3fd1 100%);
  --grad-pink: linear-gradient(135deg, #ff8fb8 0%, #b950f0 100%);
  --grad-cyan: linear-gradient(135deg, #3ba7ff 0%, #2f7bf0 100%);
  --grad-mint: linear-gradient(135deg, #22c793 0%, #14c4b2 100%);
  --grad-amber: linear-gradient(135deg, #ffb020 0%, #ff9a5a 100%);

  --shadow-sm: 0 1px 3px rgba(46, 50, 102, 0.06);
  --shadow-soft: 0 8px 24px rgba(76, 66, 168, 0.08);
  --shadow-lg: 0 24px 60px rgba(60, 52, 140, 0.18);

  /* Legacy aliases so all /office pages inherit PlayDigital Light automatically */
  --u-bg: var(--bg);
  --u-surface: var(--card);
  --u-surface-2: var(--panel);
  --u-border: var(--line);
  --u-border-bright: var(--line-2);
  --u-text: var(--ink);
  --u-muted: var(--muted);
  --u-cyan: var(--violet);
  --u-violet: var(--violet);
  --u-emerald: var(--mint);
  --u-amber: var(--amber);
  --u-rose: var(--red);

  color-scheme: light;
  min-height: 100vh;
  display: flex;
  background: var(--bg);
  color: var(--ink);
  font-family: 'Prompt', 'IBM Plex Sans Thai', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 13.5px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}

/* ---------- Attractive Left Sidebar ---------- */
.mng-sidebar {
  width: 264px;
  flex-shrink: 0;
  background: #ffffff;
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 45;
  transition: width 0.2s ease, transform 0.22s ease;
  box-shadow: 2px 0 20px rgba(46, 50, 102, 0.03);
}
.mng-sidebar.is-collapsed {
  width: 78px;
}

.mng-brand {
  height: 68px;
  padding: 0 14px 0 16px;
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.mng-brand__link {
  display: flex;
  align-items: center;
  gap: 11px;
  text-decoration: none;
  color: inherit;
  min-width: 0;
}
.mng-brand__logo {
  height: 44px;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
  display: block;
}
.mng-brand__logo.is-collapsed {
  height: 32px;
}
.mng-brand__txt {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.mng-brand__txt strong {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.01em;
  line-height: 1.15;
}
.mng-brand__txt span {
  font-size: 11px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mng-collapse-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--muted);
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
}
.mng-collapse-btn:hover {
  color: var(--violet);
  border-color: var(--violet);
  background: var(--violet-soft);
}

.mng-side-filter {
  margin: 12px 14px 4px;
  padding: 7px 11px;
  border-radius: 10px;
  background: var(--panel);
  border: 1px solid var(--line);
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
}
.mng-side-filter input {
  border: 0;
  outline: 0;
  background: transparent;
  width: 100%;
  font-size: 12.5px;
  color: var(--ink);
  font-family: inherit;
}

.mng-nav {
  flex: 1;
  overflow-y: auto;
  padding: 8px 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mng-nav__sec {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.mng-nav__head {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--muted);
  padding: 4px 10px 3px;
}
.mng-nav__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 8px 10px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--ink-2);
  transition: all 0.15s ease;
}
.mng-sidebar.is-collapsed .mng-nav__item {
  justify-content: center;
  padding: 10px 0;
}
.mng-nav__item:hover {
  background: var(--hover);
  color: var(--ink);
}
.mng-nav__item.is-active {
  background: var(--violet-soft);
  color: var(--violet);
}
.mng-nav__item.is-active::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 9px;
  bottom: 9px;
  width: 4px;
  border-radius: 0 4px 4px 0;
  background: var(--violet);
}

.mng-nav__ico {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: var(--panel);
  color: var(--ink-2);
  transition: all 0.15s ease;
}
.mng-nav__ico.tone-violet { background: #f2f0fe; color: #6c5ce7; }
.mng-nav__ico.tone-blue { background: #eaf4ff; color: #2f7bf0; }
.mng-nav__ico.tone-mint { background: #e6f9f3; color: #15a376; }
.mng-nav__ico.tone-pink { background: #fff0f6; color: #e64980; }
.mng-nav__ico.tone-amber { background: #fff7e6; color: #d97706; }

.mng-nav__item.is-active .mng-nav__ico {
  background: var(--grad-violet);
  color: #ffffff;
  box-shadow: 0 6px 14px rgba(108, 92, 231, 0.28);
}

.mng-nav__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}
.mng-nav__lbl {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mng-nav__sub {
  font-size: 10.5px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mng-nav__item.is-active .mng-nav__sub {
  color: var(--violet);
  opacity: 0.82;
}

.mng-nav__badge {
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--violet);
  color: #ffffff;
  flex-shrink: 0;
}
.mng-nav__badge.is-mint { background: var(--mint); }
.mng-nav__badge.is-amber { background: var(--amber); color: #23264d; }

/* Sidebar Promo Card (from ProAke/mng-erp styles.css) */
.mng-promo-card {
  margin: 4px 12px 10px;
  padding: 14px;
  border-radius: 16px;
  background: var(--grad-violet);
  color: #ffffff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(108, 92, 231, 0.24);
}
.mng-promo-card::after {
  content: '';
  position: absolute;
  right: -24px;
  bottom: -24px;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
}
.mng-promo-card__title {
  font-size: 13px;
  font-weight: 700;
}
.mng-promo-card p {
  font-size: 11px;
  opacity: 0.9;
  margin: 4px 0 10px;
  line-height: 1.45;
}
.mng-promo-card__btn {
  width: 100%;
  background: #ffffff;
  color: var(--violet);
  border: 0;
  border-radius: 10px;
  padding: 7px 10px;
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  position: relative;
  z-index: 1;
}
.mng-promo-card__btn:hover {
  background: #f8f7ff;
}

.mng-side-foot {
  padding: 10px 12px 12px;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #fbfbfe;
}
.mng-store-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 7px 10px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid var(--line);
  color: var(--ink-2);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
}
.mng-store-pill:hover {
  border-color: var(--violet);
  color: var(--violet);
}
.mng-user-row {
  display: flex;
  align-items: center;
  gap: 9px;
}
.mng-av {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffb26b, #ff6b9d);
  color: #ffffff;
  font-weight: 700;
  font-size: 12px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.mng-av--sm {
  width: 30px;
  height: 30px;
  font-size: 11px;
}
.mng-user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.mng-user-info strong {
  font-size: 12.5px;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mng-user-info small {
  font-size: 10.5px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---------- Main Fluid Workspace ("เนื้อหาให้ยืดตามเดิม") ---------- */
.mng-main {
  flex: 1;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.mng-topbar {
  height: 68px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 35;
}
.mng-burger {
  display: none;
  border: 1px solid var(--line);
  background: #ffffff;
  color: var(--ink);
  width: 36px;
  height: 36px;
  border-radius: 10px;
  font-size: 17px;
  cursor: pointer;
}
.mng-tb-title {
  min-width: 180px;
}
.mng-tb-title small {
  display: block;
  font-size: 11px;
  color: var(--muted);
  line-height: 1.1;
}
.mng-tb-title__row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.mng-tb-title h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.01em;
}
.mng-live-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--mint-soft);
  color: #0e9f6e;
  font-size: 11px;
  font-weight: 600;
}
.mng-live-pill i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--mint);
}

.mng-search {
  position: relative;
  flex: 1;
  max-width: 460px;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 8px 13px;
  color: var(--muted);
}
.mng-search:focus-within {
  background: #ffffff;
  border-color: var(--violet);
  box-shadow: 0 0 0 3px var(--violet-soft);
}
.mng-search input {
  border: 0;
  outline: 0;
  background: transparent;
  width: 100%;
  font-size: 13px;
  color: var(--ink);
  font-family: inherit;
}
.mng-search kbd {
  font-size: 10.5px;
  padding: 2px 6px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid var(--line);
  color: var(--muted);
  font-family: 'JetBrains Mono', monospace;
}
.mng-search__pop {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: var(--shadow-lg);
  padding: 6px;
  z-index: 60;
}
.mng-search__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  text-decoration: none;
  color: var(--ink);
}
.mng-search__item:hover { background: var(--hover); }
.mng-search__item strong { display: block; font-size: 13px; }
.mng-search__item small { font-size: 11.5px; color: var(--muted); }

.mng-tb-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.mng-pomo-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  border-radius: 999px;
  background: var(--panel);
  border: 1px solid var(--line);
  color: var(--ink-2);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.mng-pomo-pill.running {
  background: var(--violet-soft);
  color: var(--violet);
  border-color: #cfc8fa;
}
.mng-icon-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: #ffffff;
  color: var(--ink-2);
  display: grid;
  place-items: center;
  cursor: pointer;
}
.mng-icon-btn:hover {
  background: var(--violet-soft);
  color: var(--violet);
  border-color: #d3cdfb;
}
.mng-dot {
  position: absolute;
  top: 6px;
  right: 7px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--red);
  border: 2px solid #ffffff;
}
.mng-notif-pop {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 290px;
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: var(--shadow-lg);
  padding: 10px;
  z-index: 65;
}
.mng-notif-pop__hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px 8px;
  border-bottom: 1px solid var(--line);
  font-size: 12.5px;
}
.mng-notif-pop__hd a { font-size: 11.5px; color: var(--violet); text-decoration: none; }
.mng-notif-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 8px;
  border-radius: 10px;
  text-decoration: none;
  color: var(--ink);
  font-size: 12.5px;
}
.mng-notif-row:hover { background: var(--hover); }

.mng-user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 4px;
  border-radius: 999px;
  background: var(--panel);
  border: 1px solid var(--line);
  text-decoration: none;
  color: var(--ink);
}
.mng-user-chip__txt {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}
.mng-user-chip__txt b { font-size: 12px; }
.mng-user-chip__txt small { font-size: 10px; color: var(--muted); }

/* FLUID 100% WIDTH VIEWPORT ("เนื้อหาให้ยืดตามเดิม") */
.mng-view {
  flex: 1;
  width: 100%;
  max-width: none;
  padding: 22px 26px 36px;
}

.mng-ai-out {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--panel);
  border: 1px solid var(--line);
}
.mng-ai-out pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 13px;
  color: var(--ink);
  line-height: 1.65;
}

/* ==========================================================================
   Shared MNG-ERP + ERP Primitives (PlayDigital Light across ALL /office pages)
   ========================================================================== */
.mng-office .erp-page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.mng-office .erp-kicker {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--violet);
  margin-bottom: 2px;
}
.mng-office .erp-h1 {
  margin: 0;
  font-size: 21px;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.01em;
}
.mng-office .erp-sub {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: var(--muted);
}

.mng-office .card,
.mng-office .erp-card,
.mng-office .erp-panel {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 18px;
}

.mng-office .card-head,
.mng-office .erp-card__head,
.mng-office .erp-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.mng-office .card-title,
.mng-office .erp-card__title,
.mng-office .erp-panel__title {
  font-size: 15.5px;
  font-weight: 700;
  color: var(--ink);
  display: flex;
  align-items: center;
  gap: 8px;
}
.mng-office .card-sub,
.mng-office .erp-card__sub {
  font-size: 12px;
  color: var(--muted);
  margin-top: 2px;
}

/* PlayDigital KPI Grid */
.mng-office .kpi-row,
.mng-office .erp-stats,
.mng-office .erp-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}
.mng-office .kpi,
.mng-office .erp-stat,
.mng-office .erp-kpi {
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 18px 20px;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.mng-office .kpi:hover,
.mng-office .erp-stat:hover,
.mng-office .erp-kpi:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
}
.mng-office .erp-stat__label,
.mng-office .erp-kpi__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
}
.mng-office .erp-stat__val,
.mng-office .erp-kpi__val {
  font-size: 25px;
  font-weight: 700;
  color: var(--ink);
  margin-top: 6px;
  letter-spacing: -0.02em;
}
.mng-office .erp-stat__hint,
.mng-office .erp-kpi__meta {
  font-size: 11.5px;
  color: var(--muted);
  margin-top: 4px;
}

/* Badges & Chips (MNG Pastel Semantic System) */
.mng-office .badge,
.mng-office .erp-badge,
.mng-office .erp-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  background: var(--tint-2);
  color: var(--ink-2);
}
.mng-office .b-purple,
.mng-office .erp-badge--violet,
.mng-office .erp-chip--violet { background: var(--violet-soft); color: var(--violet); }
.mng-office .b-blue,
.mng-office .erp-badge--cyan,
.mng-office .erp-chip--cyan { background: var(--blue-soft); color: var(--blue-2); }
.mng-office .b-green,
.mng-office .erp-badge--emerald,
.mng-office .erp-chip--mint { background: var(--mint-soft); color: #0e9f6e; }
.mng-office .b-yellow,
.mng-office .erp-badge--amber,
.mng-office .erp-chip--amber { background: var(--yellow-soft); color: #b45309; }
.mng-office .b-red,
.mng-office .erp-badge--rose,
.mng-office .erp-chip--rose { background: var(--red-soft); color: #e11d48; }
.mng-office .b-pink { background: var(--pink-soft); color: #db2777; }
.mng-office .b-grey { background: var(--tint-2); color: var(--ink-2); }

/* Buttons */
.mng-office .btn,
.mng-office .erp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 8.5px 15px;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  border: 1px solid var(--line-2);
  background: #ffffff;
  color: var(--ink);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.mng-office .btn:hover,
.mng-office .erp-btn:hover {
  background: var(--hover);
  border-color: #c8cdf0;
}
.mng-office .btn-primary,
.mng-office .erp-btn--primary {
  background: var(--grad-violet);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 6px 16px rgba(108, 92, 231, 0.25);
}
.mng-office .btn-primary:hover,
.mng-office .erp-btn--primary:hover {
  filter: brightness(1.05);
  color: #ffffff;
}
.mng-office .btn-ghost,
.mng-office .erp-btn--ghost {
  background: #ffffff;
  color: var(--ink-2);
  border: 1px solid var(--line-2);
}
.mng-office .erp-btn--violet {
  background: var(--violet-soft);
  color: var(--violet);
  border: 1px solid #d4cdfb;
}
.mng-office .erp-btn--violet:hover {
  background: var(--violet);
  color: #ffffff;
}
.mng-office .btn-danger,
.mng-office .erp-btn--danger {
  background: var(--red-soft);
  color: #e11d48;
  border-color: #fecdd3;
}
.mng-office .btn-sm,
.mng-office .erp-btn--sm {
  padding: 5.5px 11px;
  font-size: 12px;
  border-radius: 9px;
}
.mng-office .erp-btn:disabled,
.mng-office .btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Inputs & Selects */
.mng-office .erp-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.mng-office .erp-form-grid--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.mng-office .erp-field { display: flex; flex-direction: column; gap: 5px; }
.mng-office .erp-field--full { grid-column: 1 / -1; }
.mng-office .erp-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-2);
}
.mng-office .erp-input,
.mng-office .erp-select,
.mng-office .erp-textarea {
  width: 100%;
  background: var(--panel);
  color: var(--ink);
  border: 1px solid var(--line-2);
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 13.5px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.14s ease, background 0.14s ease, box-shadow 0.14s ease;
}
.mng-office .erp-input:focus,
.mng-office .erp-select:focus,
.mng-office .erp-textarea:focus {
  background: #ffffff;
  border-color: var(--violet);
  box-shadow: 0 0 0 3px var(--violet-soft);
}

/* Switches & Chips */
.mng-office .switch {
  width: 40px;
  height: 22px;
  border-radius: 999px;
  border: 0;
  background: #d5d9ee;
  position: relative;
  cursor: pointer;
  transition: background 0.18s ease;
  flex-shrink: 0;
}
.mng-office .switch::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.18s ease;
}
.mng-office .switch.on { background: var(--violet); }
.mng-office .switch.on::after { transform: translateX(18px); }

.mng-office .chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: 999px;
  background: var(--panel);
  border: 1px solid var(--line);
  color: var(--ink-2);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}
.mng-office .chip:hover,
.mng-office .chip.on {
  background: var(--violet-soft);
  border-color: #cec7fb;
  color: var(--violet);
  font-weight: 600;
}

/* Tables */
.mng-office .erp-table-wrap { width: 100%; overflow-x: auto; }
.mng-office .tbl,
.mng-office .erp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.mng-office .tbl th,
.mng-office .erp-table th {
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  padding: 11px 12px;
  background: var(--bg-2);
  border-bottom: 1px solid var(--line);
}
.mng-office .tbl td,
.mng-office .erp-table td {
  padding: 12px;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  vertical-align: middle;
}
.mng-office .tbl tbody tr:hover td,
.mng-office .erp-table tbody tr:hover td {
  background: var(--hover);
}

/* Tabs */
.mng-office .erp-tabs {
  display: inline-flex;
  gap: 5px;
  background: #ffffff;
  border: 1px solid var(--line);
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  box-shadow: var(--shadow-sm);
}
.mng-office .erp-tab {
  border: 0;
  background: transparent;
  color: var(--ink-2);
  padding: 7px 14px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}
.mng-office .erp-tab.is-active {
  background: var(--violet);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.25);
}

/* Modals */
.mng-office .erp-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(28, 31, 68, 0.45);
  backdrop-filter: blur(5px);
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.mng-office .erp-modal {
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  overflow-y: auto;
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 22px 24px;
  box-shadow: var(--shadow-lg);
  color: var(--ink);
}

.mng-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(28, 31, 68, 0.4);
  z-index: 40;
}

.mng-toast-stack {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 120;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mng-toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
  border-radius: 13px;
  background: #23264d;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
}
.mng-toast.is-error { background: #e11d48; }
.mng-toast.is-success { background: #0e9f6e; }

@media (max-width: 1024px) {
  .mng-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    transform: translateX(-100%);
    width: 268px !important;
  }
  .mng-sidebar.is-open { transform: translateX(0); }
  .mng-collapse-btn { display: none; }
  .mng-burger { display: inline-grid; place-items: center; }
  .mng-topbar { padding: 0 14px; }
  .mng-view { padding: 16px 14px 28px; }
  .mng-user-chip__txt { display: none; }
}
@media (max-width: 680px) {
  .mng-search { display: none; }
  .mng-office .erp-form-grid { grid-template-columns: 1fr; }
}
</style>
