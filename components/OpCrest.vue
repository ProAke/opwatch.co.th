<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
    stacked?: boolean
    theme?: 'light' | 'dark'
    sublabel?: string
  }>(),
  {
    size: 'md',
    stacked: false,
    theme: 'dark',
    sublabel: ''
  }
)

/**
 * Two transparent variants of the official OPWatch / Olympia Star Thailand logo:
 * - On dark backgrounds (`theme === 'dark'`): pure white `#ffffff` transparent PNG
 * - On white/light backgrounds (`theme === 'light'`): exact original royal-blue transparent PNG
 */
const logoSrc = computed(() =>
  props.theme === 'light'
    ? '/images/logos/opwatch-logo-color.png'
    : '/images/logos/opwatch-logo-white.png'
)
</script>

<template>
  <span class="opcrest" :class="[`opcrest--${size}`, `opcrest--${theme}`, { 'opcrest--stacked': stacked }]">
    <img
      :src="logoSrc"
      alt="Olympia Star Thailand · OPWatch Official"
      class="opcrest__img"
      decoding="async"
    />
  </span>
</template>

<style scoped>
.opcrest {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  line-height: 0;
}

.opcrest__img {
  display: block;
  width: auto;
  object-fit: contain;
  transition: opacity 0.25s var(--ease), transform 0.25s var(--ease);
}

/* Header size (fits cleanly inside 86px --header-h) */
.opcrest--sm .opcrest__img {
  height: 68px;
}

/* Section / Hero badge size */
.opcrest--md .opcrest__img {
  height: 112px;
}

/* Large showcase size */
.opcrest--lg .opcrest__img {
  height: 152px;
}

@media (max-width: 640px) {
  .opcrest--sm .opcrest__img {
    height: 54px;
  }
  .opcrest--md .opcrest__img {
    height: 92px;
  }
}
</style>
