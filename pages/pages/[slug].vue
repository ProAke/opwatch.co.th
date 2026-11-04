<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const reqFetch = useRequestFetch()

const slug = computed(() => String(route.params.slug || ''))
const { data: res, error } = await useAsyncData(
  () => `op-cms-page-${slug.value}`,
  () => reqFetch<any>(`/api/pages/${slug.value}`),
  { watch: [slug] }
)

const page = computed(() => res.value?.page || null)
const parent = computed(() => res.value?.parent || null)
const children = computed<any[]>(() => res.value?.children || [])
const siblings = computed<any[]>(() => res.value?.siblings || [])
const relatedProducts = computed<any[]>(() => res.value?.relatedProducts || [])

const title = computed(() =>
  locale.value === 'en' && page.value?.titleEn
    ? page.value.titleEn
    : page.value?.titleTh || page.value?.title || ''
)
const summary = computed(() =>
  locale.value === 'en' && page.value?.summaryEn
    ? page.value.summaryEn
    : page.value?.summary || page.value?.excerptTh || ''
)
const bodyHtml = computed(() =>
  locale.value === 'en' && page.value?.contentEn
    ? page.value.contentEn
    : page.value?.contentTh || ''
)
const faqs = computed(() =>
  Array.isArray(page.value?.aseoFaqs) ? page.value.aseoFaqs.filter((f: any) => f.q && f.a) : []
)
const gallery = computed<string[]>(() =>
  Array.isArray(page.value?.gallery) ? page.value.gallery.filter(Boolean) : []
)

const styleCfg = computed(() => ({
  fontFamily: page.value?.styleConfig?.fontFamily || 'Prompt',
  headingColor: page.value?.styleConfig?.headingColor || '#ffffff',
  textColor: page.value?.styleConfig?.textColor || '#1e2438',
  accentColor: page.value?.styleConfig?.accentColor || '#1d2088',
  bgColor: page.value?.styleConfig?.bgColor || '#0f1636',
  overlayOpacity: page.value?.styleConfig?.overlayOpacity ?? 0.58,
  headingSize: page.value?.styleConfig?.headingSize || 'xl'
}))

const heroStyle = computed(() => {
  const banner = page.value?.banner || '/images/op/hero-diver-dark.jpg'
  const op = Number(styleCfg.value.overlayOpacity)
  return {
    backgroundColor: styleCfg.value.bgColor,
    backgroundImage: `linear-gradient(135deg, rgba(10,15,38,${op}), rgba(20,25,64,${op})), url('${banner}')`,
    fontFamily: `'${styleCfg.value.fontFamily}', sans-serif`
  }
})

const isLegalPage = computed(() => page.value?.pageType === 'legal' || page.value?.category === 'legal')

const policyLinks = [
  { slug: 'privacy-policy', th: 'นโยบายความเป็นส่วนตัว (PDPA)', en: 'Privacy Policy' },
  { slug: 'cookie-policy', th: 'นโยบายคุกกี้', en: 'Cookie Policy' },
  { slug: 'terms-conditions', th: 'ข้อตกลงและเงื่อนไข', en: 'Terms & Conditions' },
  { slug: 'return-policy', th: 'นโยบายการเปลี่ยนและคืนสินค้า', en: 'Return & Exchange Policy' },
  { slug: 'warranty-authenticity', th: 'การรับประกันสินค้าของแท้ศูนย์ไทย', en: 'Authenticity & Warranty' }
]

const navPeers = computed(() => {
  if (siblings.value.length) return siblings.value
  if (isLegalPage.value) {
    return policyLinks.map((l) => ({ slug: l.slug, titleTh: l.th, titleEn: l.en, routePath: `/pages/${l.slug}` }))
  }
  return []
})

useHead(() => {
  const p = page.value
  const faqSchema = faqs.value.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.value.map((f: any) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a }
        }))
      }
    : null

  return {
    title: p?.seoTitle || (title.value ? `${title.value} — OPWatch Thailand` : 'OPWatch Thailand'),
    meta: [
      { name: 'description', content: p?.seoDescription || summary.value || '' },
      ...(p?.seoKeywords ? [{ name: 'keywords', content: p.seoKeywords }] : [])
    ],
    script: faqSchema
      ? [{ type: 'application/ld+json', innerHTML: JSON.stringify(faqSchema) }]
      : []
  }
})
</script>

