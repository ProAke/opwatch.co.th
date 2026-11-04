export default defineEventHandler(async (event) => {
  if (isInstalled()) {
    await requireOfficer(event, '*')
  }
  const removed = removeConfig()
  resetStore()
  return { ok: true, removed }
})
