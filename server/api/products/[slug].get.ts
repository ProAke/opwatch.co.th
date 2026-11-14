import { ensureCatalogReady } from '../../utils/seed'

const LEGACY_SLUG_MAP: Record<string, string> = {
  'ol-m2001': 'olympianus-130-07mk-gl-white',
  'ol-m2002': 'olympianus-899833g1m-black',
  'ol-l3001': 'olympianus-82672lk',
  'ol-l3002': 'olympianus-130-06ls-gl-white',
  'ol-s4001': 'olympianus-899831g1s-green',
  'ol-c5001': 'olympianus-99141-71agsk-white',
  'ow-m1001': 'olympianus-990-083amsk-blue',
  'ow-m1002': 'olympianus-899832ags-black',
  'ow-l2001': 'olympianus-130-06lk-gl-white',
  'ow-l2002': 'olympianus-24591dlr-white',
  'ow-s3001': 'olympianus-899832ags-black',
  'ow-c4001': 'olympianus-99141-71agsk-white',
  'ow-k1001': 'olympia-star-opa58062mk-white',
  'opwatch-thailand-open-heart-blue-42': 'olympia-star-opa58012msk-blue',
  'opwatch-thailand-emerald-sport-40': 'olympia-star-opa58029ms-emerald',
  'opwatch-thailand-classic-slim-gold-39': 'olympia-star-opa58062mk-white',
  'opwatch-thailand-ladies-rose-crystal-34': 'olympia-star-opa28035dlr-white',
  'og-m6001': 'ogival-3365amk-10012495',
  'og-m6002': 'ogival-3811dgk-9127543',
  'og-l7001': 'ogival-380-45dlr-10519029',
  'og-l7002': 'ogival-305-23dlw-10515555',
  'og-s8001': 'ogival-30329bdms-10913142',
  'og-k9001': 'ogival-385-022lw-9111055'
}

function extractModelInfo(p: Record<string, any>) {
  const specs = p?.specs && typeof p.specs === 'object' ? p.specs : {}
  const rawModel = String(specs.Model || specs.Reference || p.sku || '')
    .replace(/^(OP-|OS-|OG-|OPA)/i, '')
    .trim()
  const exactModel = rawModel.split(/[-\s]/)[0]?.toUpperCase() || ''
  const stemMatch = rawModel.match(/^([A-Z]*\d{3,6})/i)
  const stem = stemMatch ? stemMatch[1].toUpperCase() : exactModel.slice(0, 5)
  return { exactModel, stem }
}

function buildVariantLabel(p: Record<string, any>) {
  const specs = p?.specs && typeof p.specs === 'object' ? p.specs : {}
  const nameEn = String(p.nameEn || p.name || '')
  const nameTh = String(p.nameTh || p.name || '')

  const enDashPart = nameEn.includes('—') ? nameEn.split('—').pop()?.trim() : ''
  const thParenMatch = nameTh.match(/\(([^()]*หน้าปัด[^()]*|[^()]*สาย[^()]*|[^()]*สี[^()]*)\)/)
  const dialEn = String(specs['Dial Color'] || '').trim()
  const strapRaw = String(specs['Strap Material'] || '').toLowerCase()
  const frameRaw = String(specs['Frame Color'] || '').toLowerCase()

  const strapEn = strapRaw.includes('leather')
    ? 'Leather strap'
    : strapRaw.includes('rubber') || strapRaw.includes('silicone')
      ? 'Rubber strap'
      : 'Steel bracelet'
  const strapTh = strapRaw.includes('leather') || nameTh.includes('สายหนัง')
    ? 'สายหนังแท้'
    : strapRaw.includes('rubber') || strapRaw.includes('silicone') || nameTh.includes('สายยาง')
      ? 'สายยางซิลิโคน'
      : 'สายสแตนเลสสตีล'

  const toneEn = frameRaw.includes('rose') || nameEn.toLowerCase().includes('rose gold')
    ? 'Rose Gold'
    : frameRaw.includes('gold') || nameEn.toLowerCase().includes('gold') || /mk|agk|gk|lk/i.test(String(p.sku || ''))
      ? 'Gold Tone'
      : 'Steel'
  const toneTh = toneEn === 'Rose Gold'
    ? 'ตัวเรือนพิงก์โกลด์'
    : toneEn === 'Gold Tone'
      ? 'ตัวเรือนสีทอง / ทูโทน'
      : 'ตัวเรือนสตีล'

  const labelEn = enDashPart || (dialEn ? `${toneEn} · ${dialEn.charAt(0).toUpperCase() + dialEn.slice(1)} Dial` : `${toneEn} on ${strapEn}`)
  const labelTh = thParenMatch?.[1] || `${toneTh} · ${strapTh}`

  return { variantLabelTh: labelTh, variantLabelEn: labelEn }
}

