<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const officeAuth = useOfficeAuth()
const toast = useToast()
const search = ref('')

const { data, refresh } = await useFetch<any>('/api/admin/customers', {
  query: computed(() => ({ q: search.value || undefined }))
})

const customers = computed(() => data.value?.items || [])

const editing = ref<any | null>(null)
const saving = ref(false)
const editForm = reactive({
  name: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  points: 0,
  status: 'active'
})

function openEdit(c: any) {
  editing.value = c
  Object.assign(editForm, {
    name: c.name || '',
    phone: c.phone || '',
    address: c.address || '',
    city: c.city || '',
    postalCode: c.postalCode || '',
    points: Number(c.points || 0),
    status: c.status || 'active'
  })
}

async function saveCustomer() {
  if (!editing.value) return
  saving.value = true
  try {
    await $fetch(`/api/admin/customers/${editing.value.id}`, {
      method: 'PUT',
      body: { ...editForm }
    })
    toast.success('บันทึกข้อมูลสมาชิกเรียบร้อย')
    editing.value = null
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'บันทึกไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}

function exportCsv() {
  if (!import.meta.client) return
  const rows = [
    ['ID', 'Name', 'Email', 'Phone', 'Province', 'OP_Points', 'Total_Spent_THB', 'Orders_Count', 'Status'],
    ...customers.value.map((c: any) => [
      c.id,
      `"${String(c.name || '').replace(/"/g, '""')}"`,
      c.email,
      c.phone || '',
      c.city || '',
      c.points || 0,
      c.totalSpent || 0,
      c.ordersCount || 0,
      c.status || 'active'
    ])
  ]
  const blob = new Blob(['\uFEFF' + rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `opwatch-members-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

useHead({ title: 'ข้อมูลสมาชิกและลูกค้าหน้าเว็บไซต์ (CRM) — OPWatch ERP' })
</script>

<template>
  <div>
    <div class="erp-page-head">
      <div>
        <div class="erp-kicker">STOREFRONT MEMBERS &amp; CUSTOMERS CRM</div>
        <h1 class="erp-h1">ข้อมูลสมาชิกและลูกค้าหน้าเว็บไซต์ ({{ customers.length }} ท่าน)</h1>
        <p class="erp-sub">
          ฐานข้อมูลสมาชิกผู้ซื้อบนหน้าเว็บ opwatch.co.th (แยกจากเจ้าหน้าที่และตัวแทนจำหน่าย — บัญชีหน้าเว็บไม่สามารถเข้าสู่ระบบหลังบ้านได้)
        </p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" class="erp-btn erp-btn--ghost" @click="exportCsv">
          ⬇ Export CSV ลูกค้า
        </button>
        <NuxtLink
          v-if="officeAuth.isRole('ceo', 'it_admin')"
          to="/office/staff"
          class="erp-btn erp-btn--primary"
        >
          จัดการเจ้าหน้าที่ &amp; ตัวแทนจำหน่าย →
        </NuxtLink>
      </div>
    </div>

    <!-- Summary KPI Row -->
    <div class="crm-kpis">
      <div class="crm-kpi">
        <span>สมาชิกเว็บไซต์ทั้งหมด</span>
        <strong>{{ customers.length }} ท่าน</strong>
      </div>
      <div class="crm-kpi">
        <span>คะแนนสะสม OP Point รวม</span>
        <strong>{{ customers.reduce((s: number, c: any) => s + Number(c.points || 0), 0).toLocaleString() }} แต้ม</strong>
      </div>
      <div class="crm-kpi">
        <span>ยอดซื้อสะสมของสมาชิก</span>
        <strong>฿{{ customers.reduce((s: number, c: any) => s + Number(c.totalSpent || 0), 0).toLocaleString() }}</strong>
      </div>
      <div class="crm-kpi">
        <span>ขอบเขตความปลอดภัย</span>
        <strong style="color:#22c793;font-size:15px">แยกจากหลังบ้าน 100%</strong>
      </div>
    </div>

    <div class="erp-panel">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap">
        <input
          v-model="search"
          class="erp-input"
          style="max-width:340px"
          placeholder="ค้นหาชื่อสมาชิก อีเมล เบอร์โทร หรือจังหวัด..."
        />
        <span style="font-size:12.5px;color:#8a8fb1">
          สำหรับทีม Marketing / Sales ใช้ดูประวัติลูกค้า ปรับแต้มสะสม และวางแผนแคมเปญการตลาด
        </span>
      </div>

      <div class="erp-table-wrap">
        <table class="erp-table">
          <thead>
            <tr>
              <th>รหัสสมาชิก</th>
              <th>ชื่อ-นามสกุล / อีเมล</th>
              <th>เบอร์โทรศัพท์ &amp; ที่อยู่จัดส่ง</th>
              <th>คำสั่งซื้อ</th>
              <th>แต้ม OP Point</th>
              <th>ยอดช้อปสะสม</th>
              <th>สถานะ</th>
              <th style="text-align:right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in customers" :key="c.id">
              <td><code style="font-family:'JetBrains Mono',monospace;font-size:12px">MEM-{{ String(c.id).padStart(4, '0') }}</code></td>
              <td>
                <div style="font-weight:600;color:#23264d">{{ c.name }}</div>
                <div style="font-size:12px;color:#8a8fb1">{{ c.email }}</div>
              </td>
              <td style="font-size:12.5px">
                <div>{{ c.phone || '—' }}</div>
                <div style="color:#8a8fb1">{{ [c.address, c.city, c.postalCode].filter(Boolean).join(' ') || 'ยังไม่ระบุที่อยู่' }}</div>
              </td>
              <td><strong>{{ c.ordersCount || 0 }}</strong> รายการ</td>
              <td><span class="erp-badge erp-badge--violet">{{ Number(c.points || 0).toLocaleString() }} pt</span></td>
              <td><strong>฿{{ Number(c.totalSpent || 0).toLocaleString() }}</strong></td>
              <td>
                <span class="erp-badge" :class="c.status === 'suspended' ? 'erp-badge--rose' : 'erp-badge--emerald'">
                  {{ c.status === 'suspended' ? 'ระงับบัญชี' : 'สมาชิกปกติ' }}
                </span>
              </td>
              <td style="text-align:right">
                <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="openEdit(c)">
                  แก้ไข / แต้มสะสม
                </button>
              </td>
            </tr>
            <tr v-if="!customers.length">
              <td colspan="8" style="text-align:center;padding:28px;color:#8a8fb1">ไม่พบข้อมูลสมาชิกหน้าเว็บไซต์</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Member Modal -->
    <div v-if="editing" class="crm-modal-bg" @click.self="editing = null">
      <div class="crm-modal">
        <h3 style="margin:0 0 14px;color:#23264d">ดูแลข้อมูลสมาชิก: {{ editing.name }}</h3>
        <div class="erp-grid-2">
          <div class="erp-field">
            <label class="erp-label">ชื่อ-นามสกุลสมาชิก</label>
            <input v-model="editForm.name" class="erp-input" />
          </div>
          <div class="erp-field">
            <label class="erp-label">เบอร์โทรศัพท์</label>
            <input v-model="editForm.phone" class="erp-input" />
          </div>
          <div class="erp-field">
            <label class="erp-label">คะแนนสะสม OP Point</label>
            <input v-model.number="editForm.points" type="number" min="0" class="erp-input" />
          </div>
          <div class="erp-field">
            <label class="erp-label">สถานะสมาชิกหน้าเว็บ</label>
            <select v-model="editForm.status" class="erp-select">
              <option value="active">สมาชิกปกติ (Active)</option>
              <option value="suspended">ระงับบัญชี (Suspended)</option>
            </select>
          </div>
          <div class="erp-field" style="grid-column:1 / -1">
            <label class="erp-label">ที่อยู่จัดส่งหลัก</label>
            <input v-model="editForm.address" class="erp-input" />
          </div>
          <div class="erp-field">
            <label class="erp-label">จังหวัด</label>
            <input v-model="editForm.city" class="erp-input" />
          </div>
          <div class="erp-field">
            <label class="erp-label">รหัสไปรษณีย์</label>
            <input v-model="editForm.postalCode" class="erp-input" />
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
          <button type="button" class="erp-btn erp-btn--ghost" @click="editing = null">ยกเลิก</button>
          <button type="button" class="erp-btn erp-btn--primary" :disabled="saving" @click="saveCustomer">
            {{ saving ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูลสมาชิก' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crm-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.crm-kpi {
  background: #ffffff;
  border: 1px solid #e9ebf6;
  border-radius: 16px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.crm-kpi span {
  font-size: 12px;
  color: #8a8fb1;
}
.crm-kpi strong {
  font-size: 20px;
  color: #23264d;
  font-family: 'Prompt', 'IBM Plex Sans Thai', sans-serif;
}
.crm-modal-bg {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(35, 38, 77, 0.42);
  display: grid;
  place-items: center;
  padding: 16px;
}
.crm-modal {
  width: 100%;
  max-width: 600px;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #e9ebf6;
}
</style>
