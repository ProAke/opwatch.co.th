<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { site } = useSite()
const { customer, isAuthenticated } = useAuth()
const cart = useCart()
const toast = useToast()
const reqFetch = useRequestFetch()
const localeTag = computed(() => (locale.value === 'en' ? 'en-US' : 'th-TH'))

const fmt = (v: number) => formatPrice(v, site.value.currencySymbol, localeTag.value)

const { data: branchRes } = await useAsyncData('op-checkout-branches', () =>
  reqFetch<any>('/api/branches').catch(() => ({ items: [] }))
)
const branches = computed(() => (branchRes.value?.items || []).filter((b: any) => b.hasPickup !== false))

const deliveryMode = ref<'delivery' | 'pickup'>('delivery')
const selectedBranchSlug = ref('')

const form = reactive({
  name: customer.value?.name || '',
  email: customer.value?.email || '',
  phone: customer.value?.phone || '',
  address: customer.value?.address || '',
  city: customer.value?.city || '',
  postalCode: customer.value?.postalCode || '',
  country: 'ประเทศไทย (Thailand Only)',
  paymentMethod: 'offline' as 'offline' | 'card' | 'cod',
  giftWrap: false,
  giftMessage: '',
  note: ''
})

const couponInput = ref('')
const appliedCoupon = ref<{ code: string; discount: number; titleTh: string } | null>(null)
const savedCoupons = ref<string[]>([])
const pointsRedeemed = ref(0)

const errors = ref<Record<string, string>>({})
const placing = ref(false)
const placedOrder = ref<Record<string, any> | null>(null)

onMounted(() => {
  if (!cart.items.value.length && !placedOrder.value) {
    navigateTo(localePath('/cart'))
    return
  }
  try {
    const raw = localStorage.getItem('opwatch_saved_coupons')
    if (raw) savedCoupons.value = JSON.parse(raw)
  } catch {}
  if (branches.value.length) selectedBranchSlug.value = branches.value[0].slug
})

const subtotal = computed(() => cart.subtotal.value)
const shippingFee = computed(() => {
  if (deliveryMode.value === 'pickup') return 0
  const threshold = Number(site.value.freeShippingThreshold || 0)
  return threshold > 0 && subtotal.value >= threshold ? 0 : Number(site.value.shippingFee || 0)
})
const giftWrapFee = computed(() => (form.giftWrap ? Number(site.value.giftWrapFee || 0) : 0))
const memberFirstOrderDiscount = computed(() =>
  isAuthenticated.value && Number(customer.value?.totalSpent || 0) <= 0
    ? Math.round(subtotal.value * 0.1 * 100) / 100
    : 0
)
const couponDiscount = computed(() => Number(appliedCoupon.value?.discount || 0))
const maxRedeemablePoints = computed(() => {
  const avail = Number(customer.value?.points || 0)
  const cap = Math.max(0, Math.floor(subtotal.value - memberFirstOrderDiscount.value - couponDiscount.value))
  return Math.min(avail, cap)
})
const pointsDiscount = computed(() => Math.min(Math.max(0, Math.floor(Number(pointsRedeemed.value || 0))), maxRedeemablePoints.value))

const grandTotal = computed(() =>
  Math.max(0, subtotal.value + shippingFee.value + giftWrapFee.value - memberFirstOrderDiscount.value - couponDiscount.value - pointsDiscount.value)
)
const pointsEarnedPreview = computed(() => Math.floor(grandTotal.value / Number(site.value.bahtPerPoint || 25)))

async function applyCoupon(preset?: string) {
  const code = String(preset ?? couponInput.value).trim().toUpperCase()
  if (!code) return
  couponInput.value = code
  try {
    const res = await $fetch<any>('/api/coupons/validate', {
      method: 'POST',
      body: { code, subtotal: subtotal.value }
    })
    appliedCoupon.value = { code: res.coupon.code, discount: res.discount, titleTh: res.coupon.titleTh }
    toast.success(`ใช้โค้ด ${res.coupon.code} ลดทันที ${fmt(res.discount)}!`)
  } catch (e: any) {
    appliedCoupon.value = null
    toast.error(e?.data?.statusMessage || 'ไม่สามารถใช้รหัสคูปองนี้ได้')
  }
}

