export default defineEventHandler(async (event) => {
  await requireOfficer(event, 'branches')
  const id = Number(getRouterParam(event, 'id'))
  const ok = await useStore().remove('branches', id)
  return { ok }
})
