<script setup lang="ts">
const { t, locale} = useI18n()
const localePath = useLocalePath()
const { site } = useSite()

const localeTag = computed(() => (locale.value === 'en' ? 'en-US' : 'th-TH'))
const fmt = (v: number) => formatPrice(v, site.value.currencySymbol, localeTag.value)

const search = ref('')
const status = ref('')
const items = ref<Record<string, any>[]>([])

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

async function load() {
  const res = await $fetch<{ items: Record<string, any>[] }>('/api/admin/orders', {
    query: {
      q: search.value || undefined,
      status: status.value || undefined
    }
  })
  items.value = res.items
}

watch([search, status], load, { deep: true })
onMounted(load)

async function setStatus(order: Record<string, any>, next: string) {
  await $fetch(`/api/admin/orders/${order.id}`, { method: 'PUT', body: { status: next } })
  order.status = next
  useToast().success(t('admin.updated'))
}

useHead({ title: `${t('admin.orders')} — ${site.value.name}` })
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>

<template>
  <div>
    <div class="pagehead">
      <h1 class="page-title" style="font-size: 2rem">{{ t('admin.orders') }}</h1>
      <span class="small muted">{{ items.length }} {{ t('admin.ordersCount') }}</span>
    </div>

    <div class="toolbar">
      <input v-model="search" class="input" style="max-width: 320px" :placeholder="t('admin.searchPlaceholder')" />
      <select v-model="status" class="select" style="max-width: 220px">
        <option value="">{{ t('common.all') }} {{ t('admin.status') }}</option>
        <option v-for="s in statusOptions" :key="s" :value="s">{{ t('orderStatus.' + s, s) }}</option>
      </select>
    </div>

    <div class="panel" style="padding: 0; overflow: hidden">
      <div v-if="!items.length" class="muted panel-pad">{{ t('admin.noOrders') }}</div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>{{ t('account.orderNo') }}</th>
            <th>{{ t('admin.customer') }}</th>
            <th>{{ t('admin.date') }}</th>
            <th>{{ t('admin.items') }}</th>
            <th style="text-align:right">{{ t('admin.grandTotal') }}</th>
            <th>{{ t('admin.status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in items" :key="o.id">
            <td><NuxtLink :to="localePath('/admin/orders/' + o.id)" class="link">{{ o.orderNo }}</NuxtLink></td>
            <td>
              <div>{{ o.customerName }}</div>
              <div class="tiny upper faint">{{ o.customerEmail }}</div>
              <div class="tiny upper faint">{{ o.phone }}</div>
            </td>
            <td class="small">{{ formatDate(o.createdAt, localeTag) }}</td>
            <td class="small">{{ o.items.length }} {{ t('admin.items') }}</td>
            <td style="text-align: right" class="price">{{ fmt(Number(o.total)) }}</td>
            <td>
              <select class="select select--sm" :value="o.status" @change="setStatus(o, ($event.target as HTMLSelectElement).value)">
                <option v-for="s in statusOptions" :key="s" :value="s">{{ t('orderStatus.' + s, s) }}</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.pagehead { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.toolbar { display: flex; gap: 14px; margin-bottom: 18px; flex-wrap: wrap; }
.panel { border: 1px solid var(--line); background: var(--paper); border-radius: var(--radius-lg); }
.panel-pad { padding: 26px 28px; }
.link { color: var(--ink); }
.link:hover { color: var(--gold); }
.select--sm { padding: 7px 10px; font-size: 12px; max-width: 140px; }
</style>
