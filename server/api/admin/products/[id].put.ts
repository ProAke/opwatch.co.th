export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const store = useStore()
  const body = await readBody(event)

  const existing = await store.findById('products', id)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'product.notFound' })

  const patch: Record<string, any> = { updatedAt: new Date().toISOString() }
  for (const key of [
    'name', 'nameEn', 'nameTh', 'sku', 'slug', 'brand', 'brandId', 'categoryId', 'price',
    'originalPrice', 'priceCompare', 'currency', 'images', 'shortDescription',
    'description', 'descriptionEn', 'descriptionTh', 'specs', 'stock',
    'status', 'badges', 'featured', 'sortOrder',
    'seoTitle', 'seoDescription', 'seoKeywords', 'aseoSummary', 'aseoFaqs',
    'shopeeUrl', 'shopeeItemId', 'videoUrl', 'giftWrapAvailable', 'pointsMultiplier'
  ]) {
    if (body?.[key] !== undefined) patch[key] = body[key]
  }

  if (body?.brandSlug && body?.brandId === undefined) {
    const brands = await store.all('brands')
    const b = brands.find((x) => String(x.slug) === String(body.brandSlug))
    if (b) {
      patch.brandId = Number(b.id)
      patch.brand = b.slug
    }
  }
  if (body?.categorySlug && body?.categoryId === undefined) {
    const cats = await store.all('categories')
    const c = cats.find((x) => String(x.slug) === String(body.categorySlug))
    if (c) patch.categoryId = Number(c.id)
  }
  if (body?.active !== undefined && body?.status === undefined) {
    patch.status = body.active === false ? 'draft' : 'active'
  }
  if (body?.nameTh && !patch.name) {
    patch.name = String(body.nameTh).trim()
  }

  if (patch.images && !Array.isArray(patch.images)) patch.images = [String(patch.images)]
  if (patch.specs && typeof patch.specs === 'string') {
    try { patch.specs = JSON.parse(patch.specs) } catch { /* ignore */ }
  }
  if (patch.badges !== undefined) {
    patch.badges = Array.isArray(patch.badges) ? patch.badges : [String(patch.badges)]
  }
  if (patch.categoryId !== undefined) patch.categoryId = patch.categoryId ? Number(patch.categoryId) : null
  if (patch.brandId !== undefined) patch.brandId = patch.brandId ? Number(patch.brandId) : null
  if (patch.featured !== undefined) patch.featured = !!patch.featured
  if (patch.originalPrice !== undefined && patch.originalPrice !== '' && patch.originalPrice !== null) {
    patch.originalPrice = Number(patch.originalPrice)
  } else if (patch.originalPrice === '') {
    patch.originalPrice = null
  }

  if (patch.slug && patch.slug !== existing.slug) {
    patch.slug = ensureUniqueSlug(slugify(patch.slug), await store.all('products'), id)
  } else {
    delete patch.slug
  }

  const product = await store.update('products', id, patch)
  return { product }
})
