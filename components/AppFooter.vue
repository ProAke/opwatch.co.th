<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()

/* Exact 7 regional distributors listed in the official olympianus.com footer */
const distributors = [
  { region: 'SINGAPORE, MALAYSIA', company: 'Top Win Enterprise Co., Ltd.', highlight: false },
  { region: 'VIETNAM', company: 'Truong Hoan Co., Ltd.', highlight: false },
  { region: 'THAILAND', company: 'Inter Times Co., Ltd.', highlight: true },
  { region: 'CAMBODIA', company: 'LD Watch Enterprise', highlight: false },
  { region: 'TAIWAN', company: 'Laipao Co., Ltd.', highlight: false },
  { region: 'HONG KONG', company: 'Fullwing International Development Ltd.', highlight: false },
  { region: 'MIDDLE EAST', company: 'Top Win Watch Trading LLC', highlight: false }
]

function scrollToTop() {
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <footer class="op-ftr">
    <!-- Upper Main Footer: Exact olympianus.com #f0f0f0 Platinum Surface (footer_color) -->
    <div class="op-ftr__main">
      <div class="container op-ftr__inner">
        <div class="op-ftr__distributors">
          <p
            v-for="d in distributors"
            :key="d.region"
            class="op-ftr__dist-line"
            :class="{ 'is-th': d.highlight }"
          >
            <span class="op-ftr__region">({{ d.region }})</span>
            <span class="op-ftr__dash">–</span>
            <span class="op-ftr__company">{{ d.company }}</span>
          </p>
        </div>

        <div class="op-ftr__cta">
          <NuxtLink :to="localePath('/contact')" class="op-ftr__contact-btn">
            {{ locale === 'th' ? 'Contact Us · ติดต่อเรา' : 'Contact Us' }}
          </NuxtLink>
        </div>

        <div class="op-ftr__social">
          <a
            href="https://line.me/R/ti/p/@olympianus"
            target="_blank"
            rel="noopener noreferrer"
            class="op-ftr__social-btn op-ftr__social-btn--line"
            aria-label="Official LINE"
          >
            <span>LINE</span>
          </a>
          <a
            href="https://www.facebook.com/OlymPianusThailand"
            target="_blank"
            rel="noopener noreferrer"
            class="op-ftr__social-btn op-ftr__social-btn--fb"
            aria-label="Official Facebook"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.2H7.5V13h2.7v8h3.3Z" />
            </svg>
          </a>
        </div>

        <!-- Centered Royal Sapphire & Midnight Olym Pianus Typographic Crest -->
        <div class="op-ftr__brand">
          <NuxtLink :to="localePath('/')" aria-label="Olym Pianus">
            <OpCrest size="lg" stacked theme="light" sublabel="OLYM PIANUS · OPWATCH · OGIVAL" />
          </NuxtLink>
        </div>

        <!-- Clean E-Commerce Quick Links Row -->
        <nav class="op-ftr__quick" aria-label="Boutique links">
          <NuxtLink :to="localePath('/')">{{ locale === 'th' ? 'หน้าแรก' : 'Home' }}</NuxtLink>
          <NuxtLink :to="localePath('/about')">About</NuxtLink>
          <NuxtLink :to="localePath('/products')">Collections</NuxtLink>
          <NuxtLink :to="localePath('/brands/opwatch')">Opwatch</NuxtLink>
          <NuxtLink :to="localePath('/brands/olympinus')">Olympinus</NuxtLink>
          <NuxtLink :to="localePath('/brands/ogival')">Ogival</NuxtLink>
          <NuxtLink :to="localePath('/news')">News</NuxtLink>
          <NuxtLink :to="localePath('/cart')">{{ locale === 'th' ? 'ตะกร้าสินค้า' : 'Cart' }}</NuxtLink>
          <NuxtLink :to="localePath('/account')">{{ locale === 'th' ? 'บัญชีสมาชิก' : 'Account' }}</NuxtLink>
          <NuxtLink :to="localePath('/office')">{{ locale === 'th' ? 'ระบบหลังบ้าน' : 'Back Office' }}</NuxtLink>
        </nav>
      </div>
    </div>

    <!-- Bottom Copyright Socket Bar: Exact olympianus.com #1d2088 Royal Sapphire (socket_color) -->
    <div class="op-ftr__socket">
      <div class="container op-ftr__socket-row">
        <p>© Copyright – Olym Pianus · Opwatch Official Boutique Thailand (Inter Times Co., Ltd.)</p>
        <div class="op-ftr__socket-links">
          <NuxtLink :to="localePath('/about')">Heritage</NuxtLink>
          <NuxtLink :to="localePath('/products')">Boutique</NuxtLink>
          <NuxtLink :to="localePath('/contact')">Service Center</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Floating Scroll-to-Top Button -->
    <button type="button" class="op-ftr__top" aria-label="Scroll to top" @click="scrollToTop">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="m18 15-6-6-6 6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </footer>
</template>

<style scoped>
.op-ftr {
  position: relative;
}

/* Exact olympianus.com #footer (--enfold-footer-color-bg: #f0f0f0) */
.op-ftr__main {
  background: var(--platinum);
  color: var(--ink-soft);
  border-top: 1px solid var(--line-strong);
}
.op-ftr__inner {
  padding-block: 76px 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.op-ftr__distributors {
  display: flex;
  flex-direction: column;
  gap: 9px;
  max-width: 720px;
}
.op-ftr__dist-line {
  font-family: var(--font-display);
  font-size: 16.5px;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
  line-height: 1.65;
}
.op-ftr__dist-line.is-th {
  color: var(--sapphire);
  font-weight: 600;
}
.op-ftr__region {
  font-family: var(--font-roman);
  font-size: 12.5px;
  letter-spacing: 0.14em;
  color: var(--ink);
}
.op-ftr__dist-line.is-th .op-ftr__region {
  color: var(--sapphire);
}
.op-ftr__dash {
  margin-inline: 9px;
  color: var(--sapphire-soft);
}

.op-ftr__cta {
  margin-top: 32px;
}
.op-ftr__contact-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 38px;
  background: var(--sapphire);
  border: 1px solid var(--sapphire);
  color: #ffffff;
  font-family: var(--font-roman);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  transition: background 0.28s var(--ease), border-color 0.28s var(--ease), box-shadow 0.28s var(--ease);
}
.op-ftr__contact-btn:hover {
  background: var(--sapphire-bright);
  border-color: var(--sapphire-bright);
  box-shadow: 0 8px 22px rgba(29, 32, 136, 0.22);
}

.op-ftr__social {
  margin-top: 26px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.op-ftr__social-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: transform 0.25s var(--ease), box-shadow 0.25s;
}
.op-ftr__social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(25, 26, 53, 0.16);
}
.op-ftr__social-btn--line {
  background: #06C755;
  font-family: var(--font-sans);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.op-ftr__social-btn--fb {
  background: #1877F2;
}

.op-ftr__brand {
  margin-top: 44px;
}

.op-ftr__quick {
  margin-top: 38px;
  padding-top: 24px;
  border-top: 1px solid var(--line-strong);
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 26px;
  font-family: var(--font-roman);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.op-ftr__quick a:hover {
  color: var(--sapphire);
}

/* Exact olympianus.com #socket (--enfold-socket-color-bg: #1d2088) */
.op-ftr__socket {
  background: var(--sapphire);
  border-top: 1px solid var(--sapphire-soft);
  padding-block: 16px;
  font-size: 11.5px;
  letter-spacing: 0.08em;
  color: #eeeeee;
}
.op-ftr__socket-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.op-ftr__socket-links {
  display: flex;
  gap: 22px;
  font-family: var(--font-roman);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.op-ftr__socket-links a {
  color: #ffffff;
  transition: color 0.2s;
}
.op-ftr__socket-links a:hover {
  color: #a4b9ff;
}

.op-ftr__top {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 40;
  width: 42px;
  height: 42px;
  background: #ffffff;
  border: 1px solid var(--line-strong);
  color: var(--sapphire);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow);
  transition: background 0.25s, color 0.25s, border-color 0.25s;
}
.op-ftr__top:hover {
  background: var(--sapphire);
  border-color: var(--sapphire);
  color: #ffffff;
}

@media (max-width: 640px) {
  .op-ftr__socket-row { justify-content: center; text-align: center; }
}
</style>
