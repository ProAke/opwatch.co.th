export default defineEventHandler(async (event) => {
  const officer = await requirePermission(event, 'warranty')
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const store = useStore()

  const kind = body?.kind === 'repair' ? 'repairs' : 'warranties'
  const existing = await store.findById(kind, id)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบข้อมูลรายการในระบบ' })
  }

  // Dealers can add counter notes, while status transitions / technician cost updates are for internal staff
  const patch: Record<string, any> = { updatedAt: new Date().toISOString() }
  if (kind === 'warranties') {
    for (const k of ['status', 'warrantyUntil', 'adminNote', 'serialNo', 'productSku', 'productName']) {
      if (body?.[k] !== undefined) patch[k] = body[k]
    }
    if (officer.role === 'dealer' && patch.status === 'rejected') {
      delete patch.status
    }
  } else {
    for (const k of ['status', 'estimatedCost', 'trackingReturn', 'technicianNote', 'serviceType']) {
      if (body?.[k] !== undefined) patch[k] = body[k]
    }
  }

  const updated = await store.update(kind, id, patch)
  return { ok: true, item: updated }
})
