import { parseShopeeImport } from '../../../utils/shopee'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const parsed = await parseShopeeImport({
    url: body?.url,
    rawPayload: body?.rawPayload || body?.rawText,
    brandSlug: body?.brandSlug,
    categorySlug: body?.categorySlug,
    useAi: body?.useAi !== false
  })

  if (!body?.commit && !body?.saveImmediately) {
    return { ok: true, mode: 'preview', imported: parsed[0] || null, items: parsed }
  }

  const store = useStore()
  const [brands, cats, existingProducts] = await Promise.all([
    store.all('brands'),
    store.all('categories'),
    store.all('products')
  ])
  const brandBySlug = new Map(brands.map((b) => [String(b.slug), b]))
  const catBySlug = new Map(cats.map((c) => [String(c.slug), c]))
  const bySku = new Map(existingProducts.map((p) => [String(p.sku || '').toUpperCase(), p]))

  const saved: any[] = []
  for (const item of parsed) {
    const bObj = brandBySlug.get(item.brandSlug) || brands[0]
    const cObj = catBySlug.get(item.categorySlug) || cats[1] || cats[0]
    const existing = bySku.get(item.sku.toUpperCase())

    const payload = {
      sku: item.sku,
      name: item.nameTh || item.name,
      nameTh: item.nameTh || item.name,
      nameEn: item.nameEn || item.name,
      slug: existing?.slug || ensureUniqueSlug(slugify(`${item.brandSlug}-${item.sku}`), existingProducts),
      brandId: bObj ? Number(bObj.id) : null,
      brand: bObj?.slug || item.brandSlug,
      categoryId: cObj ? Number(cObj.id) : null,
      price: Number(item.price || 0),
      originalPrice: item.originalPrice,
      priceCompare: item.originalPrice,
      currency: 'THB',
      images: item.images,
      shortDescription: item.shortDescription,
      description: item.descriptionTh,
      descriptionTh: item.descriptionTh,
      descriptionEn: item.descriptionEn,
      specs: item.specs,
      stock: Number(item.stock || 10),
      status: 'active',
      badges: ['new'],
      featured: false,
      sortOrder: 50,
      seoTitle: item.seoTitle || '',
      seoDescription: item.seoDescription || '',
      seoKeywords: item.seoKeywords || '',
      aseoSummary: item.aseoSummary || '',
      aseoFaqs: item.aseoFaqs || [],
      shopeeUrl: item.shopeeUrl || '',
      shopeeItemId: item.shopeeItemId || '',
      giftWrapAvailable: true,
      pointsMultiplier: 1
    }

    if (existing) {
      const updated = await store.update('products', Number(existing.id), payload)
      saved.push(updated)
    } else {
      const created = await store.create('products', payload)
      existingProducts.push(created)
      saved.push(created)
    }
  }

  return { ok: true, mode: 'committed', product: saved[0] || null, imported: parsed[0] || null, items: saved, count: saved.length }
})
