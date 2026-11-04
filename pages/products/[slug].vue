<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const cart = useCart()
const { site } = useSite()
const toast = useToast()
const reqFetch = useRequestFetch()

const fmt = (v: number) =>
  formatPrice(Number(v || 0), site.value.currencySymbol, locale.value === 'en' ? 'en-US' : 'th-TH')

const slug = computed(() => String(route.params.slug || ''))

const { data: res, error } = await useAsyncData(
  () => `op-product-${slug.value}`,
  async () => {
    const [prod, promos, branchData] = await Promise.all([
      reqFetch<any>(`/api/products/${slug.value}`),
      reqFetch<any>('/api/promotions').catch(() => ({ coupons: [] })),
      reqFetch<any>('/api/branches').catch(() => ({ items: [] }))
    ])
    return {
      ...prod,
      coupons: (promos?.coupons || []).filter((c: any) => !c.isGiftCard).slice(0, 3),
      branches: branchData?.items || []
    }
  },
  { watch: [slug] }
)

const product = computed(() => res.value?.product || res.value)
const related = computed(() => res.value?.related || [])
const coupons = computed(() => res.value?.coupons || [])
const branches = computed(() => res.value?.branches || [])

const images = computed(() => {
  const p = product.value || {}
  const list = Array.isArray(p.images) ? p.images.filter(Boolean) : []
  if (list.length) return list
  if (p.image) return p.hoverImage ? [p.image, p.hoverImage] : [p.image]
  return ['/images/op/watch-990-083-blue.png']
})
const activeImg = ref(0)
const zoomOpen = ref(false)
const activeTab = ref<'specs' | 'delivery' | 'reviews'>('specs')
const wristSize = ref('มาตรฐาน (ไม่ตัดสาย)')
const branchModal = ref(false)
const savedCoupons = ref<string[]>([])

watch(slug, () => {
  activeImg.value = 0
  zoomOpen.value = false
})

onMounted(() => {
  try {
    const raw = localStorage.getItem('opwatch_saved_coupons')
    if (raw) savedCoupons.value = JSON.parse(raw)
  } catch {}
})

const qty = ref(1)

const title = computed(() => {
  if (!product.value) return ''
  return locale.value === 'en' && product.value.nameEn
    ? product.value.nameEn
    : product.value.nameTh || product.value.nameEn
})

const description = computed(() => {
  if (!product.value) return ''
  return locale.value === 'en' && product.value.descriptionEn
    ? product.value.descriptionEn
    : product.value.descriptionTh || product.value.descriptionEn
})

const hasHtmlDescription = computed(() => /<[a-z][\s\S]*>/i.test(description.value || ''))

const compareAt = computed(() => Number(product.value?.originalPrice ?? product.value?.priceCompare ?? product.value?.comparePrice ?? 0))
const discountPct = computed(() => {
  const cur = Number(product.value?.price || 0)
  if (compareAt.value > cur && cur > 0) return Math.round(((compareAt.value - cur) / compareAt.value) * 100)
  return 0
})
const savingsAmt = computed(() => (discountPct.value > 0 ? compareAt.value - Number(product.value?.price || 0) : 0))
const pointsEarn = computed(() => Math.floor(Number(product.value?.price || 0) / Number(site.value.bahtPerPoint || 25)))

const specRows = computed(() => {
  const p = product.value || {}
  const specs = p.specs && typeof p.specs === 'object' ? p.specs : {}
  const entries = Object.entries(specs).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
  if (entries.length > 0) {
    return entries.map(([label, value]) => ({ label, value: String(value) }))
  }
  return [
    { label: 'Brand', value: p.brandName || p.brandSlug || 'Olym Pianus' },
    { label: 'Model / Reference', value: p.sku || p.slug || '—' },
    { label: 'Movement', value: p.movement || 'Automatic / Precision Caliber' },
    { label: 'Crystal', value: 'Sapphire Crystal (กระจกแซฟไฟร์แท้)' },
    { label: 'Case Material', value: '316L Surgical Stainless Steel' },
    { label: 'Warranty', value: locale.value === 'th' ? 'รับประกันศูนย์ไทย 2 ปีเต็ม (บริษัท อินเตอร์ไทมส์ จำกัด)' : '2-Year Official Thailand Warranty (Inter Times Co., Ltd.)' }
  ]
})

