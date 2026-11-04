<script setup lang="ts">
const route = useRoute()
const { locale } = useI18n()
const localePath = useLocalePath()
const slug = computed(() => String(route.params.slug || ''))

const { data, error, refresh } = await useFetch(() => `/api/reviews/${slug.value}`)
if (error.value || !(data.value as any)?.article) {
  throw createError({ statusCode: 404, statusMessage: 'ไม่พบบทความหรือรีวิวสินค้าที่ค้นหา' })
}

const article = computed<any>(() => (data.value as any).article)
const products = computed<any[]>(() => (data.value as any).products || [])
const customerReviews = computed<any[]>(() => (data.value as any).customerReviews || [])
const relatedArticles = computed<any[]>(() => (data.value as any).relatedArticles || [])

const sc = computed<any>(() => article.value?.styleConfig || {})
const verdict = computed<any>(() => sc.value?.verdictScore || null)
const pros = computed<string[]>(() => (Array.isArray(sc.value?.pros) ? sc.value.pros : []))
const gallery = computed<string[]>(() => (Array.isArray(article.value?.gallery) ? article.value.gallery.filter(Boolean) : []))
const faqs = computed<any[]>(() => (Array.isArray(article.value?.aseoFaqs) ? article.value.aseoFaqs : []))

const displayTitle = computed(() =>
  locale.value === 'en' && article.value.titleEn
    ? article.value.titleEn
    : article.value.titleTh || article.value.title
)

const displaySummary = computed(() =>
  locale.value === 'en' && article.value.summaryEn
    ? article.value.summaryEn
    : article.value.summary
)

const displayBody = computed(() =>
  locale.value === 'en' && article.value.contentEn
    ? article.value.contentEn
    : article.value.contentTh || article.value.content || ''
)

// Quick review submission on article page
const rvName = ref('')
const rvRating = ref(5)
const rvComment = ref('')
const rvProductId = ref<number>(0)
const rvBusy = ref(false)
const rvDone = ref('')

watch(
  products,
  (list) => {
    if (!rvProductId.value && list.length) rvProductId.value = Number(list[0].id)
  },
  { immediate: true }
)

async function postReview() {
  if (!rvComment.value.trim()) return
  rvBusy.value = true
  try {
    await $fetch('/api/reviews', {
      method: 'POST',
      body: {
        productId: rvProductId.value || products.value[0]?.id || 1,
        customerName: rvName.value.trim() || 'ผู้ใช้งานจริง',
        rating: rvRating.value,
        comment: rvComment.value.trim()
      }
    })
    rvComment.value = ''
    rvDone.value = 'ขอบคุณสำหรับความคิดเห็น! รีวิวของท่านแสดงด้านล่างเรียบร้อยแล้ว'
    await refresh()
  } finally {
    rvBusy.value = false
  }
}

useSeoMeta({
  title: () => article.value?.seoTitle || `${displayTitle.value} | OPWatch Thailand`,
  description: () => article.value?.seoDescription || displaySummary.value
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: displayTitle.value,
        description: displaySummary.value,
        image: article.value?.banner ? [article.value.banner] : [],
        datePublished: sc.value?.publishedAt || '2026-11-01',
        author: {
          '@type': 'Organization',
          name: sc.value?.author || 'Inter Times Co., Ltd. (OPWatch Thailand)'
        },
        publisher: {
          '@type': 'Organization',
          name: 'บริษัท อินเตอร์ไทมส์ จำกัด (OPWatch Thailand)'
        }
      })
    }
  ]
}))
</script>

