<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const toast = useToast()
const officeAuth = useOfficeAuth()
const canEdit = computed(() => officeAuth.hasPermission('branches'))

const { data: branchData, refresh: refreshBranches } = await useFetch<any>('/api/admin/branches')
const branches = computed(() => branchData.value?.items || [])

const editingId = ref<number | null>(null)
const saving = ref(false)
const branchForm = reactive({
  nameTh: '',
  nameEn: '',
  zone: 'bangkok',
  address: '',
  addressEn: '',
  phone: '02 251 5777',
  hours: 'ทุกวัน 10:00 – 22:00 น.',
  lineUrl: 'https://line.me/ti/p/~opwatch.th',
  mapUrl: '',
  sortOrder: 0,
  active: true
})

const zoneOptions = [
  { value: 'bangkok', label: 'กรุงเทพมหานคร' },
  { value: 'central', label: 'ภาคกลาง & ปริมณฑล' },
  { value: 'north', label: 'ภาคเหนือ (เชียงใหม่)' },
  { value: 'south', label: 'ภาคใต้ (ภูเก็ต)' },
  { value: 'northeast', label: 'ภาคตะวันออกเฉียงเหนือ' },
  { value: 'east', label: 'ภาคตะวันออก' }
]

function resetForm() {
  editingId.value = null
  Object.assign(branchForm, {
    nameTh: '',
    nameEn: '',
    zone: 'bangkok',
    address: '',
    addressEn: '',
    phone: '02 251 5777',
    hours: 'ทุกวัน 10:00 – 22:00 น.',
    lineUrl: 'https://line.me/ti/p/~opwatch.th',
    mapUrl: '',
    sortOrder: 0,
    active: true
  })
}

function editBranch(b: any) {
  editingId.value = Number(b.id)
  Object.assign(branchForm, {
    nameTh: b.nameTh || b.name || '',
    nameEn: b.nameEn || '',
    zone: b.zone || 'bangkok',
    address: b.address || b.addressTh || '',
    addressEn: b.addressEn || '',
    phone: b.phone || '02 251 5777',
    hours: b.hours || 'ทุกวัน 10:00 – 22:00 น.',
    lineUrl: b.lineUrl || 'https://line.me/ti/p/~opwatch.th',
    mapUrl: b.mapUrl || '',
    sortOrder: Number(b.sortOrder || 0),
    active: b.active !== false
  })
}

