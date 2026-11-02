<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()
const reqFetch = useRequestFetch()

const PAGE_SIZE = 36
const selectedBrand = ref((route.query.brand as string) || '')
const selectedCategory = ref((route.query.category as string) || '')
const selectedSort = ref((route.query.sort as string) || 'featured')
const searchInput = ref((route.query.q as string) || '')
const currentPage = ref(Math.max(1, Number(route.query.page) || 1))

watch(
  () => route.query,
  (q) => {
    selectedBrand.value = (q.brand as string) || ''
    selectedCategory.value = (q.category as string) || ''
    selectedSort.value = (q.sort as string) || 'featured'
    searchInput.value = (q.q as string) || ''
    currentPage.value = Math.max(1, Number(q.page) || 1)
  }
)

const apiUrl = computed(() => {
  const params = new URLSearchParams()
  if (selectedBrand.value) params.set('brand', selectedBrand.value)
  if (selectedCategory.value) params.set('category', selectedCategory.value)
  if (selectedSort.value) params.set('sort', selectedSort.value)
  if (searchInput.value.trim()) params.set('q', searchInput.value.trim())
  params.set('page', String(currentPage.value))
  params.set('limit', String(PAGE_SIZE))
  return `/api/products?${params.toString()}`
})

const [{ data: prodRes, pending }, { data: metaRes }] = await Promise.all([
  useFetch<{ items?: any[]; products?: any[]; total?: number; totalPages?: number; page?: number }>(apiUrl, { watch: [apiUrl] }),
  useAsyncData('op-catalog-meta', async () => {
    const [b, c] = await Promise.all([
      reqFetch<{ items?: any[]; brands?: any[] }>('/api/brands'),
      reqFetch<{ items?: any[]; categories?: any[] }>('/api/categories')
    ])
    return {
      brands: b?.items || b?.brands || [],
      categories: c?.items || c?.categories || []
    }
  })
])

const products = computed(() => prodRes.value?.items || prodRes.value?.products || [])
const totalCount = computed(() => Number(prodRes.value?.total ?? products.value.length))
const totalPages = computed(() => Math.max(1, Number(prodRes.value?.totalPages || Math.ceil(totalCount.value / PAGE_SIZE) || 1)))
const brands = computed(() => metaRes.value?.brands || [])
const categories = computed(() => metaRes.value?.categories || [])

const visiblePages = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  const pages: number[] = []
  const start = Math.max(1, cur - 2)
  const end = Math.min(total, start + 4)
  for (let i = Math.max(1, end - 4); i <= end; i++) pages.push(i)
  return pages
})

function applyFilter(patch: Record<string, string>) {
  const next: Record<string, string> = {
    ...(selectedBrand.value ? { brand: selectedBrand.value } : {}),
    ...(selectedCategory.value ? { category: selectedCategory.value } : {}),
    ...(selectedSort.value && selectedSort.value !== 'featured' ? { sort: selectedSort.value } : {}),
    ...(searchInput.value.trim() ? { q: searchInput.value.trim() } : {}),
    ...patch
  }
  if (!('page' in patch)) {
    delete next.page
  }
  Object.keys(next).forEach((k) => {
    if (!next[k] || (k === 'page' && next[k] === '1')) delete next[k]
  })
  router.push({ path: localePath('/products'), query: next })
}

function goToPage(p: number) {
  const target = Math.max(1, Math.min(totalPages.value, p))
  applyFilter({ page: String(target) })
  if (import.meta.client) {
    window.scrollTo({ top: 360, behavior: 'smooth' })
  }
}

function resetAll() {
  searchInput.value = ''
  router.push({ path: localePath('/products') })
}
</script>

