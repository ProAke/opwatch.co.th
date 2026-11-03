<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
const reqFetch = useRequestFetch()

const toast = useToast()

const { data: homeData } = await useAsyncData('op-home-data', async () => {
  const [prodRes, brandRes, promoRes] = await Promise.all([
    reqFetch<{ items?: any[]; products?: any[]; total?: number }>('/api/products?featured=true&limit=24'),
    reqFetch<{ items?: any[]; brands?: any[] }>('/api/brands'),
    reqFetch<any>('/api/promotions?home=1').catch(() => ({ items: [], promoProducts: [], coupons: [], promoHomeEnabled: true, promoHomeColumns: 4 }))
  ])
  const allProducts = prodRes?.items || prodRes?.products || []
  const allBrands = brandRes?.items || brandRes?.brands || []
  return { allProducts, allBrands, promoRes }
})

const promoBanners = computed(() => homeData.value?.promoRes?.items || [])
const promoProducts = computed(() => homeData.value?.promoRes?.promoProducts || [])
const promoCoupons = computed(() => (homeData.value?.promoRes?.coupons || []).slice(0, 3))
const promoHomeEnabled = computed(() => homeData.value?.promoRes?.promoHomeEnabled !== false)
const promoCols = ref<3 | 4 | 6>(
  [3, 4, 6].includes(Number(homeData.value?.promoRes?.promoHomeColumns))
    ? (Number(homeData.value?.promoRes?.promoHomeColumns) as 3 | 4 | 6)
    : 4
)
watch(
  () => homeData.value?.promoRes?.promoHomeColumns,
  (v) => {
    if ([3, 4, 6].includes(Number(v))) promoCols.value = Number(v) as 3 | 4 | 6
  }
)

function collectCoupon(code: string) {
  if (!import.meta.client || !code) return
  try {
    const raw = localStorage.getItem('opwatch_saved_coupons')
    const arr = raw ? JSON.parse(raw) : []
    if (!arr.includes(code)) arr.push(code)
    localStorage.setItem('opwatch_saved_coupons', JSON.stringify(arr))
    navigator.clipboard?.writeText(code).catch(() => {})
    toast.success(locale.value === 'th' ? `เก็บคูปอง ${code} เรียบร้อย ใช้ลดหน้าชำระเงินได้ทันที` : `Saved voucher ${code}!`)
  } catch {}
}

/* 1. Full-Viewport Hero Slides (exact olympianus.com Banner01 / Banner02 / Banner03) */
const heroSlides = computed(() => [
  {
    image: '/images/op/hero-diver-dark.jpg',
    code: '899832AGS',
    subtitle: locale.value === 'th' ? 'Olympianus Automatic Diver · กระจกแซฟไฟร์แท้' : 'Olympianus Automatic Diver · Sapphire Crystal',
    link: { path: localePath('/products/olympianus-899832ags-black') }
  },
  {
    image: '/images/op/hero-ceramic-dark.jpg',
    code: 'OGIVAL 1903',
    subtitle: locale.value === 'th' ? 'Swiss Lucky Fish Haute Horlogerie · ครบ 177 รุ่นทางการ' : 'Swiss Lucky Fish Haute Horlogerie · 177 Official Models',
    link: { path: localePath('/brands/ogival') }
  },
  {
    image: '/images/op/hero-gold-stones.jpg',
    code: '99141-71AGSK',
    subtitle: locale.value === 'th' ? 'Olympianus Open-Heart Automatic · ครบ 222 รุ่นทางการ' : 'Olympianus Open-Heart Automatic · 222 Official Models',
    link: { path: localePath('/brands/olympianus') }
  }
])

const activeHero = ref(0)
let heroTimer: ReturnType<typeof setInterval> | null = null

function nextHero() {
  activeHero.value = (activeHero.value + 1) % heroSlides.value.length
}
function prevHero() {
  activeHero.value = (activeHero.value - 1 + heroSlides.value.length) % heroSlides.value.length
}

/* 2. RECOMMEND — 6 Studio Cutout Timepieces (Olym Pianus + Olympia Star + Ogival) */
const recommendedProducts = computed(() => {
  const list = homeData.value?.allProducts || []
  const op = list.filter((p: any) => p.brandSlug === 'olympianus')
  const opa = list.filter((p: any) => p.brandSlug === 'olympia-star')
  const og = list.filter((p: any) => p.brandSlug === 'ogival')
  if (op.length >= 2 && opa.length >= 2 && og.length >= 2) {
    return [...op.slice(0, 2), ...opa.slice(0, 2), ...og.slice(0, 2)]
  }
  return list.slice(0, 6)
})

/* 3. Full-Bleed 1000x1500 Portrait Carousel (exact 8 OP studio vertical frames) */
const portraitFrames = [
  { img: '/images/op/portrait-8934msk.jpg', model: '8934MSK', query: { q: '8934' } },
  { img: '/images/op/portrait-82671m.jpg', model: '82671M', query: { q: '82671' } },
  { img: '/images/op/portrait-99141agnsk.jpg', model: '99141-71AGSK', query: { q: '99141' } },
  { img: '/images/op/portrait-8909amk.jpg', model: '890-09AMK', query: { q: '890-09' } },
  { img: '/images/op/portrait-diver.jpg', model: '899832AGS', query: { q: '899832' } },
  { img: '/images/op/openheart-stones.jpg', model: '990-163AMSK', query: { q: '990-163' } },
  { img: '/images/op/square-diver-glow.jpg', model: '899831G1S', query: { q: '899831' } },
  { img: '/images/op/square-gold-stones.jpg', model: '899833G1', query: { q: '899833' } }
]
const portraitOffset = ref(0)
function slidePortraits(dir: number) {
  const maxStart = portraitFrames.length - 5
  portraitOffset.value = Math.max(0, Math.min(maxStart, portraitOffset.value + dir))
}

