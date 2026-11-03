<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const { data: calRes, refresh } = await useFetch<any>('/api/admin/calendar', {
  default: () => ({ items: [] })
})

const TH_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
const TH_DOW = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']
const TH_DOW_MINI = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']

const CATS: Record<string, { label: string; color: string; cls: string }> = {
  campaign: { label: 'แคมเปญ & โปรโมชั่น', color: '#6c5ce7', cls: 'ev-campaign' },
  order: { label: 'คำสั่งซื้อ & จัดส่ง', color: '#ffb020', cls: 'ev-order' },
  meeting: { label: 'ประชุมทีมงาน', color: '#3ba7ff', cls: 'ev-meeting' },
  deadline: { label: 'เดดไลน์ & คูปอง', color: '#ff5c7a', cls: 'ev-deadline' },
  ai: { label: 'AI & สตูดิโอภาพ', color: '#22c793', cls: 'ev-ai' },
  holiday: { label: 'วันหยุดนักขัตฤกษ์', color: '#ff6b9d', cls: 'ev-holiday' }
}

function d2s(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function s2d(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y || 2026, (m || 1) - 1, d || 1)
}
function addDays(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

const todayStr = d2s(new Date())
const viewMode = ref<'month' | 'week' | 'day' | 'agenda'>('month')
const selectedDate = ref(todayStr)
const cursorYear = ref(new Date().getFullYear())
const cursorMonth = ref(new Date().getMonth())
const fullscreen = ref(false)
const activeCats = ref<string[]>(Object.keys(CATS))
const dragEventId = ref<number | null>(null)
const dropHoverDate = ref<string | null>(null)

// Event CRUD Modal
const modalOpen = ref(false)
const saving = ref(false)
const aiFilling = ref(false)
const editingId = ref<number | null>(null)
const readOnlySource = ref<any>(null)
const form = reactive({
  title: '',
  cat: 'campaign',
  date: todayStr,
  endDate: todayStr,
  startTime: '10:00',
  endTime: '11:30',
  allday: false,
  location: '',
  notes: '',
  refCode: '',
  assignee: 'ทีมอีคอมเมิร์ซ'
})

// AI Monthly Campaign Planner Modal
const aiPlanOpen = ref(false)
const aiPlanTheme = ref('แคมเปญนาฬิกาหรูประจำเดือน & โปรโมชั่นคู่ขนาน Shopee')
const aiPlanLoading = ref(false)
const aiPlanPreview = ref<any[]>([])

onMounted(() => {
  if (route.query.new === '1') {
    openNewEvent(todayStr)
  }
})

const allItems = computed(() =>
  (calRes.value?.items || []).filter((e: any) => activeCats.value.includes(e.cat || 'campaign'))
)

function eventsOn(ds: string) {
  return allItems.value.filter((e: any) => e.date === ds)
}

function toggleCat(key: string) {
  if (activeCats.value.includes(key)) {
    if (activeCats.value.length > 1) activeCats.value = activeCats.value.filter((k) => k !== key)
  } else {
    activeCats.value = [...activeCats.value, key]
  }
}

const headerTitle = computed(() => {
  if (viewMode.value === 'day') {
    const d = s2d(selectedDate.value)
    return `${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`
  }
  return `${TH_MONTHS[cursorMonth.value]} ${cursorYear.value + 543}`
})

function stepCalendar(dir: number) {
  if (viewMode.value === 'day') {
    const next = addDays(s2d(selectedDate.value), dir)
    selectedDate.value = d2s(next)
    cursorYear.value = next.getFullYear()
    cursorMonth.value = next.getMonth()
  } else if (viewMode.value === 'week') {
    const next = addDays(s2d(selectedDate.value), dir * 7)
    selectedDate.value = d2s(next)
    cursorYear.value = next.getFullYear()
    cursorMonth.value = next.getMonth()
  } else {
    const next = new Date(cursorYear.value, cursorMonth.value + dir, 1)
    cursorYear.value = next.getFullYear()
    cursorMonth.value = next.getMonth()
    selectedDate.value = d2s(next)
  }
}

function goToday() {
  const now = new Date()
  selectedDate.value = d2s(now)
  cursorYear.value = now.getFullYear()
  cursorMonth.value = now.getMonth()
}

// Month Grid (Monday-start just like ProAke/mng-erp)
const monthWeeks = computed(() => {
  const first = new Date(cursorYear.value, cursorMonth.value, 1)
  const monOffset = -((first.getDay() + 6) % 7)
  const start = addDays(first, monOffset)
  const daysInMonth = new Date(cursorYear.value, cursorMonth.value + 1, 0).getDate()
  const totalWeeks = Math.ceil((((first.getDay() + 6) % 7) + daysInMonth) / 7)

  const weeks = []
  for (let w = 0; w < totalWeeks; w++) {
    const row = []
    for (let i = 0; i < 7; i++) {
      const dt = addDays(start, w * 7 + i)
      const ds = d2s(dt)
      const evs = eventsOn(ds)
      row.push({
        ds,
        day: dt.getDate(),
        dim: dt.getMonth() !== cursorMonth.value,
        isToday: ds === todayStr,
        isSelected: ds === selectedDate.value,
        isWeekend: i >= 5,
        events: evs.slice(0, 3),
        more: Math.max(0, evs.length - 3),
        hasDot: evs.length > 0
      })
    }
    weeks.push(row)
  }
  return weeks
})

// Week / Day Timeline Columns (08:00 - 20:00)
const timelineHours = Array.from({ length: 13 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`)
const timelineDays = computed(() => {
  const base = s2d(selectedDate.value)
  if (viewMode.value === 'day') {
    const ds = d2s(base)
    return [{ ds, dow: TH_DOW[(base.getDay() + 6) % 7], day: base.getDate(), isToday: ds === todayStr, events: eventsOn(ds) }]
  }
  const mon = addDays(base, -((base.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const dt = addDays(mon, i)
    const ds = d2s(dt)
    return { ds, dow: TH_DOW[i], day: dt.getDate(), isToday: ds === todayStr, events: eventsOn(ds) }
  })
})

function timedStyle(ev: any) {
  const [sh, sm] = String(ev.startTime || '09:00').split(':').map(Number)
  const [eh, em] = String(ev.endTime || '10:00').split(':').map(Number)
  const startMin = Math.max(8 * 60, (sh || 9) * 60 + (sm || 0))
  const endMin = Math.max(startMin + 45, (eh || sh + 1) * 60 + (em || 0))
  const top = ((startMin - 8 * 60) / 60) * 52
  const height = Math.max(28, ((endMin - startMin) / 60) * 52)
  return { top: `${top}px`, height: `${height}px` }
}

// Agenda grouped by day in selected month
const agendaDays = computed(() => {
  const ym = `${cursorYear.value}-${String(cursorMonth.value + 1).padStart(2, '0')}`
  const map = new Map<string, any[]>()
  for (const ev of allItems.value) {
    if (String(ev.date).startsWith(ym)) {
      if (!map.has(ev.date)) map.set(ev.date, [])
      map.get(ev.date)!.push(ev)
    }
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ds, list]) => {
      const dt = s2d(ds)
      return {
        ds,
        label: `${dt.getDate()} ${TH_MONTHS[dt.getMonth()]} ${dt.getFullYear() + 543} · วัน${TH_DOW[(dt.getDay() + 6) % 7]}`,
        events: list.sort((a, b) => String(a.startTime || '').localeCompare(String(b.startTime || '')))
      }
    })
})

const upcomingList = computed(() =>
  allItems.value
    .filter((e: any) => e.date >= todayStr)
    .sort((a: any, b: any) => a.date.localeCompare(b.date) || String(a.startTime).localeCompare(String(b.startTime)))
    .slice(0, 7)
)

function openNewEvent(ds = selectedDate.value) {
  editingId.value = null
  readOnlySource.value = null
  Object.assign(form, {
    title: '',
    cat: 'campaign',
    date: ds,
    endDate: ds,
    startTime: '10:00',
    endTime: '11:30',
    allday: false,
    location: 'สำนักงานใหญ่อินเตอร์ไทมส์ / opwatch.co.th',
    notes: '',
    refCode: '',
    assignee: 'ทีมอีคอมเมิร์ซ'
  })
  modalOpen.value = true
}

function openExistingEvent(ev: any) {
  if (!ev.editable) {
    readOnlySource.value = ev
    editingId.value = null
    modalOpen.value = true
    return
  }
  readOnlySource.value = null
  editingId.value = Number(ev.id)
  Object.assign(form, {
    title: ev.title,
    cat: ev.cat || 'campaign',
    date: ev.date,
    endDate: ev.endDate || ev.date,
    startTime: ev.startTime || '09:00',
    endTime: ev.endTime || '10:30',
    allday: Boolean(ev.allday),
    location: ev.location || '',
    notes: ev.notes || '',
    refCode: ev.refCode || '',
    assignee: ev.assignee || ''
  })
  modalOpen.value = true
}

async function fillEventWithAi() {
  if (!form.title.trim()) {
    toast.error('กรุณากรอกชื่อกิจกรรมก่อนเพื่อให้ AI ร่างรายละเอียดให้ตรงหัวข้อ')
    return
  }
  aiFilling.value = true
  try {
    const res = await $fetch<any>('/api/admin/ai/generate', {
      method: 'POST',
      body: {
        task: 'event_detail',
        agentCode: 'OP-PROMO',
        input: { title: form.title, cat: form.cat }
      }
    })
    if (res?.result) {
      if (res.result.location) form.location = res.result.location
      if (res.result.notes) form.notes = res.result.notes
      toast.success('✨ AI ร่างสถานที่และแผนดำเนินงานให้เรียบร้อยแล้ว')
    }
  } catch {
    toast.error('เรียก AI ไม่สำเร็จ')
  } finally {
    aiFilling.value = false
  }
}

async function saveEvent() {
  if (!form.title.trim()) {
    toast.error('กรุณาระบุชื่อกิจกรรม')
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/calendar/${editingId.value}`, { method: 'PUT', body: form })
      toast.success('บันทึกการแก้ไขกิจกรรมแล้ว')
    } else {
      await $fetch('/api/admin/calendar', { method: 'POST', body: form })
      toast.success('เพิ่มกิจกรรมลงปฏิทินเรียบร้อยแล้ว')
    }
    modalOpen.value = false
    await refresh()
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || 'บันทึกกิจกรรมไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}

async function deleteEvent() {
  if (!editingId.value) return
  saving.value = true
  try {
    await $fetch(`/api/admin/calendar/${editingId.value}`, { method: 'DELETE' })
    toast.success('ลบกิจกรรมออกจากปฏิทินแล้ว')
    modalOpen.value = false
    await refresh()
  } catch {
    toast.error('ลบกิจกรรมไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}

// Drag & Drop reschedule
function onDragStart(ev: any) {
  if (!ev.editable) return
  dragEventId.value = Number(ev.id)
}

async function onDropDate(targetDate: string) {
  dropHoverDate.value = null
  if (!dragEventId.value) return
  const id = dragEventId.value
  dragEventId.value = null
  try {
    await $fetch(`/api/admin/calendar/${id}`, {
      method: 'PUT',
      body: { date: targetDate, endDate: targetDate }
    })
    toast.success(`ย้ายกำหนดการไปยังวันที่ ${targetDate} เรียบร้อยแล้ว`)
    await refresh()
  } catch {
    toast.error('ย้ายกำหนดการไม่สำเร็จ')
  }
}

// AI Monthly Plan Generator
async function generateAiMonthlyPlan() {
  aiPlanLoading.value = true
  try {
    const ym = `${cursorYear.value}-${String(cursorMonth.value + 1).padStart(2, '0')}`
    const res = await $fetch<any>('/api/admin/ai/generate', {
      method: 'POST',
      body: {
        task: 'calendar_plan',
        agentCode: 'OP-PROMO',
        input: { yearMonth: ym, theme: aiPlanTheme.value }
      }
    })
    aiPlanPreview.value = res?.result?.events || []
    toast.success(`✨ OP-PROMO สร้างแผนแคมเปญ ${aiPlanPreview.value.length} กิจกรรมแล้ว`)
  } catch {
    toast.error('สร้างแผนปฏิทินด้วย AI ไม่สำเร็จ')
  } finally {
    aiPlanLoading.value = false
  }
}

async function commitAiMonthlyPlan() {
  if (!aiPlanPreview.value.length) return
  aiPlanLoading.value = true
  try {
    for (const ev of aiPlanPreview.value) {
      await $fetch('/api/admin/calendar', { method: 'POST', body: ev })
    }
    toast.success(`บันทึกแผนกิจกรรม AI ทั้ง ${aiPlanPreview.value.length} รายการลงปฏิทินแล้ว!`)
    aiPlanOpen.value = false
    aiPlanPreview.value = []
    await refresh()
  } catch {
    toast.error('บันทึกแผนกิจกรรมไม่สำเร็จ')
  } finally {
    aiPlanLoading.value = false
  }
}

useHead({ title: 'ปฏิทินงาน & แคมเปญ · OPWatch Smart ERP' })
</script>

<template>
  <div class="cal-shell" :class="{ 'is-fullscreen': fullscreen }">
    <!-- Contextual Left Panel (Mini Calendar + Filters + AI Planner) -->
    <aside v-if="!fullscreen" class="cal-side card">
      <button type="button" class="erp-btn erp-btn--primary" style="width: 100%" @click="openNewEvent(selectedDate)">
        <OfficeMngIcon name="plus" :size="16" />
        <span>เพิ่มกิจกรรม / นัดหมาย</span>
      </button>

      <button type="button" class="cal-ai-btn" @click="aiPlanOpen = true">
        <OfficeMngIcon name="sparkles" :size="16" />
        <span>ให้ AI วางแผนปฏิทินเดือนนี้</span>
      </button>

      <!-- Mini Calendar -->
      <div class="mini-cal">
        <div class="mc-head">
          <b>{{ TH_MONTHS[cursorMonth] }} {{ cursorYear + 543 }}</b>
          <div style="display: flex; gap: 4px">
            <button type="button" class="mc-nav" @click="stepCalendar(-1)">‹</button>
            <button type="button" class="mc-nav" @click="stepCalendar(1)">›</button>
          </div>
        </div>
        <div class="mc-grid">
          <span v-for="d in TH_DOW_MINI" :key="d" class="mc-dow">{{ d }}</span>
          <template v-for="(wk, wi) in monthWeeks" :key="wi">
            <button
              v-for="cell in wk"
              :key="cell.ds"
              type="button"
              class="mc-day"
              :class="{
                dim: cell.dim,
                today: cell.isToday,
                sel: cell.isSelected,
                'has-ev': cell.hasDot
              }"
              @click="selectedDate = cell.ds"
            >
              {{ cell.day }}
            </button>
          </template>
        </div>
      </div>

      <!-- Category Chips -->
      <div class="cal-side-sec">
        <h3>หมวดหมู่ปฏิทิน</h3>
        <div class="cal-cat-list">
          <button
            v-for="(meta, key) in CATS"
            :key="key"
            type="button"
            class="cal-cat-chip"
            :class="{ on: activeCats.includes(key) }"
            @click="toggleCat(key)"
          >
            <i :style="{ background: meta.color }" />
            <span>{{ meta.label }}</span>
          </button>
        </div>
      </div>

      <!-- Upcoming Schedule -->
      <div class="cal-side-sec">
        <h3>กำหนดการที่กำลังจะมาถึง</h3>
        <div v-if="upcomingList.length" class="up-list">
          <button
            v-for="ev in upcomingList"
            :key="ev.uid"
            type="button"
            class="up-row"
            @click="openExistingEvent(ev)"
          >
            <i :style="{ background: CATS[ev.cat]?.color || '#6c5ce7' }" />
            <div>
              <b>{{ ev.title }}</b>
              <small>{{ ev.date }} · {{ ev.allday ? 'ตลอดวัน' : ev.startTime }}</small>
            </div>
          </button>
        </div>
        <p v-else style="font-size: 12px; color: var(--muted)">ยังไม่มีกำหนดการถัดไป</p>
      </div>
    </aside>

    <!-- Main Full-Width Calendar Board -->
    <section class="cal-main card">
      <!-- Toolbar matched to ProAke/mng-erp -->
      <div class="cal-toolbar">
        <h2>{{ headerTitle }}</h2>
        <div class="cal-nav">
          <button type="button" class="mng-icon-btn" @click="stepCalendar(-1)">
            <OfficeMngIcon name="chevL" :size="16" />
          </button>
          <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="goToday">วันนี้</button>
          <button type="button" class="mng-icon-btn" @click="stepCalendar(1)">
            <OfficeMngIcon name="chevR" :size="16" />
          </button>
        </div>

        <div class="cal-legend">
          <span v-for="(meta, key) in CATS" :key="key" class="lg">
            <i :style="{ background: meta.color }" />{{ meta.label }}
          </span>
        </div>

        <div class="cal-view-sw">
          <button type="button" :class="{ on: viewMode === 'month' }" @click="viewMode = 'month'">เดือน</button>
          <button type="button" :class="{ on: viewMode === 'week' }" @click="viewMode = 'week'">สัปดาห์</button>
          <button type="button" :class="{ on: viewMode === 'day' }" @click="viewMode = 'day'">วัน</button>
          <button type="button" :class="{ on: viewMode === 'agenda' }" @click="viewMode = 'agenda'">กำหนดการ</button>
        </div>

        <button
          type="button"
          class="mng-icon-btn"
          :title="fullscreen ? 'ย่อกลับ' : 'ขยายปฏิทินเต็มจอ'"
          @click="fullscreen = !fullscreen"
        >
          <OfficeMngIcon name="fullscreen" :size="16" />
        </button>
      </div>

      <!-- MONTH VIEW -->
      <div v-if="viewMode === 'month'" class="cal-grid">
        <div class="cal-dow">
          <div v-for="d in TH_DOW" :key="d">{{ d }}</div>
        </div>
        <div class="cal-weeks">
          <div v-for="(wk, wi) in monthWeeks" :key="wi" class="cal-wk">
            <div
              v-for="cell in wk"
              :key="cell.ds"
              class="cal-cell"
              :class="{
                dim: cell.dim,
                today: cell.isToday,
                wkend: cell.isWeekend,
                'drop-ok': dropHoverDate === cell.ds
              }"
              @dragover.prevent="dropHoverDate = cell.ds"
              @dragleave="dropHoverDate = null"
              @drop.prevent="onDropDate(cell.ds)"
              @dblclick="openNewEvent(cell.ds)"
            >
              <div class="cal-cell__hd">
                <button
                  type="button"
                  class="cal-dnum"
                  @click="
                    selectedDate = cell.ds;
                    viewMode = 'day'
                  "
                >
                  {{ cell.day }}
                </button>
                <button type="button" class="cal-add" title="เพิ่มกิจกรรม" @click="openNewEvent(cell.ds)">+</button>
              </div>

              <div class="cal-cell__evs">
                <button
                  v-for="ev in cell.events"
                  :key="ev.uid"
                  type="button"
                  class="cal-ev"
                  :class="CATS[ev.cat]?.cls || 'ev-campaign'"
                  :draggable="ev.editable"
                  @dragstart="onDragStart(ev)"
                  @click="openExistingEvent(ev)"
                >
                  <b v-if="!ev.allday && ev.startTime && ev.startTime !== '00:00'">{{ ev.startTime }}</b>
                  <span>{{ ev.title }}</span>
                </button>
                <button
                  v-if="cell.more > 0"
                  type="button"
                  class="cal-more"
                  @click="
                    selectedDate = cell.ds;
                    viewMode = 'day'
                  "
                >
                  +{{ cell.more }} รายการเพิ่มเติม
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- WEEK & DAY TIMELINE VIEW -->
      <div v-else-if="viewMode === 'week' || viewMode === 'day'" class="wk-wrap">
        <div class="wk-head" :style="{ '--cols': timelineDays.length }">
          <div class="wh-time">เวลา</div>
          <div
            v-for="col in timelineDays"
            :key="col.ds"
            class="wh-cell"
            :class="{ today: col.isToday }"
          >
            <span>{{ col.dow }}</span>
            <b>{{ col.day }}</b>
          </div>
        </div>

        <div class="wk-body" :style="{ '--cols': timelineDays.length }">
          <div class="wk-times">
            <div v-for="hr in timelineHours" :key="hr">{{ hr }}</div>
          </div>
          <div
            v-for="col in timelineDays"
            :key="col.ds"
            class="wk-col"
            :class="{ 'today-col': col.isToday, 'drop-ok': dropHoverDate === col.ds }"
            @dragover.prevent="dropHoverDate = col.ds"
            @dragleave="dropHoverDate = null"
            @drop.prevent="onDropDate(col.ds)"
            @dblclick="openNewEvent(col.ds)"
          >
            <div class="wk-allday">
              <button
                v-for="ev in col.events.filter((e: any) => e.allday)"
                :key="ev.uid"
                type="button"
                class="cal-ev"
                :class="CATS[ev.cat]?.cls || 'ev-campaign'"
                @click="openExistingEvent(ev)"
              >
                ตลอดวัน · {{ ev.title }}
              </button>
            </div>
            <div class="wk-slots">
              <div v-for="hr in timelineHours" :key="hr" class="wk-slot-line" />
              <button
                v-for="ev in col.events.filter((e: any) => !e.allday)"
                :key="ev.uid"
                type="button"
                class="wk-ev"
                :class="CATS[ev.cat]?.cls || 'ev-campaign'"
                :style="timedStyle(ev)"
                :draggable="ev.editable"
                @dragstart="onDragStart(ev)"
                @click="openExistingEvent(ev)"
              >
                <small>{{ ev.startTime }}{{ ev.endTime ? `–${ev.endTime}` : '' }}</small>
                <b>{{ ev.title }}</b>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- AGENDA VIEW -->
      <div v-else class="agenda-wrap">
        <template v-if="agendaDays.length">
          <div v-for="grp in agendaDays" :key="grp.ds" class="ag-group">
            <div class="ag-day">
              <span>{{ grp.label }}</span>
              <span class="badge b-purple">{{ grp.events.length }} รายการ</span>
            </div>
            <div
              v-for="ev in grp.events"
              :key="ev.uid"
              class="ag-row"
              @click="openExistingEvent(ev)"
            >
              <span class="ag-time">{{ ev.allday ? 'ตลอดวัน' : `${ev.startTime}${ev.endTime ? ' – ' + ev.endTime : ''}` }}</span>
              <span class="ag-bar" :style="{ background: CATS[ev.cat]?.color || '#6c5ce7' }" />
              <div class="ag-main">
                <b>{{ ev.title }}</b>
                <small>{{ CATS[ev.cat]?.label || ev.cat }} {{ ev.location ? `· 📍 ${ev.location}` : '' }}</small>
              </div>
              <span v-if="ev.refCode" class="badge b-blue">{{ ev.refCode }}</span>
              <span class="badge b-grey">{{ ev.editable ? 'แก้ไขได้' : 'ซิงก์อัตโนมัติ' }}</span>
            </div>
          </div>
        </template>
        <div v-else style="padding: 48px; text-align: center; color: var(--muted)">
          ไม่มีกิจกรรมในเดือนนี้ — กดปุ่ม <b>"+ เพิ่มกิจกรรม"</b> หรือ <b>"✨ ให้ AI วางแผนปฏิทินเดือนนี้"</b> ได้เลย
        </div>
      </div>
    </section>

    <!-- Event Create / Edit / View Modal -->
    <div v-if="modalOpen" class="erp-modal-backdrop" @click.self="modalOpen = false">
      <div class="erp-modal" style="max-width: 640px">
        <!-- Read-only auto-synced Promotion / Coupon / Order event -->
        <template v-if="readOnlySource">
          <div class="erp-card__head">
            <div>
              <span class="badge b-purple" style="margin-bottom: 6px">ซิงก์อัตโนมัติจากระบบอีคอมเมิร์ซ</span>
              <div class="erp-card__title">{{ readOnlySource.title }}</div>
            </div>
            <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="modalOpen = false">✕</button>
          </div>
          <p style="font-size: 13.5px; color: var(--ink-2)">
            <b>วันที่:</b> {{ readOnlySource.date }} ({{ readOnlySource.allday ? 'ตลอดวัน' : readOnlySource.startTime }})<br />
            <b>สถานที่ / ช่องทาง:</b> {{ readOnlySource.location || '-' }}<br />
            <b>รายละเอียด:</b> {{ readOnlySource.notes || '-' }}
          </p>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px">
            <button type="button" class="erp-btn erp-btn--ghost" @click="modalOpen = false">ปิด</button>
            <NuxtLink
              v-if="readOnlySource.linkUrl"
              :to="readOnlySource.linkUrl"
              class="erp-btn erp-btn--primary"
              @click="modalOpen = false"
            >
              เปิดหน้าจัดการรายการนี้ →
            </NuxtLink>
          </div>
        </template>

        <!-- Editable Calendar Event Form -->
        <template v-else>
          <div class="erp-card__head">
            <div>
              <div class="erp-card__title">{{ editingId ? 'แก้ไขกิจกรรมในปฏิทิน' : 'เพิ่มกิจกรรม / แคมเปญใหม่' }}</div>
              <div class="erp-card__sub">ลากย้ายวันบนตารางปฏิทินได้ทันทีหลังบันทึก</div>
            </div>
            <button
              type="button"
              class="erp-btn erp-btn--ghost erp-btn--sm"
              :disabled="aiFilling"
              @click="fillEventWithAi"
            >
              {{ aiFilling ? 'กำลังร่าง...' : '✨ ให้ AI ช่วยร่างแผนงาน' }}
            </button>
          </div>

          <div class="erp-form-grid">
            <div class="erp-field erp-field--full">
              <label class="erp-label">ชื่อกิจกรรม / นัดหมาย *</label>
              <input v-model="form.title" class="erp-input" placeholder="เช่น เปิดตัวแคมเปญ Olym Pianus ลดสูงสุด 30%" />
            </div>
            <div class="erp-field">
              <label class="erp-label">หมวดหมู่สี</label>
              <select v-model="form.cat" class="erp-select">
                <option v-for="(meta, k) in CATS" :key="k" :value="k">{{ meta.label }}</option>
              </select>
            </div>
            <div class="erp-field">
              <label class="erp-label">ผู้รับผิดชอบ / ทีมงาน</label>
              <input v-model="form.assignee" class="erp-input" placeholder="ทีมการตลาด / ฝ่ายจัดส่ง" />
            </div>
            <div class="erp-field">
              <label class="erp-label">วันที่ *</label>
              <input v-model="form.date" type="date" class="erp-input" />
            </div>
            <div class="erp-field" style="justify-content: flex-end">
              <label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 600">
                <input v-model="form.allday" type="checkbox" />
                กิจกรรมตลอดทั้งวัน (All-day)
              </label>
            </div>
            <template v-if="!form.allday">
              <div class="erp-field">
                <label class="erp-label">เวลาเริ่ม</label>
                <input v-model="form.startTime" type="time" class="erp-input" />
              </div>
              <div class="erp-field">
                <label class="erp-label">เวลาสิ้นสุด</label>
                <input v-model="form.endTime" type="time" class="erp-input" />
              </div>
            </template>
            <div class="erp-field">
              <label class="erp-label">สถานที่ / ช่องทางออนไลน์</label>
              <input v-model="form.location" class="erp-input" placeholder="โชว์รูมเพชรบุรีตัดใหม่ / Google Meet" />
            </div>
            <div class="erp-field">
              <label class="erp-label">รหัสอ้างอิงแคมเปญ</label>
              <input v-model="form.refCode" class="erp-input" placeholder="เช่น MKT-11" />
            </div>
            <div class="erp-field erp-field--full">
              <label class="erp-label">รายละเอียด / วาระงาน</label>
              <textarea v-model="form.notes" rows="3" class="erp-textarea" placeholder="บันทึกรายละเอียดงาน หรือกดปุ่ม ✨ ให้ AI ช่วยร่างแผนงาน..." />
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 18px; gap: 8px">
            <button v-if="editingId" type="button" class="erp-btn erp-btn--danger" :disabled="saving" @click="deleteEvent">
              🗑 ลบกิจกรรม
            </button>
            <span v-else />
            <div style="display: flex; gap: 8px">
              <button type="button" class="erp-btn erp-btn--ghost" @click="modalOpen = false">ยกเลิก</button>
              <button type="button" class="erp-btn erp-btn--primary" :disabled="saving" @click="saveEvent">
                {{ saving ? 'กำลังบันทึก...' : 'บันทึกกิจกรรม' }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- AI Monthly Campaign Calendar Planner Modal -->
    <div v-if="aiPlanOpen" class="erp-modal-backdrop" @click.self="aiPlanOpen = false">
      <div class="erp-modal" style="max-width: 720px">
        <div class="erp-card__head">
          <div>
            <div class="erp-card__title">✨ AI วางแผนปฏิทินแคมเปญประจำเดือน ({{ TH_MONTHS[cursorMonth] }} {{ cursorYear + 543 }})</div>
            <div class="erp-card__sub">ให้ OP-PROMO คิดตารางแคมเปญ คอนเทนต์ และการตรวจเช็คสต็อกทั้งเดือนพร้อมบันทึกลงปฏิทินในคลิกเดียว</div>
          </div>
          <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="aiPlanOpen = false">✕</button>
        </div>

        <div style="display: flex; gap: 8px">
          <input
            v-model="aiPlanTheme"
            class="erp-input"
            placeholder="ระบุธีมประจำเดือน เช่น โปรโมชั่นของขวัญปีใหม่ นาฬิกาคู่รัก Olym Pianus..."
          />
          <button type="button" class="erp-btn erp-btn--primary" :disabled="aiPlanLoading" @click="generateAiMonthlyPlan">
            {{ aiPlanLoading ? 'กำลังคิดแผน...' : '✨ สร้างแผน 5 กิจกรรม' }}
          </button>
        </div>

        <div v-if="aiPlanPreview.length" style="margin-top: 14px; display: flex; flex-direction: column; gap: 8px">
          <div
            v-for="(ev, idx) in aiPlanPreview"
            :key="idx"
            style="padding: 10px 14px; border-radius: 12px; border: 1px solid var(--line); background: var(--bg)"
          >
            <div style="display: flex; justify-content: space-between; gap: 8px">
              <b>{{ ev.date }} · {{ ev.title }}</b>
              <span class="badge b-purple">{{ CATS[ev.cat]?.label || ev.cat }}</span>
            </div>
            <small style="color: var(--muted)">{{ ev.notes }}</small>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px">
            <button type="button" class="erp-btn erp-btn--primary" :disabled="aiPlanLoading" @click="commitAiMonthlyPlan">
              ✓ บันทึกทั้ง {{ aiPlanPreview.length }} กิจกรรมลงปฏิทินทันที
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cal-shell {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}
.cal-shell.is-fullscreen {
  grid-template-columns: 1fr;
}

.cal-side {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
}
.cal-ai-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 12px;
  border-radius: 11px;
  border: 1px solid #d5cefb;
  background: var(--violet-soft);
  color: var(--violet);
  font-weight: 700;
  font-size: 12.5px;
  font-family: inherit;
  cursor: pointer;
}
.cal-ai-btn:hover { background: var(--violet); color: #ffffff; }

/* Mini Calendar */
.mini-cal {
  padding: 12px;
  border-radius: 14px;
  background: var(--bg);
  border: 1px solid var(--line);
}
.mc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; }
.mc-nav {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  border: 1px solid var(--line);
  background: #ffffff;
  cursor: pointer;
}
.mc-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; text-align: center; }
.mc-dow { font-size: 10.5px; font-weight: 700; color: var(--muted); padding-bottom: 4px; }
.mc-day {
  position: relative;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font-size: 11.5px;
  color: var(--ink);
  cursor: pointer;
  font-family: inherit;
}
.mc-day.dim { color: #b9bed8; }
.mc-day.sel { background: var(--violet-soft); color: var(--violet); font-weight: 700; }
.mc-day.today { background: var(--violet); color: #ffffff; font-weight: 700; }
.mc-day.has-ev::after {
  content: '';
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
}

.cal-side-sec h3 {
  margin: 0 0 8px;
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
}
.cal-cat-list { display: flex; flex-direction: column; gap: 5px; }
.cal-cat-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 9px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--muted);
  font-size: 12.5px;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
}
.cal-cat-chip.on {
  background: var(--bg);
  border-color: var(--line);
  color: var(--ink);
  font-weight: 600;
}
.cal-cat-chip i { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }

.up-list { display: flex; flex-direction: column; gap: 6px; }
.up-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 9px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--bg);
  text-align: left;
  cursor: pointer;
  font-family: inherit;
}
.up-row:hover { border-color: var(--violet); }
.up-row i { width: 4px; height: 28px; border-radius: 4px; flex-shrink: 0; margin-top: 2px; }
.up-row b { display: block; font-size: 12px; color: var(--ink); line-height: 1.3; }
.up-row small { font-size: 11px; color: var(--muted); }

