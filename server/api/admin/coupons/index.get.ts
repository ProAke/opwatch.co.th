export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const items = await useStore().find('coupons', { orderBy: 'id', orderDir: 'desc' })
  return { items }
})