/* 5. Full-Bleed 1920x1280 Lifestyle Slider (Men / Lady / Sport) */
const lifestyleSlides = computed(() => [
  {
    img: '/images/op/lifestyle-men.jpg',
    tag: 'MEN COLLECTION',
    title: locale.value === 'th' ? 'เรือนเวลาสุภาพบุรุษเหนือระดับ' : 'Refined Masculine Presence',
    to: { path: localePath('/products'), query: { category: 'men-watches' } }
  },
  {
    img: '/images/op/lifestyle-lady.jpg',
    tag: 'LADIES COLLECTION',
    title: locale.value === 'th' ? 'ความสง่างามเหนือกาลเวลาสำหรับสุภาพสตรี' : 'Graceful Brilliance on Every Wrist',
    to: { path: localePath('/products'), query: { category: 'women-watches' } }
  },
  {
    img: '/images/op/lifestyle-sport.jpg',
    tag: 'SPORT & DIVER',
    title: locale.value === 'th' ? 'สมรรถนะสปอร์ตผสานจิตวิญญาณโอลิมปิก' : 'Engineered for Dynamic Precision',
    to: { path: localePath('/products'), query: { category: 'sport-watches' } }
  }
])
const activeLife = ref(0)
function nextLife() {
  activeLife.value = (activeLife.value + 1) % lifestyleSlides.value.length
}
function prevLife() {
  activeLife.value = (activeLife.value - 1 + lifestyleSlides.value.length) % lifestyleSlides.value.length
}

/* 6. COLLECTIONS Interactive 6-Category Showcase (exact olympianus.com #ebebf1 + .IconTable) */
const collectionEntries = computed(() => [
  {
    key: 'men',
    en: 'Men Watch',
    th: 'นาฬิกาผู้ชาย',
    roman: 'I',
    preview: '/images/op/watch-990-083-blue.png',
    model: '990-083 · Royal Sapphire Dial',
    query: { category: 'men-watches' }
  },
  {
    key: 'ladies',
    en: 'Ladies Watch',
    th: 'นาฬิกาผู้หญิง',
    roman: 'II',
    preview: '/images/op/watch-990-45-lady.png',
    model: '990-45LS · Crystal Sport-Luxury',
    query: { category: 'women-watches' }
  },
  {
    key: 'sport',
    en: 'Sport Watch',
    th: 'นาฬิกาสปอร์ต',
    roman: 'III',
    preview: '/images/op/watch-899831-green.png',
    model: '899831 · Emerald Sport Bezel',
    query: { category: 'sport-watches' }
  },
  {
    key: 'classic',
    en: 'Classic Watch',
    th: 'นาฬิกาคลาสสิก',
    roman: 'IV',
    preview: '/images/op/watch-130-06-white.png',
    model: '130-06 · Slim Classic Dress',
    query: { category: 'classic-watches' }
  },
  {
    key: 'couple',
    en: 'Couple Watch',
    th: 'นาฬิกาคู่รัก (His & Hers)',
    roman: 'V',
    preview: '/images/op/watch-990-163-black.png',
    model: 'Ogival & Olympianus Pair Watches',
    query: { category: 'couple-watches' }
  },
  {
    key: 'jewelry',
    en: 'Jewelry Watch',
    th: 'นาฬิกาจิวเวลรี่เพชร & คามิลเลีย',
    roman: 'VI',
    preview: '/images/op/watch-82672-lady.png',
    model: 'Ogival Camellia & Ceramic Series',
    query: { category: 'women-jewelry' }
  }
])
const hoveredCollection = ref(0)

/* Three Official Watch Brands Distributed by บริษัท อินเตอร์ไทมส์ จำกัด */
const brandCards = computed(() => [
  {
    slug: 'olympianus',
    name: 'Olym Pianus',
    logo: '/images/logos/olym-pianus.jpg',
    origin: locale.value === 'th' ? 'JAPANESE MOVEMENT · SAPPHIRE CRYSTAL' : 'JAPANESE MOVEMENT · SAPPHIRE CRYSTAL',
    desc: locale.value === 'th'
      ? 'นาฬิกาข้อมือกลไกออโตเมติกและควอตซ์ต้นตำรับจากญี่ปุ่น พร้อมกระจกแซฟไฟร์แท้กันรอยขีดข่วนทุกรุ่น'
      : 'Authentic Japanese automatic and precision quartz timepieces fitted with scratch-resistant sapphire crystal.'
  },
  {
    slug: 'olympia-star',
    name: 'Olympia Star',
    logo: '/images/logos/olympia-star.jpg',
    origin: locale.value === 'th' ? 'SWISS MOVEMENT · SAPPHIRE CRYSTAL' : 'SWISS MOVEMENT · SAPPHIRE CRYSTAL',
    desc: locale.value === 'th'
      ? 'สายผลิตภัณฑ์เครื่องสวิสแท้ภายใต้ตรามงกุฎและช่อมะกอกคู่แห่งชัยชนะ ผสานกระจกแซฟไฟร์และสแตนเลส 316L'
      : 'Crowned OP shield with twin olive laurels powered by precision Swiss movements beneath sapphire crystal.'
  },
  {
    slug: 'ogival',
    name: 'Ogival',
    logo: '/images/logos/ogival.jpg',
    origin: locale.value === 'th' ? 'SWISS HAUTE HORLOGERIE · SINCE 1903' : 'SWISS HAUTE HORLOGERIE · SINCE 1903',
    desc: locale.value === 'th'
      ? 'ตำนานปลากระโดดแห่งความโชคดีจากสวิตเซอร์แลนด์ตั้งแต่ปี 1903 ครบทั้งรุ่นออโตเมติก คามิลเลีย ดาวตก และเพชรแท้'
      : 'Swiss lucky leaping fish watchmaking from La Chaux-de-Fonds since 1903 — mechanical, Camellia, and diamond series.'
  }
])

