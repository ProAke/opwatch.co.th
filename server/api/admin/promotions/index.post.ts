export default defineEventHandler(async (event) => {
  await requireOfficer(event, 'promotions')
  const body = await readBody(event)
  const store = useStore()

  const title = String(body?.titleTh || body?.title || '').trim()
  if (!title) throw createError({ statusCode: 400, statusMessage: 'admin.required' })

  const slug = ensureUniqueSlug(slugify(body?.slug || body?.titleEn || title), await store.all('promotions'))
  const cols = [3, 4, 6].includes(Number(body?.homeColumns)) ? Number(body.homeColumns) : 4
  const productIds = Array.isArray(body?.productIds)
    ? body.productIds.map((n: any) => Number(n)).filter((n: number) => n > 0)
    : []

  if (body?.showOnHome) {
    const existing = await store.all('promotions')
    for (const p of existing) {
      if (p.showOnHome) await store.update('promotions', Number(p.id), { showOnHome: false })
    }
  }

  const item = await store.create('promotions', {
    slug,
    title,
    titleTh: String(body?.titleTh || title).trim(),
    titleEn: String(body?.titleEn || title).trim(),
    subtitle: String(body?.subtitleTh || body?.subtitle || '').trim(),
    subtitleTh: String(body?.subtitleTh || body?.subtitle || '').trim(),
    subtitleEn: String(body?.subtitleEn || body?.subtitle || '').trim(),
    banner: String(body?.banner || body?.bannerImage || '/images/op/banner-899832ags.jpg').trim(),
    mobileBanner: String(body?.mobileBanner || '').trim(),
    channel: String(body?.channel || 'website').trim(),
    badge: String(body?.badge || body?.badgeText || '').trim(),
    couponCode: String(body?.couponCode || '').trim().toUpperCase(),
    discountLabel: String(body?.discountLabel || body?.ctaTh || '').trim(),
    link: String(body?.link || body?.targetUrl || '/promotions').trim(),
    targetBlank: Boolean(body?.targetBlank),
    showOnHome: Boolean(body?.showOnHome),
    homeColumns: cols,
    productIds,
    startsAt: String(body?.startsAt || '').trim(),
    endsAt: String(body?.endsAt || '').trim(),
    sortOrder: Number(body?.sortOrder || 0),
    active: body?.active !== false
  })

  return { item }
})
