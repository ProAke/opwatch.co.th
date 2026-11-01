<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { site, brands } = useSite()
const year = new Date().getFullYear()

// Exact 7 Regional Distributors in exact olympianus.com order
const distributors = [
  { country: 'BANGLADESH', partner: 'Kallol Group Of Companies' },
  { country: 'CAMBODIA', partner: 'Europe Swiss Watch' },
  { country: 'LAOS', partner: 'XG Watches Co., Ltd.' },
  { country: 'MYANMAR', partner: 'Cherry Oo Service Center' },
  { country: 'TAIWAN', partner: 'Bamboo Shadow Co., Ltd.' },
  { country: 'THAILAND', partner: 'Inter Times Co., Ltd. · Opwatch Official' },
  { country: 'VIET NAM', partner: 'Truong Hoan Co., Ltd.' }
]

const showTopBtn = ref(false)

onMounted(() => {
  const onScroll = () => {
    showTopBtn.value = window.scrollY > 360
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})

function scrollToTop() {
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <footer class="opftr">
    <div class="container opftr__inner">
      <!-- 1. Centered 7 Regional Distributors List (exact olympianus.com layout) -->
      <ul class="opftr__dist">
        <li v-for="d in distributors" :key="d.country" :class="{ 'is-th': d.country === 'THAILAND' }">
          <span class="opftr__country">({{ d.country }})</span>
          <span class="opftr__dash">–</span>
          <span class="opftr__partner">{{ d.partner }}</span>
        </li>
      </ul>

      <!-- 2. Centered [Contact Us] Button -->
      <div class="opftr__cta">
        <NuxtLink :to="localePath('/contact')" class="btn btn--ghost-light btn--sm">
          {{ locale === 'en' ? 'Contact Us' : t('nav.contactUs') }}
        </NuxtLink>
      </div>

      <!-- 3. Circular LINE & Facebook Icons (exact olympianus.com pair) -->
      <div class="opftr__socials">
        <a
          href="https://line.me"
          target="_blank"
          rel="noopener noreferrer"
          class="opsoc opsoc--line"
          aria-label="LINE Official"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3c-5.2 0-9.4 3.4-9.4 7.6 0 3.7 3.3 6.9 7.8 7.5.3.1.7.2.8.5.1.3.1.7 0 1l-.3 1.6c-.1.4-.4 1.6 1.4.9 1.8-.8 5.9-3.5 8-6 1.5-1.6 2.1-3.4 2.1-5.5C21.4 6.4 17.2 3 12 3z" />
          </svg>
        </a>
        <a
          href="https://www.facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          class="opsoc opsoc--fb"
          aria-label="Facebook"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 9h3V5.5h-3c-2.4 0-3.8 1.5-3.8 3.8V11H7.5v3.4h2.7V21h3.6v-6.6h2.9l.5-3.4h-3.4V9.6c0-.4.2-.6.6-.6z" />
          </svg>
        </a>
      </div>

      <!-- 4. Large Centered Crown-Shield OP + Olym Pianus Typographic Emblem -->
      <div class="opftr__emblem">
        <NuxtLink :to="localePath('/')">
          <OpCrest size="lg" :stacked="true" :sublabel="`${(site.name || 'OPWATCH').toUpperCase()} OFFICIAL BOUTIQUE`" />
        </NuxtLink>
      </div>

      <!-- 5. Clean Minimal Single-Line E-Commerce & Back-Office Navigation -->
      <nav class="opftr__links" aria-label="Footer">
        <NuxtLink :to="localePath('/')">{{ locale === 'en' ? 'Home' : t('nav.home') }}</NuxtLink>
        <NuxtLink :to="localePath('/about')">{{ t('nav.aboutUs') }}</NuxtLink>
        <NuxtLink :to="localePath('/products')">{{ locale === 'en' ? 'Collections' : t('nav.collections') }}</NuxtLink>
        <NuxtLink v-for="b in brands" :key="b.slug" :to="localePath('/brands/' + b.slug)">
          {{ locale === 'en' ? b.nameEn || b.name : b.nameTh || b.name }}
        </NuxtLink>
        <NuxtLink :to="localePath('/news')">{{ locale === 'en' ? 'News' : t('nav.news') }}</NuxtLink>
        <NuxtLink :to="localePath('/cart')">{{ t('nav.cart') }}</NuxtLink>
        <NuxtLink :to="localePath('/account')">{{ t('nav.account') }}</NuxtLink>
        <NuxtLink :to="localePath('/office')">{{ t('nav.office') }}</NuxtLink>
      </nav>

      <!-- 6. Copyright Line -->
      <p class="opftr__copy">
        © Copyright {{ year }} - Olym Pianus · {{ site.name || 'Opwatch' }} ({{ site.phone }} · {{ site.email }})
      </p>
    </div>

    <!-- Floating Scroll-to-Top Square Button (#top on olympianus.com) -->
    <button
      v-show="showTopBtn"
      type="button"
      class="optop"
      aria-label="Scroll to top"
      title="Scroll to top"
      @click="scrollToTop"
    >
      ↑
    </button>
  </footer>
</template>

<style scoped>
.opftr {
  background: #080808;
  color: #bdbdbd;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-block: 80px 44px;
  text-align: center;
  position: relative;
}
.opftr__inner {
  max-width: 860px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.opftr__dist {
  list-style: none;
  padding: 0;
  margin: 0 0 32px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: var(--font-geo);
  font-size: 13px;
  font-weight: 300;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.72);
}
.opftr__dist li.is-th {
  color: #ffffff;
  font-weight: 500;
}
.opftr__country {
  letter-spacing: 0.14em;
}
.opftr__dash {
  margin-inline: 8px;
  color: var(--gold);
}

.opftr__cta {
  margin-bottom: 28px;
}

.opftr__socials {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 48px;
}
.opsoc {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: transform 0.25s var(--ease), opacity 0.25s;
}
.opsoc:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}
.opsoc--line {
  background: #06c755;
}
.opsoc--fb {
  background: #1877f2;
}

.opftr__emblem {
  margin-bottom: 40px;
}

.opftr__links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px 24px;
  padding-block: 22px;
  width: 100%;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-family: var(--font-geo);
  font-size: 10.5px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
.opftr__links a {
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.2s;
}
.opftr__links a:hover {
  color: var(--gold);
}

.opftr__copy {
  margin-top: 24px;
  font-family: var(--font-geo);
  font-size: 11px;
  font-weight: 300;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.42);
}

.optop {
  position: fixed;
  right: 26px;
  bottom: 26px;
  z-index: 55;
  width: 44px;
  height: 44px;
  background: rgba(14, 14, 14, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #ffffff;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.22s, border-color 0.22s, color 0.22s;
}
.optop:hover {
  background: var(--gold);
  border-color: var(--gold);
  color: #080808;
}
</style>
