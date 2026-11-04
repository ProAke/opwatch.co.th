export default defineEventHandler(async (event) => {
  const officer = await requirePermission(event, ['warehouse_dealer', 'dealer_portal', 'warehouse_5ch'])
  const body = await readBody(event)
  const store = useStore()

  const productId = Number(body?.productId)
  if (!productId) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกรุ่นนาฬิกา' })
  }

  const product = await store.findById('products', productId)
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบข้อมูลนาฬิกา' })
  }

  const dealerCode = officer.role === 'dealer'
    ? String(officer.dealerCode || `DLR-${officer.id}`)
    : String(body?.dealerCode || 'DLR-BKK-01')

  const onHand = Math.max(0, Math.floor(Number(body?.onHand ?? 0)))
  const reserved = Math.max(0, Math.floor(Number(body?.reserved ?? 0)))
  const reorderPoint = Math.max(0, Math.floor(Number(body?.reorderPoint ?? 2)))
  const notes = String(body?.notes || '').trim()

  const existing = await store.findOne('dealer_stocks', {
    where: { dealerCode, productId }
  })

  if (body?.action === 'delete' && existing) {
    await store.remove('dealer_stocks', Number(existing.id))
    return { ok: true, deleted: true }
  }

  const payload = {
    officerId: Number(officer.id || 0),
    dealerCode,
    productId,
    sku: product.sku,
    onHand,
    reserved,
    reorderPoint,
    notes,
    updatedAt: new Date().toISOString()
  }

  const saved = existing
    ? await store.update('dealer_stocks', Number(existing.id), payload)
    : await store.create('dealer_stocks', payload)

  return { ok: true, item: saved }
})
