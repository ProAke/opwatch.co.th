export default defineEventHandler(async (event) => {
  const officer = await requirePermission(event, ['products_edit', 'products_stock'])
  const id = Number(getRouterParam(event, 'id'))
  const store = useStore()
  const body = await readBody(event)

  const existing = await store.findById('products', id)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'product.notFound' })

  const patch: Record<string, any> = { updatedAt: new Date().toISOString() }
  for (const key of [
    'name', 'nameEn', 'nameTh', 'sku', 'slug', 'brand', 'brandId', 'categoryId', 'seriesSlug',
    'price', 'dealerPrice', 'originalPrice', 'priceCompare', 'currency',
    'images', 'shortDescription', 'description', 'descriptionEn', 'descriptionTh',
    'specs', 'stock', 'stockWeb', 'stockShopee', 'stockLazada', 'stockTiktok', 'stockDealer',
    'status', 'badges', 'featured', 'sortOrder',
    'seoTitle', 'seoDescription', 'seoKeywords', 'aseoSummary', 'aseoFaqs',
    'shopeeUrl', 'shopeeItemId', 'videoUrl', 'giftWrapAvailable', 'pointsMultiplier'
  ]) {
    if (body?.[key] !== undefined) patch[key] = body[key]
  }

  // Only CEO / IT Admin can modify wholesale dealerPrice
  if (patch.dealerPrice !== undefined && officer.role !== 'ceo' && officer.role !== 'it_admin') {
    delete patch.dealerPrice
  }

  // Sync total `stock` whenever any of the 5 channel stock fields is updated
  const touchesChannels = ['stockWeb', 'stockShopee', 'stockLazada', 'stockTiktok', 'stockDealer'].some(
    (k) => patch[k] !== undefined
  )
  if (touchesChannels) {
    const sw = Number(patch.stockWeb ?? existing.stockWeb ?? 0)
    const ss = Number(patch.stockShopee ?? existing.stockShopee ?? 0)
    const sl = Number(patch.stockLazada ?? existing.stockLazada ?? 0)
    const st = Number(patch.stockTiktok ?? existing.stockTiktok ?? 0)
    const sd = Number(patch.stockDealer ?? existing.stockDealer ?? 0)
    patch.stockWeb = Math.max(0, sw)
    patch.stockShopee = Math.max(0, ss)
    patch.stockLazada = Math.max(0, sl)
    patch.stockTiktok = Math.max(0, st)
    patch.stockDealer = Math.max(0, sd)
    patch.stock = patch.stockWeb + patch.stockShopee + patch.stockLazada + patch.stockTiktok + patch.stockDealer
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
