export default defineEventHandler(async (event) => {
  const cfg = getConfig()
  if (!cfg.installed) throw createError({ statusCode: 403, statusMessage: 'install.notInstalled' })

  const body = await readBody(event)
  const name = String(body?.name || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')

  const errors: Record<string, string> = {}
  if (!name) errors.name = 'validation.required'
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'validation.emailInvalid'
  if (password.length < 8) errors.password = 'validation.passwordWeak'
  if (Object.keys(errors).length) {
    throw createError({ statusCode: 400, statusMessage: 'register.invalid', data: { errors } })
  }

  const store = useStore()
  const existing = await store.findOne('customers', { where: { email } })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'auth.emailTaken', data: { errors: { email: 'auth.emailTaken' } } })
  }

  const passwordHash = await hashPassword(password)
  const customer = await store.create('customers', {
    name,
    email,
    passwordHash,
    phone: String(body?.phone || '').trim() || null,
    points: 0,
    totalSpent: 0
  })

  await createSession(event, Number(customer.id), false)
  return { customer: publicUser(customer) }
})
