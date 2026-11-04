export default defineEventHandler(async (event) => {
  await requirePermission(event, 'pages')
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const store = useStore()

  const existing = await store.findById('pages', id)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Page not found' })

  const patch: Record<string, any> = { updatedAt: new Date().toISOString() }
  for (const k of [
    'parentId', 'slug', 'pageType', 'routePath', 'brandSlug', 'seriesKey',
    'category', 'heroEyebrow', 'title', 'titleTh', 'titleEn', 'summary', 'summaryEn',
    'contentTh', 'contentEn', 'banner', 'mobileBanner', 'gallery', 'styleConfig',
    'productIds', 'ctaText', 'ctaUrl',
    'seoTitle', 'seoDescription', 'seoKeywords', 'ogImage', 'canonicalUrl',
    'aseoSummary', 'aseoFaqs', 'schemaType', 'status', 'sortOrder'
  ]) {
    if (body?.[k] !== undefined) patch[k] = body[k]
  }
  if (patch.parentId !== undefined) {
    const pid = patch.parentId ? Number(patch.parentId) : null
    patch.parentId = pid && pid !== id ? pid : null
  }
  if (Array.isArray(patch.productIds)) {
    patch.productIds = patch.productIds.map((x: any) => Number(x)).filter(Boolean)
  }
  if (body?.excerptTh !== undefined && patch.summary === undefined) {
    patch.summary = String(body.excerptTh).trim()
  }
  if (body?.published !== undefined && patch.status === undefined) {
    patch.status = body.published === false ? 'draft' : 'published'
  }
  if (patch.slug && patch.slug !== existing.slug) {
    patch.slug = ensureUniqueSlug(slugify(patch.slug), await store.all('pages'), id)
  }

  const page = await store.update('pages', id, patch)
  return { page }
})
