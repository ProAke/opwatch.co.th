<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { site } = useSite()

const slug = computed(() => String(route.params.slug))

const { data, error } = await useFetch<{
  brand: Record<string, any>
  products: Record<string, any>[]
  subcategories: Record<string, any>[]
  campaigns: Record<string, any>[]
}>(() => `/api/brands/${slug.value}`, { key: 'brand-' + slug.value })

const brand = computed(() => data.value?.brand)
const products = computed(() =>
  (data.value?.products || []).map((p) => ({
    ...p,
    brand: brand.value
  }))
)
const subcategories = computed(() => data.value?.subcategories || [])

if (error.value || !brand.value) {
  setResponseStatus(404)
}

const activeCatId = ref<number | null>(null)
const filteredProducts = computed(() => {
  if (!activeCatId.value) return products.value
  return products.value.filter((p) => Number(p.categoryId) === activeCatId.value)
})

const brandName = computed(() => {
  const b = brand.value
  if (!b) return ''
  return locale.value === 'en' ? b.nameEn || b.name : b.nameTh || b.name
})

useHead(() => ({
  title: brandName.value ? `${brandName.value} — ${site.value.name}` : site.value.name
}))
</script>

<template>
  <div v-if="error || !brand">
    <section class="section">
      <div class="container center">
        <p class="eyebrow" style="justify-content: center">404</p>
        <h1 class="page-title" style="margin: 16px 0 14px">{{ t('errors.notFound') }}</h1>
        <NuxtLink :to="localePath('/products')" class="btn">{{ t('products.backToCollections') }}</NuxtLink>
      </div>
    </section>
  </div>

  <div v-else>
    <!-- Brand Hero Banner -->
    <section class="bhero">
      <div class="bhero__bg">
        <img :src="brand.heroImage || '/images/hero-watch.jpg'" :alt="brandName" />
      </div>
      <div class="container bhero__inner">
        <p class="eyebrow" style="color: var(--gold-soft)">
          {{ locale === 'en' ? brand.countryEn || brand.country : brand.country }} · {{ locale === 'en' ? brand.movementEn || brand.movement : brand.movement }}
        </p>
        <h1 class="bhero__title">{{ brandName }}</h1>
        <p class="bhero__tagline serif">{{ locale === 'en' ? brand.taglineEn || brand.tagline : brand.tagline }}</p>
        <p class="bhero__story">{{ locale === 'en' ? brand.storyEn || brand.story : brand.story }}</p>
      </div>
    </section>

    <!-- Brand Products -->
    <section class="section">
      <div class="container">
        <div v-if="subcategories.length" class="cats">
          <button
            type="button"
            class="cats__btn"
            :class="{ 'is-active': activeCatId === null }"
            @click="activeCatId = null"
          >
            {{ t('common.all') }} ({{ products.length }})
          </button>
          <button
            v-for="sc in subcategories"
            :key="sc.id"
            type="button"
            class="cats__btn"
            :class="{ 'is-active': activeCatId === Number(sc.id) }"
            @click="activeCatId = Number(sc.id)"
          >
            {{ locale === 'en' ? sc.nameEn || sc.name : sc.nameTh || sc.name }}
          </button>
        </div>

        <div class="grid-3">
          <ProductCard v-for="p in filteredProducts" :key="p.id" :product="p" />
        </div>

        <div class="center" style="margin-top: 52px">
          <NuxtLink :to="localePath('/products')" class="link-underline">
            ← {{ t('products.backToCollections') }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.bhero {
  position: relative;
  min-height: 440px;
  display: flex;
  align-items: center;
  background: #121110;
  color: #f7f4ee;
  overflow: hidden;
}
.bhero__bg { position: absolute; inset: 0; }
.bhero__bg img { width: 100%; height: 100%; object-fit: cover; opacity: 0.42; }
.bhero__bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(14, 13, 12, 0.92) 0%, rgba(14, 13, 12, 0.58) 60%, rgba(14, 13, 12, 0.3) 100%);
}
.bhero__inner { position: relative; z-index: 2; padding-block: 72px; max-width: 720px; }
.bhero__title {
  font-family: var(--font-roman);
  font-size: clamp(2.4rem, 5vw, 4rem);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin: 14px 0 8px;
}
.bhero__tagline { font-size: 22px; color: var(--gold-soft); margin-bottom: 16px; }
.bhero__story { color: #d5cdbe; line-height: 1.85; font-size: 15.5px; }

.cats { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 38px; justify-content: center; }
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
.cats__btn.is-active, .cats__btn:hover { background: var(--ink); border-color: var(--ink); color: #f7f4ee; }

.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
@media (max-width: 980px) { .grid-3 { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 580px) { .grid-3 { grid-template-columns: 1fr; } }
</style>