const aseoFaqs = computed(() => {
  const list = product.value?.aseoFaqs
  return Array.isArray(list) ? list.filter((f: any) => f.q && f.a) : []
})

function collectCoupon(code: string) {
  if (!import.meta.client || !code) return
  if (!savedCoupons.value.includes(code)) {
    savedCoupons.value.push(code)
    localStorage.setItem('opwatch_saved_coupons', JSON.stringify(savedCoupons.value))
  }
  navigator.clipboard?.writeText(code).catch(() => {})
  toast.success(locale.value === 'th' ? `เก็บคูปอง ${code} แล้ว ใช้ลดหน้าชำระเงินได้ทันที!` : `Saved coupon ${code}!`)
}

function onDetailImgError(e: Event) {
  const el = e.target as HTMLImageElement | null
  if (!el) return
  if (activeImg.value < images.value.length - 1) {
    activeImg.value += 1
  } else {
    el.src = '/images/op/watch-990-083-blue.png'
  }
}

function addItemToCart(goCheckout = false) {
  if (!product.value) return
  cart.add(
    {
      productId: Number(product.value.id),
      slug: product.value.slug,
      name: product.value.name || title.value,
      nameEn: product.value.nameEn || title.value,
      nameTh: product.value.nameTh || title.value,
      price: Number(product.value.price || 0),
      originalPrice: compareAt.value || null,
      image: images.value[0],
      maxStock: Number(product.value.stock ?? 99),
      sku: product.value.sku,
      wristSize: wristSize.value !== 'มาตรฐาน (ไม่ตัดสาย)' ? wristSize.value : undefined
    },
    qty.value
  )
  if (goCheckout) {
    navigateTo(localePath('/checkout'))
  }
}

// SEO + ASEO JSON-LD (Product + Offer + FAQPage)
useHead(() => {
  const p = product.value
  if (!p) return { title: 'Timepiece — OPWatch Thailand' }
  const seoTitle = p.seoTitle || `${title.value} (${p.sku || ''}) ของแท้ศูนย์ไทย — OPWatch`
  const seoDesc = p.seoDescription || (description.value || '').replace(/<[^>]+>/g, '').slice(0, 160)
  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title.value,
    sku: p.sku || p.slug,
    image: images.value,
    description: p.aseoSummary || seoDesc,
    brand: { '@type': 'Brand', name: p.brandName || p.brandSlug || 'Olym Pianus' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'THB',
      price: Number(p.price || 0),
      availability: Number(p.stock ?? 1) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'บริษัท อินเตอร์ไทมส์ จำกัด (OPWatch Thailand)' }
    }
  }
  const scripts: any[] = [{ type: 'application/ld+json', innerHTML: JSON.stringify(productLd) }]
  if (aseoFaqs.value.length) {
    scripts.push({
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: aseoFaqs.value.map((f: any) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a }
        }))
      })
    })
  }
  return {
    title: seoTitle,
    meta: [
      { name: 'description', content: seoDesc },
      ...(p.seoKeywords ? [{ name: 'keywords', content: p.seoKeywords }] : [])
    ],
    script: scripts
  }
})
</script>

