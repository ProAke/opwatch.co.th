<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { site, brands } = useSite()
const cart = useCart()

const [{ data: recData }, { data: allData }] = await Promise.all([
  useFetch<{ items: Record<string, any>[]; total: number }>('/api/products', {
    query: { featured: 'true', limit: 6 },
    default: () => ({ items: [], total: 0 })
  }),
  useFetch<{ items: Record<string, any>[]; total: number }>('/api/products', {
    query: { limit: 19 },
    default: () => ({ items: [], total: 0 })
  })
])

const allProducts = computed(() => allData.value?.items || [])
const recommended = computed(() => {
  const feat = recData.value?.items || []
  return (feat.length >= 6 ? feat : allProducts.value).slice(0, 6)
})

// 1. 100vw x 100vh Pure Photographic Hero Slider (6 slides matching olympianus.com)
const heroSlides = computed(() => [
  {
    image: '/images/op/hero-gold-stones.jpg',
    code: '130-07MK-GL-WHITE',
    captionEn: 'Sovereign Gold · Sapphire Crystal',
    captionTh: 'Sovereign Gold · กระจกแซฟไฟร์แท้',
    to: localePath('/products/ol-m2001')
  },
  {
    image: '/images/op/banner-899832ags.jpg',
    code: '899832AGS',
    captionEn: 'Super Luminous Sports Mechanical 40mm',
    captionTh: 'Super Luminous สปอร์ตออโตเมติก 40 มม.',
    to: localePath('/products/ow-s3001')
  },
  {
    image: '/images/op/hero-ceramic-dark.jpg',
    code: '82671M-CERAMIC',
    captionEn: 'Midnight High-Tech Ceramic & Diamond',
    captionTh: 'Midnight High-Tech Ceramic ประดับเพชร',
    to: localePath('/products/ol-l3001')
  },
  {
    image: '/images/op/lifestyle-men.jpg',
    code: 'MEN COLLECTION',
    captionEn: ' Precision Tailored for Modern Gentlemen',
    captionTh: 'เรือนเวลาสำหรับสุภาพบุรุษยุคใหม่',
    to: localePath({ path: '/products', query: { category: 'men-watches' } })
  },
  {
    image: '/images/op/lifestyle-lady.jpg',
    code: 'LADIES COLLECTION',
    captionEn: 'Timeless Grace & Mother-of-Pearl Radiance',
    captionTh: 'ความสง่างามเหนือกาลเวลาสำหรับสุภาพสตรี',
    to: localePath({ path: '/products', query: { category: 'women-watches' } })
  },
  {
    image: '/images/op/lifestyle-sport.jpg',
    code: 'SPORT COLLECTION',
    captionEn: 'Engineered Endurance · 100M–300M',
    captionTh: 'สมรรถนะสปอร์ตเต็มพิกัด กันน้ำลึก',
    to: localePath({ path: '/products', query: { category: 'sport-watches' } })
  }
])

const heroIdx = ref(0)
let heroTimer: any = null

function setHero(i: number) {
  heroIdx.value = (i + heroSlides.value.length) % heroSlides.value.length
}
function startHero() {
  stopHero()
  heroTimer = setInterval(() => setHero(heroIdx.value + 1), 5800)
}
function stopHero() {
  if (heroTimer) clearInterval(heroTimer)
}

function scrollToRecommend() {
  if (import.meta.client) {
    document.getElementById('recommend')?.scrollIntoView({ behavior: 'smooth' })
  }
}

// 3. Full-Bleed 100vw Vertical Portrait Strip (1000x1500 exact olympianus.com format)
const portraitFrames = computed(() => [
  {
    img: '/images/op/portrait-diver.jpg',
    sku: '899832AGS',
    title: 'Super Luminous Diver',
    to: localePath('/products/ow-s3001')
  },
  {
    img: '/images/op/portrait-8934msk.jpg',
    sku: '8934MSK',
    title: 'Two-Tone Open-Heart',
    to: localePath('/products/ow-m1001')
  },
  {
    img: '/images/op/portrait-82671m.jpg',
    sku: '82671M',
    title: 'Midnight Ceramic Diamond',
    to: localePath('/products/ol-l3001')
  },
  {
    img: '/images/op/portrait-8909amk.jpg',
    sku: '8909AMK',
    title: 'Executive Automatic',
    to: localePath('/products/ow-m1002')
  },
  {
    img: '/images/op/portrait-99141agnsk.jpg',
    sku: '99141AGNSK',
    title: 'Heritage Open-Heart',
    to: localePath('/products/ow-c4001')
  },
  {
    img: '/images/op/hero-gold-stones.jpg',
    sku: '130-07MK',
    title: 'Sovereign Gold Slim',
    to: localePath('/products/ol-m2001')
  }
])

