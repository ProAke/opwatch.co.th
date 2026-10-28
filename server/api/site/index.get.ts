export default defineEventHandler(async () => {
  const cfg = getConfig()
  const store = useStore()
  const categories = await store.all('categories')
  return {
    installed: cfg.installed,
    site: cfg.site,
    categories
  }
})
