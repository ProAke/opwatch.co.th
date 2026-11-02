<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const reqFetch = useRequestFetch()

const slug = computed(() => String(route.params.slug || ''))

const { data: res } = await useAsyncData(
  () => `op-brand-${slug.value}`,
  async () => {
    const [brandData, prodData] = await Promise.all([
      reqFetch<any>(`/api/brands/${slug.value}`).catch(() => null),
      reqFetch<{ items?: any[]; products?: any[] }>(`/api/products?brand=${slug.value}&limit=48`)
    ])
    return {
      brand: brandData?.brand || brandData,
      products: prodData?.items || prodData?.products || []
    }
  },
  { watch: [slug] }
)

const heroBanner = computed(() => {
  if (slug.value === 'ogival') return '/images/op/hero-gold-stones.jpg'
  if (slug.value === 'opwatch') return '/images/op/hero-diver-dark.jpg'
  return '/images/op/hero-ceramic-dark.jpg'
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
</script>

<template>
  <div class="op-brand">
    <section class="op-brand__hero">
      <img :src="heroBanner" :alt="brandTitle" class="op-brand__img" />
      <div class="op-brand__scrim" />
      <div class="container op-brand__body">
        <OpCrest size="sm" stacked theme="dark" :sublabel="res?.brand?.origin || 'OFFICIAL HOUSE'" />
        <h1 class="page-title">{{ brandTitle }}</h1>
        <p v-if="brandStory">{{ brandStory }}</p>
      </div>
    </section>

    <section class="section section--pearl">
      <div class="container">
        <div class="between wrap gap-12" style="margin-bottom: 36px">
          <p class="tiny muted">{{ res?.products?.length || 0 }} TIMEPIECES</p>
          <NuxtLink :to="localePath('/products')" class="link-underline">
            {{ locale === 'th' ? 'ดูครบทั้ง 3 แบรนด์' : 'All Boutique Collections' }}
          </NuxtLink>
        </div>

        <div v-if="res?.products?.length" class="op-brand__grid">
          <ProductCard v-for="p in res.products" :key="p.id || p.slug" :product="p" />
        </div>
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
  max-width: 680px;
  font-family: var(--font-display);
  font-size: 19px;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.8;
}
.op-brand__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
}
@media (max-width: 960px) {
  .op-brand__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 580px) {
  .op-brand__grid { grid-template-columns: 1fr; }
}
</style>