const stripTrack = ref<HTMLElement | null>(null)
function scrollStrip(dir: number) {
  if (!stripTrack.value) return
  const w = stripTrack.value.clientWidth * 0.5
  stripTrack.value.scrollBy({ left: dir * w, behavior: 'smooth' })
}

// 4. Full-Width 899832AGS Luminous Video / Interactive Showcase Modal
const filmOpen = ref(false)
const lumeMode = ref(true)
const diverProduct = computed(() => allProducts.value.find((p) => p.slug === 'ow-s3001') || allProducts.value[0])

function quickAddDiver() {
  const p = diverProduct.value
  if (!p) return
  cart.add({
    productId: Number(p.id),
    slug: p.slug,
    name: p.name,
    nameEn: p.nameEn || p.name,
    nameTh: p.nameTh || p.name,
    price: Number(p.price || 0),
    image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '/images/op/watch-899831-green.png',
    maxStock: Number(p.stock || 10),
    sku: p.sku
  })
  filmOpen.value = false
}

// 5. Full-Width 1920x1280 Lifestyle Slider (Men / Lady / Sport / Obsidian / Ceramic)
const lifeSlides = computed(() => [
  {
    img: '/images/op/lifestyle-men.jpg',
    tag: 'MEN WATCH',
    titleEn: 'Commanding Presence on Every Occasion',
    titleTh: 'ความภูมิฐานเหนือระดับในทุกโอกาสสำคัญ',
    to: localePath({ path: '/products', query: { category: 'men-watches' } })
  },
  {
    img: '/images/op/lifestyle-lady.jpg',
    tag: 'LADIES WATCH',
    titleEn: 'Poetic Proportions & Refined Radiance',
    titleTh: 'สัดส่วนอันอ่อนช้อยเปล่งประกายบนข้อมือ',
    to: localePath({ path: '/products', query: { category: 'women-watches' } })
  },
  {
    img: '/images/op/lifestyle-sport.jpg',
    tag: 'SPORT WATCH',
    titleEn: 'Built for Motion, Depth & Precision',
    titleTh: 'พร้อมลุยทุกจังหวะชีวิตด้วยความเที่ยงตรงสูงสุด',
    to: localePath({ path: '/products', query: { category: 'sport-watches' } })
  },
  {
    img: '/images/op/hero-gold-stones.jpg',
    tag: 'CLASSIC WATCH',
    titleEn: 'Pure Dress Minimalism in Mirror Gold',
    titleTh: 'ความเรียบหรูเหนือกาลเวลาในเรือนทองขัดเงา',
    to: localePath({ path: '/products', query: { category: 'classic-watches' } })
  },
  {
    img: '/images/op/hero-ceramic-dark.jpg',
    tag: 'SPECIAL OCCASION',
    titleEn: 'Obsidian Ceramic & Brilliant-Cut Brilliance',
    titleTh: 'เซรามิกสีดำขลับผสานประกายคริสตัลเจียระไน',
    to: localePath({ path: '/products', query: { brand: 'ogival' } })
  }
])
const lifeIdx = ref(0)
function setLife(i: number) {
  lifeIdx.value = (i + lifeSlides.value.length) % lifeSlides.value.length
}

