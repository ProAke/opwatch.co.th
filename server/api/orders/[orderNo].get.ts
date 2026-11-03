export default defineEventHandler(async (event) => {
  const orderNo = String(getRouterParam(event, 'orderNo') || '').trim().toUpperCase()
  const q = getQuery(event)
  const store = useStore()
  const order = await store.findOne('orders', { where: { orderNo } })
  if (!order) throw createError({ statusCode: 404, statusMessage: 'order.notFound' })

  const admin = await currentAdmin(event)
  const user = await currentUser(event)
  const contact = String(q.contact || '').trim().toLowerCase()
  const isOwner = Boolean(user && Number(order.customerId) === Number(user.id))
  const isGuestOrder = !order.customerId
  const matchesContact = Boolean(
    contact &&
      (String(order.customerEmail || '').toLowerCase() === contact ||
        String(order.phone || '').replace(/\D+/g, '').endsWith(contact.replace(/\D+/g, '').slice(-4)))
  )

  if (!admin && !isOwner && !isGuestOrder && !matchesContact) {
    // Return public tracking status view with masked personal address
    const items = await store.find('order_items', { where: { orderId: Number(order.id) } })
    return {
      order: {
        id: order.id,
        orderNo: order.orderNo,
        status: order.status,
        carrier: order.carrier,
        trackingNo: order.trackingNo,
        confirmedAt: order.confirmedAt,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        branchSlug: order.branchSlug,
        giftWrap: order.giftWrap,
        total: order.total,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        discount: order.discount,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      },
      items,
      publicView: true
    }
  }

  const items = await store.find('order_items', { where: { orderId: Number(order.id) } })
  const branch = order.branchSlug ? await store.findOne('branches', { where: { slug: order.branchSlug } }) : null
  return { order, items, branch, publicView: false }
})