<template>
  <div class="rvd-page">
    <!-- Dark Royal Sapphire Hero with #ffffff White Headline -->
    <section
      class="op-page-hero rvd-hero"
      :style="{
        backgroundImage: `linear-gradient(125deg, rgba(12, 17, 54, 0.92), rgba(29, 32, 136, 0.82)), url('${article.banner || '/images/op/hero-diver-dark.jpg'}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }"
    >
      <div class="container">
        <nav class="rvd-breadcrumb">
          <NuxtLink :to="localePath('/')">{{ locale === 'en' ? 'Home' : 'หน้าแรก' }}</NuxtLink>
          <span>/</span>
          <NuxtLink :to="localePath('/reviews')">{{ locale === 'en' ? 'Articles & Reviews' : 'บทความ-รีวิวสินค้า' }}</NuxtLink>
          <span>/</span>
          <span class="cur">{{ article.title || displayTitle }}</span>
        </nav>

        <span class="eyebrow">{{ article.heroEyebrow || 'HANDS-ON HOROLOGY REVIEW' }}</span>
        <h1 class="rvd-title">{{ displayTitle }}</h1>
        <p v-if="displaySummary" class="rvd-lead">{{ displaySummary }}</p>

        <div class="rvd-meta-bar">
          <span class="rvd-rating-pill">★ {{ sc.rating || '4.9' }} / 5.0</span>
          <span v-if="sc.testedSku" class="rvd-sku-pill">รุ่นที่ทดสอบ: {{ sc.testedSku }}</span>
          <span>✍ {{ sc.author || 'ทีมผู้เชี่ยวชาญเรือนเวลา อินเตอร์ไทมส์' }}</span>
          <span v-if="sc.publishedAt">📅 {{ sc.publishedAt }}</span>
          <span v-if="sc.readMinutes">⏱ {{ sc.readMinutes }} {{ locale === 'en' ? 'min read' : 'นาทีในการอ่าน' }}</span>
        </div>
      </div>
    </section>

    <div class="container section">
      <div class="rvd-layout">
        <!-- Main Editorial Content -->
        <div class="rvd-main">
          <!-- Horologist Scorecard -->
          <div v-if="verdict || pros.length" class="rvd-verdict-box">
            <div class="rvd-verdict-head">
              <div>
                <span class="rvd-verdict-eyebrow">HOROLOGIST SCORECARD</span>
                <h2>{{ locale === 'en' ? 'Expert Testing Summary' : 'สรุปคะแนนทดสอบโดยทีมผู้เชี่ยวชาญ' }}</h2>
              </div>
              <div class="rvd-overall-badge">
                <strong>{{ sc.rating || '4.9' }}</strong>
                <span>/ 5.0 ★</span>
              </div>
            </div>

            <div v-if="verdict" class="rvd-score-bars">
              <div class="rvd-score-item">
                <div class="lbl"><span>งานดีไซน์และสัดส่วนบนข้อมือ (Design)</span><strong>{{ verdict.design }}/10</strong></div>
                <div class="bar"><i :style="{ width: `${Number(verdict.design || 9.5) * 10}%` }" /></div>
              </div>
              <div class="rvd-score-item">
                <div class="lbl"><span>ความเที่ยงตรงของกลไก (Movement)</span><strong>{{ verdict.movement }}/10</strong></div>
                <div class="bar"><i :style="{ width: `${Number(verdict.movement || 9.5) * 10}%` }" /></div>
              </div>
              <div class="rvd-score-item">
                <div class="lbl"><span>วัสดุตัวเรือน & กระจกแซฟไฟร์ (Material)</span><strong>{{ verdict.material }}/10</strong></div>
                <div class="bar"><i :style="{ width: `${Number(verdict.material || 9.8) * 10}%` }" /></div>
              </div>
              <div class="rvd-score-item">
                <div class="lbl"><span>ความคุ้มค่าเมื่อเทียบราคา (Value)</span><strong>{{ verdict.value }}/10</strong></div>
                <div class="bar"><i :style="{ width: `${Number(verdict.value || 9.8) * 10}%` }" /></div>
              </div>
            </div>

            <div v-if="pros.length" class="rvd-pros-box">
              <h3>{{ locale === 'en' ? 'Key Highlights' : 'จุดเด่นสำคัญจากการสัมผัสตัวเรือนจริง' }}</h3>
              <ul>
                <li v-for="(p, idx) in pros" :key="idx">✓ {{ p }}</li>
              </ul>
            </div>
          </div>

          <!-- Rich Editorial Body -->
          <article class="rvd-prose" v-html="displayBody" />

          <!-- Photo Gallery -->
          <div v-if="gallery.length" class="rvd-gallery">
            <h3>{{ locale === 'en' ? 'Close-Up Gallery' : 'ภาพถ่ายมุมใกล้ (Close-Up Gallery)' }}</h3>
            <div class="rvd-gallery-grid">
              <figure v-for="(img, idx) in gallery" :key="idx">
                <img :src="img" :alt="`${displayTitle} ${idx + 1}`" loading="lazy" />
              </figure>
            </div>
          </div>

          <!-- Quick Takeaway & FAQs -->
          <div v-if="article.aseoSummary || faqs.length" class="rvd-faq-card">
            <div v-if="article.aseoSummary" class="rvd-quick-sum">
              <strong>💡 สรุปสั้นใน 10 วินาที:</strong>
              <p>{{ article.aseoSummary }}</p>
            </div>
            <div v-if="faqs.length" class="rvd-faqs">
              <h3>{{ locale === 'en' ? 'Frequently Asked Questions' : 'คำถามที่พบบ่อยเกี่ยวกับรุ่นนี้' }}</h3>
              <details v-for="(f, idx) in faqs" :key="idx" :open="idx === 0">
                <summary>{{ f.q }}</summary>
                <p>{{ f.a }}</p>
              </details>
            </div>
          </div>
        </div>

        <!-- Sticky Sidebar -->
        <aside class="rvd-side">
          <div class="rvd-side-card">
            <span class="rvd-side-eyebrow">AUTHENTIC GUARANTEE</span>
            <h3>มั่นใจของแท้ 100% ศูนย์ไทย</h3>
            <ul>
              <li>✓ จัดจำหน่ายโดย <strong>บริษัท อินเตอร์ไทมส์ จำกัด</strong></li>
              <li>✓ กระจกหน้าปัด Sapphire Crystal แท้</li>
              <li>✓ รับประกันศูนย์ไทย 2 ปี + ลงทะเบียน E-Warranty</li>
              <li>✓ บริการตัดสายตามขนาดข้อมือ & ห่อของขวัญฟรี</li>
            </ul>
            <NuxtLink
              v-if="article.ctaUrl"
              :to="localePath(article.ctaUrl)"
              class="btn btn-primary"
              style="width: 100%; justify-content: center; margin-top: 12px"
            >
              {{ article.ctaText || 'ชมคอลเลกชันที่เกี่ยวข้อง' }}
            </NuxtLink>
          </div>

          <div class="rvd-side-card">
            <h3>ร่วมเขียนรีวิวรุ่นนี้</h3>
            <form class="rvd-mini-form" @submit.prevent="postReview">
              <select v-if="products.length > 1" v-model.number="rvProductId">
                <option v-for="p in products" :key="p.id" :value="p.id">{{ p.sku }} — {{ p.nameTh || p.name }}</option>
              </select>
              <input v-model="rvName" placeholder="ชื่อของคุณ (เช่น คุณกิตติ)" required />
              <div class="rvd-stars-pick">
                <button v-for="n in 5" :key="n" type="button" :class="{ on: n <= rvRating }" @click="rvRating = n">★</button>
                <span>{{ rvRating }}/5</span>
              </div>
              <textarea v-model="rvComment" rows="3" placeholder="แบ่งปันความประทับใจต่อรุ่นนี้..." required />
              <button type="submit" class="btn btn-outline" :disabled="rvBusy" style="width: 100%; justify-content: center">
                {{ rvBusy ? 'กำลังบันทึก...' : 'ส่งรีวิวผู้ใช้งาน' }}
              </button>
              <p v-if="rvDone" class="rvd-done">{{ rvDone }}</p>
            </form>
          </div>
        </aside>
      </div>

      <!-- Linked Featured Watches -->
      <section v-if="products.length" class="rvd-products-sec">
        <div class="rvd-sec-head">
          <div>
            <span class="rvd-side-eyebrow">FEATURED TIMEPIECES IN THIS REVIEW</span>
            <h2>{{ locale === 'en' ? 'Shop Watches Featured in This Review' : 'เรือนเวลาของแท้ที่ปรากฏในบทความรีวิวนี้' }}</h2>
          </div>
          <NuxtLink :to="localePath('/products')" class="btn btn-outline">
            {{ locale === 'en' ? 'View All Watches →' : 'ดูนาฬิกาทั้งหมด →' }}
          </NuxtLink>
        </div>
        <div class="grid-4">
          <ProductCard v-for="p in products" :key="p.id" :product="p" />
        </div>
      </section>

      <!-- Customer Reviews for Linked Models -->
      <section v-if="customerReviews.length" class="rvd-cust-sec">
        <h2>{{ locale === 'en' ? 'Owner Reviews' : 'รีวิวจากผู้ใช้งานจริง' }} ({{ customerReviews.length }})</h2>
        <div class="rvd-cust-grid">
          <div v-for="rv in customerReviews" :key="rv.id" class="rvd-cust-card">
            <div class="stars">{{ '★'.repeat(Number(rv.rating || 5)) }}</div>
            <p>“{{ rv.comment }}”</p>
            <div class="who">
              <strong>{{ rv.customerName }}</strong>
              <span v-if="rv.product">{{ rv.product.sku }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Related Articles -->
      <section v-if="relatedArticles.length" class="rvd-rel-sec">
        <h2>{{ locale === 'en' ? 'Related Horology Articles' : 'บทความและรีวิวที่คุณอาจสนใจ' }}</h2>
        <div class="rvd-rel-grid">
          <NuxtLink
            v-for="rel in relatedArticles"
            :key="rel.slug"
            :to="localePath(`/reviews/${rel.slug}`)"
            class="rvd-rel-card"
          >
            <img :src="rel.banner || '/images/op/hero-diver-dark.jpg'" :alt="rel.titleTh || rel.title" loading="lazy" />
            <div>
              <span>★ {{ rel.styleConfig?.rating || '4.9' }}</span>
              <h3>{{ locale === 'en' && rel.titleEn ? rel.titleEn : rel.titleTh || rel.title }}</h3>
            </div>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.rvd-hero {
  padding: 54px 0 46px;
}
.rvd-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.78);
  margin-bottom: 16px;
}
.rvd-breadcrumb a:hover {
  color: #ffffff;
  text-decoration: underline;
}
.rvd-breadcrumb .cur {
  color: #ffd978;
}
.rvd-title {
  color: #ffffff !important;
  font-size: clamp(1.85rem, 3.3vw, 2.75rem);
  line-height: 1.24;
  margin: 0 0 14px;
  max-width: 920px;
}
.rvd-lead {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.03rem;
  line-height: 1.7;
  max-width: 820px;
  margin: 0 0 20px;
}
.rvd-meta-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.88);
}
.rvd-rating-pill {
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(255, 217, 120, 0.2);
  border: 1px solid rgba(255, 217, 120, 0.55);
  color: #ffd978;
  font-weight: 700;
}
.rvd-sku-pill {
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  font-weight: 600;
}

.rvd-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 34px;
  align-items: start;
}

.rvd-verdict-box {
  background: linear-gradient(145deg, #f8f9ff, #ffffff);
  border: 1px solid #dce2f5;
  border-radius: 18px;
  padding: 26px;
  margin-bottom: 28px;
}
.rvd-verdict-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}
.rvd-verdict-eyebrow,
.rvd-side-eyebrow {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--brand);
  margin-bottom: 4px;
}
.rvd-verdict-head h2 {
  margin: 0;
  font-size: 1.3rem;
}
.rvd-overall-badge {
  background: var(--brand);
  color: #ffffff;
  padding: 10px 18px;
  border-radius: 14px;
  text-align: center;
}
.rvd-overall-badge strong {
  font-size: 1.5rem;
  display: block;
  line-height: 1;
}
.rvd-overall-badge span {
  font-size: 0.76rem;
  color: #ffd978;
}
.rvd-score-bars {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 22px;
  margin-bottom: 18px;
}
.rvd-score-item .lbl {
  display: flex;
  justify-content: space-between;
  font-size: 0.83rem;
  margin-bottom: 5px;
  color: #2c3258;
}
.rvd-score-item .bar {
  height: 8px;
  border-radius: 999px;
  background: #e5e9f7;
  overflow: hidden;
}
.rvd-score-item .bar i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #1d2088, #4348d6);
}
.rvd-pros-box {
  padding-top: 16px;
  border-top: 1px solid #e6eaf7;
}
.rvd-pros-box h3 {
  margin: 0 0 10px;
  font-size: 0.96rem;
}
.rvd-pros-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 16px;
  font-size: 0.88rem;
  color: #166534;
  font-weight: 600;
}

.rvd-prose {
  font-size: 1.02rem;
  line-height: 1.85;
  color: #23284a;
}
.rvd-prose :deep(h2) {
  font-size: 1.45rem;
  margin: 28px 0 12px;
  color: #15193d;
}
.rvd-prose :deep(h3) {
  font-size: 1.18rem;
  margin: 22px 0 10px;
  color: #1d2088;
}
.rvd-prose :deep(p) {
  margin: 0 0 16px;
}
.rvd-prose :deep(ul),
.rvd-prose :deep(ol) {
  padding-left: 22px;
  margin: 0 0 18px;
}
.rvd-prose :deep(li) {
  margin-bottom: 8px;
}

.rvd-gallery {
  margin-top: 32px;
}
.rvd-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
  margin-top: 12px;
}
.rvd-gallery-grid figure {
  margin: 0;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #e3e7f5;
  background: #f8f9fd;
  aspect-ratio: 4 / 3;
}
.rvd-gallery-grid img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rvd-faq-card {
  margin-top: 32px;
  padding: 22px;
  border-radius: 16px;
  background: #f8f9fe;
  border: 1px solid #e0e5f6;
}
.rvd-quick-sum {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #e4e8f6;
}
.rvd-quick-sum p {
  margin: 6px 0 0;
  color: #353b63;
}
.rvd-faqs details {
  padding: 10px 0;
  border-bottom: 1px solid #e8ecf8;
}
.rvd-faqs summary {
  font-weight: 700;
  cursor: pointer;
  color: #191e45;
}
.rvd-faqs p {
  margin: 8px 0 2px;
  color: #4b5278;
}

.rvd-side {
  display: grid;
  gap: 18px;
  position: sticky;
  top: 96px;
}
.rvd-side-card {
  background: #ffffff;
  border: 1px solid #e2e6f5;
  border-radius: 16px;
  padding: 20px;
}
.rvd-side-card h3 {
  margin: 0 0 12px;
  font-size: 1.05rem;
}
.rvd-side-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
  font-size: 0.86rem;
  color: #363c63;
}
.rvd-mini-form {
  display: grid;
  gap: 9px;
}
.rvd-mini-form input,
.rvd-mini-form select,
.rvd-mini-form textarea {
  width: 100%;
  padding: 8px 11px;
  border: 1px solid #cfd6ee;
  border-radius: 9px;
  font-family: inherit;
  font-size: 0.86rem;
}
.rvd-stars-pick {
  display: flex;
  align-items: center;
  gap: 3px;
}
.rvd-stars-pick button {
  border: none;
  background: none;
  font-size: 1.3rem;
  color: #d1d6ea;
  cursor: pointer;
}
.rvd-stars-pick button.on {
  color: #f59e0b;
}
.rvd-done {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: #047857;
  font-weight: 600;
}

.rvd-products-sec,
.rvd-cust-sec,
.rvd-rel-sec {
  margin-top: 52px;
  padding-top: 40px;
  border-top: 1px solid var(--line);
}
.rvd-sec-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 14px;
  margin-bottom: 24px;
}
.rvd-sec-head h2 {
  margin: 0;
}
.rvd-cust-grid,
.rvd-rel-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-top: 18px;
}
.rvd-cust-card {
  padding: 18px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e3e7f5;
}
.rvd-cust-card .stars {
  color: #f59e0b;
  margin-bottom: 8px;
}
.rvd-cust-card p {
  margin: 0 0 12px;
  color: #2b3158;
  font-size: 0.9rem;
  line-height: 1.6;
}
.rvd-cust-card .who {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: #6d7499;
}
.rvd-rel-card {
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #e3e7f5;
  background: #ffffff;
}
.rvd-rel-card img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
.rvd-rel-card div {
  padding: 14px;
}
.rvd-rel-card span {
  font-size: 0.75rem;
  font-weight: 700;
  color: #b45309;
}
.rvd-rel-card h3 {
  font-size: 0.96rem;
  margin: 6px 0 0;
  line-height: 1.4;
}

@media (max-width: 980px) {
  .rvd-layout {
    grid-template-columns: 1fr;
  }
  .rvd-score-bars,
  .rvd-pros-box ul,
  .rvd-cust-grid,
  .rvd-rel-grid {
    grid-template-columns: 1fr;
  }
}
</style>
