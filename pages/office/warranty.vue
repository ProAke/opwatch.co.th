<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const officeAuth = useOfficeAuth()
const toast = useToast()

const tab = ref<'warranties' | 'repairs'>('warranties')
const search = ref('')
const statusFilter = ref('')

const { data, refresh } = await useFetch<any>('/api/admin/warranty', {
  query: computed(() => ({
    q: search.value || undefined,
    status: statusFilter.value || undefined
  }))
})

const warranties = computed(() => data.value?.warranties || [])
const repairs = computed(() => data.value?.repairs || [])
const stats = computed(() => data.value?.stats || {})
const isDealer = computed(() => officeAuth.role.value === 'dealer')

// Detail / Update Modal
const selected = ref<any | null>(null)
const selectedKind = ref<'warranty' | 'repair'>('warranty')
const saving = ref(false)
const aiDrafting = ref(false)
const editForm = reactive({
  status: '',
  warrantyUntil: '',
  adminNote: '',
  estimatedCost: 0,
  trackingReturn: '',
  technicianNote: ''
})

function openDetail(row: any, kind: 'warranty' | 'repair') {
  selected.value = row
  selectedKind.value = kind
  Object.assign(editForm, {
    status: row.status || (kind === 'warranty' ? 'verified' : 'received'),
    warrantyUntil: row.warrantyUntil || '',
    adminNote: row.adminNote || '',
    estimatedCost: Number(row.estimatedCost || 0),
    trackingReturn: row.trackingReturn || '',
    technicianNote: row.technicianNote || ''
  })
}

async function draftWithAi() {
  if (!selected.value) return
  aiDrafting.value = true
  try {
    const res = await $fetch<any>('/api/admin/ai/generate', {
      method: 'POST',
      body: {
        task: 'warranty_reply',
        agentCode: 'OP-CONCIERGE',
        input: {
          code: selected.value.warrantyNo || selected.value.ticketNo,
          customerName: selected.value.customerName,
          productSku: selected.value.productSku,
          status: editForm.status
        }
      }
    })
    const drafted = res?.result?.note || ''
    if (selectedKind.value === 'warranty') editForm.adminNote = drafted
    else editForm.technicianNote = drafted
    toast.success('✨ AI ร่างข้อความแจ้งสถานะลูกค้าเรียบร้อย')
  } catch {
    toast.error('เรียกใช้ AI ไม่สำเร็จ')
  } finally {
    aiDrafting.value = false
  }
}

