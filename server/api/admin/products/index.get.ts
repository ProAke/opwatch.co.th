export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const store = useStore()

  const items = await store.find('products', {
    like: q.q ? { name: String(q.q), nameEn: String(q.q), nameTh: String(q.q), sku: String(q.q) } : undefined,
    orderBy: 'sortOrder',
    orderDir: 'asc'
  })

  const cats = await store.all('categories')
  const catMap = new Map(cats.map((c) => [Number(c.id), c]))
  const enriched = items.map((p) => ({
    ...p,
    categoryName: catMap.get(Number(p.categoryId))?.name || null,
    reviewsCount: 0
  }))

  return { items: enriched, total: enriched.length }
})
