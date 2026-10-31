export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') as string
  const store = useStore()
  const product = await store.findOne('products', { where: { slug } })
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Product not found' })

  const related = await store.find(
    'products',
    { where: { categoryId: product.categoryId, status: 'active' }, orderBy: 'sortOrder', orderDir: 'asc', limit: 4 }
  )
  const reviews = await store.find(
    'reviews',
    { where: { productId: Number(product.id), status: 'approved' }, orderBy: 'createdAt', orderDir: 'desc' }
  )
  const category = product.categoryId ? await store.findById('categories', Number(product.categoryId)) : null
  const brand = product.brandId ? await store.findById('brands', Number(product.brandId)) : null

  // Sibling products from the same brand, for the Central-style brand rail.
  const brandProducts = brand
    ? await store.find('products', { where: { brandId: Number(brand.id), status: 'active' }, orderBy: 'sortOrder', orderDir: 'asc', limit: 8 })
    : []

  return {
    product: {
      ...product,
      badges: Array.isArray(product.badges) ? product.badges : [],
      discountPercent: discountPercent(product)
    },
    related: related.filter((r) => Number(r.id) !== Number(product.id)),
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
