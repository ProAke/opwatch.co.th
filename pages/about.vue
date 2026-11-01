<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { site } = useSite()

const pillars = computed(() => [
  {
    key: 'exquisite',
    titleEn: 'Exquisite',
    titleTh: 'Exquisite · ความประณีตสูงสุด',
    descEn: 'Sapphire crystal, surgical-grade 316L steel, and meticulous hand-inspected dial finishing.',
    descTh: 'กระจกแซฟไฟร์แท้ ตัวเรือนสเตนเลสสตีล 316L และรายละเอียดหน้าปัดที่ผ่านการตรวจสอบอย่างพิถีพิถันทุกเรือน',
    icon: 'diamond'
  },
  {
    key: 'competition',
    titleEn: 'Competition',
    titleTh: 'Competition · จิตวิญญาณนักสู้',
    descEn: 'Driven by the Olympic motto "Faster, Higher, Stronger" — relentlessly advancing horological accuracy.',
    descTh: 'ขับเคลื่อนด้วยคำขวัญโอลิมปิก “Faster, Higher, Stronger” มุ่งมั่นพัฒนาความเที่ยงตรงอย่างไม่หยุดยั้ง',
    icon: 'flame'
  },
  {
    key: 'glory',
    titleEn: 'Glory',
    titleTh: 'Glory · เกียรติยศเหนือกาลเวลา',
    descEn: 'Crowned by our signature OP heraldic shield — a tribute to triumph, character, and enduring prestige.',
    descTh: 'ประดับตราสัญลักษณ์มงกุฎโล่ OP อันเป็นเอกลักษณ์ สื่อถึงเกียรติยศ ความสำเร็จ และรสนิยมอันสง่างาม',
    icon: 'crown'
  },
  {
    key: 'heritage',
    titleEn: 'Heritage',
    titleTh: 'Heritage · มรดกแห่งศาสตร์นาฬิกา',
    descEn: 'Born from Swiss horological roots in the 1950s and fused with dependable Japanese movements since the 1980s.',
    descTh: 'หลอมรวมรากฐานการผลิตนาฬิกาสวิสยุค 1950 เข้ากับความแม่นยำทนทานของกลไกญี่ปุ่นตั้งแต่ทศวรรษ 1980',
    icon: 'gear'
  }
])

function scrollDown() {
  if (import.meta.client) {
    document.getElementById('our-story')?.scrollIntoView({ behavior: 'smooth' })
  }
}

useHead(() => ({
  title: `${t('nav.aboutUs')} — Olym Pianus · ${site.value.name}`
}))
</script>

