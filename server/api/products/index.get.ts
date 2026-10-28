export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const store = useStore()

  const opts: Record<string, any> = {}
  if (q.category) {
    const slug = String(q.category)
    const cat = await store.findOne('categories', { where: { slug } })
    if (cat) opts.where = { categoryId: Number(cat.id) }
  }
  if (q.featured === 'true' || q.featured === '1') opts.where = { ...opts.where, featured: true }
  if (q.status) opts.where = { ...opts.where, status: String(q.status) }

  // Search across the English and Thai names plus SKU.
  if (q.q && String(q.q).trim()) {
    const term = String(q.q).trim()
    const items = await store.find('products', {
      like: { name: term, nameEn: term, nameTh: term, sku: term },
      orderBy: 'sortOrder',
      orderDir: 'asc'
    })
    const filtered = applyStatusFilter(items, opts.where)
    const total = filtered.length
    const paged = paginate(filtered, q)
    return { items: paged, total }
  }

  const sort = String(q.sort || 'featured')
  const sortMap: Record<string, any> = {
    featured: { orderBy: 'sortOrder', orderDir: 'asc' },
    price_asc: { orderBy: 'price', orderDir: 'asc' },
    price_desc: { orderBy: 'price', orderDir: 'desc' },
    newest: { orderBy: 'createdAt', orderDir: 'desc' }
  }
  const order = sortMap[sort] || sortMap.featured
  const items = await store.find('products', {
    where: { status: 'active', ...(opts.where || {}) },
    orderBy: order.orderBy,
    orderDir: order.orderDir,
    limit: q.limit !== undefined ? Number(q.limit) : undefined,
    offset: q.offset !== undefined ? Number(q.offset) : undefined
  })
  return { items, total: await store.count('products', { where: { status: 'active' } }) }
})

function applyStatusFilter(items: Record<string, any>[], where?: Record<string, any>) {
  if (!where) return items
  return items.filter((item) =>
    Object.entries(where).every(([k, v]) => {
      if (k === 'featured') return !!item.featured === !!v
      return String(item[k]) === String(v)
    })
  )
}

function paginate(items: Record<string, any>[], q: Record<string, any>) {
  const offset = q.offset !== undefined ? Number(q.offset) : 0
  const limit = q.limit !== undefined ? Number(q.limit) : items.length
  return items.slice(offset, offset + limit)
}
