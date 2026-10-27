<script setup lang="ts">
const { t, locale} = useI18n()
const localePath = useLocalePath()
const { site } = useSite()
const { customer, isAuthenticated } = useAuth()
const cart = useCart()
const route = useRoute()
const localeTag = computed(() => (locale.value === 'en' ? 'en-US' : 'th-TH'))

const fmt = (v: number) => formatPrice(v, site.value.currencySymbol, localeTag.value)

const form = reactive({
  name: customer.value?.name || '',
  email: customer.value?.email || '',
  phone: customer.value?.phone || '',
  address: customer.value?.address || '',
  city: customer.value?.city || '',
  postalCode: customer.value?.postalCode || '',
  country: customer.value?.country || 'Thailand',
  paymentMethod: 'offline' as 'offline' | 'card' | 'cod',
  note: ''
})

const errors = ref<Record<string, string>>({})
const placing = ref(false)
const placedOrder = ref<Record<string, any> | null>(null)

const totals = computed(() => {
  const subtotal = cart.subtotal.value
  const threshold = Number(site.value.freeShippingThreshold || 0)
  const fee = threshold > 0 && subtotal >= threshold ? 0 : Number(site.value.shippingFee || 0)
  return { subtotal, fee, total: subtotal + fee }
})

const memberDiscount = computed(() => {
  // New members get 10% off their first order — shown when signed in.
  return isAuthenticated.value && Number(customer.value?.totalSpent || 0) <= 0 ? Math.round(totals.value.subtotal * 0.1 * 100) / 100 : 0
})

const grandTotal = computed(() => Math.max(0, totals.value.total - memberDiscount.value))

function validate(): boolean {
  errors.value = {}
  if (!form.name.trim()) errors.value.name = t('validation.required')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errors.value.email = t('validation.emailInvalid')
  if (!form.phone.trim()) errors.value.phone = t('validation.required')
  if (!form.address.trim()) errors.value.address = t('validation.required')
  if (!form.city.trim()) errors.value.city = t('validation.required')
  return !Object.keys(errors.value).length
}

async function placeOrder() {
  if (!cart.items.value.length) return
  if (!validate()) return
  placing.value = true
  try {
    const res = await $fetch<{ order: Record<string, any> }>('/api/orders', {
      method: 'POST',
      body: {
        items: cart.items.value.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country
        },
        paymentMethod: form.paymentMethod,
        note: form.note
      },
      headers: { 'x-locale': locale.value }
    })
    placedOrder.value = res.order
    cart.clear()
    await useAuth().refresh()
  } catch (err: any) {
    const data = err?.data?.errors
    if (data) errors.value = { ...errors.value, ...data }
    else useToast().error(t('errors.generic'))
  } finally {
    placing.value = false
  }
}

useHead({ title: `${t('checkout.title')} — ${site.value.name}` })

// If the cart is empty and no order was just placed, redirect to the cart.
onMounted(() => {
  if (!cart.items.value.length && !placedOrder.value) {
    navigateTo(localePath('/cart'))
  }
})
</script>