function scrollToRecommend() {
  if (import.meta.client) {
    document.getElementById('op-recommend')?.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  heroTimer = setInterval(nextHero, 6500)
})
onBeforeUnmount(() => {
  if (heroTimer) clearInterval(heroTimer)
})
</script>

<template>
  <div class="op-home">
    <!-- =====================================================================
         SECTION 1: FULL-VIEWPORT HERO SLIDER (Exact olympianus.com Slider)
         ===================================================================== -->
    <section class="op-hero" aria-label="Featured Watch">
      <div
        v-for="(slide, idx) in heroSlides"
        :key="slide.image"
        class="op-hero__slide"
        :class="{ 'is-active': idx === activeHero }"
      >
        <img :src="slide.image" :alt="slide.code" class="op-hero__img" />
        <div class="op-hero__vignette" />
      </div>

      <!-- Exact olympianus.com 60x60 Circular Outline Arrows (#fff -> bg #fff / #1d2088) -->
      <button type="button" class="op-hero__arrow op-hero__arrow--prev" aria-label="Previous slide" @click="prevHero">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
          <path d="m15 19-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <button type="button" class="op-hero__arrow op-hero__arrow--next" aria-label="Next slide" @click="nextHero">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
          <path d="m9 5 7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <!-- Bottom Bar: Scroll Cue + Wide 70x4 Bar Dots + Luxury Model Preview -->
      <div class="container op-hero__bottom">
        <button type="button" class="op-scroll-cue" @click="scrollToRecommend">
          <span>scroll</span>
          <span class="op-scroll-cue__line" />
        </button>

        <div class="op-hero__dots" role="tablist">
          <button
            v-for="(s, idx) in heroSlides"
            :key="s.code"
            type="button"
            class="op-hero__dot"
            :class="{ 'is-active': idx === activeHero }"
            :aria-label="`Slide ${idx + 1}`"
            @click="activeHero = idx"
          />
        </div>

        <NuxtLink :to="heroSlides[activeHero].link" class="op-hero__caption">
          <span class="op-hero__code">{{ heroSlides[activeHero].code }}</span>
          <span class="op-hero__sub">{{ heroSlides[activeHero].subtitle }}</span>
          <span class="op-hero__shop">{{ locale === 'th' ? 'ชมเรือนเวลา →' : 'Discover Timepiece →' }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- =====================================================================
         SECTION 1B: 3 OFFICIAL PRODUCT BRANDS (Olym Pianus · Olympia Star · Ogival)
         ===================================================================== -->
    <section class="section op-houses">
      <div class="container">
        <div class="op-sec-head">
          <h2 class="op-sec-title">{{ locale === 'th' ? 'OUR 3 WATCH BRANDS' : 'OUR 3 WATCH BRANDS' }}</h2>
          <p class="op-sec-sub">
            {{
              locale === 'th'
                ? 'เลือกชมประเภทสินค้าตาม 3 แบรนด์นาฬิกาชั้นนำของแท้ จัดจำหน่ายอย่างเป็นทางการในประเทศไทยโดย บริษัท อินเตอร์ไทมส์ จำกัด'
                : 'Explore authentic timepieces across our three official watch brands distributed in Thailand by Inter Times Co., Ltd.'
            }}
          </p>
        </div>

        <div class="op-houses__grid">
          <NuxtLink
            v-for="b in brandCards"
            :key="b.slug"
            :to="localePath(`/brands/${b.slug}`)"
            class="op-houses__card"
          >
            <div class="op-houses__logo-wrap">
              <img :src="b.logo" :alt="b.name" class="op-houses__logo" loading="lazy" />
            </div>
            <span class="op-houses__origin">{{ b.origin }}</span>
            <h3>{{ b.name }}</h3>
            <p>{{ b.desc }}</p>
            <span class="op-houses__cta">
              {{ locale === 'th' ? 'เลือกชมสินค้าแบรนด์นี้ →' : 'Shop Brand →' }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- =====================================================================
         SECTION 1C: OFFICIAL PROMOTIONS & SPECIAL PRIVILEGES (Right below 3 Brand Logos)
         Graphic Campaign Banner + 3 | 4 | 6 Column Promo Watch Grid
         ===================================================================== -->
    <section v-if="promoHomeEnabled && (promoBanners.length || promoProducts.length)" class="section op-home-promo">
      <div class="container">
        <div class="op-home-promo__head">
          <div>
            <span class="op-home-promo__eyebrow">
              {{ locale === 'th' ? 'EXCLUSIVE CAMPAIGN & SPECIAL OFFERS' : 'EXCLUSIVE CAMPAIGN & SPECIAL OFFERS' }}
            </span>
            <h2 class="op-sec-title" style="text-align:left;margin-top:4px">
              {{ locale === 'th' ? 'โปรโมชั่นพิเศษประจำเดือน' : 'FEATURED PROMOTIONS' }}
            </h2>
          </div>

          <div class="op-home-promo__controls">
            <div class="op-home-promo__cols" role="group" aria-label="Grid columns">
              <span>{{ locale === 'th' ? 'แสดงผลต่อแถว:' : 'Per Row:' }}</span>
              <button type="button" :class="{ 'is-active': promoCols === 3 }" @click="promoCols = 3">3</button>
              <button type="button" :class="{ 'is-active': promoCols === 4 }" @click="promoCols = 4">4</button>
              <button type="button" :class="{ 'is-active': promoCols === 6 }" @click="promoCols = 6">6</button>
            </div>
            <NuxtLink :to="localePath('/promotions')" class="btn btn--sm">
              {{ locale === 'th' ? 'ดูโปรโมชั่นทุกช่องทาง →' : 'All Channel Deals →' }}
            </NuxtLink>
          </div>
        </div>

        <!-- Graphic Campaign Banner(s) -->
        <div v-if="promoBanners.length" class="op-home-promo__banners">
          <div
            v-for="b in promoBanners.slice(0, 2)"
            :key="b.id || b.slug"
            class="op-promo-hero-card"
            :class="{ 'is-full': promoBanners.length === 1 }"
          >
            <img :src="b.bannerImage" :alt="b.titleTh" class="op-promo-hero-card__img" loading="lazy" />
            <div class="op-promo-hero-card__overlay">
              <span v-if="b.badgeText" class="op-promo-hero-card__badge">{{ b.badgeText }}</span>
              <h3>{{ locale === 'en' && b.titleEn ? b.titleEn : b.titleTh }}</h3>
              <p>{{ locale === 'en' && b.subtitleEn ? b.subtitleEn : b.subtitleTh }}</p>
              <div class="op-promo-hero-card__actions">
                <a
                  v-if="b.targetUrl && b.targetUrl.startsWith('http')"
                  :href="b.targetUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn--sm op-promo-hero-card__cta"
                >
                  {{ locale === 'en' && b.ctaEn ? b.ctaEn : b.ctaTh || 'รับสิทธิ์โปรโมชั่น' }} ↗
                </a>
                <NuxtLink
                  v-else
                  :to="localePath(b.targetUrl || '/promotions')"
                  class="btn btn--sm op-promo-hero-card__cta"
                >
                  {{ locale === 'en' && b.ctaEn ? b.ctaEn : b.ctaTh || 'ช้อปโปรโมชั่นนี้' }} →
                </NuxtLink>

                <button
                  v-if="b.couponCode"
                  type="button"
                  class="op-promo-hero-card__code"
                  @click="collectCoupon(b.couponCode)"
                >
                  🎟 {{ locale === 'th' ? `เก็บโค้ด ${b.couponCode}` : `Collect ${b.couponCode}` }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Collectible Quick Voucher Strip (Central Style) -->
        <div v-if="promoCoupons.length" class="op-home-vouchers">
          <div v-for="cp in promoCoupons" :key="cp.code" class="op-home-voucher">
            <div class="op-home-voucher__left">
              <strong>{{ cp.type === 'percent' ? `ลด ${cp.value}%` : `ลด ฿${Number(cp.value).toLocaleString()}` }}</strong>
              <span>{{ locale === 'en' && cp.titleEn ? cp.titleEn : cp.titleTh }}</span>
              <small v-if="cp.minSpend">ขั้นต่ำ ฿{{ Number(cp.minSpend).toLocaleString() }}</small>
            </div>
            <button type="button" class="op-home-voucher__btn" @click="collectCoupon(cp.code)">
              {{ locale === 'th' ? 'เก็บคูปอง' : 'Collect' }}
              <code>{{ cp.code }}</code>
            </button>
          </div>
        </div>

        <!-- Promotional Watch Grid: 3, 4, or 6 Columns per Row -->
        <div
          v-if="promoProducts.length"
          class="op-home-promo__grid"
          :class="`cols-${promoCols}`"
        >
          <ProductCard
            v-for="item in promoProducts.slice(0, promoCols === 6 ? 12 : promoCols === 4 ? 8 : 6)"
            :key="'promo-' + (item.id || item.slug)"
            :product="item"
          />
        </div>
      </div>
    </section>

    <!-- =====================================================================
         SECTION 2: RECOMMEND — 3x2 Studio Cutout Grid on #f8f8f8 (main_color)
         ===================================================================== -->
    <section id="op-recommend" class="section op-recommend">
      <div class="container">
        <div class="op-sec-head">
          <h2 class="op-sec-title">RECOMMEND</h2>
          <p class="op-sec-sub">
            {{
              locale === 'th'
                ? 'คัดสรรเรือนเวลายอดนิยมจาก Olym Pianus, Olympia Star และ Ogival พร้อมสั่งซื้อออนไลน์ทันที'
                : 'Curated signature timepieces crafted with sapphire crystal and enduring horological artistry.'
            }}
          </p>
        </div>

        <div class="op-recommend__grid">
          <ProductCard
            v-for="item in recommendedProducts"
            :key="item.id || item.slug"
            :product="item"
          />
        </div>

        <div class="center op-recommend__cta">
          <NuxtLink :to="localePath('/products')" class="btn btn--ghost">
            Collections
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- =====================================================================
         SECTION 3: FULL-BLEED 1000x1500 PORTRAIT STRIP CAROUSEL
         ===================================================================== -->
    <section class="op-portraits" aria-label="Timepiece Gallery">
      <button
        type="button"
        class="op-portraits__nav op-portraits__nav--prev"
        :disabled="portraitOffset === 0"
        aria-label="Previous watches"
        @click="slidePortraits(-1)"
      >
        ‹
      </button>

      <div class="op-portraits__viewport">
        <div
          class="op-portraits__track"
          :style="{ transform: `translateX(-${portraitOffset * 20}%)` }"
        >
          <NuxtLink
            v-for="frame in portraitFrames"
            :key="frame.img"
            :to="{ path: localePath('/products'), query: frame.query }"
            class="op-portraits__item"
          >
            <img :src="frame.img" :alt="frame.model" loading="lazy" />
            <div class="op-portraits__caption">
              <span>{{ frame.model }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <button
        type="button"
        class="op-portraits__nav op-portraits__nav--next"
        :disabled="portraitOffset >= portraitFrames.length - 5"
        aria-label="Next watches"
        @click="slidePortraits(1)"
      >
        ›
      </button>
    </section>

    <!-- =====================================================================
         SECTION 4: FULL-WIDTH LUMINOUS FEATURE BANNER (899832AGS)
         ===================================================================== -->
    <section class="op-feature-banner">
      <img src="/images/op/banner-899832ags.jpg" alt="Olym Pianus Luminous Bezel 899832AGS" class="op-feature-banner__img" loading="lazy" />
      <div class="op-feature-banner__overlay">
        <div class="container op-feature-banner__content">
          <p class="op-feature-banner__eyebrow">LUMINOUS PRECISION · SAPPHIRE CRYSTAL</p>
          <h2>
            {{
              locale === 'th'
                ? 'เปล่งประกายชัดเจนในทุกมิติแห่งเวลา'
                : 'Crafted to Radiate Through Every Hour'
            }}
          </h2>
          <p>
            {{
              locale === 'th'
                ? 'พรายน้ำสว่างคมชัด ขอบเซรามิกหมุนได้ทิศทางเดียว และกระจกแซฟไฟร์แท้ป้องกันรอยขีดข่วน'
                : 'High-luminosity markers, unidirectional diver bezel, and scratch-resistant sapphire crystal.'
            }}
          </p>
          <NuxtLink :to="{ path: localePath('/products'), query: { category: 'sport-watches' } }" class="btn btn--ghost-light">
            {{ locale === 'th' ? 'สำรวจคอลเลกชันสปอร์ต' : 'Explore Sport Watches' }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- =====================================================================
         SECTION 5: FULL-BLEED 1920x1280 LIFESTYLE SLIDER (Men / Lady / Sport)
         ===================================================================== -->
    <section class="op-lifestyle">
      <div
        v-for="(slide, idx) in lifestyleSlides"
        :key="slide.img"
        class="op-lifestyle__slide"
        :class="{ 'is-active': idx === activeLife }"
      >
        <img :src="slide.img" :alt="slide.tag" loading="lazy" />
        <div class="op-lifestyle__scrim" />
        <div class="container op-lifestyle__cap">
          <span class="op-lifestyle__tag">{{ slide.tag }}</span>
          <h3>{{ slide.title }}</h3>
          <NuxtLink :to="slide.to" class="btn btn--ghost-light btn--sm">
            {{ locale === 'th' ? 'ดูคอลเลกชัน' : 'View Collection' }}
          </NuxtLink>
        </div>
      </div>

      <button type="button" class="op-lifestyle__arrow op-lifestyle__arrow--prev" aria-label="Previous" @click="prevLife">‹</button>
      <button type="button" class="op-lifestyle__arrow op-lifestyle__arrow--next" aria-label="Next" @click="nextLife">›</button>

      <div class="op-lifestyle__dots">
        <button
          v-for="(s, idx) in lifestyleSlides"
          :key="s.tag"
          type="button"
          :class="{ 'is-active': idx === activeLife }"
          :aria-label="s.tag"
          @click="activeLife = idx"
        />
      </div>
    </section>

    <!-- =====================================================================
         SECTION 6: COLLECTIONS — Exact olympianus.com #ebebf1 + .IconTable
         ===================================================================== -->
    <section class="section op-collections">
      <div class="container">
        <div class="op-sec-head">
          <h2 class="op-sec-title">COLLECTIONS</h2>
          <p class="op-sec-sub">
            {{
              locale === 'th'
                ? 'แรงบันดาลใจจากเกียรติยศสูงสุดแห่งจิตวิญญาณโอลิมปิก ผสานศิลปะแห่งเรือนเวลาเข้ากับดีไซน์ร่วมสมัยอย่างลงตัว'
                : 'Inspired by the ultimate glory of the Olympic spirit, fusing exquisite craftsmanship and contemporary watchmaking.'
            }}
          </p>
        </div>

        <div class="op-collections__split">
          <!-- Left: Pure #ffffff Studio Watch Pedestal -->
          <div class="op-collections__stage">
            <img
              :src="collectionEntries[hoveredCollection].preview"
              :alt="collectionEntries[hoveredCollection].en"
              class="op-collections__watch"
            />
            <p class="op-collections__model">{{ collectionEntries[hoveredCollection].model }}</p>
          </div>

          <!-- Right: Exact olympianus.com .IconTable 6-Category Menu -->
          <div class="op-collections__list">
            <NuxtLink
              v-for="(entry, idx) in collectionEntries"
              :key="entry.key"
              :to="{ path: localePath('/products'), query: entry.query }"
              class="op-collections__row"
              :class="{ 'is-active': idx === hoveredCollection }"
              @mouseenter="hoveredCollection = idx"
            >
              <div class="op-collections__left">
                <span class="op-collections__medallion">{{ entry.roman }}</span>
                <div>
                  <span class="op-collections__en">{{ entry.en }}</span>
                  <span v-if="locale === 'th'" class="op-collections__th">{{ entry.th }}</span>
                </div>
              </div>
              <span class="op-collections__arrow">→</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- =====================================================================
         SECTION 7: ASYMMETRIC BRAND STORY SPLIT (#f8f8f8 + 899833G1B_AD)
         ===================================================================== -->
    <section class="op-story">
      <div class="op-story__text">
        <div class="op-story__inner">
          <OpCrest size="md" theme="light" sublabel="HERITAGE & CRAFTSMANSHIP" />

          <h2 class="op-story__heading">
            {{
              locale === 'th'
                ? 'จิตวิญญาณแห่งความเที่ยงตรง สู่เรือนเวลาคู่ข้อมือ'
                : 'The Spirit of Glory Upon Every Wrist'
            }}
          </h2>

          <p class="op-story__quote">
            {{
              locale === 'th'
                ? 'ถือกำเนิดจากเกียรติยศแห่งจิตวิญญาณโอลิมปิก ผสานงานฝีมืออันประณีตเข้ากับนวัตกรรมเรือนเวลาร่วมสมัย เพื่อส่งมอบคุณค่าเหนือกาลเวลาในทุกวินาที'
                : 'Inspired by the ultimate glory of the Olympic spirit, fusing exquisite craftsmanship and contemporary watchmaking into every timepiece.'
            }}
          </p>

          <span class="op-story__slash">/</span>

          <NuxtLink :to="localePath('/about')" class="btn btn--line">
            MORE
          </NuxtLink>
        </div>
      </div>

      <div class="op-story__poster">
        <img src="/images/op/portrait-99141agnsk.jpg" alt="Olym Pianus Advertisement" loading="lazy" />
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 1. HERO SLIDER */
.op-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 640px;
  max-height: 1020px;
  background: var(--ink);
  overflow: hidden;
}
.op-hero__slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1.1s ease, transform 6.5s ease-out;
  transform: scale(1.03);
}
.op-hero__slide.is-active {
  opacity: 1;
  transform: scale(1);
  z-index: 1;
}
.op-hero__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.op-hero__vignette {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(20, 22, 52, 0.44) 0%,
    rgba(20, 22, 52, 0.06) 44%,
    rgba(20, 22, 52, 0.62) 100%
  );
}

/* Exact olympianus.com enfold_child.css 60x60px circular slider arrows */
.op-hero__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 4;
  width: 60px;
  height: 60px;
  border-radius: 60px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.85);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s var(--ease), color 0.3s var(--ease), border-color 0.3s var(--ease);
}
.op-hero__arrow:hover {
  background: #ffffff;
  border-color: #ffffff;
  color: var(--sapphire);
}
.op-hero__arrow--prev { left: 28px; }
.op-hero__arrow--next { right: 28px; }

.op-hero__bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 30px;
  z-index: 4;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  gap: 20px;
}
.op-hero__bottom .op-scroll-cue {
  justify-self: start;
}

/* Exact olympianus.com wide horizontal bar dots (70px x 4px) */
.op-hero__dots {
  display: flex;
  gap: 12px;
  padding-bottom: 14px;
}
.op-hero__dot {
  width: 64px;
  height: 4px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.85);
  background: transparent;
  transition: background 0.3s;
}
.op-hero__dot.is-active {
  background: #ffffff;
}

