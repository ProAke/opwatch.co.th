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
  return typeof images === 'string' && images ? images : '/images/hero-watch.jpg'
})

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
  <article class="pcard">
    <NuxtLink :to="localePath({ path: '/products/' + product.slug })" class="pcard__media">
      <img
        class="pcard__img pcard__img--primary"
        :src="primaryImage"
        :alt="name"
        :loading="priority ? 'eager' : 'lazy'"
      />
      <img
        v-if="hoverImage"
        class="pcard__img pcard__img--hover"
        :src="hoverImage"
        :alt="name"
        loading="lazy"
      />
      <div class="pcard__badges">
        <span v-if="isNew" class="pcard__tag">NEW</span>
        <span v-if="discountPct > 0" class="pcard__sale">-{{ discountPct }}%</span>
      </div>
    </NuxtLink>

    <div class="pcard__body">
      <div class="pcard__meta tiny upper">
        <span class="pcard__brand">{{ brandLabel }}</span>
        <span v-if="product.sku" class="pcard__sku">{{ product.sku }}</span>
      </div>

      <NuxtLink :to="localePath({ path: '/products/' + product.slug })" class="pcard__name">
        {{ name }}
      </NuxtLink>

      <div class="pcard__price">
        <span class="price">{{ formatPrice(product.price, site.currencySymbol, locale === 'en' ? 'en-US' : 'th-TH') }}</span>
        <span v-if="comparePrice > 0" class="price-compare">
          {{ formatPrice(comparePrice, site.currencySymbol, locale === 'en' ? 'en-US' : 'th-TH') }}
        </span>
      </div>

      <button type="button" class="pcard__add" :disabled="Number(product.stock || 0) <= 0" @click="add">
        <span v-if="Number(product.stock || 0) <= 0" class="tiny upper">{{ t('common.outOfStock') }}</span>
        <span v-else class="tiny upper">+ {{ t('common.addToCart') }}</span>
      </button>
    </div>
  </article>
</template>

<style scoped>
.pcard {
  display: flex;
  flex-direction: column;
  background: var(--paper);
  border: 1px solid var(--line);
  transition: border-color 0.35s var(--ease), transform 0.35s var(--ease), box-shadow 0.35s var(--ease);
}
.pcard:hover {
  border-color: var(--gold-soft);
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}
.pcard__media {
  position: relative;
  display: block;
  aspect-ratio: 4 / 4.6;
  overflow: hidden;
  background: #f5f2ec;
}
.pcard__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.55s var(--ease), transform 0.75s var(--ease);
}
.pcard__img--hover { opacity: 0; }
.pcard:hover .pcard__img--hover { opacity: 1; transform: scale(1.04); }
.pcard:hover .pcard__img--primary { transform: scale(1.04); }

.pcard__badges {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  z-index: 2;
}
.pcard__tag {
  background: rgba(255, 255, 255, 0.94);
  color: var(--gold);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.18em;
  padding: 4px 9px;
  border: 1px solid var(--gold-tint);
}
.pcard__sale {
  margin-left: auto;
  background: #141311;
  color: #f7f4ee;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.14em;
  padding: 4px 9px;
}

.pcard__body {
  padding: 18px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  flex: 1;
  text-align: center;
}
.pcard__meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--ink-faint);
  font-size: 10px;
}
.pcard__brand { color: var(--gold); font-weight: 600; }
.pcard__sku::before { content: '· '; }

.pcard__name {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 500;
  line-height: 1.3;
  color: var(--ink);
  transition: color 0.2s;
}
.pcard__name:hover { color: var(--gold); }

.pcard__price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 9px;
  margin-top: 2px;
}
.pcard__add {
  margin-top: auto;
  padding: 11px 12px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  font-size: 10.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transition: all 0.22s var(--ease);
}
.pcard__add:hover:not(:disabled) {
  background: #141311;
  border-color: #141311;
  color: #f7f4ee;
}
.pcard__add:disabled {
  color: var(--ink-faint);
  cursor: not-allowed;
  background: var(--ivory);
}
</style>
