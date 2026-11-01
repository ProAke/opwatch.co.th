<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

const navItems = computed(() => [
  { key: 'about', label: t('nav.aboutUs'), to: localePath('/about') },
  { key: 'contact', label: t('nav.contactUs'), to: localePath('/contact') }
])

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
    <AppHeader :nav-items="navItems" />

    <main>
      <slot />
    </main>

    <AppFooter />

    <CartDrawer />
    <ToastHost />
  </div>
</template>