/* Main Calendar Board */
.cal-main { padding: 18px; min-height: 680px; display: flex; flex-direction: column; }
.cal-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.cal-toolbar h2 { margin: 0; font-size: 20px; font-weight: 700; color: var(--ink); min-width: 180px; }
.cal-nav { display: inline-flex; align-items: center; gap: 6px; }
.cal-legend { display: flex; gap: 12px; flex-wrap: wrap; margin-left: auto; font-size: 11.5px; color: var(--ink-2); }
.cal-legend .lg { display: inline-flex; align-items: center; gap: 5px; }
.cal-legend i { width: 8px; height: 8px; border-radius: 50%; }

.cal-view-sw {
  display: inline-flex;
  background: var(--panel);
  border: 1px solid var(--line);
  padding: 3px;
  border-radius: 11px;
  gap: 2px;
}
.cal-view-sw button {
  border: 0;
  background: transparent;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink-2);
  font-family: inherit;
  cursor: pointer;
}
.cal-view-sw button.on { background: var(--violet); color: #ffffff; }

/* Month Grid */
.cal-grid { flex: 1; display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
.cal-dow {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--bg);
  border-bottom: 1px solid var(--line);
}
.cal-dow div {
  padding: 9px 10px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-2);
}
.cal-weeks { flex: 1; display: flex; flex-direction: column; }
.cal-wk {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  min-height: 116px;
}
.cal-cell {
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  padding: 6px 7px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.cal-cell:nth-child(7n) { border-right: 0; }
.cal-cell.wkend { background: #fcfcff; }
.cal-cell.dim { background: #f8f9fd; opacity: 0.62; }
.cal-cell.today { background: #faf9ff; box-shadow: inset 0 0 0 1.5px var(--violet); }
.cal-cell.drop-ok { background: var(--violet-soft); }

.cal-cell__hd { display: flex; justify-content: space-between; align-items: center; }
.cal-dnum {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 0;
  background: transparent;
  font-weight: 700;
  font-size: 12.5px;
  color: var(--ink);
  cursor: pointer;
}
.cal-cell.today .cal-dnum { background: var(--violet); color: #ffffff; }
.cal-add {
  opacity: 0;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: #ffffff;
  color: var(--violet);
  font-weight: 700;
  cursor: pointer;
}
.cal-cell:hover .cal-add { opacity: 1; }

.cal-cell__evs { display: flex; flex-direction: column; gap: 3px; }
.cal-ev {
  width: 100%;
  text-align: left;
  border: 0;
  border-left: 3px solid var(--violet);
  border-radius: 6px;
  padding: 3px 6px;
  font-size: 11px;
  font-family: inherit;
  background: var(--violet-soft);
  color: var(--violet);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  display: flex;
  gap: 4px;
}
.ev-campaign { background: var(--violet-soft); color: var(--violet); border-left-color: var(--violet); }
.ev-order { background: var(--yellow-soft); color: #b45309; border-left-color: var(--amber); }
.ev-meeting { background: var(--blue-soft); color: #1d64d8; border-left-color: var(--blue); }
.ev-deadline { background: var(--red-soft); color: #e11d48; border-left-color: var(--red); }
.ev-ai { background: var(--mint-soft); color: #0e9f6e; border-left-color: var(--mint); }
.ev-holiday { background: var(--pink-soft); color: #db2777; border-left-color: var(--pink); }

.cal-more {
  border: 0;
  background: transparent;
  color: var(--violet);
  font-size: 10.5px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

/* Week / Day Timeline */
.wk-wrap { border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
.wk-head {
  display: grid;
  grid-template-columns: 64px repeat(var(--cols, 7), minmax(0, 1fr));
  background: var(--bg);
  border-bottom: 1px solid var(--line);
}
.wh-time { padding: 10px 6px; text-align: center; font-size: 11px; color: var(--muted); }
.wh-cell {
  padding: 8px;
  text-align: center;
  border-left: 1px solid var(--line);
}
.wh-cell span { display: block; font-size: 11px; color: var(--muted); }
.wh-cell b { font-size: 15px; color: var(--ink); }
.wh-cell.today b {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--violet);
  color: #ffffff;
}
.wk-body {
  display: grid;
  grid-template-columns: 64px repeat(var(--cols, 7), minmax(0, 1fr));
  max-height: 620px;
  overflow-y: auto;
}
.wk-times div {
  height: 52px;
  padding: 4px 6px;
  font-size: 11px;
  color: var(--muted);
  text-align: right;
  border-bottom: 1px solid #f2f3fa;
}
.wk-col { border-left: 1px solid var(--line); background: #ffffff; }
.wk-col.today-col { background: #fcfbff; }
.wk-allday { padding: 4px; display: flex; flex-direction: column; gap: 3px; border-bottom: 1px solid var(--line); min-height: 28px; }
.wk-slots { position: relative; height: calc(13 * 52px); }
.wk-slot-line { height: 52px; border-bottom: 1px dashed #eef0f8; }
.wk-ev {
  position: absolute;
  left: 4px;
  right: 4px;
  border: 0;
  border-left: 3px solid var(--violet);
  border-radius: 8px;
  padding: 4px 7px;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.wk-ev small { display: block; font-size: 10px; opacity: 0.85; }
.wk-ev b { font-size: 11.5px; }

/* Agenda View */
.agenda-wrap { display: flex; flex-direction: column; gap: 14px; }
.ag-day {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--bg);
  font-weight: 700;
  color: var(--ink);
}
.ag-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-bottom: 1px solid var(--line);
  cursor: pointer;
}
.ag-row:hover { background: var(--hover); border-radius: 10px; }
.ag-time { width: 115px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--ink-2); flex-shrink: 0; }
.ag-bar { width: 4px; height: 32px; border-radius: 4px; flex-shrink: 0; }
.ag-main { flex: 1; min-width: 0; }
.ag-main b { display: block; font-size: 13.5px; color: var(--ink); }
.ag-main small { color: var(--muted); font-size: 12px; }

@media (max-width: 1060px) {
  .cal-shell { grid-template-columns: 1fr; }
  .cal-legend { display: none; }
}
</style>
