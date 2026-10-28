<script setup lang="ts">
const { t} = useI18n()
const localePath = useLocalePath()
const { site } = useSite()
const { login, isAuthenticated, isAdmin } = useAuth()

const form = reactive({ email: '', password: '' })
const errors = ref<Record<string, string>>({})
const submitting = ref(false)

if (isAuthenticated.value && isAdmin.value) {
  navigateTo('/admin')
}

async function submit() {
  errors.value = {}
  if (!form.email.trim()) errors.value.email = t('validation.required')
  if (!form.password) errors.value.password = t('validation.required')
  if (Object.keys(errors.value).length) return

  submitting.value = true
  try {
    const customer = await login(form.email, form.password)
    if (!customer.isAdmin) {
      useToast().error(t('admin.notAllowed'))
      await logout()
      return
    }
    navigateTo('/admin')
  } catch (err: any) {
    const data = err?.data?.errors
    if (data) errors.value = data
    else useToast().error(t('auth.invalidCredentials'))
  } finally {
    submitting.value = false
  }
}

const { logout } = useAuth()

useHead({ title: `${t('admin.title')} — ${site.value.name}` })
definePageMeta({ layout: false })
</script>

<template>
  <div class="adminlogin">
    <div class="adminlogin__inner">
      <div class="brandrow">
        <span class="brandmark">OP</span>
        <div>
          <p class="serif adminlogin__title">Opwatch</p>
          <p class="tiny upper faint">{{ t('admin.dashboard') }}</p>
        </div>
      </div>

      <h1 class="page-title" style="font-size: 2rem">{{ t('admin.pleaseLogin') }}</h1>
      <p class="muted" style="margin: 10px 0 30px">{{ t('auth.loginSubtitle') }}</p>

      <form @submit.prevent="submit">
        <div class="field" style="margin-bottom: 18px">
          <label class="label">{{ t('auth.email') }}</label>
          <input v-model="form.email" type="email" class="input" :class="{ 'input--error': errors.email }" autocomplete="username" />
          <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
        </div>
        <div class="field" style="margin-bottom: 24px">
          <label class="label">{{ t('auth.password') }}</label>
          <input v-model="form.password" type="password" class="input" :class="{ 'input--error': errors.password }" autocomplete="current-password" />
          <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
        </div>
        <button class="btn btn--gold btn--block" type="submit" :disabled="submitting">
          {{ submitting ? t('common.loading') : t('admin.dashboard') }}
        </button>
      </form>

      <NuxtLink :to="localePath('/')" class="link-underline" style="margin-top: 24px">{{ t('admin.backToSite') }}</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.adminlogin { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--ink); padding: 40px 24px; }
.adminlogin__inner { width: 100%; max-width: 400px; background: var(--paper); border-radius: var(--radius-lg); padding: 44px 40px; border: 1px solid rgba(255,255,255,0.08); }
.brandrow { display: flex; align-items: center; gap: 12px; margin-bottom: 34px; }
.brandmark { font-family: var(--font-display); font-size: 18px; font-weight: 600; color: var(--gold); border: 1px solid var(--gold); border-radius: 50%; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; }
.adminlogin__title { font-size: 24px; font-weight: 600; letter-spacing: 0.08em; }
</style>
