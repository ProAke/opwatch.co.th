<script setup lang="ts">
const { t, locale} = useI18n()
const localePath = useLocalePath()
const installed = ref(false)
const installedName = ref('')
const installing = ref(false)
const errors = ref<Record<string, string>>({})
const step = ref(1)
const dbTest = ref<{ state: 'idle' | 'testing' | 'ok' | 'fail'; message: string }>({ state: 'idle', message: '' })

const form = reactive({
  siteName: 'Opwatch',
  tagline: '',
  email: 'hello@opwatch.co.th',
  phone: '+66 2 000 0000',
  currency: 'THB',
  currencySymbol: '฿',
  defaultLocale: 'th',
  adminEmail: 'admin@opwatch.co.th',
  adminPassword: '',
  adminPasswordConfirm: '',
  dbDriver: 'json' as 'json' | 'mysql',
  dbHost: '127.0.0.1',
  dbPort: '3306',
  dbUser: 'root',
  dbPassword: '',
  dbName: 'opwatch'
})

const currencyOptions = [
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
]

const steps = computed(() => [
  { n: 1, key: 'site', label: t('install.site') },
  { n: 2, key: 'admin', label: t('install.admin') },
  { n: 3, key: 'database', label: t('install.database') }
])

// Detect an existing installation on load.
onMounted(async () => {
  try {
    const res = await $fetch<{ installed: boolean; siteName?: string }>('/api/install/status')
    installed.value = res.installed
    installedName.value = res.siteName || ''
  } catch { /* not ready */ }
})

function selectCurrency(code: string) {
  const found = currencyOptions.find((c) => c.code === code)
  if (found) form.currencySymbol = found.symbol
}

async function testDb() {
  dbTest.value = { state: 'testing', message: '' }
  try {
    const res = await $fetch<{ ok: boolean; message: string }>('/api/install/test-db', {
      method: 'POST',
      body: {
        driver: form.dbDriver,
        host: form.dbHost,
        port: form.dbPort,
        user: form.dbUser,
        password: form.dbPassword,
        database: form.dbName
      }
    })
    dbTest.value = { state: res.ok ? 'ok' : 'fail', message: res.message }
  } catch (err: any) {
    dbTest.value = { state: 'fail', message: err?.data?.statusMessage || t('install.dbTestFail') }
  }
}

function validateStep(n: number): boolean {
  errors.value = {}
  if (n === 1) {
    if (!form.siteName.trim()) errors.value.siteName = t('admin.required')
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errors.value.email = t('validation.emailInvalid')
  }
  if (n === 2) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.adminEmail)) errors.value.adminEmail = t('validation.emailInvalid')
    if (form.adminPassword.length < 6) errors.value.adminPassword = t('validation.passwordWeak')
    if (form.adminPassword !== form.adminPasswordConfirm) errors.value.adminPasswordConfirm = t('auth.passwordMismatch')
  }
  if (n === 3 && form.dbDriver === 'mysql') {
    if (!form.dbUser.trim()) errors.value.dbUser = t('admin.required')
    if (!form.dbName.trim()) errors.value.dbName = t('admin.required')
    if (!/^[A-Za-z0-9_]+$/.test(form.dbName)) errors.value.dbName = t('install.dbNameInvalid')
  }
  return !Object.keys(errors.value).length
}

async function install() {
  if (!validateStep(3)) {
    step.value = 2
    return
  }
  installing.value = true
  errors.value = {}
  try {
    const res = await $fetch('/api/install', {
      method: 'POST',
      body: {
        site: {
          name: form.siteName,
          tagline: form.tagline,
          email: form.email,
          phone: form.phone,
          currency: form.currency,
          currencySymbol: form.currencySymbol,
          defaultLocale: form.defaultLocale,
          shippingFee: 50,
          freeShippingThreshold: 5000
        },
        admin: { email: form.adminEmail, password: form.adminPassword },
        db: {
          driver: form.dbDriver,
          host: form.dbHost,
          port: form.dbPort,
          user: form.dbUser,
          password: form.dbPassword,
          database: form.dbName
        }
      }
    })
    installed.value = true
    installedName.value = res.site?.name || form.siteName
  } catch (err: any) {
    const data = err?.data?.errors as Record<string, string> | undefined
    if (data) errors.value = { ...errors.value, ...data }
    useToast().error(err?.data?.statusMessage || t('errors.generic'))
  } finally {
    installing.value = false
  }
}

async function reinstall() {
  await $fetch('/api/install/reset', { method: 'POST' })
  installed.value = false
  useToast().info(t('install.reinstall'))
}

useHead({ title: t('install.title') })
definePageMeta({ layout: false })
</script>

