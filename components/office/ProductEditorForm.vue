<script setup lang="ts">
const props = defineProps<{
  productId?: number | null
}>()

const localePath = useLocalePath()
const toast = useToast()

const isEdit = computed(() => Boolean(props.productId))

const { data: metaData } = await useFetch<any>('/api/site')
const categories = computed(() => metaData.value?.categories || [])
const brands = computed(() => metaData.value?.brands || [])

const shopeeUrlInput = ref('')
const shopeeRawInput = ref('')
const showRawPaste = ref(false)
const importingShopee = ref(false)
const aiRunning = ref(false)
const saving = ref(false)

const form = reactive({
  sku: '',
  slug: '',
  nameTh: '',
  nameEn: '',
  brandSlug: 'olympianus',
  categorySlug: 'men-watches',
  price: 4900,
  originalPrice: 6900 as number | null,
  stock: 10,
  featured: true,
  active: true,
  images: ['/images/op/watch-990-083-blue.png'] as string[],
  descriptionTh: '',
  descriptionEn: '',
  specsEntries: [
    { k: 'Movement', v: 'Japanese Automatic / Precision Quartz' },
    { k: 'Crystal', v: 'Sapphire Crystal กันรอยขีดข่วน' },
    { k: 'Case Material', v: '316L Stainless Steel' },
    { k: 'Water Resistance', v: '5 ATM (50m)' },
    { k: 'Warranty', v: 'รับประกันศูนย์ไทย 2 ปี (บริษัท อินเตอร์ไทมส์ จำกัด)' }
  ] as { k: string; v: string }[],
  shopeeUrl: '',
  shopeeItemId: '',
  videoUrl: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  aseoSummary: '',
  aseoFaqs: [] as { q: string; a: string }[]
})

// Load existing product when editing
if (props.productId) {
  const { data: existing } = await useFetch<any>(`/api/admin/products/${props.productId}`)
  const p = existing.value?.product || existing.value
  if (p) {
    form.sku = p.sku || ''
    form.slug = p.slug || ''
    form.nameTh = p.nameTh || ''
    form.nameEn = p.nameEn || ''
    form.brandSlug = p.brandSlug || 'olympianus'
    form.categorySlug = p.categorySlug || 'men-watches'
    form.price = Number(p.price || 0)
    form.originalPrice = p.originalPrice ? Number(p.originalPrice) : null
    form.stock = Number(p.stock ?? 10)
    form.featured = Boolean(p.featured)
    form.active = p.active !== false
    form.images = Array.isArray(p.images) && p.images.length ? [...p.images] : [p.image || '/images/op/watch-990-083-blue.png']
    form.descriptionTh = p.descriptionTh || ''
    form.descriptionEn = p.descriptionEn || ''
    form.shopeeUrl = p.shopeeUrl || ''
    form.shopeeItemId = p.shopeeItemId || ''
    form.videoUrl = p.videoUrl || ''
    form.seoTitle = p.seoTitle || ''
    form.seoDescription = p.seoDescription || ''
    form.seoKeywords = p.seoKeywords || ''
    form.aseoSummary = p.aseoSummary || ''
    form.aseoFaqs = Array.isArray(p.aseoFaqs) ? [...p.aseoFaqs] : []
    if (p.specs && typeof p.specs === 'object' && Object.keys(p.specs).length) {
      form.specsEntries = Object.entries(p.specs).map(([k, v]) => ({ k, v: String(v ?? '') }))
    }
  }
}

