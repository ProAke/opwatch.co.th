<script setup lang="ts">
defineProps<{ navItems: { key: string; label: string; to: string }[] }>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { site, categories, brands } = useSite()
const { isAuthenticated, isAdmin } = useAuth()
const cart = useCart()
const route = useRoute()

const mobileOpen = ref(false)
const searchOpen = ref(false)
const query = ref('')
const collectionsOpen = ref(false)
const brandsOpen = ref(false)
const scrolled = ref(false)

let collTimer: any = null
let brandTimer: any = null

function onCollectionsEnter() {
  clearTimeout(collTimer)
  collectionsOpen.value = true
}
function onCollectionsLeave() {
  collTimer = setTimeout(() => (collectionsOpen.value = false), 140)
}
function onBrandsEnter() {
  clearTimeout(brandTimer)
  brandsOpen.value = true
}
function onBrandsLeave() {
  brandTimer = setTimeout(() => (brandsOpen.value = false), 140)
}

onMounted(() => {
  const onScroll = () => {
    scrolled.value = window.scrollY > 36
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})

function submitSearch() {
  const q = query.value.trim()
  mobileOpen.value = false
  searchOpen.value = false
  navigateTo(localePath({ path: '/products', query: q ? { q } : {} }))
}

const categoryLinks = computed(() =>
  categories.value
    .filter((c) => c.slug !== 'watches-jewelry')
    .slice(0, 6)
    .map((c) => ({
      slug: c.slug,
      name: locale.value === 'en' ? c.nameEn || c.name : c.nameTh || c.name,
      image: c.image || '/images/p1.jpg'
    }))
)

const brandLinks = computed(() =>
  brands.value.map((b) => ({
    slug: b.slug,
    name: locale.value === 'en' ? b.nameEn || b.name : b.nameTh || b.name,
    movement: locale.value === 'en' ? b.movementEn || b.movement : b.movement
  }))
)

const isHome = computed(() => route.path === '/' || route.path === '/en')
</script>

<template>
  <header class="hdr" :class="{ 'hdr--scrolled': scrolled || !isHome }">
    <div v-if="site.announcement" class="announce">
      <div class="container announce__inner">
        <span class="tiny upper">{{ site.announcement }}</span>
      </div>
    </div>

    <div class="hdr__inner">
      <div class="hdr__left">
        <button class="hdr__burger" :aria-expanded="mobileOpen" aria-label="Menu" @click="mobileOpen = !mobileOpen">
          <span /><span /><span />
        </button>

        <NuxtLink :to="localePath('/')" class="brand" @click="mobileOpen = false">
          <span class="brand__crest" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
              <circle cx="12" cy="12" r="9.5" />
              <path d="M12 6.5v5.5l3.5 2" />
              <path d="M9 2.5h6" />
            </svg>
          </span>
          <span class="brand__text">
            <span class="brand__word">{{ site.name || 'OPWATCH' }}</span>
            <span class="brand__sub">OFFICIAL BOUTIQUE</span>
          </span>
        </NuxtLink>
      </div>

      <nav class="hdr__nav" aria-label="Primary">
        <NuxtLink :to="localePath('/')" class="navlink">{{ t('nav.home') }}</NuxtLink>

        <!-- Collections Mega Dropdown -->
        <div class="navgroup" @mouseenter="onCollectionsEnter" @mouseleave="onCollectionsLeave">
          <NuxtLink :to="localePath('/products')" class="navlink">
            {{ t('nav.collections') }}
            <span class="navcaret">▾</span>
          </NuxtLink>
          <div v-if="collectionsOpen" class="mega" @mouseenter="onCollectionsEnter">
            <div class="mega__cols">
              <div>
                <p class="mega__label tiny upper">{{ t('nav.collections') }}</p>
                <div class="mega__grid">
                  <NuxtLink
                    v-for="c in categoryLinks"
                    :key="c.slug"
                    :to="localePath({ path: '/products', query: { category: c.slug } })"
                    class="mega__item"
                    @click="collectionsOpen = false"
                  >
                    <span class="mega__img"><img :src="c.image" :alt="c.name" loading="lazy" /></span>
                    <span class="mega__name">{{ c.name }}</span>
                  </NuxtLink>
                </div>
              </div>
              <div v-if="brandLinks.length" class="mega__brands">
                <p class="mega__label tiny upper">{{ t('nav.brands') }}</p>
                <NuxtLink
                  v-for="b in brandLinks"
                  :key="b.slug"
                  :to="localePath('/brands/' + b.slug)"
                  class="mega__brandlink"
                  @click="collectionsOpen = false"
                >
                  <span class="roman" style="font-size: 12px">{{ b.name }}</span>
                  <span class="tiny faint">{{ b.movement }}</span>
                </NuxtLink>
              </div>
            </div>
            <div class="mega__foot">
              <NuxtLink :to="localePath('/products')" class="mega__all" @click="collectionsOpen = false">
                {{ t('common.viewAll') }} →
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Brands Dropdown -->
        <div v-if="brandLinks.length" class="navgroup" @mouseenter="onBrandsEnter" @mouseleave="onBrandsLeave">
          <button type="button" class="navlink navlink--btn">
            {{ t('nav.brands') }}
            <span class="navcaret">▾</span>
          </button>
          <div v-if="brandsOpen" class="dropdown" @mouseenter="onBrandsEnter">
            <NuxtLink
              v-for="b in brandLinks"
              :key="b.slug"
              :to="localePath('/brands/' + b.slug)"
              class="dropdown__item"
              @click="brandsOpen = false"
            >
              <span class="dropdown__title">{{ b.name }}</span>
              <span class="tiny faint">{{ b.movement }}</span>
            </NuxtLink>
          </div>
        </div>

        <NuxtLink v-for="item in navItems" :key="item.key" :to="item.to" class="navlink">{{ item.label }}</NuxtLink>
      </nav>

      <div class="hdr__right">
        <button class="iconbtn" :aria-label="t('common.search')" @click="searchOpen = !searchOpen">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" />
          </svg>
        </button>

        <NuxtLink v-if="isAdmin" :to="localePath('/office')" class="iconbtn iconbtn--office" :title="t('nav.office')">
          OFFICE
        </NuxtLink>

        <NuxtLink v-if="isAuthenticated" :to="localePath('/account')" class="iconbtn iconbtn--text" :aria-label="t('nav.account')">
          {{ t('nav.account') }}
        </NuxtLink>
        <NuxtLink v-else :to="localePath('/account/login')" class="iconbtn iconbtn--text" :aria-label="t('nav.login')">
          {{ t('nav.login') }}
        </NuxtLink>

        <button type="button" class="iconbtn cartbtn" :aria-label="t('nav.cart')" @click="cart.drawerOpen.value = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 7h12l1 13H5L6 7Z" />
            <path d="M9 7V5a3 3 0 0 1 6 0v2" />
          </svg>
          <span v-if="cart.count.value > 0" class="cartbtn__count">{{ cart.count.value }}</span>
        </button>

        <LocaleSwitch />
      </div>
    </div>

    <!-- Search Bar -->
    <div v-if="searchOpen" class="searchbar">
      <div class="container searchbar__inner">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" />
        </svg>
        <input
          v-model="query"
          class="searchbar__input"
          type="search"
          :placeholder="t('products.searchPlaceholder')"
          @keyup.enter="submitSearch"
        />
        <button class="btn btn--sm btn--gold" @click="submitSearch">{{ t('common.search') }}</button>
      </div>
    </div>

    <!-- Mobile Drawer -->
    <div v-if="mobileOpen" class="mobile-menu">
      <div class="mobile-menu__inner">
        <NuxtLink :to="localePath('/')" class="mmlink" @click="mobileOpen = false">{{ t('nav.home') }}</NuxtLink>
        <NuxtLink :to="localePath('/products')" class="mmlink" @click="mobileOpen = false">{{ t('nav.collections') }}</NuxtLink>

        <div class="mmsub">{{ t('nav.brands') }}</div>
        <div class="mmsublinks">
          <NuxtLink
            v-for="b in brandLinks"
            :key="b.slug"
            :to="localePath('/brands/' + b.slug)"
            class="mmlink mmlink--sub"
            @click="mobileOpen = false"
          >
            {{ b.name }} — {{ b.movement }}
          </NuxtLink>
        </div>

        <div class="mmsub">{{ t('products.categories') }}</div>
        <div class="mmsublinks">
          <NuxtLink
            v-for="c in categoryLinks"
            :key="c.slug"
            :to="localePath({ path: '/products', query: { category: c.slug } })"
            class="mmlink mmlink--sub"
            @click="mobileOpen = false"
          >{{ c.name }}</NuxtLink>
        </div>

        <NuxtLink v-for="item in navItems" :key="item.key" :to="item.to" class="mmlink" @click="mobileOpen = false">{{ item.label }}</NuxtLink>
        <NuxtLink :to="localePath('/cart')" class="mmlink" @click="mobileOpen = false">{{ t('nav.cart') }} ({{ cart.count.value }})</NuxtLink>

        <div class="mmsub">{{ t('nav.account') }}</div>
        <NuxtLink v-if="isAuthenticated" :to="localePath('/account')" class="mmlink mmlink--sub" @click="mobileOpen = false">{{ t('nav.account') }}</NuxtLink>
        <NuxtLink v-else :to="localePath('/account/login')" class="mmlink mmlink--sub" @click="mobileOpen = false">{{ t('nav.login') }}</NuxtLink>
        <NuxtLink v-if="isAdmin" :to="localePath('/office')" class="mmlink mmlink--sub" @click="mobileOpen = false">{{ t('nav.office') }} (/office)</NuxtLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.hdr {
  position: sticky;
  top: 0;
  z-index: 60;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid var(--line);
  transition: background 0.25s var(--ease), box-shadow 0.25s var(--ease);
}
.hdr--scrolled {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 4px 24px rgba(20, 19, 17, 0.05);
}
.announce {
  background: #121110;
  color: #e8dfd0;
  text-align: center;
  padding: 7px 0;
  font-size: 11px;
  letter-spacing: 0.16em;
}
.hdr__inner {
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: 28px;
  height: var(--header-h);
  display: flex;
  align-items: center;
  gap: 24px;
}
.hdr__left { display: flex; align-items: center; gap: 16px; }
.hdr__burger { display: none; }

.brand { display: flex; align-items: center; gap: 11px; }
.brand__crest {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--gold);
  color: var(--gold);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.brand__text { display: flex; flex-direction: column; line-height: 1.05; }
.brand__word {
  font-family: var(--font-roman);
  font-size: 19px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink);
}
.brand__sub {
  font-size: 8.5px;
  letter-spacing: 0.26em;
  color: var(--gold);
  margin-top: 2px;
}

