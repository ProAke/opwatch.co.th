export default defineEventHandler(async (event) => {
  await requireRole(event, ['ceo', 'admin'])
  const body = await readBody(event)
  const store = useStore()

  const name = String(body?.name || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')
  const role = ['ceo', 'admin', 'staff', 'member'].includes(body?.role) ? body.role : 'staff'

  if (!name || !email || password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุชื่อ อีเมล และรหัสผ่านอย่างน้อย 6 ตัวอักษร' })
  }

  const existing = await store.findOne('customers', { where: { email } })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'อีเมลนี้มีอยู่ในระบบแล้ว' })
  }

  const created = await store.create('customers', {
    name,
    email,
    passwordHash: await hashPassword(password),
    phone: String(body?.phone || '').trim(),
    role,
    isAdmin: role === 'ceo' || role === 'admin' || role === 'staff',
    department: String(body?.department || '').trim(),
    position: String(body?.position || '').trim(),
    permissions: Array.isArray(body?.permissions) ? body.permissions : [],
    status: 'active',
    points: Number(body?.points || 0),
    totalSpent: 0
  })

  return { item: publicUser(created) }
})
