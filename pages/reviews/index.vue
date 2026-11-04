<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { site } = useSite()

const selectedBrand = ref(String(route.query.brand || ''))
const selectedCategory = ref(String(route.query.category || ''))
const searchQuery = ref('')

const { data, refresh } = await useFetch('/api/reviews')

const heroPage = computed<any>(() => (data.value as any)?.heroPage || null)
const allArticles = computed<any[]>(() => (data.value as any)?.articles || [])
const allCustomerReviews = computed<any[]>(() => (data.value as any)?.customerReviews || [])
const featuredProducts = computed<any[]>(() => (data.value as any)?.featuredProducts || [])
const stats = computed<any>(() => (data.value as any)?.stats || { totalArticles: 0, totalCustomerReviews: 0, averageRating: 4.9 })

const fmt = (v: number) =>
  formatPrice(Number(v || 0), site.value.currencySymbol, locale.value === 'en' ? 'en-US' : 'th-TH')

const categoryTabs = computed(() => [
  { key: '', label: locale.value === 'en' ? 'All Articles & Reviews' : 'ทั้งหมด' },
  { key: 'hands-on-review', label: locale.value === 'en' ? 'Hands-On Reviews' : 'รีวิวใช้งานจริง' },
  { key: 'comparison', label: locale.value === 'en' ? 'Comparisons' : 'เปรียบเทียบกลไก' },
  { key: 'buyers-guide', label: locale.value === 'en' ? 'Buyer’s Guide' : 'คู่มือเลือกซื้อ' },
  { key: 'horology-care', label: locale.value === 'en' ? 'Watch Care' : 'การดูแลรักษา' }
])

const brandTabs = [
  { key: '', labelTh: 'ทุกแบรนด์', labelEn: 'All Brands' },
  { key: 'olympianus', labelTh: 'Olym Pianus (OP)', labelEn: 'Olym Pianus' },
  { key: 'olympia-star', labelTh: 'Olympia Star', labelEn: 'Olympia Star' },
  { key: 'ogival', labelTh: 'Ogival Swiss 1903', labelEn: 'Ogival 1903' }
]

const filteredArticles = computed(() => {
  return allArticles.value.filter((a: any) => {
    if (selectedBrand.value && a.brandSlug !== selectedBrand.value) return false
    if (selectedCategory.value && a.category !== selectedCategory.value) return false
    if (searchQuery.value.trim()) {
      const kw = searchQuery.value.trim().toLowerCase()
      const hay = `${a.title || ''} ${a.titleTh || ''} ${a.titleEn || ''} ${a.summary || ''} ${a.styleConfig?.testedSku || ''}`.toLowerCase()
      if (!hay.includes(kw)) return false
    }
    return true
  })
})

const spotlightArticle = computed(() => filteredArticles.value[0] || null)
const gridArticles = computed(() => (filteredArticles.value.length > 1 ? filteredArticles.value.slice(1) : filteredArticles.value))

const filteredCustomerReviews = computed(() => {
  if (!selectedBrand.value) return allCustomerReviews.value
  return allCustomerReviews.value.filter((r: any) => r.product?.brand === selectedBrand.value)
})

function categoryLabel(cat: string) {
  if (locale.value === 'en') {
    if (cat === 'hands-on-review') return 'Hands-On Review'
    if (cat === 'comparison') return 'Movement Comparison'
    if (cat === 'buyers-guide') return 'Buyer’s Guide'
    if (cat === 'horology-care') return 'Service & Care'
    return 'Horology Journal'
  }
  if (cat === 'hands-on-review') return 'รีวิวใช้งานจริง'
  if (cat === 'comparison') return 'เปรียบเทียบกลไก'
  if (cat === 'buyers-guide') return 'คู่มือเลือกซื้อ'
  if (cat === 'horology-care') return 'การดูแลรักษา'
  return 'บทความนาฬิกา'
}

function brandBadge(slug: string) {
  if (slug === 'olympianus') return 'OLYM PIANUS'
  if (slug === 'olympia-star') return 'OLYMPIA STAR'
  if (slug === 'ogival') return 'OGIVAL 1903'
  return 'OPWATCH JOURNAL'
}

