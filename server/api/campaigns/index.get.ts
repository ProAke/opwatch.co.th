export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const store = useStore()

  const items = (await store.find('campaigns', { orderBy: 'sortOrder', orderDir: 'asc' }))
    .filter((c) => c.active !== false && (!q.type || String(c.type) === String(q.type)))

  // Attach the owning brand so the header/carousel can link to its storefront.
  const brandIds = [...new Set(items.map((i) => Number(i.brandId)).filter(Boolean))]
  const brands = brandIds.length
    ? await Promise.all(brandIds.map((id) => store.findById('brands', id)))
    : []
  const byId = new Map(brands.filter(Boolean).map((b) => [Number(b.id), b]))

  return { items: items.map((c) => ({ ...c, brand: c.brandId ? byId.get(Number(c.brandId)) || null : null })) }
})
