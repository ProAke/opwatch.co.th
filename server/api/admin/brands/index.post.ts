export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const store = useStore()

  const slug = slugify(String(body?.slug || body?.name || '').trim())
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'admin.required' })

  const existing = await store.findOne('brands', { where: { slug } })
  if (existing) throw createError({ statusCode: 409, statusMessage: 'brand.slugTaken', data: { slug } })

  const name = String(body?.name || slug).trim()
  const accent = String(body?.accentColor || '#b98a44').trim()
  const brand = await store.create('brands', {
    slug,
    name,
    nameEn: String(body?.nameEn || name).trim(),
    nameTh: String(body?.nameTh || name).trim(),
    country: String(body?.country || '').trim(),
    countryEn: String(body?.countryEn || '').trim(),
    movement: String(body?.movement || '').trim(),
    movementEn: String(body?.movementEn || '').trim(),
    positioning: String(body?.positioning || '').trim(),
    tagline: String(body?.tagline || '').trim(),
    taglineEn: String(body?.taglineEn || '').trim(),
    story: String(body?.story || '').trim(),
    storyEn: String(body?.storyEn || '').trim(),
    accentColor: accent,
    logo: String(body?.logo || '').trim(),
    heroImage: String(body?.heroImage || '').trim(),
    sortOrder: Number(body?.sortOrder) || 0,
    active: body?.active === undefined ? true : !!body.active
  })

  return { brand }
})
