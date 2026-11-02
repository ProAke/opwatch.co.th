import { ensureCatalogReady } from '../../utils/seed'

export default defineEventHandler(async () => {
  const cfg = getConfig()
  const driver = cfg.db.driver
  try {
    const store = useStore()
    await store.ready()
    if (cfg.installed) {
      await ensureCatalogReady(store)
    }
    const count = await store.count('products')
    return { status: 'ok', installed: cfg.installed, driver, products: count }
  } catch (err: any) {
    return { status: 'degraded', installed: cfg.installed, driver, error: err?.message }
  }
})
