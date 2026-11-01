<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { site, brands } = useSite()
const { isAuthenticated, isAdmin } = useAuth()
const cart = useCart()
const route = useRoute()

const mobileOpen = ref(false)
const searchOpen = ref(false)
const query = ref('')
const collectionsOpen = ref(false)
const scrolled = ref(false)

let collTimer: any = null

function onCollectionsEnter() {
  clearTimeout(collTimer)
  collectionsOpen.value = true
}
function onCollectionsLeave() {
  collTimer = setTimeout(() => (collectionsOpen.value = false), 150)
}

onMounted(() => {
  const onScroll = () => {
    scrolled.value = window.scrollY > 40
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
    collectionsOpen.value = false
    searchOpen.value = false
  }
)

function submitSearch() {
  const q = query.value.trim()
  mobileOpen.value = false
  searchOpen.value = false
  navigateTo(localePath({ path: '/products', query: q ? { q } : {} }))
}

// Exact 6 Olym Pianus Collections
const opCollections = computed(() => [
  {
    key: 'men',
    en: 'Men Watch',
    th: 'นาฬิกาผู้ชาย (Men Watch)',
    to: localePath({ path: '/products', query: { category: 'men-watches' } }),
    img: '/images/op/watch-990-083-blue.png'
  },
  {
    key: 'ladies',
    en: 'Ladies Watch',
    th: 'นาฬิกาผู้หญิง (Ladies Watch)',
    to: localePath({ path: '/products', query: { category: 'women-watches' } }),
    img: '/images/op/watch-990-45-lady.png'
  },
  {
    key: 'sport',
    en: 'Sport Watch',
    th: 'นาฬิกาสปอร์ต (Sport Watch)',
    to: localePath({ path: '/products', query: { category: 'sport-watches' } }),
    img: '/images/op/watch-899831-green.png'
  },
  {
    key: 'classic',
    en: 'Classic Watch',
    th: 'นาฬิกาคลาสสิก (Classic Watch)',
    to: localePath({ path: '/products', query: { category: 'classic-watches' } }),
    img: '/images/op/watch-990-083-white.png'
  },
  {
    key: 'essential',
    en: 'Essential Selection',
    th: 'Essential Selection',
    to: localePath({ path: '/products', query: { brand: 'opwatch' } }),
    img: '/images/op/watch-990-163-black.png'
  },
  {
    key: 'special',
    en: 'Special Occasion',
    th: 'Special Occasion',
    to: localePath({ path: '/products', query: { brand: 'ogival' } }),
    img: '/images/op/watch-82672-lady.png'
  }
])

const brandLinks = computed(() =>
  brands.value.map((b) => ({
    slug: b.slug,
    name: locale.value === 'en' ? b.nameEn || b.name : b.nameTh || b.name,
    movement: locale.value === 'en' ? b.movementEn || b.movement : b.movement
  }))
)

const normalizedPath = computed(() => route.path.replace(/^\/en(?=\/|$)/, '') || '/')

const hasDarkHero = computed(() => {
  const p = normalizedPath.value
  return (
    p === '/' ||
    p === '/about' ||
    p === '/news' ||
    p === '/contact' ||
    p === '/products' ||
    p.startsWith('/brands/')
  )
})
</script>

<template>
  <header class="ophdr" :class="{ 'ophdr--solid': scrolled || !hasDarkHero || mobileOpen || searchOpen }">
    <div class="ophdr__inner">
      <!-- Mobile Burger -->
      <button
        type="button"
        class="ophdr__burger"
        :aria-expanded="mobileOpen"
        aria-label="Menu"
        @click="mobileOpen = !mobileOpen"
      >
        <span /><span /><span />
      </button>

      <!-- Authentic Olym Pianus Crown-Shield + Script Logo -->
      <NuxtLink :to="localePath('/')" class="ophdr__logo">
        <OpCrest size="sm" :sublabel="(site.name || 'OPWATCH').toUpperCase()" />
      </NuxtLink>

      <!-- Exact olympianus.com Primary Navigation -->
      <nav class="ophdr__nav" aria-label="Primary">
        <NuxtLink :to="localePath('/')" class="opnav__link" :class="{ 'is-active': normalizedPath === '/' }">
          {{ locale === 'en' ? 'HOME' : t('nav.home') }}
        </NuxtLink>

        <NuxtLink :to="localePath('/about')" class="opnav__link" :class="{ 'is-active': normalizedPath === '/about' }">
          {{ t('nav.aboutUs') }}
        </NuxtLink>

        <div class="opnav__group" @mouseenter="onCollectionsEnter" @mouseleave="onCollectionsLeave">
          <NuxtLink
            :to="localePath('/products')"
            class="opnav__link"
            :class="{ 'is-active': normalizedPath.startsWith('/products') || normalizedPath.startsWith('/brands') }"
          >
            {{ locale === 'en' ? 'COLLECTIONS' : t('nav.collections') }}
            <span class="opnav__caret">▾</span>
          </NuxtLink>

          <div v-if="collectionsOpen" class="opmega" @mouseenter="onCollectionsEnter">
            <div class="opmega__cols">
              <div>
                <p class="opmega__head">COLLECTIONS</p>
                <div class="opmega__grid">
                  <NuxtLink
                    v-for="c in opCollections"
                    :key="c.key"
                    :to="c.to"
                    class="opmega__item"
                    @click="collectionsOpen = false"
                  >
                    <span class="opmega__thumb">
                      <img :src="c.img" :alt="c.en" loading="lazy" />
                    </span>
                    <span class="opmega__label">{{ locale === 'en' ? c.en : c.th }}</span>
                  </NuxtLink>
                </div>
              </div>

              <div v-if="brandLinks.length" class="opmega__houses">
                <p class="opmega__head">{{ locale === 'en' ? 'WATCH HOUSES' : t('nav.brands') }}</p>
                <NuxtLink
                  v-for="b in brandLinks"
                  :key="b.slug"
                  :to="localePath('/brands/' + b.slug)"
                  class="opmega__house"
                  @click="collectionsOpen = false"
                >
                  <span class="opmega__housename">{{ b.name }}</span>
                  <span class="opmega__housemeta">{{ b.movement }}</span>
                </NuxtLink>
                <NuxtLink :to="localePath('/products')" class="opmega__all" @click="collectionsOpen = false">
                  {{ t('common.viewAll') }} →
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <NuxtLink :to="localePath('/news')" class="opnav__link" :class="{ 'is-active': normalizedPath.startsWith('/news') }">
          {{ locale === 'en' ? 'NEWS' : t('nav.news') }}
        </NuxtLink>

        <NuxtLink :to="localePath('/contact')" class="opnav__link" :class="{ 'is-active': normalizedPath === '/contact' }">
          {{ locale === 'en' ? 'CONTACT US' : t('nav.contactUs') }}
        </NuxtLink>
      </nav>

      <!-- E-Commerce Utility Icons -->
      <div class="ophdr__tools">
        <button type="button" class="optool" :aria-label="t('common.search')" @click="searchOpen = !searchOpen">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.4-3.4" />
          </svg>
        </button>

        <NuxtLink v-if="isAdmin" :to="localePath('/office')" class="optool optool--office">
          OFFICE
        </NuxtLink>

        <NuxtLink
          :to="localePath(isAuthenticated ? '/account' : '/account/login')"
          class="optool optool--account"
          :aria-label="isAuthenticated ? t('nav.account') : t('nav.login')"
          :title="isAuthenticated ? t('nav.account') : t('nav.login')"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="8" r="3.8" />
            <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
          </svg>
        </NuxtLink>

        <button
          type="button"
          class="optool optool--cart"
          :aria-label="t('nav.cart')"
          @click="cart.drawerOpen.value = true"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 7h12l1 13H5L6 7Z" />
            <path d="M9 7V5a3 3 0 0 1 6 0v2" />
          </svg>
          <span v-if="cart.count.value > 0" class="optool__badge">{{ cart.count.value }}</span>
        </button>

        <LocaleSwitch />
      </div>
    </div>

    <!-- Sleek Dark Search Drawer -->
    <div v-if="searchOpen" class="opsearch">
      <div class="container opsearch__inner">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.4-3.4" />
        </svg>
        <input
          v-model="query"
          class="opsearch__input"
          type="search"
          :placeholder="t('products.searchPlaceholder')"
          @keyup.enter="submitSearch"
        />
        <button type="button" class="btn btn--sm btn--gold" @click="submitSearch">{{ t('common.search') }}</button>
        <button type="button" class="opsearch__close" aria-label="Close" @click="searchOpen = false">✕</button>
      </div>
    </div>

    <!-- Mobile Dark Navigation Drawer -->
    <div v-if="mobileOpen" class="opmobile">
      <div class="opmobile__inner">
        <NuxtLink :to="localePath('/')" class="opmobile__link">{{ locale === 'en' ? 'HOME' : t('nav.home') }}</NuxtLink>
        <NuxtLink :to="localePath('/about')" class="opmobile__link">{{ t('nav.aboutUs') }}</NuxtLink>
        <NuxtLink :to="localePath('/products')" class="opmobile__link">{{ locale === 'en' ? 'COLLECTIONS' : t('nav.collections') }}</NuxtLink>

        <div class="opmobile__sub">
          <NuxtLink v-for="c in opCollections" :key="c.key" :to="c.to" class="opmobile__sublink">
            {{ locale === 'en' ? c.en : c.th }}
          </NuxtLink>
        </div>

        <div v-if="brandLinks.length" class="opmobile__sub">
          <NuxtLink v-for="b in brandLinks" :key="b.slug" :to="localePath('/brands/' + b.slug)" class="opmobile__sublink">
            {{ b.name }} — {{ b.movement }}
          </NuxtLink>
        </div>

        <NuxtLink :to="localePath('/news')" class="opmobile__link">{{ locale === 'en' ? 'NEWS' : t('nav.news') }}</NuxtLink>
        <NuxtLink :to="localePath('/contact')" class="opmobile__link">{{ locale === 'en' ? 'CONTACT US' : t('nav.contactUs') }}</NuxtLink>
        <NuxtLink :to="localePath('/cart')" class="opmobile__link">{{ t('nav.cart') }} ({{ cart.count.value }})</NuxtLink>
        <NuxtLink :to="localePath(isAuthenticated ? '/account' : '/account/login')" class="opmobile__link">
          {{ isAuthenticated ? t('nav.account') : t('nav.login') }}
        </NuxtLink>
        <NuxtLink v-if="isAdmin" :to="localePath('/office')" class="opmobile__link" style="color: var(--gold)">
          {{ t('nav.office') }} (/office)
        </NuxtLink>
      </div>
    </div>
  </header>

  <!-- Spacer for pages without a dark hero banner -->
  <div v-if="!hasDarkHero" class="ophdr-spacer" />
</template>

<style scoped>
.ophdr {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 80;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.25) 68%, rgba(0, 0, 0, 0) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: background 0.35s var(--ease), border-color 0.35s var(--ease), backdrop-filter 0.35s var(--ease);
}
.ophdr--solid {
  background: rgba(8, 8, 8, 0.95);
  backdrop-filter: saturate(160%) blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
.ophdr-spacer {
  height: var(--header-h);
  background: #080808;
}

.ophdr__inner {
  max-width: 1380px;
  margin-inline: auto;
  padding-inline: 36px;
  height: var(--header-h);
  display: flex;
  align-items: center;
  gap: 28px;
}

.ophdr__burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: transparent;
  border: 0;
  padding: 6px;
}
.ophdr__burger span {
  display: block;
  width: 20px;
  height: 1.4px;
  background: #ffffff;
}

