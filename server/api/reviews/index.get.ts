import { ensureCatalogReady } from '../../utils/seed'

export default defineEventHandler(async (event) => {
  const store = useStore()
  await ensureCatalogReady(store)
  const q = getQuery(event)
  const brandFilter = String(q.brand || '').trim()
  const categoryFilter = String(q.category || '').trim()
  const search = String(q.q || '').trim().toLowerCase()
  const productIdFilter = Number(q.productId || 0)

  const [allPages, allProducts, allReviews] = await Promise.all([
    store.all('pages').catch(() => []),
    store.all('products').catch(() => []),
    store.all('reviews').catch(() => [])
  ])

  const productMap = new Map<number, any>()
  for (const p of allProducts) {
    productMap.set(Number(p.id), p)
  }

  const heroPage = allPages.find((p: any) => p.slug === 'site-reviews') || null

  let articles = allPages
    .filter((p: any) => p.pageType === 'article_review' && p.status !== 'draft')
    .sort((a: any, b: any) => Number(a.sortOrder || 99) - Number(b.sortOrder || 99) || Number(b.id || 0) - Number(a.id || 0))
    .map((p: any) => {
      const ids = Array.isArray(p.productIds) ? p.productIds.map((id: any) => Number(id)) : []
      const linked = ids.map((id: number) => productMap.get(id)).filter(Boolean)
      const primaryProduct = linked[0] || null
      return {
        ...p,
        linkedCount: linked.length,
        primaryProduct: primaryProduct
          ? {
              id: primaryProduct.id,
              slug: primaryProduct.slug,
              sku: primaryProduct.sku,
              brand: primaryProduct.brand,
              name: primaryProduct.name,
              nameTh: primaryProduct.nameTh,
              price: primaryProduct.salePrice || primaryProduct.price,
              regularPrice: primaryProduct.price,
              image: primaryProduct.images?.[0] || ''
            }
          : null
      }
    })

  if (brandFilter) {
    articles = articles.filter((a: any) => a.brandSlug === brandFilter)
  }
  if (categoryFilter) {
    articles = articles.filter((a: any) => a.category === categoryFilter)
  }
  if (search) {
    articles = articles.filter((a: any) =>
      `${a.title || ''} ${a.titleTh || ''} ${a.titleEn || ''} ${a.summary || ''} ${a.styleConfig?.testedSku || ''}`
        .toLowerCase()
        .includes(search)
    )
  }

  let customerReviews = allReviews
    .filter((r: any) => r.status === 'approved')
    .sort((a: any, b: any) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')) || Number(b.id) - Number(a.id))
    .map((r: any) => {
      const prod = productMap.get(Number(r.productId))
      return {
        ...r,
        product: prod
          ? {
              id: prod.id,
              slug: prod.slug,
              sku: prod.sku,
              brand: prod.brand,
              name: prod.name,
              nameTh: prod.nameTh,
              price: prod.salePrice || prod.price,
              image: prod.images?.[0] || ''
            }
          : null
      }
    })

  if (productIdFilter > 0) {
    customerReviews = customerReviews.filter((r: any) => Number(r.productId) === productIdFilter)
  } else if (brandFilter) {
    customerReviews = customerReviews.filter((r: any) => r.product?.brand === brandFilter)
  }

  const avgRating = customerReviews.length
    ? Number((customerReviews.reduce((acc: number, r: any) => acc + Number(r.rating || 5), 0) / customerReviews.length).toFixed(1))
    : 4.9

  return {
    heroPage,
    articles,
    customerReviews,
    featuredProducts: allProducts
      .filter((p: any) => p.status === 'active')
      .slice(0, 24)
      .map((p: any) => ({
        id: p.id,
        slug: p.slug,
        sku: p.sku,
        brand: p.brand,
        name: p.name,
        nameTh: p.nameTh
      })),
    stats: {
      totalArticles: articles.length,
      totalCustomerReviews: customerReviews.length,
      averageRating: avgRating
    }
  }
})
