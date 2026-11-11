export default defineEventHandler(async (event) => {
  const sessionOfficer = await requireAdmin(event)
  const body = await readBody(event)
  const store = useStore()

  const currentPassword = String(body?.currentPassword || '').trim()
  const newPassword = String(body?.newPassword || '').trim()

  if (!currentPassword) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณากรอกรหัสผ่านปัจจุบัน' })
  }
  if (newPassword.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' })
  }

  const officerRow = await store.findById('officers', Number(sessionOfficer.id))
  if (!officerRow) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบบัญชีเจ้าหน้าที่ในระบบ' })
  }

  const valid = await verifyPassword(currentPassword, String(officerRow.passwordHash || ''))
  if (!valid) {
    throw createError({ statusCode: 400, statusMessage: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' })
  }

  const nextHash = await hashPassword(newPassword)
  await store.update('officers', Number(officerRow.id), {
    passwordHash: nextHash,
    updatedAt: new Date().toISOString()
  })

  const cfg = getConfig()
  if (String(officerRow.email || '').toLowerCase() === String(cfg.admin?.email || '').toLowerCase()) {
    saveConfig({
      ...cfg,
      admin: {
        ...cfg.admin,
        passwordHash: nextHash
      }
    })
  }

  return {
    ok: true,
    message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว'
  }
})
