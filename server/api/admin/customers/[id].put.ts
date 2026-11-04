export default defineEventHandler(async (event) => {
  await requirePermission(event, 'customers')
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const store = useStore()

  const existing = await store.findById('customers', id)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'ไม่พบข้อมูลสมาชิกหน้าเว็บไซต์' })

  const patch: Record<string, any> = {}
  for (const k of ['name', 'phone', 'address', 'city', 'postalCode', 'points', 'status']) {
    if (body?.[k] !== undefined) patch[k] = body[k]
  }
  // Enforce storefront member boundary
  patch.isAdmin = false
  patch.role = 'member'

  const updated = await store.update('customers', id, patch)
  return { item: publicUser(updated || existing) }
})
