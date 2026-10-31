export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const store = useStore()
  const body = await readBody(event)

  const existing = await store.findById('brands', id)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'brand.notFound' })

  const patch: Record<string, any> = {}
  for (const key of [
    'name', 'nameEn', 'nameTh', 'country', 'countryEn', 'movement', 'movementEn',
    'positioning', 'tagline', 'taglineEn', 'story', 'storyEn', 'accentColor',
    'logo', 'heroImage', 'sortOrder'
  ]) {
    if (body?.[key] !== undefined) patch[key] = body[key]
  }

  if (patch.slug !== undefined) {
    const slug = slugify(String(patch.slug).trim())
    const clash = await store.findOne('brands', { where: { slug } })
    if (clash && Number(clash.id) !== id) {
      throw createError({ statusCode: 409, statusMessage: 'brand.slugTaken', data: { slug } })
    }
    patch.slug = slug
  } else if (patch.name !== undefined) {
    patch.slug = slugify(String(patch.name).trim())
  }

  if (body?.active !== undefined) patch.active = !!body.active

  const brand = await store.update('brands', id, patch)
  return { brand }
})
