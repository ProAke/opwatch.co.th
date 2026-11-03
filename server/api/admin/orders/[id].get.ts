export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const store = useStore()
  const order = await store.findById('orders', id)
  if (!order) throw createError({ statusCode: 404, statusMessage: 'order.notFound' })

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
