<script setup lang="ts">
const { t, locale} = useI18n()
const localePath = useLocalePath()
const { site } = useSite()

const values = computed(() => {
  if (locale.value === 'en') {
    return [
      { k: 'curated', v: 'Every watch is inspected by our team before it reaches you.' },
      { k: 'service', v: 'Servicing, batteries and warranty support for as long as you own the watch.' },
      { k: 'authentic', v: 'Sourced directly, guaranteed genuine — no exceptions.' },
      { k: 'craft', v: 'We choose timepieces that reward a second look.' }
    ]
  }
  return [
    { k: 'curated', v: 'นาฬิกาทุกเรือนผ่านการตรวจสอบจากทีมงานก่อนส่งถึงมือคุณ' },
    { k: 'service', v: 'บริการซ่อมบำรุง เปลี่ยนแบตเตอรี่ และประกันคุณภาพตลอดการใช้งาน' },
    { k: 'authentic', v: 'จัดหาจากแหล่งผลิตโดยตรง รับประกันของแท้ 100%' },
    { k: 'craft', v: 'เราเลือกนาฬิกาที่ควรค่าแก่การมองมองครั้งที่สอง' }
  ]
})

useHead({ title: `${t('nav.aboutUs')} — ${site.value.name}` })
</script>

<template>
  <section class="hero">
    <div class="container hero__inner">
      <p class="eyebrow">{{ t('home.craftEyebrow') }}</p>
      <h1 class="hero__title">{{ t('home.craftTitle') }}</h1>
      <p class="hero__sub">{{ t('home.craftBody') }}</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="story">
        <div class="story__media"><img src="/images/hero-watch.jpg" alt="" loading="lazy" /></div>
        <div class="story__text">
          <p class="eyebrow">{{ t('nav.aboutUs') }}</p>
          <h2 class="page-title" style="font-size: 2.2rem; margin: 14px 0 20px">A slower kind of luxury</h2>
          <p class="story__body" v-if="locale === 'en'">
            Opwatch began with a simple frustration: finding a watch that felt considered was harder than it should be. We started selecting a small number of timepieces each season — automatics and dress watches from makers who care about finishing, proportion and reliability — and offering them in a space without pressure.
          </p>
          <p class="story__body" v-else>
            โอปอล วอทช์ เริ่มต้นจากความรู้สึกไม่สบายใจอย่างหนึ่ง — การหานาฬิกาที่ “ผ่านการคิดมาแล้ว” นั้นยากกว่าที่ควร เราจึงเริ่มคัดสรรนาฬิกาจำนวนหนึ่งในแต่ละฤดูกาล ทั้งออโตเมติกและดราส์ จากผู้ผลิตที่ใส่ใจในรายละเอียด สัดส่วน และความทนทาน และนำเสนอในพื้นที่ที่ไร้ซึ่งแรงกดดัน
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--dark values">
    <div class="container">
      <p class="eyebrow" style="color: var(--gold-soft)">{{ t('home.craftEyebrow') }}</p>
      <h2 class="page-title" style="color: #f7f4ee; margin: 14px 0 44px">{{ locale === 'en' ? 'What we stand for' : 'สิ่งที่เรายึดถือ' }}</h2>
      <div class="values__grid">
        <div v-for="(v, i) in values" :key="v.k" class="value">
          <span class="value__num">0{{ i + 1 }}</span>
          <h3 class="serif value__title">{{ t('home.' + v.k) }}</h3>
          <p class="value__body">{{ v.v }}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container center cta">
      <p class="eyebrow" style="justify-content: center">{{ t('home.ctaEyebrow') }}</p>
      <h2 class="page-title" style="margin: 16px 0 12px">{{ t('home.ctaTitle') }}</h2>
      <p class="muted" style="margin-bottom: 28px">{{ t('home.ctaBody') }}</p>
      <NuxtLink :to="localePath('/products')" class="btn btn--gold">{{ t('home.heroCtaPrimary') }}</NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.hero { background: var(--ink); color: #f7f4ee; padding-block: 110px 120px; position: relative; overflow: hidden; }
.hero__inner { max-width: 700px; }
.hero__inner .eyebrow { color: var(--gold-soft); }
.hero__title { font-size: clamp(2.6rem, 6vw, 4.4rem); margin: 20px 0 18px; }
.hero__sub { font-size: 17px; line-height: 1.85; color: #ddd6c7; max-width: 560px; }

.story { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.story__media { aspect-ratio: 4 / 5; overflow: hidden; background: var(--sand); }
.story__media img { width: 100%; height: 100%; object-fit: cover; }
.story__body { font-size: 16px; line-height: 1.95; color: var(--ink-soft); }

.values__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 36px; }
.value__num { font-family: var(--font-display); font-size: 22px; color: var(--gold); }
.value__title { font-size: 20px; margin: 12px 0 10px; color: #f7f4ee; }
.value__body { font-size: 14px; line-height: 1.75; color: rgba(244,240,232,0.72); }

.cta { text-align: center; }

@media (max-width: 1000px) { .values__grid { grid-template-columns: repeat(2, 1fr); gap: 32px; } }
@media (max-width: 860px) { .story { grid-template-columns: 1fr; gap: 36px; } }
@media (max-width: 620px) { .values__grid { grid-template-columns: 1fr; } }
</style>
