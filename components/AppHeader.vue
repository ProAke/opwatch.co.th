<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { count: cartCount, drawerOpen } = useCart()
const { customer, isAuthenticated } = useAuth()
const router = useRouter()
const route = useRoute()

const mobileOpen = ref(false)
const mobileServicesOpen = ref(true)
const collectionsOpen = ref(false)
const servicesOpen = ref(false)
const searchOpen = ref(false)
const searchQuery = ref('')
const scrolled = ref(false)

if (import.meta.client) {
  const onScroll = () => { scrolled.value = window.scrollY > 40 }
  onMounted(() => {
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
  })
  onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
}

const isHeroPage = computed(() => {
  const p = route.path.replace(/^\/en(\/|$)/, '/').replace(/\/+$/, '') || '/'
  return p === '/' || p === '/about' || p === '/news' || p === '/contact' || p === '/products' || p.startsWith('/brands/')
})

const isServicesRoute = computed(() => {
  const p = route.path.replace(/^\/en(\/|$)/, '/').replace(/\/+$/, '') || '/'
  return p === '/services' || p === '/branches' || p === '/warranty' || p === '/track'
})

/* When scrolled or on inner white pages, header uses olympianus.com #ffffff header_color */
const isLightBar = computed(() => scrolled.value || !isHeroPage.value || collectionsOpen.value || servicesOpen.value || searchOpen.value)

function submitSearch() {
  const q = searchQuery.value.trim()
  searchOpen.value = false
  mobileOpen.value = false
  collectionsOpen.value = false
  servicesOpen.value = false
  router.push({ path: localePath('/products'), query: q ? { q } : {} })
}

const serviceSubItems = computed(() => [
  {
    key: 'services-branches',
    to: '/services',
    title: locale.value === 'th' ? 'Services & Branches · สิทธิพิเศษ & สาขา' : 'Services & Branches',
    desc: locale.value === 'th' ? 'ศูนย์บริการมาตรฐาน & เคาน์เตอร์สาขาทั่วประเทศไทย' : 'Authorized Service Centers & Boutiques Across Thailand'
  },
  {
    key: 'warranty-repair',
    to: '/warranty',
    title: locale.value === 'th' ? 'Warranty & Repair · แจ้งซ่อม & รับประกัน' : 'Warranty & Repair',
    desc: locale.value === 'th' ? 'ลงทะเบียน E-Warranty ออนไลน์ & ติดตามสถานะงานซ่อม' : 'Online E-Warranty Registration & Watch Repair Tracking'
  },
  {
    key: 'track-order',
    to: '/track',
    title: locale.value === 'th' ? 'Track Order · ติดตามคำสั่งซื้อ' : 'Track Order',
    desc: locale.value === 'th' ? 'เช็คสถานะคำสั่งซื้อ & หมายเลขพัสดุจัดส่งแบบเรียลไทม์' : 'Real-Time Order Confirmation & Courier Tracking'
  }
])

const opCollections = computed(() => [
  { label: locale.value === 'th' ? 'Men Watch · นาฬิกาผู้ชาย' : 'Men Watch', query: { category: 'men-watches' } },
  { label: locale.value === 'th' ? 'Ladies Watch · นาฬิกาผู้หญิง' : 'Ladies Watch', query: { category: 'women-watches' } },
  { label: locale.value === 'th' ? 'Sport Watch · สปอร์ต & ไดเวอร์' : 'Sport Watch', query: { category: 'sport-watches' } },
  { label: locale.value === 'th' ? 'Classic Watch · คลาสสิกเดรส' : 'Classic Watch', query: { category: 'classic-watches' } },
  { label: locale.value === 'th' ? 'Couple Watch · นาฬิกาคู่รัก' : 'Couple Watch', query: { category: 'couple-watches' } },
  { label: locale.value === 'th' ? 'Jewelry Watch · นาฬิกาจิวเวลรี่เพชร' : 'Jewelry Watch', query: { category: 'women-jewelry' } }
])