.hdr__nav { display: flex; align-items: center; gap: 28px; margin-inline: auto; }
.navgroup { position: relative; }
.navlink {
  font-size: 11.5px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 500;
  color: var(--ink-soft);
  transition: color 0.2s;
  padding: 8px 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: 0;
}
.navcaret { font-size: 9px; opacity: 0.6; }
.navlink:hover, .navlink.router-link-active { color: var(--gold); }

.mega {
  position: absolute;
  top: calc(100% + 4px);
  left: -40px;
  min-width: 620px;
  background: var(--paper);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-lg);
  padding: 26px 28px 20px;
}
.mega__cols { display: grid; grid-template-columns: 1.55fr 1fr; gap: 28px; }
.mega__label { color: var(--gold); margin-bottom: 14px; }
.mega__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.mega__item { display: flex; align-items: center; gap: 12px; padding: 7px 8px; border-radius: var(--radius); transition: background 0.2s; }
.mega__item:hover { background: var(--ivory); }
.mega__img { width: 42px; height: 42px; border-radius: 50%; overflow: hidden; background: var(--sand); flex: none; border: 1px solid var(--line); }
.mega__img img { width: 100%; height: 100%; object-fit: cover; }
.mega__name { font-size: 13px; letter-spacing: 0.03em; }
.mega__brands { border-left: 1px solid var(--line); padding-left: 24px; display: flex; flex-direction: column; gap: 10px; }
.mega__brandlink {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border-radius: var(--radius);
  transition: background 0.2s;
}
.mega__brandlink:hover { background: var(--ivory); color: var(--gold); }
.mega__foot { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--line); }
.mega__all { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); }

