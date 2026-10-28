export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const cfg = getConfig()
  const store = useStore()

  const site = { ...cfg.site }
  for (const key of ['name', 'tagline', 'email', 'phone', 'currency', 'currencySymbol', 'defaultLocale', 'announcement']) {
    if (body?.site?.[key] !== undefined) {
      (site as any)[key] = String(body.site[key]).trim().slice(0, key === 'announcement' ? 400 : 190)
    }
  }
  for (const key of ['shippingFee', 'freeShippingThreshold']) {
    if (body?.site?.[key] !== undefined) (site as any)[key] = Number(body.site[key]) || 0
  }
  if (site.defaultLocale !== 'en') site.defaultLocale = 'th'

  const patch: Record<string, any> = { ...cfg }
  patch.site = site

  // Optional administrator password change.
  if (body?.admin?.password) {
    const pw = String(body.admin.password)
    if (pw.length >= 6) {
      patch.admin = { email: cfg.admin.email, passwordHash: await hashPassword(pw) }
      const adminRow = await store.findOne('customers', { where: { email: cfg.admin.email } })
      if (adminRow) {
        await store.update('customers', Number(adminRow.id), { passwordHash: patch.admin.passwordHash })
      }
    }
  }

  saveConfig(patch)
  return { site, admin: { email: patch.admin.email } }
})