<template>
  <div class="op-detail">
    <div v-if="error || !product" class="container section center" style="padding-top:140px">
      <h2>{{ locale === 'th' ? 'ไม่พบข้อมูลเรือนเวลาที่ค้นหา' : 'Timepiece Not Found' }}</h2>
      <p class="muted" style="margin-block: 12px 24px">
        {{ locale === 'th' ? 'กรุณาเลือกชมคอลเลกชันอื่นในบูติกของเรา' : 'Please explore our full boutique catalogue.' }}
      </p>
      <NuxtLink :to="localePath('/products')" class="btn">Collections</NuxtLink>
    </div>

    <template v-else>
      <!-- Breadcrumb Bar -->
      <div class="op-detail__crumb">
        <div class="container op-detail__crumb-row">
          <NuxtLink :to="localePath('/')">Home</NuxtLink>
          <span>/</span>
          <NuxtLink :to="localePath('/products')">Collections</NuxtLink>
          <template v-if="product.brandSlug">
            <span>/</span>
            <NuxtLink :to="localePath(`/brands/${product.brandSlug}`)">{{ product.brandName || product.brandSlug }}</NuxtLink>
          </template>
          <span>/</span>
          <strong>{{ product.sku || title }}</strong>
        </div>
      </div>

      <!-- Central-Grade Watch Detail Split -->
      <section class="section">
        <div class="container op-detail__main">
          <!-- Left: Multi-Image Studio Watch Gallery + Zoom -->
          <div class="op-detail__gallery">
            <div class="op-detail__stage" @click="zoomOpen = true">
              <span v-if="discountPct > 0" class="op-detail__badge-disc">-{{ discountPct }}%</span>
              <span class="op-detail__badge-auth">✓ ของแท้ศูนย์ไทย 100%</span>
              <img
                :src="images[activeImg]"
                :alt="title"
                class="op-detail__img"
                referrerpolicy="no-referrer"
                @error="onDetailImgError"
              />
              <button type="button" class="op-detail__zoom-hint">🔍 คลิกขยายภาพความละเอียดสูง</button>
            </div>

            <div v-if="images.length > 1" class="op-detail__thumbs">
              <button
                v-for="(img, idx) in images"
                :key="img + idx"
                type="button"
                class="op-detail__thumb"
                :class="{ 'is-active': idx === activeImg }"
                @click="activeImg = idx"
              >
                <img
                  :src="img"
                  :alt="`${title} ${idx + 1}`"
                  referrerpolicy="no-referrer"
                  @error="(e: any) => { if (e?.target) e.target.src = '/images/op/watch-990-083-blue.png' }"
                />
              </button>
            </div>
          </div>

          <!-- Right: Central-Grade Pricing, Coupons, Loyalty Points & Actions -->
          <div class="op-detail__info">
            <div class="between wrap gap-8">
              <NuxtLink
                v-if="product.brandSlug"
                :to="localePath(`/brands/${product.brandSlug}`)"
                class="op-detail__brand-link"
              >
                {{ product.brandName || product.brandSlug }} OFFICIAL THAILAND →
              </NuxtLink>
              <span class="op-detail__sku-tag">SKU: {{ product.sku || product.slug }}</span>
            </div>

            <h1 class="op-detail__title">{{ title }}</h1>

            <!-- Price + Discount % + Save Amount -->
            <div class="op-detail__price-box">
              <div class="op-detail__price-line">
                <span class="op-detail__price-now">{{ fmt(product.price) }}</span>
                <span v-if="compareAt > Number(product.price || 0)" class="price-compare" style="font-size:18px">
                  {{ fmt(compareAt) }}
                </span>
                <span v-if="savingsAmt > 0" class="op-detail__save-pill">
                  {{ locale === 'th' ? `ประหยัด ${fmt(savingsAmt)} (-${discountPct}%)` : `Save ${fmt(savingsAmt)}` }}
                </span>
              </div>

              <!-- OP Loyalty Points Earn & Redeem Line -->
              <div class="op-detail__points-bar">
                <span>💎 <strong>OP Points:</strong> รับคะแนนสะสม <strong>+{{ pointsEarn }} คะแนน</strong> เมื่อสั่งซื้อรุ่นนี้ (ใช้คะแนนแลกส่วนลดเงินสดได้ทันที)</span>
              </div>
            </div>

            <!-- Central-style Collectible Coupons Strip -->
            <div v-if="coupons.length" class="op-detail__coupons">
              <div class="op-detail__coupons-label">{{ locale === 'th' ? '🎟 คูปองส่วนลดที่ใช้กับสินค้านี้ได้:' : '🎟 Available Vouchers:' }}</div>
              <div class="op-detail__coupon-list">
                <button
                  v-for="cp in coupons"
                  :key="cp.code"
                  type="button"
                  class="op-detail__coupon-pill"
                  :class="{ 'is-saved': savedCoupons.includes(cp.code) }"
                  @click="collectCoupon(cp.code)"
                >
                  <span>{{ cp.type === 'percent' ? `ลด ${cp.value}%` : `ลด ฿${cp.value}` }} ({{ cp.code }})</span>
                  <strong>{{ savedCoupons.includes(cp.code) ? '✓ เก็บแล้ว' : 'เก็บ' }}</strong>
                </button>
              </div>
            </div>

            <!-- Gift-With-Purchase & Gift Wrapping Highlight -->
            <div class="op-detail__gwp">
              <span>🎁</span>
              <div>
                <strong>{{ locale === 'th' ? 'สิทธิพิเศษของขวัญ & ห่อของขวัญฟรี' : 'Complimentary Gift Privileges' }}</strong>
                <p>{{ locale === 'th' ? 'ฟรี! บริการห่อของขวัญโบว์ซาติน Royal Sapphire พร้อมการ์ดอวยพร และซองหนังพกพานาฬิกาเมื่อช้อปครบตามเงื่อนไข' : 'Free luxury gift wrapping & greeting card available at checkout.' }}</p>
              </div>
            </div>

            <!-- Complimentary Wrist Sizing Selector -->
            <div class="op-detail__wrist">
              <label>{{ locale === 'th' ? 'บริการปรับขนาดสายฟรีโดยช่างผู้ชำนาญ (เลือกขนาดข้อมือ):' : 'Complimentary Bracelet Sizing:' }}</label>
              <select v-model="wristSize" class="select">
                <option value="มาตรฐาน (ไม่ตัดสาย)">ความยาวสายมาตรฐานจากโรงงาน (ไม่ตัดสาย)</option>
                <option value="14.5 ซม.">ข้อมือ 14.5 ซม. (ข้อสายที่ตัดจะแนบไปในกล่องครบทุกข้อ)</option>
                <option value="15.5 ซม.">ข้อมือ 15.5 ซม.</option>
                <option value="16.5 ซม.">ข้อมือ 16.5 ซม.</option>
                <option value="17.5 ซม.">ข้อมือ 17.5 ซม.</option>
                <option value="18.5 ซม.">ข้อมือ 18.5 ซม.</option>
                <option value="19.5 ซม.">ข้อมือ 19.5 ซม.</option>
              </select>
            </div>

            <!-- Quantity + Add to Cart + Buy Now -->
            <div class="op-detail__buy">
              <div class="op-detail__qty">
                <button type="button" @click="qty = Math.max(1, qty - 1)">−</button>
                <span>{{ qty }}</span>
                <button type="button" @click="qty = Math.min(Number(product.stock || 99), qty + 1)">+</button>
              </div>

              <button
                type="button"
                class="btn op-detail__add-btn"
                :disabled="product.stock !== undefined && Number(product.stock) <= 0"
                @click="addItemToCart(false)"
              >
                {{
                  product.stock !== undefined && Number(product.stock) <= 0
                    ? t('common.outOfStock')
                    : locale === 'th' ? 'หยิบใส่ตะกร้า' : t('common.addToCart')
                }}
              </button>

              <button
                type="button"
                class="btn btn--ghost op-detail__buynow-btn"
                :disabled="product.stock !== undefined && Number(product.stock) <= 0"
                @click="addItemToCart(true)"
              >
                {{ locale === 'th' ? 'ซื้อเลยทันที' : 'Buy Now' }}
              </button>
            </div>

            <!-- Omnichannel Links: Branch Availability + Shopee + LINE -->
            <div class="op-detail__omni">
              <button type="button" class="op-detail__omni-btn" @click="branchModal = !branchModal">
                📍 {{ locale === 'th' ? 'เช็คสินค้าสาขาใกล้บ้าน / รับที่สาขา' : 'Check Nearby Branch Stock' }}
              </button>
              <a
                v-if="product.shopeeUrl"
                :href="product.shopeeUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="op-detail__omni-btn op-detail__omni-btn--sp"
              >
                🛍 สั่งผ่าน Shopee Official ↗
              </a>
              <a
                href="https://line.me/ti/p/~opwatch.th"
                target="_blank"
                rel="noopener noreferrer"
                class="op-detail__omni-btn op-detail__omni-btn--line"
              >
                💬 ทักแชท LINE ขอดูเรือนจริง
              </a>
            </div>

            <!-- Inline Branch Stock Drawer -->
            <div v-if="branchModal && branches.length" class="op-detail__branches">
              <strong>สาขาที่เปิดให้บริการรับสินค้า (Click &amp; Collect ทั่วไทย):</strong>
              <div v-for="b in branches.slice(0, 4)" :key="b.slug" class="op-detail__branch-row">
                <div>
                  <strong>{{ b.nameTh }}</strong>
                  <small class="block muted">{{ b.province }} · โทร {{ b.phone }}</small>
                </div>
                <span class="badge" style="background:#ecfdf5;color:#065f46;border-color:#6ee7b7">พร้อมสั่งรับที่สาขา</span>
              </div>
              <NuxtLink :to="localePath('/branches')" class="tiny" style="color:var(--sapphire);font-weight:700">ดูสาขาทั้งหมดทั่วประเทศ →</NuxtLink>
            </div>

            <!-- 4 Trust Guarantees -->
            <div class="op-detail__guarantees">
              <div>🛡 รับประกันศูนย์ไทย 2 ปี (อินเตอร์ไทมส์)</div>
              <div>🚚 ส่งด่วนฟรีทั่วไทยพร้อมประกันพัสดุ</div>
              <div>🔄 เปลี่ยน/คืนสินค้าได้ภายใน 14 วัน</div>
              <div>💎 กระจกแซฟไฟร์แท้ 100% กันรอยขีดข่วน</div>
            </div>
          </div>
        </div>

        <!-- Central-Style Tabbed Product Information -->
        <div class="container op-detail__tabs-wrap">
          <div class="op-detail__tabs">
            <button type="button" :class="{ 'is-active': activeTab === 'specs' }" @click="activeTab = 'specs'">
              {{ locale === 'th' ? 'รายละเอียดและข้อมูลจำเพาะ' : 'Description & Specifications' }}
            </button>
            <button type="button" :class="{ 'is-active': activeTab === 'delivery' }" @click="activeTab = 'delivery'">
              {{ locale === 'th' ? 'การจัดส่ง เปลี่ยนคืนสินค้า & การรับประกัน' : 'Delivery, Returns & Warranty' }}
            </button>
            <button type="button" :class="{ 'is-active': activeTab === 'reviews' }" @click="activeTab = 'reviews'">
              {{ locale === 'th' ? 'คำถามที่พบบ่อย & รีวิวลูกค้า' : 'FAQ & Verified Reviews' }}
            </button>
          </div>

          <!-- Tab 1: Rich Description + Spec Table -->
          <div v-if="activeTab === 'specs'" class="op-detail__tab-panel">
            <div v-if="product.aseoSummary" class="op-detail__aseo-box">
              <strong>จุดเด่นสำคัญของรุ่น {{ product.sku || title }}:</strong>
              <p>{{ product.aseoSummary }}</p>
            </div>

            <div v-if="description" class="op-detail__rich-desc">
              <div v-if="hasHtmlDescription" v-html="description" />
              <p v-else>{{ description }}</p>
            </div>

            <h3 style="margin: 24px 0 12px; font-size: 18px; font-weight: 700">ข้อมูลจำเพาะทางเทคนิค (Technical Specifications)</h3>
            <table class="op-specs">
              <tbody>
                <tr v-for="(row, i) in specRows" :key="row.label" :class="{ 'is-alt': i % 2 === 0 }">
                  <th>{{ row.label }}</th>
                  <td>{{ row.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tab 2: Delivery, Exchange/Return & 2-Year Warranty -->
          <div v-else-if="activeTab === 'delivery'" class="op-detail__tab-panel stack gap-16">
            <div>
              <h3 style="font-size:17px;font-weight:700">🚚 การจัดส่งภายในประเทศไทย &amp; รับที่สาขา (Click &amp; Collect)</h3>
              <p class="muted" style="margin-top:4px;line-height:1.75">จัดส่งด่วนฟรีทั่วประเทศไทยโดยขนส่งชั้นนำ (Kerry Express / ไปรษณีย์ไทย EMS พร้อมประกันภัยพัสดุเต็มมูลค่า) ใช้เวลา 1–3 วันทำการ หรือเลือกรับสินค้าด้วยตนเองพร้อมบริการตัดสายฟรีที่โชว์รูมอินเตอร์ไทมส์ ถนนเพชรบุรีตัดใหม่ และเคาน์เตอร์ห้างสรรพสินค้าที่ร่วมรายการ</p>
            </div>
            <div>
              <h3 style="font-size:17px;font-weight:700">🔄 นโยบายการเปลี่ยนและคืนสินค้าภายใน {{ site.returnWindowDays || 14 }} วัน</h3>
              <p class="muted" style="margin-top:4px;line-height:1.75">หากสินค้ามีความบกพร่องจากการผลิตหรือเสียหายจากการขนส่ง สามารถแจ้งเปลี่ยนเรือนใหม่หรือคืนเงินเต็มจำนวนได้ภายใน {{ site.returnWindowDays || 14 }} วันนับจากวันที่ได้รับสินค้า <NuxtLink :to="localePath('/pages/return-policy')" style="color:var(--sapphire);text-decoration:underline">อ่านรายละเอียดเพิ่มเติม</NuxtLink></p>
            </div>
            <div>
              <h3 style="font-size:17px;font-weight:700">🛡 รับประกันของแท้ศูนย์ไทย {{ site.warrantyYears || 2 }} ปีเต็ม</h3>
              <p class="muted" style="margin-top:4px;line-height:1.75">จัดจำหน่ายโดย บริษัท อินเตอร์ไทมส์ จำกัด ผู้นำเข้าและจัดจำหน่ายแบรนด์ Olym Pianus, Olympia Star และ Ogival อย่างเป็นทางการในประเทศไทย มาพร้อมกล่อง คู่มือ และใบรับประกันศูนย์ไทยครบชุด</p>
            </div>
          </div>

          <!-- Tab 3: ASEO Q&A + Customer Reviews -->
          <div v-else class="op-detail__tab-panel stack gap-18">
            <div v-if="aseoFaqs.length" class="stack gap-10">
              <h3 style="font-size:17px;font-weight:700">คำถามที่พบบ่อยเกี่ยวกับรุ่นนี้ (Q&amp;A)</h3>
              <div v-for="(f, idx) in aseoFaqs" :key="idx" class="card" style="padding:14px 18px">
                <strong>Q: {{ f.q }}</strong>
                <p class="muted" style="margin-top:4px">A: {{ f.a }}</p>
              </div>
            </div>

            <div class="stack gap-12">
              <h3 style="font-size:17px;font-weight:700">ความประทับใจจากผู้สั่งซื้อจริง</h3>
              <div class="grid-2">
                <div class="card" style="padding:16px">
                  <div style="color:#eab308;font-size:14px">★★★★★ · ยืนยันคำสั่งซื้อของแท้ศูนย์ไทย</div>
                  <p style="margin-top:6px;font-size:14px">"งานตัวเรือนสแตนเลสและกระจกแซฟไฟร์ใสสวยมากครับ ทางร้านตัดสายตามขนาดข้อมือมาให้พอดีและห่อของขวัญเรียบร้อยมาก"</p>
                  <small class="muted">— คุณธนวัฒน์ · กรุงเทพมหานคร</small>
                </div>
                <div class="card" style="padding:16px">
                  <div style="color:#eab308;font-size:14px">★★★★★ · จัดส่งรวดเร็วพร้อมใบรับประกัน</div>
                  <p style="margin-top:6px;font-size:14px">"ได้รับสินค้าภายใน 2 วัน มีใบรับประกันบริษัท อินเตอร์ไทมส์ ครบชุด ใช้คูปองลดเพิ่มคุ้มค่ามากค่ะ"</p>
                  <small class="muted">— คุณพิมพ์ชนก · เชียงใหม่</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Related Watches -->
      <section v-if="related.length" class="section op-detail__related">
        <div class="container">
          <h2 class="op-detail__related-title">
            {{ locale === 'th' ? 'เรือนเวลาที่คุณอาจสนใจ' : 'RELATED TIMEPIECES' }}
          </h2>
          <div class="op-detail__related-grid">
            <ProductCard v-for="item in related.slice(0, 4)" :key="item.id || item.slug" :product="item" />
          </div>
        </div>
      </section>

      <!-- High-Res Lightbox Modal -->
      <Transition name="fade-drop">
        <div v-if="zoomOpen" class="op-zoom-modal" @click.self="zoomOpen = false">
          <button type="button" class="op-zoom-modal__close" @click="zoomOpen = false">✕ ปิดภาพขยาย</button>
          <img :src="images[activeImg]" :alt="title" />
        </div>
      </Transition>
    </template>
  </div>
</template>

<style scoped>
.op-detail { background: #ffffff; }
.op-detail__crumb {
  background: linear-gradient(135deg, #101444 0%, #1d2088 100%);
  color: #ffffff;
  padding-block: 18px;
}
.op-detail__crumb-row {
  display: flex; align-items: center; flex-wrap: wrap; gap: 10px;
  font-size: 12.5px; color: rgba(255, 255, 255, 0.85);
}
.op-detail__crumb-row a { color: #ffffff; }
.op-detail__crumb-row a:hover { color: #ffffff; text-decoration: underline; }
.op-detail__crumb-row strong { color: #ffffff; font-weight: 600; }

.op-detail__main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr);
  gap: 52px;
  align-items: start;
}
.op-detail__stage {
  position: relative;
  aspect-ratio: 4 / 4.4;
  background: #ffffff;
  border: 1px solid var(--sand);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  cursor: zoom-in;
}
.op-detail__img { max-height: 100%; width: auto; object-fit: contain; transition: transform 0.4s ease; }
.op-detail__stage:hover .op-detail__img { transform: scale(1.04); }
.op-detail__badge-disc {
  position: absolute; top: 14px; right: 14px;
  background: #c81e1e; color: #ffffff; font-weight: 800; font-size: 13px;
  padding: 5px 11px; border-radius: 6px;
}
.op-detail__badge-auth {
  position: absolute; top: 14px; left: 14px;
  background: #eef0ff; color: var(--sapphire); font-weight: 700; font-size: 11.5px;
  padding: 5px 10px; border-radius: 6px; border: 1px solid #cfd5f6;
}
.op-detail__zoom-hint {
  position: absolute; bottom: 12px; right: 12px;
  background: rgba(255,255,255,0.92); border: 1px solid var(--line-strong);
  border-radius: 999px; padding: 5px 12px; font-size: 11.5px; color: var(--ink-soft); cursor: pointer;
}
.op-detail__thumbs {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
  gap: 10px;
}
.op-detail__thumb {
  aspect-ratio: 1; padding: 6px; background: #ffffff;
  border: 1px solid var(--sand); border-radius: 8px; cursor: pointer;
}
.op-detail__thumb.is-active { border: 2px solid var(--sapphire); }
.op-detail__thumb img { width: 100%; height: 100%; object-fit: contain; }

.op-detail__info { display: flex; flex-direction: column; gap: 16px; }
.op-detail__brand-link {
  font-family: var(--font-roman); font-size: 11.5px; font-weight: 700;
  letter-spacing: 0.16em; color: var(--sapphire); text-transform: uppercase;
}
.op-detail__sku-tag { font-size: 12px; color: var(--muted); font-family: monospace; }
.op-detail__title {
  font-family: var(--font-display);
  font-size: clamp(1.65rem, 2.7vw, 2.3rem);
  font-weight: 500; color: var(--ink); line-height: 1.25;
}
.op-detail__price-box {
  background: #f8f9fd;
  border: 1px solid #dfe4f5;
  border-radius: 10px;
  padding: 16px 18px;
}
.op-detail__price-line { display: flex; align-items: baseline; flex-wrap: wrap; gap: 12px; }
.op-detail__price-now { font-family: var(--font-display); font-size: 32px; font-weight: 700; color: var(--sapphire); }
.op-detail__save-pill {
  background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca;
  font-size: 12.5px; font-weight: 700; padding: 3px 10px; border-radius: 999px;
}
.op-detail__points-bar {
  margin-top: 10px; padding-top: 10px; border-top: 1px dashed #cbd5e1;
  font-size: 13px; color: var(--ink-soft);
}
.op-detail__coupons { display: flex; flex-direction: column; gap: 8px; }
.op-detail__coupons-label { font-size: 12.5px; font-weight: 700; color: var(--ink); }
.op-detail__coupon-list { display: flex; flex-wrap: wrap; gap: 8px; }
.op-detail__coupon-pill {
  display: inline-flex; align-items: center; gap: 8px;
  background: #fff5f5; border: 1px dashed #ef4444; color: #b91c1c;
  padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;
}
.op-detail__coupon-pill.is-saved { background: #ecfdf5; border-color: #10b981; color: #065f46; }
.op-detail__gwp {
  display: flex; gap: 12px; align-items: flex-start;
  background: #f3f5ff; border: 1px solid #d5dbf8; border-radius: 10px; padding: 12px 14px;
  font-size: 13px;
}
.op-detail__gwp p { color: var(--ink-soft); font-size: 12.5px; margin-top: 2px; }
.op-detail__wrist label { display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 6px; }
.op-detail__buy { display: flex; align-items: stretch; gap: 10px; flex-wrap: wrap; }
.op-detail__qty {
  display: inline-flex; align-items: center; border: 1px solid var(--line-strong); border-radius: 6px;
}
.op-detail__qty button { width: 38px; height: 46px; font-size: 18px; background: transparent; border: 0; cursor: pointer; }
.op-detail__qty span { min-width: 36px; text-align: center; font-weight: 700; }
.op-detail__add-btn { flex: 1; min-width: 165px; }
.op-detail__buynow-btn { min-width: 135px; }

.op-detail__omni { display: flex; flex-wrap: wrap; gap: 8px; }
.op-detail__omni-btn {
  padding: 8px 12px; border-radius: 6px; font-size: 12.5px; font-weight: 600;
  border: 1px solid var(--line-strong); background: #ffffff; color: var(--ink); cursor: pointer;
}
.op-detail__omni-btn--sp { border-color: #fed7aa; background: #fff7ed; color: #c2410c; }
.op-detail__omni-btn--line { border-color: #bbf7d0; background: #f0fdf4; color: #15803d; }
.op-detail__branches {
  background: #f8fafc; border: 1px solid var(--line-strong); border-radius: 10px;
  padding: 14px; display: flex; flex-direction: column; gap: 8px; font-size: 13px;
}
.op-detail__branch-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding-top: 6px; border-top: 1px solid var(--line); }
.op-detail__guarantees {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  font-size: 12.5px; color: var(--ink-soft); padding-top: 12px; border-top: 1px solid var(--line);
}

.op-detail__tabs-wrap { margin-top: 54px; }
.op-detail__tabs { display: flex; gap: 6px; border-bottom: 2px solid var(--line); flex-wrap: wrap; }
.op-detail__tabs button {
  padding: 12px 22px; border: 0; background: transparent;
  font-size: 14.5px; font-weight: 700; color: var(--muted); cursor: pointer;
}
.op-detail__tabs button.is-active {
  color: var(--sapphire);
  box-shadow: inset 0 -3px 0 var(--sapphire);
}
.op-detail__tab-panel { padding: 28px 0; }
.op-detail__aseo-box {
  background: #f3f5ff; border-left: 4px solid var(--sapphire);
  padding: 14px 18px; border-radius: 6px; margin-bottom: 18px; font-size: 14px;
}
.op-detail__rich-desc { font-size: 15px; line-height: 1.8; color: var(--ink-soft); }
.op-specs { width: 100%; border-collapse: collapse; border: 1px solid var(--sand); }
.op-specs tr.is-alt { background: var(--paper-2); }
.op-specs th, .op-specs td { padding: 12px 18px; text-align: left; border-bottom: 1px solid var(--sand); font-size: 14px; }
.op-specs th { width: 34%; font-weight: 700; color: var(--ink); }

.op-detail__related { background: var(--paper-2); border-top: 1px solid var(--sand); }
.op-detail__related-title { font-family: var(--font-display); font-size: 26px; text-align: center; margin-bottom: 28px; }
.op-detail__related-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 22px; }

.op-zoom-modal {
  position: fixed; inset: 0; z-index: 120; background: rgba(8, 10, 26, 0.92);
  display: grid; place-items: center; padding: 24px;
}
.op-zoom-modal img { max-width: min(900px, 92vw); max-height: 86vh; object-fit: contain; background: #fff; border-radius: 12px; padding: 18px; }
.op-zoom-modal__close {
  position: fixed; top: 22px; right: 24px; background: #ffffff; color: #111;
  border: 0; border-radius: 999px; padding: 8px 18px; font-weight: 700; cursor: pointer;
}

@media (max-width: 960px) {
  .op-detail__main { grid-template-columns: 1fr; gap: 32px; }
  .op-detail__related-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .op-detail__guarantees { grid-template-columns: 1fr; }
}
</style>
