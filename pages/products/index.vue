<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { site, categories, brands } = useSite()

const activeCategory = ref(route.query.category ? String(route.query.category) : '')
const activeBrand = ref(route.query.brand ? String(route.query.brand) : '')
const searchQuery = ref(route.query.q ? String(route.query.q) : '')
const sort = ref(route.query.sort ? String(route.query.sort) : 'featured')
const priceMax = ref(500000)

const localeTag = computed(() => (locale.value === 'en' ? 'en-US' : 'th-TH'))

const fetchQuery = computed(() => ({
  sort: sort.value,
  limit: 100,
  ...(activeCategory.value ? { category: activeCategory.value } : {}),
  ...(activeBrand.value ? { brand: activeBrand.value } : {}),
  ...(searchQuery.value ? { q: searchQuery.value } : {})
}))

const { data, pending } = await useFetch<{ items: Record<string, any>[]; total: number }>('/api/products', {
  query: fetchQuery,
  watch: [fetchQuery],
  default: () => ({ items: [], total: 0 })
})

const items = computed(() => data.value?.items || [])

watch(
  () => route.query,
  (q) => {
    activeCategory.value = q.category ? String(q.category) : ''
    activeBrand.value = q.brand ? String(q.brand) : ''
    searchQuery.value = q.q ? String(q.q) : ''
    if (q.sort) sort.value = String(q.sort)
  },
  { deep: true }
)

function pushQuery(next: Record<string, string | undefined>) {
  const merged: Record<string, string> = {}
  const cat = next.category !== undefined ? next.category : activeCategory.value
  const br = next.brand !== undefined ? next.brand : activeBrand.value
  const qv = next.q !== undefined ? next.q : searchQuery.value
  if (cat) merged.category = cat
  if (br) merged.brand = br
  if (qv) merged.q = qv
  navigateTo(localePath({ path: '/products', query: merged }))
}

function selectCategory(slug: string) {
  pushQuery({ category: slug })
}

function selectBrand(slug: string) {
  pushQuery({ brand: slug })
}

function applySearch() {
  pushQuery({ q: searchQuery.value.trim() })
}

function clearFilters() {
  priceMax.value = 500000
  sort.value = 'featured'
  searchQuery.value = ''
  navigateTo(localePath({ path: '/products', query: {} }))
}

const filteredItems = computed(() => items.value.filter((p) => Number(p.price || 0) <= Number(priceMax.value)))

const activeCategoryObj = computed(() => categories.value.find((c) => c.slug === activeCategory.value))
const activeBrandObj = computed(() => brands.value.find((b) => b.slug === activeBrand.value))

const pageHeading = computed(() => {
  if (activeBrandObj.value) {
    return locale.value === 'en' ? activeBrandObj.value.nameEn || activeBrandObj.value.name : activeBrandObj.value.nameTh || activeBrandObj.value.name
  }
  if (activeCategoryObj.value) {
    return locale.value === 'en' ? activeCategoryObj.value.nameEn || activeCategoryObj.value.name : activeCategoryObj.value.nameTh || activeCategoryObj.value.name
  }
  return t('products.title')
})

const pageSubtitle = computed(() => {
  if (activeBrandObj.value) {
    return locale.value === 'en'
      ? `${activeBrandObj.value.movementEn || ''} — ${activeBrandObj.value.taglineEn || ''}`
      : `${activeBrandObj.value.movement || ''} — ${activeBrandObj.value.tagline || ''}`
  }
  return t('products.subtitle')
})

const categoryTabs = computed(() => [
  { slug: '', name: t('common.all') },
  ...categories.value
    .filter((c) => c.slug !== 'watches-jewelry')
    .map((c) => ({
      slug: c.slug,
      name: locale.value === 'en' ? c.nameEn || c.name : c.nameTh || c.name
    }))
])

useHead(() => ({
  title: `${pageHeading.value} — ${site.value.name}`
}))
</script>