// 6. Exact 6 COLLECTIONS Interactive Preview Showcase
const activeCollectionIdx = ref(0)
const collections = computed(() => [
  {
    num: '01',
    en: 'Men Watch',
    th: 'นาฬิกาผู้ชาย · Men Watch',
    subEn: 'Automatic Open-Heart & Executive Dress',
    subTh: 'เรือนเวลาออโตเมติกและเดรสสำหรับสุภาพบุรุษ',
    cutout: '/images/op/watch-990-083-blue.png',
    bg: '/images/op/lifestyle-men.jpg',
    to: localePath({ path: '/products', query: { category: 'men-watches' } })
  },
  {
    num: '02',
    en: 'Ladies Watch',
    th: 'นาฬิกาผู้หญิง · Ladies Watch',
    subEn: 'Slim Sapphire, Mother-of-Pearl & Crystal',
    subTh: 'ตัวเรือนบางเฉียบ หน้าปัดมุกและคริสตัลหรู',
    cutout: '/images/op/watch-990-45-lady.png',
    bg: '/images/op/lifestyle-lady.jpg',
    to: localePath({ path: '/products', query: { category: 'women-watches' } })
  },
  {
    num: '03',
    en: 'Sport Watch',
    th: 'นาฬิกาสปอร์ต · Sport Watch',
    subEn: 'Super Luminous Divers & Chronographs',
    subTh: 'สปอร์ตไดเวอร์พรายน้ำสว่างสูงและโครโนกราฟ',
    cutout: '/images/op/watch-899831-green.png',
    bg: '/images/op/lifestyle-sport.jpg',
    to: localePath({ path: '/products', query: { category: 'sport-watches' } })
  },
  {
    num: '04',
    en: 'Classic Watch',
    th: 'นาฬิกาคลาสสิก · Classic Watch',
    subEn: 'Heritage Dress & Roman Dial Signatures',
    subTh: 'คลาสสิกเหนือกาลเวลาในดีไซน์ร่วมสมัย',
    cutout: '/images/op/watch-990-083-white.png',
    bg: '/images/op/portrait-99141agnsk.jpg',
    to: localePath({ path: '/products', query: { category: 'classic-watches' } })
  },
  {
    num: '05',
    en: 'Essential Selection',
    th: 'Essential Selection',
    subEn: 'Everyday Japanese Movement Icons',
    subTh: 'เรือนเวลาคู่ใจสวมใส่ได้ทุกวันด้วยกลไกญี่ปุ่น',
    cutout: '/images/op/watch-990-163-black.png',
    bg: '/images/op/portrait-8909amk.jpg',
    to: localePath({ path: '/products', query: { brand: 'opwatch' } })
  },
  {
    num: '06',
    en: 'Special Occasion',
    th: 'Special Occasion',
    subEn: 'Swiss Haute Horlogerie & Diamond Editions',
    subTh: 'เรือนเวลาสวิสประดับเพชรสำหรับช่วงเวลาพิเศษ',
    cutout: '/images/op/watch-82672-lady.png',
    bg: '/images/op/hero-ceramic-dark.jpg',
    to: localePath({ path: '/products', query: { brand: 'ogival' } })
  }
])

onMounted(() => startHero())
onUnmounted(() => stopHero())

useHead(() => ({
  title: `Olym Pianus · ${site.value.name || 'Opwatch'} — Official Watch Boutique`
}))
</script>

