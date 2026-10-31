export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const store = useStore()

  const opts: Record<string, any> = { status: 'active' }

  if (q.category) {
    const cat = await store.findOne('categories', { where: { slug: String(q.category) } })
    if (cat) opts.categoryId = Number(cat.id)
  }
  if (q.brand) {
    const brand = await store.findOne('brands', { where: { slug: String(q.brand) } })
    if (brand) opts.brandId = Number(brand.id)
  }

  // Search across the English and Thai names plus SKU.
  const term = q.q && String(q.q).trim() ? String(q.q).trim() : ''
  let items: Record<string, any>[]

  if (term) {
    items = await store.find('products', { like: { name: term, nameEn: term, nameTh: term, sku: term } })
  } else {
    const orderMap: Record<string, any> = {
      featured: { orderBy: 'sortOrder', orderDir: 'asc' },
      price_asc: { orderBy: 'price', orderDir: 'asc' },
      price_desc: { orderBy: 'price', orderDir: 'desc' },
      newest: { orderBy: 'createdAt', orderDir: 'desc' }
    }
    const sort = String(q.sort || 'featured')
    const order = orderMap[sort] || orderMap.featured
    items = await store.find('products', { where: opts, orderBy: order.orderBy, orderDir: order.orderDir })
  }

  // `featured` is a boolean in JSON and an int in MySQL — filter in JS.
  if (q.featured === 'true' || q.featured === '1') {
    items = items.filter((p) => p.featured === true || Number(p.featured) === 1)
  }

  // Price band (Central-style filtering).
  const min = q.price_min !== undefined ? Number(q.price_min) : null
  const max = q.price_max !== undefined ? Number(q.price_max) : null
  if (min !== null || max !== null) {
    items = items.filter((p) => {
      const price = Number(p.price) || 0
      return (min === null || price >= min) && (max === null || price <= max)
    })
  }

  // Sort by discount depth, the way Central's "ลดเยอะสุด" works.
  if (term === '' && (q.sort === 'discount_percentage_desc' || q.sort === 'discount')) {
    items = items
      .map((p) => ({ p, pct: discountPercent(p) }))
      .sort((a, b) => b.pct - a.pct)
      .map((x) => x.p)
  } else if (term === '' && (q.sort === 'newest' || q.sort === 'created_at_desc')) {
    items = items.slice().sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
  }

  // Attach the owning brand and normalise badges.
  const brandIds = [...new Set(items.map((p) => Number(p.brandId)).filter(Boolean))]
  const brands = brandIds.length ? await Promise.all(brandIds.map((id) => store.findById('brands', id))) : []
  const byId = new Map(brands.filter(Boolean).map((b) => [Number(b.id), b]))

  items = items.map((p) => {
    const badges = Array.isArray(p.badges) ? p.badges : []
    const brand = p.brandId ? byId.get(Number(p.brandId)) || null : null
    return { ...p, badges, brand, discountPercent: discountPercent(p) }
  })

  const total = items.length
  const offset = q.offset !== undefined ? Number(q.offset) : 0
  const limit = q.limit !== undefined ? Number(q.limit) : items.length
  return { items: items.slice(offset, offset + limit), total }
})

/** Percentage off relative to originalPrice (or priceCompare as a fallback). */
function discountPercent(p: Record<string, any>): number {
  const original = Number(p.originalPrice ?? p.priceCompare)
  const price = Number(p.price) || 0
  if (!original || original <= price) return 0
  return Math.round(((original - price) / original) * 1000) / 10
}
