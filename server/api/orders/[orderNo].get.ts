export default defineEventHandler(async (event) => {
  const orderNo = getRouterParam(event, 'orderNo') as string
  const store = useStore()
  const order = await store.findOne('orders', { where: { orderNo } })
  if (!order) throw createError({ statusCode: 404, statusMessage: 'order.notFound' })

  const admin = await currentAdmin(event)
  const user = await currentUser(event)
  if (!admin && (!user || Number(order.customerId) !== Number(user.id))) {
    throw createError({ statusCode: 403, statusMessage: 'admin.notAllowed' })
  }

  const items = await store.find('order_items', { where: { orderId: Number(order.id) } })
  return { order, items }
})
