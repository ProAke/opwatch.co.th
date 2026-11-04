export default defineEventHandler(async (event) => {
  const officer = await requirePermission(event, ['orders', 'orders_fulfill', 'orders_pickup'])
  const q = getQuery(event)
  const store = useStore()

  let items = await store.find('orders', {
    like: q.q ? { orderNo: String(q.q), customerName: String(q.q), customerEmail: String(q.q), phone: String(q.q) } : undefined,
    where: q.status ? { status: String(q.status) } : undefined,
    orderBy: 'createdAt',
    orderDir: 'desc'
  })

  // Authorized Dealers ONLY see in-store pickup (`การรับสินค้าหน้าร้าน`) orders!
  if (officer.role === 'dealer') {
    items = items.filter((o) => {
      const isPickup = Boolean(o.branchSlug) || o.shippingMethod === 'pickup' || o.channel === 'pickup'
      if (!isPickup) return false
      if (officer.branchSlug && o.branchSlug && o.branchSlug !== officer.branchSlug) return false
      return true
    })
  } else if (q.pickupOnly === '1') {
    items = items.filter((o) => Boolean(o.branchSlug) || o.shippingMethod === 'pickup' || o.channel === 'pickup')
  }

  const withItems = await Promise.all(
    items.map(async (order) => ({
      ...order,
      customer: order.customer || {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.phone,
        address: order.address,
        city: order.city,
        postalCode: order.postalCode
      },
      items: await store.find('order_items', { where: { orderId: Number(order.id) } })
    }))
  )

  return { items: withItems, orders: withItems, total: withItems.length }
})
