export default defineEventHandler(async (event) => {
  const cfg = getConfig()
  if (!cfg.installed) throw createError({ statusCode: 403, statusMessage: 'install.notInstalled' })

  const body = await readBody(event)
  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'auth.invalidCredentials' })
  }

  const store = useStore()
  const customer = await store.findOne('customers', { where: { email } })

  if (!customer) {
    // Check if an officer/dealer accidentally tried logging in via the storefront member login
    const officer = await store.findOne('officers', { where: { email } })
    if (officer) {
      throw createError({
        statusCode: 403,
        statusMessage: 'บัญชีเจ้าหน้าที่และตัวแทนจำหน่าย กรุณาเข้าสู่ระบบที่หน้าจัดการหลังบ้าน (/office/login)'
      })
    }
    throw createError({ statusCode: 401, statusMessage: 'auth.invalidCredentials' })
  }

  if (customer.status === 'suspended') {
    throw createError({ statusCode: 403, statusMessage: 'บัญชีสมาชิกถูกระงับการใช้งานชั่วคราว' })
  }

  // Strictly block legacy admin/staff rows that were migrated out of `customers` from acting as admin
  const valid = await verifyPassword(password, customer.passwordHash)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'auth.invalidCredentials' })
  }

  await store.update('customers', Number(customer.id), {
    lastLoginAt: new Date().toISOString(),
    isAdmin: false,
    role: 'member'
  })

  await createSession(event, Number(customer.id), false)
  return { customer: publicUser(customer) }
})