async function saveDetail() {
  if (!selected.value) return
  saving.value = true
  try {
    await $fetch(`/api/admin/warranty/${selected.value.id}`, {
      method: 'PUT',
      body: {
        kind: selectedKind.value,
        ...editForm
      }
    })
    toast.success('อัปเดตสถานะในคลังข้อมูลเรียบร้อย')
    selected.value = null
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'อัปเดตไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}

// Walk-in / Dealer Quick Creation Modal
const createOpen = ref(false)
const createKind = ref<'warranty' | 'repair'>('warranty')
const createSaving = ref(false)
const createForm = reactive({
  customerName: '',
  phone: '',
  email: '',
  brandSlug: 'olympianus',
  productSku: '',
  serialNo: '',
  purchaseDate: new Date().toISOString().slice(0, 10),
  purchaseChannel: 'dealer',
  serviceType: 'warranty_claim',
  symptom: ''
})

async function submitQuickCreate() {
  createSaving.value = true
  try {
    if (createKind.value === 'warranty') {
      await $fetch('/api/warranty/register', { method: 'POST', body: { ...createForm } })
      toast.success('บันทึกลงทะเบียนรับประกันเข้าคลังข้อมูลสำเร็จ')
      tab.value = 'warranties'
    } else {
      await $fetch('/api/warranty/repair', { method: 'POST', body: { ...createForm } })
      toast.success('เปิดใบแจ้งซ่อมเข้าศูนย์บริการสำเร็จ')
      tab.value = 'repairs'
    }
    createOpen.value = false
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'บันทึกไม่สำเร็จ กรุณากรอกข้อมูลสำคัญให้ครบ')
  } finally {
    createSaving.value = false
  }
}

function exportCsv() {
  if (!import.meta.client) return
  const rows =
    tab.value === 'warranties'
      ? [
          ['Warranty_No', 'Customer', 'Phone', 'Brand', 'SKU', 'Serial_No', 'Purchase_Date', 'Warranty_Until', 'Channel', 'Status'],
          ...warranties.value.map((w: any) => [
            w.warrantyNo, `"${w.customerName}"`, w.phone, w.brandSlug, w.productSku, w.serialNo, w.purchaseDate, w.warrantyUntil, w.purchaseChannel, w.status
          ])
        ]
      : [
          ['Ticket_No', 'Customer', 'Phone', 'Brand', 'SKU', 'Service_Type', 'Symptom', 'Estimated_Cost', 'Status'],
          ...repairs.value.map((r: any) => [
            r.ticketNo, `"${r.customerName}"`, r.phone, r.brandSlug, r.productSku, r.serviceType, `"${String(r.symptom || '').replace(/"/g, '""')}"`, r.estimatedCost, r.status
          ])
        ]
  const blob = new Blob(['\uFEFF' + rows.map((x) => x.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `opwatch-${tab.value}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

useHead({ title: 'คลังข้อมูลลงทะเบียนรับประกัน & ระบบแจ้งซ่อมออนไลน์ — OPWatch ERP' })
</script>

<template>
  <div>
    <div class="erp-page-head">
      <div>
        <div class="erp-kicker">E-WARRANTY &amp; SERVICE REPOSITORY · คลังข้อมูลรับประกันและแจ้งซ่อม</div>
        <h1 class="erp-h1">ระบบแจ้งซ่อมและลงทะเบียนรับประกันออนไลน์</h1>
        <p class="erp-sub">
          คลังข้อมูลกลางสำหรับข้อมูลที่ลูกค้าและตัวแทนจำหน่ายกรอกผ่านหน้าเว็บ <NuxtLink to="/warranty" target="_blank" style="color:#6c5ce7;font-weight:600">/warranty ↗</NuxtLink>
        </p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" class="erp-btn erp-btn--ghost" @click="exportCsv">⬇ Export CSV</button>
        <button type="button" class="erp-btn erp-btn--ghost" @click="createKind = 'repair'; createOpen = true">
          + เปิดใบแจ้งซ่อมหน้าร้าน
        </button>
        <button type="button" class="erp-btn erp-btn--primary" @click="createKind = 'warranty'; createOpen = true">
          + ลงทะเบียนประกันให้ลูกค้า
        </button>
      </div>
    </div>

    <!-- KPI Row -->
    <div class="wrt-kpis">
      <div class="wrt-kpi">
        <span>คลังใบรับประกัน (E-Warranty)</span>
        <strong>{{ stats.totalWarranties || 0 }} รายการ</strong>
      </div>
      <div class="wrt-kpi">
        <span>รอตรวจสอบใบเสร็จ</span>
        <strong style="color:#ffb020">{{ stats.pendingWarranties || 0 }} รายการ</strong>
      </div>
      <div class="wrt-kpi">
        <span>ใบแจ้งซ่อมทั้งหมด</span>
        <strong>{{ stats.totalRepairs || 0 }} ใบงาน</strong>
      </div>
      <div class="wrt-kpi">
        <span>กำลังซ่อม / รออะไหล่</span>
        <strong style="color:#6c5ce7">{{ stats.openRepairs || 0 }} ใบงาน</strong>
      </div>
    </div>

    <!-- Tabs & Search -->
    <div class="erp-panel">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px">
        <div style="display:flex;gap:8px">
          <button
            type="button"
            class="erp-btn"
            :class="tab === 'warranties' ? 'erp-btn--primary' : 'erp-btn--ghost'"
            @click="tab = 'warranties'"
          >
            🛡 คลังลงทะเบียนรับประกัน ({{ warranties.length }})
          </button>
          <button
            type="button"
            class="erp-btn"
            :class="tab === 'repairs' ? 'erp-btn--primary' : 'erp-btn--ghost'"
            @click="tab = 'repairs'"
          >
            🔧 คลังใบแจ้งซ่อมออนไลน์ ({{ repairs.length }})
          </button>
        </div>

        <input
          v-model="search"
          class="erp-input"
          style="max-width:340px"
          placeholder="ค้นหาเลข WRT/REP, ชื่อลูกค้า, เบอร์โทร, Serial, SKU..."
        />
      </div>

      <!-- Warranties Table -->
      <div v-if="tab === 'warranties'" class="erp-table-wrap">
        <table class="erp-table">
          <thead>
            <tr>
              <th>เลขรับประกัน</th>
              <th>ลูกค้า / เบอร์โทร</th>
              <th>แบรนด์ / รุ่น / Serial</th>
              <th>วันที่ซื้อ → หมดอายุ</th>
              <th>ช่องทางที่ซื้อ</th>
              <th>สถานะ</th>
              <th style="text-align:right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="w in warranties" :key="w.id">
              <td><code style="color:#6c5ce7;font-weight:700">{{ w.warrantyNo }}</code></td>
              <td>
                <div style="font-weight:600;color:#23264d">{{ w.customerName }}</div>
                <div style="font-size:12px;color:#8a8fb1">{{ w.phone }} <span v-if="w.lineId">· LINE: {{ w.lineId }}</span></div>
              </td>
              <td>
                <div style="font-weight:600">{{ w.productSku }}</div>
                <div style="font-size:12px;color:#8a8fb1">Serial: {{ w.serialNo }} ({{ w.brandSlug }})</div>
              </td>
              <td style="font-size:12.5px">
                <div>ซื้อ: {{ w.purchaseDate }}</div>
                <div style="color:#22c793;font-weight:600">ถึง: {{ w.warrantyUntil }}</div>
              </td>
              <td style="font-size:12.5px">
                <div>{{ w.purchaseChannel }}</div>
                <div v-if="w.dealerOrBranch" style="color:#8a8fb1">{{ w.dealerOrBranch }}</div>
              </td>
              <td>
                <span class="erp-badge" :class="w.status === 'verified' ? 'erp-badge--emerald' : 'erp-badge--amber'">
                  {{ w.status === 'verified' ? 'ยืนยันแล้ว' : w.status }}
                </span>
              </td>
              <td style="text-align:right">
                <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="openDetail(w, 'warranty')">
                  ตรวจสอบ / อัปเดต
                </button>
              </td>
            </tr>
            <tr v-if="!warranties.length">
              <td colspan="7" style="text-align:center;padding:28px;color:#8a8fb1">ไม่พบข้อมูลลงทะเบียนรับประกัน</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Repairs Table -->
      <div v-else class="erp-table-wrap">
        <table class="erp-table">
          <thead>
            <tr>
              <th>เลขใบซ่อม</th>
              <th>ลูกค้า / เบอร์โทร</th>
              <th>รุ่น / ประเภทบริการ</th>
              <th>อาการที่แจ้ง</th>
              <th>ค่าประเมินซ่อม</th>
              <th>สถานะซ่อม</th>
              <th style="text-align:right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in repairs" :key="r.id">
              <td><code style="color:#3ba7ff;font-weight:700">{{ r.ticketNo }}</code></td>
              <td>
                <div style="font-weight:600;color:#23264d">{{ r.customerName }}</div>
                <div style="font-size:12px;color:#8a8fb1">{{ r.phone }}</div>
              </td>
              <td>
                <div style="font-weight:600">{{ r.productSku }}</div>
                <div style="font-size:12px;color:#8a8fb1">{{ r.serviceType }} · {{ r.dropoffMethod }}</div>
              </td>
              <td style="max-width:260px;font-size:12.5px;color:#454a75">{{ r.symptom }}</td>
              <td>
                <strong>{{ Number(r.estimatedCost) > 0 ? `฿${Number(r.estimatedCost).toLocaleString()}` : 'ฟรี / ในประกัน' }}</strong>
              </td>
              <td>
                <span class="erp-badge erp-badge--violet">{{ r.status }}</span>
              </td>
              <td style="text-align:right">
                <button type="button" class="erp-btn erp-btn--ghost erp-btn--sm" @click="openDetail(r, 'repair')">
                  อัปเดตงานซ่อม
                </button>
              </td>
            </tr>
            <tr v-if="!repairs.length">
              <td colspan="7" style="text-align:center;padding:28px;color:#8a8fb1">ไม่พบข้อมูลใบแจ้งซ่อม</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail & Status Update Modal -->
    <div v-if="selected" class="wrt-modal-bg" @click.self="selected = null">
      <div class="wrt-modal">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3 style="margin:0;color:#23264d">
            {{ selectedKind === 'warranty' ? `ใบรับประกัน ${selected.warrantyNo}` : `ใบแจ้งซ่อม ${selected.ticketNo}` }}
          </h3>
          <button type="button" class="erp-btn erp-btn--violet erp-btn--sm" :disabled="aiDrafting" @click="draftWithAi">
            {{ aiDrafting ? 'AI กำลังเขียน...' : '✨ ให้ AI ร่างข้อความแจ้งลูกค้า' }}
          </button>
        </div>

        <div style="padding:12px;border-radius:12px;background:#f6f7fc;margin-bottom:14px;font-size:13px;line-height:1.6">
          <strong>ลูกค้า:</strong> {{ selected.customerName }} ({{ selected.phone }}) ·
          <strong>รุ่น:</strong> {{ selected.productSku }} ·
          <strong>Serial:</strong> {{ selected.serialNo || '—' }}
          <div v-if="selected.symptom"><strong>อาการแจ้งซ่อม:</strong> {{ selected.symptom }}</div>
        </div>

        <div v-if="selectedKind === 'warranty'" class="erp-grid-2">
          <div class="erp-field">
            <label class="erp-label">สถานะการรับประกัน</label>
            <select v-model="editForm.status" class="erp-select">
              <option value="pending">รอตรวจสอบใบเสร็จ (Pending)</option>
              <option value="verified">ยืนยันคุ้มครอง 2 ปี (Verified)</option>
              <option value="expired">หมดอายุประกัน (Expired)</option>
            </select>
          </div>
          <div class="erp-field">
            <label class="erp-label">วันสิ้นสุดความคุ้มครอง</label>
            <input v-model="editForm.warrantyUntil" type="date" class="erp-input" />
          </div>
          <div class="erp-field" style="grid-column:1 / -1">
            <label class="erp-label">หมายเหตุเจ้าหน้าที่ศูนย์บริการ (แสดงในหน้าค้นหาสถานะลูกค้า)</label>
            <textarea v-model="editForm.adminNote" rows="3" class="erp-textarea" />
          </div>
        </div>

        <div v-else class="erp-grid-2">
          <div class="erp-field">
            <label class="erp-label">สถานะงานซ่อม</label>
            <select v-model="editForm.status" class="erp-select">
              <option value="received">รับเรื่องแล้ว (Received)</option>
              <option value="inspecting">ช่างกำลังตรวจเช็ก (Inspecting)</option>
              <option value="waiting_parts">รออะไหล่แท้ (Waiting Parts)</option>
              <option value="repairing">กำลังซ่อมบำรุง / ทดสอบกันน้ำ (Repairing)</option>
              <option value="completed">ซ่อมเสร็จพร้อมส่งคืน (Completed)</option>
              <option value="returned">ส่งมอบคืนลูกค้าแล้ว (Returned)</option>
            </select>
          </div>
          <div class="erp-field">
            <label class="erp-label">ค่าบริการประเมิน (บาท · 0 = ฟรีในประกัน)</label>
            <input v-model.number="editForm.estimatedCost" type="number" min="0" class="erp-input" />
          </div>
          <div class="erp-field" style="grid-column:1 / -1">
            <label class="erp-label">เลขพัสดุจัดส่งคืนลูกค้า (ถ้ามี)</label>
            <input v-model="editForm.trackingReturn" class="erp-input" placeholder="เช่น KERRY / EMS Tracking..." />
          </div>
          <div class="erp-field" style="grid-column:1 / -1">
            <label class="erp-label">บันทึกความคืบหน้าช่างเทคนิค (แสดงให้ลูกค้าเห็นในหน้าตรวจสอบสถานะ)</label>
            <textarea v-model="editForm.technicianNote" rows="3" class="erp-textarea" />
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
          <button type="button" class="erp-btn erp-btn--ghost" @click="selected = null">ปิด</button>
          <button type="button" class="erp-btn erp-btn--primary" :disabled="saving" @click="saveDetail">
            {{ saving ? 'กำลังบันทึก...' : '💾 บันทึกอัปเดต' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Walk-in / Dealer Quick Creation Modal -->
    <div v-if="createOpen" class="wrt-modal-bg" @click.self="createOpen = false">
      <div class="wrt-modal">
        <h3 style="margin:0 0 14px;color:#23264d">
          {{ createKind === 'warranty' ? '🛡 ลงทะเบียนรับประกันหน้าร้าน / ตัวแทน' : '🔧 เปิดใบแจ้งซ่อมหน้าร้าน / ตัวแทน' }}
        </h3>
        <div class="erp-grid-2">
          <div class="erp-field">
            <label class="erp-label">ชื่อ-นามสกุลลูกค้า *</label>
            <input v-model="createForm.customerName" class="erp-input" />
          </div>
          <div class="erp-field">
            <label class="erp-label">เบอร์โทรศัพท์ *</label>
            <input v-model="createForm.phone" class="erp-input" />
          </div>
          <div class="erp-field">
            <label class="erp-label">แบรนด์</label>
            <select v-model="createForm.brandSlug" class="erp-select">
              <option value="olympianus">Olym Pianus</option>
              <option value="olympia-star">Olympia Star</option>
              <option value="ogival">Ogival</option>
            </select>
          </div>
          <div class="erp-field">
            <label class="erp-label">รหัสรุ่น (SKU) *</label>
            <input v-model="createForm.productSku" class="erp-input" placeholder="เช่น OP-899832AGS" />
          </div>
          <div class="erp-field">
            <label class="erp-label">หมายเลข Serial No. {{ createKind === 'warranty' ? '*' : '' }}</label>
            <input v-model="createForm.serialNo" class="erp-input" />
          </div>
          <div v-if="createKind === 'warranty'" class="erp-field">
            <label class="erp-label">วันที่ซื้อ</label>
            <input v-model="createForm.purchaseDate" type="date" class="erp-input" />
          </div>
          <div v-if="createKind === 'repair'" class="erp-field" style="grid-column:1 / -1">
            <label class="erp-label">อาการที่ลูกค้าแจ้งซ่อม *</label>
            <textarea v-model="createForm.symptom" rows="3" class="erp-textarea" />
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
          <button type="button" class="erp-btn erp-btn--ghost" @click="createOpen = false">ยกเลิก</button>
          <button type="button" class="erp-btn erp-btn--primary" :disabled="createSaving" @click="submitQuickCreate">
            {{ createSaving ? 'กำลังบันทึก...' : 'บันทึกเข้าคลังข้อมูล' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrt-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.wrt-kpi {
  background: #ffffff;
  border: 1px solid #e9ebf6;
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.wrt-kpi span {
  font-size: 12px;
  color: #8a8fb1;
}
.wrt-kpi strong {
  font-size: 20px;
  color: #23264d;
}
.wrt-modal-bg {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(35, 38, 77, 0.42);
  display: grid;
  place-items: center;
  padding: 16px;
}
.wrt-modal {
  width: 100%;
  max-width: 640px;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #e9ebf6;
}
</style>
