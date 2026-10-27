<script setup lang="ts">
const route = useRoute()
const { t, locale} = useI18n()
const localePath = useLocalePath()
const { site } = useSite()
const localeTag = computed(() => (locale.value === 'en' ? 'en-US' : 'th-TH'))
const fmt = (v: number) => formatPrice(v, site.value.currencySymbol, localeTag.value)

const orderNo = computed(() => String(route.params.orderNo))

const { data, error } = await useFetch<{ order: Record<string, any>; items: Record<string, any>[] }>(
  () => `/api/orders/${orderNo.value}`,
  { key: 'order-' + orderNo.value }
)

const order = computed(() => data.value?.order)
const items = computed(() => data.value?.items || [])

const steps = computed(() => {
  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const
  const current = statuses.indexOf(order.value?.status as any)
  const cancelled = order.value?.status === 'cancelled' || order.value?.status === 'refunded'
  return statuses.map((s, i) => ({
    key: s,
    label: t('orderStatus.' + s, s),
    done: !cancelled && i <= current,
    active: !cancelled && i === current
  }))
})

useHead(() => ({ title: `${orderNo.value} — ${site.value.name}` }))
definePageMeta({ middleware: 'auth' })
</script>

<template>
  <section class="section">
    <div class="container">
      <NuxtLink :to="localePath('/account/orders')" class="link-underline" style="margin-bottom: 26px">{{ t('common.back') }} ←</NuxtLink>

      <div v-if="error || !order" class="empty">
        <h2 class="serif empty__title">{{ t('errors.notFound') }}</h2>
        <NuxtLink :to="localePath('/account/orders')" class="btn" style="margin-top: 22px">{{ t('common.back') }}</NuxtLink>
      </div>

      <template v-else>
        <div class="between orderhead">
          <div>
            <p class="eyebrow">{{ t('account.orders') }}</p>
            <h1 class="page-title" style="margin: 10px 0 4px">{{ order.orderNo }}</h1>
            <p class="tiny upper faint">{{ formatDateTime(order.createdAt, localeTag) }}</p>
          </div>
          <span class="badge" :class="order.status === 'cancelled' ? 'badge--danger' : ''">{{ t('orderStatus.' + order.status, order.status) }}</span>
        </div>

        <!-- Status tracker -->
        <div class="tracker">
          <div v-for="(step, i) in steps" :key="step.key" class="tracker__step" :class="{ done: step.done, active: step.active }">
            <span class="tracker__dot" />
            <span class="tiny upper">{{ step.label }}</span>
            <span v-if="i < steps.length - 1" class="tracker__line" />
          </div>
        </div>

        <div class="ordergrid">
          <div class="ordermain">
            <h2 class="blocktitle">{{ t('checkout.items') }}</h2>
            <div class="orderitems">
              <div v-for="it in items" :key="it.id" class="orderitem">
                <div class="orderitem__img"><img :src="it.image || '/images/hero-watch.jpg'" :alt="it.name" loading="lazy" /></div>
                <div class="orderitem__info">
                  <span class="orderitem__name">{{ it.name }}</span>
                  <span class="tiny upper faint">{{ it.sku }}</span>
                </div>
                <div class="orderitem__qty">{{ t('common.quantity') }} {{ it.quantity }}</div>
                <span class="price">{{ fmt(Number(it.price) * Number(it.quantity)) }}</span>
              </div>
            </div>

            <h2 class="blocktitle" style="margin-top: 44px">{{ t('checkout.shippingAddress') }}</h2>
            <div class="addressbox">
              <p>{{ order.customerName }}</p>
              <p class="muted">{{ order.phone }}</p>
              <p class="muted">{{ order.address }}</p>
              <p class="muted">{{ order.city }} {{ order.postalCode }}</p>
              <p class="muted">{{ order.country }}</p>
            </div>
          </div>

          <aside class="summary">
            <h3 class="serif summary__title">{{ t('checkout.orderSummary') }}</h3>
            <div class="between summary__row"><span class="muted">{{ t('cart.subtotal') }}</span><span class="price">{{ fmt(Number(order.subtotal)) }}</span></div>
            <div class="between summary__row"><span class="muted">{{ t('cart.shipping') }}</span><span class="price">{{ order.shippingFee > 0 ? fmt(Number(order.shippingFee)) : t('cart.free') }}</span></div>
            <div v-if="Number(order.discount) > 0" class="between summary__row"><span class="muted">{{ t('cart.discount') }}</span><span class="price" style="color: var(--success)">-{{ fmt(Number(order.discount)) }}</span></div>
            <div class="between summary__row summary__total"><span>{{ t('cart.grandTotal') }}</span><span class="price price--lg">{{ fmt(Number(order.total)) }}</span></div>
            <p class="tiny upper faint" style="margin-top: 16px">
              {{ t('checkout.payment') }}: {{ t('checkout.payment' + (order.paymentMethod || 'offline').charAt(0).toUpperCase() + (order.paymentMethod || 'offline').slice(1)) }}
            </p>
            <p v-if="order.note" class="small muted" style="margin-top: 8px">{{ order.note }}</p>
            <NuxtLink :to="localePath('/products')" class="btn btn--ghost btn--block" style="margin-top: 20px">{{ t('checkout.backToShop') }}</NuxtLink>
          </aside>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.orderhead { margin-bottom: 34px; padding-bottom: 26px; border-bottom: 1px solid var(--line); flex-wrap: wrap; gap: 16px; }

