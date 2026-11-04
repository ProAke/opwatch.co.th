import { requireOfficer } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireOfficer(event, 'pages')
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid review ID' })

  const body = await readBody(event)
  const store = useStore()
  const existing = await store.findById('reviews', id)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Review not found' })

  const patch: Record<string, any> = {}
  if (body.status !== undefined) patch.status = String(body.status)
  if (body.rating !== undefined) patch.rating = Math.min(5, Math.max(1, Number(body.rating) || 5))
  if (body.customerName !== undefined) patch.customerName = String(body.customerName).trim()
  if (body.comment !== undefined) patch.comment = String(body.comment).trim()
  if (body.productId !== undefined) patch.productId = Number(body.productId)

  const updated = await store.update('reviews', id, patch)
  return { ok: true, review: updated }
})