// Interactive Customer Review Form
const showReviewForm = ref(false)
const reviewForm = reactive({
  productId: 0,
  customerName: '',
  rating: 5,
  comment: ''
})
const reviewSubmitting = ref(false)
const reviewMsg = ref('')

watch(
  featuredProducts,
  (list) => {
    if (!reviewForm.productId && list.length) {
      reviewForm.productId = Number(list[0].id)
    }
  },
  { immediate: true }
)

async function submitCustomerReview() {
  if (!reviewForm.comment.trim()) return
  reviewSubmitting.value = true
  reviewMsg.value = ''
  try {
    await $fetch('/api/reviews', {
      method: 'POST',
      body: {
        productId: Number(reviewForm.productId || 0),
        customerName: reviewForm.customerName.trim() || (locale.value === 'en' ? 'Verified Watch Owner' : 'ผู้ครอบครองเรือนเวลาจริง'),
        rating: Number(reviewForm.rating || 5),
        comment: reviewForm.comment.trim()
      }
    })
    reviewForm.comment = ''
    reviewMsg.value = locale.value === 'en'
      ? 'Thank you! Your watch review has been published.'
      : 'ขอบคุณสำหรับรีวิวครับ! ความคิดเห็นของท่านแสดงบนหน้าเว็บไซต์เรียบร้อยแล้ว'
    await refresh()
  } catch (e: any) {
    reviewMsg.value = e?.data?.statusMessage || 'ไม่สามารถส่งรีวิวได้ในขณะนี้'
  } finally {
    reviewSubmitting.value = false
  }
}

useSeoMeta({
  title: () =>
    locale.value === 'en'
      ? 'Articles & Watch Reviews — Olym Pianus, Olympia Star & Ogival | OPWatch Thailand'
      : heroPage.value?.seoTitle || 'บทความ-รีวิวสินค้า นาฬิกาของแท้ Olym Pianus, Olympia Star, Ogival | OPWatch Thailand',
  description: () =>
    heroPage.value?.seoDescription ||
    'รวมบทความความรู้นาฬิกา รีวิวเจาะลึกจากการสวมใส่จริง คู่มือเปรียบเทียบกลไก Automatic vs Quartz และรีวิวผู้ใช้งานจริง โดย บริษัท อินเตอร์ไทมส์ จำกัด'
})
</script>

