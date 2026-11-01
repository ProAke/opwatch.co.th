export default defineEventHandler(async () => {
  const cfg = getConfig()
  const store = useStore()
  const [categories, brands] = await Promise.all([
    store.find('categories', { orderBy: 'sortOrder', orderDir: 'asc' }),
    store.find('brands', { where: { active: 1 }, orderBy: 'sortOrder', orderDir: 'asc' }).catch(async () => {
      const all = await store.all('brands')
      return all.filter((b) => b.active !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    })
  ])
  // In JSON mode `active` may be stored as boolean `true` or `1`
  const allBrands = brands.length ? brands : (await store.all('brands')).filter((b) => b.active !== false)
  return {
    installed: cfg.installed,
    site: cfg.site,
    categories,
    brands: allBrands
  }
})
