<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const reqFetch = useRequestFetch()

const slug = computed(() => String(route.params.slug || ''))
const selectedCat = ref('')
const searchQ = ref('')
const currentPage = ref(1)
const PAGE_SIZE = 36

watch(slug, () => {
  selectedCat.value = ''
  searchQ.value = ''
  currentPage.value = 1
})

watch([selectedCat, searchQ], () => {
  currentPage.value = 1
})

const { data: res } = await useAsyncData(
  () => `op-brand-${slug.value}`,
  async () => {
    const brandData = await reqFetch<any>(`/api/brands/${slug.value}`).catch(() => null)
    if (brandData?.brand) {
      return {
        brand: brandData.brand,
        products: brandData.products || [],
        subcategories: brandData.subcategories || []
      }
    }
    const prodData = await reqFetch<{ items?: any[]; products?: any[] }>(`/api/products?brand=${slug.value}&limit=500`)
    return {
      brand: null,
      products: prodData?.items || prodData?.products || [],
      subcategories: []
    }
  },
  { watch: [slug] }
)

const filteredProducts = computed(() => {
  let list = res.value?.products || []
  if (selectedCat.value) {
    list = list.filter((p: any) => p.categorySlug === selectedCat.value)
  }
  const q = searchQ.value.trim().toLowerCase()
  if (q) {
    list = list.filter((p: any) =>
      String(p.sku || '').toLowerCase().includes(q) ||
      String(p.nameEn || '').toLowerCase().includes(q) ||
      String(p.nameTh || p.name || '').toLowerCase().includes(q)
    )
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / PAGE_SIZE)))
const pagedProducts = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredProducts.value.slice(start, start + PAGE_SIZE)
})

const availableCategories = computed(() => {
  const all = res.value?.products || []
  const counts = new Map<string, { slug: string; labelTh: string; labelEn: string; count: number }>()
  for (const p of all) {
    const cs = p.categorySlug
    if (!cs) continue
    const cur = counts.get(cs)
    if (cur) {
      cur.count += 1
    } else {
      counts.set(cs, {
        slug: cs,
        labelTh: p.categoryName || cs,
        labelEn: p.categoryNameEn || cs,
        count: 1
      })
    }
  }
  return Array.from(counts.values())
})

const heroBanner = computed(() => {
  if (slug.value === 'ogival') return '/images/op/hero-ceramic-dark.jpg'
  if (slug.value === 'opwatch') return '/images/op/hero-gold-stones.jpg'
  return '/images/op/banner-899832ags.jpg'
})

const brandTitle = computed(() => {
  const b = res.value?.brand
  if (!b) return slug.value.toUpperCase()
  return locale.value === 'en' && b.nameEn ? b.nameEn : b.nameTh || b.nameEn || b.name
})

const brandStory = computed(() => {
  const b = res.value?.brand
  if (!b) return ''
  return locale.value === 'en' && (b.storyEn || b.descriptionEn)
    ? b.storyEn || b.descriptionEn
    : b.story || b.descriptionTh || b.storyEn || b.descriptionEn || ''
})

