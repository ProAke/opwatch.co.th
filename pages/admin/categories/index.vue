<script setup lang="ts">
const { t, locale } = useI18n()

const items = ref<Record<string, any>[]>([])
const showForm = ref(false)
const saving = ref(false)
const form = reactive({ name: '', nameEn: '', nameTh: '', slug: '', description: '', image: '', sortOrder: 0 })

async function load() {
  const res = await $fetch<{ items: Record<string, any>[] }>('/api/admin/categories')
  items.value = res.items
}
onMounted(load)

function openNew() {
  Object.assign(form, { name: '', nameEn: '', nameTh: '', slug: '', description: '', image: '', sortOrder: 0 })
  showForm.value = true
}

async function save() {
  if (!form.name.trim()) return
  saving.value = true
  try {
    await $fetch('/api/admin/categories', { method: 'POST', body: { ...form } })
    showForm.value = false
    useToast().success(t('admin.updated'))
    await load()
  } finally {
    saving.value = false
  }
}

async function remove(c: Record<string, any>) {
  if (!confirm(t('admin.deleteConfirm'))) return
  await $fetch(`/api/admin/categories/${c.id}`, { method: 'DELETE' })
  items.value = items.value.filter((i) => i.id !== c.id)
  useToast().success(t('admin.updated'))
}

useHead({ title: `${t('admin.categories')} — ${useSite().site.value.name}` })
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>

<template>
  <div>
    <div class="pagehead">
      <h1 class="page-title" style="font-size: 2rem">{{ t('admin.categories') }}</h1>
      <button class="btn btn--sm btn--gold" @click="openNew">{{ t('admin.newCategory') }}</button>
    </div>

    <div v-if="showForm" class="panel formpanel">
      <h2 class="serif panel__title">{{ t('admin.newCategory') }}</h2>
      <div class="formgrid">
        <div class="field">
          <label class="label">Name</label>
          <input v-model="form.name" class="input" />
        </div>
        <div class="field">
          <label class="label">Name (EN)</label>
          <input v-model="form.nameEn" class="input" />
        </div>
        <div class="field">
          <label class="label">ชื่อ (TH)</label>
          <input v-model="form.nameTh" class="input" />
        </div>
        <div class="field">
          <label class="label">Slug</label>
          <input v-model="form.slug" class="input" placeholder="auto" />
        </div>
        <div class="field">
          <label class="label">Image URL</label>
          <input v-model="form.image" class="input" placeholder="/images/c-men.jpg" />
        </div>
        <div class="field">
          <label class="label">Sort</label>
          <input v-model.number="form.sortOrder" type="number" class="input" />
        </div>
      </div>
      <div class="field" style="margin-top: 16px">
        <label class="label">{{ t('products.description') }}</label>
        <textarea v-model="form.description" class="textarea" style="min-height: 70px" />
      </div>
      <div class="row gap-8" style="margin-top: 18px">
        <button class="btn btn--sm btn--gold" :disabled="saving" @click="save">{{ t('admin.save') }}</button>
        <button class="btn btn--sm btn--ghost" @click="showForm = false">{{ t('common.cancel') }}</button>
      </div>
    </div>

    <div class="panel" style="padding: 0; overflow: hidden; margin-top: 24px">
      <div v-if="!items.length" class="muted panel-pad">{{ t('admin.noProducts') }}</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th style="width: 60px"><img v-if="items[0]?.image" :src="items[0].image" alt="" /></th>
            <th>{{ t('admin.name') }}</th>
            <th>Slug</th>
            <th>{{ t('admin.products') }}</th>
            <th>{{ t('admin.status') }}</th>
            <th style="text-align:right">{{ t('admin.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in items" :key="c.id">
            <td><div class="catimg"><img :src="c.image || '/images/hero-watch.jpg'" alt="" loading="lazy" /></div></td>
            <td>
              <div>{{ locale === 'en' ? c.nameEn : c.nameTh }}</div>
              <div class="tiny upper faint">{{ c.description }}</div>
            </td>
            <td class="small faint">{{ c.slug }}</td>
            <td><span class="badge">{{ c.productsCount }}</span></td>
            <td><span class="badge">{{ c.sortOrder }}</span></td>
            <td style="text-align: right">
              <button class="btn btn--sm btn--ghost danger" @click="remove(c)">{{ t('common.delete') }}</button>
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
.catimg { width: 44px; height: 44px; border-radius: var(--radius); overflow: hidden; background: var(--sand); }
.catimg img { width: 100%; height: 100%; object-fit: cover; }
th img { width: 40px; height: 40px; object-fit: cover; border-radius: var(--radius); }
.danger:hover { color: var(--danger) !important; border-color: var(--danger) !important; }
@media (max-width: 620px) { .formgrid { grid-template-columns: 1fr; } }
</style>
