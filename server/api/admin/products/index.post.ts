export default defineEventHandler(async (event) => {
  await requirePermission(event, ['products_edit', 'products_stock'])
  const body = await readBody(event)
  const store = useStore()

  const name = String(body?.nameTh || body?.name || '').trim()
  if (!name) throw createError({ statusCode: 400, statusMessage: 'admin.required' })

  const sku = String(body?.sku || `OP-${Date.now().toString().slice(-6)}`).trim()

  const cats = await store.all('categories')
  let categoryId = body?.categoryId ? Number(body.categoryId) : null
  if (!categoryId && body?.categorySlug) {
    const foundCat = cats.find((c) => String(c.slug) === String(body.categorySlug))
    if (foundCat) categoryId = Number(foundCat.id)
  }
  if (categoryId && !cats.some((c) => Number(c.id) === categoryId)) categoryId = null

  const brands = await store.all('brands')
  let brandId = body?.brandId ? Number(body.brandId) : null
  if (!brandId && (body?.brandSlug || body?.brand)) {
    const bSlugReq = String(body.brandSlug || body.brand).trim()
    const foundBrand = brands.find((b) => String(b.slug) === bSlugReq)
    if (foundBrand) brandId = Number(foundBrand.id)
  }
  if (brandId && !brands.some((b) => Number(b.id) === brandId)) brandId = null
  const brandSlug = brands.find((b) => Number(b.id) === brandId)?.slug || String(body?.brandSlug || body?.brand || 'olympianus').trim()

  const slugBase = String(body?.slug || `${brandSlug}-${sku}`)
  const slug = ensureUniqueSlug(slugify(slugBase), await store.all('products'))

  const price = Number(body?.price) || 0
  const dealerPrice = body?.dealerPrice !== undefined && body?.dealerPrice !== '' && body?.dealerPrice !== null
    ? Number(body.dealerPrice)
    : Math.round((price * 0.65) / 10) * 10

  const hasChannelFields =
    body?.stockWeb !== undefined ||
    body?.stockShopee !== undefined ||
    body?.stockLazada !== undefined ||
    body?.stockTiktok !== undefined ||
    body?.stockDealer !== undefined

  const stockWeb = Number(body?.stockWeb ?? 4)
  const stockShopee = Number(body?.stockShopee ?? 3)
  const stockLazada = Number(body?.stockLazada ?? 2)
  const stockTiktok = Number(body?.stockTiktok ?? 1)
  const stockDealer = Number(body?.stockDealer ?? 4)
  const stock = hasChannelFields
    ? stockWeb + stockShopee + stockLazada + stockTiktok + stockDealer
    : Number(body?.stock ?? 14)

  const row = {
    sku,
    name,
    nameEn: String(body?.nameEn || '').trim() || name,
    nameTh: String(body?.nameTh || '').trim() || name,
    slug,
    brandId,
    brand: brandSlug,
    categoryId,
    seriesSlug: String(body?.seriesSlug || '').trim() || null,
    price,
    dealerPrice,
    originalPrice: body?.originalPrice !== undefined && body?.originalPrice !== '' && body?.originalPrice !== null ? Number(body.originalPrice) : null,
    priceCompare: body?.priceCompare !== undefined && body?.priceCompare !== '' && body?.priceCompare !== null ? Number(body.priceCompare) : null,
    currency: String(body?.currency || 'THB'),
    images: Array.isArray(body?.images) ? body.images : body?.images ? [String(body.images)] : [],
    shortDescription: String(body?.shortDescription || '').trim(),
    description: String(body?.descriptionTh || body?.description || '').trim(),
    descriptionEn: String(body?.descriptionEn || '').trim(),
    descriptionTh: String(body?.descriptionTh || body?.description || '').trim(),
    specs: body?.specs || {},
    stock,
    stockWeb,
    stockShopee,
    stockLazada,
    stockTiktok,
    stockDealer,
    status: body?.status === 'draft' || body?.active === false ? 'draft' : 'active',
    badges: Array.isArray(body?.badges) ? body.badges : body?.badges ? [String(body.badges)] : [],
    featured: !!body?.featured,
    sortOrder: Number(body?.sortOrder) || 0,
    seoTitle: String(body?.seoTitle || '').trim(),
    seoDescription: String(body?.seoDescription || '').trim(),
    seoKeywords: String(body?.seoKeywords || '').trim(),
    aseoSummary: String(body?.aseoSummary || '').trim(),
    aseoFaqs: Array.isArray(body?.aseoFaqs) ? body.aseoFaqs : [],
    shopeeUrl: String(body?.shopeeUrl || '').trim(),
    shopeeItemId: String(body?.shopeeItemId || '').trim(),
    videoUrl: String(body?.videoUrl || '').trim(),
    giftWrapAvailable: body?.giftWrapAvailable !== false,
    pointsMultiplier: Number(body?.pointsMultiplier || 1)
  }

  const product = await store.create('products', row)
  return { product }
})
