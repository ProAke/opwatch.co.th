<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { site } = useSite()

interface Article {
  slug: string
  date: string
  model: string
  image: string
  productSlug: string
  titleEn: string
  titleTh: string
  excerptEn: string
  excerptTh: string
  bodyEn: string
  bodyTh: string
}

const articles: Article[] = [
  {
    slug: 'sovereign-gold-130-07mk',
    date: '2026 · EDITORIAL',
    model: '130-07MK-GL-WHITE',
    image: '/images/op/square-gold-stones.jpg',
    productSlug: 'ol-m2001',
    titleEn: 'Olym Pianus Sovereign Gold Quartz — Ultra-Slim Dress Perfection',
    titleTh: 'Olym Pianus 130-07MK — นิยามแห่งเดรสวอทช์ตัวเรือนทองบางเฉียบ',
    excerptEn: 'Resting on wet obsidian stone, the 130-07MK pairs mirror-polished gold PVD proportions with a pure porcelain-white dial and domed sapphire crystal.',
    excerptTh: 'ความงดงามของตัวเรือนสีทองขัดเงาคู่หน้าปัดขาวบริสุทธิ์ กระจกแซฟไฟร์แท้ และสายหนังดำคลาสสิกที่สะท้อนรสนิยมเหนือกาลเวลา',
    bodyEn: 'Designed for collectors who appreciate quiet architectural proportion, the 130-07MK achieves an ultra-slim profile that slips effortlessly beneath a tailored cuff while retaining 5 ATM water resistance and scratch-proof sapphire clarity.',
    bodyTh: 'ออกแบบเพื่อผู้หลงใหลในความเรียบหรูด้วยตัวเรือนบางเฉียบ สวมใส่แนบข้อมือภายใต้สูทสั่งตัด พร้อมประสิทธิภาพกันน้ำ 5 ATM และกระจกแซฟไฟร์ป้องกันรอยขีดข่วน'
  },
  {
    slug: 'super-luminous-diver-899832ags',
    date: '2026 · SPORT HOROLOGY',
    model: '899832AGS',
    image: '/images/op/square-diver-glow.jpg',
    productSlug: 'ow-s3001',
    titleEn: 'Classic Super Luminous Dive Watch — Legibility in Deep Darkness',
    titleTh: '899832AGS Super Luminous — พรายน้ำสว่างคมชัดเพื่อการผจญภัยใต้น้ำ',
    excerptEn: 'High-intensity emerald luminous hour plots, a unidirectional timing bezel, and automatic mechanical reliability built for night and sea.',
    excerptTh: 'โดดเด่นด้วยมาร์กเกอร์พรายน้ำสีเขียวมรกตสว่างพิเศษ ขอบเบเซลหมุนทิศทางเดียว และกลไกออโตเมติกสุดแกร่ง',
    bodyEn: 'Every index and hand on the 899832AGS is generously filled with luminous compound for instant legibility in zero-light environments, housed inside a brushed 40mm 316L surgical-steel oyster case with cyclops date.',
    bodyTh: 'เข็มและหลักชั่วโมงเคลือบสารเรืองแสงความเข้มข้นสูง ช่วยให้อ่านเวลาได้ชัดเจนแม้อยู่ในที่มืดสนิท ตัวเรือนสเตนเลสสตีล 316L ขนาด 40 มม. แข็งแกร่งทนทาน'
  },
  {
    slug: 'open-heart-artistry-99141',
    date: '2026 · MECHANICAL ART',
    model: '99141AGNSK',
    image: '/images/op/openheart-stones.jpg',
    productSlug: 'ow-c4001',
    titleEn: 'Open-Heart Automatic — Watching the Heartbeat of Time',
    titleTh: 'ศิลปะแห่งกลไก Open-Heart — สัมผัสจังหวะหัวใจจักรกลบนหน้าปัด',
    excerptEn: 'An aperture at 9 o’clock reveals the oscillating balance wheel beating at 21,600 vibrations per hour beneath flat sapphire glass.',
    excerptTh: 'หน้าต่างโชว์กลไกที่ตำแหน่ง 9 นาฬิกา เผยความงามของจักรกลสมดุลที่ทำงานอย่างต่อเนื่องทุกวินาที',
    bodyEn: 'Combining classical dauphine hands with a framed open-heart escapement window, the 99141AGNSK celebrates traditional mechanical watchmaking on a supple five-link two-tone bracelet.',
    bodyTh: 'ผสานเข็มทรงดาบสีทองคลาสสิกเข้ากับช่องโชว์กลไกจักรกลสมดุลอย่างลงตัว พร้อมสายสเตนเลสสตีลทูโทนสวมใส่สบายตลอดวัน'
  },
  {
    slug: 'midnight-ceramic-82671m',
    date: '2026 · HAUTE DESIGN',
    model: '82671M',
    image: '/images/op/hero-ceramic-dark.jpg',
    productSlug: 'ol-l3001',
    titleEn: 'Midnight High-Tech Ceramic — Mirror Black & Diamond Radiance',
    titleTh: '82671M Midnight Ceramic — เสน่ห์เซรามิกสีดำเงาผสานประกายเพชร',
    excerptEn: 'Scratch-defying high-gloss black ceramic links meet warm gold accents and diamond-cut hour markers.',
    excerptTh: 'ตัวเรือนและสายไฮเทคเซรามิกสีดำเงางาม ป้องกันรอยขีดข่วนดีเยี่ยม ตัดกับสีทองและหลักชั่วโมงคริสตัลเจียระไน',
    bodyEn: 'Sintered high-tech ceramic offers an unmistakable liquid-black luster that never fades, remaining cool and hypoallergenic against the skin.',
    bodyTh: 'วัสดุไฮเทคเซรามิกมอบความเงางามลุ่มลึกไม่หมองคล้ำ น้ำหนักสมดุล และอ่อนโยนต่อผิวสัมผัส'
  },
  {
    slug: 'two-tone-executive-8934msk',
    date: '2026 · GENTLEMAN',
    model: '8934MSK',
    image: '/images/op/portrait-8934msk.jpg',
    productSlug: 'ow-m1001',
    titleEn: 'Executive Two-Tone Automatic — Crafted for Modern Leadership',
    titleTh: '8934MSK Two-Tone Automatic — เรือนเวลาคู่บารมีนักบริหารยุคใหม่',
    excerptEn: 'Deep guilloché dial texture, 24-hour sub-register, and open-heart balance wheel in brushed steel and gold.',
    excerptTh: 'หน้าปัดแกะลายกิโยเช่มิติลึกซึ้ง พร้อมหน้าปัดย่อย 24 ชั่วโมง และตัวเรือนสตีลสลับทองสุดภูมิฐาน',
    bodyEn: 'Built to transition effortlessly from boardroom presentations to evening receptions, the two-tone architecture underscores timeless authority.',
    bodyTh: 'รังสรรค์มาเพื่อรองรับทั้งวันทำงานระดับผู้บริหารและงานเลี้ยงยามค่ำคืนอย่างสง่างามไร้ที่ติ'
  },
  {
    slug: 'three-houses-bangkok-boutique',
    date: '2026 · BOUTIQUE',
    model: 'OPWATCH · OLYMPINUS · OGIVAL',
    image: '/images/op/lifestyle-men.jpg',
    productSlug: 'og-m6001',
    titleEn: 'Three Watchmaking Houses Under One Official Thai Boutique',
    titleTh: 'ครบทั้ง 3 แบรนด์เรือนเวลาชั้นนำ ณ Opwatch Official Boutique',
    excerptEn: 'Explore Japanese-movement Opwatch icons, Swiss-heritage Olympinus classics, and Ogival 1903 diamond masterpieces online.',
    excerptTh: 'เลือกชมและสั่งซื้อออนไลน์ได้อย่างมั่นใจ ทั้ง Opwatch กลไกญี่ปุ่น, Olympinus กลไกสวิส และ Ogival ลักชัวรีตั้งแต่ปี 1903',
    bodyEn: 'Every order placed on Opwatch Official Boutique ships insured across Thailand with official manufacturer warranty cards and full service-center support.',
    bodyTh: 'ทุกคำสั่งซื้อจัดส่งพร้อมประกันภัยทั่วประเทศไทย มาพร้อมใบรับประกันศูนย์แท้และบริการดูแลหลังการขายครบวงจร'
  }
]

