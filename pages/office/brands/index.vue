<script setup lang="ts">
const { t, locale } = useI18n()
const { site } = useSite()

const items = ref<Record<string, any>[]>([])
const showForm = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)

const form = reactive({
  name: '',
  nameEn: '',
  nameTh: '',
  slug: '',
  country: 'สวิตเซอร์แลนด์',
  countryEn: 'Switzerland',
  movement: 'เครื่องสวิส',
  movementEn: 'Swiss movement',
  positioning: 'mid',
  tagline: '',
  taglineEn: '',
  story: '',
  storyEn: '',
  accentColor: '#b08d57',
  heroImage: '/images/hero-watch.jpg',
  sortOrder: 1,
  active: true
})

async function load() {
  const res = await $fetch<{ items: Record<string, any>[] }>('/api/admin/brands').catch(() => ({ items: [] }))
  items.value = res.items || []
}
onMounted(load)

function openNew() {
  editingId.value = null
  Object.assign(form, {
    name: '',
    nameEn: '',
    nameTh: '',
    slug: '',
    country: 'สวิตเซอร์แลนด์',
    countryEn: 'Switzerland',
    movement: 'เครื่องสวิส',
    movementEn: 'Swiss movement',
    positioning: 'mid',
    tagline: '',
    taglineEn: '',
    story: '',
    storyEn: '',
    accentColor: '#b08d57',
    heroImage: '/images/hero-watch.jpg',
    sortOrder: items.value.length + 1,
    active: true
  })
  showForm.value = true
}

function openEdit(b: Record<string, any>) {
  editingId.value = Number(b.id)
  Object.assign(form, {
    name: b.name || '',
    nameEn: b.nameEn || b.name || '',
    nameTh: b.nameTh || b.name || '',
    slug: b.slug || '',
    country: b.country || '',
    countryEn: b.countryEn || '',
    movement: b.movement || '',
    movementEn: b.movementEn || '',
    positioning: b.positioning || 'mid',
    tagline: b.tagline || '',
    taglineEn: b.taglineEn || '',
    story: b.story || '',
    storyEn: b.storyEn || '',
    accentColor: b.accentColor || '#b08d57',
    heroImage: b.heroImage || '/images/hero-watch.jpg',
    sortOrder: Number(b.sortOrder || 1),
    active: b.active !== false
  })
  showForm.value = true
}

