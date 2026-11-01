<script setup lang="ts">
const props = defineProps<{
  product: Record<string, any>
  priority?: boolean
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { site } = useSite()
const cart = useCart()

const name = computed(() =>
  locale.value === 'en' ? props.product.nameEn || props.product.name : props.product.nameTh || props.product.name
)

const primaryImage = computed(() => {
  const images = props.product.images
  if (Array.isArray(images) && images.length) return images[0]
  return typeof images === 'string' && images ? images : '/images/op/watch-990-083-blue.png'
})

const isCutoutPrimary = computed(() => primaryImage.value.endsWith('.png') || primaryImage.value.includes('cutout'))

const hoverImage = computed(() => {
  const images = props.product.images
  if (Array.isArray(images) && images.length > 1) return images[1]
  return null
})

const brandLabel = computed(() => {
  const b = props.product.brand
  if (b && typeof b === 'object') {
    return locale.value === 'en' ? b.nameEn || b.name : b.nameTh || b.name
  }
  return props.product.brandName || b || 'Opwatch'
})

const comparePrice = computed(() => {
  const orig = Number(props.product.originalPrice ?? props.product.priceCompare ?? 0)
  return orig > Number(props.product.price || 0) ? orig : 0
})

const discountPct = computed(() => {
  if (!comparePrice.value) return 0
  return Math.round(((comparePrice.value - Number(props.product.price || 0)) / comparePrice.value) * 100)
})

const isNew = computed(() => {
  const badges = Array.isArray(props.product.badges) ? props.product.badges : []
  return props.product.featured || badges.includes('NEW')
})

function add() {
  if (Number(props.product.stock || 0) <= 0) return
  cart.add({
    productId: Number(props.product.id),
    slug: props.product.slug,
    name: props.product.name,
    nameEn: props.product.nameEn || props.product.name,
    nameTh: props.product.nameTh || props.product.name,
    price: Number(props.product.price || 0),
    image: primaryImage.value,
    maxStock: Number(props.product.stock || 0),
    sku: props.product.sku
  })
}
</script>

<template>
  <article class="opcard">
    <NuxtLink :to="localePath({ path: '/products/' + product.slug })" class="opcard__stage">
      <img
        class="opcard__img opcard__img--primary"
        :class="{ 'is-cutout': isCutoutPrimary }"
        :src="primaryImage"
        :alt="name"
        :loading="priority ? 'eager' : 'lazy'"
      />
      <img
        v-if="hoverImage"
        class="opcard__img opcard__img--hover"
        :src="hoverImage"
        :alt="name"
        loading="lazy"
      />
      <div class="opcard__flags">
        <span v-if="isNew" class="opcard__flag">NEW</span>
        <span v-if="discountPct > 0" class="opcard__flag opcard__flag--sale">-{{ discountPct }}%</span>
      </div>
    </NuxtLink>

    <div class="opcard__meta">
      <h6 class="opcard__sku">
        <NuxtLink :to="localePath({ path: '/products/' + product.slug })">
          {{ product.sku || name }}
        </NuxtLink>
      </h6>

      <NuxtLink :to="localePath({ path: '/products/' + product.slug })" class="opcard__title">
        <span class="opcard__brand">{{ brandLabel }}</span>
        <span class="opcard__sep">·</span>
        <span>{{ name }}</span>
      </NuxtLink>

      <div class="opcard__price">
        <span class="price">{{ formatPrice(product.price, site.currencySymbol, locale === 'en' ? 'en-US' : 'th-TH') }}</span>
        <span v-if="comparePrice > 0" class="price-compare">
          {{ formatPrice(comparePrice, site.currencySymbol, locale === 'en' ? 'en-US' : 'th-TH') }}
        </span>
      </div>

      <button type="button" class="opcard__btn" :disabled="Number(product.stock || 0) <= 0" @click="add">
        <span v-if="Number(product.stock || 0) <= 0">{{ t('common.outOfStock') }}</span>
        <span v-else>+ {{ t('common.addToCart') }}</span>
      </button>
    </div>
  </article>
</template>

<style scoped>
/* Authentic olympianus.com Borderless White Studio Cutout Card */
.opcard {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  text-align: center;
}

.opcard__stage {
  position: relative;
  display: block;
  aspect-ratio: 1 / 1.06;
  background: #ffffff;
  overflow: hidden;
}

.opcard__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.6s var(--ease), transform 0.75s var(--ease);
}
.opcard__img.is-cutout {
  object-fit: contain;
  padding: 16px;
}
.opcard__img--hover {
  opacity: 0;
  object-fit: cover;
  padding: 0;
}
.opcard:hover .opcard__img--hover {
  opacity: 1;
  transform: scale(1.04);
}
.opcard:hover .opcard__img--primary {
  transform: scale(1.03);
}

.opcard__flags {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  z-index: 2;
}
.opcard__flag {
  font-family: var(--font-geo);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.2em;
  padding: 3px 8px;
  background: #0a0a0a;
  color: #ffffff;
}
.opcard__flag--sale {
  margin-left: auto;
  background: var(--gold);
  color: #080808;
}

.opcard__meta {
  padding: 16px 10px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  flex: 1;
}

.opcard__sku {
  font-family: var(--font-geo);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #111111;
  margin: 0;
}
.opcard__sku a:hover {
  color: var(--gold);
}

.opcard__title {
  font-size: 13px;
  color: var(--ink-muted);
  line-height: 1.45;
  transition: color 0.2s;
}
.opcard__title:hover {
  color: #0a0a0a;
}
.opcard__brand {
  color: var(--gold);
  font-weight: 500;
  text-transform: uppercase;
  font-size: 10.5px;
  letter-spacing: 0.14em;
}
.opcard__sep {
  margin-inline: 5px;
  opacity: 0.45;
}

.opcard__price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin-top: 2px;
}

.opcard__btn {
  margin-top: 10px;
  padding: 9px 20px;
  border: 1px solid #e0e0e0;
  background: transparent;
  color: #111111;
  font-family: var(--font-geo);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  transition: background 0.25s var(--ease), color 0.25s var(--ease), border-color 0.25s var(--ease);
}
.opcard:hover .opcard__btn:not(:disabled) {
  border-color: #0f0f0f;
}
.opcard__btn:hover:not(:disabled) {
  background: #0f0f0f;
  border-color: #0f0f0f;
  color: #ffffff;
}
.opcard__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
