import { ensureCatalogReady } from '../../utils/seed'

export default defineEventHandler(async (event) => {
  const cfg = getConfig()
  const store = useStore()
  await ensureCatalogReady(store)

  const [rawPromos, rawCoupons, allBrands, allCats] = await Promise.all([
    store.find('promotions', { orderBy: 'sortOrder', orderDir: 'asc' }),
    store.find('coupons', { orderBy: 'id', orderDir: 'asc' }),
    store.all('brands'),
    store.all('categories')
  ])

  const brandById = new Map(allBrands.map((b) => [Number(b.id), b]))
  const catById = new Map(allCats.map((c) => [Number(c.id), c]))

  const normalizePromo = (p: Record<string, any>) => ({
    ...p,
    bannerImage: p.bannerImage || p.banner || '/images/op/banner-899832ags.jpg',
    banner: p.banner || p.bannerImage || '/images/op/banner-899832ags.jpg',
    targetUrl: p.targetUrl || p.link || '/promotions',
    link: p.link || p.targetUrl || '/promotions',
    badgeText: p.badgeText || p.badge || '',
    badge: p.badge || p.badgeText || '',
    ctaTh: p.ctaTh || p.discountLabel || 'รับสิทธิ์โปรโมชั่น'
  })

  const promotions = rawPromos.filter((p) => p.active !== false).map(normalizePromo)
  const coupons = rawCoupons.filter((c) => c.active !== false).map((c) => ({
    ...c,
    isGiftCard: Boolean(c.isGiftCard || c.type === 'giftcard')
  }))

  const homePromo = promotions.find((p) => p.showOnHome === true) || promotions[0] || null
  let homeProducts: any[] = []
  let homeColumns: 3 | 4 | 6 = ([3, 4, 6].includes(Number(homePromo?.homeColumns))
    ? Number(homePromo?.homeColumns)
    : [3, 4, 6].includes(Number(cfg.site?.promoHomeColumns))
      ? Number(cfg.site?.promoHomeColumns)
      : 4) as 3 | 4 | 6

  if (homePromo && cfg.site?.promoHomeEnabled !== false) {
    const ids = Array.isArray(homePromo.productIds)
      ? homePromo.productIds.map((n: any) => Number(n)).filter((n: number) => n > 0)
      : []

    let selected: Record<string, any>[] = []
    if (ids.length) {
      const found = await store.find('products', { in: { id: ids } })
      const byId = new Map(found.map((p) => [Number(p.id), p]))
      selected = ids.map((id: number) => byId.get(id)).filter(Boolean) as Record<string, any>[]
    }

    if (!selected.length) {
      const allActive = await store.find('products', {
        where: { status: 'active' },
        orderBy: 'sortOrder',
        orderDir: 'asc',
        limit: 24
      })
      const onSale = allActive.filter((p) => Number(p.originalPrice || 0) > Number(p.price || 0))
      selected = (onSale.length >= 6 ? onSale : allActive).slice(0, Number(cfg.site?.promoHomeLimit || 8))
    }

    homeProducts = selected.map((p) => {
      const brandObj = p.brandId ? brandById.get(Number(p.brandId)) || null : null
      const catObj = p.categoryId ? catById.get(Number(p.categoryId)) || null : null
      const original = Number(p.originalPrice ?? p.priceCompare ?? 0)
      const price = Number(p.price || 0)
      const discountPercent = original > price ? Math.round(((original - price) / original) * 1000) / 10 : 0
      return {
        ...p,
        badges: Array.isArray(p.badges) ? p.badges : [],
        brand: brandObj,
        brandName: brandObj?.name || p.brand || 'Opwatch',
        brandSlug: brandObj?.slug || null,
        categorySlug: catObj?.slug || null,
        categoryName: catObj?.nameTh || catObj?.name || null,
        discountPercent
      }
    })
  }

  const q = getQuery(event)
  const homeOnly = String(q.home || '') === '1' || String(q.home || '') === 'true'
  const filteredPromos = homeOnly
    ? (promotions.filter((p) => p.showOnHome === true).length ? promotions.filter((p) => p.showOnHome === true) : promotions.slice(0, 2))
    : promotions

  return {
    items: filteredPromos,
    promotions: filteredPromos,
    coupons,
    promoProducts: homeProducts,
    promoHomeColumns: homeColumns,
    promoHomeEnabled: cfg.site?.promoHomeEnabled !== false,
    home: cfg.site?.promoHomeEnabled === false
      ? null
      : {
          promotion: homePromo,
          columns: homeColumns,
          products: homeProducts
        }
  }
})
