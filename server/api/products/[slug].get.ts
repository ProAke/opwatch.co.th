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

  return { product, related: related.filter((r) => Number(r.id) !== Number(product.id)), reviews, category }
})