.op-hero__caption {
  justify-self: end;
  text-align: right;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 22px;
  background: rgba(25, 26, 53, 0.52);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.22);
  transition: border-color 0.25s, background 0.25s;
}
.op-hero__caption:hover {
  background: rgba(29, 32, 136, 0.78);
  border-color: rgba(255, 255, 255, 0.65);
}
.op-hero__code {
  font-family: var(--font-roman);
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.22em;
}
.op-hero__sub {
  font-family: var(--font-display);
  font-size: 15.5px;
  color: rgba(255, 255, 255, 0.88);
}
.op-hero__shop {
  font-family: var(--font-roman);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--champagne-soft);
  margin-top: 3px;
}

/* 2. RECOMMEND (olympianus.com #f8f8f8 main_color) */
.op-recommend {
  background: var(--ivory);
}
.op-recommend__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
}
.op-recommend__cta {
  margin-top: 52px;
}

/* 3. PORTRAIT STRIP CAROUSEL (1000x1500) */
.op-portraits {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: var(--paper);
}
.op-portraits__viewport {
  width: 100%;
  overflow: hidden;
}
.op-portraits__track {
  display: flex;
  transition: transform 0.65s var(--ease);
}
.op-portraits__item {
  flex: 0 0 20%;
  aspect-ratio: 2 / 3;
  position: relative;
  overflow: hidden;
}
.op-portraits__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s var(--ease);
}
.op-portraits__item:hover img {
  transform: scale(1.06);
}
.op-portraits__caption {
  position: absolute;
  inset: auto 0 0 0;
  padding: 20px 14px 16px;
  background: linear-gradient(transparent, rgba(25, 26, 53, 0.84));
  color: #ffffff;
  text-align: center;
  font-family: var(--font-roman);
  font-size: 11px;
  letter-spacing: 0.22em;
  opacity: 0;
  transition: opacity 0.3s;
}
.op-portraits__item:hover .op-portraits__caption {
  opacity: 1;
}

