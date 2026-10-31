export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const store = useStore()

  const existing = await store.findById('brands', id)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'brand.notFound' })

  // Products must not keep pointing at a brand that no longer exists.
  const products = await store.find('products', { where: { brandId: id } })
  for (const p of products) {
    await store.update('products', Number(p.id), { brandId: null, brand: '' })
  }

  await store.remove('brands', id)
  return { ok: true }
})
