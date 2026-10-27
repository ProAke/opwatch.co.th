export default defineEventHandler(async () => {
  const cfg = getConfig()
  return {
    installed: cfg.installed,
    siteName: cfg.site.name,
    dbDriver: cfg.db.driver,
    defaultLocale: cfg.site.defaultLocale
  }
})