function validate(): boolean {
  errors.value = {}
  if (!form.name.trim()) errors.value.name = t('validation.required')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errors.value.email = t('validation.emailInvalid')
  if (!form.phone.trim()) errors.value.phone = t('validation.required')
  if (deliveryMode.value === 'delivery') {
    if (!form.address.trim()) errors.value.address = t('validation.required')
    if (!form.city.trim()) errors.value.city = t('validation.required')
  }
  return !Object.keys(errors.value).length
}

async function placeOrder() {
  if (!cart.items.value.length) return
  if (!validate()) return
  placing.value = true
  try {
    const pickedBranch = branches.value.find((b: any) => b.slug === selectedBranchSlug.value)
    const res = await $fetch<{ order: Record<string, any> }>('/api/orders', {
      method: 'POST',
      body: {
        items: cart.items.value.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          wristSize: i.wristSize
        })),
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: deliveryMode.value === 'pickup' ? `รับสินค้าที่สาขา: ${pickedBranch?.nameTh || selectedBranchSlug.value}` : form.address,
          city: deliveryMode.value === 'pickup' ? (pickedBranch?.province || 'กรุงเทพมหานคร') : form.city,
          postalCode: form.postalCode,
          country: form.country
        },
        paymentMethod: form.paymentMethod,
        couponCode: appliedCoupon.value?.code || '',
        pointsRedeemed: pointsDiscount.value,
        giftWrap: form.giftWrap,
        giftMessage: form.giftMessage,
        branchSlug: deliveryMode.value === 'pickup' ? selectedBranchSlug.value : '',
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
    else toast.error(err?.data?.statusMessage || t('errors.generic'))
  } finally {
    placing.value = false
  }
}

useHead({ title: `${t('checkout.title')} — ${site.value.name}` })
</script>