.ophdr__logo {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.ophdr__nav {
  display: flex;
  align-items: center;
  gap: 34px;
  margin-left: auto;
  margin-right: 18px;
}

.opnav__group {
  position: relative;
}

.opnav__link {
  font-family: var(--font-geo);
  font-size: 11.5px;
  font-weight: 400;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.84);
  padding: 10px 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  position: relative;
  transition: color 0.22s;
}
.opnav__link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 3px;
  height: 1px;
  background: var(--gold);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.28s var(--ease);
}
.opnav__link:hover,
.opnav__link.is-active {
  color: #ffffff;
}
.opnav__link:hover::after,
.opnav__link.is-active::after {
  transform: scaleX(1);
}
.opnav__caret {
  font-size: 9px;
  opacity: 0.65;
}

/* Dark Collections Mega Menu */
.opmega {
  position: absolute;
  top: calc(100% + 10px);
  left: -140px;
  width: 640px;
  background: #0d0d0d;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.65);
  padding: 28px 30px;
}
.opmega__cols {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 28px;
}
.opmega__head {
  font-family: var(--font-geo);
  font-size: 10px;
  letter-spacing: 0.28em;
  color: var(--gold);
  margin-bottom: 16px;
}
.opmega__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.opmega__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  transition: background 0.2s;
}
.opmega__item:hover {
  background: rgba(255, 255, 255, 0.06);
}
.opmega__thumb {
  width: 44px;
  height: 44px;
  background: #ffffff;
  padding: 4px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.opmega__thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.opmega__label {
  font-size: 12.5px;
  color: #eaeaea;
  letter-spacing: 0.05em;
}
.opmega__houses {
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  padding-left: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.opmega__house {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 7px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.opmega__house:hover .opmega__housename {
  color: var(--gold);
}
.opmega__housename {
  font-family: var(--font-geo);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #ffffff;
}
.opmega__housemeta {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}
.opmega__all {
  margin-top: auto;
  padding-top: 8px;
  font-size: 10.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--gold);
}

/* Right Utility Tools */
.ophdr__tools {
  display: flex;
  align-items: center;
  gap: 8px;
}
.optool {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 0;
  color: rgba(255, 255, 255, 0.85);
  position: relative;
  transition: color 0.2s;
}
.optool:hover {
  color: var(--gold);
}
.optool--office {
  width: auto;
  height: 26px;
  padding-inline: 10px;
  font-family: var(--font-geo);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--gold);
  border: 1px solid rgba(197, 164, 109, 0.55);
}
.optool__badge {
  position: absolute;
  top: 2px;
  right: 1px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--gold);
  color: #080808;
  font-family: var(--font-geo);
  font-size: 9.5px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
}

