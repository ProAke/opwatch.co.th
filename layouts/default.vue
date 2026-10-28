<script setup lang="ts">
const { site, categories } = useSite()
const { customer, logout, isAuthenticated } = useAuth()
const { t, locale} = useI18n()
const localePath = useLocalePath()
const cart = useCart()
const route = useRoute()

const navItems = computed(() => [
  { key: 'collections', label: t('nav.collections'), to: localePath('/products') },
  { key: 'about', label: t('nav.aboutUs'), to: localePath('/about') },
  { key: 'contact', label: t('nav.contactUs'), to: localePath('/contact') }
])

const query = ref('')

function submitSearch() {
  const q = query.value.trim()
  navigateTo(localePath({ path: '/products', query: q ? { q } : {} }))
}

// Keep the document language attribute in sync.
watch(
  () => locale.value,
  (l) => {
    if (import.meta.client) {
      document.documentElement.lang = l === 'en' ? 'en-US' : 'th-TH'
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="shell">
    <AppHeader :nav-items="navItems" />

    <main>
      <slot />
    </main>

    <AppFooter />

    <CartDrawer />
    <ToastHost />
  </div>
</template>
