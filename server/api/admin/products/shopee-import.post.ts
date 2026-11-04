import { inspectShopeeCatalog, commitShopeeCatalogImport } from '../../../utils/shopee'

export default defineEventHandler(async (event) => {
  await requireOfficer(event, 'products_edit')
  const body = await readBody(event)
  const store = useStore()

  // Step 1 (Default): Pre-import inspection & staging checklist — NO DB writes until confirmed!
  if (!body?.commit && !body?.saveImmediately) {
    const inspection = await inspectShopeeCatalog(store, {
      url: body?.url,
      rawPayload: body?.rawPayload || body?.rawText,
      brandSlug: body?.brandSlug,
      categorySlug: body?.categorySlug,
      useAi: body?.useAi !== false
    })

    return {
      ok: true,
      mode: 'preview',
      shop: inspection.shop,
      summary: inspection.summary,
      imported: inspection.items[0] || null,
      items: inspection.items,
      promotions: inspection.promotions,
      coupons: inspection.coupons
    }
  }

  // Step 2: Commit selected products, images, content, promotions & coupons
  return await commitShopeeCatalogImport(store, {
    url: body?.url,
    rawPayload: body?.rawPayload || body?.rawText,
    brandSlug: body?.brandSlug,
    categorySlug: body?.categorySlug,
    useAi: body?.useAi !== false,
    selectedSkus: body?.selectedSkus,
    selectedPromotionSlugs: body?.selectedPromotionSlugs,
    importImages: body?.importImages !== false,
    importContent: body?.importContent !== false,
    importPromotions: body?.importPromotions !== false
  })
})
