export default defineEventHandler(async (event) => {
  destroyOfficeSession(event)
  return { ok: true }
})
