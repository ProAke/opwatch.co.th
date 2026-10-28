<script setup lang="ts">
const { t, locale} = useI18n()
const localePath = useLocalePath()
const { site } = useSite()
const { login, isAuthenticated } = useAuth()

const form = reactive({ email: '', password: '' })
const errors = ref<Record<string, string>>({})
const submitting = ref(false)

const localeTag = computed(() => (locale.value === 'en' ? 'en-US' : 'th-TH'))

if (isAuthenticated.value) {
  navigateTo(localePath('/account'))
}

async function submit() {
  errors.value = {}
  if (!form.email.trim()) errors.value.email = t('validation.required')
  if (!form.password) errors.value.password = t('validation.required')
  if (Object.keys(errors.value).length) return

  submitting.value = true
  try {
    await login(form.email, form.password)
    useToast().success(t('auth.loggedIn'))
    navigateTo(localePath('/account'))
  } catch (err: any) {
    const data = err?.data?.errors
    if (data) errors.value = data
    else useToast().error(t('auth.invalidCredentials'))
  } finally {
    submitting.value = false
  }
}

useHead({ title: `${t('auth.loginTitle')} — ${site.value.name}` })
</script>

<template>
  <section class="section auth">
    <div class="container auth__inner">
      <div class="auth__formwrap">
        <p class="eyebrow">{{ t('nav.login') }}</p>
        <h1 class="page-title" style="margin: 14px 0 8px">{{ t('auth.loginTitle') }}</h1>
        <p class="muted" style="margin-bottom: 34px">{{ t('auth.loginSubtitle') }}</p>

        <form @submit.prevent="submit">
          <div class="field" style="margin-bottom: 18px">
            <label class="label">{{ t('auth.email') }}</label>
            <input v-model="form.email" type="email" class="input" :class="{ 'input--error': errors.email }" autocomplete="email" />
            <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
          </div>
          <div class="field" style="margin-bottom: 24px">
            <label class="label">{{ t('auth.password') }}</label>
            <input v-model="form.password" type="password" class="input" :class="{ 'input--error': errors.password }" autocomplete="current-password" />
            <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
          </div>
          <button class="btn btn--block" type="submit" :disabled="submitting">
            {{ submitting ? t('common.loading') : t('auth.loginButton') }}
          </button>
        </form>

        <p class="auth__switch">
          {{ t('auth.noAccount') }}
          <NuxtLink :to="localePath('/account/register')" class="link-underline">{{ t('auth.createAccount') }}</NuxtLink>
        </p>
        <p class="auth__switch auth__admin">
          <NuxtLink to="/admin" class="link-underline">{{ t('nav.admin') }}</NuxtLink>
        </p>
      </div>

      <aside class="auth__aside">
        <p class="eyebrow">{{ t('auth.memberBenefits') }}</p>
        <h2 class="serif auth__asidetitle">{{ t('auth.memberBenefits') }}</h2>
        <ul class="benefits">
          <li v-for="i in 4" :key="i">
            <span class="benefits__dot" />
            <span>{{ t('auth.benefit' + i) }}</span>
          </li>
        </ul>
        <div class="auth__quote">
          <p class="serif">“{{ site.tagline }}”</p>
          <p class="tiny upper faint">{{ site.name }}</p>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.auth__inner { display: grid; grid-template-columns: 1fr 400px; gap: 70px; align-items: start; }
.auth__formwrap { max-width: 460px; }
.auth__switch { margin-top: 26px; font-size: 14px; color: var(--ink-muted); display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.auth__admin { margin-top: 6px; }

.auth__aside { border-left: 1px solid var(--line); padding-left: 46px; }
.auth__asidetitle { font-size: 26px; margin: 14px 0 26px; }
.benefits { list-style: none; padding: 0; margin: 0 0 34px; display: flex; flex-direction: column; gap: 14px; }
.benefits li { display: flex; align-items: center; gap: 12px; font-size: 15px; color: var(--ink-soft); }
.benefits__dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); flex: none; }
.auth__quote { border-top: 1px solid var(--line); padding-top: 24px; }
.auth__quote p:first-child { font-size: 20px; color: var(--ink); }

@media (max-width: 900px) {
  .auth__inner { grid-template-columns: 1fr; gap: 44px; }
  .auth__aside { border-left: 0; border-top: 1px solid var(--line); padding-left: 0; padding-top: 34px; }
}
</style>
