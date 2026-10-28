export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const store = useStore()
  const body = await readBody(event)

  const existing = await store.findById('products', id)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'product.notFound' })

  const patch: Record<string, any> = {}
  for (const key of [
    'name', 'nameEn', 'nameTh', 'sku', 'brand', 'categoryId', 'price', 'priceCompare', 'currency',
    'images', 'shortDescription', 'description', 'descriptionEn', 'descriptionTh', 'specs', 'stock',
    'status', 'featured', 'sortOrder'
  ]) {
    if (body?.[key] !== undefined) patch[key] = body[key]
  }

  if (patch.images && !Array.isArray(patch.images)) patch.images = [String(patch.images)]
  if (patch.specs && typeof patch.specs === 'string') {
    try { patch.specs = JSON.parse(patch.specs) } catch { /* ignore */ }
  }
  if (patch.categoryId !== undefined) patch.categoryId = patch.categoryId ? Number(patch.categoryId) : null
  if (patch.featured !== undefined) patch.featured = !!patch.featured

  if (patch.slug !== undefined) {
    patch.slug = ensureUniqueSlug(slugify(patch.slug), await store.all('products'), id)
  } else if (patch.name !== undefined) {
    patch.slug = ensureUniqueSlug(slugify(patch.name), await store.all('products'), id)
  }

  const product = await store.update('products', id, patch)
  return { product }
})
