<script setup lang="ts">
const { t, locale} = useI18n()
const localePath = useLocalePath()
const { site } = useSite()
const { customer, refresh } = useAuth()

const localeTag = computed(() => (locale.value === 'en' ? 'en-US' : 'th-TH'))

const form = reactive({
  name: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: ''
})

const saved = ref(false)
const saving = ref(false)

const { data: ordersData } = await useFetch<{ orders: Record<string, any>[] }>(() => '/api/customer/orders', {
  lazy: true,
  default: () => ({ orders: [] })
})

const orders = computed(() => ordersData.value?.orders || [])
const recentOrders = computed(() => orders.value.slice(0, 3))

function syncForm() {
  const c = customer.value
  form.name = c?.name || ''
  form.phone = c?.phone || ''
  form.address = c?.address || ''
  form.city = c?.city || ''
  form.postalCode = c?.postalCode || ''
  form.country = c?.country || ''
}

onMounted(syncForm)
watch(customer, syncForm, { deep: true })

async function save() {
  saving.value = true
  try {
    await $fetch('/api/customer/profile', { method: 'PUT', body: { ...form } })
    await refresh()
    saved.value = true
    setTimeout(() => (saved.value = false), 2500)
  } finally {
    saving.value = false
  }
}

const fmt = (v: number) => formatPrice(v, site.value.currencySymbol, localeTag.value)

useHead({ title: `${t('account.title')} — ${site.value.name}` })

definePageMeta({ middleware: 'auth' })
</script>

<template>
  <section class="section">
    <div class="container">
      <p class="eyebrow">{{ t('nav.account') }}</p>
      <h1 class="page-title" style="margin: 14px 0 8px">{{ t('account.welcome') }}, {{ customer?.name || '—' }}</h1>
      <p class="muted" style="margin-bottom: 40px">{{ t('account.memberSince') }} {{ formatDate(customer?.createdAt, localeTag) }}</p>

      <!-- Membership stats -->
      <div class="stats">
        <div class="stat">
          <p class="tiny upper faint">{{ t('account.memberPoints') }}</p>
          <p class="stat__value">{{ customer?.points || 0 }}</p>
        </div>
        <div class="stat">
          <p class="tiny upper faint">{{ t('account.totalSpent') }}</p>
          <p class="stat__value">{{ fmt(Number(customer?.totalSpent || 0)) }}</p>
        </div>
        <div class="stat">
          <p class="tiny upper faint">{{ t('admin.orders') }}</p>
          <p class="stat__value">{{ orders.length }}</p>
        </div>
        <NuxtLink v-if="customer?.isAdmin" :to="localePath('/office')" class="stat stat--link">
          <p class="tiny upper faint">{{ t('admin.dashboard') }}</p>
          <p class="stat__value">→</p>
        </NuxtLink>
      </div>

      <div class="accountgrid">
        <!-- Profile -->
        <div class="formblock">
          <h2 class="formblock__title">{{ t('account.profile') }}</h2>
          <div class="formgrid">
            <div class="field">
              <label class="label">{{ t('auth.name') }}</label>
              <input v-model="form.name" class="input" />
            </div>
            <div class="field">
              <label class="label">{{ t('checkout.email') }}</label>
              <input :value="customer?.email" class="input" disabled />
            </div>
            <div class="field">
              <label class="label">{{ t('checkout.phone') }}</label>
              <input v-model="form.phone" class="input" />
            </div>
            <div class="field">
              <label class="label">{{ t('checkout.country') }}</label>
              <input v-model="form.country" class="input" />
            </div>
            <div class="field" style="grid-column: 1 / -1">
              <label class="label">{{ t('checkout.address') }}</label>
              <input v-model="form.address" class="input" />
            </div>
            <div class="field">
              <label class="label">{{ t('checkout.city') }}</label>
              <input v-model="form.city" class="input" />
            </div>
            <div class="field">
              <label class="label">{{ t('checkout.postalCode') }}</label>
              <input v-model="form.postalCode" class="input" />
            </div>
          </div>
          <button class="btn btn--sm" style="margin-top: 22px" :disabled="saving" @click="save">
            {{ saving ? t('common.loading') : t('account.updateProfile') }}
          </button>
          <span v-if="saved" class="small" style="color: var(--success); margin-left: 14px">{{ t('account.profileSaved') }}</span>
        </div>

        <!-- Recent orders -->
        <aside class="ordersside">
          <div class="between ordersside__head">
            <h2 class="formblock__title">{{ t('account.orders') }}</h2>
            <NuxtLink :to="localePath('/account/orders')" class="link-underline">{{ t('common.viewAll') }}</NuxtLink>
          </div>
          <div v-if="!recentOrders.length" class="muted small">{{ t('account.noOrders') }}</div>
          <div v-for="o in recentOrders" :key="o.id" class="orderrow">
            <div>
              <NuxtLink :to="localePath('/account/orders/' + o.orderNo)" class="orderrow__no">{{ o.orderNo }}</NuxtLink>
              <p class="tiny upper faint">{{ formatDate(o.createdAt, localeTag) }}</p>
            </div>
            <div class="orderrow__right">
              <span class="badge">{{ t('orderStatus.' + o.status, o.status) }}</span>
              <span class="price">{{ fmt(Number(o.total)) }}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 56px; }
.stat { border: 1px solid var(--line); background: var(--paper); padding: 22px 24px; border-radius: var(--radius-lg); }
.stat--link { display: flex; flex-direction: column; justify-content: space-between; transition: border-color 0.2s, transform 0.2s; }
.stat--link:hover { border-color: var(--gold); transform: translateY(-2px); }
.stat__value { font-family: var(--font-display); font-size: 28px; margin-top: 8px; }

.accountgrid { display: grid; grid-template-columns: 1fr 380px; gap: 56px; align-items: start; }
.formblock { border-bottom: 1px solid var(--line); padding-bottom: 34px; }
.formblock__title { font-size: 20px; margin-bottom: 22px; }
.formgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.ordersside__head { margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid var(--line); }
.orderrow { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--line); gap: 12px; }
.orderrow__no { font-family: var(--font-display); font-size: 15px; }
.orderrow__no:hover { color: var(--gold); }
.orderrow__right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }

@media (max-width: 980px) {
  .accountgrid { grid-template-columns: 1fr; gap: 44px; }
  .stats { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 620px) {
  .formgrid { grid-template-columns: 1fr; }
}
</style>
