import { inspectShopeeCatalog, commitShopeeCatalogImport } from '../../../utils/shopee'
import { verifyShopeeSyncPassword } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const officer = await requireOfficer(event, 'products_edit')
  const body = await readBody(event)
  const store = useStore()
  const cfg = getConfig()

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
      requireSyncPassword: cfg.site?.requireShopeeSyncPassword !== false,
      shop: inspection.shop,
      summary: inspection.summary,
      bookmarkletScript: inspection.bookmarkletScript,
      imported: inspection.items[0] || null,
      items: inspection.items,
      promotions: inspection.promotions,
      coupons: inspection.coupons
    }
  }

  // Step 2: Verify Sync Password (when enabled in Master Settings) before writing to website DB
  const authorized = await verifyShopeeSyncPassword(body?.syncPassword, Number(officer.id))
  if (!authorized) {
    throw createError({
      statusCode: 403,
      statusMessage: 'รหัสผ่านยืนยันการดึงข้อมูลไม่ถูกต้อง (กรุณากรอกรหัสซิงก์ Shopee หรือรหัสผ่านบัญชีเจ้าหน้าที่ของคุณ)'
    })
  }

  // Commit selected or all pending products, images, content, promotions & coupons
  return await commitShopeeCatalogImport(store, {
    url: body?.url,
    rawPayload: body?.rawPayload || body?.rawText,
    brandSlug: body?.brandSlug,
    categorySlug: body?.categorySlug,
    useAi: body?.useAi !== false,
    onlyPending: Boolean(body?.onlyPending),
    selectedSkus: body?.selectedSkus,
    selectedPromotionSlugs: body?.selectedPromotionSlugs,
    importImages: body?.importImages !== false,
    importContent: body?.importContent !== false,
    importPromotions: body?.importPromotions !== false
  })
})
