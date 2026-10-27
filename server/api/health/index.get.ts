export default defineEventHandler(async () => {
  const cfg = getConfig()
  let ok = false
  let driver = cfg.db.driver
  try {
    const store = useStore()
    await store.ready()
    const count = await store.count('products')
    ok = true
    return { status: 'ok', installed: cfg.installed, driver, products: count }
  } catch (err: any) {
    return { status: 'degraded', installed: cfg.installed, driver, error: err?.message }
  }
})
