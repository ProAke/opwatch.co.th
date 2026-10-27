<script setup lang="ts">
const { t, locale} = useI18n()
const localePath = useLocalePath()
const { site } = useSite()

const localeTag = computed(() => (locale.value === 'en' ? 'en-US' : 'th-TH'))
const fmt = (v: number) => formatPrice(v, site.value.currencySymbol, localeTag.value)

const search = ref('')
const items = ref<Record<string, any>[]>([])

async function load() {
  const res = await $fetch<{ items: Record<string, any>[] }>('/api/admin/customers', {
    query: search.value ? { q: search.value } : {}
  })
  items.value = res.items
}

watch(search, load)
onMounted(load)

useHead({ title: `${t('admin.customers')} — ${site.value.name}` })
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>

<template>
  <div>
    <div class="pagehead">
      <h1 class="page-title" style="font-size: 2rem">{{ t('admin.customers') }}</h1>
      <span class="small muted">{{ items.length }} {{ t('admin.customersCount') }}</span>
    </div>

    <div class="toolbar">
      <input v-model="search" class="input" style="max-width: 320px" :placeholder="t('admin.searchPlaceholder')" />
    </div>

    <div class="panel" style="padding: 0; overflow: hidden">
      <div v-if="!items.length" class="muted panel-pad">{{ t('admin.noCustomers') }}</div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>{{ t('auth.name') }}</th>
            <th>{{ t('auth.email') }}</th>
            <th>{{ t('checkout.phone') }}</th>
            <th style="text-align:right">{{ t('account.memberPoints') }}</th>
            <th style="text-align:right">{{ t('account.totalSpent') }}</th>
            <th style="text-align:right">{{ t('admin.ordersCount') }}</th>
            <th>{{ t('account.memberSince') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in items" :key="c.id">
            <td>
              <div>{{ c.name }}</div>
              <span v-if="c.isAdmin" class="badge badge--gold">Admin</span>
            </td>
            <td class="small">{{ c.email }}</td>
            <td class="small">{{ c.phone || '—' }}</td>
            <td style="text-align: right">{{ c.points || 0 }}</td>
            <td style="text-align: right" class="price">{{ fmt(Number(c.totalSpent || 0)) }}</td>
            <td style="text-align: right">{{ c.orderCount || 0 }}</td>
            <td class="small">{{ formatDate(c.createdAt, localeTag) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.pagehead { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.toolbar { margin-bottom: 18px; }
.panel { border: 1px solid var(--line); background: var(--paper); border-radius: var(--radius-lg); }
.panel-pad { padding: 26px 28px; }
</style>