const selectedArticle = ref<Article | null>(null)

function scrollToNews() {
  if (import.meta.client) {
    document.getElementById('news-grid')?.scrollIntoView({ behavior: 'smooth' })
  }
}

useHead(() => ({
  title: `${locale.value === 'en' ? 'News' : t('nav.news')} — Olym Pianus · ${site.value.name}`
}))
</script>

<template>
  <div class="opnews">
    <!-- Hero Banner -->
    <section class="nhero">
      <div class="nhero__bg">
        <img src="/images/op/banner-899832ags.jpg" alt="Olym Pianus News" />
      </div>
      <div class="nhero__scrim" />
      <div class="container nhero__inner">
        <p class="eyebrow">HOROLOGICAL JOURNAL</p>
        <h1 class="page-title" style="color: #ffffff">{{ locale === 'en' ? 'NEWS' : 'ข่าวสารและบทความ · NEWS' }}</h1>
      </div>
      <button type="button" class="op-scroll-cue nhero__scroll" @click="scrollToNews">
        <span>scroll</span>
        <span class="op-scroll-cue__line" />
      </button>
    </section>

    <!-- 3-Column Editorial Watch Stories Grid (exact olympianus.com/news/ layout) -->
    <section id="news-grid" class="section" style="background: #ffffff">
      <div class="container">
        <div class="ngrid">
          <article
            v-for="a in articles"
            :key="a.slug"
            class="ncard"
            @click="selectedArticle = a"
          >
            <div class="ncard__media">
              <img :src="a.image" :alt="a.model" loading="lazy" />
              <span class="ncard__model">{{ a.model }}</span>
            </div>
            <div class="ncard__body">
              <span class="ncard__date">{{ a.date }}</span>
              <h2 class="ncard__title">{{ locale === 'en' ? a.titleEn : a.titleTh }}</h2>
              <p class="ncard__excerpt">{{ locale === 'en' ? a.excerptEn : a.excerptTh }}</p>
              <div class="ncard__foot">
                <button type="button" class="link-underline" @click.stop="selectedArticle = a">
                  {{ locale === 'en' ? 'Read Story' : 'อ่านบทความ' }}
                </button>
                <NuxtLink :to="localePath('/products/' + a.productSlug)" class="ncard__shop" @click.stop>
                  {{ t('common.shopNow') }} →
                </NuxtLink>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Article Reader Modal -->
    <div v-if="selectedArticle" class="nmodal" @click.self="selectedArticle = null">
      <div class="nmodal__dialog">
        <button type="button" class="nmodal__close" @click="selectedArticle = null">✕</button>
        <div class="nmodal__img">
          <img :src="selectedArticle.image" :alt="selectedArticle.model" />
        </div>
        <div class="nmodal__body">
          <p class="eyebrow">{{ selectedArticle.model }} · {{ selectedArticle.date }}</p>
          <h2 class="nmodal__title">{{ locale === 'en' ? selectedArticle.titleEn : selectedArticle.titleTh }}</h2>
          <p class="nmodal__p">{{ locale === 'en' ? selectedArticle.excerptEn : selectedArticle.excerptTh }}</p>
          <p class="nmodal__p">{{ locale === 'en' ? selectedArticle.bodyEn : selectedArticle.bodyTh }}</p>
          <div class="row gap-12 wrap" style="margin-top: 24px">
            <NuxtLink :to="localePath('/products/' + selectedArticle.productSlug)" class="btn btn--gold btn--sm">
              {{ t('common.shopNow') }} · {{ selectedArticle.model }}
            </NuxtLink>
            <button type="button" class="btn btn--ghost btn--sm" @click="selectedArticle = null">
              {{ t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nhero {
  position: relative;
  height: 62vh;
  min-height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #060606;
  overflow: hidden;
}
.nhero__bg { position: absolute; inset: 0; }
.nhero__bg img { width: 100%; height: 100%; object-fit: cover; opacity: 0.55; }
.nhero__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.85) 100%);
}
.nhero__inner { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.nhero__scroll { position: absolute; bottom: 22px; left: 50%; transform: translateX(-50%); z-index: 3; }

.ngrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 42px 32px;
}
.ncard {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.25s, transform 0.3s var(--ease), box-shadow 0.3s var(--ease);
}
.ncard:hover {
  border-color: #111111;
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}
.ncard__media {
  position: relative;
  aspect-ratio: 495 / 400;
  overflow: hidden;
  background: #0c0c0c;
}
.ncard__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s var(--ease);
}
.ncard:hover .ncard__media img { transform: scale(1.05); }
.ncard__model {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(8, 8, 8, 0.85);
  color: var(--gold);
  font-family: var(--font-geo);
  font-size: 9.5px;
  letter-spacing: 0.2em;
  padding: 4px 10px;
}
.ncard__body {
  padding: 24px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}