async function pullFromShopee() {
  if (!shopeeUrlInput.value.trim() && !shopeeRawInput.value.trim()) {
    toast.error('กรุณาวางลิงก์สินค้า Shopee หรือข้อมูล JSON/ข้อความจากหน้าสินค้า')
    return
  }
  importingShopee.value = true
  try {
    const res = await $fetch<any>('/api/admin/products/shopee-import', {
      method: 'POST',
      body: {
        url: shopeeUrlInput.value.trim(),
        rawText: shopeeRawInput.value.trim(),
        saveImmediately: false
      }
    })
    const d = res.imported
    if (d) {
      if (d.nameTh) form.nameTh = d.nameTh
      if (d.nameEn) form.nameEn = d.nameEn
      if (d.sku) form.sku = d.sku
      if (d.brandSlug) form.brandSlug = d.brandSlug
      if (d.categorySlug) form.categorySlug = d.categorySlug
      if (d.price) form.price = Number(d.price)
      if (d.originalPrice) form.originalPrice = Number(d.originalPrice)
      if (d.stock) form.stock = Number(d.stock)
      if (Array.isArray(d.images) && d.images.length) form.images = d.images
      if (d.descriptionTh) form.descriptionTh = `<p>${String(d.descriptionTh).replace(/\n+/g, '</p><p>')}</p>`
      if (d.shopeeUrl) form.shopeeUrl = d.shopeeUrl
      if (d.shopeeItemId) form.shopeeItemId = d.shopeeItemId
      if (d.specs && Object.keys(d.specs).length) {
        form.specsEntries = Object.entries(d.specs).map(([k, v]) => ({ k, v: String(v ?? '') }))
      }
      toast.success('ดึงข้อมูล รูปภาพ และราคาจาก Shopee สำเร็จ! ตรวจสอบหรือกด AI เสริมเนื้อหาต่อได้ทันที')
    }
  } catch (e: any) {
    showRawPaste.value = true
    toast.error(e?.data?.statusMessage || 'Shopee ป้องกันการดึงอัตโนมัติในบางลิงก์ — สามารถวางข้อความ/โค้ดหน้าสินค้าในช่องด้านล่างได้ทันที')
  } finally {
    importingShopee.value = false
  }
}

async function runAiFull(onlySeo = false) {
  aiRunning.value = true
  try {
    const specsObj: Record<string, string> = {}
    for (const row of form.specsEntries) if (row.k.trim()) specsObj[row.k.trim()] = row.v
    const res = await $fetch<any>('/api/admin/ai/generate', {
      method: 'POST',
      body: {
        task: onlySeo ? 'seo-aseo' : 'product-full',
        input: {
          nameTh: form.nameTh,
          nameEn: form.nameEn,
          sku: form.sku,
          brand: form.brandSlug,
          category: form.categorySlug,
          price: form.price,
          specs: specsObj,
          rawNotes: form.descriptionTh.replace(/<[^>]+>/g, '')
        }
      }
    })
    const r = res.result || {}
    if (!onlySeo) {
      if (r.nameTh && !form.nameTh) form.nameTh = r.nameTh
      if (r.nameEn && !form.nameEn) form.nameEn = r.nameEn
      if (r.descriptionTh) form.descriptionTh = r.descriptionTh
      if (r.descriptionEn) form.descriptionEn = r.descriptionEn
      if (r.specs && typeof r.specs === 'object' && Object.keys(r.specs).length) {
        form.specsEntries = Object.entries(r.specs).map(([k, v]) => ({ k, v: String(v ?? '') }))
      }
    }
    if (r.seoTitle) form.seoTitle = r.seoTitle
    if (r.seoDescription) form.seoDescription = r.seoDescription
    if (r.seoKeywords) form.seoKeywords = r.seoKeywords
    if (r.aseoSummary) form.aseoSummary = r.aseoSummary
    if (Array.isArray(r.aseoFaqs) && r.aseoFaqs.length) form.aseoFaqs = r.aseoFaqs
    toast.success(`AI สร้างข้อมูลสำเร็จ (${res.source === 'builtin-horology-engine' ? 'Built-in Horology AI' : res.provider})`)
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'ประมวลผล AI ไม่สำเร็จ')
  } finally {
    aiRunning.value = false
  }
}

function addSpecRow() {
  form.specsEntries.push({ k: '', v: '' })
}

function removeSpecRow(i: number) {
  form.specsEntries.splice(i, 1)
}

