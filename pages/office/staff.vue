<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const officeAuth = useOfficeAuth()
const toast = useToast()

const roleTab = ref<'all' | 'ceo' | 'it_admin' | 'marketing_sales' | 'warehouse' | 'dealer'>('all')
const search = ref('')

const { data, refresh } = await useFetch<any>('/api/admin/staff')
const { data: branchesRes } = await useFetch<any>('/api/admin/branches')

const items = computed(() => data.value?.items || [])
const branches = computed(() => branchesRes.value?.items || branchesRes.value?.branches || [])

const roleCards = [
  {
    key: 'ceo' as const,
    title: 'CEO (ผู้บริหารสูงสุด)',
    color: '#6c5ce7',
    bg: '#efedfd',
    desc: 'สิทธิ์สูงสุด ดูภาพรวมธุรกิจ รายได้ สต็อก 5 ช่องทาง เจ้าหน้าที่ ตัวแทนจำหน่าย และตั้งค่าทั้งหมด'
  },
  {
    key: 'it_admin' as const,
    title: 'IT. Admin (ผู้ดูแลระบบ)',
    color: '#3ba7ff',
    bg: '#e9f3ff',
    desc: 'ดูแลระบบเทคนิค ฐานข้อมูล จัดการสิทธิ์ 5 บทบาท ตั้งค่า AI / Hermes Pool และโครงสร้างเว็บทั้งหมด'
  },
  {
    key: 'marketing_sales' as const,
    title: 'Marketing / Sales',
    color: '#ff6b9d',
    bg: '#ffeef4',
    desc: 'เห็นสินค้าราคาขายปลีก การจัดส่งสินค้า ข้อมูลสมาชิกและลูกค้า โปรโมชั่น และเนื้อหาเว็บ Tree CMS + AI'
  },
  {
    key: 'warehouse' as const,
    title: 'คลังสินค้า (5 ช่องทาง)',
    color: '#22c793',
    bg: '#e5f9f2',
    desc: 'เห็นสินค้าและบริหารคลังแยก 5 ช่องทาง: Opwatch Web, Shopee, Lazada, TikTok Shop และตัวแทนจำหน่าย'
  },
  {
    key: 'dealer' as const,
    title: 'ตัวแทนจำหน่าย (Dealer)',
    color: '#ffb020',
    bg: '#fff6e4',
    desc: 'เห็นราคาเฉพาะตัวแทนจำหน่าย คลังสินค้าตัวแทนเอง โปรโมชั่น การรับสินค้าหน้าร้าน และแจ้งซ่อม/รับประกัน'
  }
]

const filteredItems = computed(() => {
  const q = search.value.trim().toLowerCase()
  return items.value.filter((u: any) => {
    if (roleTab.value !== 'all' && u.role !== roleTab.value) return false
    if (!q) return true
    return `${u.name || ''} ${u.email || ''} ${u.code || ''} ${u.dealerCode || ''} ${u.dealerName || ''} ${u.department || ''}`
      .toLowerCase()
      .includes(q)
  })
})

function countByRole(r: string) {
  return items.value.filter((u: any) => u.role === r).length
}

const showModal = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)

// Quick Password Reset Modal for any Officer / Dealer
const quickPwOpen = ref(false)
const quickPwTarget = ref<any>(null)
const quickPwValue = ref('')
const quickPwSaving = ref(false)

function openQuickPw(u: any) {
  quickPwTarget.value = u
  quickPwValue.value = ''
  quickPwOpen.value = true
}

async function submitQuickPw() {
  if (!quickPwTarget.value) return
  if (quickPwValue.value.trim().length < 6) {
    toast.error('กรุณากำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร')
    return
  }
  quickPwSaving.value = true
  try {
    await $fetch(`/api/admin/staff/${quickPwTarget.value.id}`, {
      method: 'PUT',
      body: { password: quickPwValue.value.trim() }
    })
    toast.success(`กำหนดรหัสผ่านใหม่ให้ "${quickPwTarget.value.name}" (${quickPwTarget.value.email}) สำเร็จ`)
    quickPwOpen.value = false
    quickPwValue.value = ''
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'ไม่สามารถเปลี่ยนรหัสผ่านได้')
  } finally {
    quickPwSaving.value = false
  }
}
const form = reactive({
  code: '',
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'marketing_sales' as 'ceo' | 'it_admin' | 'marketing_sales' | 'warehouse' | 'dealer',
  department: '',
  position: '',
  dealerCode: '',
  dealerName: '',
  dealerTier: 'Gold',
  discountPct: 30,
  branchSlug: '',
  status: 'active'
})

