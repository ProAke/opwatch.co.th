export default defineEventHandler(async (event) => {
  const cfg = getConfig()
  if (!cfg.installed) throw createError({ statusCode: 403, statusMessage: 'install.notInstalled' })

  const body = await readBody(event)
  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')

  const store = useStore()
  const customer = await store.findOne('customers', { where: { email } })
  if (!customer) {
    throw createError({ statusCode: 401, statusMessage: 'auth.invalidCredentials' })
  }

  const valid = await verifyPassword(password, customer.passwordHash)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'auth.invalidCredentials' })
  }

  await createSession(event, Number(customer.id), !!customer.isAdmin)
  return { customer: publicUser(customer) }
})
