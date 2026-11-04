export default defineEventHandler(async (event) => {
  await requireOfficer(event, 'promotions_view')
  const items = await useStore().find('coupons', { orderBy: 'id', orderDir: 'desc' })
  return { items }
})
