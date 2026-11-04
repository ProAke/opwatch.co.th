import { ensureCatalogReady } from '../../../utils/seed'

export default defineEventHandler(async (event) => {
  await requireOfficer(event, 'promotions_view')
  const store = useStore()
  await ensureCatalogReady(store)
  const raw = await store.find('promotions', { orderBy: 'sortOrder', orderDir: 'asc' })
  const items = raw.map((p) => ({
    ...p,
    bannerImage: p.bannerImage || p.banner || '/images/op/banner-899832ags.jpg',
    targetUrl: p.targetUrl || p.link || '/promotions',
    badgeText: p.badgeText || p.badge || ''
  }))
  return { items }
})
