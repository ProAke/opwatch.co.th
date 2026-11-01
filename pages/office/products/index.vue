<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { site } = useSite()
const localeTag = computed(() => (locale.value === 'en' ? 'en-US' : 'th-TH'))
const fmt = (v: number) => formatPrice(v, site.value.currencySymbol, localeTag.value)

const search = ref('')
const items = ref<Record<string, any>[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const res = await $fetch<{ items: Record<string, any>[] }>('/api/admin/products', {
      query: search.value ? { q: search.value } : {}
    })
    items.value = res.items
  } finally {
    loading.value = false
  }
}

watch(search, load)
onMounted(load)

async function remove(p: Record<string, any>) {
  if (!confirm(t('admin.deleteConfirm'))) return
  await $fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' })
  items.value = items.value.filter((i) => i.id !== p.id)
  useToast().success(t('admin.updated'))
}

useHead({ title: `${t('admin.products')} — ${site.value.name}` })
definePageMeta({ layout: 'office', middleware: 'office' })
</script>

<template>
  <div>
    <div class="pagehead">
      <h1 class="page-title" style="font-size: 2rem">{{ t('admin.products') }}</h1>
      <NuxtLink :to="localePath('/office/products/new')" class="btn btn--sm btn--gold">{{ t('admin.newProduct') }}</NuxtLink>
    </div>

    <div class="toolbar">
      <input v-model="search" class="input" style="max-width: 320px" :placeholder="t('admin.searchPlaceholder')" />
      <span class="small muted">{{ t('products.results', { count: items.length }) }}</span>
    </div>

    <div class="panel" style="padding: 0; overflow: hidden">
      <div v-if="loading" class="muted panel-pad">{{ t('common.loading') }}</div>
      <div v-else-if="!items.length" class="muted panel-pad">{{ t('admin.noProducts') }}</div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>{{ t('admin.product') }}</th>
            <th>{{ t('admin.sku') }}</th>
            <th>{{ t('products.category') }}</th>
            <th style="text-align:right">{{ t('admin.price') }}</th>
            <th style="text-align:right">{{ t('admin.stock') }}</th>
            <th>{{ t('admin.status') }}</th>
            <th style="text-align:right">{{ t('admin.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in items" :key="p.id">
            <td>
              <div class="prodcell">
                <div class="prodcell__img">
                  <img :src="(Array.isArray(p.images) ? p.images[0] : p.images) || '/images/hero-watch.jpg'" :alt="locale === 'en' ? p.nameEn : p.nameTh" loading="lazy" />
                </div>
                <div>
                  <div class="prodcell__name">{{ locale === 'en' ? p.nameEn || p.name : p.nameTh || p.name }}</div>
                  <div class="tiny upper faint">{{ typeof p.brand === 'object' ? p.brand?.name : p.brand }}</div>
                </div>
              </div>
            </td>
            <td class="small faint">{{ p.sku }}</td>
            <td class="small">{{ p.categoryName || t('common.none') }}</td>
            <td style="text-align: right" class="price">{{ fmt(Number(p.price)) }}</td>
            <td style="text-align: right">
              <span class="badge" :class="Number(p.stock) <= 10 ? 'badge--gold' : ''">{{ p.stock }}</span>
            </td>
            <td>
              <span class="badge" :class="p.status === 'active' ? 'badge--new' : ''">
                {{ p.status === 'active' ? t('admin.published') : t('admin.draft') }}
              </span>
            </td>
            <td style="text-align: right">
              <div class="row gap-8" style="justify-content: flex-end">
                <NuxtLink :to="localePath('/office/products/' + p.id)" class="btn btn--sm btn--ghost">{{ t('common.edit') }}</NuxtLink>
                <button class="btn btn--sm btn--ghost danger" @click="remove(p)">{{ t('common.delete') }}</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.pagehead { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; }
.panel { border: 1px solid var(--line); background: var(--paper); border-radius: var(--radius-lg); }
.panel-pad { padding: 26px 28px; }
.prodcell { display: flex; align-items: center; gap: 14px; }
.prodcell__img { width: 44px; height: 44px; background: var(--sand); border-radius: var(--radius); overflow: hidden; flex: none; }
.prodcell__img img { width: 100%; height: 100%; object-fit: cover; }
.prodcell__name { font-family: var(--font-display); font-size: 16px; }
.danger:hover { color: var(--danger) !important; border-color: var(--danger) !important; }
</style>