function goPage(p: number) {
  currentPage.value = Math.max(1, Math.min(totalPages.value, p))
  if (import.meta.client) {
    window.scrollTo({ top: 380, behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="op-brand">
    <section class="op-brand__hero">
      <img :src="heroBanner" :alt="brandTitle" class="op-brand__img" />
      <div class="op-brand__scrim" />
      <div class="container op-brand__body">
        <OpCrest size="sm" stacked theme="dark" :sublabel="res?.brand?.countryEn || 'THAILAND OFFICIAL BOUTIQUE'" />
        <h1 class="page-title">{{ brandTitle }}</h1>
        <p v-if="brandStory">{{ brandStory }}</p>
      </div>
    </section>

    <section class="section section--pearl">
      <div class="container">
        <!-- Brand Category & Model Reference Filter -->
        <div class="op-brand__toolbar">
          <div class="op-brand__pills">
            <button
              type="button"
              class="op-brand__pill"
              :class="{ 'is-active': !selectedCat }"
              @click="selectedCat = ''"
            >
              {{ locale === 'th' ? `ทุกรุ่น (${res?.products?.length || 0})` : `All (${res?.products?.length || 0})` }}
            </button>
            <button
              v-for="cat in availableCategories"
              :key="cat.slug"
              type="button"
              class="op-brand__pill"
              :class="{ 'is-active': selectedCat === cat.slug }"
              @click="selectedCat = cat.slug"
            >
              {{ locale === 'en' ? cat.labelEn : cat.labelTh }} ({{ cat.count }})
            </button>
          </div>

          <input
            v-model="searchQ"
            type="search"
            class="input op-brand__search"
            :placeholder="locale === 'th' ? 'ค้นหารหัสรุ่น เช่น 899832 / 3365...' : 'Filter by model / SKU...'"
          />
        </div>

        <div class="between wrap gap-12" style="margin-bottom: 28px">
          <p class="tiny muted">
            {{
              locale === 'th'
                ? `แสดง ${pagedProducts.length} จากทั้งหมด ${filteredProducts.length} เรือนเวลาของแท้ · รับประกันศูนย์ไทย`
                : `SHOWING ${pagedProducts.length} OF ${filteredProducts.length} OFFICIAL TIMEPIECES`
            }}
          </p>
          <NuxtLink :to="localePath('/products')" class="link-underline">
            {{ locale === 'th' ? 'ดูครบทุกแบรนด์ในบูติกประเทศไทย' : 'All Thailand Boutique Collections' }}
          </NuxtLink>
        </div>

        <div v-if="pagedProducts.length" class="op-brand__grid">
          <ProductCard v-for="p in pagedProducts" :key="p.id || p.slug" :product="p" />
        </div>

        <nav v-if="totalPages > 1" class="op-brand__pager" aria-label="Brand pagination">
          <button
            type="button"
            class="btn btn--ghost btn--sm"
            :disabled="currentPage <= 1"
            @click="goPage(currentPage - 1)"
          >
            ‹ {{ locale === 'th' ? 'ก่อนหน้า' : 'Prev' }}
          </button>
          <span class="tiny muted" style="padding-inline: 14px">
            {{ locale === 'th' ? `หน้า ${currentPage} / ${totalPages}` : `Page ${currentPage} / ${totalPages}` }}
          </span>
          <button
            type="button"
            class="btn btn--ghost btn--sm"
            :disabled="currentPage >= totalPages"
            @click="goPage(currentPage + 1)"
          >
            {{ locale === 'th' ? 'ถัดไป' : 'Next' }} ›
          </button>
        </nav>
      </div>
    </section>
  </div>
</template>

<style scoped>
.op-brand__hero {
  position: relative;
  min-height: 54vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--ink);
  color: #ffffff;
  padding-top: var(--header-h);
  overflow: hidden;
}
.op-brand__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.48;
}
.op-brand__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 22, 54, 0.58) 0%, rgba(20, 22, 54, 0.86) 100%);
}
.op-brand__body {
  position: relative;
  z-index: 2;
  padding-block: 68px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.op-brand__body h1 { color: #ffffff; }
.op-brand__body p {
  max-width: 720px;
  font-family: var(--font-display);
  font-size: 19px;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.8;
}

.op-brand__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line);
}
.op-brand__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.op-brand__pill {
  padding: 8px 16px;
  border: 1px solid var(--line-strong);
  background: #ffffff;
  color: var(--ink);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s var(--ease);
}
.op-brand__pill.is-active {
  background: var(--sapphire);
  border-color: var(--sapphire);
  color: #ffffff;
}
.op-brand__search {
  max-width: 260px;
  background: #ffffff;
}

.op-brand__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
}
.op-brand__pager {
  margin-top: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
@media (max-width: 960px) {
  .op-brand__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 580px) {
  .op-brand__grid { grid-template-columns: 1fr; }
  .op-brand__search { max-width: 100%; width: 100%; }
}
</style>
