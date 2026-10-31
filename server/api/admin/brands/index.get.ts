export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const store = useStore()

  const brands = await store.find('brands', { orderBy: 'sortOrder', orderDir: 'asc' })
  const counts = await Promise.all(
    brands.map((b) => store.count('products', { where: { brandId: Number(b.id) } }))
  )

  return { items: brands.map((b, i) => ({ ...b, productCount: counts[i] })) }
})
