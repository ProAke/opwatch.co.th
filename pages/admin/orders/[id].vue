<script setup lang="ts">
const route = useRoute()
const { t, locale} = useI18n()
const localePath = useLocalePath()
const { site } = useSite()

const localeTag = computed(() => (locale.value === 'en' ? 'en-US' : 'th-TH'))
const fmt = (v: number) => formatPrice(v, site.value.currencySymbol, localeTag.value)

const id = computed(() => String(route.params.id))

const { data, error } = await useFetch<{ order: Record<string, any>; items?: Record<string, any>[] }>(
  () => `/api/orders/${id.value}`,
  { key: 'admin-order-' + id.value }
)

const order = computed(() => data.value?.order)
const items = computed(() => data.value?.items || order.value?.items || [])

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

async function setStatus(next: string) {
  await $fetch(`/api/admin/orders/${id.value}`, { method: 'PUT', body: { status: next } })
  await refresh()
  useToast().success(t('admin.updated'))
}

async function saveNote() {
  const note = (document.querySelector('.ordernote') as HTMLTextAreaElement)?.value || ''
  await $fetch(`/api/admin/orders/${id.value}`, { method: 'PUT', body: { note } })
  useToast().success(t('admin.updated'))
}

useHead({ title: `${t('admin.order')} — ${site.value.name}` })
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>

