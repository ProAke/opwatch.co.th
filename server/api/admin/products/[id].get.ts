export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const store = useStore()
  const product = await store.findById('products', id)
  if (!product) throw createError({ statusCode: 404, statusMessage: 'product.notFound' })
  const category = product.categoryId ? await store.findById('categories', Number(product.categoryId)) : null
  const brand = product.brandId ? await store.findById('brands', Number(product.brandId)) : null
  return {
    product: {
      ...product,
      brandSlug: brand?.slug || (typeof product.brand === 'string' ? product.brand : 'olympianus'),
      categorySlug: category?.slug || product.categorySlug || 'men-watches',
      active: product.status !== 'draft' && product.active !== false
    },
    category,
    brand
  }
})
