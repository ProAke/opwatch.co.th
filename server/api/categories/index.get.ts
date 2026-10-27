export default defineEventHandler(async () => {
  const store = useStore()
  const items = await store.find('categories', { orderBy: 'sortOrder', orderDir: 'asc' })
  return { items }
})
