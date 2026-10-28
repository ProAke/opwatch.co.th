<script setup lang="ts">
const { t, locale} = useI18n()
const localePath = useLocalePath()
const { site } = useSite()
const cart = useCart()
const localeTag = computed(() => (locale.value === 'en' ? 'en-US' : 'th-TH'))

const fmt = (v: number) => formatPrice(v, site.value.currencySymbol, localeTag.value)

const totals = computed(() => {
  const subtotal = cart.subtotal.value
  const threshold = Number(site.value.freeShippingThreshold || 0)
  const fee = threshold > 0 && subtotal >= threshold ? 0 : Number(site.value.shippingFee || 0)
  return { subtotal, fee, total: subtotal + fee }
})

useHead({ title: `${t('cart.title')} — ${site.value.name}` })
</script>

<template>
  <section class="section">
    <div class="container">
      <p class="eyebrow">{{ t('nav.cart') }}</p>
      <h1 class="page-title" style="margin: 14px 0 44px">{{ t('cart.title') }}</h1>

      <div v-if="!cart.items.value.length" class="empty">
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" style="color: var(--ink-faint)">
          <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
          <circle cx="9" cy="21" r="1.2" /><circle cx="18" cy="21" r="1.2" />
        </svg>
        <h2 class="serif empty__title">{{ t('cart.empty') }}</h2>
        <p class="muted" style="max-width: 400px; margin: 0 auto 28px">{{ t('cart.emptyBody') }}</p>
        <NuxtLink :to="localePath('/products')" class="btn">{{ t('cart.emptyButton') }}</NuxtLink>
      </div>

      <div v-else class="cartlayout">
        <div class="cartitems">
          <div class="between cartitems__head tiny upper muted">
            <span>{{ t('cart.product') }}</span>
            <span class="cartitems__mid">{{ t('cart.price') }}</span>
            <span>{{ t('cart.quantity') }}</span>
            <span class="cartitems__end">{{ t('cart.subtotal') }}</span>
            <span />
          </div>

          <div v-for="line in cart.items.value" :key="line.productId" class="cline">
            <NuxtLink :to="localePath('/products/' + line.slug)" class="cline__img">
              <img :src="line.image" :alt="line.name" loading="lazy" />
            </NuxtLink>
            <div class="cline__info">
              <NuxtLink :to="localePath('/products/' + line.slug)" class="cline__name">
                {{ locale === 'en' ? line.nameEn : line.nameTh }}
              </NuxtLink>
              <span class="tiny upper faint">{{ line.sku }}</span>
              <span class="small muted">{{ fmt(line.price) }}</span>
            </div>
            <div class="qty qty--lg">
              <button @click="cart.setQuantity(line.productId, line.quantity - 1)" aria-label="−">−</button>
              <span>{{ line.quantity }}</span>
              <button :disabled="line.quantity >= line.maxStock" @click="cart.setQuantity(line.productId, line.quantity + 1)" aria-label="+">+</button>
            </div>
            <div class="cline__end price">{{ fmt(line.price * line.quantity) }}</div>
            <button class="cline__remove" :aria-label="t('cart.remove')" @click="cart.remove(line.productId)">×</button>
          </div>

          <NuxtLink :to="localePath('/products')" class="link-underline" style="margin-top: 28px">{{ t('cart.continueShopping') }}</NuxtLink>
        </div>

        <aside class="summary">
          <h3 class="serif summary__title">{{ t('checkout.orderSummary') }}</h3>
          <div class="between summary__row"><span class="muted">{{ t('cart.subtotal') }}</span><span class="price">{{ fmt(totals.subtotal) }}</span></div>
          <div class="between summary__row"><span class="muted">{{ t('cart.shipping') }}</span><span class="price">{{ totals.fee > 0 ? fmt(totals.fee) : t('cart.free') }}</span></div>
          <div class="between summary__row summary__total"><span>{{ t('cart.grandTotal') }}</span><span class="price price--lg">{{ fmt(totals.total) }}</span></div>
          <NuxtLink :to="localePath('/checkout')" class="btn btn--gold btn--block">{{ t('cart.checkout') }}</NuxtLink>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.empty { text-align: center; padding: 90px 20px; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.empty__title { font-size: 26px; margin: 18px 0 6px; }

.cartlayout { display: grid; grid-template-columns: 1fr 360px; gap: 60px; align-items: start; }
.cartitems__head { padding-bottom: 14px; border-bottom: 1px solid var(--line-strong); display: grid; grid-template-columns: 2.2fr 1fr 1fr 1fr 40px; gap: 16px; }
.cartitems__mid { text-align: left; }
.cartitems__end { text-align: right; }

.cline { display: grid; grid-template-columns: 96px 2.2fr 1fr 1fr 40px; gap: 18px; align-items: center; padding: 20px 0; border-bottom: 1px solid var(--line); }
.cline__img { width: 96px; height: 96px; background: var(--sand); border-radius: var(--radius); overflow: hidden; }
.cline__img img { width: 100%; height: 100%; object-fit: cover; }
.cline__info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.cline__name { font-family: var(--font-display); font-size: 17px; }
.cline__name:hover { color: var(--gold); }
.cline__end { text-align: right; }
.cline__remove { border: 0; background: transparent; color: var(--ink-faint); font-size: 20px; line-height: 1; }
.cline__remove:hover { color: var(--danger); }

.qty--lg { display: inline-flex; align-items: center; border: 1px solid var(--line-strong); border-radius: var(--radius); overflow: hidden; }
.qty--lg button { border: 0; background: transparent; width: 38px; height: 38px; font-size: 16px; color: var(--ink-soft); }
.qty--lg button:disabled { opacity: 0.3; }
.qty--lg span { min-width: 38px; text-align: center; font-size: 14px; }

.summary { border: 1px solid var(--line); background: var(--paper); padding: 28px; border-radius: var(--radius-lg); position: sticky; top: calc(var(--header-h) + 24px); }
.summary__title { font-size: 22px; margin-bottom: 20px; }
.summary__row { padding: 11px 0; font-size: 15px; }
.summary__total { border-top: 1px solid var(--line); margin-top: 8px; padding-top: 18px; letter-spacing: 0.08em; text-transform: uppercase; font-size: 13px; }
.summary .btn { margin-top: 18px; }

@media (max-width: 980px) {
  .cartlayout { grid-template-columns: 1fr; }
  .summary { position: static; }
}
@media (max-width: 720px) {
  .cartitems__head, .cline { grid-template-columns: 76px 1fr auto; }
  .cartitems__head .cartitems__mid, .cartitems__head .cartitems__end { display: none; }
  .cline .cline__info { grid-column: 2; }
  .cline .qty--lg { grid-column: 3; grid-row: 1; }
  .cline .cline__end { grid-column: 2; }
  .cline__remove { grid-column: 3; grid-row: 2; }
}
</style>
