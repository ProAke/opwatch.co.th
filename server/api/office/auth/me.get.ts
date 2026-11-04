export default defineEventHandler(async (event) => {
  const cfg = getConfig()
  if (cfg.installed) {
    await ensureSeeded()
  }
  const officer = await currentOfficer(event)
  const customer = officer ? null : await currentUser(event)
  return {
    officer: officer || null,
    authenticated: !!officer,
    roles: OFFICE_ROLES,
    customerBlockedFromOffice: Boolean(!officer && customer)
  }
})