<template>
  <div class="opabout">
    <!-- 1. Full-Bleed Dark Hero Banner + Scroll Cue -->
    <section class="abhero">
      <div class="abhero__bg">
        <img src="/images/op/hero-gold-stones.jpg" alt="About Olym Pianus" />
      </div>
      <div class="abhero__scrim" />
      <div class="container abhero__inner">
        <OpCrest size="md" :stacked="true" sublabel="SINCE 1950S HERITAGE" />
        <h1 class="page-title abhero__title">
          {{ locale === 'en' ? 'ABOUT OLYM PIANUS' : 'เกี่ยวกับ OLYM PIANUS · OPWATCH' }}
        </h1>
      </div>
      <button type="button" class="op-scroll-cue abhero__scroll" @click="scrollDown">
        <span>scroll</span>
        <span class="op-scroll-cue__line" />
      </button>
    </section>

    <!-- 2. Our Story (Exact olympianus.com/about-olym-pianus/ Narrative) -->
    <section id="our-story" class="section abstory">
      <div class="container abstory__inner">
        <div class="op-sec-head" style="margin-bottom: 36px">
          <h2 class="op-sec-title">{{ locale === 'en' ? 'OUR STORY' : 'เรื่องราวของเรา · OUR STORY' }}</h2>
        </div>

        <p v-if="locale === 'en'" class="abstory__lead">
          Originating from Switzerland’s revered watchmaking tradition and inspired by the Olympic Games motto
          <strong>“Faster, Higher, Stronger”</strong>, Olym Pianus was born to celebrate human excellence and timeless precision.
        </p>
        <p v-else class="abstory__lead">
          ถือกำเนิดจากรากฐานศาสตร์การประดิษฐ์เรือนเวลาแห่งสวิตเซอร์แลนด์ และได้รับแรงบันดาลใจจากคำขวัญของการแข่งขันโอลิมปิก
          <strong>“Faster, Higher, Stronger”</strong> สู่แบรนด์เรือนเวลาที่เชิดชูความเป็นเลิศและความเที่ยงตรงเหนือกาลเวลา
        </p>

        <p v-if="locale === 'en'" class="abstory__body">
          In the 1980s, Olym Pianus pioneered a synthesis of European design elegance with ultra-reliable Japanese mechanical and quartz movements, fitted exclusively with scratch-resistant sapphire crystals. Today, through Opwatch Official Boutique — alongside our sister houses Olympinus and Ogival (founded 1903) — we bring authentic watchmaking artistry directly to collectors across Thailand and Asia.
        </p>
        <p v-else class="abstory__body">
          ในช่วงทศวรรษ 1980 Olym Pianus ได้ผสานดีไซน์อันหรูหราแบบยุโรปเข้ากับกลไกออโตเมติกและควอตซ์ความแม่นยำสูงจากประเทศญี่ปุ่น พร้อมมาตรฐานกระจกแซฟไฟร์แท้ป้องกันรอยขีดข่วน ปัจจุบันภายใต้ Opwatch Official Boutique เรานำเสนอเรือนเวลาแท้จากทั้ง 3 แบรนด์หลัก ได้แก่ Opwatch, Olympinus และ Ogival (1903) พร้อมการรับประกันและศูนย์บริการมาตรฐานในประเทศไทย
        </p>
      </div>
    </section>

    <!-- 3. Four Horological Pillars: Exquisite / Competition / Glory / Heritage -->
    <section class="abpillars">
      <div class="container">
        <div class="abpillars__grid">
          <div v-for="p in pillars" :key="p.key" class="abpillar">
            <div class="abpillar__icon" aria-hidden="true">
              <svg v-if="p.icon === 'diamond'" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                <path d="M6 3h12l4 6-10 12L2 9l4-6Z" />
                <path d="M2 9h20M12 21 8 9l4-6 4 6-4 12Z" />
              </svg>
              <svg v-else-if="p.icon === 'flame'" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                <path d="M12 2c1.5 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4.5 2.5-6 0 2 1.5 3 2.5 3 0-2.5-.5-4.5 0-7Z" />
                <path d="M8 21h8" />
              </svg>
              <svg v-else-if="p.icon === 'crown'" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                <path d="m3 18 2-11 5 4 2-6 2 6 5-4 2 11H3Z" />
                <path d="M3 21h18" />
              </svg>
              <svg v-else width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                <circle cx="12" cy="12" r="8.5" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" />
              </svg>
            </div>
            <h3 class="abpillar__title">{{ locale === 'en' ? p.titleEn : p.titleTh }}</h3>
            <p class="abpillar__desc">{{ locale === 'en' ? p.descEn : p.descTh }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Core Value + Full-Bleed 1920x1280 Lifestyle Banner -->
    <section class="abcore">
      <div class="abcore__media">
        <img src="/images/op/lifestyle-lady.jpg" alt="Olym Pianus Core Value" loading="lazy" />
      </div>
      <div class="abcore__panel">
        <div class="abcore__box">
          <p class="eyebrow">CORE VALUE</p>
          <h2 class="abcore__heading">
            {{ locale === 'en' ? 'Crafted for Every Milestone' : 'คุณค่าที่ส่งต่อในทุกช่วงเวลาสำคัญ' }}
          </h2>
          <p class="abcore__text">
            {{
              locale === 'en'
                ? 'Every timepiece we deliver is backed by official manufacturer warranty, genuine sapphire protection, and lifelong horological servicing at our authorized Bangkok center.'
                : 'นาฬิกาทุกเรือนมาพร้อมใบรับประกันศูนย์อย่างเป็นทางการ กระจกแซฟไฟร์แท้ และการดูแลหลังการขายโดยช่างผู้ชำนาญการประจำศูนย์บริการกรุงเทพฯ'
            }}
          </p>
          <NuxtLink :to="localePath('/products')" class="btn btn--gold">
            {{ locale === 'en' ? 'Explore Collections' : t('home.heroCtaPrimary') }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.abhero {
  position: relative;
  height: 72vh;
  min-height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #060606;
  color: #ffffff;
  overflow: hidden;
}
.abhero__bg { position: absolute; inset: 0; }
.abhero__bg img { width: 100%; height: 100%; object-fit: cover; opacity: 0.52; }
.abhero__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.38) 55%, rgba(0,0,0,0.85) 100%);
}
.abhero__inner { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 22px; }
.abhero__title { color: #ffffff; }
.abhero__scroll { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 3; }

.abstory { background: #ffffff; text-align: center; }
.abstory__inner { max-width: 820px; }
.abstory__lead {
  font-family: var(--font-display);
  font-size: clamp(1.35rem, 2.4vw, 1.85rem);
  line-height: 1.65;
  color: #111111;
  margin-bottom: 24px;
}
.abstory__lead strong { color: var(--gold); font-weight: 600; }
.abstory__body {
  font-size: 15px;
  font-weight: 300;
  line-height: 1.95;
  color: var(--ink-muted);
}

.abpillars {
  background: #0b0b0b;
  color: #ffffff;
  padding-block: 88px;
}
.abpillars__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28px;
}
.abpillar {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #121212;
  padding: 38px 26px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  transition: border-color 0.25s;
}
.abpillar:hover { border-color: var(--gold); }
.abpillar__icon { color: var(--gold); }
.abpillar__title {
  font-family: var(--font-geo);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #ffffff;
}
.abpillar__desc {
  font-size: 13.5px;
  font-weight: 300;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.65);
}

.abcore {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  background: #141414;
  color: #ffffff;
}
.abcore__media { min-height: 480px; overflow: hidden; }
.abcore__media img { width: 100%; height: 100%; object-fit: cover; }
.abcore__panel { display: flex; align-items: center; padding: 72px 56px; }
.abcore__box { max-width: 460px; display: flex; flex-direction: column; align-items: flex-start; gap: 18px; }
.abcore__heading {
  font-family: var(--font-geo);
  font-size: clamp(1.6rem, 2.8vw, 2.2rem);
  font-weight: 300;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.abcore__text {
  font-size: 14.5px;
  font-weight: 300;
  line-height: 1.9;
  color: rgba(255, 255, 255, 0.72);
  margin-bottom: 8px;
}

@media (max-width: 1020px) {
  .abpillars__grid { grid-template-columns: repeat(2, 1fr); }
  .abcore { grid-template-columns: 1fr; }
  .abcore__panel { padding: 56px 28px; }
}
@media (max-width: 580px) {
  .abpillars__grid { grid-template-columns: 1fr; }
}
</style>
