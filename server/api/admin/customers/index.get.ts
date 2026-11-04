import { ensureCatalogReady } from '../../../utils/seed'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'customers')
  const q = getQuery(event)
  const store = useStore()
  await ensureCatalogReady(store)

  const items = await store.find('customers', {
    like: q.q ? { name: String(q.q), email: String(q.q), phone: String(q.q), city: String(q.q) } : undefined,
    orderBy: 'createdAt',
    orderDir: 'desc'
  })

  // Strictly return website members/buyers ONLY (never back-office staff)
  const membersOnly = items.filter((u) => {
    const r = String(u.role || 'member').toLowerCase()
    return r === 'member' || (!u.isAdmin && !['ceo', 'it_admin', 'marketing_sales', 'warehouse', 'dealer', 'admin', 'staff'].includes(r))
  })

  const withCounts = await Promise.all(
    membersOnly.map(async (u) => ({
      ...publicUser(u),
      ordersCount: await store.count('orders', { where: { customerId: Number(u.id) } })
    }))
  )

  return { items: withCounts, customers: withCounts, total: withCounts.length }
})
