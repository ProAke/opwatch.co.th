<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { site } = useSite()
const cart = useCart()

const slug = computed(() => String(route.params.slug))
const localeTag = computed(() => (locale.value === 'en' ? 'en-US' : 'th-TH'))

const { data, error, refresh } = await useFetch<{
  product: Record<string, any>
  related: Record<string, any>[]
  brandProducts: Record<string, any>[]
  reviews: Record<string, any>[]
  category: Record<string, any> | null
  brand: Record<string, any> | null
}>(() => `/api/products/${slug.value}`, { key: 'product-' + slug.value })

const product = computed(() => data.value?.product)
const reviews = computed(() => data.value?.reviews || [])
const related = computed(() => data.value?.related || [])
const category = computed(() => data.value?.category)
const brand = computed(() => data.value?.brand)

if (error.value || !product.value) {
  setResponseStatus(404)
}

const activeImage = ref(0)
const quantity = ref(1)
const reviewForm = reactive({ customerName: '', rating: 5, comment: '' })
const reviewSubmitted = ref(false)

watch(slug, () => {
  activeImage.value = 0
  quantity.value = 1
})

const images = computed(() => {
  const p = product.value
  if (!p) return []
  const arr = Array.isArray(p.images) ? p.images : []
  return arr.length ? arr : ['/images/hero-watch.jpg']
})

const name = computed(() => {
  const p = product.value
  if (!p) return ''
  return locale.value === 'en' ? p.nameEn || p.name : p.nameTh || p.name
})

const brandLabel = computed(() => {
  const b = brand.value
  if (b) return locale.value === 'en' ? b.nameEn || b.name : b.nameTh || b.name
  return product.value?.brand || 'Opwatch'
})

const description = computed(() => {
  const p = product.value
  if (!p) return ''
  if (locale.value === 'en') return p.descriptionEn || p.description || p.descriptionTh || ''
  return p.descriptionTh || p.description || p.descriptionEn || ''
})

const shortDescription = computed(() => {
  const p = product.value
  if (!p) return ''
  return locale.value === 'en' ? p.shortDescriptionEn || p.shortDescription || p.nameEn : p.shortDescription || p.nameTh
})

const comparePrice = computed(() => {
  const p = product.value
  if (!p) return 0
  const orig = Number(p.originalPrice ?? p.priceCompare ?? 0)
  return orig > Number(p.price || 0) ? orig : 0
})

const fmt = (v: number | string | null) => formatPrice(v, site.value.currencySymbol, localeTag.value)

function addToCart(goCheckout = false) {
  if (!product.value) return
  const p = product.value
  cart.add(
    {
      productId: Number(p.id),
      slug: p.slug,
      name: p.name,
      nameEn: p.nameEn || p.name,
      nameTh: p.nameTh || p.name,
      price: Number(p.price || 0),
      image: images.value[0],
      maxStock: Number(p.stock || 0),
      sku: p.sku
    },
    quantity.value
  )
  if (goCheckout) {
    cart.drawerOpen.value = false
    navigateTo(localePath('/checkout'))
  }
}

async function submitReview() {
  if (!reviewForm.comment.trim() || !product.value) return
  try {
    await $fetch('/api/reviews', {
      method: 'POST',
      body: {
        productId: Number(product.value.id),
        customerName: reviewForm.customerName,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment
      }
    })
    reviewForm.comment = ''
    reviewForm.customerName = ''
    reviewSubmitted.value = true
    await refresh()
  } catch {
    /* ignore */
  }
}

useHead(() => ({ title: `${name.value} — ${site.value.name}` }))
</script>