<template>
  <div class="rv-page">
    <!-- Dark Royal Sapphire Hero with #ffffff White Headline -->
    <section
      class="op-page-hero rv-hero"
      :style="heroPage?.banner ? { backgroundImage: `linear-gradient(125deg, rgba(13, 18, 56, 0.92), rgba(29, 32, 136, 0.84)), url('${heroPage.banner}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined"
    >
      <div class="container rv-hero-inner">
        <div>
          <span class="eyebrow">{{ heroPage?.heroEyebrow || 'HOROLOGICAL JOURNAL & VERIFIED REVIEWS' }}</span>
          <h1 class="rv-hero-title">
            {{
              locale === 'en'
                ? heroPage?.titleEn || 'Articles & Hands-On Watch Reviews'
                : 'บทความ - รีวิวสินค้า'
            }}
          </h1>
          <p class="rv-hero-sub">
            {{
              locale === 'en'
                ? heroPage?.summaryEn || 'In-depth wrist reviews, Swiss & Japanese movement comparisons, sapphire durability tests, and verified owner testimonials.'
                : heroPage?.summary || 'เจาะลึกทุกรายละเอียดจากการสวมใส่จริง เปรียบเทียบกลไก คู่มือดูแลเรือนเวลาโดยช่างศูนย์อินเตอร์ไทมส์ และเสียงตอบรับจริงจากผู้ครอบครองทั่วไทย'
            }}
          </p>
        </div>

        <div class="rv-hero-stats">
          <div class="rv-stat-box">
            <span class="rv-stat-val">★ {{ stats.averageRating || '4.9' }}<small>/5</small></span>
            <span class="rv-stat-lbl">{{ locale === 'en' ? 'Verified Satisfaction' : 'คะแนนความพึงพอใจเฉลี่ย' }}</span>
          </div>
          <div class="rv-stat-box">
            <span class="rv-stat-val">{{ allArticles.length }}</span>
            <span class="rv-stat-lbl">{{ locale === 'en' ? 'Editorial Reviews' : 'บทความเจาะลึก' }}</span>
          </div>
          <div class="rv-stat-box">
            <span class="rv-stat-val">{{ allCustomerReviews.length }}+</span>
            <span class="rv-stat-lbl">{{ locale === 'en' ? 'Owner Testimonials' : 'รีวิวผู้ใช้งานจริง' }}</span>
          </div>
        </div>
      </div>
    </section>

    <div class="container section">
      <!-- Filter & Search Bar -->
      <div class="rv-toolbar">
        <div class="rv-cat-pills">
          <button
            v-for="tab in categoryTabs"
            :key="tab.key"
            type="button"
            class="rv-pill"
            :class="{ active: selectedCategory === tab.key }"
            @click="selectedCategory = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="rv-toolbar-right">
          <div class="rv-brand-pills">
            <button
              v-for="b in brandTabs"
              :key="b.key"
              type="button"
              class="rv-brand-btn"
              :class="{ active: selectedBrand === b.key }"
              @click="selectedBrand = b.key"
            >
              {{ locale === 'en' ? b.labelEn : b.labelTh }}
            </button>
          </div>
          <input
            v-model="searchQuery"
            class="rv-search"
            type="search"
            :placeholder="locale === 'en' ? 'Search model, movement, sapphire...' : 'ค้นหารุ่น เช่น 899832, Ogival, Automatic...'"
          />
        </div>
      </div>

      <!-- Featured Spotlight Editorial -->
      <article v-if="spotlightArticle" class="rv-spotlight">
        <NuxtLink :to="localePath(`/reviews/${spotlightArticle.slug}`)" class="rv-spotlight-media">
          <img :src="spotlightArticle.banner || '/images/op/banner-899832ags.jpg'" :alt="spotlightArticle.titleTh || spotlightArticle.title" />
          <span class="rv-badge-float">
            ★ {{ spotlightArticle.styleConfig?.rating || '4.9' }} / 5.0 · {{ locale === 'en' ? 'EDITOR’S PICK' : 'บทความแนะนำอันดับ 1' }}
          </span>
        </NuxtLink>

        <div class="rv-spotlight-body">
          <div class="rv-meta-row">
            <span class="rv-tag-brand">{{ brandBadge(spotlightArticle.brandSlug) }}</span>
            <span class="rv-tag-cat">{{ categoryLabel(spotlightArticle.category) }}</span>
            <span v-if="spotlightArticle.styleConfig?.readMinutes" class="rv-read-time">
              ⏱ {{ spotlightArticle.styleConfig.readMinutes }} {{ locale === 'en' ? 'min read' : 'นาที' }}
            </span>
          </div>

          <NuxtLink :to="localePath(`/reviews/${spotlightArticle.slug}`)" class="rv-spotlight-title-link">
            <h2>{{ locale === 'en' && spotlightArticle.titleEn ? spotlightArticle.titleEn : spotlightArticle.titleTh || spotlightArticle.title }}</h2>
          </NuxtLink>

          <p class="rv-spotlight-desc">
            {{ locale === 'en' && spotlightArticle.summaryEn ? spotlightArticle.summaryEn : spotlightArticle.summary }}
          </p>

          <ul v-if="spotlightArticle.styleConfig?.pros?.length" class="rv-pros-mini">
            <li v-for="(pro, idx) in spotlightArticle.styleConfig.pros.slice(0, 3)" :key="idx">✓ {{ pro }}</li>
          </ul>

          <div class="rv-spotlight-foot">
            <NuxtLink :to="localePath(`/reviews/${spotlightArticle.slug}`)" class="btn btn-primary">
              {{ locale === 'en' ? 'Read Full Review →' : 'อ่านบทความรีวิวฉบับเต็ม →' }}
            </NuxtLink>

            <NuxtLink
              v-if="spotlightArticle.primaryProduct"
              :to="localePath(`/products/${spotlightArticle.primaryProduct.slug}`)"
              class="rv-linked-mini"
            >
              <img v-if="spotlightArticle.primaryProduct.image" :src="spotlightArticle.primaryProduct.image" alt="" />
              <div>
                <strong>{{ spotlightArticle.primaryProduct.sku }}</strong>
                <span>{{ fmt(spotlightArticle.primaryProduct.price) }}</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </article>

      <!-- Editorial Articles & Watch Reviews Grid -->
      <div v-if="gridArticles.length" class="rv-grid">
        <article v-for="art in gridArticles" :key="art.slug" class="rv-card">
          <NuxtLink :to="localePath(`/reviews/${art.slug}`)" class="rv-card-img">
            <img :src="art.banner || '/images/op/hero-diver-dark.jpg'" :alt="art.titleTh || art.title" loading="lazy" />
            <span class="rv-card-score">★ {{ art.styleConfig?.rating || '4.9' }}</span>
          </NuxtLink>

          <div class="rv-card-body">
            <div class="rv-meta-row">
              <span class="rv-tag-brand">{{ brandBadge(art.brandSlug) }}</span>
              <span class="rv-tag-cat">{{ categoryLabel(art.category) }}</span>
            </div>

            <NuxtLink :to="localePath(`/reviews/${art.slug}`)" class="rv-card-title">
              <h3>{{ locale === 'en' && art.titleEn ? art.titleEn : art.titleTh || art.title }}</h3>
            </NuxtLink>

            <p class="rv-card-sum">
              {{ locale === 'en' && art.summaryEn ? art.summaryEn : art.summary }}
            </p>

            <div v-if="art.primaryProduct" class="rv-card-watch">
              <img v-if="art.primaryProduct.image" :src="art.primaryProduct.image" alt="" />
              <div class="rv-card-watch-info">
                <span class="sku">{{ art.primaryProduct.sku }}</span>
                <strong>{{ art.primaryProduct.nameTh || art.primaryProduct.name }}</strong>
              </div>
              <span class="price">{{ fmt(art.primaryProduct.price) }}</span>
            </div>

            <div class="rv-card-foot">
              <span class="rv-author">{{ art.styleConfig?.author || 'ทีมผู้เชี่ยวชาญ อินเตอร์ไทมส์' }}</span>
              <NuxtLink :to="localePath(`/reviews/${art.slug}`)" class="rv-read-link">
                {{ locale === 'en' ? 'Read Review →' : 'อ่านต่อ →' }}
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>

      <div v-else-if="!spotlightArticle" class="rv-empty">
        <p>{{ locale === 'en' ? 'No articles matched your filter.' : 'ไม่พบบทความที่ตรงกับเงื่อนไขการค้นหา' }}</p>
        <button class="btn btn-outline" @click="selectedBrand = ''; selectedCategory = ''; searchQuery = ''">
          {{ locale === 'en' ? 'Reset Filters' : 'แสดงบทความทั้งหมด' }}
        </button>
      </div>

      <!-- Verified Customer Product Reviews Wall -->
      <section class="rv-customer-sec">
        <div class="rv-customer-head">
          <div>
            <span class="rv-sec-eyebrow">VERIFIED OWNER TESTIMONIALS</span>
            <h2>{{ locale === 'en' ? 'Customer Watch Reviews' : 'เสียงตอบรับจริงจากผู้ครอบครองเรือนเวลา' }}</h2>
            <p>
              {{
                locale === 'en'
                  ? 'Real impressions from customers across Thailand who purchased official timepieces from Inter Times Co., Ltd.'
                  : 'ความประทับใจจากลูกค้าตัวจริงทั่วประเทศไทยที่เลือกซื้อเรือนเวลาของแท้ศูนย์ไทย บริษัท อินเตอร์ไทมส์ จำกัด'
              }}
            </p>
          </div>
          <button type="button" class="btn btn-primary" @click="showReviewForm = !showReviewForm">
            ✍ {{ locale === 'en' ? 'Write a Watch Review' : 'เขียนรีวิวความประทับใจของคุณ' }}
          </button>
        </div>

        <!-- Write Review Drawer -->
        <form v-if="showReviewForm" class="rv-write-box" @submit.prevent="submitCustomerReview">
          <h3>{{ locale === 'en' ? 'Share Your Experience' : 'แบ่งปันประสบการณ์สวมใส่เรือนเวลาของคุณ' }}</h3>
          <div class="rv-write-grid">
            <div>
              <label>{{ locale === 'en' ? 'Select Watch Model' : 'เลือกรุ่นนาฬิกาที่รีวิว' }}</label>
              <select v-model.number="reviewForm.productId">
                <option v-for="fp in featuredProducts" :key="fp.id" :value="fp.id">
                  [{{ fp.brand.toUpperCase() }}] {{ fp.sku }} — {{ fp.nameTh || fp.name }}
                </option>
              </select>
            </div>
            <div>
              <label>{{ locale === 'en' ? 'Your Name & Province' : 'ชื่อของคุณ (และจังหวัด)' }}</label>
              <input v-model="reviewForm.customerName" placeholder="เช่น คุณธนพล (กรุงเทพฯ)" required />
            </div>
            <div>
              <label>{{ locale === 'en' ? 'Star Rating' : 'คะแนนความพึงพอใจ' }}</label>
              <div class="rv-star-picker">
                <button
                  v-for="n in 5"
                  :key="n"
                  type="button"
                  :class="{ on: n <= reviewForm.rating }"
                  @click="reviewForm.rating = n"
                >
                  ★
                </button>
                <span>{{ reviewForm.rating }}.0 / 5.0</span>
              </div>
            </div>
          </div>

          <div style="margin-top: 12px">
            <label>{{ locale === 'en' ? 'Your Review' : 'รายละเอียดความประทับใจ (งานตัวเรือน กระจกแซฟไฟร์ การบริการ)' }}</label>
            <textarea
              v-model="reviewForm.comment"
              rows="3"
              required
              placeholder="เล่าความรู้สึกเมื่อสวมใส่จริง ความสวยงามของหน้าปัด หรือความประทับใจในการจัดส่งและบริการตัดสาย..."
            />
          </div>

          <div class="rv-write-actions">
            <button type="submit" class="btn btn-primary" :disabled="reviewSubmitting">
              {{ reviewSubmitting ? 'กำลังส่งรีวิว...' : (locale === 'en' ? 'Publish Review' : 'ส่งรีวิวขึ้นหน้าเว็บไซต์') }}
            </button>
            <button type="button" class="btn btn-outline" @click="showReviewForm = false">
              {{ locale === 'en' ? 'Cancel' : 'ปิดหน้าต่าง' }}
            </button>
          </div>
        </form>

        <p v-if="reviewMsg" class="rv-toast-msg">{{ reviewMsg }}</p>

        <div class="rv-testi-grid">
          <div v-for="rv in filteredCustomerReviews" :key="rv.id" class="rv-testi-card">
            <div class="rv-testi-top">
              <div class="rv-stars">{{ '★'.repeat(Number(rv.rating || 5)) }}{{ '☆'.repeat(5 - Number(rv.rating || 5)) }}</div>
              <span class="rv-verified-pill">✓ Verified Owner</span>
            </div>

            <p class="rv-testi-comment">“{{ rv.comment }}”</p>

            <div class="rv-testi-author">
              <strong>{{ rv.customerName }}</strong>
              <span v-if="rv.createdAt">{{ String(rv.createdAt).slice(0, 10) }}</span>
            </div>

            <NuxtLink
              v-if="rv.product"
              :to="localePath(`/products/${rv.product.slug}`)"
              class="rv-testi-prod"
            >
              <img v-if="rv.product.image" :src="rv.product.image" :alt="rv.product.nameTh || rv.product.name" />
              <div>
                <span class="sku">{{ rv.product.sku }}</span>
                <strong>{{ rv.product.nameTh || rv.product.name }}</strong>
              </div>
              <span class="go">ดูรุ่นนี้ →</span>
            </NuxtLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.rv-hero {
  padding: 58px 0 48px;
}
.rv-hero-inner {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 32px;
  align-items: center;
}
.rv-hero-title {
  color: #ffffff !important;
  font-size: clamp(2rem, 3.6vw, 3rem);
  font-weight: 700;
  line-height: 1.18;
  margin: 0 0 12px;
}
.rv-hero-sub {
  color: rgba(255, 255, 255, 0.88);
  font-size: 1.02rem;
  line-height: 1.7;
  margin: 0;
  max-width: 680px;
}
.rv-hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.rv-stat-box {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 14px;
  padding: 16px 14px;
  text-align: center;
  color: #ffffff;
}
.rv-stat-val {
  display: block;
  font-size: 1.55rem;
  font-weight: 800;
  color: #ffd978;
}
.rv-stat-val small {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}
.rv-stat-lbl {
  display: block;
  margin-top: 4px;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.86);
}

