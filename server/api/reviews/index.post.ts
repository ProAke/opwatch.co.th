export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const customerName = String(body?.customerName || 'ผู้ใช้งานจริง').trim()
  const comment = String(body?.comment || '').trim()
  if (!comment || comment.length < 4) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุข้อความรีวิวอย่างน้อย 4 ตัวอักษร' })
  }

  const store = useStore()
  let productId = Number(body?.productId || 0)
  if (!productId) {
    const firstProd = (await store.all('products').catch(() => []))[0]
    productId = firstProd ? Number(firstProd.id) : 1
  }

  const created = await store.create('reviews', {
    productId,
    customerName,
    rating: Math.min(5, Math.max(1, Number(body?.rating) || 5)),
    comment,
    status: 'approved'
  })
  return { ok: true, review: created }
})
