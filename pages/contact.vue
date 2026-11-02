<script setup lang="ts">
const { locale } = useI18n()

useHead({
  title: 'Contact Us — Olym Pianus · Opwatch Official Boutique'
})

const distributors = [
  {
    region: 'THAILAND (OFFICIAL BOUTIQUE & SERVICE CENTER)',
    company: 'Inter Times Co., Ltd. · Opwatch Thailand',
    detail: 'Bangkok Authorized Sales, Warranty Registration & Horological Service Center',
    featured: true
  },
  {
    region: 'SINGAPORE, MALAYSIA',
    company: 'Top Win Enterprise Co., Ltd.',
    detail: 'Regional Authorized Distributor',
    featured: false
  },
  {
    region: 'VIETNAM',
    company: 'Truong Hoan Co., Ltd.',
    detail: 'Regional Authorized Distributor',
    featured: false
  },
  {
    region: 'CAMBODIA',
    company: 'LD Watch Enterprise',
    detail: 'Regional Authorized Distributor',
    featured: false
  },
  {
    region: 'TAIWAN',
    company: 'Laipao Co., Ltd.',
    detail: 'Regional Authorized Distributor',
    featured: false
  },
  {
    region: 'HONG KONG',
    company: 'Fullwing International Development Ltd.',
    detail: 'Regional Authorized Distributor',
    featured: false
  },
  {
    region: 'MIDDLE EAST',
    company: 'Top Win Watch Trading LLC',
    detail: 'Regional Authorized Distributor',
    featured: false
  }
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
      <img src="/images/op/hero-gold-stones.jpg" alt="Contact Olym Pianus" class="op-contact__hero-img" />
      <div class="op-contact__hero-scrim" />
      <div class="container op-contact__hero-body">
        <span class="op-contact__eyebrow">GLOBAL NETWORK & BOUTIQUE CONCIERGE</span>
        <h1 class="page-title">Contact Us</h1>
        <p>
          {{
            locale === 'th'
              ? 'ติดต่อศูนย์บริการและผู้จัดจำหน่ายอย่างเป็นทางการในประเทศไทย (Inter Times Co., Ltd.) และเครือข่ายนานาชาติ'
              : 'Connect with Inter Times Co., Ltd. (Thailand Official Distributor) and our international service network.'
          }}
        </p>
      </div>
    </section>

    <!-- Distributors + Concierge Inquiry (#f8f8f8 main_color) -->
    <section class="section section--pearl">
      <div class="container op-contact__grid">
        <div>
          <span class="eyebrow">OFFICIAL DISTRIBUTORS</span>
          <h2 class="op-contact__h2">
            {{ locale === 'th' ? 'เครือข่ายผู้จัดจำหน่ายอย่างเป็นทางการ' : 'Authorized Regional Distributors' }}
          </h2>

          <div class="op-contact__list">
            <div
              v-for="d in distributors"
              :key="d.region"
              class="op-contact__card"
              :class="{ 'is-featured': d.featured }"
            >
              <span class="op-contact__region">{{ d.region }}</span>
              <h3>{{ d.company }}</h3>
              <p>{{ d.detail }}</p>
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
                  ? 'ทีมผู้เชี่ยวชาญของ Opwatch Thailand ได้รับข้อมูลของท่านแล้ว และจะติดต่อกลับโดยเร็วที่สุด'
                  : 'Our Opwatch Thailand horological concierge has received your message and will respond shortly.'
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
                <input v-model="form.phone" class="input" />
              </div>
            </div>
            <div class="field">
              <label class="label">{{ locale === 'th' ? 'รหัสรุ่นที่สนใจ (เช่น 899832AGS)' : 'Model Reference (Optional)' }}</label>
              <input v-model="form.model" class="input" placeholder="899832AGS / Ogival / Opwatch" />
            </div>
            <div class="field">
              <label class="label">{{ locale === 'th' ? 'รายละเอียดข้อความ *' : 'Message *' }}</label>
              <textarea v-model="form.message" class="textarea" required />
            </div>
            <button type="submit" class="btn">
              {{ locale === 'th' ? 'ส่งข้อความถึงที่ปรึกษาบูติก' : 'Send Inquiry' }}
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
  color: var(--champagne-soft);
}
.op-contact__hero-body h1 { color: #ffffff; }
.op-contact__hero-body p {
  max-width: 620px;
  font-family: var(--font-display);
  font-size: 18.5px;
  color: rgba(255, 255, 255, 0.88);
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
  margin: 12px 0 28px;
}
.op-contact__list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.op-contact__card {
  padding: 20px 24px;
  border: 1px solid var(--line-strong);
  background: #ffffff;
}
.op-contact__card.is-featured {
  border-color: var(--sapphire);
  border-left: 3px solid var(--sapphire);
  background: var(--sapphire-tint);
}
.op-contact__region {
  font-family: var(--font-roman);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--sapphire);
}
.op-contact__card h3 {
  font-family: var(--font-display);
  font-size: 19.5px;
  font-weight: 600;
  margin-top: 4px;
}
.op-contact__card p {
  font-size: 13.5px;
  color: var(--ink-soft);
  margin-top: 4px;
}

.op-contact__form-box {
  padding: 40px;
  background: #ffffff;
  border: 1px solid var(--line-strong);
  border-top: 3px solid var(--sapphire);
  box-shadow: var(--shadow-sm);
}
.op-contact__two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.op-contact__sent {
  padding: 28px;
  background: var(--sapphire-tint);
  border: 1px solid var(--line-strong);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

@media (max-width: 920px) {
  .op-contact__grid { grid-template-columns: 1fr; }
  .op-contact__two { grid-template-columns: 1fr; }
  .op-contact__form-box { padding: 26px; }
}
</style>
