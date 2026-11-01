export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const store = useStore()

  const where: Record<string, any> = { status: 'active' }
  let categoryIds: number[] | null = null

  if (q.category) {
    const cat = await store.findOne('categories', { where: { slug: String(q.category) } })
    if (cat) {
      const children = await store.find('categories', { where: { parentId: Number(cat.id) } })
      if (children.length) {
        categoryIds = [Number(cat.id), ...children.map((c) => Number(c.id))]
      } else {
        where.categoryId = Number(cat.id)
      }
    } else {
      return { items: [], total: 0 }
    }
  }

  if (q.brand) {
    const brand = await store.findOne('brands', { where: { slug: String(q.brand) } })
    if (brand) {
      where.brandId = Number(brand.id)
    } else {
      return { items: [], total: 0 }
    }
  }

  const orderMap: Record<string, { orderBy: string; orderDir: 'asc' | 'desc' }> = {
    featured: { orderBy: 'sortOrder', orderDir: 'asc' },
    price_asc: { orderBy: 'price', orderDir: 'asc' },
    price_desc: { orderBy: 'price', orderDir: 'desc' },
    newest: { orderBy: 'createdAt', orderDir: 'desc' },
    created_at_desc: { orderBy: 'createdAt', orderDir: 'desc' }
  }
  const sort = String(q.sort || 'featured')
  const order = orderMap[sort] || orderMap.featured

  const term = q.q && String(q.q).trim() ? String(q.q).trim() : ''

  let items = await store.find('products', {
    where,
    ...(categoryIds ? { in: { categoryId: categoryIds } } : {}),
    ...(term ? { like: { name: term, nameEn: term, nameTh: term, sku: term, brand: term } } : {}),
    orderBy: order.orderBy,
    orderDir: order.orderDir
  })

  // `featured` is normalised to boolean in shape().
  if (q.featured === 'true' || q.featured === '1') {
    items = items.filter((p) => p.featured === true || Number(p.featured) === 1)
  }

  // Price band filter.
  const min = q.price_min !== undefined && q.price_min !== '' ? Number(q.price_min) : null
  const max = q.price_max !== undefined && q.price_max !== '' ? Number(q.price_max) : null
  if (min !== null || max !== null) {
    items = items.filter((p) => {
      const price = Number(p.price) || 0
      return (min === null || price >= min) && (max === null || price <= max)
    })
  }

  // Sort by discount depth or newest.
  if (sort === 'discount_percentage_desc' || sort === 'discount') {
    items = items
      .map((p) => ({ p, pct: discountPercent(p) }))
      .sort((a, b) => b.pct - a.pct)
      .map((x) => x.p)
  } else if (sort === 'newest' || sort === 'created_at_desc') {
    items = items.slice().sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
  }

  // Attach owning brand + category name and normalise badges.
  const [allBrands, allCategories] = await Promise.all([
    store.all('brands'),
    store.all('categories')
  ])
  const brandById = new Map(allBrands.map((b) => [Number(b.id), b]))
  const catById = new Map(allCategories.map((c) => [Number(c.id), c]))

  items = items.map((p) => {
    const badges = Array.isArray(p.badges) ? p.badges : []
    const brandObj = p.brandId ? brandById.get(Number(p.brandId)) || null : null
    const catObj = p.categoryId ? catById.get(Number(p.categoryId)) || null : null
    return {
      ...p,
      badges,
      brand: brandObj,
      brandName: brandObj?.name || (typeof p.brand === 'string' ? p.brand : 'Opwatch'),
      brandSlug: brandObj?.slug || null,
      categorySlug: catObj?.slug || null,
      categoryName: catObj?.nameTh || catObj?.name || null,
      categoryNameEn: catObj?.nameEn || catObj?.name || null,
      discountPercent: discountPercent(p)
    }
  })

  const total = items.length
  const offset = q.offset !== undefined ? Number(q.offset) : 0
  const limit = q.limit !== undefined ? Number(q.limit) : items.length
  return { items: items.slice(offset, offset + limit), total }
})

function discountPercent(p: Record<string, any>): number {
  const original = Number(p.originalPrice ?? p.priceCompare)
  const price = Number(p.price) || 0
  if (!original || original <= price) return 0
  return Math.round(((original - price) / original) * 1000) / 10
}