const brandHouses = computed(() => [
  { slug: 'olympianus', name: 'Olym Pianus', logo: '/images/logos/olym-pianus.jpg', tag: locale.value === 'th' ? 'เครื่องญี่ปุ่น · กระจกแซฟไฟร์' : 'Japanese Movement · Sapphire' },
  { slug: 'olympia-star', name: 'Olympia Star', logo: '/images/logos/olympia-star.jpg', tag: locale.value === 'th' ? 'เครื่องสวิส · กระจกแซฟไฟร์' : 'Swiss Movement · Sapphire' },
  { slug: 'ogival', name: 'Ogival', logo: '/images/logos/ogival.jpg', tag: locale.value === 'th' ? 'สวิสลักชัวรีตั้งแต่ปี 1903' : 'Swiss Luxury Since 1903' }
])

watch(() => route.fullPath, () => {
  mobileOpen.value = false
  collectionsOpen.value = false
  servicesOpen.value = false
  searchOpen.value = false
})
</script>

<template>
  <header
    class="op-hdr"
    :class="{
      'is-transparent': !isLightBar,
      'is-light': isLightBar
    }"
    @mouseleave="collectionsOpen = false; servicesOpen = false"
  >
    <div class="container op-hdr__row">
      <!-- Left: Authentic Olym Pianus Crown Shield + Script Logo -->
      <NuxtLink :to="localePath('/')" class="op-hdr__logo" aria-label="Olym Pianus · Opwatch Home">
        <OpCrest size="sm" :theme="isLightBar ? 'light' : 'dark'" sublabel="OPWATCH BOUTIQUE" />
      </NuxtLink>

      <!-- Center: Exact olympianus.com Navigation Structure -->
      <nav class="op-hdr__nav" aria-label="Primary">
        <NuxtLink
          :to="localePath('/about')"
          class="op-hdr__link"
          @mouseenter="collectionsOpen = false; servicesOpen = false"
        >
          {{ locale === 'th' ? 'About' : 'About' }}
        </NuxtLink>

        <div
          class="op-hdr__dropdown-wrap"
          @mouseenter="collectionsOpen = true; servicesOpen = false"
        >
          <NuxtLink
            :to="localePath('/products')"
            class="op-hdr__link op-hdr__link--has-sub"
            :class="{ 'router-link-active': route.path.includes('/products') || route.path.includes('/brands/') }"
          >
            {{ locale === 'th' ? 'Collections' : 'Collections' }}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </NuxtLink>
        </div>

        <NuxtLink
          :to="localePath('/promotions')"
          class="op-hdr__link op-hdr__link--promo"
          @mouseenter="collectionsOpen = false; servicesOpen = false"
        >
          {{ locale === 'th' ? 'โปรโมชั่น' : 'Promotions' }}
        </NuxtLink>

        <!-- Services Sub-Menu: Services & Branches · Warranty & Repair · Track Order -->
        <div
          class="op-hdr__dropdown-wrap op-hdr__dropdown-wrap--services"
          @mouseenter="servicesOpen = true; collectionsOpen = false"
          @mouseleave="servicesOpen = false"
        >
          <NuxtLink
            :to="localePath('/services')"
            class="op-hdr__link op-hdr__link--has-sub"
            :class="{ 'router-link-active': isServicesRoute || servicesOpen }"
            :aria-expanded="servicesOpen"
          >
            {{ locale === 'th' ? 'Services' : 'Services' }}
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="op-hdr__chev"
              :class="{ 'is-open': servicesOpen }"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </NuxtLink>

          <Transition name="fade-drop">
            <div
              v-if="servicesOpen"
              class="op-svc-dropdown"
              role="menu"
              aria-label="Services Sub-Menu"
            >
              <p class="op-svc-dropdown__eyebrow">
                {{ locale === 'th' ? 'OPWATCH SERVICES · บริการหลังการขาย' : 'AUTHORIZED CLIENT SERVICES' }}
              </p>
              <NuxtLink
                v-for="item in serviceSubItems"
                :key="item.key"
                :to="localePath(item.to)"
                class="op-svc-dropdown__item"
                role="menuitem"
                @click="servicesOpen = false"
              >
                <div class="op-svc-dropdown__text">
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.desc }}</span>
                </div>
                <span class="op-svc-dropdown__arrow">→</span>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <NuxtLink
          :to="localePath('/reviews')"
          class="op-hdr__link"
          :class="{ 'router-link-active': route.path.includes('/reviews') }"
          @mouseenter="collectionsOpen = false; servicesOpen = false"
        >
          {{ locale === 'th' ? 'บทความ-รีวิวสินค้า' : 'Reviews' }}
        </NuxtLink>

        <NuxtLink
          :to="localePath('/news')"
          class="op-hdr__link"
          @mouseenter="collectionsOpen = false; servicesOpen = false"
        >
          News
        </NuxtLink>

        <NuxtLink
          :to="localePath('/contact')"
          class="op-hdr__link"
          @mouseenter="collectionsOpen = false; servicesOpen = false"
        >
          {{ locale === 'th' ? 'Contact' : 'Contact' }}
        </NuxtLink>
      </nav>

      <!-- Right: Search + Locale + Account + Shopping Bag -->
      <div class="op-hdr__actions">
        <button
          type="button"
          class="op-hdr__icon"
          :aria-label="t('common.search')"
          @click="searchOpen = !searchOpen"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="11" cy="11" r="7.5" />
            <path d="m20 20-3.6-3.6" stroke-linecap="round" />
          </svg>
        </button>

        <LocaleSwitch :light-surface="isLightBar" class="hide-xs" />

        <NuxtLink
          :to="localePath(isAuthenticated ? '/account' : '/account/login')"
          class="op-hdr__icon hide-xs"
          :title="isAuthenticated ? customer?.name : t('nav.login')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="12" cy="8" r="4" />
            <path d="M4.5 20.5c1.8-3.8 4.4-5.5 7.5-5.5s5.7 1.7 7.5 5.5" stroke-linecap="round" />
          </svg>
        </NuxtLink>

        <button
          type="button"
          class="op-hdr__icon op-hdr__cart"
          :aria-label="t('nav.cart')"
          @click="drawerOpen = true"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M5 8h14l-1.2 12.5H6.2L5 8Z" stroke-linejoin="round" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke-linecap="round" />
          </svg>
          <span v-if="cartCount > 0" class="op-hdr__badge">{{ cartCount }}</span>
        </button>

        <button
          type="button"
          class="op-hdr__burger"
          aria-label="Menu"
          @click="mobileOpen = !mobileOpen"
        >
          <span /><span /><span />
        </button>
      </div>
    </div>

    <!-- Collections Mega-Menu (olympianus.com Pure White #ffffff + #ebebf1 + Royal Sapphire #1d2088) -->
    <Transition name="fade-drop">
      <div v-if="collectionsOpen" class="op-mega" @mouseenter="collectionsOpen = true" @mouseleave="collectionsOpen = false">
        <div class="container op-mega__grid">
          <div>
            <p class="op-mega__eyebrow">{{ locale === 'th' ? '6 คอลเลกชันต้นฉบับ OLYM PIANUS' : 'OLYM PIANUS COLLECTIONS' }}</p>
            <div class="op-mega__links">
              <NuxtLink
                v-for="c in opCollections"
                :key="c.label"
                :to="{ path: localePath('/products'), query: c.query }"
                class="op-mega__item"
              >
                <span>{{ c.label }}</span>
                <span class="op-mega__arrow">→</span>
              </NuxtLink>
            </div>
          </div>

          <div class="op-mega__brands">
            <p class="op-mega__eyebrow">{{ locale === 'th' ? '3 แบรนด์สินค้าทางการ' : '3 OFFICIAL WATCH BRANDS' }}</p>
            <NuxtLink
              v-for="b in brandHouses"
              :key="b.slug"
              :to="localePath(`/brands/${b.slug}`)"
              class="op-mega__brand"
            >
              <img :src="b.logo" :alt="b.name" class="op-mega__brand-logo" loading="lazy" />
              <div class="op-mega__brand-meta">
                <strong>{{ b.name }}</strong>
                <span>{{ b.tag }}</span>
              </div>
            </NuxtLink>
            <NuxtLink :to="localePath('/products')" class="op-mega__all">
              {{ locale === 'th' ? 'ดูเรือนเวลาทั้งหมดในบูติก →' : 'View Full Boutique Catalogue →' }}
            </NuxtLink>
          </div>

          <NuxtLink :to="{ path: localePath('/products'), query: { sort: 'featured' } }" class="op-mega__visual">
            <img src="/images/op/hero-diver-dark.jpg" alt="Olym Pianus Collection" />
            <div class="op-mega__visual-cap">
              <span>RECOMMEND</span>
              <strong>899832AGS · Master Diver</strong>
            </div>
          </NuxtLink>
        </div>
      </div>
    </Transition>

    <!-- Search Bar -->
    <Transition name="fade-drop">
      <div v-if="searchOpen" class="op-search">
        <form class="container op-search__form" @submit.prevent="submitSearch">
          <input
            v-model="searchQuery"
            type="search"
            class="op-search__input"
            :placeholder="locale === 'th' ? 'ค้นหารุ่นนาฬิกา รหัสสินค้า หรือแบรนด์...' : 'Search model reference, brand, or collection...'"
            autofocus
          />
          <button type="submit" class="btn btn--sm">{{ t('common.search') }}</button>
          <button type="button" class="op-search__close" aria-label="Close" @click="searchOpen = false">✕</button>
        </form>
      </div>
    </Transition>

    <!-- Mobile Navigation Drawer -->
    <Transition name="fade-drop">
      <div v-if="mobileOpen" class="op-mobile">
        <div class="container stack gap-20">
          <div class="op-mobile__links">
            <NuxtLink :to="localePath('/about')">About</NuxtLink>
            <NuxtLink :to="localePath('/products')">Collections (All Watches)</NuxtLink>
            <NuxtLink
              v-for="c in opCollections"
              :key="c.label"
              :to="{ path: localePath('/products'), query: c.query }"
              class="op-mobile__sub"
            >
              — {{ c.label }}
            </NuxtLink>
            <NuxtLink v-for="b in brandHouses" :key="b.slug" :to="localePath(`/brands/${b.slug}`)" class="op-mobile__sub">
              ✦ {{ b.name }} ({{ b.tag }})
            </NuxtLink>
            <NuxtLink :to="localePath('/promotions')">{{ locale === 'th' ? 'โปรโมชั่น & คูปองส่วนลด' : 'Promotions & Vouchers' }}</NuxtLink>

            <!-- Mobile Services Collapsible Sub-Menu -->
            <button
              type="button"
              class="op-mobile__group-btn"
              :aria-expanded="mobileServicesOpen"
              @click="mobileServicesOpen = !mobileServicesOpen"
            >
              <span>Services</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                :class="{ 'is-open': mobileServicesOpen }"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <template v-if="mobileServicesOpen">
              <NuxtLink
                v-for="item in serviceSubItems"
                :key="item.key"
                :to="localePath(item.to)"
                class="op-mobile__sub"
              >
                — {{ item.title }}
              </NuxtLink>
            </template>

            <NuxtLink :to="localePath('/reviews')">
              {{ locale === 'th' ? 'บทความ - รีวิวสินค้า' : 'Articles & Watch Reviews' }}
            </NuxtLink>
            <NuxtLink :to="localePath('/news')">News</NuxtLink>
            <NuxtLink :to="localePath('/contact')">Contact</NuxtLink>
            <NuxtLink :to="localePath(isAuthenticated ? '/account' : '/account/login')">
              {{ isAuthenticated ? customer?.name : t('nav.login') }}
            </NuxtLink>
          </div>
          <div class="between pt-12">
            <LocaleSwitch :light-surface="true" />
            <NuxtLink :to="localePath('/office')" class="tiny muted">{{ t('nav.office') }}</NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.op-hdr {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  transition: background 0.35s var(--ease), border-color 0.35s var(--ease), box-shadow 0.35s var(--ease), color 0.3s var(--ease);
}

/* Over Hero Banner (olympianus.com av_header_transparency): crisp white text on transparent glass */
.op-hdr.is-transparent {
  background: linear-gradient(180deg, rgba(16, 18, 42, 0.56) 0%, rgba(16, 18, 42, 0.16) 68%, rgba(16, 18, 42, 0) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

/* Sticky / Scrolled / Inner Page Header (exact olympianus.com #ffffff header_color) */
.op-hdr.is-light {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--sand);
  box-shadow: 0 6px 28px rgba(25, 26, 53, 0.06);
  color: var(--ink);
}

.op-hdr__row {
  height: var(--header-h);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 32px;
}
.op-hdr__logo {
  display: inline-flex;
  align-items: center;
}
.op-hdr__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(22px, 2.6vw, 40px);
}
.op-hdr__dropdown-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.op-hdr__chev {
  transition: transform 0.22s ease;
}
.op-hdr__chev.is-open {
  transform: rotate(180deg);
}

/* Services Sub-Menu Dropdown */
.op-svc-dropdown {
  position: absolute;
  top: calc(100% + 14px);
  left: -24px;
  width: 360px;
  background: #ffffff;
  border: 1px solid var(--line-strong);
  border-top: 2.5px solid var(--sapphire);
  padding: 18px 20px 14px;
  box-shadow: var(--shadow-lg);
  z-index: 60;
  color: var(--ink);
}
.op-svc-dropdown::before {
  content: '';
  position: absolute;
  top: -18px;
  left: 0;
  right: 0;
  height: 18px;
}
.op-svc-dropdown__eyebrow {
  font-family: var(--font-roman);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--sapphire);
  margin: 0 0 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--sand);
}
.op-svc-dropdown__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 10px;
  border-bottom: 1px solid var(--sand);
  transition: background 0.2s, padding-left 0.2s;
}
.op-svc-dropdown__item:last-child {
  border-bottom: 0;
}
.op-svc-dropdown__item:hover {
  background: #f5f7fd;
  padding-left: 14px;
}
.op-svc-dropdown__text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.op-svc-dropdown__text strong {
  font-family: var(--font-sans);
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: 0.02em;
}
.op-svc-dropdown__item:hover .op-svc-dropdown__text strong {
  color: var(--sapphire);
}
.op-svc-dropdown__text span {
  font-size: 11.5px;
  color: var(--ink-muted);
  line-height: 1.4;
}
.op-svc-dropdown__arrow {
  font-size: 13px;
  color: var(--sapphire);
  opacity: 0.7;
  flex: none;
}
.op-hdr__link {
  font-family: var(--font-roman);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding-block: 10px;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.25s;
}
.op-hdr.is-transparent .op-hdr__link {
  color: rgba(255, 255, 255, 0.92);
}
.op-hdr.is-transparent .op-hdr__link:hover,
.op-hdr.is-transparent .op-hdr__link.router-link-active {
  color: #ffffff;
}
.op-hdr.is-light .op-hdr__link {
  color: var(--ink-soft);
}
.op-hdr.is-light .op-hdr__link:hover {
  color: var(--sapphire-bright);
}
.op-hdr.is-light .op-hdr__link.router-link-active {
  color: var(--sapphire);
}