<template>
  <div>
    <!-- Olympianus-style Dark Editorial Collection Header -->
    <section class="ph">
      <div class="container ph__inner">
        <p class="eyebrow" style="color: var(--gold-soft)">{{ t('nav.collections') }}</p>
        <h1 class="page-title ph__title">{{ pageHeading }}</h1>
        <p class="ph__sub">{{ pageSubtitle }}</p>
      </div>
    </section>

    <section class="section section--tight">
      <div class="container">
        <!-- Category Pills -->
        <div class="cats">
          <button
            v-for="c in categoryTabs"
            :key="c.slug"
            type="button"
            class="cats__btn"
            :class="{ 'is-active': activeCategory === c.slug }"
            @click="selectCategory(c.slug)"
          >
            {{ c.name }}
          </button>
        </div>

        <div class="shop">
          <!-- Filter Sidebar -->
          <aside class="shop__side">
            <div class="filterbox">
              <h3 class="filterbox__title tiny upper">{{ t('common.search') }}</h3>
              <form class="row gap-8" @submit.prevent="applySearch">
                <input v-model="searchQuery" class="input" :placeholder="t('products.searchPlaceholder')" />
              </form>
            </div>

            <div v-if="brands.length" class="filterbox">
              <h3 class="filterbox__title tiny upper">{{ t('products.brand') }}</h3>
              <div class="brandlist">
                <button
                  type="button"
                  class="brandopt"
                  :class="{ 'is-active': activeBrand === '' }"
                  @click="selectBrand('')"
                >
                  {{ t('products.allBrands') }}
                </button>
                <button
                  v-for="b in brands"
                  :key="b.slug"
                  type="button"
                  class="brandopt"
                  :class="{ 'is-active': activeBrand === b.slug }"
                  @click="selectBrand(b.slug)"
                >
                  <span>{{ locale === 'en' ? b.nameEn || b.name : b.nameTh || b.name }}</span>
                  <small class="tiny faint">{{ locale === 'en' ? b.movementEn : b.movement }}</small>
                </button>
              </div>
            </div>

            <div class="filterbox">
              <h3 class="filterbox__title tiny upper">{{ t('products.sortBy') }}</h3>
              <select v-model="sort" class="select">
                <option value="featured">{{ t('products.sortFeatured') }}</option>
                <option value="price_asc">{{ t('products.sortPriceLow') }}</option>
                <option value="price_desc">{{ t('products.sortPriceHigh') }}</option>
                <option value="discount_percentage_desc">{{ t('products.sortDiscount') }}</option>
                <option value="newest">{{ t('products.sortNewest') }}</option>
              </select>
            </div>

            <div class="filterbox">
              <h3 class="filterbox__title tiny upper">{{ t('products.priceRange') }}</h3>
              <input v-model.number="priceMax" type="range" class="range" min="5000" max="500000" step="5000" />
              <div class="between small muted">
                <span>฿5,000</span>
                <span class="price">{{ formatPrice(priceMax, site.currencySymbol, localeTag) }}</span>
              </div>
            </div>

            <button type="button" class="link-underline" style="align-self: flex-start" @click="clearFilters">
              {{ t('common.cancel') }}
            </button>
          </aside>

          <!-- Product Grid -->
          <div class="shop__main">
            <div class="between shop__bar wrap gap-8">
              <p class="tiny upper muted">{{ t('products.results', { count: filteredItems.length }) }}</p>
              <p v-if="searchQuery" class="tiny upper muted">{{ t('common.search') }}: “{{ searchQuery }}”</p>
            </div>

            <div v-if="pending" class="grid grid--3">
              <div v-for="i in 6" :key="i" class="skeleton" />
            </div>

            <div v-else-if="!filteredItems.length" class="empty">
              <p class="serif empty__title">{{ t('products.empty') }}</p>
              <button type="button" class="link-underline" @click="clearFilters">{{ t('common.viewAll') }}</button>
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
.ph {
  background: #141311;
  color: #f7f4ee;
  padding-block: 64px 52px;
  border-bottom: 1px solid rgba(176, 141, 87, 0.25);
}
.ph__title { color: #f7f4ee; margin-top: 10px; }
.ph__sub { color: #beb6a7; margin-top: 10px; max-width: 560px; }

.cats { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 36px; }
.cats__btn {
  border: 1px solid var(--line-strong);
  background: var(--paper);
  padding: 9px 18px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-soft);
  transition: all 0.2s;
}
.cats__btn:hover { border-color: var(--ink); color: var(--ink); }
.cats__btn.is-active { background: var(--ink); border-color: var(--ink); color: #f7f4ee; }

.shop { display: grid; grid-template-columns: 256px 1fr; gap: 48px; }
.shop__side { position: sticky; top: calc(var(--header-h) + 24px); align-self: start; display: flex; flex-direction: column; gap: 26px; }
.filterbox { display: flex; flex-direction: column; gap: 10px; }
.filterbox__title { color: var(--ink-muted); }
.range { width: 100%; accent-color: var(--gold); }

.brandlist { display: flex; flex-direction: column; gap: 6px; }
.brandopt {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 9px 12px;
  border: 1px solid var(--line);
  background: var(--paper);
  font-size: 13px;
  color: var(--ink-soft);
  text-align: left;
  transition: all 0.18s;
}
.brandopt:hover { border-color: var(--gold); }
.brandopt.is-active { border-color: var(--ink); background: var(--ink); color: #f7f4ee; }
.brandopt.is-active small { color: var(--gold-soft); }

.shop__bar { margin-bottom: 22px; padding-bottom: 14px; border-bottom: 1px solid var(--line); }
.grid--3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }

.skeleton {
  aspect-ratio: 4 / 5;
  background: linear-gradient(90deg, #f3efe7 25%, #faf8f4 37%, #f3efe7 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }

.empty { text-align: center; padding: 80px 20px; }
.empty__title { font-size: 22px; margin-bottom: 16px; color: var(--ink-soft); }

@media (max-width: 1080px) { .grid--3 { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 860px) {
  .shop { grid-template-columns: 1fr; gap: 30px; }
  .shop__side { position: static; }
}
@media (max-width: 560px) { .grid--3 { grid-template-columns: 1fr; } }
</style>