<template>
  <div v-if="error || !product">
    <section class="section">
      <div class="container center">
        <p class="eyebrow" style="justify-content: center">{{ t('errors.notFound') }}</p>
        <h1 class="page-title" style="margin: 16px 0 14px">{{ t('errors.notFound') }}</h1>
        <p class="muted" style="max-width: 420px; margin: 0 auto 26px">{{ t('errors.notFoundBody') }}</p>
        <NuxtLink :to="localePath('/products')" class="btn">{{ t('products.backToCollections') }}</NuxtLink>
      </div>
    </section>
  </div>

  <div v-else>
    <!-- Breadcrumb Bar -->
    <div class="crumbbar">
      <div class="container crumbbar__inner tiny upper">
        <NuxtLink :to="localePath('/')">{{ t('nav.home') }}</NuxtLink>
        <span>/</span>
        <NuxtLink :to="localePath('/products')">{{ t('nav.collections') }}</NuxtLink>
        <template v-if="brand">
          <span>/</span>
          <NuxtLink :to="localePath('/brands/' + brand.slug)">{{ brandLabel }}</NuxtLink>
        </template>
        <span>/</span>
        <span class="crumbbar__cur">{{ product.sku || name }}</span>
      </div>
    </div>

    <!-- Main Gallery & Purchase Block -->
    <section class="pdetail">
      <div class="container pdetail__grid">
        <!-- Studio Gallery -->
        <div class="gallery">
          <div class="gallery__main">
            <img :src="images[activeImage]" :alt="name" />
          </div>
          <div v-if="images.length > 1" class="gallery__thumbs">
            <button
              v-for="(img, i) in images"
              :key="i"
              type="button"
              class="gthumb"
              :class="{ 'is-active': i === activeImage }"
              @click="activeImage = i"
            >
              <img :src="img" :alt="name" loading="lazy" />
            </button>
          </div>
        </div>

        <!-- Horological Details & E-Commerce Actions -->
        <div class="pinfo">
          <div class="row gap-12 wrap">
            <NuxtLink
              v-if="brand"
              :to="localePath('/brands/' + brand.slug)"
              class="roman pinfo__brand"
            >
              {{ brandLabel }}
            </NuxtLink>
            <NuxtLink
              v-if="category"
              :to="localePath({ path: '/products', query: { category: category.slug } })"
              class="tiny upper muted"
            >
              · {{ locale === 'en' ? category.nameEn || category.name : category.nameTh || category.name }}
            </NuxtLink>
          </div>

          <h1 class="pinfo__name">{{ name }}</h1>
          <p class="pinfo__sku tiny upper faint">Model / {{ t('products.sku') }}: <strong>{{ product.sku }}</strong></p>

          <div class="pinfo__price">
            <span class="price price--lg">{{ fmt(product.price) }}</span>
            <span v-if="comparePrice > 0" class="price-compare">
              {{ fmt(comparePrice) }}
            </span>
            <span v-if="comparePrice > 0" class="badge badge--gold">
              -{{ Math.round(((comparePrice - Number(product.price)) / comparePrice) * 100) }}%
            </span>
          </div>

          <p class="pinfo__short">{{ shortDescription }}</p>

          <div class="pinfo__stock">
            <span class="badge" :class="Number(product.stock) <= 0 ? 'badge--danger' : Number(product.stock) <= 10 ? 'badge--gold' : 'badge--new'">
              {{ Number(product.stock) <= 0 ? t('common.outOfStock') : Number(product.stock) <= 10 ? t('products.lowStock') : t('common.inStock') }}
            </span>
            <span class="small muted">{{ product.stock }} {{ t('common.quantity') }}</span>
          </div>

          <!-- Purchase Controls -->
          <div class="pinfo__buy">
            <div class="qty qty--lg">
              <button type="button" aria-label="−" @click="quantity = Math.max(1, quantity - 1)">−</button>
              <span>{{ quantity }}</span>
              <button type="button" aria-label="+" :disabled="quantity >= Number(product.stock || 0)" @click="quantity = Math.min(Number(product.stock || 0), quantity + 1)">+</button>
            </div>
            <button type="button" class="btn btn--gold grow" :disabled="Number(product.stock || 0) <= 0" @click="addToCart(false)">
              + {{ t('common.addToCart') }}
            </button>
          </div>

          <button
            type="button"
            class="btn btn--ghost btn--block"
            :disabled="Number(product.stock || 0) <= 0"
            @click="addToCart(true)"
          >
            {{ t('products.buyNow') }}
          </button>

          <ul class="pinfo__list">
            <li><span class="tiny upper faint">{{ t('home.authentic') }}</span><span>Official Warranty &amp; Certificate</span></li>
            <li><span class="tiny upper faint">{{ t('orderStatus.processing') }}</span><span>{{ t('home.service') }}</span></li>
            <li><span class="tiny upper faint">{{ t('checkout.shippingAddress') }}</span><span>{{ t('cart.freeShippingNote', { amount: formatPrice(site.freeShippingThreshold || 5000, site.currencySymbol, localeTag) }) }}</span></li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Olympianus-style Specification Table & Narrative -->
    <section class="section section--tight specsec">
      <div class="container detail2">
        <div class="detail2__col">
          <p class="eyebrow">{{ t('products.description') }}</p>
          <h2 class="serif" style="font-size: 28px; margin-top: 10px">{{ name }}</h2>
          <div class="detail2__desc">{{ description }}</div>
        </div>

        <div class="detail2__col">
          <p class="eyebrow">SPECIFICATION</p>
          <h2 class="serif" style="font-size: 28px; margin-top: 10px">{{ t('products.specifications') }}</h2>
          <table class="spectable">
            <tbody>
              <tr>
                <th>Model</th>
                <td>{{ product.sku }}</td>
              </tr>
              <tr>
                <th>{{ t('products.brand') }}</th>
                <td>{{ brandLabel }}</td>
              </tr>
              <tr v-for="(value, key) in (product.specs || {})" :key="key">
                <th>{{ key }}</th>
                <td>{{ value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Reviews -->
    <section class="section section--tight">
      <div class="container">
        <div class="between reviewhead">
          <div>
            <p class="eyebrow">{{ t('products.reviews') }}</p>
            <h2 class="page-title" style="font-size: 2rem">{{ t('products.reviews') }}</h2>
          </div>
          <span class="badge">{{ reviews.length }} {{ t('products.reviews') }}</span>
        </div>

        <div class="reviewlist">
          <div v-for="r in reviews" :key="r.id" class="review">
            <div class="review__top">
              <span class="stars">{{ '★'.repeat(Number(r.rating || 5)) }}</span>
              <span class="tiny upper muted">{{ formatDate(r.createdAt, localeTag) }}</span>
            </div>
            <p class="review__name">{{ r.customerName }}</p>
            <p class="review__comment">{{ r.comment }}</p>
          </div>
          <p v-if="!reviews.length" class="muted">{{ t('products.noReviews') }}</p>
        </div>

        <form class="reviewform" @submit.prevent="submitReview">
          <p class="eyebrow">{{ t('products.writeReview') }}</p>
          <div class="reviewform__grid">
            <input v-model="reviewForm.customerName" class="input" :placeholder="t('auth.name')" style="max-width: 260px" />
            <div class="row gap-8">
              <span class="small muted">{{ t('products.reviews') }}</span>
              <select v-model.number="reviewForm.rating" class="select" style="width: 120px">
                <option v-for="n in 5" :key="n" :value="n">{{ '★'.repeat(n) }}{{ '☆'.repeat(5 - n) }}</option>
              </select>
            </div>
          </div>
          <textarea v-model="reviewForm.comment" class="textarea" :placeholder="t('products.writeReview')" />
          <div>
            <button class="btn btn--sm" type="submit" :disabled="!reviewForm.comment.trim()">{{ t('common.save') }}</button>
            <span v-if="reviewSubmitted" class="small" style="color: var(--success); margin-left: 14px">{{ t('account.profileSaved') }}</span>
          </div>
        </form>
      </div>
    </section>

    <!-- Related Models + BACK link (Olympianus style) -->
    <section v-if="related.length" class="section section--tight" style="border-top: 1px solid var(--line)">
      <div class="container">
        <div class="op-sec-head" style="margin-bottom: 36px">
          <h2 class="op-sec-title" style="font-size: 1.5rem">RELATED</h2>
        </div>
        <div class="grid--4">
          <ProductCard v-for="p in related" :key="p.id" :product="p" />
        </div>
        <div class="center" style="margin-top: 44px">
          <NuxtLink :to="localePath('/products')" class="btn btn--ghost">← BACK</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.crumbbar { background: var(--ivory); border-bottom: 1px solid var(--line); padding-block: 13px; }
.crumbbar__inner { display: flex; align-items: center; gap: 8px; color: var(--ink-muted); flex-wrap: wrap; }
.crumbbar__inner a:hover { color: var(--gold); }
.crumbbar__cur { color: var(--ink); font-weight: 600; }

.pdetail { padding-block: 52px; background: var(--paper); border-bottom: 1px solid var(--line); }
.pdetail__grid { display: grid; grid-template-columns: 1.05fr 1fr; gap: 60px; align-items: start; }

.gallery__main { aspect-ratio: 4 / 4.4; overflow: hidden; background: #f5f2ec; border: 1px solid var(--line); }
.gallery__main img { width: 100%; height: 100%; object-fit: cover; }
.gallery__thumbs { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
.gthumb { width: 76px; height: 76px; border: 1px solid var(--line-strong); background: var(--paper); padding: 0; overflow: hidden; }
.gthumb img { width: 100%; height: 100%; object-fit: cover; }
.gthumb.is-active { border-color: var(--gold); border-width: 2px; }

.pinfo { display: flex; flex-direction: column; gap: 15px; }
.pinfo__brand { color: var(--gold); font-size: 13px; font-weight: 600; }
.pinfo__name { font-size: clamp(2rem, 3.8vw, 2.9rem); line-height: 1.12; }
.pinfo__sku { margin-top: -6px; }
.pinfo__price { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; margin-top: 4px; }
.pinfo__short { color: var(--ink-soft); line-height: 1.75; padding-block: 4px; }
.pinfo__stock { display: flex; align-items: center; gap: 12px; }
.pinfo__buy { display: flex; gap: 12px; margin-top: 6px; align-items: stretch; }
.qty--lg { display: inline-flex; align-items: center; border: 1px solid var(--line-strong); border-radius: var(--radius); overflow: hidden; }
.qty--lg button { border: 0; background: transparent; width: 46px; height: 100%; font-size: 18px; color: var(--ink-soft); }
.qty--lg span { min-width: 44px; text-align: center; font-size: 15px; }
.pinfo__list { list-style: none; padding: 0; margin: 12px 0 0; border-top: 1px solid var(--line); }
.pinfo__list li { display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--line); font-size: 13.5px; color: var(--ink-soft); }

.specsec { background: var(--ivory); border-bottom: 1px solid var(--line); }
.detail2 { display: grid; grid-template-columns: 1.1fr 1fr; gap: 56px; align-items: start; }
.detail2__desc { margin-top: 16px; font-size: 15.5px; line-height: 1.9; color: var(--ink-soft); }

.spectable { width: 100%; border-collapse: collapse; margin-top: 18px; background: var(--paper); border: 1px solid var(--line); }
.spectable th, .spectable td { padding: 13px 18px; border-bottom: 1px solid var(--line); font-size: 14px; text-align: left; }
.spectable th { width: 40%; color: var(--ink-muted); font-weight: 500; background: #faf8f4; }

.reviewhead { margin-bottom: 30px; }
.reviewlist { display: flex; flex-direction: column; gap: 16px; }
.review { border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 20px 22px; background: var(--paper); }
.review__top { display: flex; align-items: center; justify-content: space-between; }
.stars { color: var(--gold); letter-spacing: 2px; font-size: 13px; }
.review__name { font-family: var(--font-display); font-size: 16px; margin: 6px 0 4px; }
.review__comment { color: var(--ink-soft); line-height: 1.7; }
.reviewform { margin-top: 40px; border-top: 1px solid var(--line); padding-top: 30px; display: flex; flex-direction: column; gap: 14px; }
.reviewform__grid { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
.grid--4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }

@media (max-width: 1080px) { .grid--4 { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 900px) {
  .pdetail__grid { grid-template-columns: 1fr; gap: 38px; }
  .detail2 { grid-template-columns: 1fr; gap: 40px; }
}
@media (max-width: 620px) {
  .pinfo__buy { flex-direction: column; }
  .grid--4 { grid-template-columns: 1fr; }
}
</style>
