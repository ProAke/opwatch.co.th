<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const { site } = useSite()

const id = computed(() => String(route.params.id))
const isNew = computed(() => id.value === 'new')

const categories = ref<Record<string, any>[]>([])
onMounted(async () => {
  const res = await $fetch<{ items: Record<string, any>[] }>('/api/admin/categories')
  categories.value = res.items
})

const form = reactive({
  name: '',
  nameEn: '',
  nameTh: '',
  sku: '',
  slug: '',
  categoryId: '' as string | number,
  brand: 'Opwatch',
  price: 0,
  priceCompare: null as number | null,
  currency: 'THB',
  images: ['/images/hero-watch.jpg'] as string[],
  shortDescription: '',
  description: '',
  descriptionEn: '',
  descriptionTh: '',
  stock: 0,
  status: 'active' as 'active' | 'draft',
  featured: false,
  sortOrder: 0,
  specsText: 'Movement: \nCase: \nWater resistance: \nStrap: \nWarranty: '
})

const specs = ref<Record<string, string>>({})

const loading = ref(!isNew.value)
const saving = ref(false)
const errors = ref<Record<string, string>>({})

function parseSpecs(text: string) {
  const out: Record<string, string> = {}
  for (const line of String(text).split('\n')) {
    const [k, ...rest] = line.split(':')
    if (k && rest.length) out[k.trim()] = rest.join(':').trim()
  }
  return out
}

const { data } = await useFetch<{ product: Record<string, any> }>(
  () => (isNew.value ? null : `/api/admin/products/${id.value}`),
  { default: () => ({ product: null }), immediate: !isNew.value }
)

const loadedProduct = data.value?.product
if (!isNew.value && loadedProduct) {
  const p = loadedProduct
  Object.assign(form, {
    name: p.name || '',
    nameEn: p.nameEn || '',
    nameTh: p.nameTh || '',
    sku: p.sku || '',
    slug: p.slug || '',
    categoryId: p.categoryId ? String(p.categoryId) : '',
    brand: p.brand || 'Opwatch',
    price: Number(p.price || 0),
    priceCompare: p.priceCompare != null ? Number(p.priceCompare) : null,
    currency: p.currency || 'THB',
    images: Array.isArray(p.images) && p.images.length ? [...p.images] : ['/images/hero-watch.jpg'],
    shortDescription: p.shortDescription || '',
    description: p.description || '',
    descriptionEn: p.descriptionEn || '',
    descriptionTh: p.descriptionTh || '',
    stock: Number(p.stock || 0),
    status: p.status || 'active',
    featured: !!p.featured,
    sortOrder: Number(p.sortOrder || 0),
    specsText: Object.entries(p.specs || {}).map(([k, v]) => `${k}: ${v}`).join('\n')
  })
  specs.value = parseSpecs(form.specsText)
}

function addImage() {
  if (form.images.length >= 6) return
  form.images.push('/images/hero-watch.jpg')
}

function removeImage(i: number) {
  form.images.splice(i, 1)
  if (!form.images.length) form.images.push('/images/hero-watch.jpg')
}

async function save() {
  errors.value = {}
  if (!form.name.trim()) errors.value.name = t('admin.required')
  if (!form.sku.trim()) errors.value.sku = t('admin.required')
  if (Object.keys(errors.value).length) return

  saving.value = true
  try {
    const payload = { ...form, specs: specs.value }
    if (form.categoryId === '') payload.categoryId = null
    if (isNew.value) {
      await $fetch('/api/admin/products', { method: 'POST', body: payload })
      useToast().success(t('admin.updated'))
      navigateTo('/admin/products')
    } else {
      await $fetch(`/api/admin/products/${id.value}`, { method: 'PUT', body: payload })
      useToast().success(t('admin.updated'))
    }
  } catch (err: any) {
    const d = err?.data?.errors
    if (d) errors.value = d
    else useToast().error(t('errors.generic'))
  } finally {
    saving.value = false
  }
}

useHead({ title: `${isNew.value ? t('admin.newProduct') : t('common.edit')} — ${site.value.name}` })
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>