<template>
  <div class="ophome">
    <!-- ===================================================================
         1. FULL-VIEWPORT 100vw × 100vh EDGE-TO-EDGE HERO SLIDER
            Pure dark studio watch photography + arrows + 1..6 + scroll cue
         =================================================================== -->
    <section class="ophero" @mouseenter="stopHero" @mouseleave="startHero">
      <div class="ophero__slides">
        <div
          v-for="(s, i) in heroSlides"
          :key="i"
          class="ophero__slide"
          :class="{ 'is-active': i === heroIdx }"
        >
          <img :src="s.image" :alt="s.code" :loading="i === 0 ? 'eager' : 'lazy'" />
          <div class="ophero__vignette" />
        </div>
      </div>

      <!-- Prev / Next Minimal Edge Arrows -->
      <button type="button" class="ophero__arrow ophero__arrow--prev" :aria-label="t('common.prev')" @click="setHero(heroIdx - 1)">
        ‹
      </button>
      <button type="button" class="ophero__arrow ophero__arrow--next" :aria-label="t('common.next')" @click="setHero(heroIdx + 1)">
        ›
      </button>

      <!-- Bottom Bar: Dots (left), Animated "scroll" Cue (center), Subtle Model Shop Link (right) -->
      <div class="ophero__bottom">
        <div class="ophero__dots" role="tablist">
          <button
            v-for="(_, i) in heroSlides"
            :key="i"
            type="button"
            class="ophero__dot"
            :class="{ 'is-active': i === heroIdx }"
            :aria-label="`Slide ${i + 1}`"
            @click="setHero(i)"
          >
            0{{ i + 1 }}
          </button>
        </div>

        <button type="button" class="op-scroll-cue ophero__scroll" @click="scrollToRecommend">
          <span>scroll</span>
          <span class="op-scroll-cue__line" />
        </button>

        <NuxtLink :to="heroSlides[heroIdx].to" class="ophero__model">
          <span class="ophero__code">{{ heroSlides[heroIdx].code }}</span>
          <span class="ophero__cap">{{ locale === 'en' ? heroSlides[heroIdx].captionEn : heroSlides[heroIdx].captionTh }}</span>
          <span class="ophero__cta">{{ t('common.shopNow') }} →</span>
        </NuxtLink>
      </div>
    </section>

    <!-- ===================================================================
         2. RECOMMEND — Pure White Studio Cutout 3×2 Grid + [Collections]
         =================================================================== -->
    <section id="recommend" class="oprec">
      <div class="container">
        <div class="op-sec-head">
          <h2 class="op-sec-title">RECOMMEND</h2>
          <p class="op-sec-sub">{{ t('home.featuredSubtitle') }}</p>
        </div>

        <div class="oprec__grid">
          <ProductCard
            v-for="(p, idx) in recommended"
            :key="p.id"
            :product="p"
            :priority="idx < 3"
          />
        </div>

        <div class="oprec__foot">
          <NuxtLink :to="localePath('/products')" class="btn btn--ghost">
            {{ locale === 'en' ? 'Collections' : t('nav.collections') }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ===================================================================
         3. FULL-BLEED 100vw EDGE-TO-EDGE PORTRAIT STRIP CAROUSEL (1000×1500)
         =================================================================== -->
    <section class="opstrip" aria-label="Editorial Watch Gallery">
      <button type="button" class="opstrip__nav opstrip__nav--prev" :aria-label="t('common.prev')" @click="scrollStrip(-1)">
        ‹
      </button>

      <div ref="stripTrack" class="opstrip__track">
        <NuxtLink
          v-for="(item, idx) in portraitFrames"
          :key="idx"
          :to="item.to"
          class="opstrip__panel"
        >
          <img :src="item.img" :alt="item.sku" loading="lazy" />
          <div class="opstrip__overlay">
            <span class="opstrip__sku">{{ item.sku }}</span>
            <span class="opstrip__name">{{ item.title }}</span>
          </div>
        </NuxtLink>
      </div>

      <button type="button" class="opstrip__nav opstrip__nav--next" :aria-label="t('common.next')" @click="scrollStrip(1)">
        ›
      </button>
    </section>

    <!-- ===================================================================
         4. FULL-WIDTH 16:9 LUMINOUS DIVER CINEMATIC SHOWCASE (899832AGS)
         =================================================================== -->
    <section class="opvideo">
      <div class="opvideo__bg" :class="{ 'is-lume': lumeMode }">
        <img src="/images/op/hero-diver-dark.jpg" alt="Olym Pianus 899832AGS Super Luminous" loading="lazy" />
      </div>
      <div class="opvideo__scrim" />

      <div class="container opvideo__content">
        <p class="eyebrow">899832AGS · SUPER LUMINOUS 40MM</p>
        <h2 class="opvideo__title">
          Olym Pianus · {{ locale === 'en' ? 'Super Luminous Sports Mechanical Watch' : 'นาฬิกาสปอร์ตกลไกออโตเมติก พรายน้ำสว่างพิเศษ' }}
        </h2>
        <p class="opvideo__desc">{{ t('home.filmBody') }}</p>

        <div class="opvideo__actions">
          <button type="button" class="opvideo__play" @click="filmOpen = true">
            <span class="opvideo__playring">▶</span>
            <span>{{ locale === 'en' ? 'WATCH SHOWCASE' : 'ชมภาพยนตร์เรือนเวลา' }}</span>
          </button>

          <NuxtLink :to="localePath('/products/ow-s3001')" class="btn btn--outline-gold btn--sm">
            {{ t('common.shopNow') }} · 899832AGS
          </NuxtLink>
        </div>
      </div>

      <!-- Interactive Widescreen Showcase Modal -->
      <div v-if="filmOpen" class="opmodal" @click.self="filmOpen = false">
        <div class="opmodal__box">
          <button type="button" class="opmodal__close" aria-label="Close" @click="filmOpen = false">✕</button>
          <div class="opmodal__stage" :class="{ 'is-lume': lumeMode }">
            <img
              :src="lumeMode ? '/images/op/square-diver-glow.jpg' : '/images/op/banner-899832ags.jpg'"
              alt="899832AGS Showcase"
            />
            <div class="opmodal__controls">
              <button type="button" class="btn btn--sm btn--ghost-light" @click="lumeMode = !lumeMode">
                {{ lumeMode ? '☀ Studio Light View' : '◐ Super-LumiNova Night Glow' }}
              </button>
              <button type="button" class="btn btn--sm btn--gold" @click="quickAddDiver">
                + {{ t('common.addToCart') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================================================================
         5. FULL-WIDTH 1920×1280 LIFESTYLE SLIDER (Men / Lady / Sport)
         =================================================================== -->
    <section class="oplife">
      <div class="oplife__slides">
        <div
          v-for="(ls, idx) in lifeSlides"
          :key="idx"
          class="oplife__slide"
          :class="{ 'is-active': idx === lifeIdx }"
        >
          <img :src="ls.img" :alt="ls.tag" loading="lazy" />
          <div class="oplife__grad" />
          <div class="container oplife__caption">
            <span class="eyebrow">{{ ls.tag }}</span>
            <h3 class="oplife__heading">{{ locale === 'en' ? ls.titleEn : ls.titleTh }}</h3>
            <NuxtLink :to="ls.to" class="btn btn--ghost-light btn--sm">
              {{ locale === 'en' ? 'Explore Collection' : 'ชมคอลเลกชัน' }} →
            </NuxtLink>
          </div>
        </div>
      </div>

      <button type="button" class="oplife__arrow oplife__arrow--prev" :aria-label="t('common.prev')" @click="setLife(lifeIdx - 1)">
        ‹
      </button>
      <button type="button" class="oplife__arrow oplife__arrow--next" :aria-label="t('common.next')" @click="setLife(lifeIdx + 1)">
        ›
      </button>

      <div class="oplife__dots">
        <button
          v-for="(_, idx) in lifeSlides"
          :key="idx"
          type="button"
          class="oplife__dot"
          :class="{ 'is-active': idx === lifeIdx }"
          :aria-label="`Lifestyle slide ${idx + 1}`"
          @click="setLife(idx)"
        />
      </div>
    </section>

    <!-- ===================================================================
         6. COLLECTIONS — Dark Architectural 6-Collection Interactive Showcase
         =================================================================== -->
    <section class="opcolls">
      <div class="container">
        <div class="op-sec-head opcolls__head">
          <h2 class="op-sec-title">COLLECTIONS</h2>
          <p class="op-sec-sub" style="color: rgba(255,255,255,0.66)">
            {{ t('home.collectionsSubtitle') }}
          </p>
        </div>

        <div class="opcolls__layout">
          <!-- Left Live Studio Preview Stage -->
          <NuxtLink :to="collections[activeCollectionIdx].to" class="opcolls__preview">
            <img
              :key="collections[activeCollectionIdx].bg"
              class="opcolls__bg"
              :src="collections[activeCollectionIdx].bg"
              :alt="collections[activeCollectionIdx].en"
            />
            <div class="opcolls__FloatingWatch">
              <img
                :key="collections[activeCollectionIdx].cutout"
                :src="collections[activeCollectionIdx].cutout"
                :alt="collections[activeCollectionIdx].en"
              />
            </div>
          </NuxtLink>

          <!-- Right 6 Exact olympianus.com Collection Rows -->
          <div class="opcolls__list">
            <NuxtLink
              v-for="(c, idx) in collections"
              :key="c.num"
              :to="c.to"
              class="opcolls__row"
              :class="{ 'is-active': idx === activeCollectionIdx }"
              @mouseenter="activeCollectionIdx = idx"
            >
              <span class="opcolls__num">{{ c.num }}</span>
              <div class="opcolls__text">
                <h3 class="opcolls__name">{{ locale === 'en' ? c.en : c.th }}</h3>
                <p class="opcolls__sub">{{ locale === 'en' ? c.subEn : c.subTh }}</p>
              </div>
              <span class="opcolls__go">→</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================================================================
         7. ASYMMETRIC OLYM PIANUS STORY + FULL-BLEED AD POSTER (MORE)
         =================================================================== -->
    <section class="opstory">
      <div class="opstory__text">
        <div class="opstory__inner">
          <OpCrest size="md" sublabel="HERITAGE & SPIRIT" />
          <p class="opstory__quote">
            {{
              locale === 'en'
                ? 'Inspired by the ultimate glory of the Olympic spirit — "Faster, Higher, Stronger" — Olym Pianus and Opwatch unite precision watchmaking craftsmanship with contemporary form.'
                : 'แรงบันดาลใจจากเกียรติยศสูงสุดแห่งจิตวิญญาณโอลิมปิก ภายใต้คำขวัญ “Faster, Higher, Stronger” ถ่ายทอดสู่เรือนเวลาที่ผสานความเที่ยงตรงระดับสากล กระจกแซฟไฟร์แท้ และความงามร่วมสมัยอย่างสมบูรณ์แบบ'
            }}
          </p>
          <span class="opstory__slash">/</span>
          <div>
            <NuxtLink :to="localePath('/about')" class="btn btn--ghost-light btn--sm">
              MORE
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="opstory__poster">
        <img src="/images/op/portrait-8934msk.jpg" alt="Olym Pianus Masterpiece" loading="lazy" />
      </div>
    </section>

    <!-- ===================================================================
         8. THREE WATCH HOUSES BOUTIQUE BAR (Opwatch · Olympinus · Ogival)
         =================================================================== -->
    <section v-if="brands.length" class="ophouses">
      <div class="container ophouses__grid">
        <NuxtLink
          v-for="b in brands"
          :key="b.slug"
          :to="localePath('/brands/' + b.slug)"
          class="ophouse"
        >
          <span class="ophouse__move">{{ locale === 'en' ? b.movementEn : b.movement }}</span>
          <h3 class="ophouse__name">{{ locale === 'en' ? b.nameEn || b.name : b.nameTh || b.name }}</h3>
          <p class="ophouse__tag">{{ locale === 'en' ? b.taglineEn || b.tagline : b.tagline }}</p>
          <span class="ophouse__cta">{{ t('common.shopNow') }} →</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 1. 100vw x 100vh Pure Edge-to-Edge Hero Slider */
.ophero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 620px;
  max-height: 1080px;
  background: #050505;
  overflow: hidden;
}
.ophero__slides,
.ophero__slide {
  position: absolute;
  inset: 0;
}
.ophero__slide {
  opacity: 0;
  transition: opacity 1.1s var(--ease);
  pointer-events: none;
}
.ophero__slide.is-active {
  opacity: 1;
  pointer-events: auto;
}
.ophero__slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.04);
  transition: transform 6.5s ease-out;
}
.ophero__slide.is-active img {
  transform: scale(1);
}
.ophero__vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(0, 0, 0, 0.04) 30%, rgba(0, 0, 0, 0.56) 100%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.36) 0%, transparent 26%, transparent 72%, rgba(0, 0, 0, 0.78) 100%);
}

