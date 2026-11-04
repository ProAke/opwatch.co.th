export default defineEventHandler(async (event) => {
  await requirePermission(event, 'pages')
  const body = await readBody(event)
  const store = useStore()

  const title = String(body?.titleTh || body?.title || '').trim()
  if (!title) throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุหัวข้อหน้าเว็บไซต์' })

  const slug = ensureUniqueSlug(slugify(body?.slug || body?.titleEn || title), await store.all('pages'))
  const pageType = String(body?.pageType || 'custom_landing').trim()
  const routePath = String(body?.routePath || `/pages/${slug}`).trim()

  const page = await store.create('pages', {
    parentId: body?.parentId ? Number(body.parentId) : null,
    slug,
    pageType,
    routePath,
    brandSlug: String(body?.brandSlug || '').trim() || null,
    seriesKey: String(body?.seriesKey || '').trim() || null,
    category: String(body?.category || pageType).trim(),
    heroEyebrow: String(body?.heroEyebrow || '').trim() || null,
    title,
    titleTh: String(body?.titleTh || title).trim(),
    titleEn: String(body?.titleEn || title).trim(),
    summary: String(body?.summary || body?.excerptTh || '').trim(),
    summaryEn: String(body?.summaryEn || '').trim(),
    contentTh: String(body?.contentTh || ''),
    contentEn: String(body?.contentEn || ''),
    banner: String(body?.banner || '/images/op/hero-diver-dark.jpg').trim(),
    mobileBanner: String(body?.mobileBanner || '').trim() || null,
    gallery: Array.isArray(body?.gallery) ? body.gallery : [],
    styleConfig: body?.styleConfig && typeof body.styleConfig === 'object'
      ? body.styleConfig
      : {
          fontFamily: 'Prompt',
          headingColor: '#ffffff',
          textColor: '#23264d',
          accentColor: '#1d2088',
          bgColor: '#0e1535',
          overlayOpacity: 0.56,
          headingSize: 'xl'
        },
    productIds: Array.isArray(body?.productIds) ? body.productIds.map((x: any) => Number(x)).filter(Boolean) : [],
    ctaText: String(body?.ctaText || '').trim() || null,
    ctaUrl: String(body?.ctaUrl || '').trim() || null,
    seoTitle: String(body?.seoTitle || '').trim(),
    seoDescription: String(body?.seoDescription || '').trim(),
    seoKeywords: String(body?.seoKeywords || '').trim(),
    ogImage: String(body?.ogImage || '').trim(),
    canonicalUrl: String(body?.canonicalUrl || '').trim(),
    aseoSummary: String(body?.aseoSummary || '').trim(),
    aseoFaqs: Array.isArray(body?.aseoFaqs) ? body.aseoFaqs : [],
    schemaType: String(body?.schemaType || 'WebPage').trim(),
    status: body?.status === 'draft' || body?.published === false ? 'draft' : 'published',
    sortOrder: Number(body?.sortOrder || 50)
  })
  return { page }
})
