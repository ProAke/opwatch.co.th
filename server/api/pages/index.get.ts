import { ensureCatalogReady } from '../../utils/seed'

export default defineEventHandler(async () => {
  const store = useStore()
  await ensureCatalogReady(store)
  const items = (await store.find('pages', { orderBy: 'sortOrder', orderDir: 'asc' })).filter(
    (p) => p.status !== 'draft'
  )
  return {
    items: items.map(({ contentTh, contentEn, ...meta }) => meta)
  }
})
