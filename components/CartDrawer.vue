<script setup lang="ts">
const { t, locale} = useI18n()
const localePath = useLocalePath()
const { site } = useSite()
const cart = useCart()

const fmt = (v: number) => formatPrice(v, site.value.currencySymbol, locale.value === 'en' ? 'en-US' : 'th-TH')

const totals = computed(() => {
  const subtotal = cart.subtotal.value
  const threshold = Number(site.value.freeShippingThreshold || 0)
  const fee = threshold > 0 && subtotal - 0 >= threshold ? 0 : Number(site.value.shippingFee || 0)
  return { subtotal, fee, total: subtotal + fee }
})

const remainingForFreeShipping = computed(() => {
  const threshold = Number(site.value.freeShippingThreshold || 0)
  if (threshold <= 0) return 0
  return Math.max(0, threshold - cart.subtotal.value)
})
</script>

<template>
  <Teleport to="body">
    <div class="drawer" :class="{ 'is-open': cart.drawerOpen.value }">
      <div class="drawer__scrim" @click="cart.drawerOpen.value = false" />
      <aside class="drawer__panel" :aria-hidden="!cart.drawerOpen.value">
        <header class="dhead">
          <h3 class="serif">{{ t('cart.title') }}</h3>
          <button class="dclose" :aria-label="t('common.close')" @click="cart.drawerOpen.value = false">×</button>
        </header>

        <p v-if="remainingForFreeShipping > 0" class="dship tiny upper">
          {{ t('cart.progress', { amount: fmt(remainingForFreeShipping) }) }}
        </p>

        <div class="dbody">
          <div v-if="!cart.items.value.length" class="dempty">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
              <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
              <circle cx="9" cy="21" r="1.2" /><circle cx="18" cy="21" r="1.2" />
            </svg>
            <p class="muted">{{ t('cart.empty') }}</p>
            <NuxtLink :to="localePath('/products')" class="btn btn--ghost btn--sm" @click="cart.drawerOpen.value = false">
              {{ t('cart.emptyButton') }}
            </NuxtLink>
          </div>

          <div v-for="line in cart.items.value" :key="line.productId" class="dline">
            <NuxtLink :to="localePath('/products/' + line.slug)" class="dline__img" @click="cart.drawerOpen.value = false">
              <img :src="line.image" :alt="line.name" loading="lazy" />
            </NuxtLink>
            <div class="dline__main">
              <NuxtLink :to="localePath('/products/' + line.slug)" class="dline__name" @click="cart.drawerOpen.value = false">
                {{ locale === 'en' ? line.nameEn : line.nameTh }}
              </NuxtLink>
              <div class="dline__price">{{ fmt(line.price) }}</div>
              <div class="qty">
                <button @click="cart.setQuantity(line.productId, line.quantity - 1)" aria-label="−">−</button>
                <span>{{ line.quantity }}</span>
                <button :disabled="line.quantity >= line.maxStock" @click="cart.setQuantity(line.productId, line.quantity + 1)" aria-label="+">+</button>
              </div>
            </div>
            <button class="dline__remove" :aria-label="t('cart.remove')" @click="cart.remove(line.productId)">×</button>
          </div>
        </div>

        <footer v-if="cart.items.value.length" class="dfoot">
          <div class="between dline--sm">
            <span class="muted">{{ t('cart.subtotal') }}</span>
            <span class="price">{{ fmt(totals.subtotal) }}</span>
          </div>
          <div class="between dline--sm">
            <span class="muted">{{ t('cart.shipping') }}</span>
            <span class="price">{{ totals.fee > 0 ? fmt(totals.fee) : t('cart.free') }}</span>
          </div>
          <div class="between dline--sm dtotal">
            <span>{{ t('cart.grandTotal') }}</span>
            <span class="price price--lg">{{ fmt(totals.total) }}</span>
          </div>
          <NuxtLink :to="localePath('/checkout')" class="btn btn--gold btn--block" @click="cart.drawerOpen.value = false">
            {{ t('cart.checkout') }}
          </NuxtLink>
          <div class="between" style="padding-top: 4px">
            <NuxtLink :to="localePath('/cart')" class="link-underline" @click="cart.drawerOpen.value = false">
              {{ t('common.viewCart') }}
            </NuxtLink>
            <button class="dfoot__continue" @click="cart.drawerOpen.value = false">
              {{ t('cart.continueShopping') }}
            </button>
          </div>
        </footer>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.drawer { position: fixed; inset: 0; z-index: 150; pointer-events: none; }
.drawer.is-open { pointer-events: auto; }
.drawer__scrim {
  position: absolute;
  inset: 0;
  background: rgba(28, 26, 23, 0.34);
  opacity: 0;
  transition: opacity 0.3s var(--ease);
}
.drawer.is-open .drawer__scrim { opacity: 1; }
.drawer__panel {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 420px;
  max-width: 92vw;
  background: var(--paper);
  border-left: 1px solid var(--line);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.4s var(--ease);
}
.drawer.is-open .drawer__panel { transform: translateX(0); }
.dhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 24px;
  border-bottom: 1px solid var(--line);
}
.dhead h3 { font-size: 20px; }
.dclose { border: 0; background: transparent; font-size: 24px; line-height: 1; color: var(--ink-muted); }
.dship { padding: 10px 24px; background: var(--gold-tint); color: var(--gold); }
.dbody { flex: 1; overflow-y: auto; padding: 8px 24px; }
.dempty { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; color: var(--ink-muted); }

.dline { display: grid; grid-template-columns: 74px 1fr auto; gap: 14px; padding: 16px 0; border-bottom: 1px solid var(--line); align-items: start; }
.dline__img { width: 74px; height: 74px; background: var(--sand); border-radius: var(--radius); overflow: hidden; }
.dline__img img { width: 100%; height: 100%; object-fit: cover; }
.dline__main { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.dline__name { font-family: var(--font-display); font-size: 15px; line-height: 1.3; }
.dline__name:hover { color: var(--gold); }
.dline__price { font-size: 13px; color: var(--ink-muted); }
.qty { display: inline-flex; align-items: center; border: 1px solid var(--line-strong); border-radius: 999px; width: fit-content; margin-top: 4px; }
.qty button { border: 0; background: transparent; width: 26px; height: 26px; font-size: 15px; color: var(--ink-soft); }
.qty button:disabled { opacity: 0.3; }
.qty span { min-width: 26px; text-align: center; font-size: 13px; }
.dline__remove { border: 0; background: transparent; color: var(--ink-faint); font-size: 17px; line-height: 1; padding: 2px 4px; }
.dline__remove:hover { color: var(--danger); }

.dfoot { border-top: 1px solid var(--line); padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 12px; }
.dline--sm { font-size: 14px; }
.dtotal { padding-top: 12px; border-top: 1px solid var(--line); font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; }
.dfoot__continue { border: 0; background: transparent; color: var(--ink-muted); font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; padding: 6px; }
.dfoot__continue:hover { color: var(--gold); }
</style>
