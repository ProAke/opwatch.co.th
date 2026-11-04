import { ensureCatalogReady } from '../../../utils/seed'

export default defineEventHandler(async (event) => {
  const officer = await requirePermission(event, [
    'warehouse', 'warehouse_5ch', 'warehouse_dealer', 'dealer_portal'
  ])
  const q = getQuery(event)
  const store = useStore()
  await ensureCatalogReady(store)

  const search = String(q.q || '').trim()
  const brandFilter = String(q.brand || '').trim().toLowerCase()
  const lowOnly = q.low === '1'
  const requestedDealerCode = String(q.dealerCode || '').trim()

  const [rawProducts, brands, promotions, allOrders, branches] = await Promise.all([
    store.find('products', {
      like: search ? { name: search, nameTh: search, nameEn: search, sku: search } : undefined,
      orderBy: 'sortOrder',
      orderDir: 'asc'
    }),
    store.all('brands'),
    store.all('promotions'),
    store.find('orders', { orderBy: 'createdAt', orderDir: 'desc' }),
    store.all('branches')
  ])

  const brandMap = new Map(brands.map((b) => [Number(b.id), b]))
  const isDealer = officer.role === 'dealer'
  const effectiveDealerCode = isDealer
    ? String(officer.dealerCode || `DLR-${officer.id}`)
    : requestedDealerCode || ''

  // Load dealer's own stock (`คลังสินค้าตัวแทนเอง`)
  const allDealerStocks = await store.all('dealer_stocks')
  const relevantDealerStocks = effectiveDealerCode
    ? allDealerStocks.filter((d) => String(d.dealerCode) === effectiveDealerCode)
    : allDealerStocks

  const dealerStockByProduct = new Map<number, any>()
  for (const ds of relevantDealerStocks) {
    dealerStockByProduct.set(Number(ds.productId), ds)
  }

  // Compute summary totals across 5 channels (before filtering)
  const totals = {
    skus: rawProducts.length,
    stockWeb: 0,
    stockShopee: 0,
    stockLazada: 0,
    stockTiktok: 0,
    stockDealer: 0,
    grandTotal: 0,
    lowStockCount: 0,
    dealerOwnUnits: 0,
    dealerOwnSkus: relevantDealerStocks.length
  }

  for (const d of relevantDealerStocks) {
    totals.dealerOwnUnits += Number(d.onHand || 0)
  }

  let items = rawProducts.map((p) => {
    const bObj = p.brandId ? brandMap.get(Number(p.brandId)) : null
    const brandSlug = bObj?.slug || String(p.brand || 'olympianus')
    const sw = Number(p.stockWeb ?? 0)
    const ss = Number(p.stockShopee ?? 0)
    const sl = Number(p.stockLazada ?? 0)
    const st = Number(p.stockTiktok ?? 0)
    const sd = Number(p.stockDealer ?? 0)
    const sum5 = sw + ss + sl + st + sd

    totals.stockWeb += sw
    totals.stockShopee += ss
    totals.stockLazada += sl
    totals.stockTiktok += st
    totals.stockDealer += sd
    totals.grandTotal += sum5
    if (sum5 <= 5 || sw <= 1) totals.lowStockCount++

    const retailPrice = Number(p.price) || 0
    const baseWholesale = Number(p.dealerPrice) || Math.round((retailPrice * 0.65) / 10) * 10
    const discountPct = Number(officer.discountPct || 0)
    const dealerPrice = isDealer && discountPct > 0
      ? Math.round((retailPrice * (1 - discountPct / 100)) / 10) * 10
      : baseWholesale

    const ds = dealerStockByProduct.get(Number(p.id))

    const row: Record<string, any> = {
      id: Number(p.id),
      sku: p.sku,
      slug: p.slug,
      name: p.nameTh || p.name,
      nameEn: p.nameEn,
      brandSlug,
      brandName: bObj?.name || brandSlug,
      image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '/images/hero-watch.jpg',
      price: retailPrice,
      dealerStockRowId: ds ? Number(ds.id) : null,
      dealerOnHand: ds ? Number(ds.onHand || 0) : 0,
      dealerReserved: ds ? Number(ds.reserved || 0) : 0,
      dealerReorderPoint: ds ? Number(ds.reorderPoint ?? 2) : 2,
      dealerNotes: ds?.notes || ''
    }

    if (isDealer) {
      // Dealer sees retail reference + exclusive dealer wholesale price + central dealer allocation availability (not internal Shopee/Lazada/TikTok breakdown)
      row.dealerPrice = dealerPrice
      row.marginAmount = Math.max(0, retailPrice - dealerPrice)
      row.centralDealerAvailable = sd
    } else {
      row.stockWeb = sw
      row.stockShopee = ss
      row.stockLazada = sl
      row.stockTiktok = st
      row.stockDealer = sd
      row.stock = sum5
      if (officer.role === 'ceo' || officer.role === 'it_admin') {
        row.dealerPrice = dealerPrice
      }
    }
    return row
  })

  if (brandFilter) {
    items = items.filter((r) => r.brandSlug.toLowerCase() === brandFilter)
  }
  if (lowOnly) {
    items = items.filter((r) =>
      isDealer ? r.dealerOnHand <= r.dealerReorderPoint : (r.stock <= 5 || r.stockWeb <= 1)
    )
  }

  // Store pickup orders (`การรับสินค้าหน้าร้าน`)
  const pickupOrders = allOrders.filter((o) => {
    const isPickup = Boolean(o.branchSlug) || o.shippingMethod === 'pickup' || o.channel === 'pickup'
    if (!isPickup) return false
    if (isDealer && officer.branchSlug && o.branchSlug && o.branchSlug !== officer.branchSlug) return false
    return true
  })

  // Dealer list for CEO / IT Admin / Warehouse filter
  const dealers = isDealer
    ? []
    : (await store.find('officers', { where: { role: 'dealer' } })).map((d) => ({
        id: d.id,
        dealerCode: d.dealerCode || d.code,
        dealerName: d.dealerName || d.name,
        dealerTier: d.dealerTier || 'Gold',
        discountPct: d.discountPct || 30,
        branchSlug: d.branchSlug
      }))

  return {
    viewerRole: officer.role,
    dealerProfile: isDealer
      ? {
          dealerCode: effectiveDealerCode,
          dealerName: officer.dealerName || officer.name,
          dealerTier: officer.dealerTier || 'Authorized Partner',
          discountPct: Number(officer.discountPct || 30),
          branchSlug: officer.branchSlug || null
        }
      : null,
    totals: isDealer
      ? {
          skus: totals.skus,
          dealerOwnSkus: totals.dealerOwnSkus,
          dealerOwnUnits: totals.dealerOwnUnits,
          centralDealerPool: totals.stockDealer
        }
      : totals,
    items,
    pickupOrders: pickupOrders.slice(0, 30),
    promotions: promotions.filter((pr) => pr.active !== false),
    branches,
    dealers
  }
})
