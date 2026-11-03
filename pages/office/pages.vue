<script setup lang="ts">
definePageMeta({ layout: 'office', middleware: ['office'] })

const localePath = useLocalePath()
const toast = useToast()

const { data, refresh } = await useFetch<any>('/api/admin/pages')
const pages = computed(() => data.value?.items || [])

const editingId = ref<number | null>(null)
const saving = ref(false)
const aiBusy = ref(false)

const form = reactive({
  slug: '',
  titleTh: '',
  titleEn: '',
  category: 'policy',
  excerptTh: '',
  contentTh: '',
  contentEn: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  aseoSummary: '',
  aseoFaqs: [] as { q: string; a: string }[],
  published: true,
  sortOrder: 10
})

function selectPage(p: any) {
  editingId.value = p.id
  form.slug = p.slug || ''
  form.titleTh = p.titleTh || ''
  form.titleEn = p.titleEn || ''
  form.category = p.category || 'policy'
  form.excerptTh = p.excerptTh || ''
  form.contentTh = p.contentTh || ''
  form.contentEn = p.contentEn || ''
  form.seoTitle = p.seoTitle || ''
  form.seoDescription = p.seoDescription || ''
  form.seoKeywords = p.seoKeywords || ''
  form.aseoSummary = p.aseoSummary || ''
  form.aseoFaqs = Array.isArray(p.aseoFaqs) ? [...p.aseoFaqs] : []
  form.published = p.published !== false
  form.sortOrder = Number(p.sortOrder ?? 10)
}

function startNew() {
  editingId.value = null
  form.slug = ''
  form.titleTh = ''
  form.titleEn = ''
  form.category = 'general'
  form.excerptTh = ''
  form.contentTh = '<h2>หัวข้อเนื้อหา</h2><p>รายละเอียดเนื้อหาของหน้าเว็บไซต์...</p>'
  form.contentEn = ''
  form.seoTitle = ''
  form.seoDescription = ''
  form.seoKeywords = ''
  form.aseoSummary = ''
  form.aseoFaqs = []
  form.published = true
}

onMounted(() => {
  if (pages.value.length && !editingId.value) {
    selectPage(pages.value[0])
  }
})

async function runPageAi(onlySeo = false) {
  aiBusy.value = true
  try {
    const res = await $fetch<any>('/api/admin/ai/generate', {
      method: 'POST',
      body: {
        task: onlySeo ? 'seo-aseo' : 'page-full',
        input: {
          titleTh: form.titleTh || 'ข้อมูลบริการและการรับประกัน OPWatch',
          titleEn: form.titleEn,
          topic: form.excerptTh || form.titleTh,
          nameTh: form.titleTh
        }
      }
    })
    const r = res.result || {}
    if (!onlySeo) {
      if (r.titleTh && !form.titleTh) form.titleTh = r.titleTh
      if (r.titleEn && !form.titleEn) form.titleEn = r.titleEn
      if (r.excerptTh) form.excerptTh = r.excerptTh
      if (r.contentTh) form.contentTh = r.contentTh
      if (r.contentEn) form.contentEn = r.contentEn
    }
    if (r.seoTitle) form.seoTitle = r.seoTitle
    if (r.seoDescription) form.seoDescription = r.seoDescription
    if (r.seoKeywords) form.seoKeywords = r.seoKeywords
    if (r.aseoSummary) form.aseoSummary = r.aseoSummary
    if (Array.isArray(r.aseoFaqs) && r.aseoFaqs.length) form.aseoFaqs = r.aseoFaqs
    toast.success('AI สร้างเนื้อหาและ SEO + ASEO เรียบร้อย!')
  } catch {
    toast.error('ประมวลผล AI ไม่สำเร็จ')
  } finally {
    aiBusy.value = false
  }
}

