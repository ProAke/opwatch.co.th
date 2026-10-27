<script setup lang="ts">
const { t, locale } = useI18n()
const { site } = useSite()

const form = reactive({
  name: '',
  tagline: '',
  email: '',
  phone: '',
  currency: '',
  currencySymbol: '',
  defaultLocale: 'th',
  announcement: '',
  shippingFee: 0,
  freeShippingThreshold: 0,
  adminEmail: '',
  adminPassword: ''
})

const saved = ref(false)
const saving = ref(false)

const { data } = await useFetch<{
  site: Record<string, any>
  admin: { email: string }
  db: Record<string, any>
  installedAt: string
}>('/api/admin/settings')

onMounted(() => {
  const s = data.value?.site || {}
  Object.assign(form, {
    name: s.name || '',
    tagline: s.tagline || '',
    email: s.email || '',
    phone: s.phone || '',
    currency: s.currency || '',
    currencySymbol: s.currencySymbol || '',
    defaultLocale: s.defaultLocale || 'th',
    announcement: s.announcement || '',
    shippingFee: Number(s.shippingFee || 0),
    freeShippingThreshold: Number(s.freeShippingThreshold || 0),
    adminEmail: data.value?.admin?.email || '',
    adminPassword: ''
  })
})

async function save() {
  saving.value = true
  try {
    await $fetch('/api/admin/settings', {
      method: 'PUT',
      body: {
        site: { ...form, defaultLocale: form.defaultLocale },
        admin: form.adminPassword ? { password: form.adminPassword } : undefined
      }
    })
    await site.load(true)
    await useAuth().refresh()
    form.adminPassword = ''
    saved.value = true
    setTimeout(() => (saved.value = false), 2500)
  } finally {
    saving.value = false
  }
}

useHead({ title: `${t('admin.settings')} — ${useSite().site.value.name}` })
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>

<template>
  <div>
    <div class="pagehead">
      <h1 class="page-title" style="font-size: 2rem">{{ t('admin.siteSettings') }}</h1>
    </div>

    <div class="panel">
      <h2 class="serif panel__title">{{ t('admin.siteSettings') }}</h2>
      <div class="formgrid">
        <div class="field">
          <label class="label">{{ t('admin.siteName') }}</label>
          <input v-model="form.name" class="input" />
        </div>
        <div class="field">
          <label class="label">{{ t('admin.tagline') }}</label>
          <input v-model="form.tagline" class="input" />
        </div>
        <div class="field">
          <label class="label">{{ t('admin.contactEmail') }}</label>
          <input v-model="form.email" type="email" class="input" />
        </div>
        <div class="field">
          <label class="label">{{ t('admin.contactPhone') }}</label>
          <input v-model="form.phone" class="input" />
        </div>
        <div class="field">
          <label class="label">{{ t('admin.currency') }}</label>
          <input v-model="form.currency" class="input" />
        </div>
        <div class="field">
          <label class="label">{{ t('admin.currencySymbol') }}</label>
          <input v-model="form.currencySymbol" class="input" />
        </div>
        <div class="field">
          <label class="label">{{ t('admin.defaultLocale') }}</label>
          <select v-model="form.defaultLocale" class="select">
            <option value="th">ภาษาไทย</option>
            <option value="en">English</option>
          </select>
        </div>
        <div class="field">
          <label class="label">{{ t('admin.shippingFee') }}</label>
          <input v-model.number="form.shippingFee" type="number" min="0" class="input" />
        </div>
        <div class="field">
          <label class="label">{{ t('admin.freeShippingThreshold') }}</label>
          <input v-model.number="form.freeShippingThreshold" type="number" min="0" class="input" />
        </div>
      </div>

      <div class="field" style="margin-top: 18px">
        <label class="label">{{ t('admin.announcement') }}</label>
        <textarea v-model="form.announcement" class="textarea" style="min-height: 60px" />
      </div>

      <div class="divider" />

      <h2 class="serif panel__title">{{ t('install.admin') }}</h2>
      <div class="field" style="max-width: 380px">
        <label class="label">{{ t('install.adminEmail') }}</label>
        <input :value="form.adminEmail" class="input" disabled />
      </div>
      <div class="field" style="max-width: 380px; margin-top: 16px">
        <label class="label">{{ t('install.adminPassword') }}</label>
        <input v-model="form.adminPassword" type="password" class="input" :placeholder="t('admin.required')" />
      </div>

      <div class="row gap-8" style="margin-top: 26px">
        <button class="btn btn--sm btn--gold" :disabled="saving" @click="save">{{ saving ? t('common.loading') : t('admin.saveSettings') }}</button>
        <span v-if="saved" class="small" style="color: var(--success)">{{ t('admin.settingsSaved') }}</span>
      </div>

      <div class="divider" />
      <p class="tiny upper faint">
        {{ t('install.dbDriver') }}: {{ data?.db?.driver }} · {{ data?.db?.host }}:{{ data?.db?.port }} / {{ data?.db?.database }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.pagehead { margin-bottom: 26px; }
.panel { border: 1px solid var(--line); background: var(--paper); border-radius: var(--radius-lg); padding: 30px 32px; }
.panel__title { font-size: 20px; margin-bottom: 22px; }
.formgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 620px) { .formgrid { grid-template-columns: 1fr; } }
</style>
