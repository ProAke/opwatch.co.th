export default defineEventHandler(async (event) => {
  await requireOfficer(event, 'products_edit')
  const id = Number(getRouterParam(event, 'id'))
  const store = useStore()
  const ok = await store.remove('products', id)
  if (!ok) throw createError({ statusCode: 404, statusMessage: 'product.notFound' })
  await store.raw('DELETE FROM `reviews` WHERE `product_id` = ?', [id]).catch(() => {})
  return { ok: true }
})
