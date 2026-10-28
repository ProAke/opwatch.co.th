export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const store = useStore()
  const productId = Number(body?.productId)
  if (!productId) throw createError({ statusCode: 400, statusMessage: 'productId required' })

  const product = await store.findById('products', productId)
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Product not found' })

  const comment = String(body?.comment || '').trim()
  if (!comment) throw createError({ statusCode: 400, statusMessage: 'comment required' })

  const review = await store.create('reviews', {
    productId,
    customerName: String(body?.customerName || 'Anonymous').trim().slice(0, 160),
    rating: Math.min(5, Math.max(1, Number(body?.rating) || 5)),
    comment: comment.slice(0, 2000),
    status: 'approved'
  })
  return { review }
})
