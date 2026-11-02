<script setup lang="ts">
const props = defineProps<{
  product: Record<string, any>
}>()

const { locale, t } = useI18n()
const localePath = useLocalePath()
const cart = useCart()
const { site } = useSite()

const fmt = (v: number) =>
  formatPrice(Number(v || 0), site.value.currencySymbol, locale.value === 'en' ? 'en-US' : 'th-TH')

const title = computed(() =>
  locale.value === 'en' && props.product.nameEn ? props.product.nameEn : props.product.nameTh || props.product.nameEn || props.product.name
)

const primaryImg = computed(() => {
  const imgs = Array.isArray(props.product.images) ? props.product.images : []
  return props.product.image || imgs[0] || '/images/op/watch-990-083-blue.png'
})

const hoverImg = computed(() => {
  const imgs = Array.isArray(props.product.images) ? props.product.images : []
  if (props.product.hoverImage) return props.product.hoverImage
  return imgs[1] || ''
})

const compareAt = computed(() => Number(props.product.originalPrice ?? props.product.priceCompare ?? props.product.comparePrice ?? 0))

function addToBag(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  cart.add(
    {
      productId: Number(props.product.id),
      slug: props.product.slug,
      name: props.product.name || title.value,
      nameEn: props.product.nameEn || title.value,
      nameTh: props.product.nameTh || title.value,
      price: Number(props.product.price || 0),
      image: primaryImg.value,
      maxStock: Number(props.product.stock ?? 99),
      sku: props.product.sku
    },
    1
  )
}
</script>

<template>
  <article class="op-card">
    <NuxtLink :to="localePath(`/products/${product.slug}`)" class="op-card__link">
      <!-- Pure White Studio Cutout Stage with Cross-Fade Hover -->
      <div class="op-card__stage" :class="{ 'has-hover': Boolean(hoverImg) }">
        <img
          :src="primaryImg"
          :alt="title"
          class="op-card__img op-card__img--front"
          loading="lazy"
        />
        <img
          v-if="hoverImg"
          :src="hoverImg"
          :alt="title"
          class="op-card__img op-card__img--back"
          loading="lazy"
        />

        <span v-if="product.brandName || product.brandSlug" class="op-card__brand">
          {{ product.brandName || product.brandSlug }}
        </span>
      </div>

      <!-- Luxury Serif Caption + E-Commerce Price & Quick Add -->
      <div class="op-card__body">
        <p v-if="product.sku" class="op-card__sku">{{ product.sku }}</p>
        <h3 class="op-card__title">{{ title }}</h3>

        <div class="op-card__price-row">
          <span class="price">{{ fmt(product.price) }}</span>
          <span v-if="compareAt > Number(product.price || 0)" class="price-compare">
            {{ fmt(compareAt) }}
          </span>
        </div>

        <button
          type="button"
          class="op-card__add"
          :disabled="product.stock !== undefined && Number(product.stock) <= 0"
          @click="addToBag"
        >
          {{
            product.stock !== undefined && Number(product.stock) <= 0
              ? t('common.outOfStock')
              : `+ ${t('common.addToCart')}`
          }}
        </button>
      </div>
    </NuxtLink>
  </article>
</template>

<style scoped>
.op-card {
  background: #ffffff;
  border: 1px solid var(--sand);
  transition: transform 0.45s var(--ease), border-color 0.35s var(--ease), box-shadow 0.4s var(--ease);
}
.op-card:hover {
  transform: translateY(-4px);
  border-color: var(--line-strong);
  box-shadow: 0 18px 44px rgba(25, 26, 53, 0.08);
}
.op-card__link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 18px 26px;
}

.op-card__stage {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  background: #ffffff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.op-card__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 12px;
  transition: opacity 0.55s var(--ease), transform 0.7s var(--ease);
}
.op-card__img--back {
  opacity: 0;
  object-fit: cover;
  padding: 0;
}
.op-card:hover .op-card__stage.has-hover .op-card__img--front {
  opacity: 0;
  transform: scale(1.03);
}
.op-card:hover .op-card__stage.has-hover .op-card__img--back {
  opacity: 1;
  transform: scale(1.04);
}
.op-card:hover .op-card__stage:not(.has-hover) .op-card__img--front {
  transform: scale(1.05);
}

.op-card__brand {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  font-family: var(--font-roman);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.94);
  color: var(--sapphire);
  border: 1px solid var(--sand);
}

.op-card__body {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding-inline: 6px;
}
.op-card__sku {
  font-family: var(--font-roman);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.22em;
  color: var(--sapphire);
  text-transform: uppercase;
}
.op-card__title {
  font-family: var(--font-display);
  font-size: 19.5px;
  font-weight: 500;
  color: var(--ink);
  letter-spacing: 0.03em;
  line-height: 1.38;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s;
}
.op-card:hover .op-card__title {
  color: var(--sapphire);
}
.op-card__price-row {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 2px;
}
.op-card__add {
  margin-top: 10px;
  padding: 8px 22px;
  font-family: var(--font-roman);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  background: transparent;
  color: var(--ink-soft);
  border: 1px solid var(--line-strong);
  opacity: 0.88;
  transition: opacity 0.25s, background 0.25s, color 0.25s, border-color 0.25s;
}
.op-card:hover .op-card__add {
  opacity: 1;
  border-color: var(--sapphire);
  color: var(--sapphire);
}
.op-card__add:hover {
  background: var(--sapphire) !important;
  border-color: var(--sapphire) !important;
  color: #ffffff !important;
}
</style>
