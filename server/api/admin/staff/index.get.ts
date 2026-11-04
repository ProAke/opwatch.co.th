import { ensureCatalogReady } from '../../../utils/seed'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ceo', 'it_admin'])
  const store = useStore()
  await ensureCatalogReady(store)

  const q = getQuery(event)
  const roleFilter = q.role ? String(q.role) : ''

  const all = await store.find('officers', { orderBy: 'id', orderDir: 'asc' })
  let items = all.map((o) => publicOfficer(o)).filter(Boolean)

  if (roleFilter) {
    items = items.filter((o: any) => o.role === roleFilter)
  }

  return {
    items,
    roles: OFFICE_ROLES
  }
})
