export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const store = useStore()

  const name = String(body?.name || '').trim()
  if (!name) throw createError({ statusCode: 400, statusMessage: 'admin.required' })

  const sku = String(body?.sku || '').trim()
  if (!sku) throw createError({ statusCode: 400, statusMessage: 'admin.required' })

  const cats = await store.all('categories')
  let categoryId = body?.categoryId ? Number(body.categoryId) : null
  if (categoryId && !cats.some((c) => Number(c.id) === categoryId)) categoryId = null

  const brands = await store.all('brands')
  let brandId = body?.brandId ? Number(body.brandId) : null
  if (brandId && !brands.some((b) => Number(b.id) === brandId)) brandId = null
  const brandName = body?.brand ? String(body.brand).trim() : brands.find((b) => Number(b.id) === brandId)?.name || 'Opwatch'

  const slugBase = String(body?.slug || name)
  const slug = ensureUniqueSlug(slugify(slugBase), await store.all('products'))

  const row = {
    sku,
    name,
    nameEn: String(body?.nameEn || '').trim() || name,
    nameTh: String(body?.nameTh || '').trim() || name,
    slug,
    brandId,
    brand: brandName,
    categoryId,
    price: Number(body?.price) || 0,
    originalPrice: body?.originalPrice !== undefined && body?.originalPrice !== '' ? Number(body.originalPrice) : null,
    priceCompare: body?.priceCompare !== undefined && body?.priceCompare !== '' ? Number(body.priceCompare) : null,
    currency: String(body?.currency || 'THB'),
    images: Array.isArray(body?.images) ? body.images : body?.images ? [String(body.images)] : [],
    shortDescription: String(body?.shortDescription || '').trim(),
    description: String(body?.description || '').trim(),
    descriptionEn: String(body?.descriptionEn || '').trim(),
    descriptionTh: String(body?.descriptionTh || '').trim(),
    specs: body?.specs || {},
    stock: Number(body?.stock) || 0,
    status: body?.status === 'draft' ? 'draft' : 'active',
    badges: Array.isArray(body?.badges) ? body.badges : body?.badges ? [String(body.badges)] : [],
    featured: !!body?.featured,
    sortOrder: Number(body?.sortOrder) || 0
  }

  const product = await store.create('products', row)
  return { product }
})
