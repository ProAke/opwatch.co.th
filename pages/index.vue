<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { site, brands } = useSite()

const localeTag = computed(() => (locale.value === 'en' ? 'en-US' : 'th-TH'))
const fmt = (v: number | string) => formatPrice(v, site.value.currencySymbol, localeTag.value)

const { data: productsRes } = await useFetch<{ items: Record<string, any>[] }>('/api/products', {
  query: { sort: 'featured', limit: 19 },
  default: () => ({ items: [] })
})

const allProducts = computed(() => productsRes.value?.items || [])

// 1. Hero Slider (6 widescreen slides, Olympianus style 1–6)
const heroIndex = ref(0)
const heroPaused = ref(false)

const heroSlides = computed(() => {
  const en = locale.value === 'en'
  return [
    {
      no: '01',
      image: '/images/hero-watch.jpg',
      eyebrow: 'OLYM PIANUS · AUTOMATIC SERIES',
      title: en ? 'Timeless Precision,\nCrafted for Glory' : 'ความเที่ยงตรงเหนือกาลเวลา\nรังสรรค์อย่างพิถีพิถัน',
      sub: en
        ? 'Sapphire crystal, surgical steel and precision mechanical movements.'
        : 'กระจกแซฟไฟร์แท้ ตัวเรือนสเตนเลสสตีลเกรดพรีเมียม และกลไกความเที่ยงตรงสูง',
      to: localePath('/products')
    },
    {
      no: '02',
      image: '/images/c-sport.jpg',
      eyebrow: 'SUPER LUMINOUS · SPORT DIVER',
      title: en ? 'Built for Depth &\nBold Character' : 'แกร่งทุกมิติ\nโดดเด่นในความมืด',
      sub: en
        ? 'High-contrast luminous indices and 200m water resistance.'
        : 'พรายน้ำสว่างคมชัด พร้อมสมรรถนะกันน้ำลึกสำหรับสายสปอร์ตตัวจริง',
      to: localePath({ path: '/products', query: { category: 'sport-watches' } })
    },
    {
      no: '03',
      image: '/images/c-men.jpg',
      eyebrow: 'GENTLEMAN COLLECTION',
      title: en ? 'The Art of Dress\nHorology' : 'ความสง่างาม\nแห่งสุภาพบุรุษ',
      sub: en
        ? 'Refined proportions that slip effortlessly beneath a tailored cuff.'
        : 'สัดส่วนตัวเรือนบางเฉียบ เรียบหรู ลงตัวในทุกโอกาสสำคัญ',
      to: localePath({ path: '/products', query: { category: 'men-watches' } })
    },
    {
      no: '04',
      image: '/images/c-ladies.jpg',
      eyebrow: 'LADIES RADIANCE',
      title: en ? 'Mother-of-Pearl &\nRose Gold Grace' : 'ประกายมุกและโรสโกลด์\nอันอ่อนหวาน',
      sub: en
        ? 'Jewellery-inspired silhouettes crafted for luminous everyday wear.'
        : 'ตัวเรือนประดับคริสตัลและหน้าปัดมุกธรรมชาติ สะท้อนเสน่ห์เหนือกาลเวลา',
      to: localePath({ path: '/products', query: { category: 'women-watches' } })
    },
    {
      no: '05',
      image: '/images/p5.jpg',
      eyebrow: 'CHRONOGRAPH SERIES',
      title: en ? 'Tachymeter &\nTri-Compax Mastery' : 'โครโนกราฟสามหน้าปัด\nความแม่นยำระดับสนามแข่ง',
      sub: en
        ? 'Engineered pushers and brushed steel bracelets built to endure.'
        : 'ฟังก์ชันจับเวลาครบครัน ตัวเรือนขัดซาตินสลับเงาอย่างประณีต',
      to: localePath({ path: '/products', query: { brand: 'olympianus' } })
    },
    {
      no: '06',
      image: '/images/p1.jpg',
      eyebrow: 'OGIVAL · SWISS SINCE 1903',
      title: en ? 'A Century of Swiss\nHaute Horlogerie' : 'ตำนานเรือนเวลาสวิส\nกว่าหนึ่งศตวรรษ',
      sub: en
        ? 'Hand-set diamonds, tourbillon artistry and heritage craftsmanship.'
        : 'ที่สุดแห่งเรือนเวลาลักชัวรีและงานฝังเพชรประณีตระดับสวิตเซอร์แลนด์',
      to: localePath({ path: '/products', query: { brand: 'ogival' } })
    }
  ]
})

