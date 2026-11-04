import { ensureCatalogReady } from '../../utils/seed'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const store = useStore()
  await ensureCatalogReady(store)

  let items = (await store.find('pages', { orderBy: 'sortOrder', orderDir: 'asc' })).filter(
    (p) => p.status !== 'draft'
  )

  if (q.pageType) {
    const types = String(q.pageType).split(',').map((t) => t.trim())
    items = items.filter((p) => types.includes(String(p.pageType || '')))
  }
  if (q.brandSlug) {
    const b = String(q.brandSlug).trim().toLowerCase()
    items = items.filter((p) => String(p.brandSlug || '').toLowerCase() === b)
  }
  if (q.routePath) {
    const rp = String(q.routePath).trim()
    items = items.filter((p) => String(p.routePath || '') === rp)
  }
  if (q.parentId !== undefined) {
    const pid = q.parentId === 'null' || q.parentId === '' ? null : Number(q.parentId)
    items = items.filter((p) => (p.parentId ? Number(p.parentId) : null) === pid)
  }

  const withContent = q.includeContent === '1'
  return {
    items: items.map((row) => {
      if (withContent) return row
      const { contentTh: _ct, contentEn: _ce, ...meta } = row
      return meta
    })
  }
})