export default defineEventHandler(async (event) => {
  const rawSlug = String(getRouterParam(event, 'slug') || '').trim().toLowerCase()
  const mappedSlug = LEGACY_SLUG_MAP[rawSlug] || rawSlug
  const store = useStore()
  await ensureCatalogReady(store)

  let product = await store.findOne('products', { where: { slug: mappedSlug } })
  if (!product && mappedSlug !== rawSlug) {
    product = await store.findOne('products', { where: { slug: rawSlug } })
  }
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Product not found' })

  const related = await store.find(
    'products',
    { where: { categoryId: product.categoryId, status: 'active' }, orderBy: 'sortOrder', orderDir: 'asc', limit: 9 }
  )
  const reviews = await store.find(
    'reviews',
    { where: { productId: Number(product.id), status: 'approved' }, orderBy: 'createdAt', orderDir: 'desc' }
  )
  const category = product.categoryId ? await store.findById('categories', Number(product.categoryId)) : null
  const brand = product.brandId ? await store.findById('brands', Number(product.brandId)) : null
  const allBrands = await store.all('brands')
  const brandById = new Map(allBrands.map((b) => [Number(b.id), b]))

  const enrich = (p: Record<string, any>) => {
    const b = p.brandId ? brandById.get(Number(p.brandId)) || null : null
    const { variantLabelTh, variantLabelEn } = buildVariantLabel(p)
    return {
      ...p,
      badges: Array.isArray(p.badges) ? p.badges : [],
      brand: b,
      brandName: b?.name || (typeof p.brand === 'string' ? p.brand : 'Opwatch'),
      brandSlug: b?.slug || null,
      discountPercent: discountPercent(p),
      variantLabelTh,
      variantLabelEn
    }
  }

  // Build OMEGA-style sibling variations (current watch + exact model family + collection siblings)
  const allBrandItems = brand
    ? await store.find('products', { where: { brandId: Number(brand.id), status: 'active' }, orderBy: 'sortOrder', orderDir: 'asc', limit: 250 })
    : await store.find('products', { where: { status: 'active' }, orderBy: 'sortOrder', orderDir: 'asc', limit: 120 })

  const targetModel = extractModelInfo(product)
  const scoredSiblings = allBrandItems
    .filter((item) => Number(item.id) !== Number(product!.id))
    .map((item) => {
      const info = extractModelInfo(item)
      let score = 10
      if (targetModel.exactModel && info.exactModel && info.exactModel === targetModel.exactModel) {
        score = 100
      } else if (targetModel.stem && targetModel.stem.length >= 4 && info.stem === targetModel.stem) {
        score = 85
      } else if (Number(item.categoryId) === Number(product!.categoryId)) {
        score = 50
      }
      return { item, score }
    })
    .sort((a, b) => b.score - a.score || (Number(a.item.sortOrder || 0) - Number(b.item.sortOrder || 0)))

  const enrichedProduct = enrich(product)
  const variations = [
    { ...enrichedProduct, isCurrentVariation: true, variationMatchScore: 110 },
    ...scoredSiblings.slice(0, 17).map(({ item, score }) => ({
      ...enrich(item),
      isCurrentVariation: false,
      variationMatchScore: score
    }))
  ]

  const brandProducts = scoredSiblings
    .slice(0, 8)
    .map(({ item }) => enrich(item))

  return {
    product: enrichedProduct,
    variations,
    related: related.filter((r) => Number(r.id) !== Number(product!.id)).slice(0, 4).map(enrich),
    brandProducts,
    reviews,
    category,
    brand
  }
})

function discountPercent(p: Record<string, any>): number {
  const original = Number(p.originalPrice ?? p.priceCompare)
  const price = Number(p.price) || 0
  if (!original || original <= price) return 0
  return Math.round(((original - price) / original) * 1000) / 10
}
