<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const reqFetch = useRequestFetch()

useHead({
  title: 'News & Campaigns — Olym Pianus · Opwatch'
})

const { data: campaignsRes } = await useAsyncData('op-news-campaigns', () =>
  reqFetch<{ items?: any[]; campaigns?: any[] }>('/api/campaigns')
)

const editorialStories = computed(() => [
  {
    id: 'story-899832',
    date: '2026 · NEW RELEASE',
    image: '/images/op/hero-diver-dark.jpg',
    title: locale.value === 'th'
      ? 'เปิดตัว Olym Pianus 899832AGS สปอร์ตไดเวอร์ขอบเซรามิกพรายน้ำสว่างพิเศษ'
      : 'Introducing Olym Pianus 899832AGS Automatic Ceramic Bezel Diver',
    excerpt: locale.value === 'th'
      ? 'สัมผัสความสมบูรณ์แบบของนาฬิกาสปอร์ตออโตเมติกที่มาพร้อมกระจกแซฟไฟร์แท้พร้อมเลนส์ขยายวันที่ และพรายน้ำสว่างคมชัดในที่มืด'
      : 'Engineered with a unidirectional ceramic bezel, cyclops sapphire crystal, and high-luminosity hands for effortless legibility.',
    to: { path: localePath('/products'), query: { category: 'men-diver' } }
  },
  {
    id: 'story-openheart',
    date: '2026 · CRAFTSMANSHIP',
    image: '/images/op/hero-gold-stones.jpg',
    title: locale.value === 'th'
      ? 'เสน่ห์หน้าปัด Open-Heart เผยจังหวะการทำงานของจักรกลออโตเมติก'
      : 'The Art of Open-Heart Horology: 99141 & 990 Mechanical Series',
    excerpt: locale.value === 'th'
      ? 'ชมความงดงามของบาลานซ์วีลที่เคลื่อนไหวอย่างเที่ยงตรงผ่านช่องหน้าปัด Open-Heart อันเป็นเอกลักษณ์ของ Olym Pianus'
      : 'Peer directly into the oscillating balance wheel through a signature open-heart aperture framed in rose gold and steel.',
    to: { path: localePath('/products'), query: { brand: 'olympinus' } }
  },
  {
    id: 'story-ladies',
    date: '2026 · LADIES ELEGANCE',
    image: '/images/op/lifestyle-lady.jpg',
    title: locale.value === 'th'
      ? 'คอลเลกชันสุภาพสตรีประดับคริสตัลและหน้าปัดมุกธรรมชาติ'
      : 'Timeless Grace: Ladies Mother-of-Pearl & Crystal Timepieces',
    excerpt: locale.value === 'th'
      ? 'เรือนเวลาขนาดกะทัดรัดที่ออกแบบมาเพื่อข้อมือสุภาพสตรีโดยเฉพาะ โดดเด่นด้วยประกายมุกแท้และตัวเรือนบางสง่างาม'
      : 'Delicate proportions meet radiant mother-of-pearl dials and faceted hour markers crafted for modern elegance.',
    to: { path: localePath('/products'), query: { category: 'women' } }
  },
  {
    id: 'story-ogival',
    date: '2026 · HAUTE HORLOGERIE',
    image: '/images/op/hero-ceramic-dark.jpg',
    title: locale.value === 'th'
      ? 'Ogival 1903 และสัญลักษณ์ปลาโดดแห่งความโชคดีจากสวิตเซอร์แลนด์'
      : 'Ogival La Chaux-de-Fonds: Over a Century of Swiss Blessing & Artistry',
    excerpt: locale.value === 'th'
      ? 'เรื่องราวของแบรนด์นาฬิกาสวิสระดับสูงในเครือบูติก Opwatch ที่นักสะสมทั่วเอเชียให้ความไว้วางใจมายาวนานกว่าศตวรรษ'
      : 'Discover the heritage of Ogival skeleton and diamond-set timepieces available exclusively at Opwatch Thailand.',
    to: { path: localePath('/brands/ogival') }
  }
])

const liveCampaigns = computed(() => campaignsRes.value?.items || campaignsRes.value?.campaigns || [])
</script>

