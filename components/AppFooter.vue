<script setup lang="ts">
const { t, locale} = useI18n()
const localePath = useLocalePath()
const { site, categories } = useSite()
const year = new Date().getFullYear()

const categoryLinks = computed(() =>
  categories.value.map((c) => ({
    slug: c.slug,
    name: locale.value === 'en' ? c.nameEn || c.name : c.nameTh || c.name
  }))
)
</script>

<template>
  <footer class="ftr">
    <div class="container ftr__top">
      <div class="ftr__brand">
        <div class="brand">
          <span class="brand__mark">OP</span>
          <span class="brand__word">{{ site.name }}</span>
        </div>
        <p class="muted ftr__about">{{ t('footer.aboutBody') }}</p>
        <p class="tiny upper faint">{{ t('footer.madeWith') }}</p>
      </div>

      <div class="ftr__col">
        <h4 class="tiny upper">{{ t('footer.quickLinks') }}</h4>
        <NuxtLink :to="localePath('/')">{{ t('nav.home') }}</NuxtLink>
        <NuxtLink :to="localePath('/products')">{{ t('nav.collections') }}</NuxtLink>
        <NuxtLink :to="localePath('/about')">{{ t('nav.aboutUs') }}</NuxtLink>
        <NuxtLink :to="localePath('/contact')">{{ t('nav.contactUs') }}</NuxtLink>
      </div>

      <div class="ftr__col">
        <h4 class="tiny upper">{{ t('footer.customerService') }}</h4>
        <a :href="`mailto:${site.email}`">{{ site.email }}</a>
        <a :href="`tel:${site.phone.replace(/[^\d+]/g, '')}`">{{ site.phone }}</a>
        <NuxtLink :to="localePath('/account/orders')">{{ t('account.orders') }}</NuxtLink>
        <NuxtLink :to="localePath('/account')">{{ t('account.profile') }}</NuxtLink>
      </div>

      <div class="ftr__col">
        <h4 class="tiny upper">{{ t('footer.followUs') }}</h4>
        <div class="ftr__social">
          <a href="#" aria-label="Facebook" class="ftr__soc"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-2 0-3 1.5-3 3v2H8v3h3v7h3v-7h2.5l.5-3H14V9.5c0-.5.3-.5.5-.5z"/></svg></a>
          <a href="#" aria-label="Instagram" class="ftr__soc"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.2"/><circle cx="17" cy="7" r="0.9" fill="currentColor"/></svg></a>
          <a href="#" aria-label="LINE" class="ftr__soc"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.4 0-8 3.1-8 7 0 2.2 1.2 4.2 3 5.5-.2.8-.8 2-1.6 3.2 1.6-.4 3-1.3 3.9-2.4.6.1 1.2.2 1.8.2 4.4 0 8-3.1 8-7s-3.6-6.3-8-6.3zm-3 7.6c0-.5.4-.8.9-.8h4.2c.5 0 .9.3.9.8s-.4.8-.9.8H9.9c-.5 0-.9-.3-.9-.8zm1.4 2.4h2.4c.4 0 .8-.3.8-.8s-.3-.7-.8-.7h-2.4c-.4 0-.7.3-.7.7s.3.8.7.8z"/></svg></a>
        </div>
        <p class="muted small">{{ t('footer.contact') }}</p>
        <p class="muted small">{{ site.phone }}</p>
      </div>
    </div>

    <div class="ftr__bottom">
      <div class="container between">
        <p class="tiny upper faint">© {{ year }} {{ site.name }}. {{ t('footer.rights') }}</p>
        <p class="tiny upper faint">{{ t('footer.madeWith') }}</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.ftr { background: var(--ink); color: #d9d2c6; padding-top: 72px; margin-top: 90px; }
.ftr__top { display: grid; grid-template-columns: 2.2fr 1fr 1fr 1.2fr; gap: 48px; padding-bottom: 56px; }
.ftr__brand .brand { display: flex; align-items: center; gap: 9px; margin-bottom: 18px; }
.brand__mark {
  font-family: var(--font-display); font-size: 20px; font-weight: 600; color: var(--gold);
  border: 1px solid var(--gold); border-radius: 50%; width: 32px; height: 32px;
  display: inline-flex; align-items: center; justify-content: center; transform: translateY(3px);
}
.brand__word { font-family: var(--font-display); font-size: 20px; font-weight: 600; letter-spacing: 0.1em; color: #f4f0e8; }
.ftr__about { max-width: 340px; font-size: 14px; line-height: 1.7; color: #a9a194; }
.ftr__col { display: flex; flex-direction: column; gap: 11px; font-size: 14px; }
.ftr__col h4 { margin-bottom: 6px; color: var(--gold); }
.ftr__col a { color: #bfb7a9; transition: color 0.2s; }
.ftr__col a:hover { color: #fff; }
.ftr__social { display: flex; gap: 10px; margin: 4px 0 14px; }
.ftr__soc {
  width: 34px; height: 34px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.16);
  display: inline-flex; align-items: center; justify-content: center; color: #c8c1b2; transition: all 0.2s;
}
.ftr__soc:hover { border-color: var(--gold); color: var(--gold); }
.ftr__bottom { border-top: 1px solid rgba(255,255,255,0.09); padding-block: 22px; }
.ftr__bottom .tiny { color: #7f796c; }

@media (max-width: 900px) {
  .ftr__top { grid-template-columns: 1fr 1fr; gap: 36px; }
  .ftr__brand { grid-column: 1 / -1; }
}
@media (max-width: 560px) {
  .ftr__top { grid-template-columns: 1fr; }
}
</style>
