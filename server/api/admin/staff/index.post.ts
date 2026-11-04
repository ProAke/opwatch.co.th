export default defineEventHandler(async (event) => {
  const actor = await requireRole(event, ['ceo', 'it_admin'])
  const body = await readBody(event)
  const store = useStore()

  const name = String(body?.name || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')
  const role = normalizeOfficeRole(body?.role)

  if (!name || !email || password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุชื่อ อีเมล และรหัสผ่านอย่างน้อย 6 ตัวอักษร' })
  }

  if (role === 'ceo' && actor.role !== 'ceo') {
    throw createError({ statusCode: 403, statusMessage: 'เฉพาะ CEO เท่านั้นที่สามารถสร้างบัญชีระดับ CEO ได้' })
  }

  const existing = await store.findOne('officers', { where: { email } })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'อีเมลเจ้าหน้าที่/ตัวแทนจำหน่ายนี้มีอยู่ในระบบแล้ว' })
  }

  const allOfficers = await store.all('officers')
  const prefix = role === 'dealer' ? 'DLR' : 'OFC'
  const code = String(body?.code || `${prefix}-${String(allOfficers.length + 1).padStart(3, '0')}`).trim()

  const created = await store.create('officers', {
    code,
    name,
    email,
    passwordHash: await hashPassword(password),
    phone: String(body?.phone || '').trim(),
    role,
    department: String(body?.department || (role === 'dealer' ? 'เครือข่ายตัวแทนจำหน่าย' : '')).trim(),
    position: String(body?.position || '').trim(),
    dealerCode: role === 'dealer' ? String(body?.dealerCode || code).trim() : null,
    dealerName: role === 'dealer' ? String(body?.dealerName || name).trim() : null,
    dealerTier: role === 'dealer' ? String(body?.dealerTier || 'Gold').trim() : null,
    discountPct: role === 'dealer' ? Number(body?.discountPct ?? 30) : 0,
    branchSlug: String(body?.branchSlug || '').trim() || null,
    permissions: Array.isArray(body?.permissions) && body.permissions.length
      ? body.permissions
      : getRoleDefaultPermissions(role),
    status: body?.status === 'suspended' ? 'suspended' : 'active'
  })

  return { item: publicOfficer(created) }
})