/* Exact olympianus.com .TabSection 60x60px circular Royal Sapphire arrows */
.op-portraits__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 4;
  width: 56px;
  height: 56px;
  border-radius: 56px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--sapphire);
  color: var(--sapphire);
  font-size: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow);
  transition: background 0.25s, color 0.25s;
}
.op-portraits__nav:hover:not(:disabled) {
  background: var(--sapphire);
  color: #ffffff;
}
.op-portraits__nav:disabled {
  opacity: 0.28;
  cursor: default;
}
.op-portraits__nav--prev { left: 20px; }
.op-portraits__nav--next { right: 20px; }

/* 4. FEATURE LUMINOUS BANNER */
.op-feature-banner {
  position: relative;
  width: 100%;
  min-height: 540px;
  max-height: 760px;
  overflow: hidden;
  display: flex;
  align-items: center;
  background: var(--ink);
}
.op-feature-banner__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.op-feature-banner__overlay {
  position: relative;
  z-index: 2;
  width: 100%;
  padding-block: 96px;
  background: linear-gradient(90deg, rgba(19, 21, 56, 0.84) 0%, rgba(19, 21, 56, 0.44) 55%, rgba(19, 21, 56, 0.14) 100%);
}
.op-feature-banner__content {
  max-width: 580px;
  margin-left: max(32px, calc((100vw - var(--container)) / 2 + 32px));
  margin-right: auto;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
}
.op-feature-banner__eyebrow {
  font-family: var(--font-roman);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3em;
  color: var(--champagne-soft);
}
.op-feature-banner__content h2 {
  color: #ffffff;
  font-family: var(--font-display);
  font-size: clamp(2rem, 3.6vw, 3rem);
  font-weight: 500;
  letter-spacing: 0.04em;
  line-height: 1.24;
}
.op-feature-banner__content p {
  font-family: var(--font-display);
  color: rgba(255, 255, 255, 0.88);
  font-size: 18px;
  line-height: 1.75;
}

