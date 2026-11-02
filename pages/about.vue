<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()

useHead({
  title: 'About Olym Pianus — Opwatch Official Boutique'
})

const pillars = computed(() => [
  {
    roman: 'I',
    title: 'Exquisite',
    th: 'ความประณีตพิถีพิถัน',
    desc: locale.value === 'th'
      ? 'พิถีพิถันในทุกรายละเอียด ตั้งแต่กระจกแซฟไฟร์แท้ ตัวเรือนสเตนเลสสตีลเกรดพรีเมียม ไปจนถึงการขัดแต่งหน้าปัดอย่างวิจิตร'
      : 'Meticulous attention to every facet — from scratch-resistant sapphire crystal to hand-finished dials and surgical-grade cases.'
  },
  {
    roman: 'II',
    title: 'Competition',
    th: 'พลังแห่งการก้าวข้ามขีดจำกัด',
    desc: locale.value === 'th'
      ? 'สืบทอดจิตวิญญาณนักกีฬาโอลิมปิกที่มุ่งมั่นพัฒนาความแม่นยำและสมรรถนะของกลไกอย่างไม่หยุดยั้ง'
      : 'Driven by the Olympic pursuit of excellence, continually advancing mechanical reliability and horological precision.'
  },
  {
    roman: 'III',
    title: 'Glory',
    th: 'เกียรติยศเหนือกาลเวลา',
    desc: locale.value === 'th'
      ? 'ตราสัญลักษณ์มงกุฎและช่อมะกอกแห่งชัยชนะ สะท้อนความภาคภูมิใจของผู้สวมใส่ในทุกช่วงเวลาสำคัญของชีวิต'
      : 'Crowned with the emblem of victory and olive laurels, celebrating every milestone and triumph on your wrist.'
  },
  {
    roman: 'IV',
    title: 'Heritage',
    th: 'มรดกศาสตร์แห่งเรือนเวลา',
    desc: locale.value === 'th'
      ? 'ผสานรากฐานการประดิษฐ์นาฬิกาสวิสตั้งแต่ยุคทศวรรษ 1950 เข้ากับเทคโนโลยีเครื่องจักรร่วมสมัยได้อย่างกลมกลืน'
      : 'Rooted in 1950s Swiss watchmaking tradition, uniting classical craftsmanship with contemporary design mastery.'
  }
])
</script>

