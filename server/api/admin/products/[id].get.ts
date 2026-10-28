export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const store = useStore()
  const product = await store.findById('products', id)
  if (!product) throw createError({ statusCode: 404, statusMessage: 'product.notFound' })
  const category = product.categoryId ? await store.findById('categories', Number(product.categoryId)) : null
  return { product, category }
})