.ophero__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  width: 52px;
  height: 52px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.28);
  color: rgba(255, 255, 255, 0.85);
  font-size: 28px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.25s, border-color 0.25s, color 0.25s;
}
.ophero__arrow:hover {
  background: rgba(197, 164, 109, 0.9);
  border-color: var(--gold);
  color: #080808;
}
.ophero__arrow--prev { left: 28px; }
.ophero__arrow--next { right: 28px; }

.ophero__bottom {
  position: absolute;
  left: 36px;
  right: 36px;
  bottom: 26px;
  z-index: 6;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  gap: 20px;
}
.ophero__dots {
  display: flex;
  align-items: center;
  gap: 14px;
}
.ophero__dot {
  background: transparent;
  border: 0;
  padding: 4px 0;
  font-family: var(--font-geo);
  font-size: 11px;
  letter-spacing: 0.16em;
  color: rgba(255, 255, 255, 0.42);
  border-bottom: 1px solid transparent;
  transition: color 0.25s, border-color 0.25s;
}
.ophero__dot.is-active {
  color: #ffffff;
  border-bottom-color: var(--gold);
}
.ophero__scroll {
  justify-self: center;
}
.ophero__model {
  justify-self: end;
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: #ffffff;
  padding: 10px 16px;
  background: rgba(8, 8, 8, 0.55);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  transition: border-color 0.25s;
}
.ophero__model:hover {
  border-color: var(--gold);
}
.ophero__code {
  font-family: var(--font-geo);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.24em;
  color: var(--gold);
}
.ophero__cap {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.78);
}
.ophero__cta {
  font-family: var(--font-geo);
  font-size: 9.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #ffffff;
}

