export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const store = useStore()
  const ok = await store.remove('products', id)
  if (!ok) throw createError({ statusCode: 404, statusMessage: 'product.notFound' })
  await store.raw('DELETE FROM `reviews` WHERE `product_id` = ?', [id]).catch(() => {})
  return { ok: true }
})