.rv-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
  padding: 14px 18px;
  background: #f7f8fc;
  border: 1px solid var(--line);
  border-radius: 14px;
}
.rv-cat-pills,
.rv-brand-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.rv-pill {
  padding: 8px 15px;
  border-radius: 999px;
  border: 1px solid #d7dcf0;
  background: #ffffff;
  color: #2b3158;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
}
.rv-pill.active,
.rv-pill:hover {
  background: var(--brand);
  border-color: var(--brand);
  color: #ffffff;
}
.rv-toolbar-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.rv-brand-btn {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #d7dcf0;
  background: #ffffff;
  color: #3f466d;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
.rv-brand-btn.active {
  background: #eef0ff;
  border-color: var(--brand);
  color: var(--brand);
}
.rv-search {
  min-width: 240px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #cfd5ec;
  background: #ffffff;
  font-size: 0.86rem;
}

.rv-spotlight {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  background: #ffffff;
  border: 1px solid #dfe4f4;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 16px 38px rgba(20, 25, 80, 0.07);
  margin-bottom: 34px;
}
.rv-spotlight-media {
  position: relative;
  display: block;
  min-height: 360px;
  background: #0f1538;
}
.rv-spotlight-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.rv-badge-float {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(15, 20, 58, 0.88);
  border: 1px solid rgba(255, 217, 120, 0.55);
  color: #ffd978;
  font-size: 0.78rem;
  font-weight: 700;
}
.rv-spotlight-body {
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.rv-meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.rv-tag-brand {
  padding: 3px 10px;
  border-radius: 999px;
  background: #eef0ff;
  color: var(--brand);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}
.rv-tag-cat {
  padding: 3px 10px;
  border-radius: 999px;
  background: #f4f5f9;
  color: #4f567a;
  font-size: 0.74rem;
  font-weight: 600;
}
.rv-read-time {
  font-size: 0.78rem;
  color: #6b7294;
}
.rv-spotlight-title-link h2 {
  font-size: 1.55rem;
  line-height: 1.32;
  margin: 0 0 12px;
  color: #15193b;
}
.rv-spotlight-title-link:hover h2 {
  color: var(--brand);
}
.rv-spotlight-desc {
  color: #4b5275;
  line-height: 1.72;
  margin: 0 0 16px;
}
.rv-pros-mini {
  list-style: none;
  padding: 0;
  margin: 0 0 22px;
  display: grid;
  gap: 6px;
  font-size: 0.88rem;
  color: #1f5f43;
  font-weight: 500;
}
.rv-spotlight-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
}
.rv-linked-mini {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border: 1px solid #e2e6f5;
  border-radius: 12px;
  background: #fafbff;
}
.rv-linked-mini img {
  width: 38px;
  height: 38px;
  object-fit: contain;
}
.rv-linked-mini strong {
  display: block;
  font-size: 0.8rem;
  color: #191d42;
}
.rv-linked-mini span {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--brand);
}

