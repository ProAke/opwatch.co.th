<script setup lang="ts">
const route = useRoute()
const { locale } = useI18n()
const localePath = useLocalePath()
const reqFetch = useRequestFetch()

const SYSTEM_SLUG_BY_PATH: Record<string, string> = {
  '/': 'site-home',
  '/about': 'site-about',
  '/services': 'site-services',
  '/branches': 'site-branches',
  '/contact': 'site-contact'
}

const cleanPath = computed(() => route.path.replace(/^\/en(\/|$)/, '/').replace(/\/+$/, '') || '/')
const matchedSlug = computed(() => SYSTEM_SLUG_BY_PATH[cleanPath.value] || '')

const { data } = await useAsyncData(
  () => `cms-sys-${matchedSlug.value || 'none'}`,
  async () => {
    if (!matchedSlug.value) return null
    return await reqFetch<any>(`/api/pages/${matchedSlug.value}`).catch(() => null)
  },
  { watch: [matchedSlug] }
)

const cmsPage = computed(() => data.value?.page || null)
const relatedProducts = computed<any[]>(() => data.value?.relatedProducts || [])

useHead(() => {
  const p = cmsPage.value
  if (!p) return {}
  return {
    ...(p.seoTitle ? { title: p.seoTitle } : {}),
    meta: [
      ...(p.seoDescription ? [{ name: 'description', content: p.seoDescription }] : []),
      ...(p.seoKeywords ? [{ name: 'keywords', content: p.seoKeywords }] : [])
    ]
  }
})
</script>

<template>
  <section
    v-if="cmsPage && (cleanPath !== '/' && relatedProducts.length)"
    class="section section--pearl"
    :style="cmsPage.styleConfig?.fontFamily ? { fontFamily: `'${cmsPage.styleConfig.fontFamily}', sans-serif` } : undefined"
  >
    <div class="container">
      <div style="margin-bottom:20px">
        <span class="eyebrow" :style="{ color: cmsPage.styleConfig?.accentColor || '#1d2088' }">
          {{ cmsPage.heroEyebrow || 'RECOMMENDED TIMEPIECES' }}
        </span>
        <h2 style="margin:4px 0 0;font-size:24px;color:#141936">
          {{ locale === 'th' ? 'เรือนเวลาแนะนำประจำหน้านี้' : 'Featured Timepieces' }}
        </h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:18px">
        <ProductCard v-for="pr in relatedProducts.slice(0, 4)" :key="pr.id || pr.slug" :product="pr" />
      </div>
      <div v-if="cmsPage.ctaText && cmsPage.ctaUrl" style="margin-top:20px;text-align:center">
        <NuxtLink :to="localePath(cmsPage.ctaUrl)" class="btn">
          {{ cmsPage.ctaText }} →
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
