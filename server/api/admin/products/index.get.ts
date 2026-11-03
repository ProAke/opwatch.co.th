import { ensureCatalogReady } from '../../../utils/seed'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const store = useStore()
  await ensureCatalogReady(store)

  const [rawItems, cats, brands] = await Promise.all([
    store.find('products', {
      like: q.q ? { name: String(q.q), nameEn: String(q.q), nameTh: String(q.q), sku: String(q.q) } : undefined,
      orderBy: 'sortOrder',
      orderDir: 'asc'
    }),
    store.all('categories'),
    store.all('brands')
  ])

  const catMap = new Map(cats.map((c) => [Number(c.id), c]))
  const brandMap = new Map(brands.map((b) => [Number(b.id), b]))

  let enriched = rawItems.map((p) => {
    const brandObj = p.brandId ? brandMap.get(Number(p.brandId)) || null : null
    const catObj = p.categoryId ? catMap.get(Number(p.categoryId)) || null : null
    const brandSlug = brandObj?.slug || (typeof p.brand === 'string' ? p.brand : 'olympianus')
    return {
      ...p,
      brand: brandObj || p.brand,
      brandSlug,
      brandName: brandObj?.name || (typeof p.brand === 'string' ? p.brand : null),
      categorySlug: catObj?.slug || p.categorySlug || 'men-watches',
      categoryName: catObj?.nameTh || catObj?.name || null,
      active: p.status !== 'draft' && p.active !== false,
      reviewsCount: 0
    }
  })

  if (q.brand) {
    const bFilter = String(q.brand).toLowerCase()
    enriched = enriched.filter((p) => String(p.brandSlug || '').toLowerCase() === bFilter)
  }

  const total = enriched.length
  const page = Math.max(1, Number(q.page || 1))
  const limit = q.limit ? Math.max(1, Math.min(500, Number(q.limit))) : total || 50
  const paged = q.limit ? enriched.slice((page - 1) * limit, page * limit) : enriched

  return { items: paged, total, page, limit }
})
