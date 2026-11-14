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
const variations = computed(() => res.value?.variations || [])
const related = computed(() => res.value?.related || [])
const brandProducts = computed(() => res.value?.brandProducts || [])
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
const wristSize = ref('มาตรฐาน (ไม่ตัดสาย)')
const branchModal = ref(false)
const savedCoupons = ref<string[]>([])
const showAllVariations = ref(false)

watch(slug, () => {
  activeImg.value = 0
  zoomOpen.value = false
  showAllVariations.value = false
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

const shortTitle = computed(() => {
  const p = product.value || {}
  const specs = p.specs && typeof p.specs === 'object' ? p.specs : {}
  const model = specs.Model || specs.Reference || p.sku || ''
  const brand = p.brandName || 'Olym Pianus'
  const caseSize = specs['Case Diameter'] || ''
  const strap = specs['Strap Material'] || ''
  if (locale.value === 'en') {
    return `${brand} ${model} ${caseSize ? caseSize + ', ' : ''}${strap ? strap.split(' ').slice(0, 2).join(' ') : ''}`.trim()
  }
  return `${brand} ${model} ${caseSize ? caseSize + ' ' : ''}`.trim()
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

const specsObj = computed(() => {
  const p = product.value || {}
  return p.specs && typeof p.specs === 'object' ? p.specs : {}
})

function specVal(...keys: string[]) {
  for (const k of keys) {
    const v = specsObj.value[k]
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v)
  }
  // case-insensitive fallback
  const lowerMap: Record<string, string> = {}
  Object.entries(specsObj.value).forEach(([k, v]) => { lowerMap[k.toLowerCase()] = String(v) })
  for (const k of keys) {
    const v = lowerMap[k.toLowerCase()]
    if (v) return v
  }
  return ''
}

const technicalRows = computed(() => {
  const p = product.value || {}
  const rows: { label: string; value: string }[] = []
  const push = (label: string, value: string) => { if (value && value.trim()) rows.push({ label, value }) }
  push(locale.value === 'th' ? 'รหัสอ้างอิง (Reference)' : 'Reference', p.sku || p.slug || '')
  push(locale.value === 'th' ? 'ระหว่างหูสาย (Between lugs)' : 'Between lugs', specVal('Between lugs', 'Lug Width', 'ความกว้างสาย'))
  push(locale.value === 'th' ? 'ความยาวจากหูถึงหู (Lug-to-lug)' : 'Lug-to-lug', specVal('Lug-to-lug', 'Lug to Lug'))
  push(locale.value === 'th' ? 'ความหนา (Thickness)' : 'Thickness', specVal('Thickness', 'ความหนา'))
  push(locale.value === 'th' ? 'เส้นผ่านศูนย์กลางตัวเรือน' : 'Case diameter', specVal('Case Diameter', 'Case Size', 'ขนาดตัวเรือน'))
  push(locale.value === 'th' ? 'ตัวเรือน (Case)' : 'Case', specVal('Case Material', 'Case', 'วัสดุตัวเรือน'))
  push(locale.value === 'th' ? 'สีหน้าปัด (Dial color)' : 'Dial color', specVal('Dial Color', 'สีหน้าปัด'))
  push(locale.value === 'th' ? 'กระจก (Crystal)' : 'Crystal', specVal('Crystal', 'กระจก'))
  push(locale.value === 'th' ? 'กันน้ำ (Water resistance)' : 'Water resistance', specVal('Water Resistance', 'Water Resistant', 'กันน้ำ'))
  push(locale.value === 'th' ? 'น้ำหนักรวมโดยประมาณ' : 'Total product weight (approx.)', specVal('Weight', 'น้ำหนัก'))
  push(locale.value === 'th' ? 'กลไก (Caliber)' : 'Caliber', specVal('Movement', 'Caliber', 'กลไก'))
  push(locale.value === 'th' ? 'ประเภทกลไก' : 'Movement type', specVal('Movement Type', 'ประเภทกลไก'))
  push(locale.value === 'th' ? 'พลังงานสำรอง (Power reserve)' : 'Power reserve', specVal('Power Reserve', 'พลังงานสำรอง'))
  // fallback generic rows if empty
  if (!rows.length) {
    rows.push(
      { label: 'Brand', value: p.brandName || 'Olym Pianus' },
      { label: 'Reference', value: p.sku || '—' },
      { label: 'Crystal', value: 'Sapphire Crystal (กระจกแซฟไฟร์แท้)' },
      { label: 'Warranty', value: locale.value === 'th' ? 'รับประกันศูนย์ไทย 2 ปีเต็ม (บริษัท อินเตอร์ไทมส์ จำกัด)' : '2-Year Official Thailand Warranty (Inter Times Co., Ltd.)' }
    )
  }
  return rows
})

const strapRows = computed(() => {
  const rows: { label: string; value: string }[] = []
  const push = (label: string, value: string) => { if (value && value.trim()) rows.push({ label, value }) }
  push(locale.value === 'th' ? 'สีสาย' : 'Strap color', specVal('Strap Color', 'สีสาย'))
  push(locale.value === 'th' ? 'ประเภทสาย' : 'Strap type', specVal('Strap Material', 'Strap Type', 'ประเภทสาย'))
  push(locale.value === 'th' ? 'ผิวสาย' : 'Strap surface', specVal('Strap Surface', 'ผิวสาย'))
  push(locale.value === 'th' ? 'ด้านในสาย' : 'Strap underside', specVal('Strap Underside', 'ด้านในสาย'))
  push(locale.value === 'th' ? 'ประเภทหัวสาย' : 'Buckle type', specVal('Clasp', 'Buckle Type', 'หัวสาย'))
  push(locale.value === 'th' ? 'วัสดุหัวสาย' : 'Buckle material', specVal('Buckle Material', 'วัสดุหัวสาย'))
  if (!rows.length) {
    rows.push(
      { label: locale.value === 'th' ? 'ประเภทสาย' : 'Strap type', value: specVal('Strap Material') || '316L Surgical Stainless Steel' },
      { label: locale.value === 'th' ? 'หัวสาย' : 'Buckle type', value: specVal('Clasp') || 'Folding Clasp' }
    )
  }
  return rows
})

const featureList = computed(() => {
  const isTh = locale.value === 'th'
  const movement = (specVal('Movement') || '').toLowerCase()
  const isAuto = movement.includes('automatic') || movement.includes('auto') || movement.includes('ออโต')
  const isDiver = (specVal('Features') || '' + (product.value?.nameEn || '')).toLowerCase().includes('diver') || (product.value?.categorySlug || '').includes('sport')
  const hasDate = (specVal('Features') || '').toLowerCase().includes('date') || (product.value?.nameEn || '').toLowerCase().includes('date')
  const hasTransparent = (specVal('Features') || '').toLowerCase().includes('transparent') || (product.value?.nameEn || '').toLowerCase().includes('open heart') || (product.value?.nameEn || '').toLowerCase().includes('skeleton')
  const hasBezel = isDiver || (specVal('Features') || '').toLowerCase().includes('bezel')

  const all = [
    {
      key: 'anti-magnetic',
      icon: '🧲',
      title: isTh ? 'กันสนามแม่เหล็ก' : 'Anti-magnetic',
      desc: isTh ? 'กลไกไม่ได้รับผลกระทบจากสนามแม่เหล็กแรงสูงกว่า 15,000 เกาส์' : 'The movement is unaffected by exposure to strong magnetic fields, even those greater than 1.5 tesla (15,000 gauss).'
    },
    {
      key: 'chronometer',
      icon: '⏱️',
      title: isTh ? 'โครโนมิเตอร์' : 'Chronometer',
      desc: isTh ? 'ผ่านการทดสอบจากห้องปฏิบัติการอิสระตามมาตรฐาน ISO 3159' : 'Label given to a watch which has been successfully tested by an accredited and independent laboratory in order to receive a certificate compliant with the chronometer ISO 3159 standard.'
    },
    {
      key: 'date',
      icon: '📅',
      title: isTh ? 'แสดงวันที่' : 'Date',
      desc: isTh ? 'แสดงวันของเดือนในช่องหน้าต่างที่ตำแหน่ง 3 หรือ 6 นาฬิกา' : 'The day of the month, displayed in a window on a watch dial at the 3 or 6 o’clock position, or within a subdial at 9 o\'clock.'
    },
    {
      key: 'helium',
      icon: '🫧',
      title: isTh ? 'วาล์วปล่อยฮีเลียม' : 'Helium escape valve',
      desc: isTh ? 'ระบบระบายฮีเลียมสำหรับนักดำน้ำมืออาชีพในห้องแรงดัน' : 'Decompression system which allows helium to escape from inside the watch when the watch is worn for professional use in pressure chambers.'
    },
    {
      key: 'master',
      icon: '🏅',
      title: isTh ? 'รับรองมาสเตอร์โครโนมิเตอร์' : 'Master Chronometer Certified',
      desc: isTh ? 'มาตรฐานความเที่ยงตรงสูงสุดของอุตสาหกรรมสวิสตาม METAS' : 'Guaranteeing the Swiss industry’s highest standard of precision, performance and magnetic-resistance, as set by the Swiss Federal Institute of Metrology (METAS).'
    },
    {
      key: 'screw-crown',
      icon: '🔩',
      title: isTh ? 'เม็ดมะยมขันเกลียว' : 'Screw-in crown',
      desc: isTh ? 'เม็ดมะยมล็อกตัวเองสำหรับนาฬิกาดำน้ำกันน้ำสูง' : 'Self-locking crown, screwed into the tube of the case, used for highly water resistant divers\' watches.'
    },
    {
      key: 'transparent',
      icon: '🔍',
      title: isTh ? 'ฝาหลังใส' : 'Transparent caseback',
      desc: isTh ? 'ฝาหลังแซฟไฟร์ใส มองเห็นกลไกภายในได้' : 'A transparent caseback - frequently made of sapphire - makes it possible to see the movement inside the watch.'
    },
    {
      key: 'bezel',
      icon: '🔄',
      title: isTh ? 'ขอบหมุนทิศทางเดียว' : 'Unidirectional rotating bezel',
      desc: isTh ? 'ขอบหมุนทางเดียวป้องกันการหมุนผิดทิศขณะดำน้ำ' : 'A bezel which turns in only one direction. Particularly useful for divers who cannot accidentally rotate it in the wrong direction.'
    }
  ]
  // Filter to most relevant 8, but keep all for richness; prioritize based on product
  const priority: Record<string, number> = {
    'anti-magnetic': 1,
    'chronometer': 2,
    'master': isAuto ? 3 : 10,
    'date': hasDate ? 4 : 9,
    'helium': isDiver ? 5 : 10,
    'screw-crown': isDiver ? 6 : 8,
    'transparent': hasTransparent ? 7 : 9,
    'bezel': hasBezel ? 8 : 10
  }
  return [...all].sort((a, b) => (priority[a.key] || 99) - (priority[b.key] || 99)).slice(0, 8)
})

const keyMaterials = computed(() => {
  const isTh = locale.value === 'th'
  const caseMat = specVal('Case Material') || '316L Surgical Stainless Steel'
  const crystal = specVal('Crystal') || 'Sapphire Crystal'
  const strapMat = specVal('Strap Material') || 'Stainless Steel'
  return [
    {
      title: isTh ? 'สแตนเลสสตีล' : 'Stainless Steel',
      desc: isTh
        ? 'สแตนเลสสตีลเป็นวัสดุคลาสสิกที่สุดสำหรับงานนาฬิกา ให้ความงาม ความแข็งแรง และความคุ้มค่า เราใช้สแตนเลส 316L ทนต่อการกัดกร่อนและเงางามหลังขัดเงา เหมาะทั้งการใช้งานประจำวันและสถานการณ์เข้มข้น'
        : 'Stainless steel is certainly the most conventional of watchmaking materials for outer craftsmanship, and offers beauty, strength and affordability. We use 316L stainless steel. Known for its corrosion-resistance and high lustre after polishing, this material is often the ideal choice for watches in both daily-use and high-stress situations.',
      tag: caseMat
    },
    {
      title: isTh ? 'กระจกแซฟไฟร์' : 'Sapphire Crystal',
      desc: isTh
        ? 'กระจกแซฟไฟร์สังเคราะห์ทนรอยขีดข่วนระดับ 9 บนสเกลโมห์ (1-10) เคลือบกันสะท้อน มั่นใจว่ามองเห็นรายละเอียดได้ชัดเจนตลอดเวลา'
        : 'To really appreciate the finer details of a timepiece, we use synthetic sapphire crystal with a highly scratch-resistant and anti-reflective treatment. Graded 9 on the Mohs-hardness scale (graded 1-10), the resulting sapphire crystals are virtually scratch-proof and very hard, ensuring an unhindered vision at all times.',
      tag: crystal
    },
    {
      title: isTh ? 'วัสดุสาย' : 'Strap Material',
      desc: isTh
        ? 'วัสดุสายที่ผ่านการคัดสรรเพื่อความสบายและความทนทาน สวมใส่ได้ทุกวัน พร้อมหัวสายที่ล็อกแน่นหนา'
        : 'Carefully selected strap material for comfort and durability, with a secure buckle for all-day wear.',
      tag: strapMat
    }
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

function prevImg() {
  activeImg.value = (activeImg.value - 1 + images.value.length) % images.value.length
}
function nextImg() {
  activeImg.value = (activeImg.value + 1) % images.value.length
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

function variantTitle(v: any) {
  return locale.value === 'en' && v.nameEn ? v.nameEn : v.nameTh || v.nameEn || v.name
}
function variantLabel(v: any) {
  return locale.value === 'en' ? (v.variantLabelEn || v.sku) : (v.variantLabelTh || v.sku)
}
function variantImage(v: any) {
  if (Array.isArray(v.images) && v.images[0]) return v.images[0]
  return v.image || '/images/op/watch-990-083-blue.png'
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
      <!-- Breadcrumb — OMEGA minimal, but keep Royal Sapphire white-text bar per brand rule -->
      <div class="op-detail__crumb">
        <div class="container op-detail__crumb-row">
          <NuxtLink :to="localePath('/')">{{ locale === 'th' ? 'หน้าแรก' : 'Home' }}</NuxtLink>
          <span>/</span>
          <NuxtLink :to="localePath('/products')">{{ locale === 'th' ? 'คอลเลกชัน' : 'Collections' }}</NuxtLink>
          <template v-if="product.brandSlug">
            <span>/</span>
            <NuxtLink :to="localePath(`/brands/${product.brandSlug}`)">{{ product.brandName || product.brandSlug }}</NuxtLink>
          </template>
          <span>/</span>
          <strong>{{ product.sku || title }}</strong>
        </div>
      </div>

      <!-- OMEGA-style two-column hero: Gallery left, Buy panel right -->
      <section class="op-detail__hero">
        <div class="container op-detail__main">
          <!-- Left: Gallery -->
          <div class="op-detail__gallery">
            <div class="op-detail__stage" @click="zoomOpen = true">
              <span v-if="discountPct > 0" class="op-detail__badge-disc">-{{ discountPct }}%</span>
              <span class="op-detail__badge-auth">✓ {{ locale === 'th' ? 'ของแท้ศูนย์ไทย 100%' : '100% Authentic Thailand' }}</span>
              <img
                :src="images[activeImg]"
                :alt="title"
                class="op-detail__img"
                referrerpolicy="no-referrer"
                @error="onDetailImgError"
              />
              <button v-if="images.length > 1" type="button" class="op-detail__nav op-detail__nav--prev" @click.stop="prevImg">‹</button>
              <button v-if="images.length > 1" type="button" class="op-detail__nav op-detail__nav--next" @click.stop="nextImg">›</button>
              <button type="button" class="op-detail__zoom-hint">🔍 {{ locale === 'th' ? 'คลิกขยายภาพ' : 'Click to zoom' }}</button>
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

            <div class="op-detail__gallery-actions">
              <span>♡ {{ locale === 'th' ? 'รายการโปรด' : 'Favourites' }}</span>
              <span>⇄ {{ locale === 'th' ? 'เปรียบเทียบ' : 'Compare' }}</span>
              <span>⌚ {{ locale === 'th' ? 'บนข้อมือ' : 'On your wrist' }}</span>
            </div>
          </div>

          <!-- Right: Buy panel (OMEGA: title, ref, price, Add to basket, Contact boutique) -->
          <div class="op-detail__info">
            <div class="op-detail__brand-row">
              <NuxtLink
                v-if="product.brandSlug"
                :to="localePath(`/brands/${product.brandSlug}`)"
                class="op-detail__brand-link"
              >
                {{ product.brandName || product.brandSlug }}
              </NuxtLink>
              <span class="op-detail__sku-tag">{{ product.sku || product.slug }}</span>
            </div>

            <h1 class="op-detail__title">{{ shortTitle || title }}</h1>
            <p class="op-detail__subtitle">{{ title }}</p>

            <div class="op-detail__price-block">
              <div class="op-detail__price-line">
                <span class="op-detail__price-now">{{ fmt(product.price) }}</span>
                <span v-if="compareAt > Number(product.price || 0)" class="price-compare">
                  {{ fmt(compareAt) }}
                </span>
                <span v-if="savingsAmt > 0" class="op-detail__save-pill">
                  {{ locale === 'th' ? `ประหยัด ${fmt(savingsAmt)} (-${discountPct}%)` : `Save ${fmt(savingsAmt)}` }}
                </span>
              </div>
              <p class="op-detail__price-note">
                {{ locale === 'th' ? 'ชำระด้วยบัตรเครดิต 0% นานสูงสุด 10 เดือน · ส่งด่วนฟรีทั่วไทย' : '0% instalments up to 10 months · Free express delivery in Thailand' }}
              </p>
              <div class="op-detail__points-bar">
                <span>💎 <strong>OP Points:</strong> {{ locale === 'th' ? `รับ +${pointsEarn} คะแนน` : `Earn +${pointsEarn} points` }}</span>
              </div>
            </div>

            <div v-if="coupons.length" class="op-detail__coupons">
              <div class="op-detail__coupons-label">{{ locale === 'th' ? '🎟 คูปองส่วนลดที่ใช้ได้:' : '🎟 Available Vouchers:' }}</div>
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
                  <strong>{{ savedCoupons.includes(cp.code) ? '✓' : 'เก็บ' }}</strong>
                </button>
              </div>
            </div>

            <div class="op-detail__gwp">
              <span>🎁</span>
              <div>
                <strong>{{ locale === 'th' ? 'ห่อของขวัญฟรี & การ์ดอวยพร' : 'Complimentary gift wrapping' }}</strong>
                <p>{{ locale === 'th' ? 'ฟรี! ห่อโบว์ซาติน Royal Sapphire พร้อมการ์ดอวยพร' : 'Free Royal Sapphire satin gift wrapping & greeting card.' }}</p>
              </div>
            </div>

            <div class="op-detail__wrist">
              <label>{{ locale === 'th' ? 'ขนาดข้อมือ (สำหรับปรับสายฟรี):' : 'Wrist size (for complimentary sizing):' }}</label>
              <select v-model="wristSize" class="select">
                <option value="มาตรฐาน (ไม่ตัดสาย)">{{ locale === 'th' ? 'มาตรฐานจากโรงงาน (ไม่ตัดสาย)' : 'Factory standard (no cutting)' }}</option>
                <option value="14.5 ซม.">14.5 {{ locale === 'th' ? 'ซม.' : 'cm' }}</option>
                <option value="15.5 ซม.">15.5 {{ locale === 'th' ? 'ซม.' : 'cm' }}</option>
                <option value="16.5 ซม.">16.5 {{ locale === 'th' ? 'ซม.' : 'cm' }}</option>
                <option value="17.5 ซม.">17.5 {{ locale === 'th' ? 'ซม.' : 'cm' }}</option>
                <option value="18.5 ซม.">18.5 {{ locale === 'th' ? 'ซม.' : 'cm' }}</option>
                <option value="19.5 ซม.">19.5 {{ locale === 'th' ? 'ซม.' : 'cm' }}</option>
              </select>
            </div>

            <div class="op-detail__buy">
              <div class="op-detail__qty">
                <button type="button" @click="qty = Math.max(1, qty - 1)">−</button>
                <span>{{ qty }}</span>
                <button type="button" @click="qty = Math.min(Number(product.stock || 99), qty + 1)">+</button>
              </div>
              <button
                type="button"
                class="op-detail__add-btn"
                :disabled="product.stock !== undefined && Number(product.stock) <= 0"
                @click="addItemToCart(false)"
              >
                {{
                  product.stock !== undefined && Number(product.stock) <= 0
                    ? t('common.outOfStock')
                    : locale === 'th' ? 'หยิบใส่ตะกร้า' : 'Add to basket'
                }}
              </button>
            </div>
            <button
              type="button"
              class="op-detail__buynow-btn"
              :disabled="product.stock !== undefined && Number(product.stock) <= 0"
              @click="addItemToCart(true)"
            >
              {{ locale === 'th' ? 'ซื้อเลยทันที' : 'Buy Now' }}
            </button>

            <div class="op-detail__omni">
              <button type="button" class="op-detail__omni-btn" @click="branchModal = !branchModal">
                📍 {{ locale === 'th' ? 'ติดต่อบูติก / เช็คสาขา' : 'Contact a boutique' }}
              </button>
              <a
                v-if="product.shopeeUrl"
                :href="product.shopeeUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="op-detail__omni-btn op-detail__omni-btn--sp"
              >
                🛍 Shopee Official ↗
              </a>
              <a
                href="https://line.me/ti/p/~opwatch.th"
                target="_blank"
                rel="noopener noreferrer"
                class="op-detail__omni-btn op-detail__omni-btn--line"
              >
                💬 LINE
              </a>
            </div>

            <div v-if="branchModal && branches.length" class="op-detail__branches">
              <strong>{{ locale === 'th' ? 'สาขาที่รับสินค้า (Click & Collect):' : 'Click & Collect branches:' }}</strong>
              <div v-for="b in branches.slice(0, 4)" :key="b.slug" class="op-detail__branch-row">
                <div>
                  <strong>{{ b.nameTh }}</strong>
                  <small class="block muted">{{ b.province }} · {{ b.phone }}</small>
                </div>
                <span class="badge">✓</span>
              </div>
              <NuxtLink :to="localePath('/branches')" class="tiny" style="color:var(--sapphire);font-weight:700">{{ locale === 'th' ? 'ดูสาขาทั้งหมด →' : 'View all branches →' }}</NuxtLink>
            </div>

            <div class="op-detail__guarantees">
              <div>🛡 {{ locale === 'th' ? 'รับประกันศูนย์ไทย 2 ปี' : '2-Year Thailand Warranty' }}</div>
              <div>🚚 {{ locale === 'th' ? 'ส่งด่วนฟรีทั่วไทย' : 'Free express delivery' }}</div>
              <div>🔄 {{ locale === 'th' ? 'เปลี่ยน/คืนใน 14 วัน' : '14-day returns' }}</div>
              <div>💎 {{ locale === 'th' ? 'กระจกแซฟไฟร์แท้' : 'Genuine sapphire' }}</div>
            </div>
          </div>
        </div>

        <!-- OMEGA trust strip -->
        <div class="container op-detail__trust">
          <div><span>🚚</span><strong>{{ locale === 'th' ? 'จัดส่งและคืนสินค้าฟรี' : 'Complimentary Delivery and Returns' }}</strong></div>
          <div><span>🔒</span><strong>{{ locale === 'th' ? 'ชำระเงินปลอดภัย' : 'Secure Payment' }}</strong></div>
          <div><span>🛡</span><strong>{{ locale === 'th' ? 'รับประกันศูนย์ไทย 2 ปี' : '2-Year Warranty' }}</strong></div>
          <div><span>🇹🇭</span><strong>{{ locale === 'th' ? 'ผลิตและจำหน่ายในไทย' : 'Official Thailand' }}</strong></div>
        </div>

        <!-- Variations (OMEGA: horizontal cards) -->
        <div v-if="variations.length > 1" class="container op-detail__variations">
          <div class="op-detail__section-head">
            <h2>{{ locale === 'th' ? 'รุ่นใกล้เคียงในคอลเลกชันเดียวกัน' : 'Variations in this collection' }}</h2>
            <span>{{ variations.length }} {{ locale === 'th' ? 'แบบ' : 'variations' }}</span>
          </div>
          <div class="op-detail__var-row">
            <NuxtLink
              v-for="v in (showAllVariations ? variations : variations.slice(0, 6))"
              :key="v.id || v.slug"
              :to="localePath(`/products/${v.slug}`)"
              class="op-detail__var-card"
              :class="{ 'is-current': v.isCurrentVariation }"
            >
              <img :src="variantImage(v)" :alt="variantTitle(v)" loading="lazy" referrerpolicy="no-referrer" />
              <div class="op-detail__var-body">
                <strong>{{ variantLabel(v) }}</strong>
                <small>{{ v.sku }}</small>
                <span class="op-detail__var-price">{{ fmt(v.price) }}</span>
                <span class="op-detail__var-cta">{{ v.isCurrentVariation ? (locale === 'th' ? 'รุ่นที่เลือก' : 'Selected') : (locale === 'th' ? 'ดูรุ่นนี้' : 'Shop now') }}</span>
              </div>
            </NuxtLink>
          </div>
          <button v-if="variations.length > 6" type="button" class="op-detail__more-btn" @click="showAllVariations = !showAllVariations">
            {{ showAllVariations ? (locale === 'th' ? 'แสดงน้อยลง' : 'Show less') : (locale === 'th' ? `ดูอีก ${variations.length - 6} รุ่น` : `See ${variations.length - 6} more`) }}
          </button>
        </div>
      </section>

      <!-- Description (OMEGA centered) -->
      <section class="op-detail__desc">
        <div class="container op-detail__desc-inner">
          <span class="eyebrow">{{ locale === 'th' ? 'คำอธิบาย' : 'Description' }}</span>
          <h2 class="op-detail__desc-title">{{ shortTitle || title }}</h2>
          <div class="op-detail__rich-desc">
            <div v-if="hasHtmlDescription" v-html="description" />
            <p v-else>{{ description }}</p>
          </div>
          <div v-if="product.aseoSummary" class="op-detail__aseo-box">
            <strong>{{ locale === 'th' ? `จุดเด่นของรุ่น ${product.sku || ''}:` : `Highlights of ${product.sku || ''}:` }}</strong>
            <p>{{ product.aseoSummary }}</p>
          </div>
        </div>
      </section>

      <!-- Features (OMEGA 8-grid) -->
      <section class="op-detail__features">
        <div class="container">
          <div class="op-detail__section-head op-detail__section-head--center">
            <h2>{{ locale === 'th' ? 'คุณสมบัติพิเศษ' : 'Features' }}</h2>
          </div>
          <div class="op-detail__feature-grid">
            <article v-for="f in featureList" :key="f.key" class="op-detail__feature-card">
              <span class="op-detail__feature-icon">{{ f.icon }}</span>
              <h3>{{ f.title }}</h3>
              <p>{{ f.desc }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- Technical Data + Case Measurements + Strap (OMEGA tables) -->
      <section class="op-detail__tech">
        <div class="container op-detail__tech-grid">
          <div class="op-detail__tech-col">
            <h2>{{ locale === 'th' ? 'ข้อมูลทางเทคนิค' : 'Technical Data' }}</h2>
            <table class="op-specs op-specs--omega">
              <tbody>
                <tr v-for="row in technicalRows" :key="row.label">
                  <th>{{ row.label }}</th>
                  <td>{{ row.value }}</td>
                </tr>
              </tbody>
            </table>

            <h3 class="op-detail__subhead">{{ locale === 'th' ? 'การวัดตัวเรือน' : 'Case Measurements' }}</h3>
            <ol class="op-detail__measure-list">
              <li><strong>{{ locale === 'th' ? 'ระหว่างหูสาย' : 'Between lugs' }}</strong> — {{ locale === 'th' ? 'วัดช่องว่างสำหรับสาย' : 'This measures the space where a strap or bracelet would be placed.' }}</li>
              <li><strong>{{ locale === 'th' ? 'จากหูถึงหู' : 'Lug-to-lug' }}</strong> — {{ locale === 'th' ? 'ความยาวเต็มตัวเรือนจากหูบนถึงหูล่าง' : 'This is the full length of the case, from the top lugs to the bottom lugs.' }}</li>
              <li><strong>{{ locale === 'th' ? 'เส้นผ่านศูนย์กลาง' : 'Case diameter' }}</strong> — {{ locale === 'th' ? 'ความกว้างเต็มตัวเรือน ไม่รวมเม็ดมะยม' : 'This is the full width of the watch’s case, excluding the crown and pushers.' }}</li>
              <li><strong>{{ locale === 'th' ? 'ความหนา' : 'Thickness' }}</strong> — {{ locale === 'th' ? 'วัดจากด้านข้าง จากฐานถึงผิวกระจก' : 'When viewed from the side, this measures from the base of the watch to the surface of the glass.' }}</li>
            </ol>
          </div>

          <div class="op-detail__tech-col">
            <h2>{{ locale === 'th' ? 'สาย' : 'Strap' }}</h2>
            <table class="op-specs op-specs--omega">
              <tbody>
                <tr v-for="row in strapRows" :key="row.label">
                  <th>{{ row.label }}</th>
                  <td>{{ row.value }}</td>
                </tr>
              </tbody>
            </table>

            <div class="op-detail__manual-box">
              <h3>{{ locale === 'th' ? 'คู่มือผู้ใช้' : 'User manual' }}</h3>
              <ul>
                <li><a :href="localePath('/warranty')" target="_blank" rel="noopener">{{ locale === 'th' ? 'คู่มือการใช้งาน (PDF)' : 'User manual (PDF)' }}</a></li>
                <li><a :href="localePath('/warranty')" target="_blank" rel="noopener">{{ locale === 'th' ? 'คำแนะนำการใช้งานเพิ่มเติม (PDF)' : 'Extended Operating Instructions (PDF)' }}</a></li>
                <li><a :href="localePath('/pages/return-policy')" target="_blank" rel="noopener">{{ locale === 'th' ? 'ใบข้อมูลสินค้า (PDF)' : 'Product sheet (PDF)' }}</a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Key materials (OMEGA) -->
      <section class="op-detail__materials">
        <div class="container">
          <div class="op-detail__section-head op-detail__section-head--center">
            <h2>{{ locale === 'th' ? 'วัสดุสำคัญ' : 'Key materials' }}</h2>
          </div>
          <div class="op-detail__material-grid">
            <article v-for="m in keyMaterials" :key="m.title" class="op-detail__material-card">
              <span class="op-detail__material-tag">{{ m.tag }}</span>
              <h3>{{ m.title }}</h3>
              <p>{{ m.desc }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- A new look for your watch (OMEGA strap configurator adapted) -->
      <section class="op-detail__look">
        <div class="container op-detail__look-inner">
          <span class="eyebrow">{{ locale === 'th' ? 'ลุคใหม่สำหรับนาฬิกาของคุณ' : 'A new look for your watch' }}</span>
          <h2>{{ locale === 'th' ? 'เปลี่ยนสาย เปลี่ยนลุค' : 'Find your perfect strap' }}</h2>
          <p>
            {{ locale === 'th'
              ? 'นาฬิกาและสายควรเข้ากันอย่างสมบูรณ์แบบ แต่คุณสามารถทดลองผสมผสานได้ ลองดูรุ่นใกล้เคียงเพื่อค้นหาลุคที่เป็นตัวคุณ'
              : 'Your watch and strap should go together perfectly, but that doesn\'t mean you can\'t experiment with different combinations. Why not mix things up and see what happens?' }}
          </p>
          <div v-if="brandProducts.length" class="op-detail__look-row">
            <NuxtLink
              v-for="bp in brandProducts.slice(0, 4)"
              :key="bp.id || bp.slug"
              :to="localePath(`/products/${bp.slug}`)"
              class="op-detail__look-card"
            >
              <img :src="variantImage(bp)" :alt="variantTitle(bp)" loading="lazy" referrerpolicy="no-referrer" />
              <strong>{{ variantLabel(bp) }}</strong>
              <small>{{ bp.sku }}</small>
              <span>{{ fmt(bp.price) }}</span>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Delivery / Warranty / FAQ (kept from Central, restyled OMEGA-clean) -->
      <section class="op-detail__info-blocks">
        <div class="container op-detail__info-grid">
          <div class="op-detail__info-card">
            <h3>🚚 {{ locale === 'th' ? 'การจัดส่ง & รับที่สาขา' : 'Delivery & Click & Collect' }}</h3>
            <p>{{ locale === 'th' ? 'จัดส่งด่วนฟรีทั่วไทย 1–3 วันทำการ พร้อมประกันพัสดุ หรือรับที่โชว์รูม อินเตอร์ไทมส์ ถนนเพชรบุรีตัดใหม่ พร้อมตัดสายฟรี' : 'Free express delivery in Thailand within 1–3 business days with full parcel insurance, or collect at Inter Times showroom with complimentary sizing.' }}</p>
          </div>
          <div class="op-detail__info-card">
            <h3>🔄 {{ locale === 'th' ? 'เปลี่ยน/คืนภายใน 14 วัน' : '14-Day Returns' }}</h3>
            <p>{{ locale === 'th' ? 'สินค้ามีตำหนิจากการผลิตหรือเสียหายจากการขนส่ง เปลี่ยนเรือนใหม่หรือคืนเงินเต็มได้ภายใน 14 วัน' : 'If the item has a manufacturing defect or transit damage, exchange or full refund within 14 days.' }} <NuxtLink :to="localePath('/pages/return-policy')" class="op-detail__inline-link">{{ locale === 'th' ? 'อ่านเพิ่มเติม' : 'Read more' }}</NuxtLink></p>
          </div>
          <div class="op-detail__info-card">
            <h3>🛡 {{ locale === 'th' ? 'รับประกันศูนย์ไทย 2 ปี' : '2-Year Thailand Warranty' }}</h3>
            <p>{{ locale === 'th' ? 'โดย บริษัท อินเตอร์ไทมส์ จำกัด ผู้นำเข้า Olym Pianus, Olympia Star และ Ogival อย่างเป็นทางการ พร้อมกล่อง คู่มือ และใบรับประกันครบชุด' : 'By Inter Times Co., Ltd., the official distributor of Olym Pianus, Olympia Star and Ogival in Thailand, with box, manual and warranty card.' }}</p>
          </div>
        </div>
      </section>

      <section v-if="aseoFaqs.length" class="op-detail__faq">
        <div class="container">
          <div class="op-detail__section-head op-detail__section-head--center">
            <h2>{{ locale === 'th' ? 'คำถามที่พบบ่อย' : 'Frequently Asked Questions' }}</h2>
          </div>
          <div class="op-detail__faq-list">
            <div v-for="(f, idx) in aseoFaqs" :key="idx" class="op-detail__faq-item">
              <strong>Q: {{ f.q }}</strong>
              <p>A: {{ f.a }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Related (OMEGA carousel style) -->
      <section v-if="related.length" class="op-detail__related">
        <div class="container">
          <div class="op-detail__section-head op-detail__section-head--center">
            <h2>{{ locale === 'th' ? 'เรือนเวลาที่คุณอาจสนใจ' : 'You may also like' }}</h2>
          </div>
          <div class="op-detail__related-grid">
            <ProductCard v-for="item in related.slice(0, 4)" :key="item.id || item.slug" :product="item" />
          </div>
        </div>
      </section>

      <!-- Lightbox -->
      <Transition name="fade-drop">
        <div v-if="zoomOpen" class="op-zoom-modal" @click.self="zoomOpen = false">
          <button type="button" class="op-zoom-modal__close" @click="zoomOpen = false">✕ {{ locale === 'th' ? 'ปิด' : 'Close' }}</button>
          <img :src="images[activeImg]" :alt="title" />
        </div>
      </Transition>
    </template>
  </div>
</template>

<style scoped>
.op-detail { background: #ffffff; color: var(--ink-soft); }

/* Breadcrumb — keep Royal Sapphire white-text rule */
.op-detail__crumb {
  background: linear-gradient(135deg, #101444 0%, #1d2088 100%);
  color: #ffffff;
  padding-block: 14px;
}
.op-detail__crumb-row {
  display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
  font-size: 12.5px; color: rgba(255,255,255,0.85);
}
.op-detail__crumb-row a { color: #ffffff; }
.op-detail__crumb-row a:hover { text-decoration: underline; }
.op-detail__crumb-row strong { color: #ffffff; font-weight: 600; }

/* Hero two-column */
.op-detail__hero { padding: 36px 0 8px; }
.op-detail__main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 56px;
  align-items: start;
}

/* Gallery — OMEGA clean white stage */
.op-detail__stage {
  position: relative;
  aspect-ratio: 1 / 1.08;
  background: #ffffff;
  border: 1px solid #eceef4;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  cursor: zoom-in;
}
.op-detail__img { max-height: 100%; width: auto; object-fit: contain; transition: transform 0.5s var(--ease); }
.op-detail__stage:hover .op-detail__img { transform: scale(1.03); }
.op-detail__badge-disc {
  position: absolute; top: 14px; right: 14px;
  background: #111; color: #fff; font-weight: 700; font-size: 12px;
  padding: 5px 10px; letter-spacing: 0.06em;
}
.op-detail__badge-auth {
  position: absolute; top: 14px; left: 14px;
  background: #fff; color: var(--sapphire); font-weight: 700; font-size: 11px;
  padding: 5px 10px; border: 1px solid #dfe3f5; letter-spacing: 0.04em;
}
.op-detail__nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 38px; height: 38px; border-radius: 50%;
  border: 1px solid #e2e4ee; background: rgba(255,255,255,0.94);
  font-size: 22px; line-height: 1; color: #111; cursor: pointer;
}
.op-detail__nav--prev { left: 12px; }
.op-detail__nav--next { right: 12px; }
.op-detail__zoom-hint {
  position: absolute; bottom: 12px; right: 12px;
  background: rgba(255,255,255,0.94); border: 1px solid #e2e4ee;
  padding: 5px 12px; font-size: 11.5px; color: var(--ink-soft); cursor: pointer;
}
.op-detail__thumbs {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
  gap: 10px;
}
.op-detail__thumb {
  aspect-ratio: 1; padding: 8px; background: #fff;
  border: 1px solid #eceef4; cursor: pointer;
}
.op-detail__thumb.is-active { border: 1.5px solid #111; }
.op-detail__thumb img { width: 100%; height: 100%; object-fit: contain; }
.op-detail__gallery-actions {
  margin-top: 14px; display: flex; gap: 22px; flex-wrap: wrap;
  font-size: 12.5px; color: var(--ink-muted);
}

/* Buy panel — OMEGA typography */
.op-detail__brand-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.op-detail__brand-link {
  font-size: 11.5px; font-weight: 700; letter-spacing: 0.18em;
  color: var(--sapphire); text-transform: uppercase;
}
.op-detail__sku-tag { font-size: 12px; color: var(--ink-muted); font-family: ui-monospace, monospace; letter-spacing: 0.04em; }
.op-detail__title {
  font-family: var(--font-sans);
  font-size: clamp(1.7rem, 2.6vw, 2.35rem);
  font-weight: 600; color: #111; line-height: 1.2; letter-spacing: -0.01em;
  margin-top: 10px;
}
.op-detail__subtitle { margin-top: 8px; font-size: 14.5px; color: var(--ink-muted); line-height: 1.6; }
.op-detail__price-block { margin-top: 18px; padding-top: 18px; border-top: 1px solid #eceef4; }
.op-detail__price-line { display: flex; align-items: baseline; flex-wrap: wrap; gap: 12px; }
.op-detail__price-now { font-size: 30px; font-weight: 700; color: #111; letter-spacing: -0.01em; }
.op-detail__price-note { margin-top: 6px; font-size: 12.5px; color: var(--ink-muted); }
.op-detail__save-pill {
  background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca;
  font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 999px;
}
.op-detail__points-bar { margin-top: 10px; font-size: 13px; color: var(--ink-soft); }
.op-detail__coupons { margin-top: 14px; }
.op-detail__coupons-label { font-size: 12.5px; font-weight: 700; color: #111; margin-bottom: 8px; }
.op-detail__coupon-list { display: flex; flex-wrap: wrap; gap: 8px; }
.op-detail__coupon-pill {
  display: inline-flex; align-items: center; gap: 8px;
  background: #fff5f5; border: 1px dashed #ef4444; color: #b91c1c;
  padding: 6px 12px; font-size: 12px; cursor: pointer;
}
.op-detail__coupon-pill.is-saved { background: #ecfdf5; border-color: #10b981; color: #065f46; }
.op-detail__gwp {
  margin-top: 14px; display: flex; gap: 10px; align-items: flex-start;
  background: #f8f9fd; border: 1px solid #e6e9f5; padding: 12px 14px; font-size: 13px;
}
.op-detail__gwp p { color: var(--ink-muted); font-size: 12.5px; margin-top: 2px; }
.op-detail__wrist { margin-top: 14px; }
.op-detail__wrist label { display: block; font-size: 12.5px; font-weight: 700; color: #111; margin-bottom: 6px; }
.op-detail__buy { margin-top: 16px; display: flex; gap: 10px; }
.op-detail__qty { display: inline-flex; align-items: center; border: 1px solid #d9dce8; }
.op-detail__qty button { width: 42px; height: 48px; font-size: 18px; background: transparent; border: 0; cursor: pointer; }
.op-detail__qty span { min-width: 38px; text-align: center; font-weight: 700; color: #111; }
.op-detail__add-btn {
  flex: 1; height: 48px; background: #111; color: #fff; border: 0;
  font-size: 14px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
}
.op-detail__add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.op-detail__buynow-btn {
  margin-top: 10px; width: 100%; height: 48px;
  background: #fff; color: #111; border: 1px solid #111;
  font-size: 14px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
}
.op-detail__buynow-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.op-detail__omni { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px; }
.op-detail__omni-btn {
  padding: 9px 12px; font-size: 12.5px; font-weight: 600;
  border: 1px solid #d9dce8; background: #fff; color: #111; cursor: pointer;
}
.op-detail__omni-btn--sp { border-color: #fed7aa; background: #fff7ed; color: #c2410c; }
.op-detail__omni-btn--line { border-color: #bbf7d0; background: #f0fdf4; color: #15803d; }
.op-detail__branches {
  margin-top: 12px; background: #f8fafc; border: 1px solid #e2e4ee;
  padding: 14px; display: flex; flex-direction: column; gap: 8px; font-size: 13px;
}
.op-detail__branch-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding-top: 6px; border-top: 1px solid #eceef4; }
.op-detail__guarantees {
  margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  font-size: 12.5px; color: var(--ink-muted); padding-top: 14px; border-top: 1px solid #eceef4;
}

/* Trust strip */
.op-detail__trust {
  margin-top: 28px; padding: 18px 0 22px;
  border-top: 1px solid #eceef4; border-bottom: 1px solid #eceef4;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
}
.op-detail__trust div { display: flex; align-items: center; gap: 10px; font-size: 12.5px; }
.op-detail__trust span { font-size: 20px; }
.op-detail__trust strong { color: #111; font-weight: 600; }

/* Variations */
.op-detail__variations { padding: 36px 0 8px; }
.op-detail__section-head {
  display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap;
  margin-bottom: 18px;
}
.op-detail__section-head h2 { font-family: var(--font-sans); font-size: 20px; font-weight: 700; color: #111; letter-spacing: -0.01em; }
.op-detail__section-head span { font-size: 12.5px; color: var(--ink-muted); }
.op-detail__section-head--center { justify-content: center; text-align: center; }
.op-detail__var-row {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px;
}
.op-detail__var-card {
  border: 1px solid #eceef4; background: #fff; display: flex; flex-direction: column;
  transition: border-color 0.25s ease, transform 0.25s ease;
}
.op-detail__var-card:hover { border-color: #111; transform: translateY(-2px); }
.op-detail__var-card.is-current { border: 1.5px solid #111; background: #f8f9fd; }
.op-detail__var-card img { width: 100%; aspect-ratio: 1; object-fit: contain; padding: 14px; background: #fff; }
.op-detail__var-body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 4px; }
.op-detail__var-body strong { font-size: 13px; color: #111; line-height: 1.4; }
.op-detail__var-body small { font-size: 11.5px; color: var(--ink-muted); font-family: ui-monospace, monospace; }
.op-detail__var-price { margin-top: 6px; font-weight: 700; color: #111; }
.op-detail__var-cta { margin-top: 6px; font-size: 12px; font-weight: 700; color: var(--sapphire); text-transform: uppercase; letter-spacing: 0.06em; }
.op-detail__more-btn {
  margin-top: 16px; padding: 10px 18px; border: 1px solid #111; background: #fff;
  font-size: 12.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
}

/* Description */
.op-detail__desc { padding: 48px 0 8px; }
.op-detail__desc-inner { max-width: 760px; margin-inline: auto; text-align: center; }
.op-detail__desc-title { font-family: var(--font-sans); font-size: 26px; font-weight: 700; color: #111; margin-top: 10px; }
.op-detail__rich-desc { margin-top: 16px; font-size: 15.5px; line-height: 1.85; color: var(--ink-soft); text-align: left; }
.op-detail__aseo-box {
  margin-top: 18px; text-align: left; background: #f8f9fd; border-left: 3px solid var(--sapphire);
  padding: 14px 18px; font-size: 14px;
}

/* Features */
.op-detail__features { padding: 44px 0 8px; }
.op-detail__feature-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.op-detail__feature-card {
  border: 1px solid #eceef4; padding: 20px 18px; background: #fff;
}
.op-detail__feature-icon { font-size: 26px; }
.op-detail__feature-card h3 { font-family: var(--font-sans); font-size: 15px; font-weight: 700; color: #111; margin-top: 10px; }
.op-detail__feature-card p { margin-top: 8px; font-size: 13px; line-height: 1.7; color: var(--ink-muted); }

/* Tech */
.op-detail__tech { padding: 44px 0 8px; }
.op-detail__tech-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
.op-detail__tech-col h2 { font-family: var(--font-sans); font-size: 20px; font-weight: 700; color: #111; margin-bottom: 16px; }
.op-detail__subhead { font-family: var(--font-sans); font-size: 16px; font-weight: 700; color: #111; margin: 22px 0 10px; }
.op-specs--omega { width: 100%; border-collapse: collapse; border: 1px solid #eceef4; }
.op-specs--omega th, .op-specs--omega td { padding: 11px 14px; text-align: left; border-bottom: 1px solid #eceef4; font-size: 13.5px; vertical-align: top; }
.op-specs--omega th { width: 42%; font-weight: 600; color: #111; background: #f8f9fd; }
.op-specs--omega td { color: var(--ink-soft); }
.op-detail__measure-list { margin: 0; padding-left: 20px; font-size: 13.5px; line-height: 1.8; color: var(--ink-muted); }
.op-detail__measure-list strong { color: #111; }
.op-detail__manual-box { margin-top: 22px; border: 1px solid #eceef4; padding: 16px 18px; }
.op-detail__manual-box h3 { font-family: var(--font-sans); font-size: 15px; font-weight: 700; color: #111; margin-bottom: 8px; }
.op-detail__manual-box ul { margin: 0; padding-left: 18px; font-size: 13.5px; line-height: 1.9; }
.op-detail__manual-box a { color: var(--sapphire); text-decoration: underline; }

/* Materials */
.op-detail__materials { padding: 44px 0 8px; }
.op-detail__material-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.op-detail__material-card { border: 1px solid #eceef4; padding: 22px 20px; background: #fff; }
.op-detail__material-tag {
  display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--sapphire); background: #eef0fa; padding: 4px 8px; margin-bottom: 10px;
}
.op-detail__material-card h3 { font-family: var(--font-sans); font-size: 16px; font-weight: 700; color: #111; }
.op-detail__material-card p { margin-top: 10px; font-size: 13.5px; line-height: 1.75; color: var(--ink-muted); }

/* Look */
.op-detail__look { padding: 48px 0; background: #f8f9fd; border-top: 1px solid #eceef4; border-bottom: 1px solid #eceef4; margin-top: 36px; }
.op-detail__look-inner { text-align: center; max-width: 900px; margin-inline: auto; }
.op-detail__look-inner h2 { font-family: var(--font-sans); font-size: 24px; font-weight: 700; color: #111; margin-top: 10px; }
.op-detail__look-inner > p { margin: 12px auto 0; max-width: 640px; font-size: 14.5px; line-height: 1.8; color: var(--ink-muted); }
.op-detail__look-row { margin-top: 24px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; text-align: left; }
.op-detail__look-card { background: #fff; border: 1px solid #eceef4; padding: 14px; display: flex; flex-direction: column; gap: 4px; }
.op-detail__look-card img { width: 100%; aspect-ratio: 1; object-fit: contain; background: #fff; }
.op-detail__look-card strong { font-size: 13px; color: #111; line-height: 1.4; }
.op-detail__look-card small { font-size: 11.5px; color: var(--ink-muted); font-family: ui-monospace, monospace; }
.op-detail__look-card span { font-weight: 700; color: #111; }

/* Info blocks */
.op-detail__info-blocks { padding: 40px 0 8px; }
.op-detail__info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.op-detail__info-card { border: 1px solid #eceef4; padding: 20px; }
.op-detail__info-card h3 { font-family: var(--font-sans); font-size: 15px; font-weight: 700; color: #111; }
.op-detail__info-card p { margin-top: 8px; font-size: 13.5px; line-height: 1.75; color: var(--ink-muted); }
.op-detail__inline-link { color: var(--sapphire); text-decoration: underline; }

/* FAQ */
.op-detail__faq { padding: 36px 0 8px; }
.op-detail__faq-list { max-width: 760px; margin-inline: auto; display: flex; flex-direction: column; gap: 10px; }
.op-detail__faq-item { border: 1px solid #eceef4; padding: 14px 18px; }
.op-detail__faq-item strong { color: #111; }
.op-detail__faq-item p { margin-top: 4px; color: var(--ink-muted); font-size: 14px; }

/* Related */
.op-detail__related { padding: 44px 0 64px; }
.op-detail__related-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }

/* Lightbox */
.op-zoom-modal {
  position: fixed; inset: 0; z-index: 120; background: rgba(8, 10, 26, 0.92);
  display: grid; place-items: center; padding: 24px;
}
.op-zoom-modal img { max-width: min(900px, 92vw); max-height: 86vh; object-fit: contain; background: #fff; padding: 18px; }
.op-zoom-modal__close {
  position: fixed; top: 22px; right: 24px; background: #fff; color: #111;
  border: 0; padding: 8px 18px; font-weight: 700; cursor: pointer;
}

@media (max-width: 1080px) {
  .op-detail__feature-grid { grid-template-columns: repeat(2, 1fr); }
  .op-detail__material-grid { grid-template-columns: 1fr; }
  .op-detail__look-row { grid-template-columns: repeat(2, 1fr); }
  .op-detail__info-grid { grid-template-columns: 1fr; }
}
@media (max-width: 960px) {
  .op-detail__main { grid-template-columns: 1fr; gap: 32px; }
  .op-detail__tech-grid { grid-template-columns: 1fr; gap: 32px; }
  .op-detail__trust { grid-template-columns: repeat(2, 1fr); }
  .op-detail__related-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .op-detail__guarantees { grid-template-columns: 1fr; }
}
@media (max-width: 560px) {
  .op-detail__feature-grid { grid-template-columns: 1fr; }
  .op-detail__look-row { grid-template-columns: 1fr; }
  .op-detail__buy { flex-direction: column; }
  .op-detail__qty { justify-content: center; }
}
</style>
