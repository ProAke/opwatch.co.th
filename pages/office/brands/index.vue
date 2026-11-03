<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const toast = useToast()
const tab = ref<'brands' | 'categories'>('brands')

const { data: brandData, refresh: refreshBrands } = await useFetch<any>('/api/admin/brands')
const { data: catData, refresh: refreshCats } = await useFetch<any>('/api/admin/categories')

const brands = computed(() => brandData.value?.items || [])
const categories = computed(() => catData.value?.items || [])

const brandForm = reactive({
  id: 0,
  name: '',
  slug: '',
  country: 'ญี่ปุ่น / สวิตเซอร์แลนด์',
  movement: 'Japanese / Swiss Movement',
  tagline: ''
})

async function saveBrand() {
  if (!brandForm.name.trim()) return
  if (brandForm.id) {
    await $fetch(`/api/admin/brands/${brandForm.id}`, { method: 'PUT', body: brandForm })
  } else {
    await $fetch('/api/admin/brands', { method: 'POST', body: brandForm })
  }
  toast.success('บันทึกแบรนด์เรียบร้อย')
  brandForm.id = 0
  brandForm.name = ''
  brandForm.slug = ''
  brandForm.tagline = ''
  await refreshBrands()
}

const catForm = reactive({
  id: 0,
  nameTh: '',
  nameEn: '',
  slug: ''
})

async function saveCategory() {
  if (!catForm.nameTh.trim()) return
  if (catForm.id) {
    await $fetch(`/api/admin/categories/${catForm.id}`, { method: 'PUT', body: catForm })
  } else {
    await $fetch('/api/admin/categories', { method: 'POST', body: catForm })
  }
  toast.success('บันทึกหมวดหมู่เรียบร้อย')
  catForm.id = 0
  catForm.nameTh = ''
  catForm.nameEn = ''
  catForm.slug = ''
  await refreshCats()
}

useHead({ title: 'จัดการแบรนด์ & หมวดหมู่สินค้า — OPWatch Office' })
</script>

<template>
  <div>
    <div class="erp-page-head">
      <div>
        <div class="erp-kicker">TAXONOMY &amp; BRAND HOUSES</div>
        <h1 class="erp-h1">จัดการแบรนด์ทางการ (3 แบรนด์หลัก) &amp; หมวดหมู่สินค้า</h1>
      </div>
    </div>

    <div class="erp-tabs">
      <button type="button" class="erp-tab" :class="{ 'is-active': tab === 'brands' }" @click="tab = 'brands'">
        🏷 แบรนด์นาฬิกา ({{ brands.length }})
      </button>
      <button type="button" class="erp-tab" :class="{ 'is-active': tab === 'categories' }" @click="tab = 'categories'">
        📂 หมวดหมู่สินค้า ({{ categories.length }})
      </button>
    </div>

    <template v-if="tab === 'brands'">
      <div class="erp-panel">
        <div class="erp-form-grid erp-form-grid--3">
          <div class="erp-field"><label class="erp-label">ชื่อแบรนด์</label><input v-model="brandForm.name" class="erp-input" /></div>
          <div class="erp-field"><label class="erp-label">Slug</label><input v-model="brandForm.slug" class="erp-input" /></div>
          <div class="erp-field"><label class="erp-label">คำขวัญ / จุดเด่น</label><input v-model="brandForm.tagline" class="erp-input" /></div>
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:12px">
          <button type="button" class="erp-btn erp-btn--primary" @click="saveBrand">💾 บันทึกแบรนด์</button>
        </div>
      </div>

      <div class="erp-panel">
        <div class="erp-table-wrap">
          <table class="erp-table">
            <thead><tr><th>แบรนด์</th><th>Slug</th><th>แหล่งกำเนิด / กลไก</th><th>จัดการ</th></tr></thead>
            <tbody>
              <tr v-for="b in brands" :key="b.id">
                <td><strong>{{ b.name }}</strong></td>
                <td style="font-family:monospace;color:#67e8f9">{{ b.slug }}</td>
                <td>{{ b.country }} · {{ b.movement }}</td>
                <td>
                  <button type="button" class="erp-btn erp-btn--sm" @click="Object.assign(brandForm, b)">แก้ไข</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="erp-panel">
        <div class="erp-form-grid erp-form-grid--3">
          <div class="erp-field"><label class="erp-label">ชื่อหมวดหมู่ (ไทย)</label><input v-model="catForm.nameTh" class="erp-input" /></div>
          <div class="erp-field"><label class="erp-label">ชื่อหมวดหมู่ (EN)</label><input v-model="catForm.nameEn" class="erp-input" /></div>
          <div class="erp-field"><label class="erp-label">Slug</label><input v-model="catForm.slug" class="erp-input" /></div>
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:12px">
          <button type="button" class="erp-btn erp-btn--primary" @click="saveCategory">💾 บันทึกหมวดหมู่</button>
        </div>
      </div>

      <div class="erp-panel">
        <div class="erp-table-wrap">
          <table class="erp-table">
            <thead><tr><th>หมวดหมู่ (ไทย)</th><th>English</th><th>Slug</th><th>จัดการ</th></tr></thead>
            <tbody>
              <tr v-for="c in categories" :key="c.id">
                <td><strong>{{ c.nameTh }}</strong></td>
                <td>{{ c.nameEn }}</td>
                <td style="font-family:monospace;color:#67e8f9">{{ c.slug }}</td>
                <td><button type="button" class="erp-btn erp-btn--sm" @click="Object.assign(catForm, c)">แก้ไข</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
