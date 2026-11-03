<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const toast = useToast()
const roleFilter = ref('all')

const { data, refresh } = await useFetch<any>('/api/admin/staff', {
  query: computed(() => ({ role: roleFilter.value !== 'all' ? roleFilter.value : undefined }))
})

const users = computed(() => data.value?.items || [])

const showAddModal = ref(false)
const newUser = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'staff' as 'ceo' | 'admin' | 'staff' | 'member',
  department: 'ฝ่ายขายออนไลน์ & ลูกค้าสัมพันธ์',
  position: 'เจ้าหน้าที่ดูแลคำสั่งซื้อ'
})

async function createStaff() {
  if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
    toast.error('กรุณากรอกชื่อ อีเมล และรหัสผ่านให้ครบถ้วน')
    return
  }
  try {
    await $fetch('/api/admin/staff', { method: 'POST', body: newUser })
    toast.success(`เพิ่มบัญชี ${newUser.name} (${newUser.role.toUpperCase()}) สำเร็จ!`)
    showAddModal.value = false
    newUser.name = ''
    newUser.email = ''
    newUser.password = ''
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'ไม่สามารถสร้างบัญชีได้')
  }
}

async function updateRoleOrStatus(u: any, patch: Record<string, any>) {
  try {
    await $fetch(`/api/admin/staff/${u.id}`, {
      method: 'PUT',
      body: patch
    })
    toast.success(`อัปเดตสิทธิ์ของ ${u.name} เรียบร้อย`)
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'อัปเดตสิทธิ์ไม่สำเร็จ (เฉพาะ CEO/Admin)')
    await refresh()
  }
}

async function removeUser(u: any) {
  if (!import.meta.client || !window.confirm(`ยืนยันการลบบัญชี ${u.name}?`)) return
  try {
    await $fetch(`/api/admin/staff/${u.id}`, { method: 'DELETE' })
    toast.success('ลบบัญชีเรียบร้อย')
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'ไม่สามารถลบบัญชีนี้ได้')
  }
}

function roleBadge(r: string) {
  if (r === 'ceo') return { label: 'CEO · ประธานบริหาร', cls: 'erp-chip--amber' }
  if (r === 'admin') return { label: 'ADMIN · ผู้ดูแลระบบ', cls: 'erp-chip--cyan' }
  if (r === 'staff') return { label: 'STAFF · พนักงาน', cls: 'erp-chip--mint' }
  return { label: 'USER · สมาชิกทั่วไป', cls: '' }
}

useHead({ title: 'บริหารงานเจ้าหน้าที่ & กำหนดสิทธิ์ RBAC — OPWatch Office' })
</script>

