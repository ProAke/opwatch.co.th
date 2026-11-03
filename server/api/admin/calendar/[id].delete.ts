export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid event ID' })
  const store = useStore()
  await store.remove('events', id)
  return { ok: true }
})
