export default defineEventHandler(async (event) => {
  destroySession(event)
  return { ok: true }
})
