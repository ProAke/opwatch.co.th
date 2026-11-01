<script setup lang="ts">
const { t, locale } = useI18n()
const { site } = useSite()

const distributors = [
  {
    code: 'TH',
    country: 'THAILAND',
    city: 'Bangkok · Official Boutique & Service Center',
    partner: 'Inter Times Co., Ltd. · Opwatch Official',
    photo: '/images/op/hero-gold-stones.jpg',
    highlight: true
  },
  {
    code: 'TW',
    country: 'TAIWAN',
    city: 'Taipei · Regional Headquarters',
    partner: 'Bamboo Shadow Co., Ltd.',
    photo: '/images/op/lifestyle-men.jpg',
    highlight: false
  },
  {
    code: 'VN',
    country: 'VIET NAM',
    city: 'Ho Chi Minh & Hanoi',
    partner: 'Truong Hoan Co., Ltd.',
    photo: '/images/op/portrait-8934msk.jpg',
    highlight: false
  },
  {
    code: 'MM',
    country: 'MYANMAR',
    city: 'Yangon · Authorized Service Center',
    partner: 'Cherry Oo Service Center',
    photo: '/images/op/landmark-myanmar.jpg',
    highlight: false
  },
  {
    code: 'LA',
    country: 'LAOS',
    city: 'Vientiane',
    partner: 'XG Watches Co., Ltd.',
    photo: '/images/op/lifestyle-lady.jpg',
    highlight: false
  },
  {
    code: 'KH',
    country: 'CAMBODIA',
    city: 'Phnom Penh',
    partner: 'Europe Swiss Watch',
    photo: '/images/op/hero-ceramic-dark.jpg',
    highlight: false
  },
  {
    code: 'BD',
    country: 'BANGLADESH',
    city: 'Dhaka',
    partner: 'Kallol Group Of Companies',
    photo: '/images/op/lifestyle-sport.jpg',
    highlight: false
  }
]

const form = reactive({ name: '', email: '', phone: '', message: '' })
const sent = ref(false)

function submit() {
  if (!form.name.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) || !form.message.trim()) return
  sent.value = true
  useToast().success(locale.value === 'en' ? 'Message received — our concierge will reply shortly.' : 'ส่งข้อความเรียบร้อย ทีมงานจะติดต่อกลับโดยเร็วที่สุด')
  form.name = ''
  form.email = ''
  form.phone = ''
  form.message = ''
}

function scrollToDist() {
  if (import.meta.client) {
    document.getElementById('distributors')?.scrollIntoView({ behavior: 'smooth' })
  }
}

useHead(() => ({
  title: `${t('nav.contactUs')} — Olym Pianus · ${site.value.name}`
}))
</script>

