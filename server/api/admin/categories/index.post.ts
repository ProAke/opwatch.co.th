export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const store = useStore()
  const name = String(body?.name || '').trim()
  if (!name) throw createError({ statusCode: 400, statusMessage: 'admin.required' })

  const slug = ensureUniqueSlug(slugify(body?.slug || name), await store.all('categories'))
  const category = await store.create('categories', {
    slug,
    name,
    nameEn: String(body?.nameEn || '').trim() || name,
    nameTh: String(body?.nameTh || '').trim() || name,
    description: String(body?.description || '').trim(),
    descriptionEn: String(body?.descriptionEn || '').trim(),
    descriptionTh: String(body?.descriptionTh || '').trim(),
    image: String(body?.image || '').trim() || null,
    sortOrder: Number(body?.sortOrder) || 0
  })
  return { category }
})
