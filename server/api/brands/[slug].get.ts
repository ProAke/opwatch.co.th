import { ensureCatalogReady } from '../../utils/seed'

const BRAND_ALIASES: Record<string, string> = {
  olympinus: 'olympianus',
  'olym-pianus': 'olympianus',
  olympianus: 'olympianus',
  'olympia-star': 'olympia-star',
  olympiastar: 'olympia-star',
  opa: 'olympia-star',
  opwatch: 'olympia-star',
  ogival: 'ogival'
}

export default defineEventHandler(async (event) => {
  const rawSlug = String(getRouterParam(event, 'slug') || '').trim().toLowerCase()
  const canonicalSlug = BRAND_ALIASES[rawSlug] || rawSlug
  const store = useStore()
  await ensureCatalogReady(store)

  let brand = (await store.find('brands', { where: { slug: canonicalSlug } })).find((b) => b.active !== false)
  if (!brand && rawSlug !== canonicalSlug) {
    brand = (await store.find('brands', { where: { slug: rawSlug } })).find((b) => b.active !== false)
  }
  if (!brand) throw createError({ statusCode: 404, statusMessage: 'brand.notFound' })

  const [rawProducts, allCategories] = await Promise.all([
    store.find('products', {
      where: { brandId: Number(brand.id), status: 'active' },
      orderBy: 'sortOrder',
      orderDir: 'asc'
    }),
    store.all('categories')
  ])

  const catById = new Map(allCategories.map((c) => [Number(c.id), c]))
  const products = rawProducts.map((p) => {
    const badges = Array.isArray(p.badges) ? p.badges : []
    const catObj = p.categoryId ? catById.get(Number(p.categoryId)) || null : null
    const original = Number(p.originalPrice ?? p.priceCompare)
    const price = Number(p.price) || 0
    const discountPercent = original > price ? Math.round(((original - price) / original) * 1000) / 10 : 0
    return {
      ...p,
      badges,
      brand,
      brandName: brand.name,
      brandSlug: brand.slug,
      categorySlug: catObj?.slug || null,
      categoryName: catObj?.nameTh || catObj?.name || null,
      categoryNameEn: catObj?.nameEn || catObj?.name || null,
      discountPercent
    }
  })

  const root = (await store.find('categories', { where: { parentId: null } }))[0] || null
  const subcategories = root
    ? await store.find('categories', { where: { parentId: Number(root.id) }, orderBy: 'sortOrder', orderDir: 'asc' })
    : []

  const campaigns = (await store.find('campaigns', { orderBy: 'sortOrder', orderDir: 'asc' }))
    .filter((c) => c.active !== false && c.type === 'brand-day' && Number(c.brandId) === Number(brand.id))

  // Load Brand Gate CMS node + Series Story child pages from Tree CMS (`pages`)
  const allPublishedPages = (await store.find('pages', { orderBy: 'sortOrder', orderDir: 'asc' }))
    .filter((pg) => pg.status !== 'draft')
  const brandGate = allPublishedPages.find(
    (pg) => pg.pageType === 'brand_gate' && String(pg.brandSlug || '').toLowerCase() === String(brand.slug).toLowerCase()
  ) || null
  const seriesStories = allPublishedPages.filter(
    (pg) =>
      pg.pageType === 'series_story' &&
      (String(pg.brandSlug || '').toLowerCase() === String(brand.slug).toLowerCase() ||
        (brandGate && Number(pg.parentId) === Number(brandGate.id)))
  )

  let gateFeaturedProducts: any[] = []
  if (brandGate && Array.isArray(brandGate.productIds) && brandGate.productIds.length > 0) {
    const byId = new Map(products.map((pr) => [Number(pr.id), pr]))
    gateFeaturedProducts = brandGate.productIds
      .map((pid: any) => byId.get(Number(pid)))
      .filter(Boolean)
  }

  return {
    brand,
    products,
    total: products.length,
    subcategories,
    campaigns,
    brandGate,
    seriesStories,
    gateFeaturedProducts
  }
})
