export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const patch: Record<string, any> = {}
  for (const k of ['code', 'title', 'titleTh', 'titleEn', 'description', 'type', 'value', 'minSpend', 'maxDiscount', 'brandSlug', 'expiresAt', 'usageLimit', 'active']) {
    if (body?.[k] !== undefined) patch[k] = body[k]
  }
  if (patch.code) patch.code = String(patch.code).trim().toUpperCase()
  const item = await useStore().update('coupons', id, patch)
  return { item }
})