.op-hdr__link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 3px;
  height: 1.5px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s var(--ease);
}
.op-hdr.is-light .op-hdr__link::after {
  background: var(--sapphire);
}
.op-hdr__link:hover::after,
.op-hdr__link.router-link-active::after {
  transform: scaleX(1);
}

.op-hdr__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.op-hdr__icon {
  position: relative;
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 0;
  transition: color 0.2s, opacity 0.2s;
}
.op-hdr.is-transparent .op-hdr__icon { color: #ffffff; }
.op-hdr.is-light .op-hdr__icon { color: var(--ink); }
.op-hdr.is-light .op-hdr__icon:hover { color: var(--sapphire); }

.op-hdr__badge {
  position: absolute;
  top: 3px;
  right: 2px;
  min-width: 17px;
  height: 17px;
  padding-inline: 4px;
  border-radius: 999px;
  background: var(--sapphire);
  color: #ffffff;
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.op-hdr.is-transparent .op-hdr__badge {
  background: #ffffff;
  color: var(--sapphire);
}

.op-hdr__burger {
  display: none;
  width: 38px;
  height: 38px;
  background: transparent;
  border: 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
}
.op-hdr__burger span {
  width: 21px;
  height: 1.5px;
  background: currentColor;
}

/* Mega Dropdown (#ffffff luxury boutique surface) */
.op-mega {
  background: #ffffff;
  border-top: 1px solid var(--sand);
  border-bottom: 1px solid var(--line-strong);
  color: var(--ink);
  padding-block: 38px;
  box-shadow: var(--shadow-lg);
}
.op-mega__grid {
  display: grid;
  grid-template-columns: 1.25fr 1fr 0.95fr;
  gap: 44px;
  align-items: start;
}
.op-mega__eyebrow {
  font-family: var(--font-roman);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--sapphire);
  margin-bottom: 16px;
}
.op-mega__links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 26px;
}
.op-mega__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 0;
  border-bottom: 1px solid var(--sand);
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 500;
  color: var(--ink);
  transition: color 0.2s, padding-left 0.2s, border-color 0.2s;
}
.op-mega__item:hover {
  color: var(--sapphire);
  border-bottom-color: var(--sapphire);
  padding-left: 6px;
}
.op-mega__arrow { font-size: 13px; color: var(--sapphire); opacity: 0.65; }
.op-mega__brands {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.op-mega__brand {
  padding: 9px 14px;
  background: #ffffff;
  border: 1px solid var(--sand);
  display: flex;
  align-items: center;
  gap: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.op-mega__brand:hover {
  border-color: var(--sapphire);
  box-shadow: 0 6px 16px rgba(29, 32, 136, 0.08);
}
.op-mega__brand-logo {
  width: 56px;
  height: 44px;
  object-fit: contain;
  background: #ffffff;
  flex: none;
}
.op-mega__brand-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.op-mega__brand strong {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--ink);
}
.op-mega__brand span {
  font-size: 11.5px;
  color: var(--sapphire-soft);
}
.op-mega__all {
  margin-top: 6px;
  font-family: var(--font-roman);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--sapphire);
}
.op-mega__visual {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  border: 1px solid var(--line-strong);
}
.op-mega__visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--ease);
}
.op-mega__visual:hover img { transform: scale(1.05); }
.op-mega__visual-cap {
  position: absolute;
  inset: auto 0 0 0;
  padding: 16px 18px;
  background: linear-gradient(transparent, rgba(25, 26, 53, 0.88));
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.op-mega__visual-cap span {
  font-family: var(--font-roman);
  font-size: 9.5px;
  letter-spacing: 0.26em;
  color: var(--champagne-soft);
}
.op-mega__visual-cap strong {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
}

/* Search Bar */
.op-search {
  background: #ffffff;
  border-top: 1px solid var(--sand);
  border-bottom: 1px solid var(--line-strong);
  padding-block: 18px;
  box-shadow: var(--shadow);
}
.op-search__form {
  display: flex;
  align-items: center;
  gap: 14px;
}
.op-search__input {
  flex: 1;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--line-strong);
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 19px;
  padding: 10px 4px;
  outline: none;
}
.op-search__input:focus { border-bottom-color: var(--sapphire); }
.op-search__input::placeholder { color: var(--ink-faint); }
.op-search__close {
  background: transparent;
  border: 0;
  color: var(--ink-muted);
  font-size: 18px;
  padding: 6px 10px;
}