function openCreate(defaultRole: typeof form.role = 'marketing_sales') {
  editingId.value = null
  Object.assign(form, {
    code: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    role: defaultRole,
    department: defaultRole === 'dealer' ? 'เครือข่ายตัวแทนจำหน่าย' : '',
    position: '',
    dealerCode: defaultRole === 'dealer' ? `DLR-TH-${String(items.value.length + 1).padStart(2, '0')}` : '',
    dealerName: '',
    dealerTier: 'Gold',
    discountPct: 30,
    branchSlug: '',
    status: 'active'
  })
  showModal.value = true
}

function openEdit(u: any) {
  editingId.value = Number(u.id)
  Object.assign(form, {
    code: u.code || '',
    name: u.name || '',
    email: u.email || '',
    password: '',
    phone: u.phone || '',
    role: u.role || 'marketing_sales',
    department: u.department || '',
    position: u.position || '',
    dealerCode: u.dealerCode || '',
    dealerName: u.dealerName || '',
    dealerTier: u.dealerTier || 'Gold',
    discountPct: Number(u.discountPct ?? 30),
    branchSlug: u.branchSlug || '',
    status: u.status || 'active'
  })
  showModal.value = true
}

async function saveOfficer() {
  if (!form.name.trim() || !form.email.trim()) {
    toast.error('กรุณากรอกชื่อและอีเมลให้ครบถ้วน')
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/staff/${editingId.value}`, { method: 'PUT', body: { ...form } })
      toast.success('อัปเดตสิทธิ์เจ้าหน้าที่ / ตัวแทนจำหน่ายเรียบร้อย')
    } else {
      if (form.password.length < 6) {
        toast.error('กรุณากำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร')
        saving.value = false
        return
      }
      await $fetch('/api/admin/staff', { method: 'POST', body: { ...form } })
      toast.success('เพิ่มบัญชีเจ้าหน้าที่ / ตัวแทนจำหน่ายสำเร็จ')
    }
    showModal.value = false
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'บันทึกข้อมูลไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}

async function removeOfficer(u: any) {
  if (!import.meta.client || !window.confirm(`ยืนยันการลบบัญชี "${u.name}" ออกจากระบบหลังบ้าน?`)) return
  try {
    await $fetch(`/api/admin/staff/${u.id}`, { method: 'DELETE' })
    toast.success('ลบบัญชีเรียบร้อย')
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'ไม่สามารถลบบัญชีได้')
  }
}

function roleBadgeStyle(role: string) {
  const found = roleCards.find((r) => r.key === role)
  return found ? { background: found.bg, color: found.color, borderColor: `${found.color}33` } : {}
}

useHead({ title: 'เจ้าหน้าที่และตัวแทนจำหน่าย (5 Roles RBAC) — OPWatch ERP' })
</script>

<template>
  <div>
    <div class="erp-page-head">
      <div>
        <div class="erp-kicker">OFFICERS &amp; AUTHORIZED DEALERS · 5-ROLE RBAC</div>
        <h1 class="erp-h1">เจ้าหน้าที่และตัวแทนจำหน่าย ({{ items.length }} บัญชี)</h1>
        <p class="erp-sub">
          แยกออกจากข้อมูลสมาชิกและลูกค้าหน้าเว็บไซต์อย่างเด็ดขาด — ลูกค้าหน้าเว็บไม่สามารถเข้าระบบหลังบ้าน (/office) ได้
        </p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <NuxtLink to="/office/manual" class="erp-btn erp-btn--ghost">
          📘 คู่มือระบบ &amp; รหัสผ่าน
        </NuxtLink>
        <NuxtLink to="/office/settings?tab=security" class="erp-btn erp-btn--ghost">
          🔐 รหัสซิงก์ Shopee
        </NuxtLink>
        <NuxtLink to="/office/customers" class="erp-btn erp-btn--ghost">
          ดูข้อมูลสมาชิก &amp; ลูกค้าหน้าเว็บ →
        </NuxtLink>
        <button type="button" class="erp-btn erp-btn--ghost" @click="openCreate('dealer')">
          + เพิ่มตัวแทนจำหน่าย
        </button>
        <button type="button" class="erp-btn erp-btn--primary" @click="openCreate('marketing_sales')">
          + เพิ่มเจ้าหน้าที่ใหม่
        </button>
      </div>
    </div>

    <!-- 5-Role Permission Overview Cards -->
    <div class="rbac-grid">
      <button
        v-for="rc in roleCards"
        :key="rc.key"
        type="button"
        class="rbac-card"
        :class="{ active: roleTab === rc.key }"
        :style="{ '--rc': rc.color, '--rbg': rc.bg }"
        @click="roleTab = roleTab === rc.key ? 'all' : rc.key"
      >
        <div class="rbac-card__top">
          <span class="rbac-card__pill">{{ rc.title }}</span>
          <strong class="rbac-card__num">{{ countByRole(rc.key) }}</strong>
        </div>
        <p class="rbac-card__desc">{{ rc.desc }}</p>
      </button>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="erp-panel" style="margin-bottom:16px">
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between">
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button type="button" class="erp-btn erp-btn--sm" :class="roleTab === 'all' ? 'erp-btn--primary' : 'erp-btn--ghost'" @click="roleTab = 'all'">
            ทั้งหมด ({{ items.length }})
          </button>
          <button
            v-for="rc in roleCards"
            :key="rc.key"
            type="button"
            class="erp-btn erp-btn--sm"
            :class="roleTab === rc.key ? 'erp-btn--primary' : 'erp-btn--ghost'"
            @click="roleTab = rc.key"
          >
            {{ rc.title.split(' (')[0] }} ({{ countByRole(rc.key) }})
          </button>
        </div>
        <input
          v-model="search"
          class="erp-input"
          style="max-width:300px"
          placeholder="ค้นหาชื่อ อีเมล รหัสเจ้าหน้าที่ หรือชื่อร้านตัวแทน..."
        />
      </div>
    </div>

    <!-- Officers & Dealers Table -->
    <div class="erp-panel">
      <div class="erp-table-wrap">
        <table class="erp-table">
          <thead>
            <tr>
              <th>รหัส</th>
              <th>ชื่อเจ้าหน้าที่ / ร้านตัวแทนจำหน่าย</th>
              <th>บทบาทและระดับสิทธิ์ (5 Roles)</th>
              <th>แผนก / เงื่อนไขตัวแทน</th>
              <th>สถานะ</th>
              <th>เข้าสู่ระบบล่าสุด</th>
              <th style="text-align:right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in filteredItems" :key="u.id">
              <td>
                <code style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#6c5ce7;font-weight:700">
                  {{ u.dealerCode || u.code || `OFC-${u.id}` }}
                </code>
              </td>
              <td>
                <div style="font-weight:600;color:#23264d">{{ u.name }}</div>
                <div style="font-size:12px;color:#8a8fb1">{{ u.email }} <span v-if="u.phone">· {{ u.phone }}</span></div>
              </td>
              <td>
                <span class="role-chip" :style="roleBadgeStyle(u.role)">
                  {{ u.roleLabelTh || u.role }}
                </span>
              </td>
              <td style="font-size:12.5px">
                <template v-if="u.role === 'dealer'">
                  <div><strong>{{ u.dealerName || u.name }}</strong> ({{ u.dealerTier || 'Gold' }})</div>
                  <div style="color:#22c793;font-weight:600">ส่วนลดราคาส่งตัวแทน {{ u.discountPct || 30 }}%</div>
                  <div v-if="u.branchSlug" style="color:#8a8fb1">จุดรับหน้าร้าน: {{ u.branchSlug }}</div>
                </template>
                <template v-else>
                  <div>{{ u.department || 'สำนักงานใหญ่อินเตอร์ไทมส์' }}</div>
                  <div style="color:#8a8fb1">{{ u.position || 'Officer' }}</div>
                </template>
              </td>
              <td>
                <span class="erp-badge" :class="u.status === 'suspended' ? 'erp-badge--rose' : 'erp-badge--emerald'">
                  {{ u.status === 'suspended' ? 'ระงับชั่วคราว' : 'ใช้งานปกติ' }}
                </span>
              </td>
              <td style="font-size:12px;color:#8a8fb1">
                {{ u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('th-TH') : 'พร้อมใช้งาน' }}
              </td>
              <td style="text-align:right">
                <div style="display:inline-flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">
                  <button type="button" class="erp-btn erp-btn--violet erp-btn--sm" @click="openQuickPw(u)">
                    🔑 ตั้งรหัสผ่าน
                  </button>
                  <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="openEdit(u)">แก้ไขสิทธิ์</button>
                  <button
                    v-if="Number(officeAuth.officer.value?.id) !== Number(u.id)"
                    type="button"
                    class="erp-btn erp-btn--danger erp-btn--sm"
                    @click="removeOfficer(u)"
                  >
                    ลบ
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredItems.length">
              <td colspan="7" style="text-align:center;padding:28px;color:#8a8fb1">ไม่พบบัญชีเจ้าหน้าที่หรือตัวแทนจำหน่ายในหมวดนี้</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create / Edit Officer & Dealer Modal -->
    <div v-if="showModal" class="rbac-modal-bg" @click.self="showModal = false">
      <div class="rbac-modal">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h3 style="margin:0;font-size:18px;color:#23264d">
            {{ editingId ? 'แก้ไขบัญชีเจ้าหน้าที่ / ตัวแทนจำหน่าย' : 'เพิ่มเจ้าหน้าที่ / ตัวแทนจำหน่ายใหม่' }}
          </h3>
          <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="showModal = false">✕ ปิด</button>
        </div>

        <div class="erp-grid-2">
          <div class="erp-field">
            <label class="erp-label">บทบาทและสิทธิ์การเข้าถึง (5 บทบาทหลัก) *</label>
            <select v-model="form.role" class="erp-select">
              <option value="ceo">1. CEO (ผู้บริหารสูงสุด — เข้าถึงทุกส่วน)</option>
              <option value="it_admin">2. IT. Admin (ผู้ดูแลระบบเทคนิค &amp; ฐานข้อมูล)</option>
              <option value="marketing_sales">3. Marketing / Sales (ราคาขายปลีก · ส่งของ · ลูกค้า · โปรโมชั่น · เว็บ Tree CMS)</option>
              <option value="warehouse">4. คลังสินค้า (บริหารสต็อก 5 ช่องทาง: Web/Shopee/Lazada/TikTok/ตัวแทน)</option>
              <option value="dealer">5. ตัวแทนจำหน่าย (ราคาตัวแทน · คลังตัวเอง · โปรโมชั่น · รับหน้าร้าน · แจ้งซ่อม/ประกัน)</option>
            </select>
          </div>
          <div class="erp-field">
            <label class="erp-label">สถานะบัญชี</label>
            <select v-model="form.status" class="erp-select">
              <option value="active">ใช้งานปกติ (Active)</option>
              <option value="suspended">ระงับการใช้งานชั่วคราว (Suspended)</option>
            </select>
          </div>
          <div class="erp-field">
            <label class="erp-label">{{ form.role === 'dealer' ? 'ชื่อผู้ติดต่อหลัก / เจ้าของร้าน *' : 'ชื่อ-นามสกุลเจ้าหน้าที่ *' }}</label>
            <input v-model="form.name" class="erp-input" placeholder="ระบุชื่อ-นามสกุล" />
          </div>
          <div class="erp-field">
            <label class="erp-label">อีเมลสำหรับเข้าสู่ระบบ /office/login *</label>
            <input v-model="form.email" type="email" class="erp-input" :disabled="Boolean(editingId)" placeholder="name@opwatch.co.th" />
          </div>
          <div class="erp-field">
            <label class="erp-label">{{ editingId ? 'เปลี่ยนรหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)' : 'รหัสผ่านเริ่มต้น (อย่างน้อย 6 ตัวอักษร) *' }}</label>
            <input v-model="form.password" type="password" class="erp-input" placeholder="••••••••" />
          </div>
          <div class="erp-field">
            <label class="erp-label">เบอร์โทรศัพท์ติดต่อ</label>
            <input v-model="form.phone" class="erp-input" placeholder="02 251 5777 หรือ 08x-xxx-xxxx" />
          </div>
        </div>

        <!-- Dealer-specific fields -->
        <div v-if="form.role === 'dealer'" class="dealer-box">
          <div style="font-weight:700;color:#9a5b00;margin-bottom:10px">
            🏪 ข้อมูลเฉพาะตัวแทนจำหน่ายทางการ (Authorized Dealer Settings)
          </div>
          <div class="erp-grid-2">
            <div class="erp-field">
              <label class="erp-label">รหัสตัวแทนจำหน่าย (Dealer Code)</label>
              <input v-model="form.dealerCode" class="erp-input" placeholder="เช่น DLR-BKK-01" />
            </div>
            <div class="erp-field">
              <label class="erp-label">ชื่อร้าน / ห้างหุ้นส่วน / บูติกตัวแทน</label>
              <input v-model="form.dealerName" class="erp-input" placeholder="เช่น สยามไทม์ แกลเลอรี่" />
            </div>
            <div class="erp-field">
              <label class="erp-label">ระดับตัวแทน (Dealer Tier)</label>
              <select v-model="form.dealerTier" class="erp-select">
                <option value="Platinum">Platinum Authorized Partner</option>
                <option value="Gold">Gold Authorized Partner</option>
                <option value="Silver">Silver Authorized Partner</option>
              </select>
            </div>
            <div class="erp-field">
              <label class="erp-label">ส่วนลดราคาส่งเฉพาะตัวแทน (% จากราคาป้าย)</label>
              <input v-model.number="form.discountPct" type="number" min="5" max="60" class="erp-input" />
            </div>
            <div class="erp-field" style="grid-column:1 / -1">
              <label class="erp-label">ผูกจุดรับสินค้าหน้าร้าน (Click &amp; Collect Branch)</label>
              <select v-model="form.branchSlug" class="erp-select">
                <option value="">-- ดูรายการรับหน้าร้านทุกจุดที่เป็นของตัวแทน --</option>
                <option v-for="br in branches" :key="br.slug" :value="br.slug">
                  {{ br.nameTh || br.name }} ({{ br.slug }})
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Internal Officer fields -->
        <div v-else class="erp-grid-2" style="margin-top:12px">
          <div class="erp-field">
            <label class="erp-label">แผนก / ฝ่าย</label>
            <input v-model="form.department" class="erp-input" placeholder="เช่น การตลาดและฝ่ายขาย / คลังสินค้ากลาง" />
          </div>
          <div class="erp-field">
            <label class="erp-label">ตำแหน่งงาน</label>
            <input v-model="form.position" class="erp-input" placeholder="เช่น Digital Marketing Specialist" />
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:18px">
          <button type="button" class="erp-btn erp-btn--ghost" @click="showModal = false">ยกเลิก</button>
          <button type="button" class="erp-btn erp-btn--primary" :disabled="saving" @click="saveOfficer">
            {{ saving ? 'กำลังบันทึก...' : '💾 บันทึกสิทธิ์และข้อมูล' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Set Password Modal -->
    <div v-if="quickPwOpen && quickPwTarget" class="rbac-modal-bg" @click.self="quickPwOpen = false">
      <div class="rbac-modal" style="max-width:440px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <h3 style="margin:0;font-size:17.5px;color:#23264d">🔑 กำหนดรหัสผ่านใหม่</h3>
          <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="quickPwOpen = false">✕</button>
        </div>
        <p style="margin:0 0 12px;font-size:13px;color:#64748b">
          บัญชี: <strong>{{ quickPwTarget.name }}</strong> (<code>{{ quickPwTarget.email }}</code>)
        </p>
        <form @submit.prevent="submitQuickPw">
          <label class="erp-label">รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)</label>
          <input
            v-model="quickPwValue"
            type="password"
            class="erp-input"
            placeholder="พิมพ์รหัสผ่านใหม่..."
            minlength="6"
            required
            autofocus
          />
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
            <button type="button" class="erp-btn erp-btn--ghost" @click="quickPwOpen = false">ยกเลิก</button>
            <button type="submit" class="erp-btn erp-btn--primary" :disabled="quickPwSaving">
              {{ quickPwSaving ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rbac-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}
.rbac-card {
  text-align: left;
  background: #ffffff;
  border: 1px solid #e9ebf6;
  border-radius: 16px;
  padding: 14px 16px;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.14s, border-color 0.14s, box-shadow 0.14s;
}
.rbac-card:hover,
.rbac-card.active {
  border-color: var(--rc);
  box-shadow: 0 10px 24px rgba(60, 52, 140, 0.08);
  transform: translateY(-1px);
}
.rbac-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.rbac-card__pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--rbg);
  color: var(--rc);
  font-size: 12px;
  font-weight: 700;
}
.rbac-card__num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  color: #23264d;
}
.rbac-card__desc {
  margin: 0;
  font-size: 12px;
  color: #6b7196;
  line-height: 1.48;
}
.role-chip {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #e9ebf6;
  font-size: 12px;
  font-weight: 600;
}
.dealer-box {
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #fffaf0;
  border: 1px solid #fde3a7;
}
.rbac-modal-bg {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(35, 38, 77, 0.42);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  padding: 18px;
}
.rbac-modal {
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  overflow-y: auto;
  background: #ffffff;
  border: 1px solid #e9ebf6;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 24px 60px rgba(35, 38, 77, 0.22);
}
</style>
