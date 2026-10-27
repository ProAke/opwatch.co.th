export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const store = useStore()
  const items = await store.find('customers', {
    like: q.q ? { name: String(q.q), email: String(q.q), phone: String(q.q) } : undefined,
    orderBy: 'createdAt',
    orderDir: 'desc'
  })
  const orders = await store.all('orders')
  const enriched = items.map((c) => ({
    ...c,
    passwordHash: undefined,
    orderCount: orders.filter((o) => Number(o.customerId) === Number(c.id)).length
  }))
  return { items: enriched, total: enriched.length }
})
