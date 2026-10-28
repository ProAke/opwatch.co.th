export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const cfg = getConfig()
  return {
    site: cfg.site,
    admin: { email: cfg.admin.email },
    db: { driver: cfg.db.driver, host: cfg.db.host, port: cfg.db.port, database: cfg.db.database },
    installedAt: cfg.installedAt
  }
})