<template>
  <div class="inst">
    <!-- Brand panel -->
    <div class="inst__brand">
      <div class="inst__brandinner">
        <div class="brandrow">
          <span class="brandmark">OP</span>
          <span class="brandword">Opwatch</span>
        </div>
        <h1 class="inst__headline">Time,<br />beautifully kept.</h1>
        <p class="inst__lede">Configure your store in a few steps. The catalogue and administrator are seeded automatically.</p>
        <ul class="inst__points">
          <li>English &amp; Thai storefront</li>
          <li>Shopping cart, members &amp; orders</li>
          <li>Admin panel with product &amp; order management</li>
          <li>MariaDB / MySQL or JSON for development</li>
        </ul>
        <p class="inst__foot tiny upper">Opwatch — designed and crafted with care in Thailand</p>
      </div>
    </div>

    <!-- Form panel -->
    <div class="inst__panel">
      <!-- Already installed -->
      <div v-if="installed" class="done">
        <div class="done__icon">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m5 13 4 4L19 7" /></svg>
        </div>
        <h1 class="page-title" style="text-align: center; margin: 16px 0 10px">{{ t('install.done') }}</h1>
        <p class="muted center" style="margin-bottom: 8px">{{ t('install.doneBody') }}</p>
        <p class="center serif inst__store">{{ installedName }}</p>

        <div class="row gap-16" style="justify-content: center; margin-top: 30px; flex-wrap: wrap">
          <NuxtLink :to="localePath('/office')" class="btn btn--gold">{{ t('install.openAdmin') }}</NuxtLink>
          <NuxtLink :to="localePath('/')" class="btn btn--ghost">{{ t('install.visitSite') }}</NuxtLink>
        </div>

        <div class="done__reinstall">
          <button class="link-underline" @click="reinstall">{{ t('install.reinstall') }}</button>
        </div>
      </div>

      <!-- Wizard -->
      <div v-else class="wizard">
        <header class="wizard__head">
          <h1 class="page-title" style="font-size: 2rem">{{ t('install.title') }}</h1>
          <p class="muted">{{ t('install.subtitle') }}</p>
        </header>

        <!-- Step dots -->
        <ol class="steps">
          <li
            v-for="s in steps"
            :key="s.n"
            class="steps__item"
            :class="{ 'is-active': step === s.n, 'is-done': step > s.n }"
          >
            <span class="steps__dot">{{ step > s.n ? '✓' : s.n }}</span>
            <span class="steps__label tiny upper">{{ s.label }}</span>
          </li>
        </ol>

        <form @submit.prevent="step === 3 ? install() : (validateStep(step) ? step++ : null)">
          <!-- Step 1 -->
          <section v-show="step === 1" class="step">
            <h2 class="step__title">{{ t('install.site') }}</h2>
            <div class="field">
              <label class="label">{{ t('install.siteName') }}</label>
              <input v-model="form.siteName" class="input" :class="{ 'input--error': errors.siteName }" />
              <span v-if="errors.siteName" class="field-error">{{ errors.siteName }}</span>
            </div>
            <div class="field">
              <label class="label">{{ t('install.tagline') }}</label>
              <input v-model="form.tagline" class="input" />
            </div>
            <div class="formgrid">
              <div class="field">
                <label class="label">{{ t('install.email') }}</label>
                <input v-model="form.email" type="email" class="input" :class="{ 'input--error': errors.email }" />
                <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
              </div>
              <div class="field">
                <label class="label">{{ t('install.phone') }}</label>
                <input v-model="form.phone" class="input" />
              </div>
            </div>
            <div class="formgrid">
              <div class="field">
                <label class="label">{{ t('install.currency') }}</label>
                <select v-model="form.currency" class="select" @change="selectCurrency(form.currency)">
                  <option v-for="c in currencyOptions" :key="c.code" :value="c.code">{{ c.code }} — {{ c.name }}</option>
                </select>
              </div>
              <div class="field">
                <label class="label">{{ t('install.currencySymbol') }}</label>
                <input v-model="form.currencySymbol" class="input" />
              </div>
            </div>
            <div class="field">
              <label class="label">{{ t('install.defaultLocale') }}</label>
              <div class="localeopts">
                <label class="localeopt" :class="{ 'is-active': form.defaultLocale === 'th' }">
                  <input v-model="form.defaultLocale" type="radio" value="th" class="sr-only" />
                  <span>ภาษาไทย</span>
                </label>
                <label class="localeopt" :class="{ 'is-active': form.defaultLocale === 'en' }">
                  <input v-model="form.defaultLocale" type="radio" value="en" class="sr-only" />
                  <span>English</span>
                </label>
              </div>
            </div>
          </section>

          <!-- Step 2 -->
          <section v-show="step === 2" class="step">
            <h2 class="step__title">{{ t('install.admin') }}</h2>
            <p class="muted small" style="margin-bottom: 20px">{{ t('auth.demoAdmin') }}</p>
            <div class="field">
              <label class="label">{{ t('install.adminEmail') }}</label>
              <input v-model="form.adminEmail" type="email" class="input" :class="{ 'input--error': errors.adminEmail }" />
              <span v-if="errors.adminEmail" class="field-error">{{ errors.adminEmail }}</span>
            </div>
            <div class="field" style="margin-top: 16px">
              <label class="label">{{ t('install.adminPassword') }}</label>
              <input v-model="form.adminPassword" type="password" class="input" :class="{ 'input--error': errors.adminPassword }" />
              <span v-if="errors.adminPassword" class="field-error">{{ errors.adminPassword }}</span>
            </div>
            <div class="field" style="margin-top: 16px">
              <label class="label">{{ t('install.confirmPassword') }}</label>
              <input v-model="form.adminPasswordConfirm" type="password" class="input" :class="{ 'input--error': errors.adminPasswordConfirm }" />
              <span v-if="errors.adminPasswordConfirm" class="field-error">{{ errors.adminPasswordConfirm }}</span>
            </div>
          </section>

          <!-- Step 3 -->
          <section v-show="step === 3" class="step">
            <h2 class="step__title">{{ t('install.database') }}</h2>

            <div class="field">
              <label class="label">{{ t('install.dbDriver') }}</label>
              <div class="driveropts">
                <label class="driveropt" :class="{ 'is-active': form.dbDriver === 'json' }">
                  <input v-model="form.dbDriver" type="radio" value="json" class="sr-only" />
                  <span class="driveropt__main">
                    <span class="driveropt__title">{{ t('install.dbDriverJson') }}</span>
                    <span class="driveropt__desc small muted">No server required. Data is stored in <code>data/store.json</code>.</span>
                  </span>
                </label>
                <label class="driveropt" :class="{ 'is-active': form.dbDriver === 'mysql' }">
                  <input v-model="form.dbDriver" type="radio" value="mysql" class="sr-only" />
                  <span class="driveropt__main">
                    <span class="driveropt__title">{{ t('install.dbDriverMysql') }}</span>
                    <span class="driveropt__desc small muted">Recommended for production. The schema is created automatically.</span>
                  </span>
                </label>
              </div>
            </div>

            <template v-if="form.dbDriver === 'mysql'">
              <div class="formgrid">
                <div class="field">
                  <label class="label">{{ t('install.dbHost') }}</label>
                  <input v-model="form.dbHost" class="input" />
                </div>
                <div class="field">
                  <label class="label">{{ t('install.dbPort') }}</label>
                  <input v-model="form.dbPort" class="input" inputmode="numeric" />
                </div>
              </div>
              <div class="formgrid" style="margin-top: 16px">
                <div class="field">
                  <label class="label">{{ t('install.dbUser') }}</label>
                  <input v-model="form.dbUser" class="input" :class="{ 'input--error': errors.dbUser }" />
                  <span v-if="errors.dbUser" class="field-error">{{ errors.dbUser }}</span>
                </div>
                <div class="field">
                  <label class="label">{{ t('install.dbPassword') }}</label>
                  <input v-model="form.dbPassword" type="password" class="input" />
                </div>
              </div>
              <div class="field" style="margin-top: 16px">
                <label class="label">{{ t('install.dbName') }}</label>
                <input v-model="form.dbName" class="input" :class="{ 'input--error': errors.dbName }" />
                <span v-if="errors.dbName" class="field-error">{{ errors.dbName }}</span>
              </div>
              <button type="button" class="btn btn--ghost btn--sm" style="margin-top: 16px" :disabled="dbTest.state === 'testing'" @click="testDb">
                {{ dbTest.state === 'testing' ? t('common.loading') : t('install.dbTest') }}
              </button>
              <p
                v-if="dbTest.state === 'ok' || dbTest.state === 'fail'"
                class="small"
                :style="{ color: dbTest.state === 'ok' ? 'var(--success)' : 'var(--danger)', marginLeft: '12px' }"
              >
                {{ dbTest.state === 'ok' ? t('install.dbTestOk') : t('install.dbTestFail') }}<span v-if="dbTest.message"> — {{ dbTest.message }}</span>
              </p>
            </template>

            <p v-if="form.dbDriver === 'json'" class="notice small muted">
              {{ t('install.securityNotice') }}
            </p>
          </section>

          <!-- Nav -->
          <div class="wizard__nav">
            <button v-if="step > 1" type="button" class="btn btn--ghost" @click="step--">
              ← {{ t('common.prev') }}
            </button>
            <span class="grow" />
            <button v-if="step < 3" type="submit" class="btn btn--gold">{{ t('common.continue') }} →</button>
            <button v-else type="submit" class="btn btn--gold" :disabled="installing">
              {{ installing ? t('install.installing') : t('install.install') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inst { display: grid; grid-template-columns: 0.9fr 1.1fr; min-height: 100vh; }

.inst__brand { background: var(--ink); color: #f4f0e8; padding: 56px; display: flex; align-items: center; position: relative; overflow: hidden; }
.inst__brand::after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 20% 20%, rgba(169,132,78,0.22), transparent 55%); }
.inst__brandinner { position: relative; z-index: 2; }
.brandrow { display: flex; align-items: center; gap: 10px; margin-bottom: 60px; }
.brandmark { font-family: var(--font-display); font-size: 20px; font-weight: 600; color: var(--gold); border: 1px solid var(--gold); border-radius: 50%; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center; }
.brandword { font-family: var(--font-display); font-size: 22px; font-weight: 600; letter-spacing: 0.1em; }
.inst__headline { font-size: clamp(2.4rem, 4vw, 3.4rem); line-height: 1.1; }
.inst__lede { color: #b3ac9e; margin-top: 18px; font-size: 15px; line-height: 1.8; max-width: 400px; }
.inst__points { list-style: none; padding: 0; margin: 34px 0 0; display: flex; flex-direction: column; gap: 12px; font-size: 14px; color: #cfc8b9; }
.inst__points li::before { content: '—'; color: var(--gold); margin-right: 10px; }
.inst__foot { margin-top: 60px; color: #6f695e; }

.inst__panel { background: var(--ivory); padding: 56px 64px; display: flex; align-items: center; justify-content: center; }
.wizard { width: 100%; max-width: 540px; }
.wizard__head { margin-bottom: 28px; }

.steps { display: flex; gap: 8px; list-style: none; padding: 0; margin-bottom: 34px; }
.steps__item { display: flex; align-items: center; gap: 9px; flex: 1; }
.steps__dot { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--line-strong); display: inline-flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink-muted); flex: none; }
.steps__item.is-active .steps__dot { background: var(--ink); border-color: var(--ink); color: #f7f4ee; }
.steps__item.is-done .steps__dot { background: var(--gold); border-color: var(--gold); color: #fff; }
.steps__label { color: var(--ink-faint); white-space: nowrap; }

.step { display: flex; flex-direction: column; gap: 16px; }
.step__title { font-size: 22px; margin-bottom: 6px; }
.formgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.localeopts { display: flex; gap: 10px; }
.localeopt { flex: 1; border: 1px solid var(--line-strong); border-radius: var(--radius); padding: 14px; text-align: center; cursor: pointer; transition: all 0.2s; font-size: 15px; }
.localeopt.is-active { border-color: var(--gold); background: var(--gold-tint); }

.driveropts { display: flex; flex-direction: column; gap: 10px; }
.driveropt { border: 1px solid var(--line-strong); border-radius: var(--radius-lg); padding: 18px; cursor: pointer; transition: all 0.2s; display: flex; align-items: flex-start; }
.driveropt.is-active { border-color: var(--gold); background: var(--paper); box-shadow: 0 0 0 1px var(--gold); }
.driveropt__main { display: flex; flex-direction: column; gap: 4px; }
.driveropt__title { font-weight: 500; font-size: 15px; }
.driveropt code { background: var(--sand); padding: 1px 5px; border-radius: 3px; font-size: 12px; }

.notice { border-left: 2px solid var(--line-strong); padding-left: 14px; margin-top: 8px; }

.wizard__nav { display: flex; align-items: center; gap: 12px; margin-top: 32px; padding-top: 26px; border-top: 1px solid var(--line); }

.done { width: 100%; max-width: 520px; text-align: center; }
.done__icon { width: 64px; height: 64px; border-radius: 50%; background: #eef5f1; color: var(--success); display: flex; align-items: center; justify-content: center; margin: 0 auto 22px; }
.inst__store { font-size: 22px; color: var(--gold); margin-bottom: 12px; }
.done__reinstall { margin-top: 34px; }

@media (max-width: 1000px) {
  .inst { grid-template-columns: 1fr; }
  .inst__brand { padding: 44px 36px; min-height: auto; }
  .inst__brandinner { max-width: 460px; }
  .inst__points, .inst__foot { display: none; }
  .inst__brand::after { display: none; }
  .inst__panel { padding: 44px 32px 64px; }
}
@media (max-width: 520px) {
  .formgrid { grid-template-columns: 1fr; }
  .steps__label { display: none; }
  .steps__item { justify-content: center; }
}
</style>
