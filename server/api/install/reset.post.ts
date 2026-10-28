export default defineEventHandler(async () => {
  const removed = removeConfig()
  resetStore()
  return { ok: true, removed }
})
