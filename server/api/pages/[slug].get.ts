import { ensureCatalogReady } from '../../utils/seed'

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || '').trim().toLowerCase()
  const store = useStore()
  await ensureCatalogReady(store)

  const allPages = (await store.find('pages', { orderBy: 'sortOrder', orderDir: 'asc' })).filter(
    (p) => p.status !== 'draft'
  )
  const page = allPages.find((p) => String(p.slug || '').toLowerCase() === slug)

  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' })
  }

  const parent = page.parentId
    ? allPages.find((p) => Number(p.id) === Number(page.parentId)) || null
    : null
  const children = allPages
    .filter((p) => Number(p.parentId) === Number(page.id))
    .map(({ contentTh: _ct, contentEn: _ce, ...meta }) => meta)
  const siblings = page.parentId
    ? allPages
        .filter((p) => Number(p.parentId) === Number(page.parentId) && Number(p.id) !== Number(page.id))
        .map(({ contentTh: _ct, contentEn: _ce, ...meta }) => meta)
    : []

  // Hydrate linked Related Products (`productIds`)
  const productIds: number[] = Array.isArray(page.productIds)
    ? page.productIds.map((x: any) => Number(x)).filter(Boolean)
    : []

  let relatedProducts: any[] = []
  if (productIds.length > 0) {
    const [allProds, allBrands] = await Promise.all([
      store.all('products'),
      store.all('brands')
    ])
    const brandMap = new Map(allBrands.map((b) => [Number(b.id), b]))
    const prodMap = new Map(allProds.map((pr) => [Number(pr.id), pr]))
    relatedProducts = productIds
      .map((pid) => prodMap.get(pid))
      .filter((pr) => pr && pr.status === 'active')
      .map((pr: any) => {
        const bObj = pr.brandId ? brandMap.get(Number(pr.brandId)) : null
        return {
          ...pr,
          brand: bObj || pr.brand,
          brandName: bObj?.name || pr.brand,
          brandSlug: bObj?.slug || pr.brand
        }
      })
  } else if (page.brandSlug && (page.pageType === 'series_story' || page.pageType === 'brand_gate')) {
    const fallback = await store.find('products', {
      where: { brand: String(page.brandSlug), status: 'active' },
      orderBy: 'sortOrder',
      orderDir: 'asc',
      limit: 6
    })
    relatedProducts = fallback
  }

  return {
    page: {
      ...page,
      styleConfig: page.styleConfig || {
        fontFamily: 'Prompt',
        headingColor: '#ffffff',
        textColor: '#23264d',
        accentColor: '#1d2088',
        bgColor: '#0e1535',
        overlayOpacity: 0.56,
        headingSize: 'xl'
      },
      excerptTh: page.excerptTh || page.summary || '',
      published: page.status !== 'draft'
    },
    parent: parent ? { id: parent.id, slug: parent.slug, titleTh: parent.titleTh || parent.title, titleEn: parent.titleEn, routePath: parent.routePath } : null,
    children,
    siblings,
    relatedProducts
  }
})
