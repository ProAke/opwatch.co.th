import { ensureCatalogReady } from '../../utils/seed'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') || ''
  const store = useStore()
  await ensureCatalogReady(store)

  const [allPages, allProducts, allReviews] = await Promise.all([
    store.all('pages').catch(() => []),
    store.all('products').catch(() => []),
    store.all('reviews').catch(() => [])
  ])

  const article = allPages.find(
    (p: any) =>
      (p.slug === slug || p.routePath === `/reviews/${slug}`) &&
      (p.pageType === 'article_review' || p.slug.startsWith('review-') || p.slug.startsWith('guide-'))
  )

  if (!article || article.status === 'draft') {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบบทความหรือรีวิวสินค้าที่ค้นหา' })
  }

  const productMap = new Map<number, any>()
  for (const p of allProducts) productMap.set(Number(p.id), p)

  const explicitIds: number[] = Array.isArray(article.productIds)
    ? article.productIds.map((id: any) => Number(id)).filter((id: number) => id > 0)
    : []

  let products = explicitIds
    .map((id) => productMap.get(id))
    .filter((p) => p && p.status === 'active')

  if (!products.length && article.brandSlug) {
    products = allProducts
      .filter((p: any) => p.status === 'active' && p.brand === article.brandSlug)
      .slice(0, 4)
  }
  if (!products.length) {
    products = allProducts.filter((p: any) => p.status === 'active').slice(0, 4)
  }

  const linkedSet = new Set(products.map((p: any) => Number(p.id)))
  let customerReviews = allReviews
    .filter((r: any) => r.status === 'approved' && (linkedSet.has(Number(r.productId)) || (article.brandSlug && productMap.get(Number(r.productId))?.brand === article.brandSlug)))
    .map((r: any) => {
      const prod = productMap.get(Number(r.productId))
      return {
        ...r,
        product: prod
          ? { id: prod.id, slug: prod.slug, sku: prod.sku, brand: prod.brand, nameTh: prod.nameTh, name: prod.name, image: prod.images?.[0] || '' }
          : null
      }
    })

  if (!customerReviews.length) {
    customerReviews = allReviews
      .filter((r: any) => r.status === 'approved')
      .slice(0, 4)
      .map((r: any) => {
        const prod = productMap.get(Number(r.productId))
        return {
          ...r,
          product: prod
            ? { id: prod.id, slug: prod.slug, sku: prod.sku, brand: prod.brand, nameTh: prod.nameTh, name: prod.name, image: prod.images?.[0] || '' }
            : null
        }
      })
  }

  const relatedArticles = allPages
    .filter((p: any) => p.pageType === 'article_review' && p.status !== 'draft' && p.slug !== article.slug)
    .sort((a: any, b: any) => {
      const sameBrandA = a.brandSlug && a.brandSlug === article.brandSlug ? 0 : 1
      const sameBrandB = b.brandSlug && b.brandSlug === article.brandSlug ? 0 : 1
      return sameBrandA - sameBrandB || Number(a.sortOrder || 99) - Number(b.sortOrder || 99)
    })
    .slice(0, 3)

  return {
    article,
    products,
    customerReviews,
    relatedArticles
  }
})
