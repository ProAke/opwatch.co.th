export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const store = useStore()
  const orders = await store.find('orders', {
    where: { customerId: Number(user.id) },
    orderBy: 'createdAt',
    orderDir: 'desc'
  })
  const withItems = await Promise.all(
    orders.map(async (order) => ({
      ...order,
      items: await store.find('order_items', { where: { orderId: Number(order.id) } })
    }))
  )
  return { orders: withItems }
})
