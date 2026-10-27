<script setup lang="ts">
const props = defineProps<{ navItems: { key: string; label: string; to: string }[] }>()

const { t, locale} = useI18n()
const localePath = useLocalePath()
const { site, categories } = useSite()
const { customer, isAuthenticated, logout } = useAuth()
const cart = useCart()
const route = useRoute()

const mobileOpen = ref(false)
const searchOpen = ref(false)
const query = ref('')
const collectionsOpen = ref(false)
let closeTimer: any = null

function onCollectionsEnter() {
  clearTimeout(closeTimer)
  collectionsOpen.value = true
}
function onCollectionsLeave() {
  closeTimer = setTimeout(() => (collectionsOpen.value = false), 120)
}

function submitSearch() {
  const q = query.value.trim()
  mobileOpen.value = false
  searchOpen.value = false
  navigateTo(localePath({ path: '/products', query: q ? { q } : {} }))
}

function logoutAndGo() {
  logout()
  navigateTo(localePath('/'))
}

const categoryLinks = computed(() =>
  categories.value.map((c) => ({
    slug: c.slug,
    name: locale.value === 'en' ? c.nameEn || c.name : c.nameTh || c.name,
    image: c.image
  }))
)
</script>

<template>
  <header class="hdr" :class="{ 'hdr--solid': route.path !== '/' }">
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
          <span class="brand__mark">OP</span>
          <span class="brand__word">Opwatch</span>
        </NuxtLink>
      </div>

      <nav class="hdr__nav" aria-label="Primary">
        <div class="navgroup" @mouseenter="onCollectionsEnter" @mouseleave="onCollectionsLeave">
          <NuxtLink :to="localePath('/products')" class="navlink">{{ t('nav.collections') }}</NuxtLink>
          <div v-if="collectionsOpen" class="mega" @mouseenter="onCollectionsEnter">
            <div class="mega__grid">
              <NuxtLink
                v-for="c in categoryLinks"
                :key="c.slug"
                :to="localePath({ path: '/products', query: { category: c.slug } })"
                class="mega__item"
              >
                <span class="mega__img"><img v-if="c.image" :src="c.image" :alt="c.name" loading="lazy" /></span>
                <span class="mega__name">{{ c.name }}</span>
              </NuxtLink>
            </div>
            <NuxtLink :to="localePath('/products')" class="mega__all">{{ t('common.viewAll') }} →</NuxtLink>
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

        <NuxtLink v-if="isAuthenticated" :to="localePath('/account')" class="iconbtn iconbtn--text" :aria-label="t('nav.account')">
          {{ t('nav.account') }}
        </NuxtLink>
        <NuxtLink v-else :to="localePath('/account/login')" class="iconbtn iconbtn--text" :aria-label="t('nav.login')">
          {{ t('nav.login') }}
        </NuxtLink>

        <NuxtLink :to="localePath('/cart')" class="iconbtn cartbtn" :aria-label="t('nav.cart')">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
            <circle cx="9" cy="21" r="1.2" /><circle cx="18" cy="21" r="1.2" />
          </svg>
          <span v-if="cart.count.value > 0" class="cartbtn__count">{{ cart.count.value }}</span>
        </NuxtLink>

        <LocaleSwitch />
      </div>
    </div>

    <div v-if="searchOpen" class="searchbar">
      <div class="container searchbar__inner">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" />
        </svg>
        <input v-model="query" class="searchbar__input" type="search" :placeholder="t('products.searchPlaceholder')" @keyup.enter="submitSearch" />
        <button class="btn btn--sm" @click="submitSearch">{{ t('common.search') }}</button>
      </div>
    </div>

    <!-- Mobile drawer -->
    <div v-if="mobileOpen" class="mobile-menu">
      <div class="mobile-menu__inner">
        <NuxtLink :to="localePath('/')" class="mmlink" @click="mobileOpen = false">{{ t('nav.home') }}</NuxtLink>
        <NuxtLink :to="localePath('/products')" class="mmlink" @click="mobileOpen = false">{{ t('nav.collections') }}</NuxtLink>
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
        <div class="mmsub">{{ t('nav.account') }}</div>
        <NuxtLink v-if="isAuthenticated" :to="localePath('/account')" class="mmlink mmlink--sub" @click="mobileOpen = false">{{ t('nav.account') }}</NuxtLink>
        <NuxtLink v-else :to="localePath('/account/login')" class="mmlink mmlink--sub" @click="mobileOpen = false">{{ t('nav.login') }}</NuxtLink>
        <NuxtLink v-if="isAuthenticated" to="/admin" class="mmlink mmlink--sub" @click="mobileOpen = false">{{ t('nav.admin') }}</NuxtLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.hdr {
  position: sticky;
  top: 0;
  z-index: 60;
  background: rgba(251, 250, 247, 0.86);
  backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid var(--line);
}
.announce {
  background: var(--ink);
  color: #f0e9dc;
  text-align: center;
  padding: 8px 0;
  font-size: 11px;
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
.hdr__left { display: flex; align-items: center; gap: 18px; }
.hdr__burger { display: none; }

.brand { display: flex; align-items: baseline; gap: 9px; }
.brand__mark {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--gold);
  border: 1px solid var(--gold);
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transform: translateY(3px);
}
.brand__word {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.hdr__nav { display: flex; align-items: center; gap: 30px; margin-inline: auto; }
.navgroup { position: relative; }
.navlink {
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 500;
  color: var(--ink-soft);
  transition: color 0.2s;
  padding: 6px 0;
}
.navlink:hover, .navlink.router-link-active { color: var(--ink); }

.mega {
  position: absolute;
  top: 100%;
  left: -10px;
  min-width: 460px;
  background: var(--paper);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-lg);
  padding: 22px;
  display: grid;
  gap: 14px;
}
.mega__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.mega__item { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: var(--radius); transition: background 0.2s; }
.mega__item:hover { background: var(--sand); }
.mega__img { width: 46px; height: 46px; border-radius: 50%; overflow: hidden; background: var(--sand); flex: none; }
.mega__img img { width: 100%; height: 100%; object-fit: cover; }
.mega__name { font-size: 13px; letter-spacing: 0.04em; }
.mega__all { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); justify-self: start; }

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
  border-radius: 50%;
  position: relative;
  transition: background 0.2s, color 0.2s;
  font-size: 12px;
}
.iconbtn:hover { background: var(--sand); color: var(--ink); }
.iconbtn--text { font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; min-width: auto; padding-inline: 10px; }
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
.mmsub { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-top: 16px; }
.mmsublinks { display: flex; flex-direction: column; }

@media (max-width: 1080px) {
  .hdr__nav { gap: 22px; }
}
@media (max-width: 920px) {
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
  .hdr__burger span { display: block; width: 18px; height: 1px; background: var(--ink); }
  .hdr__right { margin-left: auto; }
  .iconbtn--text { display: none; }
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
  .mobile-menu__inner { padding: 18px 22px; }
}
</style>