async function savePage() {
  if (!form.titleTh.trim()) {
    toast.error('กรุณาระบุชื่อหน้าเว็บไซต์')
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/pages/${editingId.value}`, { method: 'PUT', body: form })
    } else {
      const res = await $fetch<any>('/api/admin/pages', { method: 'POST', body: form })
      editingId.value = res.page?.id || null
    }
    toast.success('บันทึกเนื้อหาหน้าเว็บไซต์เรียบร้อย!')
    await refresh()
  } catch {
    toast.error('บันทึกหน้าเว็บไซต์ไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}

async function removePage() {
  if (!editingId.value || !import.meta.client || !window.confirm('ยืนยันการลบหน้านี้?')) return
  await $fetch(`/api/admin/pages/${editingId.value}`, { method: 'DELETE' })
  toast.success('ลบหน้าเรียบร้อย')
  startNew()
  await refresh()
}

useHead({ title: 'จัดการหน้าเว็บไซต์ CMS + CKEditor + SEO/ASEO — OPWatch Office' })
</script>

<template>
  <div>
    <div class="erp-page-head">
      <div>
        <div class="erp-kicker">MODULE 7.3 · WEBSITE CMS · CKEDITOR + SEO + ASEO + AI</div>
        <h1 class="erp-h1">จัดการเนื้อหาของหน้าเว็บไซต์ต่างๆ (CMS Pages)</h1>
        <p class="erp-sub">
          แก้ไขนโยบายความเป็นส่วนตัว (PDPA), นโยบายคุกกี้, ข้อตกลงและเงื่อนไข, นโยบายเปลี่ยนคืนสินค้า หรือสร้างหน้าใหม่พร้อม CKEditor ฟรี และ AI SEO/ASEO
        </p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" class="erp-btn" @click="startNew">+ สร้างหน้าเว็บไซต์ใหม่</button>
        <button type="button" class="erp-btn erp-btn--violet" :disabled="aiBusy" @click="runPageAi(false)">
          {{ aiBusy ? 'AI กำลังเขียน...' : '✨ ให้ AI เขียนเนื้อหา + SEO/ASEO ทั้งหน้า' }}
        </button>
        <button type="button" class="erp-btn erp-btn--primary" :disabled="saving" @click="savePage">
          {{ saving ? 'กำลังบันทึก...' : '💾 บันทึกหน้าเว็บ' }}
        </button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:280px minmax(0,1fr);gap:18px" class="cms-split">
      <!-- Left Page Selector -->
      <div class="erp-panel" style="height:fit-content">
        <div class="erp-panel__title" style="margin-bottom:10px">รายการหน้าเว็บไซต์ ({{ pages.length }})</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button
            v-for="p in pages"
            :key="p.id"
            type="button"
            style="text-align:left;padding:10px 12px;border-radius:11px;border:1px solid #e9ebf6;cursor:pointer;color:#23264d;font-family:inherit"
            :style="{ background: editingId === p.id ? 'var(--violet-soft)' : '#f6f7fc', borderColor: editingId === p.id ? 'var(--violet)' : '#e9ebf6' }"
            @click="selectPage(p)"
          >
            <div style="font-weight:600;font-size:13px">{{ p.titleTh }}</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--violet)">/pages/{{ p.slug }}</div>
          </button>
        </div>
      </div>

      <!-- Right Editor + SEO/ASEO -->
      <div>
        <div class="erp-panel">
          <div class="erp-panel__head">
            <div class="erp-panel__title">{{ editingId ? `แก้ไขหน้า: ${form.titleTh}` : 'สร้างหน้าเว็บไซต์ใหม่' }}</div>
            <div style="display:flex;gap:8px;align-items:center">
              <NuxtLink v-if="form.slug" :to="localePath(`/pages/${form.slug}`)" target="_blank" class="erp-btn erp-btn--sm">
                ↗ เปิดดูหน้าจริง
              </NuxtLink>
              <button v-if="editingId" type="button" class="erp-btn erp-btn--sm erp-btn--danger" @click="removePage">ลบหน้านี้</button>
            </div>
          </div>

          <div class="erp-form-grid erp-form-grid--3">
            <div class="erp-field">
              <label class="erp-label">ชื่อหน้า (ภาษาไทย) *</label>
              <input v-model="form.titleTh" class="erp-input" />
            </div>
            <div class="erp-field">
              <label class="erp-label">ชื่อหน้า (English)</label>
              <input v-model="form.titleEn" class="erp-input" />
            </div>
            <div class="erp-field">
              <label class="erp-label">URL Slug (เช่น privacy-policy)</label>
              <input v-model="form.slug" class="erp-input" placeholder="สร้างอัตโนมัติหากเว้นว่าง" />
            </div>
          </div>

          <div class="erp-field" style="margin-top:12px">
            <label class="erp-label">คำโปรยย่อ (Excerpt)</label>
            <input v-model="form.excerptTh" class="erp-input" />
          </div>

          <div class="erp-field" style="margin-top:14px">
            <label class="erp-label">เนื้อหาหลักภาษาไทย (CKEditor-Style Rich Text Editor ฟรี)</label>
            <OfficeRichEditor v-model="form.contentTh" :min-height="280" />
          </div>

          <div class="erp-field" style="margin-top:14px">
            <label class="erp-label">เนื้อหาภาษาอังกฤษ (English Content)</label>
            <OfficeRichEditor v-model="form.contentEn" :min-height="160" />
          </div>
        </div>

        <div class="erp-panel">
          <OfficeSeoAseoPanel
            v-model:seo-title="form.seoTitle"
            v-model:seo-description="form.seoDescription"
            v-model:seo-keywords="form.seoKeywords"
            v-model:aseo-summary="form.aseoSummary"
            v-model:aseo-faqs="form.aseoFaqs"
            :preview-url="`https://www.opwatch.co.th/pages/${form.slug || 'page'}`"
            :ai-loading="aiBusy"
            @generate-ai="runPageAi(true)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 980px) {
  .cms-split { grid-template-columns: 1fr !important; }
}
</style>
