export default defineEventHandler(async (event) => {
  await requireOfficer(event, 'branches')
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const patch: Record<string, any> = {}
  for (const k of ['name', 'nameTh', 'nameEn', 'zone', 'address', 'addressEn', 'phone', 'hours', 'lineUrl', 'mapUrl', 'services', 'sortOrder', 'active']) {
    if (body?.[k] !== undefined) patch[k] = body[k]
  }
  const item = await useStore().update('branches', id, patch)
  return { item }
})
