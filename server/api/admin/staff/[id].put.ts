export default defineEventHandler(async (event) => {
  const actor = await requireRole(event, ['ceo', 'it_admin'])
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const store = useStore()

  const existing = await store.findById('officers', id)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'ไม่พบบัญชีเจ้าหน้าที่/ตัวแทนจำหน่าย' })

  if ((existing.role === 'ceo' || body?.role === 'ceo') && actor.role !== 'ceo') {
    throw createError({ statusCode: 403, statusMessage: 'เฉพาะสิทธิ์ CEO เท่านั้นที่แก้ไขระดับ CEO ได้' })
  }

  const patch: Record<string, any> = { updatedAt: new Date().toISOString() }
  for (const k of [
    'code', 'name', 'phone', 'department', 'position',
    'dealerCode', 'dealerName', 'dealerTier', 'discountPct', 'branchSlug',
    'permissions', 'status'
  ]) {
    if (body?.[k] !== undefined) patch[k] = body[k]
  }
  if (body?.role) {
    patch.role = normalizeOfficeRole(body.role)
    if (!Array.isArray(body?.permissions)) {
      patch.permissions = getRoleDefaultPermissions(patch.role)
    }
  }
  if (body?.password && String(body.password).length >= 6) {
    patch.passwordHash = await hashPassword(String(body.password))
  }

  const updated = await store.update('officers', id, patch)
  return { item: publicOfficer(updated || existing) }
})
