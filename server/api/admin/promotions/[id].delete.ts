export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const ok = await useStore().remove('promotions', id)
  return { ok }
})
