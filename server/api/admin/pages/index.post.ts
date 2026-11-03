export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const store = useStore()

  const title = String(body?.titleTh || body?.title || '').trim()
  if (!title) throw createError({ statusCode: 400, statusMessage: 'Title required' })

  const slug = ensureUniqueSlug(slugify(body?.slug || body?.titleEn || title), await store.all('pages'))
  const page = await store.create('pages', {
    slug,
    category: String(body?.category || 'page').trim(),
    title,
    titleTh: String(body?.titleTh || title).trim(),
    titleEn: String(body?.titleEn || title).trim(),
    summary: String(body?.summary || body?.excerptTh || '').trim(),
    summaryEn: String(body?.summaryEn || '').trim(),
    contentTh: String(body?.contentTh || ''),
    contentEn: String(body?.contentEn || ''),
    banner: String(body?.banner || '/images/op/hero-diver-dark.jpg').trim(),
    seoTitle: String(body?.seoTitle || '').trim(),
    seoDescription: String(body?.seoDescription || '').trim(),
    seoKeywords: String(body?.seoKeywords || '').trim(),
    ogImage: String(body?.ogImage || '').trim(),
    canonicalUrl: String(body?.canonicalUrl || '').trim(),
    aseoSummary: String(body?.aseoSummary || '').trim(),
    aseoFaqs: Array.isArray(body?.aseoFaqs) ? body.aseoFaqs : [],
    schemaType: String(body?.schemaType || 'WebPage').trim(),
    status: body?.status === 'draft' ? 'draft' : 'published',
    sortOrder: Number(body?.sortOrder || 0)
  })
  return { page }
})
