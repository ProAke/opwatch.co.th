<script setup lang="ts">
const { locale} = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const options = [
  { code: 'th', label: 'TH' },
  { code: 'en', label: 'EN' }
]

function toLocale(code: string) {
  return localePath({ path: route.path, query: route.query }, code)
}
</script>

<template>
  <div class="lang">
    <NuxtLink
      v-for="o in options"
      :key="o.code"
      :to="toLocale(o.code)"
      class="lang__btn"
      :class="{ 'is-active': locale === o.code }"
      :lang="o.code"
      :hreflang="o.code"
    >
      {{ o.label }}
    </NuxtLink>
  </div>
</template>

<style scoped>
.lang { display: inline-flex; border: 1px solid var(--line-strong); border-radius: 999px; overflow: hidden; }
.lang__btn {
  padding: 5px 11px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--ink-muted);
  background: transparent;
  transition: background 0.2s, color 0.2s;
}
.lang__btn:hover { background: var(--sand); color: var(--ink); }
.lang__btn.is-active { background: var(--ink); color: #f7f4ee; }
</style>
