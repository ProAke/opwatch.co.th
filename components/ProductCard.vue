<script setup lang="ts">
const props = defineProps<{
  product: Record<string, any>
  priority?: boolean
}>()

const { t, locale} = useI18n()
const localePath = useLocalePath()
const { site } = useSite()
const cart = useCart()

const name = computed(() =>
  locale.value === 'en' ? props.product.nameEn || props.product.name : props.product.nameTh || props.product.name
)
const image = computed(() => {
  const images = props.product.images
  if (Array.isArray(images) && images.length) return images[0]
  return images || '/images/hero-watch.jpg'
})
const category = computed(() => props.product.categoryName || props.product.categorySlug || null)

function add() {
  if (Number(props.product.stock || 0) <= 0) return
  cart.add({
    productId: Number(props.product.id),
    slug: props.product.slug,
    name: props.product.name,
    nameEn: props.product.nameEn || props.product.name,
    nameTh: props.product.nameTh || props.product.name,
    price: Number(props.product.price || 0),
    image,
    maxStock: Number(props.product.stock || 0),
    sku: props.product.sku
  })
}
</script>

<template>
  <article class="pcard">
    <NuxtLink :to="localePath({ path: '/products/' + product.slug })" class="pcard__media">
      <img :src="image" :alt="name" :loading="priority ? 'eager' : 'lazy'" />
      <span v-if="product.featured" class="pcard__tag">{{ t('common.newCollection') }}</span>
      <span v-if="Number(product.priceCompare || 0) > Number(product.price || 0)" class="pcard__sale">SALE</span>
    </NuxtLink>

    <div class="pcard__body">
      <div class="pcard__cat tiny upper">{{ category || '' }}</div>
      <NuxtLink :to="localePath({ path: '/products/' + product.slug })" class="pcard__name">{{ name }}</NuxtLink>
      <div class="pcard__price">
        <span class="price">{{ formatPrice(product.price, site.currencySymbol, locale === 'en' ? 'en-US' : 'th-TH') }}</span>
        <span v-if="Number(product.priceCompare || 0) > Number(product.price || 0)" class="price-compare">
          {{ formatPrice(product.priceCompare, site.currencySymbol, locale === 'en' ? 'en-US' : 'th-TH') }}
        </span>
      </div>
      <button class="pcard__add" :disabled="Number(product.stock || 0) <= 0" @click="add">
        <span v-if="Number(product.stock || 0) <= 0" class="tiny upper">{{ t('common.outOfStock') }}</span>
        <span v-else class="tiny upper">{{ t('common.addToCart') }}</span>
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
  border-radius: var(--radius-lg);
  transition: border-color 0.3s var(--ease), transform 0.3s var(--ease), box-shadow 0.3s var(--ease);
}
.pcard:hover { border-color: var(--line-strong); transform: translateY(-3px); box-shadow: var(--shadow); }
.pcard__media {
  position: relative;
  display: block;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: var(--sand);
}
.pcard__media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s var(--ease); }
.pcard:hover .pcard__media img { transform: scale(1.04); }
.pcard__tag {
  position: absolute;
  top: 14px;
  left: 14px;
  background: var(--paper);
  color: var(--gold);
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 5px 9px;
  border-radius: 999px;
  border: 1px solid var(--gold-tint);
}
.pcard__sale {
  position: absolute;
  top: 14px;
  right: 14px;
  background: var(--ink);
  color: #f7f4ee;
  font-size: 9px;
  letter-spacing: 0.18em;
  padding: 5px 9px;
  border-radius: 999px;
}
.pcard__body { padding: 18px 18px 20px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.pcard__cat { color: var(--ink-faint); }
.pcard__name {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 500;
  line-height: 1.3;
  color: var(--ink);
  transition: color 0.2s;
}
.pcard__name:hover { color: var(--gold); }
.pcard__price { display: flex; align-items: baseline; gap: 10px; margin-top: 2px; }
.pcard__add {
  margin-top: auto;
  padding-top: 12px;
  border: 0;
  border-top: 1px solid var(--line);
  background: transparent;
  color: var(--ink-soft);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  transition: color 0.2s, background 0.2s;
  text-align: left;
}
.pcard__add:hover:not(:disabled) { color: var(--gold); background: var(--gold-tint); }
.pcard__add:disabled { color: var(--ink-faint); cursor: not-allowed; }
</style>