.rv-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.rv-card {
  background: #ffffff;
  border: 1px solid #e3e7f5;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}
.rv-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px rgba(24, 29, 92, 0.09);
}
.rv-card-img {
  position: relative;
  aspect-ratio: 16 / 10;
  background: #121738;
  overflow: hidden;
}
.rv-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s;
}
.rv-card:hover .rv-card-img img {
  transform: scale(1.04);
}
.rv-card-score {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(15, 20, 58, 0.88);
  color: #ffd978;
  font-size: 0.76rem;
  font-weight: 700;
}
.rv-card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.rv-card-title h3 {
  font-size: 1.08rem;
  line-height: 1.42;
  margin: 0 0 10px;
  color: #171b3d;
}
.rv-card-title:hover h3 {
  color: var(--brand);
}
.rv-card-sum {
  font-size: 0.89rem;
  color: #555c7f;
  line-height: 1.65;
  margin: 0 0 16px;
  flex: 1;
}
.rv-card-watch {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 11px;
  background: #f7f8fd;
  border: 1px solid #e6eaf7;
  border-radius: 10px;
  margin-bottom: 14px;
}
.rv-card-watch img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  background: #ffffff;
  border-radius: 6px;
}
.rv-card-watch-info {
  flex: 1;
  min-width: 0;
}
.rv-card-watch-info .sku {
  display: block;
  font-size: 0.7rem;
  color: #6d7499;
}
.rv-card-watch-info strong {
  display: block;
  font-size: 0.8rem;
  color: #1c2045;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rv-card-watch .price {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--brand);
}
.rv-card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #eef0f8;
  font-size: 0.8rem;
}
.rv-author {
  color: #6c7396;
}
.rv-read-link {
  font-weight: 700;
  color: var(--brand);
}