/* 5. LIFESTYLE SLIDER */
.op-lifestyle {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 460px;
  max-height: 800px;
  background: var(--ink);
  overflow: hidden;
}
.op-lifestyle__slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.9s ease;
  display: flex;
  align-items: flex-end;
}
.op-lifestyle__slide.is-active {
  opacity: 1;
  z-index: 1;
}
.op-lifestyle__slide img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.op-lifestyle__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 22, 52, 0.08) 40%, rgba(20, 22, 52, 0.76) 100%);
}
.op-lifestyle__cap {
  position: relative;
  z-index: 2;
  padding-bottom: 58px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}
.op-lifestyle__tag {
  font-family: var(--font-roman);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.28em;
  color: var(--champagne-soft);
}
.op-lifestyle__cap h3 {
  color: #ffffff;
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 3vw, 2.55rem);
  font-weight: 500;
  letter-spacing: 0.04em;
}
.op-lifestyle__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  width: 56px;
  height: 56px;
  border-radius: 56px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.8);
  color: #ffffff;
  font-size: 26px;
  transition: background 0.25s, color 0.25s;
}
.op-lifestyle__arrow:hover {
  background: #ffffff;
  color: var(--sapphire);
}
.op-lifestyle__arrow--prev { left: 24px; }
.op-lifestyle__arrow--next { right: 24px; }
.op-lifestyle__dots {
  position: absolute;
  bottom: 24px;
  right: 34px;
  z-index: 3;
  display: flex;
  gap: 10px;
}
.op-lifestyle__dots button {
  width: 48px;
  height: 4px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.85);
  background: transparent;
}
.op-lifestyle__dots button.is-active { background: #ffffff; }

/* 6. COLLECTIONS — Exact olympianus.com #ebebf1 alternate_color + .IconTable */
.op-collections {
  background: var(--sand);
}
.op-collections__split {
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  gap: 56px;
  align-items: center;
}
.op-collections__stage {
  background: #ffffff;
  border: 1px solid var(--line-strong);
  padding: 40px 28px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 460px;
  box-shadow: var(--shadow-sm);
}
.op-collections__watch {
  max-height: 360px;
  width: auto;
  object-fit: contain;
  transition: transform 0.55s var(--ease);
}
.op-collections__stage:hover .op-collections__watch {
  transform: scale(1.04);
}
.op-collections__model {
  margin-top: 20px;
  font-family: var(--font-roman);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--sapphire);
}
.op-collections__list {
  display: flex;
  flex-direction: column;
  background: var(--ivory);
  border: 1px solid var(--line-strong);
  padding: 12px 28px;
}
.op-collections__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 8px;
  border-bottom: 1px solid var(--line-strong);
  transition: padding-left 0.3s var(--ease), color 0.25s;
}
.op-collections__row:last-child {
  border-bottom: 0;
}
.op-collections__row:hover,
.op-collections__row.is-active {
  padding-left: 16px;
}
.op-collections__left {
  display: flex;
  align-items: center;
  gap: 18px;
}
.op-collections__medallion {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  background: #ffffff;
  color: var(--sapphire);
  font-family: var(--font-roman);
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s, color 0.3s, border-color 0.3s;
}
.op-collections__row:hover .op-collections__medallion,
.op-collections__row.is-active .op-collections__medallion {
  background: var(--sapphire);
  border-color: var(--sapphire);
  color: #ffffff;
}
.op-collections__en {
  display: block;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: var(--ink);
  transition: color 0.25s;
}
.op-collections__row:hover .op-collections__en,
.op-collections__row.is-active .op-collections__en {
  color: var(--sapphire);
}
.op-collections__th {
  display: block;
  font-size: 12.5px;
  color: var(--ink-muted);
  margin-top: 1px;
}
.op-collections__arrow {
  font-size: 18px;
  color: var(--ink-faint);
  transition: transform 0.25s, color 0.25s;
}
.op-collections__row:hover .op-collections__arrow,
.op-collections__row.is-active .op-collections__arrow {
  color: var(--sapphire);
  transform: translateX(5px);
}

