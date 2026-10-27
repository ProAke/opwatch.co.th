export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const store = useStore()

  const [orders, products, customers] = await Promise.all([
    store.all('orders'),
    store.all('products'),
    store.all('customers')
  ])

  const revenue = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((sum, o) => sum + Number(o.total || 0), 0)

  const ordersWithItems = await Promise.all(
    orders
      .slice()
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, 6)
      .map(async (o) => ({ ...o, items: await store.find('order_items', { where: { orderId: Number(o.id) } }) }))
  )

  // Best sellers by quantity.
  const items = await store.all('order_items')
  const sales: Record<number, { name: string; quantity: number; revenue: number }> = {}
  for (const it of items) {
    const key = Number(it.productId)
    if (!sales[key]) sales[key] = { name: it.name, quantity: 0, revenue: 0 }
    sales[key].quantity += Number(it.quantity)
    sales[key].revenue += Number(it.price) * Number(it.quantity)
  }
  const topProducts = Object.entries(sales)
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 5)
    .map(([id, v]) => ({ id: Number(id), name: v.name, quantity: v.quantity, revenue: v.revenue }))

  const lowStock = products
    .filter((p) => Number(p.stock) <= 10)
    .sort((a, b) => Number(a.stock) - Number(b.stock))
    .slice(0, 5)

  return {
    totals: {
      revenue: Math.round(revenue * 100) / 100,
      orders: orders.length,
      customers: customers.length,
      products: products.length,
      avgOrder: orders.length ? Math.round((revenue / orders.length) * 100) / 100 : 0
    },
    recentOrders: ordersWithItems,
    topProducts,
    lowStock,
    orderStatusCounts: orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1
      return acc
    }, {})
  }
})
