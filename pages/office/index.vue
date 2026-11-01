<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { site } = useSite()

const localeTag = computed(() => (locale.value === 'en' ? 'en-US' : 'th-TH'))
const fmt = (v: number) => formatPrice(v, site.value.currencySymbol, localeTag.value)

const reqFetch = useRequestFetch()
const { data, pending } = await useAsyncData('office-stats', () =>
  reqFetch<{
    totals: Record<string, number>
    recentOrders: Record<string, any>[]
    topProducts: Record<string, any>[]
    lowStock: Record<string, any>[]
    orderStatusCounts: Record<string, number>
  }>('/api/admin/stats').catch(() => ({
    totals: {},
    recentOrders: [],
    topProducts: [],
    lowStock: [],
    orderStatusCounts: {}
  }))
)

const stats = computed(() => data.value?.totals || {})
const recentOrders = computed(() => data.value?.recentOrders || [])
const topProducts = computed(() => data.value?.topProducts || [])
const lowStock = computed(() => data.value?.lowStock || [])

const cards = computed(() => [
  { key: 'sales', label: t('admin.sales'), value: fmt(Number(stats.value.revenue || 0)), to: localePath('/office/orders') },
  { key: 'orders', label: t('admin.ordersCount'), value: String(stats.value.orders || 0), to: localePath('/office/orders') },
  { key: 'customers', label: t('admin.customersCount'), value: String(stats.value.customers || 0), to: localePath('/office/customers') },
  { key: 'products', label: t('admin.products'), value: String(stats.value.products || 0), to: localePath('/office/products') }
])

useHead({ title: `${t('admin.dashboard')} — ${site.value.name}` })
definePageMeta({ layout: 'office', middleware: 'office' })
</script>

<template>
  <div>
    <div class="pagehead">
      <div>
        <p class="eyebrow">OPWATCH OFFICE</p>
        <h1 class="page-title" style="font-size: 2rem; margin-top: 6px">{{ t('admin.dashboard') }}</h1>
      </div>
      <div class="row gap-8 wrap">
        <NuxtLink :to="localePath('/office/brands')" class="btn btn--sm btn--ghost">{{ t('admin.brands') }}</NuxtLink>
        <NuxtLink :to="localePath('/office/products/new')" class="btn btn--sm btn--gold">{{ t('admin.newProduct') }}</NuxtLink>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="statcards">
      <NuxtLink v-for="c in cards" :key="c.key" :to="c.to" class="statcard">
        <p class="tiny upper faint">{{ c.label }}</p>
        <p class="statcard__value">{{ c.value }}</p>
      </NuxtLink>
    </div>

    <div class="dashgrid">
      <!-- Recent orders -->
      <section class="panel">
        <div class="between panel__head">
          <h2 class="serif panel__title">{{ t('admin.recentOrders') }}</h2>
          <NuxtLink :to="localePath('/office/orders')" class="link-underline">{{ t('common.viewAll') }}</NuxtLink>
        </div>

        <div v-if="pending && !recentOrders.length" class="muted">{{ t('common.loading') }}</div>
        <div v-else-if="!recentOrders.length" class="muted">{{ t('admin.noOrders') }}</div>

        <table v-else class="table">
          <thead>
            <tr>
              <th>{{ t('account.orderNo') }}</th>
              <th>{{ t('admin.customer') }}</th>
              <th>{{ t('admin.date') }}</th>
              <th>{{ t('admin.status') }}</th>
              <th style="text-align: right">{{ t('admin.grandTotal') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in recentOrders" :key="o.id">
              <td><NuxtLink :to="localePath('/office/orders/' + o.id)" class="link">{{ o.orderNo }}</NuxtLink></td>
              <td>{{ o.customerName }}<br /><span class="tiny upper faint">{{ o.customerEmail }}</span></td>
              <td class="small">{{ formatDate(o.createdAt, localeTag) }}</td>
              <td><span class="badge">{{ t('orderStatus.' + o.status, o.status) }}</span></td>
              <td style="text-align: right" class="price">{{ fmt(Number(o.total)) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Low stock -->
      <section class="panel">
        <div class="between panel__head">
          <h2 class="serif panel__title">{{ t('admin.lowStock') }}</h2>
          <NuxtLink :to="localePath('/office/products')" class="link-underline">{{ t('admin.products') }}</NuxtLink>
        </div>

        <div v-if="!lowStock.length" class="muted">{{ t('admin.noProducts') }}</div>
        <table v-else class="table">
          <thead>
            <tr><th>{{ t('admin.name') }}</th><th>{{ t('admin.sku') }}</th><th style="text-align:right">{{ t('admin.stock') }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="p in lowStock" :key="p.id">
              <td><NuxtLink :to="localePath('/office/products/' + p.id)" class="link">{{ locale === 'en' ? p.nameEn || p.name : p.nameTh || p.name }}</NuxtLink></td>
              <td class="small faint">{{ p.sku }}</td>
              <td style="text-align: right">
                <span class="badge" :class="Number(p.stock) <= 0 ? 'badge--danger' : 'badge--gold'">{{ p.stock }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>

    <!-- Top products -->
    <section class="panel" style="margin-top: 30px">
      <div class="between panel__head">
        <h2 class="serif panel__title">{{ t('admin.topProducts') }}</h2>
      </div>
      <div v-if="!topProducts.length" class="muted">{{ t('admin.noProducts') }}</div>
      <table v-else class="table">
        <thead>
          <tr><th>#</th><th>{{ t('admin.product') }}</th><th style="text-align:right">{{ t('admin.ordersCount') }}</th><th style="text-align:right">{{ t('admin.sales') }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="(p, i) in topProducts" :key="p.id">
            <td class="faint">{{ i + 1 }}</td>
            <td>{{ p.name }}</td>
            <td style="text-align: right">{{ p.quantity }}</td>
            <td style="text-align: right" class="price">{{ fmt(Number(p.revenue)) }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.pagehead { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 30px; flex-wrap: wrap; }
.statcards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
.statcard { border: 1px solid var(--line); background: var(--paper); border-radius: var(--radius-lg); padding: 22px 24px; transition: border-color 0.2s, transform 0.2s; }
.statcard:hover { border-color: var(--gold); transform: translateY(-2px); }
.statcard__value { font-family: var(--font-display); font-size: 30px; margin-top: 8px; }

.dashgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
.panel { border: 1px solid var(--line); background: var(--paper); border-radius: var(--radius-lg); padding: 26px 28px; }
.panel__head { margin-bottom: 20px; }
.panel__title { font-size: 20px; }
.link { color: var(--ink); }
.link:hover { color: var(--gold); }

@media (max-width: 1000px) { .statcards { grid-template-columns: repeat(2, 1fr); } .dashgrid { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .statcards { grid-template-columns: 1fr; } }
</style>
