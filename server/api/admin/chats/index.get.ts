export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const items = await useStore().find('chats', { orderBy: 'id', orderDir: 'desc', limit: 100 })
  return { items }
})
