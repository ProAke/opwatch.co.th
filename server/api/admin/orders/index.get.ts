export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const store = useStore()

  const items = await store.find('orders', {
    like: q.q ? { orderNo: String(q.q), customerName: String(q.q), customerEmail: String(q.q) } : undefined,
    where: q.status ? { status: String(q.status) } : undefined,
    orderBy: 'createdAt',
    orderDir: 'desc'
  })

  const withItems = await Promise.all(
    items.map(async (order) => ({
      ...order,
      items: await store.find('order_items', { where: { orderId: Number(order.id) } })
    }))
  )

  return { items: withItems, total: withItems.length }
})