/* 7. ASYMMETRIC BRAND STORY SPLIT (#f8f8f8 Pearl + Poster) */
.op-story {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--ivory);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.op-story__text {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 88px 52px;
}
.op-story__inner {
  max-width: 490px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 22px;
}
.op-story__heading {
  font-family: var(--font-display);
  font-size: clamp(1.65rem, 2.5vw, 2.2rem);
  font-weight: 500;
  color: var(--ink);
  letter-spacing: 0.05em;
}
.op-story__quote {
  font-family: var(--font-display);
  font-size: 18.5px;
  font-weight: 400;
  line-height: 1.85;
  color: var(--ink-soft);
}
.op-story__slash {
  font-family: var(--font-display);
  font-size: 22px;
  color: var(--sapphire);
}
.op-story__poster {
  min-height: 540px;
  overflow: hidden;
}
.op-story__poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 3 OFFICIAL WATCH BRANDS WITH WHITE-BG LOGOS */
.op-houses {
  background: var(--paper);
  border-bottom: 1px solid var(--sand);
}
.op-houses__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
}
.op-houses__card {
  background: #ffffff;
  border: 1px solid var(--sand);
  border-bottom: 2px solid var(--sapphire);
  padding: 36px 28px 34px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  transition: transform 0.35s var(--ease), box-shadow 0.35s var(--ease), border-color 0.3s;
}
.op-houses__card:hover {
  transform: translateY(-5px);
  border-color: var(--sapphire);
  box-shadow: 0 18px 42px rgba(25, 26, 53, 0.1);
}
.op-houses__logo-wrap {
  width: 100%;
  height: 128px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.op-houses__logo {
  max-height: 122px;
  max-width: 210px;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: transform 0.4s var(--ease);
}
.op-houses__card:hover .op-houses__logo {
  transform: scale(1.05);
}
.op-houses__origin {
  font-family: var(--font-roman);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--sapphire);
}
.op-houses__card h3 {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--ink);
}
.op-houses__card p {
  font-size: 14.5px;
  color: var(--ink-soft);
  line-height: 1.75;
  flex: 1;
}
.op-houses__cta {
  margin-top: 8px;
  font-family: var(--font-roman);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--sapphire);
}

