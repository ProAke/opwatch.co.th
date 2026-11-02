<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const cart = useCart()
const { site } = useSite()
const reqFetch = useRequestFetch()

const fmt = (v: number) =>
  formatPrice(Number(v || 0), site.value.currencySymbol, locale.value === 'en' ? 'en-US' : 'th-TH')

const slug = computed(() => String(route.params.slug || ''))

const { data: res, error } = await useAsyncData(
  () => `op-product-${slug.value}`,
  () => reqFetch<any>(`/api/products/${slug.value}`),
  { watch: [slug] }
)

const product = computed(() => res.value?.product || res.value)
const related = computed(() => res.value?.related || [])

const images = computed(() => {
  const p = product.value || {}
  const list = Array.isArray(p.images) ? p.images : []
  if (list.length) return list
  if (p.image) return p.hoverImage ? [p.image, p.hoverImage] : [p.image]
  return ['/images/op/watch-990-083-blue.png']
})
const activeImg = ref(0)
watch(slug, () => { activeImg.value = 0 })

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

/* Exact olympianus.com & ogival.com.tw 2-Column Specification Table */
const specRows = computed(() => {
  const p = product.value || {}
  const specs = p.specs && typeof p.specs === 'object' ? p.specs : {}
  const entries = Object.entries(specs).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
  if (entries.length > 0) {
    return entries.map(([label, value]) => ({ label, value: String(value) }))
  }
  return [
    { label: 'Brand', value: p.brandName || p.brandSlug || 'Olympianus' },
    { label: 'Model / Reference', value: p.sku || p.slug || '—' },
    { label: 'Movement', value: p.movement || 'Automatic / Precision Caliber' },
    { label: 'Crystal', value: 'Sapphire Crystal' },
    { label: 'Case Material', value: '316L Surgical Stainless Steel' },
    { label: 'Warranty', value: locale.value === 'th' ? 'รับประกันศูนย์ไทย 2 ปีเต็ม (Inter Times Co., Ltd.)' : '2-Year Official Thailand Warranty (Inter Times Co., Ltd.)' }
  ]
})

function onDetailImgError(e: Event) {
  const el = e.target as HTMLImageElement | null
  if (!el) return
  if (activeImg.value < images.value.length - 1) {
    activeImg.value += 1
  } else {
    el.src = '/images/op/watch-990-083-blue.png'
  }
}

const compareAt = computed(() => Number(product.value?.originalPrice ?? product.value?.priceCompare ?? product.value?.comparePrice ?? 0))

function addItemToCart() {
  if (!product.value) return
  cart.add(
    {
      productId: Number(product.value.id),
      slug: product.value.slug,
      name: product.value.name || title.value,
      nameEn: product.value.nameEn || title.value,
      nameTh: product.value.nameTh || title.value,
      price: Number(product.value.price || 0),
      image: images.value[0],
      maxStock: Number(product.value.stock ?? 99),
      sku: product.value.sku
    },
    qty.value
  )
}

useHead(() => ({
  title: title.value ? `${title.value} — Olym Pianus · Opwatch` : 'Timepiece — Opwatch'
}))
</script>