/* 2. RECOMMEND White Studio Cutout Grid */
.oprec {
  background: #ffffff;
  padding-block: 104px 96px;
}
.oprec__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px 36px;
}
.oprec__foot {
  margin-top: 64px;
  text-align: center;
}

/* 3. Full-Bleed 100vw Edge-to-Edge Portrait Strip */
.opstrip {
  position: relative;
  width: 100%;
  background: #080808;
  overflow: hidden;
}
.opstrip__track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: calc(100% / 5);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}
.opstrip__track::-webkit-scrollbar { display: none; }

.opstrip__panel {
  position: relative;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  scroll-snap-align: start;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}
.opstrip__panel img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.85s var(--ease);
}
.opstrip__panel:hover img {
  transform: scale(1.06);
}
.opstrip__overlay {
  position: absolute;
  inset: auto 0 0 0;
  padding: 28px 18px 20px;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.84) 100%);
  display: flex;
  flex-direction: column;
  gap: 3px;
  opacity: 0.88;
  transition: opacity 0.3s;
}
.opstrip__panel:hover .opstrip__overlay { opacity: 1; }
.opstrip__sku {
  font-family: var(--font-geo);
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--gold);
}
.opstrip__name {
  font-size: 13px;
  color: #ffffff;
  font-weight: 300;
}

