import { ensureCatalogReady } from '../../../utils/seed'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const store = useStore()
  await ensureCatalogReady(store)

  const items = await store.find('products', {
    like: q.q ? { name: String(q.q), nameEn: String(q.q), nameTh: String(q.q), sku: String(q.q) } : undefined,
    orderBy: 'sortOrder',
    orderDir: 'asc'
  })

  const [cats, brands] = await Promise.all([
    store.all('categories'),
    store.all('brands')
  ])
  const catMap = new Map(cats.map((c) => [Number(c.id), c]))
  const brandMap = new Map(brands.map((b) => [Number(b.id), b]))
  const enriched = items.map((p) => {
    const brandObj = p.brandId ? brandMap.get(Number(p.brandId)) || null : null
    return {
      ...p,
      brand: brandObj || p.brand,
      brandName: brandObj?.name || (typeof p.brand === 'string' ? p.brand : null),
      categoryName: catMap.get(Number(p.categoryId))?.name || null,
      reviewsCount: 0
    }
  })

  return { items: enriched, total: enriched.length }
})