function nextHero() {
  heroIndex.value = (heroIndex.value + 1) % heroSlides.value.length
}
function prevHero() {
  heroIndex.value = (heroIndex.value - 1 + heroSlides.value.length) % heroSlides.value.length
}

let heroTimer: any = null
onMounted(() => {
  heroTimer = setInterval(() => {
    if (!heroPaused.value) nextHero()
  }, 5500)
})
onUnmounted(() => clearInterval(heroTimer))

// 2. RECOMMEND grid (6 curated watches with optional brand quick-filter)
const activeRecBrand = ref('')
const recommended = computed(() => {
  const list = activeRecBrand.value
    ? allProducts.value.filter((p) => (p.brand?.slug || p.brandSlug) === activeRecBrand.value)
    : allProducts.value
  return list.slice(0, 6)
})

// 3. Portrait Lookbook Carousel (Olympianus vertical portrait strip)
const lookbookOffset = ref(0)
const lookbookItems = computed(() => {
  const portraits = ['/images/p1.jpg', '/images/p2.jpg', '/images/p6.jpg', '/images/p3.jpg', '/images/p5.jpg', '/images/p4.jpg']
  return portraits.map((img, idx) => {
    const prod = allProducts.value[idx] || null
    return {
      img,
      sku: prod?.sku || `OP-0${idx + 1}`,
      name: prod ? (locale.value === 'en' ? prod.nameEn || prod.name : prod.nameTh || prod.name) : 'Signature Edition',
      price: prod ? fmt(prod.price) : '',
      to: prod ? localePath('/products/' + prod.slug) : localePath('/products')
    }
  })
})
function shiftLookbook(dir: number) {
  const max = 2
  lookbookOffset.value = (lookbookOffset.value + dir + (max + 1)) % (max + 1)
}

// 4. Lifestyle Slider in Video/Mechanical Showcase (Men / Lady / Sport)
const lifeIndex = ref(0)
const lifestyleSlides = computed(() => {
  const en = locale.value === 'en'
  return [
    { image: '/images/c-men.jpg', tag: 'MEN SERIES', title: en ? 'Executive Automatic' : 'เรือนเวลาสุภาพบุรุษออโตเมติก', to: localePath({ path: '/products', query: { category: 'men-watches' } }) },
    { image: '/images/c-ladies.jpg', tag: 'LADIES SERIES', title: en ? 'Diamond & Pearl Elegance' : 'ความงามระดับจิวเวลรี่สตรี', to: localePath({ path: '/products', query: { category: 'women-watches' } }) },
    { image: '/images/c-sport.jpg', tag: 'SPORT SERIES', title: en ? '200M Professional Diver' : 'สปอร์ตไดเวอร์สมรรถนะสูง', to: localePath({ path: '/products', query: { category: 'sport-watches' } }) }
  ]
})

// 5. COLLECTIONS (Exact 6 Olympianus collection pillars)
const collectionTiles = computed(() => {
  const en = locale.value === 'en'
  return [
    {
      key: 'men',
      title: 'Men Watch',
      sub: en ? 'Automatic & Chronograph' : 'นาฬิกาสุภาพบุรุษ',
      image: '/images/c-men.jpg',
      to: localePath({ path: '/products', query: { category: 'men-watches' } })
    },
    {
      key: 'ladies',
      title: 'Ladies Watch',
      sub: en ? 'Pearl & Rose Gold' : 'นาฬิกาสุภาพสตรี',
      image: '/images/c-ladies.jpg',
      to: localePath({ path: '/products', query: { category: 'women-watches' } })
    },
    {
      key: 'sport',
      title: 'Sport Watch',
      sub: en ? 'Diving & Luminous' : 'นาฬิกาสปอร์ตกันน้ำลึก',
      image: '/images/c-sport.jpg',
      to: localePath({ path: '/products', query: { category: 'sport-watches' } })
    },
    {
      key: 'classic',
      title: 'Classic Watch',
      sub: en ? 'Heritage Dress' : 'นาฬิกาคลาสสิกเดรส',
      image: '/images/p1.jpg',
      to: localePath({ path: '/products', query: { category: 'classic-watches' } })
    },
    {
      key: 'essential',
      title: t('home.essentialSelection'),
      sub: en ? 'Opwatch · Japanese Movement' : 'Opwatch · เครื่องญี่ปุ่นคุณภาพสูง',
      image: '/images/p6.jpg',
      to: localePath({ path: '/products', query: { brand: 'opwatch' } })
    },
    {
      key: 'special',
      title: t('home.specialOccasion'),
      sub: en ? 'Ogival · Swiss Luxury' : 'Ogival · เรือนเวลาหรูระดับพรีเมียม',
      image: '/images/p2.jpg',
      to: localePath({ path: '/products', query: { brand: 'ogival' } })
    }
  ]
})