<template>
  <div>
    <div class="erp-page-head">
      <div>
        <div class="erp-kicker">MODULE 7.5 · HUMAN CAPITAL &amp; RBAC SECURITY</div>
        <h1 class="erp-h1">บริหารงานเจ้าหน้าที่และระดับสิทธิ์ผู้ใช้งาน (CEO · Admin · Staff · User)</h1>
        <p class="erp-sub">
          กำหนดบทบาทหน้าที่ แผนก ตำแหน่ง สถานะบัญชี และคะแนนสะสม OP Points ของบุคลากรและสมาชิกทั้งหมด
        </p>
      </div>
      <button type="button" class="erp-btn erp-btn--primary" @click="showAddModal = !showAddModal">
        + เพิ่มเจ้าหน้าที่ / ผู้ใช้งานใหม่
      </button>
    </div>

    <!-- Role Matrix Legend -->
    <div class="erp-kpis">
      <div class="erp-kpi">
        <div class="erp-kpi__label">CEO (ประธานบริหาร)</div>
        <div class="erp-kpi__val" style="color:#fbbf24">{{ users.filter((u: any) => u.role === 'ceo').length }}</div>
        <div class="erp-kpi__meta">สิทธิ์สูงสุดทุกโมดูล + แต่งตั้ง CEO/Admin</div>
      </div>
      <div class="erp-kpi">
        <div class="erp-kpi__label">ADMIN (ผู้ดูแลระบบ)</div>
        <div class="erp-kpi__val" style="color:#22d3ee">{{ users.filter((u: any) => u.role === 'admin').length }}</div>
        <div class="erp-kpi__meta">จัดการสินค้า โปรโมชั่น ตั้งค่า และพนักงาน</div>
      </div>
      <div class="erp-kpi">
        <div class="erp-kpi__label">STAFF (พนักงานปฏิบัติการ)</div>
        <div class="erp-kpi__val" style="color:#34d399">{{ users.filter((u: any) => u.role === 'staff').length }}</div>
        <div class="erp-kpi__meta">ดูแลคำสั่งซื้อ แพ็กส่งพัสดุ อัปเดตสินค้า &amp; แชท</div>
      </div>
      <div class="erp-kpi">
        <div class="erp-kpi__label">USER (ลูกค้าสมาชิก)</div>
        <div class="erp-kpi__val">{{ users.filter((u: any) => u.role === 'member').length }}</div>
        <div class="erp-kpi__meta">สั่งซื้อสินค้า สะสมและแลกคะแนน OP Points</div>
      </div>
    </div>

    <!-- Add Staff Form -->
    <div v-if="showAddModal" class="erp-panel" style="border-color:#22d3ee">
      <div class="erp-panel__title" style="margin-bottom:12px">สร้างบัญชีเจ้าหน้าที่ / ผู้ใช้งานใหม่</div>
      <div class="erp-form-grid erp-form-grid--3">
        <div class="erp-field">
          <label class="erp-label">ชื่อ - นามสกุล *</label>
          <input v-model="newUser.name" class="erp-input" placeholder="เช่น คุณกิตติพงศ์ วัฒนากูล" />
        </div>
        <div class="erp-field">
          <label class="erp-label">อีเมลเข้าสู่ระบบ *</label>
          <input v-model="newUser.email" type="email" class="erp-input" placeholder="staff@opwatch.co.th" />
        </div>
        <div class="erp-field">
          <label class="erp-label">รหัสผ่านเริ่มต้น *</label>
          <input v-model="newUser.password" type="password" class="erp-input" placeholder="อย่างน้อย 6 ตัวอักษร" />
        </div>
        <div class="erp-field">
          <label class="erp-label">ระดับสิทธิ์ (Role)</label>
          <select v-model="newUser.role" class="erp-select">
            <option value="ceo">CEO — ประธานบริหาร</option>
            <option value="admin">Admin — ผู้ดูแลระบบ</option>
            <option value="staff">Staff — พนักงาน</option>
            <option value="member">User — สมาชิกทั่วไป</option>
          </select>
        </div>
        <div class="erp-field">
          <label class="erp-label">แผนก / ฝ่าย</label>
          <input v-model="newUser.department" class="erp-input" />
        </div>
        <div class="erp-field">
          <label class="erp-label">ตำแหน่งงาน</label>
          <input v-model="newUser.position" class="erp-input" />
        </div>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px">
        <button type="button" class="erp-btn" @click="showAddModal = false">ยกเลิก</button>
        <button type="button" class="erp-btn erp-btn--primary" @click="createStaff">💾 บันทึกบัญชีผู้ใช้งาน</button>
      </div>
    </div>

    <!-- Filter & Table -->
    <div class="erp-panel">
      <div class="erp-tabs">
        <button type="button" class="erp-tab" :class="{ 'is-active': roleFilter === 'all' }" @click="roleFilter = 'all'">ทั้งหมด</button>
        <button type="button" class="erp-tab" :class="{ 'is-active': roleFilter === 'ceo' }" @click="roleFilter = 'ceo'">CEO</button>
        <button type="button" class="erp-tab" :class="{ 'is-active': roleFilter === 'admin' }" @click="roleFilter = 'admin'">Admin</button>
        <button type="button" class="erp-tab" :class="{ 'is-active': roleFilter === 'staff' }" @click="roleFilter = 'staff'">พนักงาน (Staff)</button>
        <button type="button" class="erp-tab" :class="{ 'is-active': roleFilter === 'member' }" @click="roleFilter = 'member'">สมาชิก (User)</button>
      </div>

      <div class="erp-table-wrap">
        <table class="erp-table">
          <thead>
            <tr>
              <th>ชื่อ / อีเมล</th>
              <th>ระดับสิทธิ์ปัจจุบัน</th>
              <th>แผนก / ตำแหน่ง</th>
              <th>OP Points</th>
              <th>เปลี่ยนระดับสิทธิ์ (RBAC)</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>
                <strong>{{ u.name }}</strong>
                <div style="font-size:11.5px;color:#94a3b8">{{ u.email }}</div>
              </td>
              <td>
                <span class="erp-chip" :class="roleBadge(u.role).cls">{{ roleBadge(u.role).label }}</span>
              </td>
              <td>
                <div>{{ u.department || '-' }}</div>
                <div style="font-size:11px;color:#64748b">{{ u.position || '' }}</div>
              </td>
              <td style="font-family:monospace;color:#67e8f9">{{ u.points || 0 }} pts</td>
              <td>
                <select
                  :value="u.role"
                  class="erp-select"
                  style="width:165px;padding:5px 8px;font-size:12px"
                  @change="(e: any) => updateRoleOrStatus(u, { role: e.target.value })"
                >
                  <option value="ceo">CEO</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff (พนักงาน)</option>
                  <option value="member">User (สมาชิก)</option>
                </select>
              </td>
              <td>
                <button type="button" class="erp-btn erp-btn--sm erp-btn--danger" @click="removeUser(u)">ลบ</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