.rv-customer-sec {
  margin-top: 58px;
  padding-top: 46px;
  border-top: 1px solid var(--line);
}
.rv-customer-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 26px;
}
.rv-sec-eyebrow {
  display: block;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--brand);
  margin-bottom: 6px;
}
.rv-customer-head h2 {
  margin: 0 0 6px;
  font-size: 1.7rem;
}
.rv-customer-head p {
  margin: 0;
  color: #596082;
}

.rv-write-box {
  background: #f8f9fe;
  border: 1px solid #d7ddf2;
  border-radius: 16px;
  padding: 22px;
  margin-bottom: 24px;
}
.rv-write-box h3 {
  margin: 0 0 14px;
  font-size: 1.12rem;
}
.rv-write-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr 0.9fr;
  gap: 14px;
}
.rv-write-box label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: #2c3259;
}
.rv-write-box input,
.rv-write-box select,
.rv-write-box textarea {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #ccd3ec;
  border-radius: 10px;
  background: #ffffff;
  font-family: inherit;
}
.rv-star-picker {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 4px;
}
.rv-star-picker button {
  background: none;
  border: none;
  font-size: 1.45rem;
  color: #cfd5e8;
  cursor: pointer;
  padding: 0 2px;
}
.rv-star-picker button.on {
  color: #f59e0b;
}
.rv-star-picker span {
  margin-left: 8px;
  font-size: 0.84rem;
  font-weight: 700;
  color: #2c3259;
}
.rv-write-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}
.rv-toast-msg {
  padding: 12px 16px;
  border-radius: 10px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  font-weight: 600;
  margin-bottom: 20px;
}