<template>
  <div class="op-about">
    <!-- Hero Banner -->
    <section class="op-about__hero">
      <img src="/images/op/hero-ceramic-dark.jpg" alt="About Olym Pianus" class="op-about__hero-img" />
      <div class="op-about__hero-scrim" />
      <div class="container op-about__hero-body">
        <OpCrest size="md" stacked theme="dark" sublabel="SINCE THE 1950S · SWISS SPIRIT" />
        <h1 class="page-title">About Olym Pianus</h1>
        <p>
          {{
            locale === 'th'
              ? 'แรงบันดาลใจจากเกียรติยศสูงสุดแห่งจิตวิญญาณโอลิมปิก สู่เรือนเวลาคุณภาพระดับสากล'
              : 'Inspired by the ultimate glory of the Olympic spirit, fusing exquisite craftsmanship and contemporary watchmaking.'
          }}
        </p>
      </div>
    </section>

    <!-- Our Story (#f8f8f8 main_color) -->
    <section class="section section--pearl">
      <div class="container op-about__story">
        <div class="op-sec-head">
          <h2 class="op-sec-title">Our Story</h2>
        </div>

        <div class="op-about__prose">
          <p v-if="locale === 'th'">
            <strong>Olym Pianus (โอลิมปิอานัส)</strong> ถือกำเนิดขึ้นจากแรงบันดาลใจอันยิ่งใหญ่ของจิตวิญญาณแห่งกีฬาโอลิมปิก
            สืบสานศาสตร์การประดิษฐ์นาฬิกาคุณภาพสูงที่มีจุดเริ่มต้นในสวิตเซอร์แลนด์ตั้งแต่ช่วงทศวรรษ 1950
            โดยยึดมั่นในการผสานงานฝีมืออันประณีตเข้ากับนวัตกรรมการผลิตเรือนเวลายุคใหม่อย่างลงตัว
          </p>
          <p v-else>
            <strong>Olym Pianus</strong> was born from the enduring spirit of the Olympic Games — honoring a watchmaking
            lineage established in Switzerland in the 1950s. Every timepiece fuses traditional horological discipline with
            contemporary aesthetics and dependable everyday engineering.
          </p>

          <p v-if="locale === 'th'">
            ภายใต้บูติกทางการ <strong>Opwatch Thailand</strong> เราคัดสรรเรือนเวลาครบทั้ง 3 แบรนด์หลักในเครือ ได้แก่
            <strong>Opwatch</strong> (กลไกญี่ปุ่นความเที่ยงตรงสูง), <strong>Olym Pianus</strong> (ดีไซน์หรูหราผสานจิตวิญญาณสวิส)
            และ <strong>Ogival</strong> (เรือนเวลาสวิสระดับพรีเมียมตั้งแต่ปี 1903) เพื่อให้คนรักนาฬิกาชาวไทยได้สัมผัสเรือนเวลาแท้พร้อมการรับประกันศูนย์ไทยอย่างมั่นใจ
          </p>
          <p v-else>
            Through the official <strong>Opwatch Boutique</strong>, collectors can explore all three sister houses —
            <strong>Opwatch</strong> (Japanese movement precision), <strong>Olym Pianus</strong> (Swiss-inspired elegance
            with sapphire crystal), and <strong>Ogival</strong> (prestigious Swiss lucky-fish heritage since 1903).
          </p>
        </div>
      </div>
    </section>

    <!-- 4 Brand Pillars (.TextIconBox on #ebebf1 alternate_color) -->
    <section class="section section--alt">
      <div class="container">
        <div class="op-sec-head">
          <h2 class="op-sec-title">Brand Spirit</h2>
        </div>

        <div class="op-about__pillars">
          <article v-for="p in pillars" :key="p.title" class="op-about__pillar">
            <span class="op-about__roman">{{ p.roman }}</span>
            <h3>{{ p.title }}</h3>
            <p v-if="locale === 'th'" class="op-about__pillar-th">{{ p.th }}</p>
            <p class="op-about__pillar-desc">{{ p.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Core Value + Lady 1920x1280 Banner Split (#ffffff + #f8f8f8) -->
    <section class="op-about__split">
      <div class="op-about__split-img">
        <img src="/images/op/lifestyle-lady.jpg" alt="Olym Pianus Core Value" loading="lazy" />
      </div>
      <div class="op-about__split-text">
        <div class="op-about__split-inner">
          <span class="eyebrow">CORE VALUE</span>
          <h2>
            {{
              locale === 'th'
                ? 'คุณค่าแท้จริงที่สัมผัสได้ในทุกวินาที'
                : 'Enduring Craftsmanship for Every Generation'
            }}
          </h2>
          <p>
            {{
              locale === 'th'
                ? 'เรามุ่งมั่นสร้างสรรค์เรือนเวลาที่เปี่ยมด้วยคุณภาพเหนือระดับ ทั้งกระจกแซฟไฟร์แท้ ตัวเรือนสเตนเลสสตีล 316L และกลไกที่ผ่านการตรวจสอบความเที่ยงตรงทุกเรือนก่อนถึงมือคุณ'
                : 'Every watch is fitted with premium materials — scratch-resistant sapphire crystal, 316L surgical stainless steel, and rigorously regulated movements.'
            }}
          </p>
          <NuxtLink :to="localePath('/products')" class="btn">
            {{ locale === 'th' ? 'ชมคอลเลกชันทั้งหมด' : 'Explore Collections' }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.op-about__hero {
  position: relative;
  min-height: 62vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--ink);
  color: #ffffff;
  overflow: hidden;
  padding-top: var(--header-h);
}
.op-about__hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.56;
}
.op-about__hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 22, 54, 0.58) 0%, rgba(20, 22, 54, 0.84) 100%);
}
.op-about__hero-body {
  position: relative;
  z-index: 2;
  padding-block: 76px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}
.op-about__hero-body h1 { color: #ffffff; }
.op-about__hero-body p {
  max-width: 640px;
  font-family: var(--font-display);
  font-size: 19px;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.75;
}

.op-about__story { max-width: 880px; }
.op-about__prose {
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: var(--font-display);
  font-size: 19.5px;
  line-height: 1.95;
  color: var(--ink-soft);
  text-align: center;
}
.op-about__prose strong {
  color: var(--ink);
  font-weight: 600;
}

/* Exact olympianus.com .TextIconBox style */
.op-about__pillars {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}
.op-about__pillar {
  background: #ffffff;
  border: 1px solid var(--line-strong);
  border-bottom: 2px solid var(--sapphire);
  padding: 40px 26px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.3s var(--ease), box-shadow 0.3s;
}
.op-about__pillar:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}
.op-about__roman {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  background: var(--sapphire-tint);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-roman);
  font-size: 12px;
  font-weight: 600;
  color: var(--sapphire);
  margin-bottom: 6px;
}
.op-about__pillar h3 {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--ink);
}
.op-about__pillar-th {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--sapphire);
}
.op-about__pillar-desc {
  font-size: 14.5px;
  color: var(--ink-soft);
  line-height: 1.8;
  margin-top: 4px;
}

.op-about__split {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  background: var(--ivory);
  border-top: 1px solid var(--line);
}
.op-about__split-img { min-height: 480px; }
.op-about__split-img img { width: 100%; height: 100%; object-fit: cover; }
.op-about__split-text {
  display: flex;
  align-items: center;
  padding: 76px 56px;
}
.op-about__split-inner {
  max-width: 470px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}
.op-about__split-inner h2 {
  font-family: var(--font-display);
  color: var(--ink);
  font-size: clamp(1.75rem, 2.8vw, 2.4rem);
  font-weight: 500;
  line-height: 1.3;
}
.op-about__split-inner p {
  color: var(--ink-soft);
  line-height: 1.85;
}

@media (max-width: 980px) {
  .op-about__pillars { grid-template-columns: repeat(2, 1fr); }
  .op-about__split { grid-template-columns: 1fr; }
}
@media (max-width: 560px) {
  .op-about__pillars { grid-template-columns: 1fr; }
}
</style>
