<script setup lang="ts">
defineProps<{
  lightSurface?: boolean
}>()

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const available = computed(() =>
  (locales.value as Array<{ code: string; name?: string }>).map(l => ({
    code: l.code,
    label: l.code.toUpperCase(),
    path: switchLocalePath(l.code as 'th' | 'en')
  }))
)
</script>

<template>
  <div class="lang-switch" :class="{ 'lang-switch--light': lightSurface }" role="group" aria-label="Language">
    <NuxtLink
      v-for="item in available"
      :key="item.code"
      :to="item.path"
      class="lang-switch__item"
      :class="{ 'is-active': locale === item.code }"
    >
      {{ item.label }}
    </NuxtLink>
  </div>
</template>

<style scoped>
.lang-switch {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.34);
  font-family: var(--font-roman);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  transition: border-color 0.28s var(--ease);
}
.lang-switch__item {
  padding: 5px 9px;
  color: rgba(255, 255, 255, 0.82);
  transition: color 0.2s, background 0.2s;
}
.lang-switch__item:hover { color: #ffffff; }
.lang-switch__item.is-active {
  background: #ffffff;
  color: var(--sapphire);
}

/* On #ffffff sticky/page header (olympianus.com header_color) */
.lang-switch--light {
  border-color: var(--line-strong);
}
.lang-switch--light .lang-switch__item {
  color: var(--ink-soft);
}
.lang-switch--light .lang-switch__item:hover {
  color: var(--sapphire);
}
.lang-switch--light .lang-switch__item.is-active {
  background: var(--sapphire);
  color: #ffffff;
}
</style>