<template>
  <div
    class="op-cms"
    :style="{
      fontFamily: `'${styleCfg.fontFamily}', sans-serif`,
      '--cms-accent': styleCfg.accentColor,
      '--cms-text': styleCfg.textColor
    }"
  >
    <div v-if="error || !page" class="container section center" style="padding-top:140px">
      <h1>ไม่พบหน้าข้อมูลที่คุณต้องการ</h1>
      <NuxtLink :to="localePath('/')" class="btn" style="margin-top:18px">กลับหน้าแรก</NuxtLink>
    </div>

    <template v-else>
      <!-- Dynamic Hero (Customized per page in Tree CMS) -->
      <section class="op-cms__hero" :style="heroStyle">
        <div class="container">
          <!-- Parent Breadcrumb -->
          <div v-if="parent" class="op-cms__crumb">
            <NuxtLink :to="localePath(parent.routePath || `/pages/${parent.slug}`)">
              ← {{ locale === 'en' && parent.titleEn ? parent.titleEn : parent.titleTh }}
            </NuxtLink>
          </div>

          <span class="eyebrow op-cms__eyebrow">
            {{ page.heroEyebrow || 'OFFICIAL STORY & INFORMATION · INTER TIMES CO., LTD.' }}
          </span>
          <h1
            :class="`size-${styleCfg.headingSize}`"
            :style="{ color: styleCfg.headingColor }"
          >
            {{ title }}
          </h1>
          <p v-if="summary" class="op-cms__lead">{{ summary }}</p>

          <div v-if="page.ctaText && page.ctaUrl" style="margin-top:20px">
            <NuxtLink
              :to="localePath(page.ctaUrl)"
              class="op-cms__cta"
              :style="{ background: styleCfg.accentColor }"
            >
              {{ page.ctaText }} →
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Child Sub-Menu Cards (if this node has children in the Tree Menu) -->
      <section v-if="children.length" class="section" style="padding-bottom:12px">
        <div class="container">
          <div style="margin-bottom:18px">
            <span class="eyebrow" :style="{ color: styleCfg.accentColor }">SUB-COLLECTIONS &amp; STORIES</span>
            <h2 style="margin:4px 0 0;font-size:24px;color:#141936">
              {{ locale === 'th' ? 'เรื่องราวและหัวข้อย่อยในหมวดนี้' : 'Explore Stories in This Section' }}
            </h2>
          </div>
          <div class="op-cms__subgrid">
            <NuxtLink
              v-for="ch in children"
              :key="ch.id"
              :to="localePath(ch.routePath || `/pages/${ch.slug}`)"
              class="op-cms__subcard"
            >
              <img :src="ch.banner || '/images/op/hero-diver-dark.jpg'" :alt="ch.titleTh" />
              <div class="op-cms__subcard-body">
                <span>{{ ch.heroEyebrow || 'STORY' }}</span>
                <h3>{{ locale === 'en' && ch.titleEn ? ch.titleEn : ch.titleTh || ch.title }}</h3>
                <p>{{ ch.summary }}</p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Main Story / Policy Body -->
      <section class="section">
        <div class="container" :class="navPeers.length ? 'op-cms__layout' : 'op-cms__single'">
          <!-- Sidebar Peer Switcher -->
          <aside v-if="navPeers.length" class="op-cms__nav">
            <p class="eyebrow" style="margin-bottom:10px">
              {{ isLegalPage ? 'นโยบายที่เกี่ยวข้อง' : 'เรื่องราวในหมวดเดียวกัน' }}
            </p>
            <NuxtLink
              v-for="lnk in navPeers"
              :key="lnk.slug"
              :to="localePath(lnk.routePath || `/pages/${lnk.slug}`)"
              class="op-cms__nav-link"
              :class="{ 'is-active': lnk.slug === slug }"
            >
              {{ locale === 'en' && lnk.titleEn ? lnk.titleEn : lnk.titleTh || lnk.title }}
            </NuxtLink>
          </aside>

          <!-- Rich Content + Gallery + Search Keywords + FAQ -->
          <article class="op-cms__article card" :style="{ color: styleCfg.textColor }">
            <div v-if="page.aseoSummary" class="op-cms__aseo">
              <strong>สรุปสาระสำคัญ (Executive Highlights):</strong>
              <p>{{ page.aseoSummary }}</p>
            </div>

            <div class="op-cms__prose" v-html="bodyHtml" />

            <!-- Optional Story Gallery -->
            <div v-if="gallery.length" class="op-cms__gallery">
              <img v-for="(img, idx) in gallery" :key="idx" :src="img" :alt="`${title} ${idx + 1}`" loading="lazy" />
            </div>

            <!-- Search Keywords Tags -->
            <div v-if="page.seoKeywords" class="op-cms__tags">
              <span
                v-for="kw in String(page.seoKeywords).split(',').map((k) => k.trim()).filter(Boolean)"
                :key="kw"
              >
                #{{ kw }}
              </span>
            </div>

            <div v-if="faqs.length" class="op-cms__faqs">
              <h3>คำถามที่พบบ่อย (FAQ)</h3>
              <details v-for="(f, idx) in faqs" :key="idx" class="op-cms__faq" :open="idx === 0">
                <summary>{{ f.q }}</summary>
                <p>{{ f.a }}</p>
              </details>
            </div>
          </article>
        </div>
      </section>

      <!-- Linked Related Watches (`เอาสินค้าที่เกี่ยวข้องมาเชื่อมหน้าอีกที`) -->
      <section v-if="relatedProducts.length" class="section section--pearl">
        <div class="container">
          <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:26px">
            <div>
              <span class="eyebrow" :style="{ color: styleCfg.accentColor }">CURATED TIMEPIECES</span>
              <h2 style="margin:4px 0 0;font-size:clamp(22px,3vw,30px);color:#141936">
                {{ locale === 'th' ? `เรือนเวลาที่เกี่ยวข้องกับเรื่องราวนี้ (${relatedProducts.length} รุ่น)` : `Related Timepieces (${relatedProducts.length})` }}
              </h2>
            </div>
            <NuxtLink
              :to="localePath(page.brandSlug ? `/brands/${page.brandSlug}` : '/products')"
              class="link-underline"
            >
              {{ locale === 'th' ? 'ดูคอลเลกชันทั้งหมด →' : 'View Full Collection →' }}
            </NuxtLink>
          </div>

          <div class="op-cms__prod-grid">
            <ProductCard v-for="p in relatedProducts" :key="p.id || p.slug" :product="p" />
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.op-cms__hero {
  background-size: cover;
  background-position: center;
  color: #ffffff;
  padding: 68px 0 58px;
}
.op-cms__crumb {
  margin-bottom: 12px;
}
.op-cms__crumb a {
  color: #ffffff;
  font-size: 13px;
  text-decoration: none;
}
.op-cms__crumb a:hover {
  text-decoration: underline;
}
.op-cms__eyebrow {
  color: #ffffff;
  display: inline-block;
  margin-bottom: 8px;
}
.op-cms__hero h1 {
  color: #ffffff !important;
  margin: 0 0 12px;
  line-height: 1.25;
}
.op-cms__hero h1.size-md {
  font-size: clamp(24px, 3vw, 32px);
}
.op-cms__hero h1.size-lg {
  font-size: clamp(28px, 3.6vw, 38px);
}
.op-cms__hero h1.size-xl {
  font-size: clamp(30px, 4.2vw, 44px);
}
.op-cms__lead {
  max-width: 780px;
  font-size: 16px;
  line-height: 1.65;
  color: #ffffff;
  margin: 0;
}
.op-cms__cta {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 999px;
  color: #ffffff;
  font-weight: 600;
  font-size: 14.5px;
  text-decoration: none;
}
.op-cms__layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}
.op-cms__single {
  max-width: 920px;
}
@media (max-width: 900px) {
  .op-cms__layout {
    grid-template-columns: 1fr;
  }
}
.op-cms__nav {
  background: #f8f9fc;
  border: 1px solid #e5e8f0;
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.op-cms__nav-link {
  padding: 9px 12px;
  border-radius: 9px;
  color: #334155;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}
.op-cms__nav-link:hover,
.op-cms__nav-link.is-active {
  background: #1d2088;
  color: #ffffff;
}
.op-cms__article {
  background: #ffffff;
  border: 1px solid #e5e8f0;
  border-radius: 18px;
  padding: 34px;
}
@media (max-width: 640px) {
  .op-cms__article {
    padding: 20px;
  }
}
.op-cms__aseo {
  background: #f4f6ff;
  border-left: 4px solid var(--cms-accent, #1d2088);
  padding: 14px 18px;
  border-radius: 10px;
  margin-bottom: 24px;
}
.op-cms__aseo p {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.65;
}
.op-cms__prose :deep(h2) {
  font-size: 22px;
  margin: 24px 0 10px;
  color: #141936;
}
.op-cms__prose :deep(h3) {
  font-size: 18px;
  margin: 18px 0 8px;
  color: #1e293b;
}
.op-cms__prose :deep(p),
.op-cms__prose :deep(li) {
  font-size: 15.5px;
  line-height: 1.8;
}
.op-cms__gallery {
  margin-top: 26px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}
.op-cms__gallery img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}
.op-cms__tags {
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid #eef2f7;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.op-cms__tags span {
  padding: 4px 12px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12.5px;
}
.op-cms__faqs {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #e5e8f0;
}
.op-cms__faq {
  padding: 12px 14px;
  border: 1px solid #e5e8f0;
  border-radius: 10px;
  margin-top: 10px;
}
.op-cms__faq summary {
  font-weight: 600;
  cursor: pointer;
}
.op-cms__faq p {
  margin: 8px 0 0;
  font-size: 14px;
  color: #475569;
}
.op-cms__subgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 18px;
}
.op-cms__subcard {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #e5e8f0;
  border-radius: 16px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 0.16s, box-shadow 0.16s;
}
.op-cms__subcard:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgba(20, 25, 54, 0.1);
}
.op-cms__subcard img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}
.op-cms__subcard-body {
  padding: 16px 18px;
}
.op-cms__subcard-body span {
  font-size: 11px;
  font-weight: 700;
  color: var(--cms-accent, #1d2088);
  letter-spacing: 0.06em;
}
.op-cms__subcard-body h3 {
  margin: 6px 0 6px;
  font-size: 17px;
  color: #141936;
}
.op-cms__subcard-body p {
  margin: 0;
  font-size: 13.5px;
  color: #64748b;
  line-height: 1.55;
}
.op-cms__prod-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(235px, 1fr));
  gap: 20px;
}
</style>
