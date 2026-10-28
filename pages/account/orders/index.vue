<script setup lang="ts">
const { t, locale} = useI18n()
const localePath = useLocalePath()
const { site } = useSite()

const localeTag = computed(() => (locale.value === 'en' ? 'en-US' : 'th-TH'))
const fmt = (v: number) => formatPrice(v, site.value.currencySymbol, localeTag.value)

const { data, pending } = await useFetch<{ orders: Record<string, any>[] }>('/api/customer/orders', {
  default: () => ({ orders: [] })
})

const orders = computed(() => data.value?.orders || [])

useHead({ title: `${t('account.orders')} — ${site.value.name}` })
definePageMeta({ middleware: 'auth' })
</script>

<template>
  <section class="section">
    <div class="container">
      <p class="eyebrow">{{ t('nav.account') }}</p>
      <h1 class="page-title" style="margin: 14px 0 40px">{{ t('account.orders') }}</h1>

      <div v-if="pending && !orders.length" class="muted">{{ t('common.loading') }}</div>

      <div v-else-if="!orders.length" class="empty">
        <h2 class="serif empty__title">{{ t('account.noOrders') }}</h2>
        <NuxtLink :to="localePath('/products')" class="btn" style="margin-top: 22px">{{ t('checkout.backToShop') }}</NuxtLink>
      </div>

      <div v-else class="orders">
        <div v-for="o in orders" :key="o.id" class="order">
          <div class="order__head">
            <div>
              <NuxtLink :to="localePath('/account/orders/' + o.orderNo)" class="order__no">{{ o.orderNo }}</NuxtLink>
              <p class="tiny upper faint">{{ formatDate(o.createdAt, localeTag) }}</p>
            </div>
            <div class="order__headright">
              <span class="badge">{{ t('orderStatus.' + o.status, o.status) }}</span>
              <span class="price price--lg">{{ fmt(Number(o.total)) }}</span>
            </div>
          </div>
          <div class="order__items">
            <div v-for="it in o.items" :key="it.id" class="orderitem">
              <div class="orderitem__img"><img :src="it.image || '/images/hero-watch.jpg'" :alt="it.name" loading="lazy" /></div>
              <div class="orderitem__info">
                <span class="orderitem__name">{{ it.name }}</span>
                <span class="tiny upper faint">{{ it.sku }} · {{ t('common.quantity') }} {{ it.quantity }}</span>
              </div>
              <span class="price">{{ fmt(Number(it.price) * Number(it.quantity)) }}</span>
            </div>
          </div>
          <div class="order__foot">
            <span class="muted small">{{ t('checkout.payment') }}: {{ t('checkout.payment' + (o.paymentMethod || 'offline').charAt(0).toUpperCase() + (o.paymentMethod || 'offline').slice(1)) }}</span>
            <NuxtLink :to="localePath('/account/orders/' + o.orderNo)" class="link-underline">{{ t('account.orderDetails') }}</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.empty { text-align: center; padding: 80px 20px; }
.empty__title { font-size: 24px; color: var(--ink-soft); }

.orders { display: flex; flex-direction: column; gap: 26px; }
.order { border: 1px solid var(--line); background: var(--paper); border-radius: var(--radius-lg); overflow: hidden; }
.order__head { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 20px 24px; border-bottom: 1px solid var(--line); background: #faf8f4; flex-wrap: wrap; }
.order__no { font-family: var(--font-display); font-size: 18px; }
.order__no:hover { color: var(--gold); }
.order__headright { display: flex; align-items: center; gap: 16px; }
.order__items { padding: 4px 24px; }
.orderitem { display: grid; grid-template-columns: 52px 1fr auto; gap: 14px; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--line); }
.orderitem:last-child { border-bottom: 0; }
.orderitem__img { width: 52px; height: 52px; background: var(--sand); border-radius: var(--radius); overflow: hidden; }
.orderitem__img img { width: 100%; height: 100%; object-fit: cover; }
.orderitem__info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.orderitem__name { font-family: var(--font-display); font-size: 15px; }
.order__foot { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-top: 1px solid var(--line); gap: 12px; flex-wrap: wrap; }
</style>
