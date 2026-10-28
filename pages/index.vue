<script setup lang="ts">
const { t, locale} = useI18n()
const localePath = useLocalePath()
const { site, categories } = useSite()

const heroImage = '/images/hero-watch.jpg'

const localeTag = computed(() => (locale.value === 'en' ? 'en-US' : 'th-TH'))

const { data: featuredData } = await useFetch<{ items: Record<string, any>[] }>('/api/products', {
  query: { sort: 'featured', limit: 4 },
  default: () => ({ items: [] })
})

const featured = computed(() => featuredData.value?.items || [])

const collectionCards = computed(() =>
  categories.value
    .slice(0, 3)
    .map((c) => ({
      slug: c.slug,
      name: locale.value === 'en' ? c.nameEn || c.name : c.nameTh || c.name,
      image: c.image
    }))
)

useHead({
  title: `${site.value.name} — ${site.value.tagline}`,
  meta: [{ name: 'description', content: site.value.tagline }]
})
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="hero">
      <div class="hero__bg">
        <img :src="heroImage" alt="" fetchpriority="high" />
      </div>
      <div class="hero__inner container">
        <p class="eyebrow fade-up" style="animation-delay: 60ms">{{ t('home.heroEyebrow') }}</p>
        <h1 class="hero__title fade-up" style="animation-delay: 140ms">{{ t('home.heroTitle') }}</h1>
        <p class="hero__sub fade-up" style="animation-delay: 220ms">{{ t('home.heroSubtitle') }}</p>
        <div class="hero__cta fade-up" style="animation-delay: 300ms">
          <NuxtLink :to="localePath('/products')" class="btn btn--gold">{{ t('home.heroCtaPrimary') }}</NuxtLink>
          <NuxtLink :to="localePath('/about')" class="btn btn--ghost">{{ t('home.heroCtaSecondary') }}</NuxtLink>
        </div>
      </div>
      <div class="hero__scroll tiny upper">{{ t('common.continue') }} ↓</div>
    </section>

    <!-- TRUST STRIP -->
    <section class="trust">
      <div class="container trust__inner">
        <div v-for="(item, i) in [t('home.curated'), t('home.authentic'), t('home.service')]" :key="i" class="trust__item">
          <span class="trust__dot" />
          <span class="tiny upper">{{ item }}</span>
        </div>
      </div>
    </section>

    <!-- FEATURED -->
    <section class="section">
      <div class="container">
        <div class="section__head">
          <div>
            <p class="eyebrow">{{ t('home.featuredEyebrow') }}</p>
            <h2 class="page-title">{{ t('home.featuredTitle') }}</h2>
          </div>
          <p class="muted section__sub">{{ t('home.featuredSubtitle') }}</p>
        </div>

        <div class="grid grid--4">
          <ProductCard v-for="p in featured" :key="p.id" :product="p" />
        </div>

        <div class="section__foot">
          <NuxtLink :to="localePath('/products')" class="link-underline">{{ t('common.viewAll') }}</NuxtLink>
        </div>
      </div>
    </section>

    <!-- COLLECTIONS -->
    <section class="section section--dark collections">
      <div class="container">
        <div class="section__head section__head--light">
          <div>
            <p class="eyebrow">{{ t('home.collectionsEyebrow') }}</p>
            <h2 class="page-title">{{ t('home.collectionsTitle') }}</h2>
          </div>
          <p class="section__sub section__sub--light">{{ t('home.collectionsSubtitle') }}</p>
        </div>

        <div class="collgrid">
          <NuxtLink
            v-for="c in collectionCards"
            :key="c.slug"
            :to="localePath({ path: '/products', query: { category: c.slug } })"
            class="collcard"
          >
            <div class="collcard__img"><img :src="c.image" :alt="c.name" loading="lazy" /></div>
            <div class="collcard__label">
              <span class="tiny upper">{{ t('common.viewAll') }}</span>
              <span class="collcard__name">{{ c.name }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- CRAFTSMANSHIP -->
    <section class="section craft">
      <div class="container craft__inner">
        <div class="craft__media">
          <img src="/images/c-men.jpg" alt="" loading="lazy" />
        </div>
        <div class="craft__text">
          <p class="eyebrow">{{ t('home.craftEyebrow') }}</p>
          <h2 class="page-title">{{ t('home.craftTitle') }}</h2>
          <p class="craft__body">{{ t('home.craftBody') }}</p>
          <NuxtLink :to="localePath('/about')" class="link-underline">{{ t('nav.aboutUs') }}</NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section cta">
      <div class="container cta__inner">
        <p class="eyebrow cta__eyebrow">{{ t('home.ctaEyebrow') }}</p>
        <h2 class="cta__title">{{ t('home.ctaTitle') }}</h2>
        <p class="cta__body">{{ t('home.ctaBody') }}</p>
        <NuxtLink :to="localePath('/account/register')" class="btn btn--gold">{{ t('home.ctaButton') }}</NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero { position: relative; min-height: 88vh; display: flex; align-items: center; overflow: hidden; }
.hero__bg { position: absolute; inset: 0; }
.hero__bg img { width: 100%; height: 100%; object-fit: cover; object-position: center 30%; }
.hero__bg::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(20,18,16,0.72) 0%, rgba(20,18,16,0.4) 42%, rgba(20,18,16,0.05) 70%); }
.hero__inner { position: relative; z-index: 2; color: #f7f4ee; max-width: 620px; }
.hero__title {
  font-size: clamp(2.6rem, 6vw, 4.6rem);
  line-height: 1.05;
  white-space: pre-line;
  margin: 22px 0 18px;
}
.hero__sub { font-size: clamp(1rem, 1.5vw, 1.12rem); color: #ddd6c7; max-width: 480px; line-height: 1.8; }
.hero__cta { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 34px; }
.hero__cta .btn--ghost { color: #f7f4ee; border-color: rgba(247,244,238,0.4); }
.hero__cta .btn--ghost:hover { background: #f7f4ee; color: var(--ink); border-color: #f7f4ee; }
.hero__scroll { position: absolute; bottom: 26px; left: 50%; transform: translateX(-50%); z-index: 2; color: rgba(247,244,238,0.6); }

.trust { border-bottom: 1px solid var(--line); background: var(--paper); }
.trust__inner { display: flex; justify-content: space-around; padding-block: 20px; flex-wrap: wrap; gap: 16px; }
.trust__item { display: flex; align-items: center; gap: 10px; color: var(--ink-soft); }
.trust__dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); }

.section__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 40px; margin-bottom: 44px; flex-wrap: wrap; }
.section__sub { max-width: 380px; font-size: 15px; }
.section__head--light .section__sub { color: rgba(244,240,232,0.7); }
.section__sub--light { color: rgba(244,240,232,0.7) !important; }
.section__head--light .page-title { color: #f7f4ee; }
.section__head--light .eyebrow { color: var(--gold-soft); }
.section__foot { text-align: center; margin-top: 46px; }

.grid--4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 26px; }

.collgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; }
.collcard__img { aspect-ratio: 4 / 5; overflow: hidden; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); }
.collcard__img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s var(--ease); }
.collcard:hover .collcard__img img { transform: scale(1.05); }
.collcard__label { display: flex; align-items: center; justify-content: space-between; color: #e7e0d2; padding-top: 16px; }
.collcard__name { font-family: var(--font-display); font-size: 20px; color: #f7f4ee; }

.craft__inner { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.craft__media { aspect-ratio: 4 / 3; overflow: hidden; background: var(--sand); }
.craft__media img { width: 100%; height: 100%; object-fit: cover; }
.craft__text { padding-inline: 20px; }
.craft__body { margin: 20px 0 26px; font-size: 16px; line-height: 1.85; color: var(--ink-soft); max-width: 460px; }

.cta { background: var(--gold-tint); text-align: center; }
.cta__inner { display: flex; flex-direction: column; align-items: center; }
.cta__eyebrow { justify-content: center; }
.cta__eyebrow::before { display: none; }
.cta__title { font-size: clamp(2rem, 4vw, 3.2rem); margin: 18px 0 14px; }
.cta__body { color: var(--ink-soft); margin-bottom: 30px; max-width: 520px; }

@media (max-width: 1080px) {
  .grid--4 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .hero { min-height: 78vh; }
  .hero__bg img { object-position: center 40%; }
  .craft__inner { grid-template-columns: 1fr; gap: 34px; }
  .collgrid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 620px) {
  .collgrid { grid-template-columns: 1fr; }
  .grid--4 { grid-template-columns: 1fr; }
  .section__head { flex-direction: column; align-items: flex-start; gap: 12px; }
}
</style>
