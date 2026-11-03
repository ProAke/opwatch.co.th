export default defineEventHandler(async (event) => {
  const actor = await requireRole(event, ['ceo', 'admin'])
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const store = useStore()

  const existing = await store.findById('customers', id)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  // Only CEO can grant or modify another CEO
  if ((existing.role === 'ceo' || body?.role === 'ceo') && actor.role !== 'ceo') {
    throw createError({ statusCode: 403, statusMessage: 'เฉพาะสิทธิ์ CEO เท่านั้นที่แก้ไขระดับ CEO ได้' })
  }

  const patch: Record<string, any> = {}
  for (const k of ['name', 'phone', 'department', 'position', 'permissions', 'status', 'points']) {
    if (body?.[k] !== undefined) patch[k] = body[k]
  }
  if (body?.role && ['ceo', 'admin', 'staff', 'member'].includes(body.role)) {
    patch.role = body.role
    patch.isAdmin = body.role === 'ceo' || body.role === 'admin' || body.role === 'staff'
  }
  if (body?.password && String(body.password).length >= 6) {
    patch.passwordHash = await hashPassword(String(body.password))
  }

  const updated = await store.update('customers', id, patch)
  return { item: publicUser(updated || existing) }
})
