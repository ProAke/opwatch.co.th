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
const title = computed(() => (locale.value === 'en' && page.value?.titleEn ? page.value.titleEn : page.value?.titleTh || ''))
const bodyHtml = computed(() => (locale.value === 'en' && page.value?.contentEn ? page.value.contentEn : page.value?.contentTh || ''))
const faqs = computed(() => (Array.isArray(page.value?.aseoFaqs) ? page.value.aseoFaqs.filter((f: any) => f.q && f.a) : []))

const policyLinks = [
  { slug: 'privacy-policy', th: 'นโยบายความเป็นส่วนตัว (PDPA)', en: 'Privacy Policy' },
  { slug: 'cookie-policy', th: 'นโยบายคุกกี้', en: 'Cookie Policy' },
  { slug: 'terms-conditions', th: 'ข้อตกลงและเงื่อนไข', en: 'Terms & Conditions' },
  { slug: 'return-policy', th: 'นโยบายการเปลี่ยนและคืนสินค้า', en: 'Return & Exchange Policy' },
  { slug: 'warranty-authenticity', th: 'การรับประกันสินค้าของแท้ศูนย์ไทย', en: 'Authenticity & Warranty' }
]

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
      { name: 'description', content: p?.seoDescription || p?.excerptTh || '' },
      ...(p?.seoKeywords ? [{ name: 'keywords', content: p.seoKeywords }] : [])
    ],
    script: faqSchema
      ? [{ type: 'application/ld+json', innerHTML: JSON.stringify(faqSchema) }]
      : []
  }
})
</script>

<template>
  <div class="op-cms">
    <div v-if="error || !page" class="container section center" style="padding-top:140px">
      <h1>ไม่พบหน้าข้อมูลที่คุณต้องการ</h1>
      <NuxtLink :to="localePath('/')" class="btn" style="margin-top:18px">กลับหน้าแรก</NuxtLink>
    </div>

    <template v-else>
      <section class="op-cms__hero">
        <div class="container">
          <span class="eyebrow" style="color:#a5b4fc">OFFICIAL POLICY &amp; INFORMATION · INTER TIMES CO., LTD.</span>
          <h1>{{ title }}</h1>
          <p v-if="page.excerptTh">{{ page.excerptTh }}</p>
        </div>
      </section>

      <section class="section">
        <div class="container op-cms__layout">
          <!-- Sidebar Quick Legal Switcher -->
          <aside class="op-cms__nav">
            <p class="eyebrow" style="margin-bottom:10px">หัวข้อที่เกี่ยวข้อง</p>
            <NuxtLink
              v-for="lnk in policyLinks"
              :key="lnk.slug"
              :to="localePath(`/pages/${lnk.slug}`)"
              class="op-cms__nav-link"
              :class="{ 'is-active': lnk.slug === slug }"
            >
              {{ locale === 'th' ? lnk.th : lnk.en }}
            </NuxtLink>
          </aside>

          <!-- Rich Content + ASEO Summary & FAQ -->
          <article class="op-cms__article card">
            <div v-if="page.aseoSummary" class="op-cms__aseo">
              <strong>สรุปสาระสำคัญ (Executive Summary):</strong>
              <p>{{ page.aseoSummary }}</p>
            </div>

            <div class="op-cms__prose" v-html="bodyHtml" />

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
    </template>
  </div>
</template>

<style scoped>
.op-cms__hero {
  background: linear-gradient(135deg, #101444 0%, #1d2088 100%);
  color: #ffffff;
  padding: 120px 0 46px;
}
.op-cms__hero h1 { font-family: var(--font-display); font-size: clamp(1.9rem, 3.2vw, 2.7rem); margin-top: 8px; }
.op-cms__hero p { max-width: 740px; opacity: 0.9; margin-top: 8px; }
.op-cms__layout {
  display: grid;
  grid-template-columns: 270px minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}
.op-cms__nav {
  background: #f6f8fd;
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: sticky;
  top: 96px;
}
.op-cms__nav-link {
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink-soft);
}
.op-cms__nav-link.is-active,
.op-cms__nav-link:hover {
  background: var(--sapphire);
  color: #ffffff;
}
.op-cms__article { padding: 34px; }
.op-cms__aseo {
  background: #f2f5ff;
  border-left: 4px solid var(--sapphire);
  padding: 14px 18px;
  border-radius: 6px;
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 1.65;
}
.op-cms__prose :deep(h2),
.op-cms__prose :deep(h3) {
  color: var(--sapphire);
  margin: 22px 0 10px;
  font-weight: 700;
}
.op-cms__prose :deep(p),
.op-cms__prose :deep(li) {
  font-size: 15px;
  line-height: 1.8;
  color: var(--ink-soft);
  margin-bottom: 10px;
}
.op-cms__prose :deep(ul) { padding-left: 22px; }
.op-cms__faqs { margin-top: 30px; padding-top: 22px; border-top: 1px solid var(--line); }
.op-cms__faqs h3 { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
.op-cms__faq {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 8px;
}
.op-cms__faq summary { font-weight: 700; cursor: pointer; color: var(--ink); }
.op-cms__faq p { margin-top: 8px; font-size: 14px; color: var(--ink-soft); line-height: 1.65; }
@media (max-width: 900px) {
  .op-cms__layout { grid-template-columns: 1fr; }
  .op-cms__nav { position: static; }
}
</style>
