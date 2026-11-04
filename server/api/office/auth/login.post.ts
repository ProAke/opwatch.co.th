export default defineEventHandler(async (event) => {
  const cfg = getConfig()
  if (!cfg.installed) throw createError({ statusCode: 403, statusMessage: 'install.notInstalled' })

  const body = await readBody(event)
  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณากรอกอีเมลและรหัสผ่านสำหรับเจ้าหน้าที่ / ตัวแทนจำหน่าย' })
  }

  const store = useStore()
  // Ensure officer table has seeded accounts on first login
  await ensureSeeded()

  let officer = await store.findOne('officers', { where: { email } })

  // Self-heal CEO officer row if config/site.config.json admin matches
  const cfgAdminEmail = String(cfg.admin?.email || '').trim().toLowerCase()
  if (!officer && cfgAdminEmail && email === cfgAdminEmail && cfg.admin?.passwordHash) {
    const validCfgAdmin = await verifyPassword(password, cfg.admin.passwordHash)
    if (validCfgAdmin) {
      officer = await store.create('officers', {
        code: 'OFC-001',
        name: 'ผู้บริหารสูงสุด (CEO)',
        email: cfgAdminEmail,
        passwordHash: cfg.admin.passwordHash,
        role: 'ceo',
        department: 'ผู้บริหารสูงสุด (Executive)',
        position: 'Chief Executive Officer',
        permissions: ['*'],
        status: 'active'
      })
    }
  }

  if (!officer) {
    // Check if this email belongs to a storefront website customer!
    const customer = await store.findOne('customers', { where: { email } })
    if (customer && !isBackofficeUser(customer)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'บัญชีสมาชิกหน้าเว็บไซต์ไม่สามารถเข้าสู่ระบบหลังบ้าน (/office) ได้ กรุณาใช้บัญชีเจ้าหน้าที่หรือตัวแทนจำหน่าย'
      })
    }
    throw createError({ statusCode: 401, statusMessage: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง (เฉพาะเจ้าหน้าที่และตัวแทนจำหน่าย)' })
  }

  if (officer.status === 'suspended') {
    throw createError({ statusCode: 403, statusMessage: 'บัญชีเจ้าหน้าที่/ตัวแทนจำหน่ายถูกระงับการใช้งานชั่วคราว' })
  }

  let valid = await verifyPassword(password, officer.passwordHash)
  if (!valid && cfgAdminEmail && email === cfgAdminEmail && cfg.admin?.passwordHash) {
    valid = await verifyPassword(password, cfg.admin.passwordHash)
    if (valid) {
      officer = (await store.update('officers', Number(officer.id), {
        passwordHash: cfg.admin.passwordHash,
        role: 'ceo'
      })) || officer
    }
  }

  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
  }

  const role = normalizeOfficeRole(officer.role)
  const nowIso = new Date().toISOString()
  officer = (await store.update('officers', Number(officer.id), { lastLoginAt: nowIso, role })) || {
    ...officer,
    lastLoginAt: nowIso,
    role
  }

  await createOfficeSession(event, Number(officer.id), role)
  return { officer: publicOfficer(officer), roles: OFFICE_ROLES }
})
