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
        subcategories: brandData.subcategories || [],
        brandGate: brandData.brandGate || null,
        seriesStories: brandData.seriesStories || [],
        gateFeaturedProducts: brandData.gateFeaturedProducts || []
      }
    }
    const prodData = await reqFetch<{ items?: any[]; products?: any[] }>(`/api/products?brand=${slug.value}&limit=500`)
    return {
      brand: null,
      products: prodData?.items || prodData?.products || [],
      subcategories: [],
      brandGate: null,
      seriesStories: [],
      gateFeaturedProducts: []
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

const brandGate = computed(() => res.value?.brandGate || null)
const seriesStories = computed<any[]>(() => res.value?.seriesStories || [])

const heroBanner = computed(() => {
  if (brandGate.value?.banner) return brandGate.value.banner
  if (slug.value === 'ogival') return '/images/op/hero-ceramic-dark.jpg'
  if (slug.value === 'olympia-star' || slug.value === 'opwatch') return '/images/op/hero-gold-stones.jpg'
  return '/images/op/banner-899832ags.jpg'
})

const brandLogo = computed(() => {
  if (res.value?.brand?.logo) return res.value.brand.logo
  if (slug.value === 'ogival') return '/images/logos/ogival.jpg'
  if (slug.value === 'olympia-star' || slug.value === 'opwatch') return '/images/logos/olympia-star.jpg'
  return '/images/logos/olym-pianus.jpg'
})

const brandTitle = computed(() => {
  if (brandGate.value) {
    return locale.value === 'en' && brandGate.value.titleEn
      ? brandGate.value.titleEn
      : brandGate.value.titleTh || brandGate.value.title
  }
  const b = res.value?.brand
  if (!b) return slug.value.toUpperCase()
  return locale.value === 'en' && b.nameEn ? b.nameEn : b.nameTh || b.nameEn || b.name
})

const brandStory = computed(() => {
  if (brandGate.value?.summary) return brandGate.value.summary
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
  <div
    class="op-brand"
    :style="brandGate?.styleConfig?.fontFamily ? { fontFamily: `'${brandGate.styleConfig.fontFamily}', sans-serif` } : undefined"
  >
    <section class="op-brand__hero">
      <img :src="heroBanner" :alt="brandTitle" class="op-brand__img" />
      <div class="op-brand__scrim" />
      <div class="container op-brand__body">
        <div class="op-brand__logo-badge">
          <img :src="brandLogo" :alt="brandTitle" class="op-brand__logo-img" />
        </div>
        <span v-if="brandGate?.heroEyebrow" style="display:block;font-size:11.5px;letter-spacing:0.1em;color:#f3d689;font-weight:700;margin-bottom:6px">
          {{ brandGate.heroEyebrow }}
        </span>
        <h1 class="page-title" :style="brandGate?.styleConfig?.headingColor ? { color: brandGate.styleConfig.headingColor } : undefined">
          {{ brandTitle }}
        </h1>
        <p v-if="brandStory">{{ brandStory }}</p>
      </div>
    </section>

    <!-- Brand Gate Pavilion & Series Stories Showcase (`หน้ากั้นสำหรับแบรนด์สินค้า` + `มี story ประจำซีรีส์`) -->
    <section v-if="brandGate?.contentTh || seriesStories.length" class="section" style="background:#ffffff;border-bottom:1px solid #eceff6">
      <div class="container">
        <div v-if="brandGate?.contentTh" class="brand-gate-prose" v-html="locale === 'en' && brandGate.contentEn ? brandGate.contentEn : brandGate.contentTh" />

        <div v-if="seriesStories.length" style="margin-top:26px">
          <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:18px">
            <div>
              <span class="eyebrow" style="color:#1d2088">SIGNATURE SERIES STORIES</span>
              <h2 style="margin:4px 0 0;font-size:clamp(20px,2.8vw,28px);color:#141936">
                {{ locale === 'th' ? 'เจาะลึกเรื่องราวประจำซีรีส์ยอดนิยม' : 'Explore Signature Series Stories' }}
              </h2>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px">
            <NuxtLink
              v-for="st in seriesStories"
              :key="st.id || st.slug"
              :to="localePath(`/pages/${st.slug}`)"
              style="display:flex;flex-direction:column;border-radius:16px;overflow:hidden;border:1px solid #e4e8f3;background:#fbfcfe;text-decoration:none;color:inherit;box-shadow:0 8px 24px rgba(18,25,60,0.05)"
            >
              <img :src="st.banner || heroBanner" :alt="st.titleTh" style="width:100%;height:175px;object-fit:cover" loading="lazy" />
              <div style="padding:16px 18px;display:flex;flex-direction:column;gap:6px;flex:1">
                <span style="font-size:11px;font-weight:700;letter-spacing:0.06em;color:#1d2088">{{ st.heroEyebrow || 'SERIES STORY' }}</span>
                <h3 style="margin:0;font-size:17px;color:#141936">{{ locale === 'en' && st.titleEn ? st.titleEn : st.titleTh || st.title }}</h3>
                <p style="margin:0;font-size:13.5px;color:#64748b;line-height:1.55">{{ st.summary }}</p>
                <span style="margin-top:auto;padding-top:8px;font-size:13px;font-weight:600;color:#1d2088">
                  {{ locale === 'th' ? 'อ่าน Story ซีรีส์และชมรุ่นที่เกี่ยวข้อง →' : 'Read Story & Shop Series →' }}
                </span>
              </div>
            </NuxtLink>
          </div>
        </div>
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
.op-brand__logo-badge {
  background: #ffffff;
  padding: 12px 24px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.op-brand__logo-img {
  height: 76px;
  width: auto;
  max-width: 190px;
  object-fit: contain;
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
