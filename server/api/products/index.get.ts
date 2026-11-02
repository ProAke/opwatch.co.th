const BRAND_ALIASES: Record<string, string> = {
  olympinus: 'olympianus',
  'olym-pianus': 'olympianus',
  olympianus: 'olympianus',
  ogival: 'ogival',
  opwatch: 'opwatch'
}

const CATEGORY_ALIASES: Record<string, string | string[]> = {
  men: 'men-watches',
  'men-watch': 'men-watches',
  women: 'women-watches',
  ladies: 'women-watches',
  'ladies-watch': 'women-watches',
  sport: 'sport-watches',
  'sport-watch': 'sport-watches',
  'men-diver': 'sport-watches',
  diver: 'sport-watches',
  classic: 'classic-watches',
  'men-dress': 'classic-watches',
  dress: 'classic-watches',
  pair: 'couple-watches',
  couple: 'couple-watches',
  limited: ['men-jewelry', 'women-jewelry'],
  jewelry: ['men-jewelry', 'women-jewelry']
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const store = useStore()

  const where: Record<string, any> = { status: 'active' }
  let categoryIds: number[] | null = null

  if (q.category) {
    const rawCat = String(q.category).trim().toLowerCase()
    const mapped = CATEGORY_ALIASES[rawCat] || rawCat
    if (Array.isArray(mapped)) {
      const matchedCats = await Promise.all(
        mapped.map((slug) => store.findOne('categories', { where: { slug } }))
      )
      const ids = matchedCats.filter(Boolean).map((c: any) => Number(c.id))
      if (!ids.length) return { items: [], total: 0, page: 1, limit: 36, totalPages: 0 }
      categoryIds = ids
    } else {
      const cat = await store.findOne('categories', { where: { slug: mapped } })
      if (cat) {
        const children = await store.find('categories', { where: { parentId: Number(cat.id) } })
        if (children.length) {
          categoryIds = [Number(cat.id), ...children.map((c) => Number(c.id))]
        } else {
          where.categoryId = Number(cat.id)
        }
      } else {
        return { items: [], total: 0, page: 1, limit: 36, totalPages: 0 }
      }
    }
  }

  if (q.brand) {
    const rawBrand = String(q.brand).trim().toLowerCase()
    const canonicalBrand = BRAND_ALIASES[rawBrand] || rawBrand
    let brand = await store.findOne('brands', { where: { slug: canonicalBrand } })
    if (!brand && rawBrand !== canonicalBrand) {
      brand = await store.findOne('brands', { where: { slug: rawBrand } })
    }
    if (brand) {
      where.brandId = Number(brand.id)
    } else {
      return { items: [], total: 0, page: 1, limit: 36, totalPages: 0 }
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

  if (q.featured === 'true' || q.featured === '1') {
    items = items.filter((p) => p.featured === true || Number(p.featured) === 1)
  }

  const min = q.price_min !== undefined && q.price_min !== '' ? Number(q.price_min) : null
  const max = q.price_max !== undefined && q.price_max !== '' ? Number(q.price_max) : null
  if (min !== null || max !== null) {
    items = items.filter((p) => {
      const price = Number(p.price) || 0
      return (min === null || price >= min) && (max === null || price <= max)
    })
  }

  if (sort === 'discount_percentage_desc' || sort === 'discount') {
    items = items
      .map((p) => ({ p, pct: discountPercent(p) }))
      .sort((a, b) => b.pct - a.pct)
      .map((x) => x.p)
  } else if (sort === 'newest' || sort === 'created_at_desc') {
    items = items.slice().sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
  }

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
  const limit = q.limit !== undefined ? Math.max(1, Number(q.limit)) : items.length || 36
  const page = q.page !== undefined ? Math.max(1, Number(q.page)) : 1
  const offset = q.offset !== undefined ? Math.max(0, Number(q.offset)) : (page - 1) * limit
  const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1

  return {
    items: items.slice(offset, offset + limit),
    total,
    page,
    limit,
    totalPages
  }
})

function discountPercent(p: Record<string, any>): number {
  const original = Number(p.originalPrice ?? p.priceCompare)
  const price = Number(p.price) || 0
  if (!original || original <= price) return 0
  return Math.round(((original - price) / original) * 1000) / 10
}
