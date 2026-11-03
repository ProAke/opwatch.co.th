import { ensureCatalogReady } from '../../../utils/seed'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const store = useStore()
  await ensureCatalogReady(store)
  const raw = await store.find('pages', { orderBy: 'sortOrder', orderDir: 'asc' })
  const items = raw.map((p) => ({
    ...p,
    excerptTh: p.excerptTh || p.summary || '',
    published: p.status !== 'draft'
  }))
  return { items }
})
