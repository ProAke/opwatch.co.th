<script setup lang="ts">
const { locale } = useI18n()

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

    <main>
      <slot />
    </main>

    <AppFooter />

    <CartDrawer />
    <ToastHost />
  </div>
</template>
