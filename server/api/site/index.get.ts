import { ensureCatalogReady } from '../../utils/seed'

export default defineEventHandler(async () => {
  const cfg = getConfig()
  const store = useStore()
  if (cfg.installed) {
    await ensureCatalogReady(store)
  }
  const [categories, allRawBrands] = await Promise.all([
    store.find('categories', { orderBy: 'sortOrder', orderDir: 'asc' }),
    store.find('brands', { orderBy: 'sortOrder', orderDir: 'asc' })
  ])
  const allBrands = allRawBrands
    .filter((b) => b.active !== false && Number(b.active) !== 0)
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))

  return {
    installed: cfg.installed,
    site: cfg.site,
    categories,
    brands: allBrands
  }
})
