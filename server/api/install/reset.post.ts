export default defineEventHandler(async (event) => {
  if (isInstalled()) {
    await requireAdmin(event)
  }
  const removed = removeConfig()
  resetStore()
  return { ok: true, removed }
})
