export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const store = useStore()
  const order = await store.findById('orders', id)
  if (!order) throw createError({ statusCode: 404, statusMessage: 'order.notFound' })

  const now = new Date().toISOString()
  const patch: Record<string, any> = { updatedAt: now }
  if (body?.status) {
    patch.status = String(body.status)
    if (patch.status === 'confirmed' && !order.confirmedAt) patch.confirmedAt = now
    if (patch.status === 'shipped' && !order.shippedAt) patch.shippedAt = now
    if (patch.status === 'delivered' && !order.deliveredAt) patch.deliveredAt = now
  }
  for (const k of ['paymentMethod', 'note', 'customerName', 'phone', 'address', 'city', 'postalCode', 'carrier', 'trackingNo', 'branchSlug', 'giftMessage']) {
    if (body?.[k] !== undefined) patch[k] = String(body[k] ?? '')
  }
  if (body?.giftWrap !== undefined) patch.giftWrap = Boolean(body.giftWrap)

  const updated = await store.update('orders', id, patch)
  return { order: updated }
})