async function saveProduct() {
  if (!form.nameTh.trim() && !form.nameEn.trim()) {
    toast.error('กรุณาระบุชื่อสินค้าอย่างน้อย 1 ภาษา')
    return
  }
  saving.value = true
  try {
    const specs: Record<string, string> = {}
    for (const r of form.specsEntries) {
      if (r.k.trim()) specs[r.k.trim()] = r.v.trim()
    }
    const payload = {
      sku: form.sku,
      slug: form.slug || undefined,
      nameTh: form.nameTh || form.nameEn,
      nameEn: form.nameEn || form.nameTh,
      brandSlug: form.brandSlug,
      categorySlug: form.categorySlug,
      price: Number(form.price || 0),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock: Number(form.stock ?? 0),
      featured: form.featured,
      active: form.active,
      images: form.images,
      descriptionTh: form.descriptionTh,
      descriptionEn: form.descriptionEn,
      specs,
      shopeeUrl: form.shopeeUrl,
      shopeeItemId: form.shopeeItemId,
      videoUrl: form.videoUrl,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      seoKeywords: form.seoKeywords,
      aseoSummary: form.aseoSummary,
      aseoFaqs: form.aseoFaqs
    }
    if (isEdit.value) {
      await $fetch(`/api/admin/products/${props.productId}`, { method: 'PUT', body: payload })
      toast.success('บันทึกข้อมูลสินค้าเรียบร้อย!')
    } else {
      const created = await $fetch<any>('/api/admin/products', { method: 'POST', body: payload })
      toast.success('เพิ่มสินค้าใหม่เรียบร้อย!')
      await navigateTo(localePath(`/office/products/${created.product.id}`))
    }
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'บันทึกสินค้าไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="erp-page-head">
      <div>
        <div class="erp-kicker">MODULE 7.2 · SMART PRODUCT STUDIO · SHOPEE + DRAG &amp; DROP + CKEDITOR + AI</div>
        <h1 class="erp-h1">{{ isEdit ? `แก้ไขสินค้า: ${form.nameTh || form.sku}` : 'เพิ่มสินค้าใหม่ / ดึงข้อมูลจาก Shopee อัตโนมัติ' }}</h1>
        <p class="erp-sub">รองรับการดึงรูปและเนื้อหาจาก Shopee, อัปโหลดลากวางสลับลำดับรูป, CKEditor ฟรี, SEO + ASEO และระบบ AI ช่วยเขียนครบทุกจุด</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <NuxtLink :to="localePath('/office/products')" class="erp-btn">← กลับหน้ารายการสินค้า</NuxtLink>
        <button type="button" class="erp-btn erp-btn--violet" :disabled="aiRunning" @click="runAiFull(false)">
          {{ aiRunning ? 'AI กำลังเขียนข้อมูล...' : '✨ ให้ AI เขียนเนื้อหา + สเปก + SEO/ASEO ทั้งหน้า' }}
        </button>
        <button type="button" class="erp-btn erp-btn--primary" :disabled="saving" @click="saveProduct">
          {{ saving ? 'กำลังบันทึก...' : '💾 บันทึกสินค้า' }}
        </button>
      </div>
    </div>

    <!-- 1. Shopee Importer Bar -->
    <div class="erp-panel" style="border-color:rgba(238,77,45,0.45);background:linear-gradient(180deg,rgba(45,18,16,0.42),rgba(10,17,32,0.92))">
      <div class="erp-panel__head">
        <div>
          <span class="erp-chip erp-chip--amber">SHOPEE SYNC IMPORTER</span>
          <strong style="margin-left:8px;color:#fff">ดึงรูปภาพ ชื่อ รุ่น ราคา และรายละเอียดสินค้าจาก Shopee (shopee.co.th/opwatchthailand)</strong>
        </div>
        <button type="button" class="erp-btn erp-btn--sm" @click="showRawPaste = !showRawPaste">
          {{ showRawPaste ? 'ซ่อนช่องวางข้อความเสริม' : '+ วาง JSON / ข้อความจาก Shopee เอง' }}
        </button>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <input
          v-model="shopeeUrlInput"
          class="erp-input"
          style="flex:1;min-width:260px"
          placeholder="วางลิงก์สินค้า Shopee เช่น https://shopee.co.th/Olym-Pianus-899832AGS-i.123456.7890123"
        />
        <button type="button" class="erp-btn erp-btn--primary" :disabled="importingShopee" @click="pullFromShopee">
          {{ importingShopee ? 'กำลังดึงจาก Shopee...' : '🛍 ดึงข้อมูลจาก Shopee ทันที' }}
        </button>
      </div>

      <div v-if="showRawPaste" style="margin-top:10px">
        <textarea
          v-model="shopeeRawInput"
          class="erp-textarea"
          rows="3"
          placeholder="กรณี Shopee จำกัดการเข้าถึงบอท สามารถก๊อปปี้ข้อความรายละเอียดสินค้า หรือ JSON จากหน้า Shopee มาวางที่นี่แล้วกดปุ่มดึงข้อมูลได้ทันที..."
        />
      </div>
    </div>

    <!-- 2. Core Product Information & Pricing -->
    <div class="erp-panel">
      <div class="erp-panel__head">
        <div class="erp-panel__title">ข้อมูลหลัก รุ่น แบรนด์ และราคาจำหน่าย</div>
        <div style="display:flex;gap:14px;align-items:center">
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
            <input v-model="form.featured" type="checkbox" /> ★ แสดงในโปรโมชั่น / สินค้าแนะนำหน้าแรก
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
            <input v-model="form.active" type="checkbox" /> เปิดขายบนหน้าเว็บ
          </label>
        </div>
      </div>

      <div class="erp-form-grid">
        <div class="erp-field">
          <label class="erp-label">ชื่อสินค้า (ภาษาไทย) *</label>
          <input v-model="form.nameTh" class="erp-input" placeholder="เช่น นาฬิกาข้อมือ Olym Pianus Automatic รุ่น 899832AGS กระจกแซฟไฟร์" />
        </div>
        <div class="erp-field">
          <label class="erp-label">ชื่อสินค้า (English)</label>
          <input v-model="form.nameEn" class="erp-input" placeholder="e.g. Olym Pianus Automatic Diver 899832AGS Sapphire" />
        </div>
      </div>

      <div class="erp-form-grid erp-form-grid--3" style="margin-top:12px">
        <div class="erp-field">
          <label class="erp-label">รหัสรุ่น / SKU</label>
          <input v-model="form.sku" class="erp-input" placeholder="เช่น 899832AGS" />
        </div>
        <div class="erp-field">
          <label class="erp-label">แบรนด์ทางการ (3 แบรนด์หลัก)</label>
          <select v-model="form.brandSlug" class="erp-select">
            <option v-for="b in brands" :key="b.slug" :value="b.slug">{{ b.name }}</option>
            <option v-if="!brands.length" value="olympianus">Olym Pianus</option>
            <option v-if="!brands.length" value="olympia-star">Olympia Star</option>
            <option v-if="!brands.length" value="ogival">Ogival</option>
          </select>
        </div>
        <div class="erp-field">
          <label class="erp-label">หมวดหมู่สินค้า</label>
          <select v-model="form.categorySlug" class="erp-select">
            <option v-for="c in categories" :key="c.slug" :value="c.slug">{{ c.nameTh || c.nameEn }}</option>
          </select>
        </div>
      </div>

      <div class="erp-form-grid erp-form-grid--3" style="margin-top:12px">
        <div class="erp-field">
          <label class="erp-label">ราคาขายสุทธิ (บาท) *</label>
          <input v-model.number="form.price" type="number" min="0" class="erp-input" />
        </div>
        <div class="erp-field">
          <label class="erp-label">ราคาปกติก่อนลด (แสดงป้าย -XX% &amp; Save ฿...)</label>
          <input v-model.number="form.originalPrice" type="number" min="0" class="erp-input" placeholder="เว้นว่างหากไม่มีส่วนลด" />
        </div>
        <div class="erp-field">
          <label class="erp-label">สต็อกคงเหลือ (เรือน)</label>
          <input v-model.number="form.stock" type="number" min="0" class="erp-input" />
        </div>
      </div>

      <div class="erp-form-grid" style="margin-top:12px">
        <div class="erp-field">
          <label class="erp-label">ลิงก์สินค้าบน Shopee Official (แสดงปุ่มสั่งผ่าน Shopee บนหน้ารายละเอียด)</label>
          <input v-model="form.shopeeUrl" class="erp-input" placeholder="https://shopee.co.th/..." />
        </div>
        <div class="erp-field">
          <label class="erp-label">URL Slug (สร้างอัตโนมัติหากเว้นว่าง)</label>
          <input v-model="form.slug" class="erp-input" placeholder="เช่น olympianus-899832ags-black" />
        </div>
      </div>
    </div>

    <!-- 3. Drag-and-Drop Multi-Image Upload & Reorder -->
    <div class="erp-panel">
      <div class="erp-panel__head">
        <div class="erp-panel__title">จัดการรูปภาพสินค้า (ลากวางหลายรูป &amp; ลากสลับตำแหน่งได้อิสระ)</div>
        <span class="erp-chip erp-chip--cyan">{{ form.images.length }} รูปภาพ</span>
      </div>
      <OfficeImageManager v-model="form.images" />
    </div>

    <!-- 4. Free CKEditor Rich Text Description -->
    <div class="erp-panel">
      <div class="erp-panel__head">
        <div class="erp-panel__title">รายละเอียดเนื้อหาสินค้า (Rich Text Editor แบบ CKEditor ฟรี)</div>
        <button type="button" class="erp-btn erp-btn--sm erp-btn--violet" :disabled="aiRunning" @click="runAiFull(false)">
          ✨ ให้ AI ร่างคำบรรยายสินค้าใหม่
        </button>
      </div>

      <div class="erp-field" style="margin-bottom:16px">
        <label class="erp-label">เนื้อหารายละเอียดภาษาไทย (รองรับตัวหนา ตาราง รูปภาพ และโค้ด HTML)</label>
        <OfficeRichEditor v-model="form.descriptionTh" />
      </div>

      <div class="erp-field">
        <label class="erp-label">เนื้อหารายละเอียดภาษาอังกฤษ (English Description)</label>
        <OfficeRichEditor v-model="form.descriptionEn" :min-height="150" />
      </div>
    </div>

    <!-- 5. Horological Specifications Table Editor -->
    <div class="erp-panel">
      <div class="erp-panel__head">
        <div class="erp-panel__title">ตารางสเปกนาฬิกา (Technical Specifications)</div>
        <button type="button" class="erp-btn erp-btn--sm" @click="addSpecRow">+ เพิ่มแถวสเปก</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div v-for="(row, i) in form.specsEntries" :key="i" style="display:grid;grid-template-columns:220px 1fr auto;gap:8px">
          <input v-model="row.k" class="erp-input" placeholder="หัวข้อ เช่น Crystal" />
          <input v-model="row.v" class="erp-input" placeholder="รายละเอียด เช่น Sapphire Crystal" />
          <button type="button" class="erp-btn erp-btn--sm erp-btn--danger" @click="removeSpecRow(i)">✕</button>
        </div>
      </div>
    </div>

    <!-- 6. SEO + ASEO Studio -->
    <div class="erp-panel">
      <OfficeSeoAseoPanel
        v-model:seo-title="form.seoTitle"
        v-model:seo-description="form.seoDescription"
        v-model:seo-keywords="form.seoKeywords"
        v-model:aseo-summary="form.aseoSummary"
        v-model:aseo-faqs="form.aseoFaqs"
        :preview-url="`https://www.opwatch.co.th/products/${form.slug || 'watch-model'}`"
        :ai-loading="aiRunning"
        @generate-ai="runAiFull(true)"
      />
    </div>

    <!-- Sticky Bottom Save Bar -->
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px">
      <NuxtLink :to="localePath('/office/products')" class="erp-btn">ยกเลิก</NuxtLink>
      <button type="button" class="erp-btn erp-btn--primary" :disabled="saving" @click="saveProduct">
        {{ saving ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูลสินค้าทั้งหมด' }}
      </button>
    </div>
  </div>
</template>