useHead({
  title: `${site.value.name} — ${site.value.tagline}`,
  meta: [{ name: 'description', content: site.value.tagline }]
})
</script>

<template>
  <div>
    <!-- 1. FULL-VIEWPORT HERO CAROUSEL (olympianus.com 1–6 slider + scroll cue) -->
    <section
      class="hero"
      @mouseenter="heroPaused = true"
      @mouseleave="heroPaused = false"
    >
      <div
        v-for="(slide, idx) in heroSlides"
        :key="slide.no"
        class="hero__slide"
        :class="{ 'is-active': idx === heroIndex }"
      >
        <div class="hero__bg">
          <img :src="slide.image" :alt="slide.eyebrow" :fetchpriority="idx === 0 ? 'high' : 'auto'" />
        </div>
        <div class="container hero__inner">
          <p class="eyebrow hero__eyebrow">{{ slide.eyebrow }}</p>
          <h1 class="hero__title">{{ slide.title }}</h1>
          <p class="hero__sub">{{ slide.sub }}</p>
          <div class="hero__cta">
            <NuxtLink :to="slide.to" class="btn btn--gold">{{ t('home.heroCtaPrimary') }}</NuxtLink>
            <NuxtLink :to="localePath('/about')" class="btn btn--ghost hero__ghost">{{ t('home.heroCtaSecondary') }}</NuxtLink>
          </div>
        </div>
      </div>

      <!-- Prev / Next Arrows -->
      <button type="button" class="hero__arrow hero__arrow--prev" :aria-label="t('common.prev')" @click="prevHero">‹</button>
      <button type="button" class="hero__arrow hero__arrow--next" :aria-label="t('common.next')" @click="nextHero">›</button>

      <!-- Numbered Pagination 1..6 + Scroll Cue -->
      <div class="hero__bar">
        <div class="container hero__barinner">
          <div class="hero__nums" role="tablist">
            <button
              v-for="(s, idx) in heroSlides"
              :key="s.no"
              type="button"
              class="hero__num"
              :class="{ 'is-active': idx === heroIndex }"
              @click="heroIndex = idx"
            >
              {{ idx + 1 }}
            </button>
          </div>
          <a href="#recommend" class="hero__scroll tiny upper">SCROLL ↓</a>
        </div>
      </div>
    </section>

    <!-- TRUST BAR -->
    <section class="trust">
      <div class="container trust__inner">
        <div v-for="(item, i) in [t('home.curated'), t('home.authentic'), t('home.service')]" :key="i" class="trust__item">
          <span class="trust__dot" />
          <span class="tiny upper">{{ item }}</span>
        </div>
      </div>
    </section>

    <!-- 2. RECOMMEND SECTION (olympianus.com 6-watch gallery + hover swap + e-commerce) -->
    <section id="recommend" class="section recommend">
      <div class="container">
        <div class="op-sec-head">
          <h2 class="op-sec-title">{{ t('home.featuredTitle') }}</h2>
          <p class="op-sec-sub">{{ t('home.featuredSubtitle') }}</p>

          <!-- Brand quick filter pills -->
          <div v-if="brands.length" class="rec-tabs">
            <button
              type="button"
              class="rec-tab"
              :class="{ 'is-active': activeRecBrand === '' }"
              @click="activeRecBrand = ''"
            >
              {{ t('products.allBrands') }}
            </button>
            <button
              v-for="b in brands"
              :key="b.slug"
              type="button"
              class="rec-tab"
              :class="{ 'is-active': activeRecBrand === b.slug }"
              @click="activeRecBrand = b.slug"
            >
              {{ locale === 'en' ? b.nameEn || b.name : b.nameTh || b.name }}
            </button>
          </div>
        </div>

        <div class="grid-rec">
          <ProductCard v-for="(p, i) in recommended" :key="p.id" :product="p" :priority="i < 3" />
        </div>

        <div class="center" style="margin-top: 48px">
          <NuxtLink :to="localePath('/products')" class="btn btn--ghost">
            {{ t('nav.collections') }} →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 3. PORTRAIT LOOKBOOK CAROUSEL (olympianus.com vertical gallery strip) -->
    <section class="section section--tight lookbook">
      <div class="container">
        <div class="between wrap gap-16" style="margin-bottom: 28px">
          <div>
            <p class="eyebrow">{{ t('home.lookbookEyebrow') }}</p>
            <h2 class="serif" style="font-size: clamp(1.6rem, 3vw, 2.3rem); margin-top: 6px">{{ t('home.lookbookTitle') }}</h2>
          </div>
          <div class="row gap-8">
            <button type="button" class="navcircle" :aria-label="t('common.prev')" @click="shiftLookbook(-1)">‹</button>
            <button type="button" class="navcircle" :aria-label="t('common.next')" @click="shiftLookbook(1)">›</button>
          </div>
        </div>

        <div class="lb-viewport">
          <div class="lb-track" :style="{ transform: `translateX(-${lookbookOffset * 16.66}%)` }">
            <NuxtLink
              v-for="(item, idx) in lookbookItems"
              :key="idx"
              :to="item.to"
              class="lb-card"
            >
              <div class="lb-card__img">
                <img :src="item.img" :alt="item.name" loading="lazy" />
              </div>
              <div class="lb-card__caption">
                <span class="tiny upper" style="color: var(--gold)">{{ item.sku }}</span>
                <span class="lb-card__name">{{ item.name }}</span>
                <span v-if="item.price" class="small muted">{{ item.price }}</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. MECHANICAL FILM & LIFESTYLE SHOWCASE (olympianus.com Diving Mechanical + Men/Lady/Sport slider) -->
    <section class="section section--dark showcase">
      <div class="container showcase__grid">
        <!-- Left: Mechanical Diver Spotlight -->
        <div class="showcase__feature">
          <div class="showcase__poster">
            <img src="/images/c-sport.jpg" alt="Super Luminous Sports Mechanical Watch" loading="lazy" />
            <div class="showcase__overlay">
              <span class="showcase__badge tiny upper">{{ t('home.filmEyebrow') }}</span>
              <h2 class="serif showcase__title">{{ t('home.filmTitle') }}</h2>
              <p class="showcase__desc">{{ t('home.filmBody') }}</p>
              <div class="showcase__specs">
                <span>SAPPHIRE CRYSTAL</span>
                <span>SUPER-LUMINOVA</span>
                <span>200M WATER RESISTANT</span>
              </div>
              <NuxtLink :to="localePath({ path: '/products', query: { category: 'sport-watches' } })" class="btn btn--gold btn--sm">
                {{ t('common.shopNow') }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Right: Men / Lady / Sport Lifestyle Carousel -->
        <div class="showcase__life">
          <div class="life-frame">
            <img :src="lifestyleSlides[lifeIndex].image" :alt="lifestyleSlides[lifeIndex].title" loading="lazy" />
            <div class="life-caption">
              <span class="tiny upper" style="color: var(--gold-soft)">{{ lifestyleSlides[lifeIndex].tag }}</span>
              <h3 class="serif life-title">{{ lifestyleSlides[lifeIndex].title }}</h3>
              <NuxtLink :to="lifestyleSlides[lifeIndex].to" class="link-underline" style="color: #f4efe6; border-color: var(--gold)">
                {{ t('common.viewAll') }} →
              </NuxtLink>
            </div>
          </div>
          <div class="life-dots">
            <button
              v-for="(ls, idx) in lifestyleSlides"
              :key="ls.tag"
              type="button"
              class="life-dot"
              :class="{ 'is-active': idx === lifeIndex }"
              @click="lifeIndex = idx"
            >
              {{ ls.tag }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. COLLECTIONS (olympianus.com 6 signature categories) -->
    <section class="section collections-sec">
      <div class="container">
        <div class="op-sec-head">
          <h2 class="op-sec-title">{{ t('home.collectionsTitle') }}</h2>
          <p class="op-sec-sub">{{ t('home.collectionsSubtitle') }}</p>
        </div>

        <div class="coll6">
          <NuxtLink
            v-for="c in collectionTiles"
            :key="c.key"
            :to="c.to"
            class="coll6__card"
          >
            <div class="coll6__media">
              <img :src="c.image" :alt="c.title" loading="lazy" />
            </div>
            <div class="coll6__overlay">
              <span class="coll6__sub tiny upper">{{ c.sub }}</span>
              <h3 class="coll6__title">{{ c.title }}</h3>
              <span class="coll6__cta tiny upper">{{ t('common.shopNow') }} →</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 6. BRAND HERITAGE & THREE HOUSES (Olym Pianus · Opwatch · Ogival + MORE) -->
    <section class="section heritage">
      <div class="container">
        <div class="heritage__split">
          <div class="heritage__media">
            <img src="/images/hero-watch.jpg" alt="Opwatch & Olym Pianus Heritage" loading="lazy" />
          </div>
          <div class="heritage__content">
            <p class="eyebrow">OLYM PIANUS · OPWATCH · OGIVAL</p>
            <h2 class="page-title" style="margin: 14px 0 18px">{{ t('home.craftTitle') }}</h2>
            <p class="heritage__body">{{ t('home.collectionsSubtitle') }}</p>
            <p class="heritage__body" style="margin-top: 12px">{{ t('home.craftBody') }}</p>
            <div style="margin-top: 28px">
              <NuxtLink :to="localePath('/about')" class="btn btn--outline-gold">MORE →</NuxtLink>
            </div>
          </div>
        </div>

        <!-- Three Watchmaking Houses Strip -->
        <div v-if="brands.length" class="houses">
          <NuxtLink
            v-for="b in brands"
            :key="b.slug"
            :to="localePath('/brands/' + b.slug)"
            class="house"
          >
            <span class="tiny upper" style="color: var(--gold)">{{ locale === 'en' ? b.movementEn || b.movement : b.movement }}</span>
            <h3 class="house__name">{{ locale === 'en' ? b.nameEn || b.name : b.nameTh || b.name }}</h3>
            <p class="muted small">{{ locale === 'en' ? b.taglineEn || b.tagline : b.tagline }}</p>
            <span class="tiny upper house__link">{{ t('common.shopNow') }} →</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- MEMBER PRIVILEGE CTA -->
    <section class="section--tight cta">
      <div class="container cta__inner">
        <p class="eyebrow cta__eyebrow">{{ t('home.ctaEyebrow') }}</p>
        <h2 class="cta__title">{{ t('home.ctaTitle') }}</h2>
        <p class="cta__body">{{ t('home.ctaBody') }}</p>
        <NuxtLink :to="localePath('/account/register')" class="btn btn--gold">{{ t('home.ctaButton') }}</NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 1. Hero Slider */
.hero {
  position: relative;
  height: min(86vh, 820px);
  min-height: 540px;
  background: #0f0e0d;
  overflow: hidden;
}
.hero__slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.85s var(--ease);
  display: flex;
  align-items: center;
}
.hero__slide.is-active {
  opacity: 1;
  pointer-events: auto;
  z-index: 2;
}
.hero__bg { position: absolute; inset: 0; }
.hero__bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 35%;
  transform: scale(1.03);
  transition: transform 6s ease-out;
}
.hero__slide.is-active .hero__bg img { transform: scale(1); }
.hero__bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(14, 13, 12, 0.82) 0%, rgba(14, 13, 12, 0.48) 48%, rgba(14, 13, 12, 0.18) 100%);
}
.hero__inner {
  position: relative;
  z-index: 3;
  color: #f7f4ee;
  max-width: 680px;
  margin-left: max(28px, calc((100vw - var(--container)) / 2 + 28px));
  margin-right: auto;
}
.hero__eyebrow { color: var(--gold-soft); }
.hero__title {
  font-size: clamp(2.4rem, 5.2vw, 4.3rem);
  line-height: 1.08;
  white-space: pre-line;
  margin: 18px 0 16px;
}
.hero__sub {
  font-size: clamp(0.98rem, 1.35vw, 1.1rem);
  color: #dcd4c6;
  max-width: 490px;
  line-height: 1.8;
}
.hero__cta { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 30px; }
.hero__ghost { color: #f7f4ee; border-color: rgba(247, 244, 238, 0.45); }
.hero__ghost:hover { background: #f7f4ee; color: var(--ink); border-color: #f7f4ee; }

.hero__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(18, 17, 16, 0.42);
  color: #f7f4ee;
  font-size: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.hero__arrow:hover { border-color: var(--gold); background: var(--gold); color: #fff; }
.hero__arrow--prev { left: 22px; }
.hero__arrow--next { right: 22px; }

.hero__bar {
  position: absolute;
  inset: auto 0 0 0;
  z-index: 5;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(180deg, transparent, rgba(14, 13, 12, 0.72));
  padding-block: 14px;
}
.hero__barinner { display: flex; align-items: center; justify-content: space-between; }
.hero__nums { display: flex; align-items: center; gap: 6px; }
.hero__num {
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  border-radius: 50%;
  background: transparent;
  color: rgba(247, 244, 238, 0.55);
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
}
.hero__num:hover { color: #fff; }
.hero__num.is-active {
  border-color: var(--gold);
  color: #fff;
  background: rgba(176, 141, 87, 0.25);
}
.hero__scroll { color: rgba(247, 244, 238, 0.75); letter-spacing: 0.22em; }
.hero__scroll:hover { color: var(--gold-soft); }

/* Trust Strip */
.trust { border-bottom: 1px solid var(--line); background: var(--paper); }
.trust__inner { display: flex; justify-content: space-around; padding-block: 18px; flex-wrap: wrap; gap: 16px; }
.trust__item { display: flex; align-items: center; gap: 10px; color: var(--ink-soft); }
.trust__dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); }

/* 2. Recommend */
.recommend { background: var(--paper); }
.rec-tabs {
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 24px;
}
.rec-tab {
  border: 1px solid var(--line-strong);
  background: transparent;
  padding: 8px 18px;
  font-size: 11.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-soft);
  transition: all 0.2s;
}
.rec-tab:hover { border-color: var(--ink); color: var(--ink); }
.rec-tab.is-active { background: var(--ink); border-color: var(--ink); color: #f7f4ee; }

.grid-rec {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

/* 3. Portrait Lookbook */
.lookbook { background: var(--ivory); border-top: 1px solid var(--line); }
.navcircle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  background: var(--paper);
  font-size: 20px;
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.navcircle:hover { border-color: var(--gold); color: var(--gold); }
.lb-viewport { overflow: hidden; }
.lb-track {
  display: grid;
  grid-template-columns: repeat(6, minmax(220px, 1fr));
  gap: 18px;
  transition: transform 0.55s var(--ease);
}
.lb-card {
  background: var(--paper);
  border: 1px solid var(--line);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.lb-card__img { aspect-ratio: 3 / 4.2; overflow: hidden; background: var(--sand); }
.lb-card__img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s var(--ease); }
.lb-card:hover .lb-card__img img { transform: scale(1.06); }
.lb-card__caption { padding: 14px; display: flex; flex-direction: column; gap: 3px; text-align: center; }
.lb-card__name { font-family: var(--font-display); font-size: 16px; }

/* 4. Mechanical Film & Lifestyle Showcase */
.showcase { background: #121110; }
.showcase__grid { display: grid; grid-template-columns: 1.2fr 0.9fr; gap: 28px; align-items: stretch; }
.showcase__poster {
  position: relative;
  height: 100%;
  min-height: 440px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}
.showcase__poster img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.showcase__poster::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(12, 11, 10, 0.92) 8%, rgba(12, 11, 10, 0.42) 65%, rgba(12, 11, 10, 0.2) 100%);
}
.showcase__overlay { position: relative; z-index: 2; padding: 36px; max-width: 560px; }
.showcase__badge { color: var(--gold-soft); letter-spacing: 0.24em; }
.showcase__title { font-size: clamp(1.8rem, 3vw, 2.6rem); color: #f7f4ee; margin: 10px 0 12px; }
.showcase__desc { color: #cfc8b9; font-size: 14.5px; line-height: 1.75; margin-bottom: 18px; }
.showcase__specs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.showcase__specs span {
  font-size: 10px;
  letter-spacing: 0.16em;
  padding: 5px 10px;
  border: 1px solid rgba(176, 141, 87, 0.38);
  color: #e9e1d2;
}

.showcase__life { display: flex; flex-direction: column; gap: 12px; }
.life-frame {
  position: relative;
  flex: 1;
  min-height: 370px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: flex-end;
}
.life-frame img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s var(--ease); }
.life-frame:hover img { transform: scale(1.04); }
.life-frame::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(12, 11, 10, 0.85) 0%, transparent 65%);
}
.life-caption { position: relative; z-index: 2; padding: 28px; }
.life-title { font-size: 24px; color: #f7f4ee; margin: 6px 0 10px; }
.life-dots { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.life-dot {
  padding: 10px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #bfb7a9;
  font-size: 10px;
  letter-spacing: 0.16em;
  transition: all 0.2s;
}
.life-dot.is-active, .life-dot:hover {
  border-color: var(--gold);
  color: #fff;
  background: rgba(176, 141, 87, 0.2);
}

/* 5. Collections 6-grid */
.collections-sec { background: var(--paper); border-bottom: 1px solid var(--line); }
.coll6 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
.coll6__card {
  position: relative;
  aspect-ratio: 4 / 3.2;
  overflow: hidden;
  background: #141311;
  display: flex;
  align-items: flex-end;
}
.coll6__media { position: absolute; inset: 0; }
.coll6__media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s var(--ease), opacity 0.4s; opacity: 0.84; }
.coll6__card:hover .coll6__media img { transform: scale(1.06); opacity: 0.96; }
.coll6__media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(14, 13, 12, 0.86) 0%, rgba(14, 13, 12, 0.18) 65%);
}
.coll6__overlay { position: relative; z-index: 2; padding: 24px 26px; width: 100%; color: #f7f4ee; }
.coll6__sub { color: var(--gold-soft); display: block; margin-bottom: 4px; }
.coll6__title {
  font-family: var(--font-roman);
  font-size: 20px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #fff;
}
.coll6__cta { display: inline-block; margin-top: 10px; color: #dcd4c6; opacity: 0.85; transition: color 0.2s; }
.coll6__card:hover .coll6__cta { color: var(--gold-soft); opacity: 1; }

/* 6. Brand Heritage & Three Houses */
.heritage { background: var(--ivory); }
.heritage__split { display: grid; grid-template-columns: 1.05fr 1fr; gap: 56px; align-items: center; }
.heritage__media { aspect-ratio: 16 / 10; overflow: hidden; border: 1px solid var(--line); background: var(--sand); }
.heritage__media img { width: 100%; height: 100%; object-fit: cover; }
.heritage__body { font-size: 15.5px; line-height: 1.85; color: var(--ink-soft); }

.houses {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  margin-top: 52px;
}
.house {
  background: var(--paper);
  border: 1px solid var(--line);
  padding: 28px 26px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
}
.house:hover { border-color: var(--gold); transform: translateY(-3px); box-shadow: var(--shadow); }
.house__name { font-family: var(--font-roman); font-size: 20px; letter-spacing: 0.14em; text-transform: uppercase; margin-top: 2px; }
.house__link { margin-top: 12px; color: var(--ink); }
.house:hover .house__link { color: var(--gold); }

/* CTA */
.cta { background: var(--gold-tint); text-align: center; padding-block: 64px; }
.cta__inner { display: flex; flex-direction: column; align-items: center; }
.cta__eyebrow { justify-content: center; }
.cta__eyebrow::before { display: none; }
.cta__title { font-size: clamp(1.9rem, 3.6vw, 2.8rem); margin: 14px 0 10px; }
.cta__body { color: var(--ink-soft); margin-bottom: 26px; max-width: 540px; }

@media (max-width: 1040px) {
  .grid-rec { grid-template-columns: repeat(2, 1fr); }
  .coll6 { grid-template-columns: repeat(2, 1fr); }
  .showcase__grid { grid-template-columns: 1fr; }
  .lb-track { grid-template-columns: repeat(6, minmax(200px, 1fr)); overflow-x: auto; }
}
@media (max-width: 860px) {
  .hero { height: 76vh; }
  .hero__arrow { display: none; }
  .heritage__split { grid-template-columns: 1fr; gap: 32px; }
  .houses { grid-template-columns: 1fr; }
}
@media (max-width: 580px) {
  .grid-rec { grid-template-columns: 1fr; }
  .coll6 { grid-template-columns: 1fr; }
}
</style>