.rv-testi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.rv-testi-card {
  background: #ffffff;
  border: 1px solid #e3e7f5;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}
.rv-testi-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.rv-stars {
  color: #f59e0b;
  font-size: 1.02rem;
  letter-spacing: 1px;
}
.rv-verified-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  background: #ecfdf5;
  color: #047857;
}
.rv-testi-comment {
  font-size: 0.92rem;
  line-height: 1.68;
  color: #272d52;
  margin: 0 0 14px;
  flex: 1;
}
.rv-testi-author {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #676e92;
  margin-bottom: 12px;
}
.rv-testi-author strong {
  color: #191e42;
}
.rv-testi-prod {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: #f7f8fc;
  border: 1px solid #e7ebf7;
}
.rv-testi-prod img {
  width: 38px;
  height: 38px;
  object-fit: contain;
  background: #ffffff;
  border-radius: 6px;
}
.rv-testi-prod .sku {
  display: block;
  font-size: 0.7rem;
  color: #6b7296;
}
.rv-testi-prod strong {
  display: block;
  font-size: 0.8rem;
  color: #1a1f45;
}
.rv-testi-prod .go {
  margin-left: auto;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--brand);
  white-space: nowrap;
}

.rv-empty {
  text-align: center;
  padding: 48px 20px;
  background: #f9fafe;
  border-radius: 16px;
  border: 1px dashed #d3d9ee;
}

@media (max-width: 980px) {
  .rv-hero-inner,
  .rv-spotlight,
  .rv-write-grid {
    grid-template-columns: 1fr;
  }
  .rv-grid,
  .rv-testi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .rv-grid,
  .rv-testi-grid,
  .rv-hero-stats {
    grid-template-columns: 1fr;
  }
}
</style>