<template>
  <section class="section">
    <div class="container">
      <!-- Success state -->
      <div v-if="placedOrder" class="success">
        <div class="success__icon">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m5 13 4 4L19 7" /></svg>
        </div>
        <p class="eyebrow" style="justify-content: center">{{ t('checkout.success') }}</p>
        <h1 class="page-title" style="text-align: center; margin: 14px 0 10px">{{ t('checkout.success') }}</h1>
        <p class="muted center" style="margin-bottom: 26px">{{ t('checkout.successBody') }}</p>
        <div class="success__no">{{ placedOrder.orderNo }}</div>

        <div class="summary" style="max-width: 520px; margin: 34px auto 0">
          <div class="between summary__row"><span class="muted">{{ t('checkout.items') }}</span><span class="price">{{ fmt(placedOrder.subtotal) }}</span></div>
          <div class="between summary__row"><span class="muted">{{ t('cart.shipping') }}</span><span class="price">{{ placedOrder.shippingFee > 0 ? fmt(placedOrder.shippingFee) : t('cart.free') }}</span></div>
          <div v-if="Number(placedOrder.discount) > 0" class="between summary__row"><span class="muted">{{ t('cart.discount') }}</span><span class="price" style="color: var(--success)">-{{ fmt(placedOrder.discount) }}</span></div>
          <div class="between summary__row summary__total"><span>{{ t('cart.grandTotal') }}</span><span class="price price--lg">{{ fmt(placedOrder.total) }}</span></div>
        </div>

        <div class="row gap-16" style="justify-content: center; margin-top: 34px">
          <NuxtLink :to="localePath('/account/orders/' + placedOrder.orderNo)" class="btn">{{ t('checkout.viewOrder') }}</NuxtLink>
          <NuxtLink :to="localePath('/products')" class="btn btn--ghost">{{ t('checkout.backToShop') }}</NuxtLink>
        </div>
      </div>

      <!-- Checkout form -->
      <template v-else>
        <p class="eyebrow">{{ t('nav.cart') }}</p>
        <h1 class="page-title" style="margin: 14px 0 44px">{{ t('checkout.title') }}</h1>

        <div class="checkout">
          <div class="checkout__form">
            <div class="formblock">
              <h2 class="formblock__title">{{ t('checkout.contact') }}</h2>
              <div class="formgrid">
                <div class="field">
                  <label class="label">{{ t('checkout.fullName') }}</label>
                  <input v-model="form.name" class="input" :class="{ 'input--error': errors.name }" />
                  <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
                </div>
                <div class="field">
                  <label class="label">{{ t('checkout.email') }}</label>
                  <input v-model="form.email" type="email" class="input" :class="{ 'input--error': errors.email }" />
                  <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
                </div>
                <div class="field">
                  <label class="label">{{ t('checkout.phone') }}</label>
                  <input v-model="form.phone" class="input" :class="{ 'input--error': errors.phone }" />
                  <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
                </div>
                <div class="field">
                  <label class="label">{{ t('checkout.country') }}</label>
                  <input v-model="form.country" class="input" />
                </div>
              </div>
            </div>

            <div class="formblock">
              <h2 class="formblock__title">{{ t('checkout.shippingAddress') }}</h2>
              <div class="field" style="margin-bottom: 14px">
                <label class="label">{{ t('checkout.address') }}</label>
                <input v-model="form.address" class="input" :class="{ 'input--error': errors.address }" />
                <span v-if="errors.address" class="field-error">{{ errors.address }}</span>
              </div>
              <div class="formgrid">
                <div class="field">
                  <label class="label">{{ t('checkout.city') }}</label>
                  <input v-model="form.city" class="input" :class="{ 'input--error': errors.city }" />
                  <span v-if="errors.city" class="field-error">{{ errors.city }}</span>
                </div>
                <div class="field">
                  <label class="label">{{ t('checkout.postalCode') }}</label>
                  <input v-model="form.postalCode" class="input" />
                </div>
              </div>
            </div>

            <div class="formblock">
              <h2 class="formblock__title">{{ t('checkout.payment') }}</h2>
              <label v-for="m in ['offline', 'card', 'cod']" :key="m" class="payopt" :class="{ 'is-active': form.paymentMethod === m }">
                <input v-model="form.paymentMethod" type="radio" :value="m" class="sr-only" />
                <span class="payopt__box">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" />
                  </svg>
                </span>
                <span>{{ t('checkout.payment' + m.charAt(0).toUpperCase() + m.slice(1)) }}</span>
              </label>
            </div>

            <div class="formblock">
              <h2 class="formblock__title">{{ t('checkout.note') }}</h2>
              <textarea v-model="form.note" class="textarea" />
            </div>
          </div>

          <aside class="summary">
            <h3 class="serif summary__title">{{ t('checkout.orderSummary') }}</h3>
            <div class="summary__items">
              <div v-for="line in cart.items.value" :key="line.productId" class="sumline">
                <div class="sumline__img"><img :src="line.image" :alt="line.name" loading="lazy" /></div>
                <div class="sumline__info">
                  <span class="sumline__name">{{ locale === 'en' ? line.nameEn : line.nameTh }}</span>
                  <span class="tiny upper faint">{{ line.sku }} · {{ line.quantity }}</span>
                </div>
                <span class="price">{{ fmt(line.price * line.quantity) }}</span>
              </div>
            </div>
            <div class="between summary__row"><span class="muted">{{ t('cart.subtotal') }}</span><span class="price">{{ fmt(totals.subtotal) }}</span></div>
            <div v-if="memberDiscount > 0" class="between summary__row"><span class="muted">{{ t('cart.discount') }} (10%)</span><span class="price" style="color: var(--success)">-{{ fmt(memberDiscount) }}</span></div>
            <div class="between summary__row"><span class="muted">{{ t('cart.shipping') }}</span><span class="price">{{ totals.fee > 0 ? fmt(totals.fee) : t('cart.free') }}</span></div>
            <div class="between summary__row summary__total"><span>{{ t('cart.grandTotal') }}</span><span class="price price--lg">{{ fmt(grandTotal) }}</span></div>

            <button class="btn btn--gold btn--block" :disabled="placing" @click="placeOrder">
              {{ placing ? t('checkout.placing') : t('checkout.placeOrder') }}
            </button>
            <NuxtLink :to="localePath('/cart')" class="btn btn--ghost btn--block" style="margin-top: 10px">{{ t('common.back') }}</NuxtLink>
          </aside>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.checkout { display: grid; grid-template-columns: 1fr 380px; gap: 60px; align-items: start; }
