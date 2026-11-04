import { requireOfficer } from '../../../utils/auth'
import { ensureCatalogReady } from '../../../utils/seed'

export default defineEventHandler(async (event) => {
  await requireOfficer(event, 'pages')
  const store = useStore()
  await ensureCatalogReady(store)

  const [allReviews, allProducts, allPages] = await Promise.all([
    store.all('reviews').catch(() => []),
    store.all('products').catch(() => []),
    store.all('pages').catch(() => [])
  ])

  const productMap = new Map<number, any>()
  for (const p of allProducts) productMap.set(Number(p.id), p)

  const reviews = allReviews
    .sort((a: any, b: any) => Number(b.id) - Number(a.id))
    .map((r: any) => {
      const prod = productMap.get(Number(r.productId))
      return {
        ...r,
        product: prod
          ? { id: prod.id, sku: prod.sku, slug: prod.slug, brand: prod.brand, nameTh: prod.nameTh, name: prod.name, image: prod.images?.[0] || '' }
          : null
      }
    })

  const articles = allPages
    .filter((p: any) => p.pageType === 'article_review')
    .sort((a: any, b: any) => Number(a.sortOrder || 99) - Number(b.sortOrder || 99) || Number(b.id) - Number(a.id))

  const rootPage = allPages.find((p: any) => p.slug === 'site-reviews') || null

  return {
    rootPageId: rootPage ? Number(rootPage.id) : null,
    articles,
    reviews,
    products: allProducts.map((p: any) => ({
      id: p.id,
      sku: p.sku,
      brand: p.brand,
      nameTh: p.nameTh,
      name: p.name,
      price: p.salePrice || p.price,
      image: p.images?.[0] || ''
    }))
  }
})