<template>
  <div class="opcontact">
    <!-- 1. Dark Hero Banner + Scroll Cue -->
    <section class="chero">
      <div class="chero__bg">
        <img src="/images/op/hero-ceramic-dark.jpg" alt="Contact Olym Pianus" />
      </div>
      <div class="chero__scrim" />
      <div class="container chero__inner">
        <p class="eyebrow">GLOBAL &amp; REGIONAL NETWORK</p>
        <h1 class="page-title" style="color: #ffffff">{{ locale === 'en' ? 'CONTACT US' : 'ติดต่อเรา · CONTACT US' }}</h1>
      </div>
      <button type="button" class="op-scroll-cue chero__scroll" @click="scrollToDist">
        <span>scroll</span>
        <span class="op-scroll-cue__line" />
      </button>
    </section>

    <!-- 2. 7 Regional Authorized Distributor Cards (exact olympianus.com/contact-us/ structure) -->
    <section id="distributors" class="section" style="background: #ffffff">
      <div class="container">
        <div class="op-sec-head">
          <h2 class="op-sec-title">{{ locale === 'en' ? 'AUTHORIZED DISTRIBUTORS' : t('home.distributorsTitle') }}</h2>
          <p class="op-sec-sub">
            {{
              locale === 'en'
                ? 'Official regional service centers and authorized distributors across Asia.'
                : 'เครือข่ายตัวแทนจำหน่ายและศูนย์บริการมาตรฐานอย่างเป็นทางการในภูมิภาคเอเชีย'
            }}
          </p>
        </div>

        <div class="dgrid">
          <article
            v-for="d in distributors"
            :key="d.country"
            class="dcard"
            :class="{ 'is-highlight': d.highlight }"
          >
            <div class="dcard__visual">
              <img :src="d.photo" :alt="d.country" loading="lazy" />
              <!-- Crisp Vector Country Flag Badge -->
              <span class="dcard__flag" :title="d.country">
                <svg v-if="d.code === 'TH'" viewBox="0 0 30 20"><rect width="30" height="20" fill="#A51931"/><rect y="3.3" width="30" height="13.4" fill="#F4F5F8"/><rect y="6.6" width="30" height="6.8" fill="#2D2A4A"/></svg>
                <svg v-else-if="d.code === 'TW'" viewBox="0 0 30 20"><rect width="30" height="20" fill="#FE0000"/><rect width="15" height="10" fill="#000095"/><circle cx="7.5" cy="5" r="2.6" fill="#fff"/></svg>
                <svg v-else-if="d.code === 'VN'" viewBox="0 0 30 20"><rect width="30" height="20" fill="#DA251D"/><polygon points="15,4.5 16.5,9 21,9 17.4,11.7 18.8,16 15,13.4 11.2,16 12.6,11.7 9,9 13.5,9" fill="#FFFF00"/></svg>
                <svg v-else-if="d.code === 'MM'" viewBox="0 0 30 20"><rect width="30" height="6.7" fill="#FECB00"/><rect y="6.7" width="30" height="6.7" fill="#34B233"/><rect y="13.4" width="30" height="6.6" fill="#EA2839"/><polygon points="15,4.5 16.7,9.5 22,9.5 17.7,12.6 19.3,17.5 15,14.5 10.7,17.5 12.3,12.6 8,9.5 13.3,9.5" fill="#fff"/></svg>
                <svg v-else-if="d.code === 'LA'" viewBox="0 0 30 20"><rect width="30" height="20" fill="#CE1126"/><rect y="5" width="30" height="10" fill="#002868"/><circle cx="15" cy="10" r="3.6" fill="#fff"/></svg>
                <svg v-else-if="d.code === 'KH'" viewBox="0 0 30 20"><rect width="30" height="20" fill="#032EA1"/><rect y="5" width="30" height="10" fill="#E00025"/><rect x="10" y="7.5" width="10" height="5" fill="#fff"/></svg>
                <svg v-else viewBox="0 0 30 20"><rect width="30" height="20" fill="#006A4E"/><circle cx="13.5" cy="10" r="5" fill="#F42A41"/></svg>
              </span>
            </div>
            <div class="dcard__body">
              <p class="dcard__country">{{ d.country }}</p>
              <h3 class="dcard__partner">{{ d.partner }}</h3>
              <p class="dcard__city">{{ d.city }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- 3. Direct Boutique Inquiry & Concierge Form -->
    <section class="section cformsec">
      <div class="container cform">
        <div class="cform__info">
          <OpCrest size="sm" :sublabel="(site.name || 'OPWATCH').toUpperCase()" />
          <h2 class="cform__heading">
            {{ locale === 'en' ? 'THAILAND BOUTIQUE CONCIERGE' : 'ศูนย์บริการลูกค้าประเทศไทย' }}
          </h2>
          <p class="cform__desc">
            {{
              locale === 'en'
                ? 'Inquire about watch availability, corporate gifts, warranty registration, or authorized mechanical servicing.'
                : 'สอบถามข้อมูลรุ่นนาฬิกา สั่งซื้อออนไลน์ ลงทะเบียนรับประกัน หรือติดต่อศูนย์บริการตรวจเช็คเครื่อง'
            }}
          </p>
          <div class="cform__meta">
            <div>
              <span class="tiny upper faint">{{ t('footer.phone') }}</span>
              <p><a :href="`tel:${site.phone}`">{{ site.phone }}</a></p>
            </div>
            <div>
              <span class="tiny upper faint">{{ t('footer.email') }}</span>
              <p><a :href="`mailto:${site.email}`">{{ site.email }}</a></p>
            </div>
            <div>
              <span class="tiny upper faint">{{ t('footer.address') }}</span>
              <p>Inter Times Co., Ltd. · {{ site.name }} Bangkok, Thailand</p>
            </div>
          </div>
        </div>

        <form class="cform__box" @submit.prevent="submit">
          <div class="cform__row">
            <div class="field">
              <label class="label">{{ t('auth.name') }} *</label>
              <input v-model="form.name" class="input" required />
            </div>
            <div class="field">
              <label class="label">{{ t('auth.email') }} *</label>
              <input v-model="form.email" type="email" class="input" required />
            </div>
          </div>
          <div class="field">
            <label class="label">{{ t('checkout.phone') }}</label>
            <input v-model="form.phone" class="input" />
          </div>
          <div class="field">
            <label class="label">{{ t('checkout.note') }} *</label>
            <textarea v-model="form.message" class="textarea" required />
          </div>
          <div class="row gap-16 wrap">
            <button type="submit" class="btn btn--gold">{{ t('nav.contactUs') }}</button>
            <span v-if="sent" class="small" style="color: var(--gold)">✓ {{ t('account.profileSaved') }}</span>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<style scoped>
.chero {
  position: relative;
  height: 60vh;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #060606;
  overflow: hidden;
}
.chero__bg { position: absolute; inset: 0; }
.chero__bg img { width: 100%; height: 100%; object-fit: cover; opacity: 0.48; }
.chero__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.38) 55%, rgba(0,0,0,0.85) 100%);
}
.chero__inner { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.chero__scroll { position: absolute; bottom: 22px; left: 50%; transform: translateX(-50%); z-index: 3; }

.dgrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}
.dcard {
  border: 1px solid var(--line);
  background: #ffffff;
  transition: border-color 0.25s, transform 0.25s var(--ease);
}
.dcard:hover {
  border-color: #111111;
  transform: translateY(-3px);
}
.dcard.is-highlight {
  border-color: var(--gold);
  box-shadow: var(--shadow);
}
.dcard__visual {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: #0d0d0d;
}
.dcard__visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dcard__flag {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 38px;
  height: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
  display: block;
}
.dcard__flag svg { width: 100%; height: 100%; display: block; }
.dcard__body {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.dcard__country {
  font-family: var(--font-geo);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.24em;
  color: var(--gold);
}
.dcard__partner {
  font-family: var(--font-geo);
  font-size: 15.5px;
  font-weight: 500;
  color: #111111;
}
.dcard__city {
  font-size: 12.5px;
  color: var(--ink-muted);
}

.cformsec {
  background: #0e0e0e;
  color: #ffffff;
}
.cform {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 56px;
  align-items: start;
}
.cform__info { display: flex; flex-direction: column; gap: 18px; }
.cform__heading {
  font-family: var(--font-geo);
  font-size: 22px;
  font-weight: 300;
  letter-spacing: 0.16em;
  color: #ffffff;
}
.cform__desc {
  color: rgba(255, 255, 255, 0.68);
  font-weight: 300;
  line-height: 1.85;
}
.cform__meta {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding-top: 20px;
}
.cform__meta p { color: #ffffff; font-size: 14.5px; margin-top: 2px; }
.cform__box {
  background: #ffffff;
  color: var(--ink);
  padding: 36px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.cform__row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

@media (max-width: 980px) {
  .dgrid { grid-template-columns: repeat(2, 1fr); }
  .cform { grid-template-columns: 1fr; }
}
@media (max-width: 620px) {
  .dgrid { grid-template-columns: 1fr; }
  .cform__row { grid-template-columns: 1fr; }
  .cform__box { padding: 24px; }
}
</style>
