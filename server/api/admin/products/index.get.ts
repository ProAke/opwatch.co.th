import { ensureCatalogReady } from '../../../utils/seed'

export default defineEventHandler(async (event) => {
  const officer = await requirePermission(event, [
    'products_view', 'products_retail', 'products_stock', 'products_dealer'
  ])
  const q = getQuery(event)
  const store = useStore()
  await ensureCatalogReady(store)

  const [rawItems, cats, brands] = await Promise.all([
    store.find('products', {
      like: q.q ? { name: String(q.q), nameEn: String(q.q), nameTh: String(q.q), sku: String(q.q) } : undefined,
      orderBy: 'sortOrder',
      orderDir: 'asc'
    }),
    store.all('categories'),
    store.all('brands')
  ])

  const catMap = new Map(cats.map((c) => [Number(c.id), c]))
  const brandMap = new Map(brands.map((b) => [Number(b.id), b]))

  const role = officer.role
  const isDealer = role === 'dealer'
  const canSeeDealerWholesale = role === 'ceo' || role === 'it_admin' || isDealer

  let dealerStockMap = new Map<number, any>()
  if (isDealer) {
    const dStocks = await store.find('dealer_stocks', {
      where: officer.dealerCode ? { dealerCode: String(officer.dealerCode) } : { officerId: Number(officer.id) }
    })
    dealerStockMap = new Map(dStocks.map((ds) => [Number(ds.productId), ds]))
  }

  let enriched = rawItems.map((p) => {
    const brandObj = p.brandId ? brandMap.get(Number(p.brandId)) || null : null
    const catObj = p.categoryId ? catMap.get(Number(p.categoryId)) || null : null
    const brandSlug = brandObj?.slug || (typeof p.brand === 'string' ? p.brand : 'olympianus')
    const retailPrice = Number(p.price) || 0
    const baseDealerPrice = Number(p.dealerPrice) || Math.round((retailPrice * 0.65) / 10) * 10
    const discountPct = Number(officer.discountPct || 0)
    const effectiveDealerPrice = isDealer && discountPct > 0
      ? Math.round((retailPrice * (1 - discountPct / 100)) / 10) * 10
      : baseDealerPrice

    const out: Record<string, any> = {
      ...p,
      brand: brandObj || p.brand,
      brandSlug,
      brandName: brandObj?.name || (typeof p.brand === 'string' ? p.brand : null),
      categorySlug: catObj?.slug || p.categorySlug || 'men-watches',
      categoryName: catObj?.nameTh || catObj?.name || null,
      active: p.status !== 'draft' && p.active !== false,
      reviewsCount: 0
    }

    if (!canSeeDealerWholesale) {
      delete out.dealerPrice
    } else {
      out.dealerPrice = baseDealerPrice
      out.effectiveDealerPrice = effectiveDealerPrice
    }

    if (isDealer) {
      const ds = dealerStockMap.get(Number(p.id))
      out.dealerOwnStock = ds ? Number(ds.onHand) : 0
      out.dealerReserved = ds ? Number(ds.reserved) : 0
    }

    return out
  })

  if (q.brand) {
    const bFilter = String(q.brand).toLowerCase()
    enriched = enriched.filter((p) => String(p.brandSlug || '').toLowerCase() === bFilter)
  }

  const total = enriched.length
  const page = Math.max(1, Number(q.page || 1))
  const limit = q.limit ? Math.max(1, Math.min(500, Number(q.limit))) : total || 50
  const paged = q.limit ? enriched.slice((page - 1) * limit, page * limit) : enriched

  return { items: paged, total, page, limit, viewerRole: role }
})
