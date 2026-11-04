import { ensureCatalogReady } from '../../../utils/seed'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'pages')
  const store = useStore()
  await ensureCatalogReady(store)
  const raw = await store.find('pages', { orderBy: 'sortOrder', orderDir: 'asc' })
  const items = raw.map((p) => ({
    ...p,
    parentId: p.parentId ? Number(p.parentId) : null,
    pageType: p.pageType || (p.category === 'legal' ? 'legal' : 'custom_landing'),
    routePath: p.routePath || `/pages/${p.slug}`,
    styleConfig: p.styleConfig || {
      fontFamily: 'Prompt',
      headingColor: '#ffffff',
      textColor: '#23264d',
      accentColor: '#1d2088',
      bgColor: '#0e1535',
      overlayOpacity: 0.56,
      headingSize: 'xl'
    },
    productIds: Array.isArray(p.productIds) ? p.productIds.map((x: any) => Number(x)).filter(Boolean) : [],
    gallery: Array.isArray(p.gallery) ? p.gallery : [],
    excerptTh: p.excerptTh || p.summary || '',
    published: p.status !== 'draft'
  }))
  return { items }
})
