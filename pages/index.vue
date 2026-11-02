<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
const reqFetch = useRequestFetch()

const { data: homeData } = await useAsyncData('op-home-data', async () => {
  const [prodRes, brandRes] = await Promise.all([
    reqFetch<{ items?: any[]; products?: any[] }>('/api/products?limit=24'),
    reqFetch<{ items?: any[]; brands?: any[] }>('/api/brands')
  ])
  const allProducts = prodRes?.items || prodRes?.products || []
  const allBrands = brandRes?.items || brandRes?.brands || []
  return { allProducts, allBrands }
})

/* 1. Full-Viewport Hero Slides (exact olympianus.com Banner01 / Banner02 / Banner03) */
const heroSlides = computed(() => [
  {
    image: '/images/op/hero-diver-dark.jpg',
    code: '899832AGS',
    subtitle: locale.value === 'th' ? 'Automatic Diver · กระจกแซฟไฟร์แท้' : 'Automatic Diver · Sapphire Crystal',
    link: { path: localePath('/products'), query: { category: 'men-diver' } }
  },
  {
    image: '/images/op/hero-ceramic-dark.jpg',
    code: '899831G',
    subtitle: locale.value === 'th' ? 'Sport Luxury Chronograph · ขอบสเกลทาคีมิเตอร์' : 'Sport Luxury Chronograph · Tachymeter Bezel',
    link: { path: localePath('/products'), query: { category: 'men' } }
  },
  {
    image: '/images/op/hero-gold-stones.jpg',
    code: '99141-71AGSK',
    subtitle: locale.value === 'th' ? 'Open-Heart Automatic · ตัวเรือนทูโทนพรีเมียม' : 'Open-Heart Automatic · Two-Tone Gold & Steel',
    link: { path: localePath('/products'), query: { brand: 'olympinus' } }
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

/* 2. RECOMMEND — 6 Studio Cutout Timepieces (3x2 grid) */
const recommendedProducts = computed(() => {
  const list = homeData.value?.allProducts || []
  const featured = list.filter((p: any) => p.featured)
  return (featured.length >= 6 ? featured : list).slice(0, 6)
})

/* 3. Full-Bleed 1000x1500 Portrait Carousel (exact 8 OP studio vertical frames) */
const portraitFrames = [
  { img: '/images/op/portrait-8934msk.jpg', model: '8934MSK', query: { category: 'men-dress' } },
  { img: '/images/op/portrait-82671m.jpg', model: '82671M', query: { category: 'men' } },
  { img: '/images/op/portrait-99141agnsk.jpg', model: '99141AGNSK', query: { brand: 'olympinus' } },
  { img: '/images/op/portrait-8909amk.jpg', model: '8909AMK', query: { category: 'men' } },
  { img: '/images/op/portrait-diver.jpg', model: '899832AGS', query: { category: 'men-diver' } },
  { img: '/images/op/openheart-stones.jpg', model: '990-163AMSK', query: { brand: 'olympinus' } },
  { img: '/images/op/square-diver-glow.jpg', model: '899831G', query: { category: 'men-diver' } },
  { img: '/images/op/square-gold-stones.jpg', model: '899833G1B', query: { sort: 'featured' } }
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
    to: { path: localePath('/products'), query: { category: 'men' } }
  },
  {
    img: '/images/op/lifestyle-lady.jpg',
    tag: 'LADIES COLLECTION',
    title: locale.value === 'th' ? 'ความสง่างามเหนือกาลเวลาสำหรับสุภาพสตรี' : 'Graceful Brilliance on Every Wrist',
    to: { path: localePath('/products'), query: { category: 'women' } }
  },
  {
    img: '/images/op/lifestyle-sport.jpg',
    tag: 'SPORT & DIVER',
    title: locale.value === 'th' ? 'สมรรถนะสปอร์ตผสานจิตวิญญาณโอลิมปิก' : 'Engineered for Dynamic Precision',
    to: { path: localePath('/products'), query: { category: 'men-diver' } }
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
    query: { category: 'men' }
  },
  {
    key: 'ladies',
    en: 'Ladies Watch',
    th: 'นาฬิกาผู้หญิง',
    roman: 'II',
    preview: '/images/op/watch-990-45-lady.png',
    model: '990-45LS · Diamond Mother-of-Pearl',
    query: { category: 'women' }
  },
  {
    key: 'sport',
    en: 'Sport Watch',
    th: 'นาฬิกาสปอร์ต',
    roman: 'III',
    preview: '/images/op/watch-899831-green.png',
    model: '899831 · Emerald Sport Bezel',
    query: { category: 'men-diver' }
  },
  {
    key: 'classic',
    en: 'Classic Watch',
    th: 'นาฬิกาคลาสสิก',
    roman: 'IV',
    preview: '/images/op/watch-130-06-white.png',
    model: '130-06 · Slim Roman Dress',
    query: { category: 'men-dress' }
  },
  {
    key: 'essential',
    en: 'Essential Selection',
    th: 'รุ่นยอดนิยมประจำบูติก',
    roman: 'V',
    preview: '/images/op/watch-990-163-black.png',
    model: '990-163 · Open-Heart Mechanical',
    query: { sort: 'featured' }
  },
  {
    key: 'special',
    en: 'Special Occasion',
    th: 'เรือนเวลาโอกาสพิเศษ & ลิมิเต็ด',
    roman: 'VI',
    preview: '/images/op/watch-899833-black.png',
    model: '899833 · Prestige Edition',
    query: { category: 'limited' }
  }
])
const hoveredCollection = ref(0)

/* Three Horological Houses under Opwatch Boutique */
const brandCards = computed(() => [
  {
    slug: 'opwatch',
    name: 'Opwatch',
    origin: locale.value === 'th' ? 'Japanese Precision Movement' : 'Japanese Precision Movement',
    desc: locale.value === 'th'
      ? 'ความเที่ยงตรงระดับกลไกญี่ปุ่น กระจกแซฟไฟร์กันรอย ดีไซน์ร่วมสมัยสำหรับทุกวัน'
      : 'Reliable Japanese automatic & quartz calibers paired with scratch-resistant sapphire crystal.'
  },
  {
    slug: 'olympinus',
    name: 'Olym Pianus',
    origin: locale.value === 'th' ? 'Olympic Spirit · Swiss Heritage' : 'Olympic Spirit · Swiss Heritage',
    desc: locale.value === 'th'
      ? 'แรงบันดาลใจจากจิตวิญญาณแห่งโอลิมปิก ผสานศาสตร์การประดิษฐ์เรือนเวลาสวิสอันประณีต'
      : 'Inspired by the ultimate glory of the Olympic spirit, fusing Swiss watchmaking tradition and elegance.'
  },
  {
    slug: 'ogival',
    name: 'Ogival',
    origin: locale.value === 'th' ? 'La Chaux-de-Fonds · Since 1903' : 'La Chaux-de-Fonds · Since 1903',
    desc: locale.value === 'th'
      ? 'เรือนเวลาสวิสระดับสูง สัญลักษณ์ปลาโดดมงคล โดดเด่นด้วยงานแกะสลักและเพชรแท้'
      : 'Prestigious Swiss haute horlogerie emblem of blessing, skeleton artistry, and diamond-set mastery.'
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
         SECTION 2: RECOMMEND — 3x2 Studio Cutout Grid on #f8f8f8 (main_color)
         ===================================================================== -->
    <section id="op-recommend" class="section op-recommend">
      <div class="container">
        <div class="op-sec-head">
          <h2 class="op-sec-title">RECOMMEND</h2>
          <p class="op-sec-sub">
            {{
              locale === 'th'
                ? 'คัดสรรเรือนเวลายอดนิยมจากบูติก Olym Pianus, Opwatch และ Ogival พร้อมสั่งซื้อออนไลน์ทันที'
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
          <NuxtLink :to="{ path: localePath('/products'), query: { category: 'men-diver' } }" class="btn btn--ghost-light">
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

    <!-- =====================================================================
         SECTION 8: THREE HOROLOGICAL HOUSES (.TextIconBox on #f8f8f8)
         ===================================================================== -->
    <section class="section op-houses">
      <div class="container">
        <div class="op-sec-head">
          <h2 class="op-sec-title">{{ locale === 'th' ? 'OUR WATCH HOUSES' : 'OUR WATCH HOUSES' }}</h2>
          <p class="op-sec-sub">
            {{
              locale === 'th'
                ? 'ศูนย์รวมเรือนเวลาของแท้จาก 3 แบรนด์ชั้นนำ พร้อมใบรับประกันศูนย์ไทยและบริการหลังการขายครบวงจร'
                : 'Official Thailand boutique uniting three distinguished watchmaking houses under one roof.'
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
            <span class="op-houses__origin">{{ b.origin }}</span>
            <h3>{{ b.name }}</h3>
            <p>{{ b.desc }}</p>
            <span class="op-houses__cta">
              {{ locale === 'th' ? 'สำรวจคอลเลกชัน →' : 'Explore House →' }}
            </span>
          </NuxtLink>
        </div>
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

/* 8. THREE HOROLOGICAL HOUSES (olympianus.com .TextIconBox style) */
.op-houses {
  background: var(--paper);
}
.op-houses__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
}
.op-houses__card {
  background: var(--ivory);
  border: 1px solid var(--sand);
  border-bottom: 2px solid var(--sapphire);
  padding: 42px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
  transition: transform 0.35s var(--ease), box-shadow 0.35s var(--ease), background 0.3s;
}
.op-houses__card:hover {
  background: #ffffff;
  transform: translateY(-4px);
  box-shadow: var(--shadow);
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
