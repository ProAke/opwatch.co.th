export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const store = useStore()
  const existing = await store.findById('categories', id)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'category.notFound' })

  const body = await readBody(event)
  const patch: Record<string, any> = {}
  for (const key of ['name', 'nameEn', 'nameTh', 'slug', 'description', 'descriptionEn', 'descriptionTh', 'image', 'sortOrder']) {
    if (body?.[key] !== undefined) patch[key] = body[key]
  }
  if (patch.slug !== undefined) patch.slug = ensureUniqueSlug(slugify(patch.slug), await store.all('categories'), id)
  const category = await store.update('categories', id, patch)
  return { category }
})
