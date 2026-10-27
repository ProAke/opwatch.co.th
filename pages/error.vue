<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t} = useI18n()
const localePath = useLocalePath()
const is404 = computed(() => props.error?.statusCode === 404)

useHead({ title: is404.value ? t('errors.notFound') : `${t('errors.generic')} — ${useSite().site.value.name}` })
</script>

<template>
  <section class="section errpage">
    <div class="container center">
      <p class="errpage__code serif">{{ error?.statusCode || 500 }}</p>
      <p class="eyebrow" style="justify-content: center">{{ is404 ? t('errors.notFound') : t('errors.serverError') }}</p>
      <h1 class="page-title" style="margin: 16px 0 14px">
        {{ is404 ? t('errors.notFound') : t('errors.generic') }}
      </h1>
      <p class="muted" style="max-width: 460px; margin: 0 auto 30px">
        {{ is404 ? t('errors.notFoundBody') : t('errors.generic') }}
      </p>
      <div class="row gap-16" style="justify-content: center; flex-wrap: wrap">
        <NuxtLink :to="localePath('/')" class="btn">{{ t('errors.goHome') }}</NuxtLink>
        <NuxtLink :to="localePath('/products')" class="btn btn--ghost">{{ t('nav.collections') }}</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.errpage { min-height: 70vh; display: flex; align-items: center; }
.errpage__code { font-size: 92px; color: var(--gold-tint); line-height: 1; margin-bottom: 10px; }
</style>
