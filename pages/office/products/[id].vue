<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { site } = useSite()

const id = computed(() => String(route.params.id))
const isNew = computed(() => id.value === 'new')

const categories = ref<Record<string, any>[]>([])
const brands = ref<Record<string, any>[]>([])

onMounted(async () => {
  const [catRes, brandRes] = await Promise.all([
    $fetch<{ items: Record<string, any>[] }>('/api/admin/categories').catch(() => ({ items: [] })),
    $fetch<{ items: Record<string, any>[] }>('/api/admin/brands').catch(() => ({ items: [] }))
  ])
  categories.value = catRes.items || []
  brands.value = brandRes.items || []
})

const form = reactive({
  name: '',
  nameEn: '',
  nameTh: '',
  sku: '',
  slug: '',
  categoryId: '' as string | number,
  brandId: '' as string | number,
  brand: 'Opwatch',
  price: 0,
  originalPrice: null as number | null,
  priceCompare: null as number | null,
  currency: 'THB',
  images: ['/images/p1.jpg', '/images/hero-watch.jpg'] as string[],
  shortDescription: '',
  description: '',
  descriptionEn: '',
  descriptionTh: '',
  stock: 10,
  status: 'active' as 'active' | 'draft',
  badgesText: '',
  featured: false,
  sortOrder: 0,
  specsText: 'Movement: Automatic\nCase: 40mm Stainless Steel\nCrystal: Sapphire\nWater resistance: 100m\nStrap: Leather'
})

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

const reqFetch = useRequestFetch()
const { data } = await useAsyncData(
  () => `office-product-${id.value}`,
  () => (isNew.value ? Promise.resolve({ product: null }) : reqFetch<{ product: Record<string, any> }>(`/api/admin/products/${id.value}`)),
  { default: () => ({ product: null }) }
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
    brandId: p.brandId ? String(p.brandId) : '',
    brand: p.brand || 'Opwatch',
    price: Number(p.price || 0),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : p.priceCompare != null ? Number(p.priceCompare) : null,
    priceCompare: p.priceCompare != null ? Number(p.priceCompare) : null,
    currency: p.currency || 'THB',
    images: Array.isArray(p.images) && p.images.length ? [...p.images] : ['/images/hero-watch.jpg'],
    shortDescription: p.shortDescription || '',
    description: p.description || '',
    descriptionEn: p.descriptionEn || '',
    descriptionTh: p.descriptionTh || '',
    stock: Number(p.stock || 0),
    status: p.status || 'active',
    badgesText: Array.isArray(p.badges) ? p.badges.join(', ') : '',
    featured: !!p.featured,
    sortOrder: Number(p.sortOrder || 0),
    specsText: Object.entries(p.specs || {}).map(([k, v]) => `${k}: ${v}`).join('\n')
  })
}

function onBrandSelect() {
  const found = brands.value.find((b) => String(b.id) === String(form.brandId))
  if (found) form.brand = found.name
}

function addImage() {
  if (form.images.length >= 6) return
  form.images.push('/images/p2.jpg')
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
    const badges = form.badgesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const payload: Record<string, any> = {
      ...form,
      categoryId: form.categoryId === '' ? null : Number(form.categoryId),
      brandId: form.brandId === '' ? null : Number(form.brandId),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      priceCompare: form.originalPrice ? Number(form.originalPrice) : null,
      badges,
      specs: parseSpecs(form.specsText),
      images: form.images.map((s) => s.trim()).filter(Boolean)
    }
    if (isNew.value) {
      await $fetch('/api/admin/products', { method: 'POST', body: payload })
      useToast().success(t('admin.updated'))
      navigateTo(localePath('/office/products'))
    } else {
      await $fetch(`/api/admin/products/${id.value}`, { method: 'PUT', body: payload })
      useToast().success(t('admin.updated'))
    }
  } catch (err: any) {
    const d = err?.data?.errors
    if (d) errors.value = d
    else useToast().error(err?.data?.statusMessage || t('errors.generic'))
  } finally {
    saving.value = false
  }
}

useHead({ title: `${isNew.value ? t('admin.newProduct') : t('common.edit')} — ${site.value.name}` })
definePageMeta({ layout: 'office', middleware: 'office' })
</script>