/* Mobile Menu */
.op-mobile {
  background: #ffffff;
  border-top: 1px solid var(--sand);
  border-bottom: 1px solid var(--line-strong);
  padding-block: 24px 32px;
  max-height: calc(100vh - var(--header-h));
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}
.op-mobile__links {
  display: flex;
  flex-direction: column;
}
.op-mobile__links a {
  padding: 12px 0;
  border-bottom: 1px solid var(--sand);
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 17px;
  letter-spacing: 0.08em;
}
.op-mobile__group-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--sand);
  padding: 12px 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 17px;
  letter-spacing: 0.08em;
  text-align: left;
  cursor: pointer;
}
.op-mobile__group-btn svg {
  transition: transform 0.2s ease;
  color: var(--sapphire);
}
.op-mobile__group-btn svg.is-open {
  transform: rotate(180deg);
}
.op-mobile__links a.op-mobile__sub {
  padding-left: 14px;
  font-family: var(--font-sans);
  font-size: 13.5px;
  color: var(--ink-soft);
  letter-spacing: 0.03em;
}
.pt-12 { padding-top: 12px; }

.fade-drop-enter-active, .fade-drop-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.fade-drop-enter-from, .fade-drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 980px) {
  .op-hdr__row { grid-template-columns: 1fr auto; }
  .op-hdr__nav { display: none; }
  .op-hdr__burger { display: inline-flex; }
  .hide-xs { display: none !important; }
}
</style>
