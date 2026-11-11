import { inspectShopeeCatalog, SHOPEE_SHOP_232486539_META } from '../../../utils/shopee'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const store = useStore()
  const cfg = getConfig()

  const inspection = await inspectShopeeCatalog(store, {
    url: SHOPEE_SHOP_232486539_META.shopUrl,
    useAi: false
  })

  return {
    ok: true,
    checkedAt: new Date().toISOString(),
    requireSyncPassword: cfg.site?.requireShopeeSyncPassword !== false,
    hasCustomSyncPassword: Boolean(cfg.admin?.shopeeSyncPasswordHash),
    shop: inspection.shop,
    summary: inspection.summary,
    bookmarkletScript: inspection.bookmarkletScript,
    items: inspection.items,
    promotions: inspection.promotions,
    coupons: inspection.coupons
  }
})