<template>
  <div>
    <div class="pagehead">
      <div>
        <NuxtLink :to="localePath('/office/products')" class="link-underline" style="margin-bottom: 12px">{{ t('common.back') }} ←</NuxtLink>
        <h1 class="page-title" style="font-size: 2rem">{{ isNew ? t('admin.newProduct') : t('common.edit') }}</h1>
      </div>
      <div class="row gap-8">
        <NuxtLink :to="localePath('/office/products')" class="btn btn--sm btn--ghost">{{ t('common.cancel') }}</NuxtLink>
        <button class="btn btn--sm btn--gold" :disabled="saving" @click="save">{{ saving ? t('common.loading') : t('admin.save') }}</button>
      </div>
    </div>

    <div class="prodgrid">
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
            <label class="label">Short Summary</label>
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
          <div class="between" style="margin-bottom: 16px">
            <h2 class="serif panel__title" style="margin-bottom: 0">{{ t('admin.image') }}</h2>
            <button type="button" class="btn btn--sm btn--ghost" @click="addImage">+ {{ t('admin.add') }}</button>
          </div>
          <div class="imglist">
            <div v-for="(img, i) in form.images" :key="i" class="imgrow">
              <div class="imgcell">
                <img :src="img" alt="" />
              </div>
              <input v-model="form.images[i]" class="input" placeholder="/images/p1.jpg or https://..." />
              <button type="button" class="btn btn--sm btn--ghost danger" @click="removeImage(i)">×</button>
            </div>
          </div>
        </section>
      </div>

      <aside class="prodside">
        <section class="panel">
          <h2 class="serif panel__title">{{ t('admin.settings') }}</h2>

          <div class="field" style="margin-bottom: 16px">
            <label class="label">{{ t('products.brand') }}</label>
            <select v-model="form.brandId" class="select" @change="onBrandSelect">
              <option value="">{{ form.brand || 'Opwatch' }}</option>
              <option v-for="b in brands" :key="b.id" :value="String(b.id)">{{ b.name }} ({{ b.movement }})</option>
            </select>
          </div>

          <div class="field" style="margin-bottom: 16px">
            <label class="label">{{ t('products.category') }}</label>
            <select v-model="form.categoryId" class="select">
              <option value="">{{ t('common.none') }}</option>
              <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ locale === 'en' ? c.nameEn || c.name : c.nameTh || c.name }}</option>
            </select>
          </div>

          <div class="formgrid">
            <div class="field">
              <label class="label">{{ t('admin.price') }}</label>
              <input v-model.number="form.price" type="number" min="0" class="input" />
            </div>
            <div class="field">
              <label class="label">Original Price</label>
              <input v-model.number="form.originalPrice" type="number" min="0" class="input" placeholder="—" />
            </div>
          </div>

          <div class="formgrid" style="margin-top: 16px">
            <div class="field">
              <label class="label">{{ t('admin.stock') }}</label>
              <input v-model.number="form.stock" type="number" min="0" class="input" />
            </div>
            <div class="field">
              <label class="label">Sort Order</label>
              <input v-model.number="form.sortOrder" type="number" class="input" />
            </div>
          </div>

          <div class="field" style="margin-top: 16px">
            <label class="label">Badges (NEW, SALE, LIMITED)</label>
            <input v-model="form.badgesText" class="input" placeholder="NEW, SALE" />
          </div>

          <div style="margin-top: 14px">
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
          </div>
        </section>

        <button class="btn btn--gold btn--block" :disabled="saving" @click="save">{{ saving ? t('common.loading') : t('admin.save') }}</button>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.pagehead { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 26px; flex-wrap: wrap; }
.prodgrid { display: grid; grid-template-columns: 1fr 330px; gap: 30px; align-items: start; }
.prodmain { display: flex; flex-direction: column; gap: 28px; }
.panel { border: 1px solid var(--line); background: var(--paper); border-radius: var(--radius-lg); padding: 26px 28px; }
.panel__title { font-size: 20px; margin-bottom: 20px; }
.formgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.imglist { display: flex; flex-direction: column; gap: 10px; }
.imgrow { display: grid; grid-template-columns: 52px 1fr auto; gap: 12px; align-items: center; }
.imgcell { width: 52px; height: 52px; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--line); background: var(--sand); }
.imgcell img { width: 100%; height: 100%; object-fit: cover; }
.danger:hover { color: var(--danger) !important; border-color: var(--danger) !important; }

.toggle { display: flex; align-items: center; gap: 10px; padding: 8px 0; font-size: 14px; cursor: pointer; }
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
