<script setup lang="ts">
const route = useRoute()
const { t, locale} = useI18n()
const localePath = useLocalePath()
const { site, categories } = useSite()

const activeCategory = ref(route.query.category ? String(route.query.category) : '')
const searchQuery = ref(route.query.q ? String(route.query.q) : '')
const sort = ref('featured')
const priceMax = ref(60000)

const localeTag = computed(() => (locale.value === 'en' ? 'en-US' : 'th-TH'))

const fetchQuery = computed(() => ({
  sort: sort.value,
  limit: 100,
  ...(activeCategory.value ? { category: activeCategory.value } : {}),
  ...(searchQuery.value ? { q: searchQuery.value } : {})
}))

const { data, pending } = await useFetch<{ items: Record<string, any>[]; total: number }>('/api/products', {
  query: fetchQuery,
  watch: [fetchQuery],
  default: () => ({ items: [], total: 0 })
})

const items = computed(() => data.value?.items || [])

// Keep local filters in sync with the URL.
watch(
  () => route.query,
  (q) => {
    activeCategory.value = q.category ? String(q.category) : ''
    searchQuery.value = q.q ? String(q.q) : ''
  },
  { deep: true }
)

function selectCategory(slug: string) {
  navigateTo(localePath({ path: '/products', query: slug ? { category: slug } : {} }))
}

function clearFilters() {
  priceMax.value = 60000
  sort.value = 'featured'
  navigateTo(localePath({ path: '/products', query: {} }))
}

const filteredItems = computed(() => items.value.filter((p) => Number(p.price || 0) <= Number(priceMax.value)))

const activeCategoryObj = computed(() => categories.value.find((c) => c.slug === activeCategory.value))

const categoryTabs = computed(() => [
  { slug: '', name: t('common.all') },
  ...categories.value.map((c) => ({
    slug: c.slug,
    name: locale.value === 'en' ? c.nameEn || c.name : c.nameTh || c.name
  }))
])

useHead(() => ({
  title: activeCategory.value
    ? `${activeCategoryObj.value ? (locale.value === 'en' ? activeCategoryObj.value.nameEn : activeCategoryObj.value.nameTh) : ''} — ${site.value.name}`
    : `${t('products.title')} — ${site.value.name}`
}))
</script>

<template>
  <div>
    <!-- Page header -->
    <section class="ph">
      <div class="container">
        <p class="eyebrow">{{ t('nav.collections') }}</p>
        <h1 class="page-title">{{ t('products.title') }}</h1>
        <p class="muted ph__sub">{{ t('products.subtitle') }}</p>
      </div>
    </section>

    <section class="section section--tight">
      <div class="container">
        <!-- Category tabs -->
        <div class="cats">
          <button
            v-for="c in categoryTabs"
            :key="c.slug"
            class="cats__btn"
            :class="{ 'is-active': activeCategory === c.slug }"
            @click="selectCategory(c.slug)"
          >
            {{ c.name }}
          </button>
        </div>

        <div class="shop">
          <!-- Sidebar -->
          <aside class="shop__side">
            <div class="filterbox">
              <h3 class="filterbox__title tiny upper">{{ t('products.sortBy') }}</h3>
              <select v-model="sort" class="select">
                <option value="featured">{{ t('products.sortFeatured') }}</option>
                <option value="price_asc">{{ t('products.sortPriceLow') }}</option>
                <option value="price_desc">{{ t('products.sortPriceHigh') }}</option>
                <option value="newest">{{ t('products.sortNewest') }}</option>
              </select>
            </div>

            <div class="filterbox">
              <h3 class="filterbox__title tiny upper">{{ t('products.priceRange') }}</h3>
              <input v-model.number="priceMax" type="range" class="range" min="5000" max="60000" step="1000" />
              <div class="between small muted">
                <span>฿5,000</span>
                <span class="price">{{ formatPrice(priceMax, site.currencySymbol, localeTag) }}</span>
              </div>
            </div>

            <button class="link-underline" @click="clearFilters">{{ t('common.cancel') }}</button>
          </aside>

          <!-- Results -->
          <div class="shop__main">
          <div class="between shop__bar">
            <p class="tiny upper muted">{{ t('products.results', { count: filteredItems.length }) }}</p>
            <p v-if="searchQuery" class="tiny upper muted">{{ t('common.search') }}: “{{ searchQuery }}”</p>
          </div>

          <div v-if="pending" class="grid grid--3">
            <div v-for="i in 6" :key="i" class="skeleton" />
          </div>

          <div v-else-if="!filteredItems.length" class="empty">
            <p class="serif empty__title">{{ t('products.empty') }}</p>
            <button class="link-underline" @click="clearFilters">{{ t('common.continue') }}</button>
          </div>

          <div v-else class="grid grid--3">
            <ProductCard v-for="p in filteredItems" :key="p.id" :product="p" />
          </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ph { padding-block: 60px 40px; border-bottom: 1px solid var(--line); background: var(--paper); }
.ph__sub { margin-top: 10px; }

.cats { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 40px; }
.cats__btn {
  border: 1px solid var(--line-strong);
  background: transparent;
  padding: 9px 18px;
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
  transition: all 0.2s;
}
.cats__btn:hover { border-color: var(--ink); color: var(--ink); }
.cats__btn.is-active { background: var(--ink); border-color: var(--ink); color: #f7f4ee; }

.shop { display: grid; grid-template-columns: 250px 1fr; gap: 52px; }
.shop__side { position: sticky; top: calc(var(--header-h) + 24px); align-self: start; display: flex; flex-direction: column; gap: 28px; }
.filterbox { display: flex; flex-direction: column; gap: 12px; }
.filterbox__title { color: var(--ink-muted); }
.range { width: 100%; accent-color: var(--gold); }

.shop__bar { margin-bottom: 22px; padding-bottom: 16px; border-bottom: 1px solid var(--line); }
.grid--3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; }

.skeleton { aspect-ratio: 1 / 1.2; background: linear-gradient(90deg, #f3efe7 25%, #faf8f4 37%, #f3efe7 63%); background-size: 400% 100%; animation: shimmer 1.4s infinite; border-radius: var(--radius-lg); }
@keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }

.empty { text-align: center; padding: 80px 20px; }
.empty__title { font-size: 22px; margin-bottom: 16px; color: var(--ink-soft); }

@media (max-width: 1080px) {
  .grid--3 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 860px) {
  .shop { grid-template-columns: 1fr; gap: 30px; }
  .shop__side { position: static; flex-direction: row; flex-wrap: wrap; gap: 20px; }
  .filterbox { flex: 1; min-width: 220px; }
}
@media (max-width: 560px) {
  .grid--3 { grid-template-columns: 1fr; }
}
</style>
