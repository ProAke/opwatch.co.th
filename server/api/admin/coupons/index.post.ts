export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const store = useStore()
  const code = String(body?.code || '').trim().toUpperCase()
  if (!code) throw createError({ statusCode: 400, statusMessage: 'Code required' })

  const item = await store.create('coupons', {
    code,
    title: String(body?.titleTh || body?.title || code).trim(),
    titleTh: String(body?.titleTh || body?.title || code).trim(),
    titleEn: String(body?.titleEn || body?.title || code).trim(),
    description: String(body?.description || '').trim(),
    type: ['percent', 'fixed', 'giftcard'].includes(body?.type) ? body.type : 'fixed',
    value: Number(body?.value || 0),
    minSpend: Number(body?.minSpend || 0),
    maxDiscount: body?.maxDiscount ? Number(body.maxDiscount) : null,
    brandSlug: String(body?.brandSlug || '').trim(),
    expiresAt: String(body?.expiresAt || '').trim(),
    usageLimit: Number(body?.usageLimit || 0),
    usedCount: 0,
    active: body?.active !== false
  })
  return { item }
})
