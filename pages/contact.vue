<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()

useHead({
  title: 'ติดต่อเรา — บริษัท อินเตอร์ไทมส์ จำกัด (Opwatch.co.th)'
})

const officialBrands = [
  { slug: 'olympianus', name: 'Olym Pianus', logo: '/images/logos/olym-pianus.jpg' },
  { slug: 'olympia-star', name: 'Olympia Star', logo: '/images/logos/olympia-star.jpg' },
  { slug: 'ogival', name: 'Ogival', logo: '/images/logos/ogival.jpg' }
]

const form = reactive({
  name: '',
  email: '',
  phone: '',
  model: '',
  message: ''
})
const sent = ref(false)

function submitInquiry() {
  sent.value = true
}
</script>

<template>
  <div class="op-contact">
    <!-- Hero -->
    <section class="op-contact__hero">
      <img src="/images/op/hero-gold-stones.jpg" alt="Contact Inter Times Thailand" class="op-contact__hero-img" />
      <div class="op-contact__hero-scrim" />
      <div class="container op-contact__hero-body">
        <span class="op-contact__eyebrow">OFFICIAL THAILAND DISTRIBUTOR & SERVICE CENTER</span>
        <h1 class="page-title">{{ locale === 'th' ? 'ติดต่อเรา' : 'Contact Us' }}</h1>
        <p>
          {{
            locale === 'th'
              ? 'บริษัท อินเตอร์ไทมส์ จำกัด — ผู้จัดจำหน่ายและศูนย์บริการอย่างเป็นทางการในประเทศไทย สำหรับแบรนด์ Olym Pianus, Olympia Star และ Ogival'
              : 'Inter Times Co., Ltd. — Official Thailand Distributor & Horological Service Center for Olym Pianus, Olympia Star, and Ogival.'
          }}
        </p>
      </div>
    </section>

    <!-- Official Company Info + Inquiry Form -->
    <section class="section section--pearl">
      <div class="container op-contact__grid">
        <div>
          <span class="eyebrow">HEADQUARTERS & SERVICE CENTER</span>
          <h2 class="op-contact__h2">
            {{ locale === 'th' ? 'ข้อมูลติดต่อบริษัทและช่องทางทางการ' : 'Official Headquarters & Channels' }}
          </h2>

          <div class="op-contact__list">
            <!-- Official Inter Times Card -->
            <div class="op-contact__card is-featured">
              <h3>{{ locale === 'th' ? 'บริษัท อินเตอร์ไทมส์ จำกัด' : 'Inter Times Co., Ltd. (บริษัท อินเตอร์ไทมส์ จำกัด)' }}</h3>
              <p class="op-contact__addr">
                <strong>{{ locale === 'th' ? 'ที่อยู่ :' : 'Address :' }}</strong>
                {{
                  locale === 'th'
                    ? '1091/229 ซอย 35 ถนนเพชรบุรีตัดใหม่ แขวงมักกะสัน เขตราชเทวี กรุงเทพมหานคร 10400'
                    : '1091/229 Soi 35, New Phetchaburi Rd., Makkasan, Ratchathewi, Bangkok 10400, Thailand'
                }}
              </p>
              <p class="op-contact__tel">
                <strong>{{ locale === 'th' ? 'โทรศัพท์ :' : 'Phone :' }}</strong>
                <a href="tel:022515777">02 251 5777</a>
              </p>
            </div>

            <!-- Official Social & Marketplace Channels -->
            <div class="op-contact__card">
              <span class="op-contact__region">OFFICIAL ONLINE CHANNELS</span>
              <h3>{{ locale === 'th' ? 'ช่องทางติดต่อและร้านค้าออนไลน์ทางการ' : 'Official Social & Store Channels' }}</h3>
              <ul class="op-contact__channels">
                <li>
                  <span>Line ID :</span>
                  <a href="https://line.me/ti/p/~opwatch.th" target="_blank" rel="noopener noreferrer">opwatch.th</a>
                </li>
                <li>
                  <span>Facebook Page :</span>
                  <a href="https://www.facebook.com/OPwatchThailand" target="_blank" rel="noopener noreferrer">
                    https://www.facebook.com/OPwatchThailand
                  </a>
                </li>
                <li>
                  <span>Shopee Official :</span>
                  <a href="https://shopee.co.th/opwatchthailand" target="_blank" rel="noopener noreferrer">
                    https://shopee.co.th/opwatchthailand
                  </a>
                </li>
              </ul>
            </div>

            <!-- 3 Official Watch Brands -->
            <div class="op-contact__card">
              <span class="op-contact__region">3 OFFICIAL WATCH BRANDS</span>
              <h3>{{ locale === 'th' ? 'แบรนด์นาฬิกาในเครือจัดจำหน่าย' : 'Authorized Watch Brands' }}</h3>
              <div class="op-contact__brands-row">
                <NuxtLink
                  v-for="b in officialBrands"
                  :key="b.slug"
                  :to="localePath(`/brands/${b.slug}`)"
                  class="op-contact__brand-box"
                >
                  <img :src="b.logo" :alt="b.name" loading="lazy" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <div class="op-contact__form-box">
          <span class="eyebrow">BOUTIQUE CONCIERGE</span>
          <h2 class="op-contact__h2">
            {{ locale === 'th' ? 'สอบถามข้อมูลเรือนเวลา / บริการหลังการขาย' : 'Timepiece & Service Inquiry' }}
          </h2>

          <div v-if="sent" class="op-contact__sent">
            <h3>{{ locale === 'th' ? 'ส่งข้อความเรียบร้อยแล้ว' : 'Thank You for Your Inquiry' }}</h3>
            <p>
              {{
                locale === 'th'
                  ? 'บริษัท อินเตอร์ไทมส์ จำกัด ได้รับข้อมูลของท่านแล้ว และจะติดต่อกลับโดยเร็วที่สุด'
                  : 'Inter Times Co., Ltd. has received your message and will respond shortly.'
              }}
            </p>
            <button type="button" class="btn btn--sm" @click="sent = false">
              {{ locale === 'th' ? 'ส่งข้อความใหม่' : 'Send Another Message' }}
            </button>
          </div>

          <form v-else class="stack gap-16" @submit.prevent="submitInquiry">
            <div class="field">
              <label class="label">{{ locale === 'th' ? 'ชื่อ - นามสกุล *' : 'Full Name *' }}</label>
              <input v-model="form.name" class="input" required />
            </div>
            <div class="op-contact__two">
              <div class="field">
                <label class="label">{{ locale === 'th' ? 'อีเมล *' : 'Email *' }}</label>
                <input v-model="form.email" type="email" class="input" required />
              </div>
              <div class="field">
                <label class="label">{{ locale === 'th' ? 'เบอร์โทรศัพท์' : 'Phone' }}</label>
                <input v-model="form.phone" class="input" placeholder="02 251 5777" />
              </div>
            </div>
            <div class="field">
              <label class="label">{{ locale === 'th' ? 'รหัสรุ่น / แบรนด์ที่สนใจ' : 'Model Reference / Brand (Optional)' }}</label>
              <input v-model="form.model" class="input" placeholder="Olym Pianus / Olympia Star / Ogival" />
            </div>
            <div class="field">
              <label class="label">{{ locale === 'th' ? 'รายละเอียดข้อความ *' : 'Message *' }}</label>
              <textarea v-model="form.message" class="textarea" required />
            </div>
            <button type="submit" class="btn">
              {{ locale === 'th' ? 'ส่งข้อความถึงฝ่ายบริการลูกค้า' : 'Send Inquiry' }}
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.op-contact__hero {
  position: relative;
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--ink);
  color: #ffffff;
  padding-top: var(--header-h);
  overflow: hidden;
}
.op-contact__hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.45;
}
.op-contact__hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 22, 54, 0.58) 0%, rgba(20, 22, 54, 0.86) 100%);
}
.op-contact__hero-body {
  position: relative;
  z-index: 2;
  padding-block: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.op-contact__eyebrow {
  font-family: var(--font-roman);
  font-size: 11px;
  letter-spacing: 0.3em;
  color: #ffffff;
}
.op-contact__hero-body h1 { color: #ffffff; }
.op-contact__hero-body p {
  max-width: 660px;
  font-family: var(--font-display);
  font-size: 18.5px;
  color: #ffffff;
}

.op-contact__grid {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 56px;
  align-items: start;
}
.op-contact__h2 {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 500;
  color: var(--ink);
  margin: 8px 0 24px;
}
.op-contact__list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.op-contact__card {
  background: #ffffff;
  border: 1px solid var(--sand);
  padding: 24px 26px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.op-contact__card.is-featured {
  border-color: var(--sapphire);
  border-left: 4px solid var(--sapphire);
}
.op-contact__company-logo {
  height: 46px;
  width: fit-content;
  max-width: 100%;
  object-fit: contain;
  margin-bottom: 6px;
}
.op-contact__region {
  font-family: var(--font-roman);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.22em;
  color: var(--sapphire);
}
.op-contact__card h3 {
  font-family: var(--font-display);
  font-size: 21px;
  font-weight: 600;
  color: var(--ink);
}
.op-contact__addr,
.op-contact__tel {
  font-size: 14.5px;
  color: var(--ink-soft);
  line-height: 1.7;
}
.op-contact__tel a {
  color: var(--sapphire);
  font-weight: 600;
  margin-left: 6px;
}
.op-contact__channels {
  list-style: none;
  padding: 0;
  margin: 6px 0 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.op-contact__channels li {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 14.5px;
}
.op-contact__channels span {
  font-weight: 600;
  color: var(--ink);
  min-width: 120px;
}
.op-contact__channels a {
  color: var(--sapphire);
  word-break: break-all;
}
.op-contact__channels a:hover {
  text-decoration: underline;
}

.op-contact__brands-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 8px;
}
.op-contact__brand-box {
  background: #ffffff;
  border: 1px solid var(--line-strong);
  padding: 10px;
  height: 82px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, transform 0.2s;
}
.op-contact__brand-box:hover {
  border-color: var(--sapphire);
  transform: translateY(-2px);
}
.op-contact__brand-box img {
  max-height: 64px;
  max-width: 100%;
  object-fit: contain;
}

.op-contact__form-box {
  background: #ffffff;
  border: 1px solid var(--sand);
  padding: 36px 34px;
}
.op-contact__two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.op-contact__sent {
  padding: 28px;
  background: var(--ivory);
  border: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

@media (max-width: 960px) {
  .op-contact__grid { grid-template-columns: 1fr; gap: 36px; }
}
@media (max-width: 560px) {
  .op-contact__two { grid-template-columns: 1fr; }
  .op-contact__brands-row { grid-template-columns: 1fr; }
}
</style>
