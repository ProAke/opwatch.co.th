export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const store = useStore()

  const existing = await store.findById('promotions', id)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  if (body?.showOnHome === true) {
    const all = await store.all('promotions')
    for (const p of all) {
      if (Number(p.id) !== id && p.showOnHome) {
        await store.update('promotions', Number(p.id), { showOnHome: false })
      }
    }
  }

  const patch: Record<string, any> = {}
  for (const k of [
    'title', 'titleTh', 'titleEn', 'subtitle', 'subtitleTh', 'subtitleEn',
    'banner', 'mobileBanner', 'channel', 'badge', 'couponCode', 'discountLabel',
    'link', 'targetBlank', 'showOnHome', 'homeColumns', 'productIds',
    'startsAt', 'endsAt', 'sortOrder', 'active'
  ]) {
    if (body?.[k] !== undefined) patch[k] = body[k]
  }
  if (body?.bannerImage !== undefined && patch.banner === undefined) patch.banner = String(body.bannerImage).trim()
  if (body?.targetUrl !== undefined && patch.link === undefined) patch.link = String(body.targetUrl).trim()
  if (body?.badgeText !== undefined && patch.badge === undefined) patch.badge = String(body.badgeText).trim()
  if (body?.ctaTh !== undefined && patch.discountLabel === undefined) patch.discountLabel = String(body.ctaTh).trim()

  if (patch.homeColumns !== undefined) {
    patch.homeColumns = [3, 4, 6].includes(Number(patch.homeColumns)) ? Number(patch.homeColumns) : 4
  }
  if (patch.productIds !== undefined) {
    patch.productIds = Array.isArray(patch.productIds)
      ? patch.productIds.map((n: any) => Number(n)).filter((n: number) => n > 0)
      : []
  }

  const item = await store.update('promotions', id, patch)
  return { item }
})
