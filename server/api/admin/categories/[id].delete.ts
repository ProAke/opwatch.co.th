export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const store = useStore()
  const ok = await store.remove('categories', id)
  if (!ok) throw createError({ statusCode: 404, statusMessage: 'category.notFound' })
  // Products in this category are kept but detached from the removed category.
  const products = await store.find('products', { where: { categoryId: id } })
  for (const p of products) {
    await store.update('products', Number(p.id), { categoryId: null })
  }
  return { ok: true }
})
