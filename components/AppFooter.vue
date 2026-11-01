<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { site, brands } = useSite()
const year = new Date().getFullYear()

const distributors = [
  { country: 'THAILAND', partner: 'Inter Times Co., Ltd. · Opwatch Official Boutique' },
  { country: 'TAIWAN', partner: 'Bamboo Shadow Co., Ltd.' },
  { country: 'VIET NAM', partner: 'Truong Hoan Co., Ltd.' },
  { country: 'LAOS', partner: 'XG Watches Co., Ltd.' },
  { country: 'CAMBODIA', partner: 'Europe Swiss Watch' },
  { country: 'MYANMAR', partner: 'Cherry Oo Service Center' },
  { country: 'BANGLADESH', partner: 'Kallol Group Of Companies' }
]

function scrollToTop() {
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <footer class="ftr">
    <!-- Olym Pianus style Regional Distributors & Direct Contact Band -->
    <div class="dist">
      <div class="container dist__inner">
        <p class="dist__eyebrow tiny upper">{{ t('home.distributorsTitle') }}</p>
        <ul class="dist__list">
          <li v-for="d in distributors" :key="d.country" :class="{ 'is-th': d.country === 'THAILAND' }">
            <span class="dist__country">({{ d.country }})</span>
            <span class="dist__sep">–</span>
            <span class="dist__partner">{{ d.partner }}</span>
          </li>
        </ul>

        <div class="dist__actions">
          <NuxtLink :to="localePath('/contact')" class="btn btn--outline-gold btn--sm">
            {{ t('nav.contactUs') }}
          </NuxtLink>
          <div class="dist__socials">
            <a
              href="https://line.me"
              target="_blank"
              rel="noopener noreferrer"
              class="socpill socpill--line"
              aria-label="LINE Official"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-5 0-9 3.3-9 7.5 0 2.5 1.5 4.7 3.8 6.1-.2.9-.8 2.3-1.6 3.4 1.8-.4 3.4-1.4 4.5-2.5.8.1 1.5.2 2.3.2 5 0 9-3.3 9-7.5S17 3 12 3z" />
              </svg>
              <span>LINE</span>
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              class="socpill"
              aria-label="Facebook"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 9h3V6h-3c-2 0-3 1.5-3 3v2H8v3h3v7h3v-7h2.5l.5-3H14V9.5c0-.5.3-.5.5-.5z" />
              </svg>
              <span>Facebook</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Main E-Commerce Footer -->
    <div class="container ftr__top">
      <div class="ftr__brand">
        <div class="brand">
          <span class="brand__mark">OP</span>
          <span class="brand__word">{{ site.name || 'OPWATCH' }}</span>
        </div>
        <p class="ftr__about">{{ t('footer.aboutBody') }}</p>
        <p class="tiny upper faint" style="margin-top: 14px">{{ site.phone }} · {{ site.email }}</p>
      </div>

      <div class="ftr__col">
        <h4 class="tiny upper">{{ t('nav.collections') }}</h4>
        <NuxtLink :to="localePath({ path: '/products', query: { category: 'men-watches' } })">Men Watch</NuxtLink>
        <NuxtLink :to="localePath({ path: '/products', query: { category: 'women-watches' } })">Ladies Watch</NuxtLink>
        <NuxtLink :to="localePath({ path: '/products', query: { category: 'sport-watches' } })">Sport Watch</NuxtLink>
        <NuxtLink :to="localePath({ path: '/products', query: { category: 'classic-watches' } })">Classic Watch</NuxtLink>
      </div>

      <div class="ftr__col">
        <h4 class="tiny upper">{{ t('nav.brands') }}</h4>
        <NuxtLink v-for="b in brands" :key="b.slug" :to="localePath('/brands/' + b.slug)">
          {{ locale === 'en' ? b.nameEn || b.name : b.nameTh || b.name }}
        </NuxtLink>
        <NuxtLink v-if="!brands.length" :to="localePath('/products')">Opwatch · Olympinus · Ogival</NuxtLink>
        <NuxtLink :to="localePath('/about')">{{ t('nav.aboutUs') }}</NuxtLink>
      </div>

      <div class="ftr__col">
        <h4 class="tiny upper">{{ t('footer.customerService') }}</h4>
        <NuxtLink :to="localePath('/cart')">{{ t('nav.cart') }}</NuxtLink>
        <NuxtLink :to="localePath('/account/orders')">{{ t('account.orders') }}</NuxtLink>
        <NuxtLink :to="localePath('/account')">{{ t('account.profile') }}</NuxtLink>
        <NuxtLink :to="localePath('/office')">{{ t('nav.office') }} (/office)</NuxtLink>
      </div>
    </div>

    <div class="ftr__bottom">
      <div class="container between wrap gap-12">
        <p class="tiny upper faint">© {{ year }} {{ site.name || 'Opwatch' }} · OLYM PIANUS HERITAGE. {{ t('footer.rights') }}</p>
        <button type="button" class="topbtn tiny upper" @click="scrollToTop">
          Scroll to top ↑
        </button>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.ftr { background: #11100f; color: #d9d2c6; margin-top: 0; }

.dist {
  background: #171614;
  border-top: 1px solid rgba(176, 141, 87, 0.22);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  padding-block: 56px;
  text-align: center;
}
.dist__inner { max-width: 820px; }
.dist__eyebrow { color: var(--gold); margin-bottom: 22px; letter-spacing: 0.24em; }
.dist__list {
  list-style: none;
  padding: 0;
  margin: 0 auto 30px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  letter-spacing: 0.08em;
  color: #aba395;
}
.dist__list li.is-th { color: #f4efe6; font-weight: 500; }
.dist__country { color: var(--gold-soft); }
.dist__sep { margin-inline: 8px; opacity: 0.5; }
.dist__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}
.dist__socials { display: flex; align-items: center; gap: 10px; }
.socpill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #e6dfd2;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: all 0.2s;
}
.socpill:hover { border-color: var(--gold); color: var(--gold); }
.socpill--line:hover { border-color: #06c755; color: #06c755; }

.ftr__top {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.1fr;
  gap: 44px;
  padding-block: 56px 48px;
}
.ftr__brand .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.brand__mark {
  font-family: var(--font-roman);
  font-size: 16px;
  font-weight: 600;
  color: var(--gold);
  border: 1px solid var(--gold);
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.brand__word {
  font-family: var(--font-roman);
  font-size: 19px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #f4f0e8;
}
.ftr__about { max-width: 340px; font-size: 14px; line-height: 1.75; color: #a1998c; }
.ftr__col { display: flex; flex-direction: column; gap: 10px; font-size: 13.5px; }
.ftr__col h4 { margin-bottom: 6px; color: var(--gold); font-family: var(--font-sans); letter-spacing: 0.18em; }
.ftr__col a { color: #bfb7a9; transition: color 0.2s; }
.ftr__col a:hover { color: #fff; }

.ftr__bottom { border-top: 1px solid rgba(255, 255, 255, 0.08); padding-block: 20px; }
.ftr__bottom .tiny { color: #7e776a; }
.topbtn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #cfc8b9;
  padding: 7px 14px;
  border-radius: 999px;
  transition: all 0.2s;
}
.topbtn:hover { border-color: var(--gold); color: var(--gold); }

@media (max-width: 900px) {
  .ftr__top { grid-template-columns: 1fr 1fr; gap: 36px; }
  .ftr__brand { grid-column: 1 / -1; }
}
@media (max-width: 560px) {
  .ftr__top { grid-template-columns: 1fr; }
}
</style>
