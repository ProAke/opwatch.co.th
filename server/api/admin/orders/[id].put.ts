export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const store = useStore()
  const order = await store.findById('orders', id)
  if (!order) throw createError({ statusCode: 404, statusMessage: 'order.notFound' })

  const patch: Record<string, any> = {}
  if (body?.status) patch.status = String(body.status)
  if (body?.paymentMethod !== undefined) patch.paymentMethod = String(body.paymentMethod)
  if (body?.note !== undefined) patch.note = String(body.note)
  if (body?.customerName !== undefined) patch.customerName = String(body.customerName)
  if (body?.phone !== undefined) patch.phone = String(body.phone)
  if (body?.address !== undefined) patch.address = String(body.address)
  if (body?.city !== undefined) patch.city = String(body.city)
  if (body?.postalCode !== undefined) patch.postalCode = String(body.postalCode)

  const updated = await store.update('orders', id, patch)
  return { order: updated }
})