/* Homepage Promotions Section (Directly below 3 Brand Logos) */
.op-home-promo {
  background: linear-gradient(180deg, #ffffff 0%, #f3f5fc 100%);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.op-home-promo__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.op-home-promo__eyebrow {
  font-family: var(--font-roman);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.24em;
  color: var(--sapphire);
  text-transform: uppercase;
}
.op-home-promo__controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.op-home-promo__cols {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid var(--line-strong);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--muted);
}
.op-home-promo__cols button {
  border: 1px solid transparent;
  background: transparent;
  padding: 3px 9px;
  font-weight: 700;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--ink);
}
.op-home-promo__cols button.is-active {
  background: var(--sapphire);
  color: #ffffff;
}
.op-home-promo__banners {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 22px;
}
.op-promo-hero-card {
  position: relative;
  min-height: 290px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--line-strong);
  display: flex;
  align-items: flex-end;
}
.op-promo-hero-card.is-full {
  grid-column: 1 / -1;
  min-height: 340px;
}
.op-promo-hero-card__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.65s var(--ease);
}
.op-promo-hero-card:hover .op-promo-hero-card__img {
  transform: scale(1.04);
}
.op-promo-hero-card__overlay {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 28px;
  background: linear-gradient(0deg, rgba(11, 14, 42, 0.92) 0%, rgba(11, 14, 42, 0.55) 65%, rgba(11, 14, 42, 0.1) 100%);
  color: #ffffff;
}
.op-promo-hero-card__badge {
  display: inline-block;
  padding: 4px 10px;
  background: #c81e1e;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border-radius: 4px;
  margin-bottom: 8px;
}
.op-promo-hero-card__overlay h3 {
  font-family: var(--font-display);
  font-size: clamp(1.35rem, 2.2vw, 1.85rem);
  font-weight: 600;
  line-height: 1.28;
}
.op-promo-hero-card__overlay p {
  font-size: 13.5px;
  opacity: 0.9;
  margin-top: 6px;
  max-width: 620px;
}
.op-promo-hero-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
.op-promo-hero-card__cta {
  background: #ffffff !important;
  color: var(--sapphire) !important;
  border-color: #ffffff !important;
}
.op-promo-hero-card__code {
  background: rgba(255, 255, 255, 0.14);
  border: 1px dashed rgba(255, 255, 255, 0.65);
  color: #ffffff;
  padding: 7px 14px;
  border-radius: 4px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}
.op-home-vouchers {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}
.op-home-voucher {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #d5daf2;
  border-left: 4px solid var(--sapphire);
  border-radius: 8px;
  padding: 12px 14px;
}
.op-home-voucher__left strong { display: block; font-size: 16px; color: #b91c1c; }
.op-home-voucher__left span { display: block; font-size: 12.5px; color: var(--ink); }
.op-home-voucher__left small { font-size: 11px; color: var(--muted); }
.op-home-voucher__btn {
  background: var(--sapphire);
  color: #ffffff;
  border: 0;
  border-radius: 6px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.op-home-voucher__btn code { font-size: 10px; opacity: 0.9; }

.op-home-promo__grid {
  display: grid;
  gap: 18px;
}
.op-home-promo__grid.cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.op-home-promo__grid.cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.op-home-promo__grid.cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; }
.op-home-promo__grid.cols-6 :deep(.op-card__title) { font-size: 15px; }
.op-home-promo__grid.cols-6 :deep(.op-card__link) { padding: 12px 10px 16px; }

@media (max-width: 1100px) {
  .op-home-promo__grid.cols-6 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .op-home-promo__grid.cols-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .op-home-vouchers { grid-template-columns: 1fr; }
  .op-home-promo__banners { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .op-home-promo__grid.cols-3,
  .op-home-promo__grid.cols-4,
  .op-home-promo__grid.cols-6 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 1024px) {
  .op-recommend__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .op-portraits__item { flex: 0 0 33.333%; }
  .op-collections__split { grid-template-columns: 1fr; }
  .op-story { grid-template-columns: 1fr; }
  .op-houses__grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .op-recommend__grid { grid-template-columns: 1fr; }
  .op-portraits__item { flex: 0 0 50%; }
  .op-hero__bottom { grid-template-columns: 1fr; justify-items: center; }
  .op-hero__caption { justify-self: center; text-align: center; }
  .op-hero__arrow { width: 44px; height: 44px; }
  .op-hero__arrow--prev { left: 10px; }
  .op-hero__arrow--next { right: 10px; }
}
</style>
