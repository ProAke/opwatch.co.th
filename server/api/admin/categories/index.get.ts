export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const store = useStore()
  const items = await store.find('categories', { orderBy: 'sortOrder', orderDir: 'asc' })
  const withCounts = await Promise.all(
    items.map(async (c) => ({
      ...c,
      productsCount: await store.count('products', { where: { categoryId: Number(c.id) } })
    }))
  )
  return { items: withCounts }
})