async function save() {
  if (!form.name.trim()) return
  saving.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/brands/${editingId.value}`, { method: 'PUT', body: { ...form } })
    } else {
      await $fetch('/api/admin/brands', { method: 'POST', body: { ...form } })
    }
    showForm.value = false
    useToast().success(t('admin.updated'))
    await load()
  } catch (err: any) {
    useToast().error(err?.data?.statusMessage || t('errors.generic'))
  } finally {
    saving.value = false
  }
}

async function remove(b: Record<string, any>) {
  if (!confirm(t('admin.deleteConfirm'))) return
  await $fetch(`/api/admin/brands/${b.id}`, { method: 'DELETE' })
  items.value = items.value.filter((i) => i.id !== b.id)
  useToast().success(t('admin.updated'))
}

useHead({ title: `${t('admin.brands')} — ${site.value.name}` })
definePageMeta({ layout: 'office', middleware: 'office' })
</script>

<template>
  <div>
    <div class="pagehead">
      <h1 class="page-title" style="font-size: 2rem">{{ t('admin.brands') }}</h1>
      <button class="btn btn--sm btn--gold" @click="openNew">+ {{ t('admin.add') }} {{ t('admin.brands') }}</button>
    </div>

    <div v-if="showForm" class="panel formpanel">
      <h2 class="serif panel__title">{{ editingId ? t('common.edit') : t('admin.add') }} {{ t('admin.brands') }}</h2>
      <div class="formgrid">
        <div class="field">
          <label class="label">Brand Name</label>
          <input v-model="form.name" class="input" />
        </div>
        <div class="field">
          <label class="label">Slug</label>
          <input v-model="form.slug" class="input" placeholder="olympianus" />
        </div>
        <div class="field">
          <label class="label">Movement (TH)</label>
          <input v-model="form.movement" class="input" />
        </div>
        <div class="field">
          <label class="label">Movement (EN)</label>
          <input v-model="form.movementEn" class="input" />
        </div>
        <div class="field">
          <label class="label">Origin (TH)</label>
          <input v-model="form.country" class="input" />
        </div>
        <div class="field">
          <label class="label">Origin (EN)</label>
          <input v-model="form.countryEn" class="input" />
        </div>
        <div class="field">
          <label class="label">Tagline (TH)</label>
          <input v-model="form.tagline" class="input" />
        </div>
        <div class="field">
          <label class="label">Tagline (EN)</label>
          <input v-model="form.taglineEn" class="input" />
        </div>
        <div class="field">
          <label class="label">Hero Image</label>
          <input v-model="form.heroImage" class="input" />
        </div>
        <div class="field">
          <label class="label">Tier</label>
          <select v-model="form.positioning" class="select">
            <option value="entry">Entry / Everyday</option>
            <option value="mid">Mid-Luxury / Swiss</option>
            <option value="premium">Haute Horlogerie / Premium</option>
          </select>
        </div>
      </div>
      <div class="field" style="margin-top: 16px">
        <label class="label">Brand Story (TH)</label>
        <textarea v-model="form.story" class="textarea" style="min-height: 70px" />
      </div>
      <div class="field" style="margin-top: 12px">
        <label class="label">Brand Story (EN)</label>
        <textarea v-model="form.storyEn" class="textarea" style="min-height: 70px" />
      </div>
      <div class="row gap-8" style="margin-top: 18px">
        <button class="btn btn--sm btn--gold" :disabled="saving" @click="save">{{ t('admin.save') }}</button>
        <button class="btn btn--sm btn--ghost" @click="showForm = false">{{ t('common.cancel') }}</button>
      </div>
    </div>

    <div class="panel" style="padding: 0; overflow: hidden">
      <div v-if="!items.length" class="muted panel-pad">{{ t('admin.noResults') }}</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>{{ t('products.brand') }}</th>
            <th>Slug</th>
            <th>{{ t('products.movement') }}</th>
            <th>{{ t('admin.products') }}</th>
            <th style="text-align:right">{{ t('admin.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in items" :key="b.id">
            <td>
              <div class="row gap-12">
                <div class="bimg"><img :src="b.heroImage || '/images/hero-watch.jpg'" alt="" loading="lazy" /></div>
                <div>
                  <div class="serif" style="font-size: 17px">{{ b.name }}</div>
                  <div class="tiny upper faint">{{ locale === 'en' ? b.taglineEn || b.tagline : b.tagline }}</div>
                </div>
              </div>
            </td>
            <td class="small faint">{{ b.slug }}</td>
            <td class="small">{{ locale === 'en' ? b.movementEn || b.movement : b.movement }}</td>
            <td><span class="badge">{{ b.productCount ?? 0 }}</span></td>
            <td style="text-align: right">
              <div class="row gap-8" style="justify-content: flex-end">
                <button class="btn btn--sm btn--ghost" @click="openEdit(b)">{{ t('common.edit') }}</button>
                <button class="btn btn--sm btn--ghost danger" @click="remove(b)">{{ t('common.delete') }}</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.pagehead { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.panel { border: 1px solid var(--line); background: var(--paper); border-radius: var(--radius-lg); }
.formpanel { padding: 26px 28px; margin-bottom: 26px; }
.panel__title { font-size: 20px; margin-bottom: 20px; }
.panel-pad { padding: 26px 28px; }
.formgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.bimg { width: 44px; height: 44px; border-radius: var(--radius); overflow: hidden; background: var(--sand); flex: none; }
.bimg img { width: 100%; height: 100%; object-fit: cover; }
.danger:hover { color: var(--danger) !important; border-color: var(--danger) !important; }
@media (max-width: 620px) { .formgrid { grid-template-columns: 1fr; } }
</style>
