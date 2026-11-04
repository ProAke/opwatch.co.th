export default defineEventHandler(async (event) => {
  await requirePermission(event, 'pages')
  const body = await readBody(event)
  const store = useStore()

  const brandSlug = String(body?.brandSlug || '').trim().toLowerCase()
  const keywordsRaw = `${body?.titleTh || ''} ${body?.titleEn || ''} ${body?.seriesKey || ''} ${body?.seoKeywords || ''} ${body?.summary || ''}`
    .toLowerCase()
  const tokens = keywordsRaw
    .split(/[\s,·|/\-()]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !['นาฬิกา', 'ของแท้', 'opwatch', 'thailand', 'series', 'story', 'ศูนย์ไทย'].includes(t))

  const limit = Math.max(2, Math.min(16, Number(body?.limit || 8)))
  const allProducts = (await store.all('products')).filter((p) => p.status === 'active')

  const scored = allProducts.map((p) => {
    let score = 0
    const pBrand = String(p.brand || '').toLowerCase()
    if (brandSlug && pBrand === brandSlug) score += 25
    if (p.featured) score += 4

    const hay = `${p.sku || ''} ${p.name || ''} ${p.nameTh || ''} ${p.nameEn || ''} ${p.shortDescription || ''} ${p.seriesSlug || ''}`.toLowerCase()
    for (const tk of tokens) {
      if (hay.includes(tk)) score += 8
    }
    if (keywordsRaw.includes('ผู้หญิง') || keywordsRaw.includes('lady')) {
      if (hay.includes('lady') || hay.includes('ผู้หญิง') || /\bl\b|280|82672/.test(hay)) score += 12
    }
    if (keywordsRaw.includes('open') || keywordsRaw.includes('skeleton') || keywordsRaw.includes('ฉลุ')) {
      if (hay.includes('open') || hay.includes('skeleton') || hay.includes('358') || hay.includes('99141')) score += 14
    }
    if (keywordsRaw.includes('sport') || keywordsRaw.includes('diver')) {
      if (hay.includes('sport') || hay.includes('89322') || hay.includes('899832')) score += 12
    }
    return { product: p, score }
  })

  scored.sort((a, b) => b.score - a.score || (Number(a.product.sortOrder) - Number(b.product.sortOrder)))
  const picked = scored.slice(0, limit).map((s) => ({
    id: Number(s.product.id),
    sku: s.product.sku,
    name: s.product.nameTh || s.product.name,
    brand: s.product.brand,
    price: s.product.price,
    image: Array.isArray(s.product.images) ? s.product.images[0] : ''
  }))

  return {
    productIds: picked.map((p) => p.id),
    matchedProducts: picked
  }
})
