<script setup lang="ts">
const { t, locale} = useI18n()
const localePath = useLocalePath()
const { site } = useSite()
const { register, isAuthenticated } = useAuth()

const form = reactive({ name: '', email: '', password: '', confirm: '' })
const errors = ref<Record<string, string>>({})
const submitting = ref(false)

if (isAuthenticated.value) {
  navigateTo(localePath('/account'))
}

async function submit() {
  errors.value = {}
  if (!form.name.trim()) errors.value.name = t('validation.required')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errors.value.email = t('validation.emailInvalid')
  if (form.password.length < 8) errors.value.password = t('validation.passwordWeak')
  if (form.password !== form.confirm) errors.value.confirm = t('auth.passwordMismatch')
  if (Object.keys(errors.value).length) return

  submitting.value = true
  try {
    await register({ name: form.name, email: form.email, password: form.password })
    useToast().success(t('auth.loggedIn'))
    navigateTo(localePath('/account'))
  } catch (err: any) {
    const data = err?.data?.errors
    if (data) errors.value = data
    else useToast().error(t('errors.generic'))
  } finally {
    submitting.value = false
  }
}

useHead({ title: `${t('auth.registerTitle')} — ${site.value.name}` })
</script>

<template>
  <section class="section auth">
    <div class="container auth__inner">
      <div class="auth__aside">
        <p class="eyebrow">{{ t('auth.memberBenefits') }}</p>
        <h2 class="serif auth__asidetitle">{{ t('auth.memberBenefits') }}</h2>
        <ul class="benefits">
          <li v-for="i in 4" :key="i"><span class="benefits__dot" /><span>{{ t('auth.benefit' + i) }}</span></li>
        </ul>
        <div class="auth__quote">
          <p class="serif">“{{ site.tagline }}”</p>
          <p class="tiny upper faint">{{ site.name }}</p>
        </div>
      </div>

      <div class="auth__formwrap">
        <p class="eyebrow">{{ t('nav.register') }}</p>
        <h1 class="page-title" style="margin: 14px 0 8px">{{ t('auth.registerTitle') }}</h1>
        <p class="muted" style="margin-bottom: 34px">{{ t('auth.registerSubtitle') }}</p>

        <form @submit.prevent="submit">
          <div class="field" style="margin-bottom: 18px">
            <label class="label">{{ t('auth.name') }}</label>
            <input v-model="form.name" class="input" :class="{ 'input--error': errors.name }" autocomplete="name" />
            <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
          </div>
          <div class="field" style="margin-bottom: 18px">
            <label class="label">{{ t('auth.email') }}</label>
            <input v-model="form.email" type="email" class="input" :class="{ 'input--error': errors.email }" autocomplete="email" />
            <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
          </div>
          <div class="field" style="margin-bottom: 18px">
            <label class="label">{{ t('auth.password') }}</label>
            <input v-model="form.password" type="password" class="input" :class="{ 'input--error': errors.password }" autocomplete="new-password" />
            <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
          </div>
          <div class="field" style="margin-bottom: 24px">
            <label class="label">{{ t('auth.confirmPassword') }}</label>
            <input v-model="form.confirm" type="password" class="input" :class="{ 'input--error': errors.confirm }" autocomplete="new-password" />
            <span v-if="errors.confirm" class="field-error">{{ errors.confirm }}</span>
          </div>
          <button class="btn btn--block" type="submit" :disabled="submitting">
            {{ submitting ? t('common.loading') : t('auth.registerButton') }}
          </button>
        </form>

        <p class="auth__switch">
          {{ t('auth.haveAccount') }}
          <NuxtLink :to="localePath('/account/login')" class="link-underline">{{ t('auth.loginButton') }}</NuxtLink>
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.auth__inner { display: grid; grid-template-columns: 400px 1fr; gap: 70px; align-items: start; }
.auth__formwrap { max-width: 460px; }
.auth__switch { margin-top: 26px; font-size: 14px; color: var(--ink-muted); display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.auth__aside { border-left: 1px solid var(--line); padding-left: 46px; }
.auth__asidetitle { font-size: 26px; margin: 14px 0 26px; }
.benefits { list-style: none; padding: 0; margin: 0 0 34px; display: flex; flex-direction: column; gap: 14px; }
.benefits li { display: flex; align-items: center; gap: 12px; font-size: 15px; color: var(--ink-soft); }
.benefits__dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); flex: none; }
.auth__quote { border-top: 1px solid var(--line); padding-top: 24px; }
.auth__quote p:first-child { font-size: 20px; }

@media (max-width: 900px) {
  .auth__inner { grid-template-columns: 1fr; gap: 44px; }
  .auth__aside { border-left: 0; border-top: 1px solid var(--line); padding-left: 0; padding-top: 34px; }
}
</style>