.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 230px;
  background: var(--paper);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-lg);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dropdown__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 9px 12px;
  border-radius: var(--radius);
  transition: background 0.2s;
}
.dropdown__item:hover { background: var(--ivory); }
.dropdown__title { font-family: var(--font-roman); font-size: 12.5px; letter-spacing: 0.12em; text-transform: uppercase; }

.hdr__right { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.iconbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  height: 38px;
  border: 0;
  background: transparent;
  color: var(--ink-soft);
  border-radius: 999px;
  position: relative;
  transition: background 0.2s, color 0.2s;
  font-size: 12px;
}
.iconbtn:hover { background: var(--sand); color: var(--ink); }
.iconbtn--text { font-size: 11.5px; letter-spacing: 0.15em; text-transform: uppercase; min-width: auto; padding-inline: 10px; }
.iconbtn--office {
  font-size: 10px;
  letter-spacing: 0.16em;
  font-weight: 600;
  color: var(--gold);
  border: 1px solid var(--gold-tint);
  background: var(--gold-tint);
  padding-inline: 10px;
  height: 28px;
}
.cartbtn__count {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--gold);
  color: #fff;
  font-size: 10px;
  line-height: 17px;
  text-align: center;
  font-weight: 600;
}

.searchbar { border-top: 1px solid var(--line); background: var(--paper); }
.searchbar__inner { display: flex; align-items: center; gap: 12px; padding-block: 14px; color: var(--ink-muted); }
.searchbar__input { border: 0; outline: 0; background: transparent; font-size: 15px; flex: 1; color: var(--ink); }

.mobile-menu { display: none; }
.mmlink { display: block; padding: 13px 0; border-bottom: 1px solid var(--line); font-size: 14px; }
.mmlink--sub { padding-left: 14px; font-size: 13px; color: var(--ink-muted); }
.mmsub { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-top: 16px; margin-bottom: 4px; }
.mmsublinks { display: flex; flex-direction: column; }

@media (max-width: 1080px) {
  .hdr__nav { gap: 20px; }
  .mega { min-width: 500px; }
}
@media (max-width: 940px) {
  .hdr__nav { display: none; }
  .hdr__burger {
    display: inline-flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border: 0;
    background: transparent;
  }
  .hdr__burger span { display: block; width: 18px; height: 1.4px; background: var(--ink); }
  .hdr__right { margin-left: auto; }
  .iconbtn--text, .iconbtn--office { display: none; }
  .mobile-menu {
    display: block;
    position: fixed;
    inset: var(--header-h) 0 auto 0;
    background: var(--paper);
    border-bottom: 1px solid var(--line);
    box-shadow: var(--shadow-lg);
    z-index: 59;
    max-height: calc(100vh - var(--header-h));
    overflow-y: auto;
  }
  .mobile-menu__inner { padding: 18px 22px 32px; }
}
</style>
