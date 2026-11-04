<script setup lang="ts">
const { locale } = useI18n()
const route = useRoute()

const isHeroPage = computed(() => {
  const p = route.path.replace(/^\/en(\/|$)/, '/').replace(/\/+$/, '') || '/'
  return p === '/' || p === '/about' || p === '/news' || p === '/contact' || p === '/products' || p.startsWith('/brands/')
})

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
  <div id="top" class="shell">
    <AppHeader />

    <main :class="{ 'main--offset': !isHeroPage }">
      <slot />
      <CmsRouteEnhancer />
    </main>

    <AppFooter />

    <CartDrawer />
    <FloatingChatHub />
    <CookieConsentBanner />
    <ToastHost />
  </div>
</template>

<style scoped>
.main--offset {
  padding-top: var(--header-h);
}
</style>
