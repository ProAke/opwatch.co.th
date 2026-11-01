<script setup lang="ts">
const { locale } = useI18n()
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
.lang {
  display: inline-flex;
  border: 1px solid rgba(255, 255, 255, 0.24);
  overflow: hidden;
}
.lang__btn {
  padding: 5px 9px;
  font-family: var(--font-geo);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.65);
  background: transparent;
  transition: background 0.2s, color 0.2s;
}
.lang__btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}
.lang__btn.is-active {
  background: var(--gold);
  color: #080808;
  font-weight: 600;
}
</style>