.opstrip__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 4;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(8, 8, 8, 0.72);
  color: #ffffff;
  font-size: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.opstrip__nav:hover {
  background: var(--gold);
  border-color: var(--gold);
  color: #080808;
}
.opstrip__nav--prev { left: 16px; }
.opstrip__nav--next { right: 16px; }

/* 4. Full-Width Luminous Diver Video Showcase */
.opvideo {
  position: relative;
  min-height: 620px;
  display: flex;
  align-items: center;
  background: #040608;
  color: #ffffff;
  overflow: hidden;
}
.opvideo__bg {
  position: absolute;
  inset: 0;
}
.opvideo__bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: contrast(1.06);
}
.opvideo__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(4, 6, 8, 0.88) 0%, rgba(4, 6, 8, 0.52) 52%, rgba(4, 6, 8, 0.22) 100%);
}
.opvideo__content {
  position: relative;
  z-index: 2;
  max-width: 680px;
  margin-inline: 0;
  padding-left: max(32px, calc((100vw - var(--container)) / 2 + 32px));
  padding-block: 80px;
}
.opvideo__title {
  font-family: var(--font-geo);
  font-size: clamp(1.7rem, 3.2vw, 2.5rem);
  font-weight: 300;
  letter-spacing: 0.1em;
  margin: 14px 0 18px;
  line-height: 1.3;
}
.opvideo__desc {
  color: rgba(255, 255, 255, 0.74);
  font-weight: 300;
  line-height: 1.85;
  margin-bottom: 32px;
}
.opvideo__actions {
  display: flex;
  align-items: center;
  gap: 22px;
  flex-wrap: wrap;
}
.opvideo__play {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  background: transparent;
  border: 0;
  color: #ffffff;
  font-family: var(--font-geo);
  font-size: 11px;
  letter-spacing: 0.24em;
  padding: 0;
}
.opvideo__playring {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1px solid var(--gold);
  color: var(--gold);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  transition: background 0.25s, color 0.25s, transform 0.25s;
}
.opvideo__play:hover .opvideo__playring {
  background: var(--gold);
  color: #080808;
  transform: scale(1.06);
}

/* Showcase Modal */
.opmodal {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.opmodal__box {
  position: relative;
  max-width: 920px;
  width: 100%;
  background: #080808;
  border: 1px solid rgba(255, 255, 255, 0.18);
}
.opmodal__close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 3;
  width: 38px;
  height: 38px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
}
.opmodal__stage {
  position: relative;
  aspect-ratio: 16 / 10;
  background: #000000;
}
.opmodal__stage img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.opmodal__controls {
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 20px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

/* 5. Full-Width 1920x1280 Lifestyle Slider */
.oplife {
  position: relative;
  height: 74vh;
  min-height: 480px;
  max-height: 780px;
  background: #0c0c0c;
  overflow: hidden;
}
.oplife__slides,
.oplife__slide {
  position: absolute;
  inset: 0;
}
.oplife__slide {
  opacity: 0;
  transition: opacity 0.9s var(--ease);
  pointer-events: none;
}
.oplife__slide.is-active {
  opacity: 1;
  pointer-events: auto;
}
.oplife__slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.oplife__grad {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 35%, rgba(0, 0, 0, 0.78) 100%);
}
.oplife__caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 52px;
  z-index: 2;
  color: #ffffff;
}
.oplife__heading {
  font-family: var(--font-geo);
  font-size: clamp(1.5rem, 2.8vw, 2.2rem);
  font-weight: 300;
  letter-spacing: 0.1em;
  margin: 10px 0 20px;
}
.oplife__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 4;
  width: 46px;
  height: 46px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(0, 0, 0, 0.35);
  color: #ffffff;
  font-size: 24px;
}
.oplife__arrow:hover {
  background: var(--gold);
  border-color: var(--gold);
  color: #080808;
}
.oplife__arrow--prev { left: 24px; }
.oplife__arrow--next { right: 24px; }

