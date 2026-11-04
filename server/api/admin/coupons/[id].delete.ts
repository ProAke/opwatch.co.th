export default defineEventHandler(async (event) => {
  await requireOfficer(event, 'promotions')
  const id = Number(getRouterParam(event, 'id'))
  const ok = await useStore().remove('coupons', id)
  return { ok }
})