async function saveBranch() {
  if (!branchForm.nameTh.trim()) {
    toast.error('กรุณาระบุชื่อสาขา')
    return
  }
  saving.value = true
  try {
    const body = { ...branchForm, sortOrder: Number(branchForm.sortOrder || 0) }
    if (editingId.value) {
      await $fetch(`/api/admin/branches/${editingId.value}`, { method: 'PUT', body })
    } else {
      await $fetch('/api/admin/branches', { method: 'POST', body })
    }
    toast.success('บันทึกข้อมูลสาขาเรียบร้อย')
    resetForm()
    await refreshBranches()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'บันทึกสาขาไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}

async function deleteBranch(id: number) {
  if (!import.meta.client || !window.confirm('ต้องการลบสาขานี้ออกจากระบบ?')) return
  try {
    await $fetch(`/api/admin/branches/${id}`, { method: 'DELETE' })
    toast.success('ลบสาขาเรียบร้อย')
    await refreshBranches()
  } catch {
    toast.error('ลบสาขาไม่สำเร็จ')
  }
}

useHead({ title: 'จัดการสาขา & จุดรับสินค้า — OPWatch Office' })
</script>

<template>
  <div>
    <div class="erp-page-head">
      <div>
        <div class="erp-kicker">BRANCHES · CLICK &amp; COLLECT · SERVICE CENTERS</div>
        <h1 class="erp-h1">จัดการสาขา &amp; จุดรับสินค้าทั่วไทย</h1>
        <p class="erp-sub">
          จัดการโชว์รูม ศูนย์บริการ และเคาน์เตอร์ห้างสรรพสินค้าที่ร่วมรายการ — ข้อมูลสาขาจะแสดงที่หน้า
          <NuxtLink to="/branches" style="color:#6c5ce7;font-weight:600">สาขาของเรา</NuxtLink>
          และในตัวเลือก Click &amp; Collect ตอนสั่งซื้อ
        </p>
      </div>
    </div>

    <div v-if="canEdit" class="erp-panel">
      <div class="erp-panel__head">
        <div class="erp-panel__title">{{ editingId ? 'แก้ไขข้อมูลสาขา' : '+ เพิ่มสาขาใหม่' }}</div>
        <button v-if="editingId" type="button" class="erp-btn erp-btn--sm erp-btn--ghost" @click="resetForm">ยกเลิกการแก้ไข</button>
      </div>
      <div class="erp-form-grid erp-form-grid--3">
        <div class="erp-field"><label class="erp-label">ชื่อสาขา (ไทย) *</label><input v-model="branchForm.nameTh" class="erp-input" placeholder="เช่น สำนักงานใหญ่ อินเตอร์ไทมส์ (เพชรบุรีตัดใหม่)" /></div>
        <div class="erp-field"><label class="erp-label">ชื่อสาขา (English)</label><input v-model="branchForm.nameEn" class="erp-input" placeholder="Inter Times Head Office" /></div>
        <div class="erp-field">
          <label class="erp-label">โซน / จังหวัด</label>
          <select v-model="branchForm.zone" class="erp-input">
            <option v-for="z in zoneOptions" :key="z.value" :value="z.value">{{ z.label }}</option>
          </select>
        </div>
        <div class="erp-field"><label class="erp-label">ที่อยู่ (ไทย)</label><input v-model="branchForm.address" class="erp-input" placeholder="1091/229 ซอย 35 ถนนเพชรบุรีตัดใหม่..." /></div>
        <div class="erp-field"><label class="erp-label">ที่อยู่ (English)</label><input v-model="branchForm.addressEn" class="erp-input" /></div>
        <div class="erp-field"><label class="erp-label">เบอร์โทร</label><input v-model="branchForm.phone" class="erp-input" /></div>
        <div class="erp-field"><label class="erp-label">เวลาทำการ</label><input v-model="branchForm.hours" class="erp-input" /></div>
        <div class="erp-field"><label class="erp-label">ลิงก์ LINE</label><input v-model="branchForm.lineUrl" class="erp-input" /></div>
        <div class="erp-field"><label class="erp-label">ลิงก์ Google Maps</label><input v-model="branchForm.mapUrl" class="erp-input" placeholder="https://maps.google.com/?q=..." /></div>
        <div class="erp-field"><label class="erp-label">ลำดับแสดงผล</label><input v-model.number="branchForm.sortOrder" type="number" class="erp-input" /></div>
        <div class="erp-field">
          <label class="erp-label">สถานะ</label>
          <select v-model="branchForm.active" class="erp-input">
            <option :value="true">เปิดใช้งาน</option>
            <option :value="false">ปิดใช้งาน</option>
          </select>
        </div>
      </div>
      <div style="display:flex;justify-content:flex-end;margin-top:12px">
        <button type="button" class="erp-btn erp-btn--primary" :disabled="saving" @click="saveBranch">
          {{ saving ? 'กำลังบันทึก...' : '💾 บันทึกสาขา' }}
        </button>
      </div>
    </div>

    <div class="erp-panel">
      <div class="erp-panel__head">
        <div class="erp-panel__title">สาขาทั้งหมด ({{ branches.length }})</div>
      </div>
      <div class="erp-table-wrap">
        <table class="erp-table">
          <thead>
            <tr><th>สาขา</th><th>โซน / จังหวัด</th><th>ที่อยู่</th><th>โทร</th><th>เวลาทำการ</th><th>สถานะ</th><th v-if="canEdit">จัดการ</th></tr>
          </thead>
          <tbody>
            <tr v-for="b in branches" :key="b.id">
              <td>
                <strong>{{ b.nameTh || b.name }}</strong>
                <small v-if="b.nameEn" class="block muted">{{ b.nameEn }}</small>
                <small class="block muted" style="font-family:monospace">{{ b.slug }}</small>
              </td>
              <td>{{ b.province || b.zone }}</td>
              <td style="max-width:260px">{{ b.addressTh || b.address || '—' }}</td>
              <td>{{ b.phone || '—' }}</td>
              <td>{{ b.hours || '—' }}</td>
              <td>
                <span class="badge" :style="b.active !== false ? 'background:#ecfdf5;color:#065f46;border-color:#6ee7b7' : 'background:#fef2f2;color:#b91c1c;border-color:#fecaca'">
                  {{ b.active !== false ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                </span>
              </td>
              <td v-if="canEdit">
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                  <button type="button" class="erp-btn erp-btn--sm" @click="editBranch(b)">แก้ไข</button>
                  <button type="button" class="erp-btn erp-btn--sm erp-btn--ghost" @click="deleteBranch(Number(b.id))">ลบ</button>
                </div>
              </td>
            </tr>
            <tr v-if="!branches.length">
              <td colspan="7" class="center muted" style="padding:24px">ยังไม่มีข้อมูลสาขา</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