.oplife__dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  display: flex;
  gap: 10px;
}
.oplife__dot {
  width: 28px;
  height: 2px;
  border: 0;
  background: rgba(255, 255, 255, 0.3);
  padding: 0;
}
.oplife__dot.is-active {
  background: var(--gold);
}

/* 6. COLLECTIONS Interactive Dark Showcase */
.opcolls {
  background: #0c0c0c;
  color: #ffffff;
  padding-block: 104px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.opcolls__layout {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 56px;
  align-items: center;
}
.opcolls__preview {
  position: relative;
  aspect-ratio: 4 / 4.6;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #050505;
  display: flex;
  align-items: center;
  justify-content: center;
}
.opcolls__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.36;
  transition: transform 0.8s var(--ease);
}
.opcolls__preview:hover .opcolls__bg {
  transform: scale(1.05);
}
.opcolls__FloatingWatch {
  position: relative;
  z-index: 2;
  width: 66%;
  height: 66%;
  background: rgba(255, 255, 255, 0.96);
  padding: 22px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}
.opcolls__FloatingWatch img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.opcolls__list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}
.opcolls__row {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  align-items: center;
  gap: 18px;
  padding: 20px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  transition: background 0.25s, padding-left 0.25s var(--ease);
}
.opcolls__row:hover,
.opcolls__row.is-active {
  background: rgba(255, 255, 255, 0.04);
  padding-left: 24px;
}
.opcolls__num {
  font-family: var(--font-geo);
  font-size: 11px;
  letter-spacing: 0.2em;
  color: var(--gold);
}
.opcolls__name {
  font-family: var(--font-geo);
  font-size: 17px;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #ffffff;
}
.opcolls__sub {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.52);
  margin-top: 3px;
}
.opcolls__go {
  color: var(--gold);
  font-size: 18px;
}

/* 7. Asymmetric Olym Pianus Brand Story + Full-Bleed Poster Split */
.opstory {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #131313;
  color: #ffffff;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.opstory__text {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 88px 48px;
}
.opstory__inner {
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.opstory__quote {
  font-size: 15px;
  font-weight: 300;
  line-height: 1.95;
  color: rgba(255, 255, 255, 0.78);
}
.opstory__slash {
  font-family: var(--font-geo);
  font-size: 26px;
  font-weight: 200;
  color: var(--gold);
}
.opstory__poster {
  min-height: 540px;
  max-height: 680px;
  overflow: hidden;
}
.opstory__poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 8. Three Watch Houses Bar */
.ophouses {
  background: #0d0d0d;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-block: 64px;
}
.ophouses__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.ophouse {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #121212;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.25s, transform 0.25s var(--ease);
}
.ophouse:hover {
  border-color: var(--gold);
  transform: translateY(-3px);
}
.ophouse__move {
  font-family: var(--font-geo);
  font-size: 10px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--gold);
}
.ophouse__name {
  font-family: var(--font-geo);
  font-size: 20px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #ffffff;
}
.ophouse__tag {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.58);
  margin-bottom: 8px;
}
.ophouse__cta {
  margin-top: auto;
  font-family: var(--font-geo);
  font-size: 10.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #ffffff;
}

@media (max-width: 1080px) {
  .opstrip__track { grid-auto-columns: calc(100% / 3); }
  .opcolls__layout { grid-template-columns: 1fr; }
  .opcolls__preview { max-width: 480px; margin-inline: auto; width: 100%; }
}
@media (max-width: 900px) {
  .oprec__grid { grid-template-columns: repeat(2, 1fr); gap: 32px 20px; }
  .opstory { grid-template-columns: 1fr; }
  .opstory__poster { min-height: 400px; }
  .ophouses__grid { grid-template-columns: 1fr; }
  .ophero__bottom {
    left: 20px;
    right: 20px;
    grid-template-columns: 1fr auto;
  }
  .ophero__scroll { display: none; }
}
@media (max-width: 580px) {
  .oprec__grid { grid-template-columns: 1fr; }
  .opstrip__track { grid-auto-columns: 78%; }
  .ophero__arrow { width: 38px; height: 38px; font-size: 22px; }
  .ophero__arrow--prev { left: 10px; }
  .ophero__arrow--next { right: 10px; }
  .ophero__bottom { grid-template-columns: 1fr; gap: 12px; }
  .ophero__model { justify-self: start; text-align: left; }
}
</style>