.ncard__date {
  font-family: var(--font-geo);
  font-size: 10px;
  letter-spacing: 0.22em;
  color: var(--gold);
}
.ncard__title {
  font-family: var(--font-geo);
  font-size: 16.5px;
  font-weight: 500;
  letter-spacing: 0.04em;
  line-height: 1.45;
  color: #111111;
}
.ncard__excerpt {
  font-size: 13.5px;
  font-weight: 300;
  line-height: 1.75;
  color: var(--ink-muted);
}
.ncard__foot {
  margin-top: auto;
  padding-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ncard__shop {
  font-family: var(--font-geo);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #111111;
}
.ncard__shop:hover { color: var(--gold); }

.nmodal {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(0, 0, 0, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.nmodal__dialog {
  position: relative;
  max-width: 720px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  background: #ffffff;
}
.nmodal__close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  width: 36px;
  height: 36px;
  border: 0;
  background: rgba(8, 8, 8, 0.8);
  color: #ffffff;
}
.nmodal__img { aspect-ratio: 16 / 9; background: #080808; overflow: hidden; }
.nmodal__img img { width: 100%; height: 100%; object-fit: cover; }
.nmodal__body { padding: 32px; display: flex; flex-direction: column; gap: 12px; }
.nmodal__title { font-size: 22px; font-weight: 500; line-height: 1.35; }
.nmodal__p { font-size: 14.5px; line-height: 1.85; color: var(--ink-soft); }

@media (max-width: 980px) { .ngrid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 620px) { .ngrid { grid-template-columns: 1fr; } }
</style>
