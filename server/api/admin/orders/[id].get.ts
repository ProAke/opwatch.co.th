export default defineEventHandler(async (event) => {
  const officer = await requireAdmin(event)
  const role = normalizeOfficeRole(officer.role)
  if (!officerHasPermission(officer, 'orders') && !officerHasPermission(officer, 'orders_pickup')) {
    throw createError({ statusCode: 403, statusMessage: 'office.forbidden' })
  }

  const id = Number(getRouterParam(event, 'id'))
  const store = useStore()
  const order = await store.findById('orders', id)
  if (!order) throw createError({ statusCode: 404, statusMessage: 'order.notFound' })

  const isPickup = order.deliveryMethod === 'pickup' || Boolean(order.branchSlug)
  if (role === 'dealer') {
    if (!isPickup) {
      throw createError({ statusCode: 403, statusMessage: 'ตัวแทนจำหน่ายดูได้เฉพาะรายการรับสินค้าหน้าร้าน (In-Store Pickup) เท่านั้น' })
    }
    if (officer.branchSlug && order.branchSlug && order.branchSlug !== officer.branchSlug) {
      throw createError({ statusCode: 403, statusMessage: 'รายการนี้เป็นของสาขาอื่น' })
    }
  }

  const items = await store.find('order_items', { where: { orderId: id } })
  const branch = order.branchSlug ? await store.findOne('branches', { where: { slug: order.branchSlug } }) : null
  const enriched = {
    ...order,
    customer: order.customer || {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.phone,
      address: order.address,
      city: order.city,
      postalCode: order.postalCode
    },
    items
  }
  return { order: enriched, items, branch }
})
