export default defineEventHandler(async (event) => {
  const cfg = getConfig()
  if (!cfg.installed) throw createError({ statusCode: 403, statusMessage: 'install.notInstalled' })

  const body = await readBody(event)
  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')

  const store = useStore()
  let customer = await store.findOne('customers', { where: { email } })

  // Self-heal admin customer row if config/site.config.json matches
  const cfgAdminEmail = String(cfg.admin?.email || '').trim().toLowerCase()
  if (!customer && cfgAdminEmail && email === cfgAdminEmail && cfg.admin?.passwordHash) {
    const validCfgAdmin = await verifyPassword(password, cfg.admin.passwordHash)
    if (validCfgAdmin) {
      customer = await store.create('customers', {
        name: 'Administrator',
        email: cfgAdminEmail,
        passwordHash: cfg.admin.passwordHash,
        isAdmin: true,
        points: 0,
        totalSpent: 0
      })
    }
  }

  if (!customer) {
    throw createError({ statusCode: 401, statusMessage: 'auth.invalidCredentials' })
  }

  let valid = await verifyPassword(password, customer.passwordHash)
  if (!valid && cfgAdminEmail && email === cfgAdminEmail && cfg.admin?.passwordHash) {
    valid = await verifyPassword(password, cfg.admin.passwordHash)
    if (valid) {
      customer = (await store.update('customers', Number(customer.id), {
        passwordHash: cfg.admin.passwordHash,
        isAdmin: true
      })) || customer
    }
  }

  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'auth.invalidCredentials' })
  }

  await createSession(event, Number(customer.id), !!customer.isAdmin)
  return { customer: publicUser(customer) }
})