.formblock { padding-bottom: 34px; margin-bottom: 34px; border-bottom: 1px solid var(--line); }
.formblock:last-child { border-bottom: 0; }
.formblock__title { font-size: 20px; margin-bottom: 20px; }
.formgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.payopt { display: flex; align-items: center; gap: 12px; padding: 16px 18px; border: 1px solid var(--line-strong); border-radius: var(--radius); margin-bottom: 10px; cursor: pointer; transition: all 0.2s; font-size: 15px; }
.payopt:hover { border-color: var(--ink); }
.payopt.is-active { border-color: var(--gold); background: var(--gold-tint); }
.payopt__box { display: inline-flex; width: 20px; height: 20px; align-items: center; justify-content: center; color: var(--gold); border: 1px solid var(--line-strong); border-radius: 50%; }
.payopt.is-active .payopt__box { border-color: var(--gold); }

.summary { border: 1px solid var(--line); background: var(--paper); padding: 28px; border-radius: var(--radius-lg); position: sticky; top: calc(var(--header-h) + 24px); }
.summary__title { font-size: 22px; margin-bottom: 18px; }
.summary__items { display: flex; flex-direction: column; gap: 14px; padding-bottom: 18px; margin-bottom: 8px; border-bottom: 1px solid var(--line); }
.sumline { display: grid; grid-template-columns: 48px 1fr auto; gap: 12px; align-items: center; }
.sumline__img { width: 48px; height: 48px; background: var(--sand); border-radius: var(--radius); overflow: hidden; }
.sumline__img img { width: 100%; height: 100%; object-fit: cover; }
.sumline__info { display: flex; flex-direction: column; min-width: 0; }
.sumline__name { font-family: var(--font-display); font-size: 14px; }
.summary__row { padding: 10px 0; font-size: 15px; }
.summary__total { border-top: 1px solid var(--line); margin-top: 8px; padding-top: 18px; letter-spacing: 0.08em; text-transform: uppercase; font-size: 13px; }

.success { max-width: 620px; margin: 0 auto; text-align: center; padding-block: 40px; }
.success__icon { width: 66px; height: 66px; border-radius: 50%; background: #eef5f1; color: var(--success); display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
.success__no { font-family: var(--font-display); font-size: 26px; letter-spacing: 0.1em; background: var(--gold-tint); color: var(--gold); padding: 14px 24px; border-radius: var(--radius); display: inline-block; }

@media (max-width: 980px) {
  .checkout { grid-template-columns: 1fr; }
  .summary { position: static; }
}
@media (max-width: 620px) {
  .formgrid { grid-template-columns: 1fr; }
}
</style>
