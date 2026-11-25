<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()

const pressItems = computed(() => [
  {
    key: 'news',
    number: '01',
    title: 'News',
    eyebrow: locale.value === 'th' ? 'ข่าวสารล่าสุด' : 'LATEST UPDATES',
    description: locale.value === 'th' ? 'ข่าวสาร ประกาศ และความเคลื่อนไหวล่าสุดจาก OPWatch Thailand' : 'The latest news, announcements, and updates from OPWatch Thailand.',
    to: localePath('/news')
  },
  {
    key: 'reviews',
    number: '02',
    title: locale.value === 'th' ? 'รีวิวสินค้า' : 'Product Reviews',
    eyebrow: locale.value === 'th' ? 'HANDS-ON REVIEWS' : 'HANDS-ON REVIEWS',
    description: locale.value === 'th' ? 'รีวิวและประสบการณ์เกี่ยวกับเรือนเวลา Olym Pianus, Olympia Star และ Ogival' : 'Hands-on reviews of Olym Pianus, Olympia Star, and Ogival timepieces.',
    to: { path: localePath('/reviews'), query: { type: 'reviews' } }
  },
  {
    key: 'articles',
    number: '03',
    title: locale.value === 'th' ? 'บทความ' : 'Articles',
    eyebrow: locale.value === 'th' ? 'WATCH JOURNAL' : 'WATCH JOURNAL',
    description: locale.value === 'th' ? 'คู่มือเลือกซื้อ เปรียบเทียบกลไก และคำแนะนำการดูแลรักษานาฬิกา' : 'Buying guides, movement comparisons, and watch-care advice.',
    to: { path: localePath('/reviews'), query: { type: 'articles' } }
  }
])

useHead({
  title: () => locale.value === 'th' ? 'Press · ข่าวสาร รีวิว และบทความ | OPWatch Thailand' : 'Press · News, Reviews & Articles | OPWatch Thailand'
})
</script>

<template>
  <div class="op-press-page">
    <section class="op-press-hero">
      <div class="container">
        <span class="eyebrow">OPWATCH PRESS · STORIES &amp; JOURNAL</span>
        <h1>Press</h1>
        <p>{{ locale === 'th' ? 'ติดตามข่าวสาร รีวิวสินค้า และบทความความรู้จาก OPWatch Thailand' : 'News, product reviews, and horological articles from OPWatch Thailand.' }}</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="op-press-grid">
          <NuxtLink v-for="item in pressItems" :key="item.key" :to="item.to" class="op-press-card">
            <span class="op-press-card__number">{{ item.number }}</span>
            <span class="op-press-card__eyebrow">{{ item.eyebrow }}</span>
            <h2>{{ item.title }}</h2>
            <p>{{ item.description }}</p>
            <span class="op-press-card__link">{{ locale === 'th' ? 'เลือกชม →' : 'Explore →' }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.op-press-hero {
  padding: calc(var(--header-h) + 46px) 0 54px;
  color: #ffffff;
  background: linear-gradient(125deg, #101444 0%, #1d2088 68%, #272b9d 100%);
}
.op-press-hero .eyebrow,
.op-press-hero h1,
.op-press-hero p {
  color: #ffffff;
}
.op-press-hero .eyebrow {
  font-family: var(--font-roman);
  font-size: 10px;
  letter-spacing: 0.24em;
  opacity: 0.8;
}
.op-press-hero h1 {
  margin: 8px 0 6px;
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3.1rem);
  font-weight: 500;
}
.op-press-hero p {
  max-width: 680px;
  line-height: 1.7;
  opacity: 0.9;
}
.op-press-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}
.op-press-card {
  position: relative;
  display: flex;
  min-height: 240px;
  flex-direction: column;
  align-items: flex-start;
  padding: 26px;
  border: 1px solid var(--sand);
  background: #ffffff;
  color: var(--ink);
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}
.op-press-card:hover {
  transform: translateY(-3px);
  border-color: var(--sapphire);
  box-shadow: 0 16px 36px rgba(29, 32, 136, 0.1);
}
.op-press-card__number {
  position: absolute;
  top: 16px;
  right: 20px;
  color: #e7e8f2;
  font-family: var(--font-roman);
  font-size: 36px;
}
.op-press-card__eyebrow {
  color: var(--sapphire);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
}
.op-press-card h2 {
  margin: 14px 0 8px;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 23px;
  font-weight: 600;
}
.op-press-card p {
  max-width: 350px;
  color: var(--ink-muted);
  font-size: 14px;
  line-height: 1.7;
}
.op-press-card__link {
  margin-top: auto;
  padding-top: 22px;
  color: var(--sapphire);
  font-size: 13px;
  font-weight: 700;
}
@media (max-width: 760px) {
  .op-press-grid { grid-template-columns: 1fr; }
  .op-press-card { min-height: 190px; }
}
</style>