<template>
  <div>
    <div class="pagehead">
      <div>
        <NuxtLink to="/admin/orders" class="link-underline" style="margin-bottom: 12px">{{ t('common.back') }} ←</NuxtLink>
        <h1 class="page-title" style="font-size: 2rem">{{ order?.orderNo || t('admin.order') }}</h1>
        <p class="tiny upper faint" v-if="order">{{ formatDateTime(order.createdAt, localeTag) }}</p>
      </div>
      <span v-if="order" class="badge" :class="order.status === 'cancelled' ? 'badge--danger' : ''">{{ t('orderStatus.' + order.status, order.status) }}</span>
    </div>

    <div v-if="error || !order" class="muted">{{ t('errors.notFound') }}</div>

    <div v-else class="ordergrid">
      <div class="ordermain">
        <section class="panel">
          <h2 class="serif panel__title">{{ t('admin.customer') }}</h2>
          <div class="infolines">
            <div><span class="tiny upper faint">{{ t('auth.name') }}</span><span>{{ order.customerName }}</span></div>
            <div><span class="tiny upper faint">{{ t('auth.email') }}</span><span>{{ order.customerEmail }}</span></div>
            <div><span class="tiny upper faint">{{ t('checkout.phone') }}</span><span>{{ order.phone || '—' }}</span></div>
          </div>
        </section>

        <section class="panel">
          <h2 class="serif panel__title">{{ t('checkout.shippingAddress') }}</h2>
          <div class="infolines">
            <div><span class="tiny upper faint">{{ t('checkout.address') }}</span><span>{{ order.address || '—' }}</span></div>
            <div><span class="tiny upper faint">{{ t('checkout.city') }}</span><span>{{ order.city || '—' }} {{ order.postalCode || '' }}</span></div>
            <div><span class="tiny upper faint">{{ t('checkout.country') }}</span><span>{{ order.country || '—' }}</span></div>
          </div>
        </section>

        <section class="panel">
          <h2 class="serif panel__title">{{ t('checkout.items') }}</h2>
          <table class="table">
            <thead>
              <tr><th>{{ t('admin.product') }}</th><th style="text-align:right">{{ t('admin.price') }}</th><th style="text-align:right">{{ t('admin.stock') }}</th><th style="text-align:right">{{ t('admin.grandTotal') }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="it in items" :key="it.id">
                <td>
                  <div class="prodcell">
                    <div class="prodcell__img"><img :src="it.image || '/images/hero-watch.jpg'" alt="" loading="lazy" /></div>
                    <div>
                      <div>{{ it.name }}</div>
                      <div class="tiny upper faint">{{ it.sku }}</div>
                    </div>
                  </div>
                </td>
                <td style="text-align: right">{{ fmt(Number(it.price)) }}</td>
                <td style="text-align: right">{{ it.quantity }}</td>
                <td style="text-align: right" class="price">{{ fmt(Number(it.price) * Number(it.quantity)) }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="panel">
          <h2 class="serif panel__title">{{ t('checkout.note') }}</h2>
          <textarea class="textarea ordernote">{{ order.note || '' }}</textarea>
          <button class="btn btn--sm" style="margin-top: 14px" @click="saveNote">{{ t('admin.save') }}</button>
        </section>
      </div>

      <aside class="orderside">
        <section class="panel">
          <h2 class="serif panel__title">{{ t('checkout.orderSummary') }}</h2>
          <div class="between sumrow"><span class="muted">{{ t('cart.subtotal') }}</span><span class="price">{{ fmt(Number(order.subtotal)) }}</span></div>
          <div class="between sumrow"><span class="muted">{{ t('cart.shipping') }}</span><span class="price">{{ order.shippingFee > 0 ? fmt(Number(order.shippingFee)) : t('cart.free') }}</span></div>
          <div class="between sumrow"><span class="muted">{{ t('cart.discount') }}</span><span class="price" style="color: var(--success)">-{{ fmt(Number(order.discount)) }}</span></div>
          <div class="between sumrow sumtotal"><span>{{ t('cart.grandTotal') }}</span><span class="price price--lg">{{ fmt(Number(order.total)) }}</span></div>
          <p class="tiny upper faint" style="margin-top: 14px">{{ t('checkout.payment') }}: {{ order.paymentMethod }}</p>
        </section>

        <section class="panel">
          <h2 class="serif panel__title">{{ t('admin.changeStatus') }}</h2>
          <div class="statusopts">
            <button
              v-for="s in statusOptions"
              :key="s"
              class="statusopt"
              :class="{ 'is-active': order.status === s }"
              @click="setStatus(s)"
            >
              {{ t('orderStatus.' + s, s) }}
            </button>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.pagehead { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 26px; flex-wrap: wrap; }
.ordergrid { display: grid; grid-template-columns: 1fr 340px; gap: 30px; align-items: start; }
.ordermain { display: flex; flex-direction: column; gap: 24px; }
.panel { border: 1px solid var(--line); background: var(--paper); border-radius: var(--radius-lg); padding: 24px 26px; }
.panel__title { font-size: 19px; margin-bottom: 18px; }
.infolines { display: flex; flex-direction: column; gap: 12px; }
.infolines > div { display: grid; grid-template-columns: 120px 1fr; gap: 14px; align-items: baseline; }
.prodcell { display: flex; align-items: center; gap: 12px; }
.prodcell__img { width: 40px; height: 40px; background: var(--sand); border-radius: var(--radius); overflow: hidden; flex: none; }
.prodcell__img img { width: 100%; height: 100%; object-fit: cover; }
.orderside { position: sticky; top: 96px; display: flex; flex-direction: column; gap: 24px; }
.sumrow { padding: 9px 0; font-size: 15px; }
.sumtotal { border-top: 1px solid var(--line); margin-top: 8px; padding-top: 16px; letter-spacing: 0.08em; text-transform: uppercase; font-size: 13px; }
.statusopts { display: flex; flex-direction: column; gap: 8px; }
.statusopt { border: 1px solid var(--line-strong); background: var(--paper); border-radius: var(--radius); padding: 11px 14px; text-align: left; font-size: 13px; transition: all 0.18s; }
.statusopt:hover { border-color: var(--ink); }
.statusopt.is-active { background: var(--ink); border-color: var(--ink); color: #f7f4ee; }

@media (max-width: 900px) {
  .ordergrid { grid-template-columns: 1fr; }
  .orderside { position: static; }
}
</style>