<template>
  <section class="section" style="padding-top: calc(var(--header-h) + 36px)">
    <div class="container">
      <!-- Success state -->
      <div v-if="placedOrder" class="success">
        <div class="success__icon">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m5 13 4 4L19 7" /></svg>
        </div>
        <p class="eyebrow" style="justify-content: center">{{ t('checkout.success') }}</p>
        <h1 class="page-title" style="text-align: center; margin: 14px 0 10px">{{ t('checkout.success') }}</h1>
        <p class="muted center" style="margin-bottom: 20px">{{ t('checkout.successBody') }}</p>
        <div class="success__no">{{ placedOrder.orderNo }}</div>

        <div class="summary" style="max-width: 520px; margin: 28px auto 0; position: static">
          <div class="between summary__row"><span class="muted">{{ t('checkout.items') }}</span><span class="price">{{ fmt(placedOrder.subtotal) }}</span></div>
          <div class="between summary__row"><span class="muted">{{ t('cart.shipping') }}</span><span class="price">{{ placedOrder.shippingFee > 0 ? fmt(placedOrder.shippingFee) : t('cart.free') }}</span></div>
          <div v-if="Number(placedOrder.discount) > 0" class="between summary__row"><span class="muted">{{ t('cart.discount') }}</span><span class="price" style="color: var(--success)">-{{ fmt(placedOrder.discount) }}</span></div>
          <div v-if="Number(placedOrder.pointsEarned) > 0" class="between summary__row"><span class="muted">คะแนนสะสมที่ได้รับ</span><span style="color:var(--sapphire);font-weight:700">+{{ placedOrder.pointsEarned }} OP Points</span></div>
          <div class="between summary__row summary__total"><span>{{ t('cart.grandTotal') }}</span><span class="price price--lg">{{ fmt(placedOrder.total) }}</span></div>
        </div>

        <div class="row gap-16 wrap" style="justify-content: center; margin-top: 28px">
          <NuxtLink :to="localePath(`/track?order=${placedOrder.orderNo}`)" class="btn">
            {{ locale === 'th' ? '🚚 ติดตามสถานะคำสั่งซื้อ' : '🚚 Track Order' }}
          </NuxtLink>
          <NuxtLink :to="localePath('/products')" class="btn btn--ghost">{{ t('checkout.backToShop') }}</NuxtLink>
        </div>
      </div>

      <!-- Checkout form -->
      <template v-else>
        <p class="eyebrow">{{ t('nav.cart') }}</p>
        <h1 class="page-title" style="margin: 12px 0 34px">{{ t('checkout.title') }}</h1>

        <div class="checkout">
          <div class="checkout__form">
            <!-- Contact -->
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
                  <input :value="locale === 'th' ? 'ประเทศไทยเท่านั้น (Thailand Only)' : 'Thailand Only'" class="input" readonly disabled />
                </div>
              </div>
            </div>

            <!-- Delivery vs Click & Collect Branch Pickup -->
            <div class="formblock">
              <h2 class="formblock__title">{{ locale === 'th' ? 'รูปแบบการรับสินค้า (จัดส่งถึงบ้าน / รับที่สาขาใกล้บ้าน)' : 'Fulfillment Method' }}</h2>
              <div class="formgrid" style="margin-bottom: 18px">
                <label class="payopt" :class="{ 'is-active': deliveryMode === 'delivery' }">
                  <input v-model="deliveryMode" type="radio" value="delivery" class="sr-only" />
                  <span>🚚 {{ locale === 'th' ? 'จัดส่งด่วนถึงบ้านทั่วไทย (EMS / Kerry)' : 'Express Thailand Home Delivery' }}</span>
                </label>
                <label class="payopt" :class="{ 'is-active': deliveryMode === 'pickup' }">
                  <input v-model="deliveryMode" type="radio" value="pickup" class="sr-only" />
                  <span>📍 {{ locale === 'th' ? 'รับที่สาขาใกล้บ้านฟรี (Click & Collect)' : 'Free Nearby Branch Pickup' }}</span>
                </label>
              </div>

              <div v-if="deliveryMode === 'delivery'">
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

              <div v-else class="field">
                <label class="label">{{ locale === 'th' ? 'เลือกสาขาที่ต้องการเข้าไปรับสินค้าพร้อมบริการตัดสายฟรี:' : 'Select Pickup Branch:' }}</label>
                <select v-model="selectedBranchSlug" class="select">
                  <option v-for="b in branches" :key="b.slug" :value="b.slug">
                    {{ b.nameTh }} ({{ b.province }} · โทร {{ b.phone }})
                  </option>
                </select>
              </div>
            </div>

            <!-- Gift Wrapping Service -->
            <div v-if="site.giftWrapEnabled !== false" class="formblock">
              <h2 class="formblock__title">🎁 {{ locale === 'th' ? 'บริการห่อของขวัญ & การ์ดอวยพรพิเศษ' : 'Luxury Gift Wrapping' }}</h2>
              <label class="payopt" :class="{ 'is-active': form.giftWrap }">
                <input v-model="form.giftWrap" type="checkbox" style="width:18px;height:18px" />
                <span>
                  {{
                    locale === 'th'
                      ? `รับบริการห่อของขวัญโบว์ซาติน Royal Sapphire พร้อมการ์ดอวยพร (${Number(site.giftWrapFee || 0) > 0 ? fmt(Number(site.giftWrapFee)) : 'ฟรี!'})`
                      : 'Add Luxury Royal Sapphire Gift Wrapping & Greeting Card'
                  }}
                </span>
              </label>
              <div v-if="form.giftWrap" class="field" style="margin-top: 10px">
                <label class="label">{{ locale === 'th' ? 'ข้อความบนการ์ดอวยพร (ไม่บังคับ)' : 'Personalised Gift Card Message' }}</label>
                <input v-model="form.giftMessage" class="input" placeholder="เช่น สุขสันต์วันเกิด ขอให้มีความสุขในทุกช่วงเวลาสำคัญ..." />
              </div>
            </div>

            <!-- Payment -->
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
              <textarea v-model="form.note" class="textarea" placeholder="หมายเหตุเพิ่มเติม เช่น ขอใบกำกับภาษีเต็มรูปแบบ (ระบุชื่อ/เลขผู้เสียภาษี)..." />
            </div>
          </div>

          <!-- Order Summary + Coupons + Gift Cards + OP Points -->
          <aside class="summary">
            <h3 class="serif summary__title">{{ t('checkout.orderSummary') }}</h3>
            <div class="summary__items">
              <div v-for="line in cart.items.value" :key="line.productId" class="sumline">
                <div class="sumline__img">
                  <img
                    :src="line.image || '/images/op/watch-990-083-blue.png'"
                    :alt="line.name"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                    @error="(e: any) => { if (e?.target) e.target.src = '/images/op/watch-990-083-blue.png' }"
                  />
                </div>
                <div class="sumline__info">
                  <span class="sumline__name">{{ locale === 'en' ? line.nameEn : line.nameTh }}</span>
                  <span class="tiny upper faint">{{ line.sku }} × {{ line.quantity }}</span>
                  <span v-if="line.wristSize" class="tiny muted">ขนาดสาย: {{ line.wristSize }}</span>
                </div>
                <span class="price">{{ fmt(line.price * line.quantity) }}</span>
              </div>
            </div>

            <!-- Coupon / Gift Card Box -->
            <div class="coupon-box">
              <label class="tiny upper" style="font-weight:700">{{ locale === 'th' ? 'คูปองส่วนลด / บัตรของขวัญ Gift Card' : 'Promo Code / Gift Card' }}</label>
              <div style="display:flex;gap:6px;margin-top:6px">
                <input v-model="couponInput" class="input" placeholder="เช่น OPWELCOME300, GIFT1000" style="padding:8px 10px;font-size:13px" />
                <button type="button" class="btn btn--sm" @click="applyCoupon()">{{ locale === 'th' ? 'ใช้โค้ด' : 'Apply' }}</button>
              </div>
              <div v-if="savedCoupons.length" style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px">
                <button
                  v-for="sc in savedCoupons"
                  :key="sc"
                  type="button"
                  style="font-size:11px;padding:2px 8px;border-radius:4px;border:1px dashed var(--sapphire);background:#eef0ff;color:var(--sapphire);cursor:pointer"
                  @click="applyCoupon(sc)"
                >
                  {{ sc }}
                </button>
              </div>
            </div>

            <!-- OP Loyalty Points Redemption -->
            <div v-if="isAuthenticated && Number(customer?.points || 0) > 0" class="coupon-box" style="margin-top:10px">
              <div class="between tiny">
                <strong>💎 ใช้คะแนน OP Points (มี {{ customer?.points }} คะแนน)</strong>
                <span>1 คะแนน = ฿1</span>
              </div>
              <input
                v-model.number="pointsRedeemed"
                type="number"
                min="0"
                :max="maxRedeemablePoints"
                class="input"
                style="margin-top:6px;padding:7px 10px;font-size:13px"
                placeholder="ระบุจำนวนคะแนนที่ต้องการใช้ลด"
              />
            </div>

            <div class="between summary__row"><span class="muted">{{ t('cart.subtotal') }}</span><span class="price">{{ fmt(subtotal) }}</span></div>
            <div v-if="memberFirstOrderDiscount > 0" class="between summary__row"><span class="muted">ส่วนลดสมาชิกใหม่ (10%)</span><span class="price" style="color: var(--success)">-{{ fmt(memberFirstOrderDiscount) }}</span></div>
            <div v-if="couponDiscount > 0" class="between summary__row"><span class="muted">คูปอง ({{ appliedCoupon?.code }})</span><span class="price" style="color: var(--success)">-{{ fmt(couponDiscount) }}</span></div>
            <div v-if="pointsDiscount > 0" class="between summary__row"><span class="muted">แลกคะแนนสะสม</span><span class="price" style="color: var(--success)">-{{ fmt(pointsDiscount) }}</span></div>
            <div v-if="form.giftWrap" class="between summary__row"><span class="muted">บริการห่อของขวัญ</span><span class="price">{{ giftWrapFee > 0 ? fmt(giftWrapFee) : 'ฟรี' }}</span></div>
            <div class="between summary__row"><span class="muted">{{ t('cart.shipping') }}</span><span class="price">{{ shippingFee > 0 ? fmt(shippingFee) : t('cart.free') }}</span></div>
            <div class="between summary__row"><span class="muted">คะแนนที่จะได้รับ</span><span style="color:var(--sapphire);font-weight:700">+{{ pointsEarnedPreview }} OP Points</span></div>
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
.checkout { display: grid; grid-template-columns: 1fr 400px; gap: 48px; align-items: start; }
.formblock { padding-bottom: 28px; margin-bottom: 28px; border-bottom: 1px solid var(--line); }
.formblock:last-child { border-bottom: 0; }
.formblock__title { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
.formgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.payopt { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border: 1px solid var(--line-strong); border-radius: var(--radius); margin-bottom: 8px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
.payopt:hover { border-color: var(--sapphire); }
.payopt.is-active { border-color: var(--sapphire); background: #f2f4ff; }
.payopt__box { display: inline-flex; width: 20px; height: 20px; align-items: center; justify-content: center; color: var(--sapphire); border: 1px solid var(--line-strong); border-radius: 50%; }

.summary { border: 1px solid var(--line-strong); background: var(--paper); padding: 24px; border-radius: var(--radius-lg); position: sticky; top: calc(var(--header-h) + 20px); }
.summary__title { font-size: 21px; margin-bottom: 14px; }
.summary__items { display: flex; flex-direction: column; gap: 12px; padding-bottom: 14px; margin-bottom: 12px; border-bottom: 1px solid var(--line); }
.sumline { display: grid; grid-template-columns: 46px 1fr auto; gap: 10px; align-items: center; }
.sumline__img { width: 46px; height: 46px; background: #ffffff; border: 1px solid var(--line); padding: 3px; border-radius: var(--radius); overflow: hidden; }
.sumline__img img { width: 100%; height: 100%; object-fit: contain; }
.sumline__info { display: flex; flex-direction: column; min-width: 0; }
.sumline__name { font-family: var(--font-display); font-size: 13.5px; }
.coupon-box { background: #ffffff; border: 1px solid var(--line); border-radius: 8px; padding: 12px; margin-bottom: 8px; }
.summary__row { padding: 8px 0; font-size: 14px; }
.summary__total { border-top: 1px solid var(--line); margin-top: 8px; padding-top: 16px; letter-spacing: 0.06em; text-transform: uppercase; font-size: 13px; font-weight: 700; }

.success { max-width: 620px; margin: 0 auto; text-align: center; padding-block: 36px; }
.success__icon { width: 66px; height: 66px; border-radius: 50%; background: #eef5f1; color: var(--success); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
.success__no { font-family: var(--font-display); font-size: 26px; letter-spacing: 0.1em; background: #eef0ff; color: var(--sapphire); padding: 12px 24px; border-radius: var(--radius); display: inline-block; }

@media (max-width: 980px) {
  .checkout { grid-template-columns: 1fr; }
  .summary { position: static; }
}
@media (max-width: 620px) {
  .formgrid { grid-template-columns: 1fr; }
}
</style>