<template>
  <div class="op-cat">
    <!-- Collections Banner -->
    <section class="op-cat__hero">
      <img src="/images/op/lifestyle-men.jpg" alt="Olym Pianus Collections" class="op-cat__hero-img" />
      <div class="op-cat__hero-scrim" />
      <div class="container op-cat__hero-body">
        <span class="op-cat__eyebrow">OLYM PIANUS · OPWATCH · OGIVAL</span>
        <h1 class="page-title">Collections</h1>
        <p>
          {{
            locale === 'th'
              ? 'สำรวจคอลเลกชันเรือนเวลาแท้กระจกแซฟไฟร์จากทั้ง 3 แบรนด์ในเครือ พร้อมสั่งซื้อออนไลน์ได้ทันที'
              : 'Explore authentic sapphire-crystal timepieces across our Men, Ladies, Sport, Classic & Limited series.'
          }}
        </p>
      </div>
    </section>

    <!-- Sticky Boutique Filter Bar (#ffffff + #ebebf1 + Royal Sapphire #1d2088 active pill) -->
    <section class="op-cat__toolbar">
      <div class="container op-cat__toolbar-inner">
        <!-- Brand Tabs -->
        <div class="op-cat__pills">
          <button
            type="button"
            class="op-cat__pill"
            :class="{ 'is-active': !selectedBrand }"
            @click="applyFilter({ brand: '' })"
          >
            {{ locale === 'th' ? 'ทุกแบรนด์' : 'All Houses' }}
          </button>
          <button
            v-for="b in brands"
            :key="b.slug"
            type="button"
            class="op-cat__pill"
            :class="{ 'is-active': selectedBrand === b.slug }"
            @click="applyFilter({ brand: b.slug })"
          >
            {{ locale === 'en' && b.nameEn ? b.nameEn : b.nameTh || b.nameEn || b.slug }}
          </button>
        </div>

        <!-- Category + Sort + Search -->
        <div class="op-cat__controls">
          <select
            class="select op-cat__select"
            :value="selectedCategory"
            @change="applyFilter({ category: ($event.target as HTMLSelectElement).value })"
          >
            <option value="">{{ t('common.all') }} ({{ locale === 'th' ? 'หมวดหมู่' : 'Categories' }})</option>
            <option v-for="c in categories" :key="c.slug" :value="c.slug">
              {{ c.parentId ? '— ' : '' }}{{ locale === 'en' && c.nameEn ? c.nameEn : c.nameTh || c.nameEn }}
            </option>
          </select>

          <select
            class="select op-cat__select"
            :value="selectedSort"
            @change="applyFilter({ sort: ($event.target as HTMLSelectElement).value })"
          >
            <option value="featured">{{ t('products.sortFeatured') }}</option>
            <option value="newest">{{ t('products.sortNewest') }}</option>
            <option value="price_asc">{{ t('products.sortPriceLow') }}</option>
            <option value="price_desc">{{ t('products.sortPriceHigh') }}</option>
          </select>

          <form class="op-cat__search" @submit.prevent="applyFilter({ q: searchInput })">
            <input
              v-model="searchInput"
              type="search"
              class="input op-cat__search-in"
              :placeholder="locale === 'th' ? 'ค้นหารุ่น / รหัส...' : 'Search model / SKU...'"
            />
          </form>
        </div>
      </div>
    </section>

    <!-- 3-Column Studio Cutout Gallery on #f8f8f8 (main_color) -->
    <section class="section section--pearl">
      <div class="container">
        <div class="between wrap gap-12 op-cat__count">
          <p class="tiny muted">
            {{
              locale === 'th'
                ? `ทั้งหมด ${totalCount} เรือนเวลาของแท้ (หน้า ${currentPage} / ${totalPages}) · จัดส่งเฉพาะในประเทศไทย`
                : `${totalCount} AUTHENTIC TIMEPIECES (PAGE ${currentPage} OF ${totalPages}) · THAILAND ONLY`
            }}
          </p>
          <button
            v-if="selectedBrand || selectedCategory || searchInput"
            type="button"
            class="link-underline"
            @click="resetAll"
          >
            {{ locale === 'th' ? 'ล้างตัวกรองทั้งหมด' : 'Clear Filters' }}
          </button>
        </div>

        <div v-if="pending" class="center py-60">
          <span class="spinner" />
        </div>

        <template v-else-if="products.length">
          <div class="op-cat__grid">
            <ProductCard v-for="p in products" :key="p.id || p.slug" :product="p" />
          </div>

          <nav v-if="totalPages > 1" class="op-cat__pager" aria-label="Catalog pagination">
            <button
              type="button"
              class="btn btn--ghost btn--sm"
              :disabled="currentPage <= 1"
              @click="goToPage(currentPage - 1)"
            >
              ‹ {{ locale === 'th' ? 'ก่อนหน้า' : 'Prev' }}
            </button>

            <button
              v-for="pNum in visiblePages"
              :key="pNum"
              type="button"
              class="op-cat__page-btn"
              :class="{ 'is-active': pNum === currentPage }"
              @click="goToPage(pNum)"
            >
              {{ pNum }}
            </button>

            <button
              type="button"
              class="btn btn--ghost btn--sm"
              :disabled="currentPage >= totalPages"
              @click="goToPage(currentPage + 1)"
            >
              {{ locale === 'th' ? 'ถัดไป' : 'Next' }} ›
            </button>
          </nav>
        </template>

        <div v-else class="op-cat__empty">
          <h3>{{ t('products.empty') }}</h3>
          <button type="button" class="btn btn--ghost btn--sm" @click="resetAll">
            {{ locale === 'th' ? 'แสดงเรือนเวลาทั้งหมด' : 'View All Watches' }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.op-cat__hero {
  position: relative;
  min-height: 48vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--ink);
  color: #ffffff;
  padding-top: var(--header-h);
  overflow: hidden;
}
.op-cat__hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5;
}
.op-cat__hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 22, 54, 0.56) 0%, rgba(20, 22, 54, 0.85) 100%);
}
.op-cat__hero-body {
  position: relative;
  z-index: 2;
  padding-block: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.op-cat__eyebrow {
  font-family: var(--font-roman);
  font-size: 11px;
  letter-spacing: 0.3em;
  color: var(--champagne-soft);
}
.op-cat__hero-body h1 { color: #ffffff; }
.op-cat__hero-body p {
  max-width: 620px;
  font-family: var(--font-display);
  font-size: 18.5px;
  color: rgba(255, 255, 255, 0.88);
}

.op-cat__toolbar {
  background: #ffffff;
  border-bottom: 1px solid var(--line-strong);
  padding-block: 16px;
  position: sticky;
  top: var(--header-h);
  z-index: 25;
}
.op-cat__toolbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.op-cat__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.op-cat__pill {
  padding: 9px 20px;
  border: 1px solid var(--line-strong);
  background: #ffffff;
  font-family: var(--font-roman);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-soft);
  transition: all 0.2s;
}
.op-cat__pill:hover {
  border-color: var(--sapphire);
  color: var(--sapphire);
}
.op-cat__pill.is-active {
  background: var(--sapphire);
  border-color: var(--sapphire);
  color: #ffffff;
}
.op-cat__controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.op-cat__select {
  width: auto;
  min-width: 168px;
  padding-block: 9px;
  font-size: 13.5px;
}
.op-cat__search-in {
  width: 210px;
  padding-block: 9px;
  font-size: 13.5px;
}

.op-cat__count { margin-bottom: 30px; }
.op-cat__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
}
.op-cat__empty {
  padding: 72px 20px;
  text-align: center;
  background: #ffffff;
  border: 1px solid var(--sand);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.op-cat__pager {
  margin-top: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}
.op-cat__page-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--line-strong);
  background: #ffffff;
  color: var(--ink);
  font-family: var(--font-roman);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s var(--ease);
}
.op-cat__page-btn:hover {
  border-color: var(--sapphire);
  color: var(--sapphire);
}
.op-cat__page-btn.is-active {
  background: var(--sapphire);
  border-color: var(--sapphire);
  color: #ffffff;
}
.py-60 { padding-block: 60px; }

@media (max-width: 960px) {
  .op-cat__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 580px) {
  .op-cat__grid { grid-template-columns: 1fr; }
}
</style>