.tracker { display: flex; gap: 0; margin-bottom: 46px; flex-wrap: wrap; }
.tracker__step { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; min-width: 110px; position: relative; color: var(--ink-faint); }
.tracker__dot { width: 12px; height: 12px; border-radius: 50%; border: 1px solid var(--line-strong); background: var(--paper); z-index: 2; }
.tracker__step.done .tracker__dot { background: var(--ink); border-color: var(--ink); }
.tracker__step.active .tracker__dot { background: var(--gold); border-color: var(--gold); box-shadow: 0 0 0 4px var(--gold-tint); }
.tracker__step.done { color: var(--ink); }
.tracker__step.active { color: var(--gold); }
.tracker__line { position: absolute; top: 5px; left: 50%; width: 100%; height: 1px; background: var(--line-strong); z-index: 1; }
.tracker__step.done .tracker__line { background: var(--ink); }

.ordergrid { display: grid; grid-template-columns: 1fr 360px; gap: 56px; align-items: start; }
.blocktitle { font-size: 19px; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--line); }
.orderitems { border: 1px solid var(--line); border-radius: var(--radius-lg); }
.orderitem { display: grid; grid-template-columns: 64px 1fr auto auto; gap: 16px; align-items: center; padding: 18px 22px; border-bottom: 1px solid var(--line); }
.orderitem:last-child { border-bottom: 0; }
.orderitem__img { width: 64px; height: 64px; background: var(--sand); border-radius: var(--radius); overflow: hidden; }
.orderitem__img img { width: 100%; height: 100%; object-fit: cover; }
.orderitem__info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.orderitem__name { font-family: var(--font-display); font-size: 16px; }
.orderitem__qty { font-size: 13px; color: var(--ink-muted); }

.addressbox { border: 1px solid var(--line); background: var(--paper); border-radius: var(--radius-lg); padding: 22px 24px; line-height: 1.8; }
.addressbox p:first-child { font-family: var(--font-display); font-size: 17px; }

.summary { border: 1px solid var(--line); background: var(--paper); padding: 28px; border-radius: var(--radius-lg); position: sticky; top: calc(var(--header-h) + 24px); }
.summary__title { font-size: 22px; margin-bottom: 18px; }
.summary__row { padding: 11px 0; font-size: 15px; }
.summary__total { border-top: 1px solid var(--line); margin-top: 8px; padding-top: 18px; letter-spacing: 0.08em; text-transform: uppercase; font-size: 13px; }

.empty { text-align: center; padding: 80px 20px; }
.empty__title { font-size: 24px; color: var(--ink-soft); }

@media (max-width: 980px) { .ordergrid { grid-template-columns: 1fr; } .summary { position: static; } }
@media (max-width: 640px) { .orderitem { grid-template-columns: 56px 1fr auto; } .orderitem__qty { display: none; } }
</style>
