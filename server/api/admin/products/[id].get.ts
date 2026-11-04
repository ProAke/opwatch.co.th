export default defineEventHandler(async (event) => {
  const officer = await requirePermission(event, [
    'products_view', 'products_retail', 'products_stock', 'products_dealer'
  ])
  const id = Number(getRouterParam(event, 'id'))
  const store = useStore()
  const product = await store.findById('products', id)
  if (!product) throw createError({ statusCode: 404, statusMessage: 'product.notFound' })
  const category = product.categoryId ? await store.findById('categories', Number(product.categoryId)) : null
  const brand = product.brandId ? await store.findById('brands', Number(product.brandId)) : null

  const canSeeWholesale = ['ceo', 'it_admin', 'dealer'].includes(officer.role)
  const out: Record<string, any> = {
    ...product,
    brandSlug: brand?.slug || (typeof product.brand === 'string' ? product.brand : 'olympianus'),
    categorySlug: category?.slug || product.categorySlug || 'men-watches',
    active: product.status !== 'draft' && product.active !== false
  }
  if (!canSeeWholesale) {
    delete out.dealerPrice
  }

  return { product: out, category, brand }
})