<template>
  <div>
    <div class="pagehead">
      <div>
        <NuxtLink to="/admin/products" class="link-underline" style="margin-bottom: 12px">{{ t('common.back') }} ←</NuxtLink>
        <h1 class="page-title" style="font-size: 2rem">{{ isNew ? t('admin.newProduct') : t('common.edit') }}</h1>
      </div>
      <div class="row gap-8">
        <NuxtLink to="/admin/products" class="btn btn--sm btn--ghost">{{ t('common.cancel') }}</NuxtLink>
        <button class="btn btn--sm btn--gold" :disabled="saving" @click="save">{{ saving ? t('common.loading') : t('admin.save') }}</button>
      </div>
    </div>

    <div v-if="loading" class="muted">{{ t('common.loading') }}</div>

    <div v-else class="prodgrid">
      <div class="prodmain">
        <section class="panel">
          <h2 class="serif panel__title">{{ t('admin.product') }}</h2>
          <div class="formgrid">
            <div class="field">
              <label class="label">{{ t('admin.name') }}</label>
              <input v-model="form.name" class="input" :class="{ 'input--error': errors.name }" />
              <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
            </div>
            <div class="field">
              <label class="label">{{ t('admin.sku') }}</label>
              <input v-model="form.sku" class="input" :class="{ 'input--error': errors.sku }" />
              <span v-if="errors.sku" class="field-error">{{ errors.sku }}</span>
            </div>
            <div class="field">
              <label class="label">Name (EN)</label>
              <input v-model="form.nameEn" class="input" />
            </div>
            <div class="field">
              <label class="label">ชื่อ (TH)</label>
              <input v-model="form.nameTh" class="input" />
            </div>
          </div>
        </section>

        <section class="panel">
          <h2 class="serif panel__title">{{ t('products.description') }}</h2>
          <div class="field" style="margin-bottom: 16px">
            <label class="label">{{ t('products.description') }}</label>
            <textarea v-model="form.shortDescription" class="textarea" style="min-height: 60px" />
          </div>
          <div class="field">
            <label class="label">English</label>
            <textarea v-model="form.descriptionEn" class="textarea" />
          </div>
          <div class="field" style="margin-top: 16px">
            <label class="label">ไทย</label>
            <textarea v-model="form.descriptionTh" class="textarea" />
          </div>
        </section>

        <section class="panel">
          <h2 class="serif panel__title">{{ t('products.specifications') }}</h2>
          <p class="small muted" style="margin-bottom: 12px">One per line, format <code>Key: value</code></p>
          <textarea v-model="form.specsText" class="textarea" style="font-family: monospace; font-size: 13px" />
        </section>

        <section class="panel">
          <h2 class="serif panel__title">{{ t('admin.image') }}</h2>
          <div class="imggrid">
            <div v-for="(img, i) in form.images" :key="i" class="imgcell">
              <img :src="img" alt="" />
              <button class="imgcell__rm" @click="removeImage(i)">×</button>
            </div>
            <button class="imgadd" @click="addImage">+</button>
          </div>
        </section>
      </div>

      <aside class="prodside">
        <section class="panel">
          <h2 class="serif panel__title">{{ t('admin.settings') }}</h2>
          <div class="field" style="margin-bottom: 16px">
            <label class="label">{{ t('products.category') }}</label>
            <select v-model="form.categoryId" class="select">
              <option value="">{{ t('common.none') }}</option>
              <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ locale === 'en' ? c.nameEn : c.nameTh }}</option>
            </select>
          </div>
          <div class="formgrid">
            <div class="field">
              <label class="label">{{ t('admin.price') }}</label>
              <input v-model.number="form.price" type="number" min="0" class="input" />
            </div>
            <div class="field">
              <label class="label">Compare price</label>
              <input v-model.number="form.priceCompare" type="number" min="0" class="input" placeholder="—" />
            </div>
          </div>
          <div class="formgrid" style="margin-top: 16px">
            <div class="field">
              <label class="label">{{ t('admin.stock') }}</label>
              <input v-model.number="form.stock" type="number" min="0" class="input" />
            </div>
            <div class="field">
              <label class="label">{{ t('common.total') }}</label>
              <input v-model.number="form.sortOrder" type="number" class="input" />
            </div>
          </div>
          <div class="field" style="margin-top: 16px">
            <label class="label">Brand</label>
            <input v-model="form.brand" class="input" />
          </div>

          <label class="toggle">
            <input v-model="form.featured" type="checkbox" class="sr-only" />
            <span class="toggle__box" />
            <span>{{ t('admin.featured') }}</span>
          </label>
          <label class="toggle">
            <input v-model="form.status" type="radio" value="active" class="sr-only" />
            <span class="toggle__radio" />
            <span>{{ t('admin.published') }}</span>
          </label>
          <label class="toggle">
            <input v-model="form.status" type="radio" value="draft" class="sr-only" />
            <span class="toggle__radio" />
            <span>{{ t('admin.draft') }}</span>
          </label>
        </section>

        <button class="btn btn--gold btn--block" :disabled="saving" @click="save">{{ saving ? t('common.loading') : t('admin.save') }}</button>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.pagehead { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 26px; flex-wrap: wrap; }
.prodgrid { display: grid; grid-template-columns: 1fr 320px; gap: 30px; align-items: start; }
.prodmain { display: flex; flex-direction: column; gap: 30px; }
.panel { border: 1px solid var(--line); background: var(--paper); border-radius: var(--radius-lg); padding: 26px 28px; }
.panel__title { font-size: 20px; margin-bottom: 20px; }
.formgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.imggrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.imgcell { position: relative; aspect-ratio: 1; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--line); }
.imgcell img { width: 100%; height: 100%; object-fit: cover; }
.imgcell__rm { position: absolute; top: 6px; right: 6px; border: 0; background: rgba(28,26,23,0.75); color: #fff; width: 20px; height: 20px; border-radius: 50%; line-height: 1; }
.imgadd { aspect-ratio: 1; border: 1px dashed var(--line-strong); background: transparent; font-size: 24px; color: var(--ink-faint); border-radius: var(--radius); }
.imgadd:hover { border-color: var(--gold); color: var(--gold); }

.toggle { display: flex; align-items: center; gap: 10px; padding: 10px 0; font-size: 14px; cursor: pointer; }
.toggle__box { width: 17px; height: 17px; border: 1px solid var(--line-strong); border-radius: 3px; display: inline-flex; align-items: center; justify-content: center; }
.toggle__radio { width: 15px; height: 15px; border: 1px solid var(--line-strong); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; }
.toggle input:checked + .toggle__box { background: var(--ink); border-color: var(--ink); }
.toggle input:checked + .toggle__radio { border-color: var(--ink); }
.toggle input:checked + .toggle__radio::after { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--ink); }
.prodside { position: sticky; top: 96px; display: flex; flex-direction: column; gap: 18px; }

@media (max-width: 900px) {
  .prodgrid { grid-template-columns: 1fr; }
  .prodside { position: static; }
}
</style>
