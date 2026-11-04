export default defineEventHandler(async (event) => {
  await requireOfficer(event, 'branches')
  const body = await readBody(event)
  const store = useStore()
  const name = String(body?.nameTh || body?.name || '').trim()
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Name required' })

  const slug = ensureUniqueSlug(slugify(body?.slug || body?.nameEn || name), await store.all('branches'))
  const item = await store.create('branches', {
    slug,
    name,
    nameTh: String(body?.nameTh || name).trim(),
    nameEn: String(body?.nameEn || name).trim(),
    zone: String(body?.zone || body?.province || 'กรุงเทพมหานคร').trim(),
    address: String(body?.address || body?.addressTh || '').trim(),
    addressEn: String(body?.addressEn || '').trim(),
    phone: String(body?.phone || '02 251 5777').trim(),
    hours: String(body?.hours || '10:00 – 22:00').trim(),
    lineUrl: String(body?.lineUrl || 'https://line.me/ti/p/~opwatch.th').trim(),
    mapUrl: String(body?.mapUrl || '').trim(),
    services: Array.isArray(body?.services) ? body.services : ['click_collect', 'gift_wrap', 'strap_resize'],
    sortOrder: Number(body?.sortOrder || 0),
    active: body?.active !== false
  })
  return { item }
})
