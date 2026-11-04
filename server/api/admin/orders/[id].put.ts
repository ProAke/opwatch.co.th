export default defineEventHandler(async (event) => {
  const officer = await requireAdmin(event)
  const role = normalizeOfficeRole(officer.role)
  if (!officerHasPermission(officer, 'orders_fulfill') && !officerHasPermission(officer, 'orders_pickup')) {
    throw createError({ statusCode: 403, statusMessage: 'office.forbidden' })
  }

  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const store = useStore()
  const order = await store.findById('orders', id)
  if (!order) throw createError({ statusCode: 404, statusMessage: 'order.notFound' })

  const isPickup = order.deliveryMethod === 'pickup' || Boolean(order.branchSlug)
  if (role === 'dealer') {
    if (!isPickup) {
      throw createError({ statusCode: 403, statusMessage: 'ตัวแทนจำหน่ายจัดการได้เฉพาะการรับสินค้าหน้าร้านเท่านั้น' })
    }
    if (officer.branchSlug && order.branchSlug && order.branchSlug !== officer.branchSlug) {
      throw createError({ statusCode: 403, statusMessage: 'รายการนี้เป็นของสาขาอื่น' })
    }
  }

  const now = new Date().toISOString()
  const patch: Record<string, any> = { updatedAt: now }
  if (body?.status) {
    patch.status = String(body.status)
    if (patch.status === 'confirmed' && !order.confirmedAt) patch.confirmedAt = now
    if (patch.status === 'shipped' && !order.shippedAt) patch.shippedAt = now
    if (patch.status === 'delivered' && !order.deliveredAt) patch.deliveredAt = now
  }

  const allowedFields =
    role === 'dealer'
      ? ['note']
      : ['paymentMethod', 'note', 'customerName', 'phone', 'address', 'city', 'postalCode', 'carrier', 'trackingNo', 'branchSlug', 'giftMessage']

  for (const k of allowedFields) {
    if (body?.[k] !== undefined) patch[k] = String(body[k] ?? '')
  }
  if (role !== 'dealer' && body?.giftWrap !== undefined) patch.giftWrap = Boolean(body.giftWrap)

  const updated = await store.update('orders', id, patch)
  return { order: updated }
})