<template>
  <div class="op-detail">
    <div v-if="error || !product" class="container section center">
      <h2>{{ locale === 'th' ? 'ไม่พบข้อมูลเรือนเวลาที่ค้นหา' : 'Timepiece Not Found' }}</h2>
      <p class="muted" style="margin-block: 12px 24px">
        {{ locale === 'th' ? 'กรุณาเลือกชมคอลเลกชันอื่นในบูติกของเรา' : 'Please explore our full boutique catalogue.' }}
      </p>
      <NuxtLink :to="localePath('/products')" class="btn">Collections</NuxtLink>
    </div>

    <template v-else>
      <!-- Breadcrumb Bar (exact olympianus.com #ebebf1 alternate_color strip) -->
      <div class="op-detail__crumb">
        <div class="container op-detail__crumb-row">
          <NuxtLink :to="localePath('/')">Home</NuxtLink>
          <span>/</span>
          <NuxtLink :to="localePath('/products')">Collections</NuxtLink>
          <span>/</span>
          <strong>{{ product.sku || title }}</strong>
        </div>
      </div>

      <!-- Portfolio Showcase: Pure White Studio Cutout + Luxury Serif Info -->
      <section class="section">
        <div class="container op-detail__main">
          <!-- Left: Studio Watch Gallery -->
          <div class="op-detail__gallery">
            <div class="op-detail__stage">
              <img
                :src="images[activeImg]"
                :alt="title"
                class="op-detail__main-img"
                referrerpolicy="no-referrer"
                @error="onDetailImgError"
              />
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
                  :alt="`${title} view ${idx + 1}`"
                  referrerpolicy="no-referrer"
                  @error="(e: any) => { if (e?.target) e.target.src = '/images/op/watch-990-083-blue.png' }"
                />
              </button>
            </div>
          </div>

          <!-- Right: Model Code + Luxury Serif Name + Price + Add to Cart -->
          <div class="op-detail__info">
            <span class="eyebrow">{{ product.brandName || product.brandSlug || 'OLYM PIANUS' }}</span>
            <p v-if="product.sku" class="op-detail__sku">{{ product.sku }}</p>
            <h1 class="op-detail__title">{{ title }}</h1>

            <div class="op-detail__price-box">
              <span class="price price--lg">{{ fmt(product.price) }}</span>
              <span
                v-if="compareAt > Number(product.price || 0)"
                class="price-compare"
              >
                {{ fmt(compareAt) }}
              </span>
            </div>

            <p v-if="description" class="op-detail__desc">{{ description }}</p>

            <!-- Quantity & Purchase -->
            <div class="op-detail__buy">
              <div class="op-detail__qty">
                <button type="button" aria-label="Decrease" @click="qty = Math.max(1, qty - 1)">−</button>
                <span>{{ qty }}</span>
                <button type="button" aria-label="Increase" @click="qty++">+</button>
              </div>

              <button
                type="button"
                class="btn grow"
                :disabled="product.stock !== undefined && Number(product.stock) <= 0"
                @click="addItemToCart"
              >
                {{
                  product.stock !== undefined && Number(product.stock) <= 0
                    ? t('common.outOfStock')
                    : t('common.addToCart')
                }}
              </button>
            </div>

            <!-- Boutique Assurances (Thailand Exclusive) -->
            <ul class="op-detail__trust">
              <li>✓ {{ locale === 'th' ? 'ของแท้ 100% จากตัวแทนจำหน่ายทางการในประเทศไทย (บริษัท อินเตอร์ไทมส์ จำกัด)' : '100% Authentic from Thailand Official Distributor (Inter Times Co., Ltd.)' }}</li>
              <li>✓ {{ locale === 'th' ? 'กระจกแซฟไฟร์แท้กันรอยขีดข่วน พร้อมกล่องและใบรับประกันศูนย์ไทย 2 ปีเต็ม' : 'Scratch-Resistant Sapphire Crystal, Official Box & 2-Year Thailand Warranty' }}</li>
              <li>✓ {{ locale === 'th' ? 'จัดส่งฟรีพร้อมประกันภัยเฉพาะภายในประเทศไทยครบทั้ง 77 จังหวัด (งดส่งต่างประเทศ)' : 'Complimentary Insured Delivery Exclusively Within Thailand (All 77 Provinces)' }}</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Exact olympianus.com Portfolio 2-Column Specification Table on #f8f8f8 -->
      <section class="section section--pearl">
        <div class="container op-detail__spec-wrap">
          <div class="op-sec-head">
            <h2 class="op-sec-title">Specification</h2>
          </div>

          <table class="op-detail__spec-table">
            <tbody>
              <tr v-for="row in specRows" :key="row.label">
                <th>{{ row.label }}</th>
                <td>{{ row.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Related Watches -->
      <section v-if="related.length" class="section">
        <div class="container">
          <div class="op-sec-head">
            <h2 class="op-sec-title">RECOMMEND</h2>
          </div>
          <div class="op-detail__related">
            <ProductCard v-for="r in related.slice(0, 3)" :key="r.id || r.slug" :product="r" />
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.op-detail__spacer {
  height: var(--header-h);
  background: #ffffff;
}
.op-detail__crumb {
  background: var(--sand);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line-strong);
  padding-block: 14px;
}
.op-detail__crumb-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-roman);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.op-detail__crumb-row a:hover { color: var(--sapphire); }
.op-detail__crumb-row strong { color: var(--sapphire); }

.op-detail__main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: start;
}
.op-detail__stage {
  background: #ffffff;
  border: 1px solid var(--sand);
  aspect-ratio: 4 / 5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 36px;
}
.op-detail__main-img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}
.op-detail__thumbs {
  margin-top: 14px;
  display: flex;
  gap: 12px;
}
.op-detail__thumb {
  width: 78px;
  height: 92px;
  padding: 6px;
  border: 1px solid var(--sand);
  background: #ffffff;
  transition: border-color 0.2s;
}
.op-detail__thumb.is-active {
  border-color: var(--sapphire);
}
.op-detail__thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.op-detail__info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  padding-top: 10px;
}
.op-detail__sku {
  font-family: var(--font-roman);
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.24em;
  color: var(--sapphire);
}
.op-detail__title {
  font-family: var(--font-display);
  font-size: clamp(1.9rem, 3.2vw, 2.7rem);
  font-weight: 500;
  letter-spacing: 0.03em;
  line-height: 1.25;
}
.op-detail__price-box {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding-block: 8px;
}
.op-detail__desc {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--ink-soft);
  line-height: 1.85;
}
.op-detail__buy {
  display: flex;
  align-items: stretch;
  gap: 14px;
  width: 100%;
  margin-top: 8px;
}
.op-detail__qty {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--line-strong);
  background: #ffffff;
}
.op-detail__qty button {
  width: 42px;
  height: 100%;
  border: 0;
  background: transparent;
  font-size: 16px;
  color: var(--ink);
}
.op-detail__qty span {
  min-width: 36px;
  text-align: center;
  font-size: 14px;
}
.op-detail__trust {
  list-style: none;
  padding: 20px 0 0;
  margin: 12px 0 0;
  border-top: 1px solid var(--sand);
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 9px;
  font-size: 13.5px;
  color: var(--ink-soft);
}

.op-detail__spec-wrap { max-width: 860px; }
.op-detail__spec-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border: 1px solid var(--line-strong);
}
.op-detail__spec-table th,
.op-detail__spec-table td {
  padding: 16px 24px;
  border-bottom: 1px solid var(--sand);
  font-size: 15px;
  text-align: left;
}
.op-detail__spec-table th {
  width: 36%;
  font-family: var(--font-roman);
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 11px;
  color: var(--ink);
  background: #fbfbfd;
  border-right: 1px solid var(--sand);
}
.op-detail__spec-table td {
  font-family: var(--font-display);
  font-size: 17px;
  color: var(--ink-soft);
}

.op-detail__related {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
}

@media (max-width: 900px) {
  .op-detail__main { grid-template-columns: 1fr; gap: 36px; }
  .op-detail__related { grid-template-columns: 1fr; }
}
</style>