/* Search Overlay */
.opsearch {
  background: #0c0c0c;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
}
.opsearch__inner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-block: 16px;
  color: rgba(255, 255, 255, 0.65);
}
.opsearch__input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: 0;
  color: #ffffff;
  font-family: var(--font-sans);
  font-size: 15px;
}
.opsearch__input::placeholder {
  color: rgba(255, 255, 255, 0.42);
}
.opsearch__close {
  background: transparent;
  border: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  padding: 6px;
}

/* Mobile Menu */
.opmobile {
  background: #0a0a0a;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  max-height: calc(100vh - var(--header-h));
  overflow-y: auto;
}
.opmobile__inner {
  padding: 18px 24px 36px;
  display: flex;
  flex-direction: column;
}
.opmobile__link {
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-family: var(--font-geo);
  font-size: 12.5px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #ffffff;
}
.opmobile__sub {
  display: flex;
  flex-direction: column;
  padding: 8px 0 8px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.opmobile__sublink {
  padding: 8px 0;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.68);
}

@media (max-width: 1120px) {
  .ophdr__inner { padding-inline: 22px; gap: 18px; }
  .ophdr__nav { gap: 22px; }
  .opmega { left: -200px; width: 560px; }
}
@media (max-width: 960px) {
  .ophdr__nav { display: none; }
  .ophdr__burger { display: inline-flex; }
  .ophdr__tools { margin-left: auto; }
  .optool--office { display: none; }
}
</style>