<template>
  <div class="op-news">
    <!-- Hero -->
    <section class="op-news__hero">
      <img src="/images/op/lifestyle-sport.jpg" alt="Olym Pianus News" class="op-news__hero-img" />
      <div class="op-news__hero-scrim" />
      <div class="container op-news__hero-body">
        <span class="op-news__eyebrow">OLYM PIANUS · JOURNAL</span>
        <h1 class="page-title">News</h1>
        <p>
          {{
            locale === 'th'
              ? 'อัปเดตคอลเลกชันใหม่ ข่าวสารกิจกรรม และแคมเปญพิเศษจากบูติก Olym Pianus · Opwatch'
              : 'Latest releases, horological stories, and official boutique announcements.'
          }}
        </p>
      </div>
    </section>

    <!-- Editorial Grid (#f8f8f8 main_color) -->
    <section class="section section--pearl">
      <div class="container">
        <div class="op-news__grid">
          <article v-for="item in editorialStories" :key="item.id" class="op-news__card">
            <NuxtLink :to="item.to" class="op-news__media">
              <img :src="item.image" :alt="item.title" loading="lazy" />
            </NuxtLink>
            <div class="op-news__body">
              <span class="op-news__date">{{ item.date }}</span>
              <h2>
                <NuxtLink :to="item.to">{{ item.title }}</NuxtLink>
              </h2>
              <p>{{ item.excerpt }}</p>
              <NuxtLink :to="item.to" class="link-underline">
                {{ locale === 'th' ? 'อ่านเพิ่มเติม & ชมสินค้า' : 'Discover More' }}
              </NuxtLink>
            </div>
          </article>
        </div>

        <!-- Active Boutique Campaigns from Database (#ebebf1 alternate_color) -->
        <div v-if="liveCampaigns.length" class="op-news__campaigns">
          <div class="op-sec-head">
            <h2 class="op-sec-title">{{ locale === 'th' ? 'BOUTIQUE CAMPAIGNS' : 'BOUTIQUE CAMPAIGNS' }}</h2>
          </div>
          <div class="op-news__camp-grid">
            <div v-for="c in liveCampaigns" :key="c.id || c.slug" class="op-news__camp-card">
              <span class="badge badge--gold">{{ c.badgeText || 'OFFICIAL CAMPAIGN' }}</span>
              <h3>{{ locale === 'en' && c.titleEn ? c.titleEn : c.titleTh || c.titleEn }}</h3>
              <p>{{ locale === 'en' && c.subtitleEn ? c.subtitleEn : c.subtitleTh || c.subtitleEn }}</p>
              <NuxtLink :to="localePath('/products')" class="btn btn--ghost btn--sm">
                {{ locale === 'th' ? 'ชมเรือนเวลาร่วมรายการ' : 'Shop Campaign' }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.op-news__hero {
  position: relative;
  min-height: 52vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--ink);
  color: #ffffff;
  padding-top: var(--header-h);
  overflow: hidden;
}
.op-news__hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.48;
}
.op-news__hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 22, 54, 0.58) 0%, rgba(20, 22, 54, 0.85) 100%);
}
.op-news__hero-body {
  position: relative;
  z-index: 2;
  padding-block: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.op-news__eyebrow {
  font-family: var(--font-roman);
  font-size: 11px;
  letter-spacing: 0.3em;
  color: var(--champagne-soft);
}
.op-news__hero-body h1 { color: #ffffff; }
.op-news__hero-body p {
  max-width: 580px;
  font-family: var(--font-display);
  font-size: 18.5px;
  color: rgba(255, 255, 255, 0.88);
}

.op-news__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 40px;
}
.op-news__card {
  background: #ffffff;
  border: 1px solid var(--sand);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  transition: transform 0.35s var(--ease), box-shadow 0.35s;
}
.op-news__card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}
.op-news__media {
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--ink);
}
.op-news__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s var(--ease);
}
.op-news__card:hover .op-news__media img {
  transform: scale(1.05);
}
.op-news__body {
  padding: 30px 32px 34px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}
.op-news__date {
  font-family: var(--font-roman);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.24em;
  color: var(--sapphire);
}
.op-news__body h2 {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 500;
  line-height: 1.38;
  letter-spacing: 0.03em;
}
.op-news__body h2 a:hover { color: var(--sapphire); }
.op-news__body p {
  color: var(--ink-soft);
  font-size: 15px;
  line-height: 1.8;
}

.op-news__campaigns {
  margin-top: 88px;
  padding-top: 68px;
  border-top: 1px solid var(--line-strong);
}
.op-news__camp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}
.op-news__camp-card {
  padding: 34px;
  background: #ffffff;
  border: 1px solid var(--line-strong);
  border-bottom: 2px solid var(--sapphire);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}
.op-news__camp-card h3 {
  font-family: var(--font-display);
  font-size: 22px;
}
.op-news__camp-card p {
  color: var(--ink-soft);
  font-size: 14.5px;
  flex: 1;
}

@media (max-width: 820px) {
  .op-news__grid { grid-template-columns: 1fr; }
}
</style>
