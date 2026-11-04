const CHANNELS = ['stockWeb', 'stockShopee', 'stockLazada', 'stockTiktok', 'stockDealer'] as const
type ChannelKey = (typeof CHANNELS)[number]

export default defineEventHandler(async (event) => {
  await requirePermission(event, ['warehouse_5ch', 'products_stock'])
  const body = await readBody(event)
  const store = useStore()

  // Mode 1: Transfer between two channels (`action === 'transfer'`)
  if (body?.action === 'transfer') {
    const productId = Number(body.productId)
    const fromCh = String(body.fromChannel) as ChannelKey
    const toCh = String(body.toChannel) as ChannelKey
    const qty = Math.max(1, Math.floor(Number(body.qty || 0)))

    if (!CHANNELS.includes(fromCh) || !CHANNELS.includes(toCh) || fromCh === toCh) {
      throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกช่องทางต้นทางและปลายทางให้ถูกต้อง' })
    }

    const existing = await store.findById('products', productId)
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'ไม่พบสินค้า' })

    const currentFrom = Number(existing[fromCh] ?? 0)
    if (currentFrom < qty) {
      throw createError({ statusCode: 400, statusMessage: `สต็อกช่องทางต้นทางมีไม่เพียงพอ (คงเหลือ ${currentFrom} เรือน)` })
    }

    const patch: Record<string, any> = {
      [fromCh]: currentFrom - qty,
      [toCh]: Number(existing[toCh] ?? 0) + qty,
      updatedAt: new Date().toISOString()
    }
    const updated = await store.update('products', productId, patch)
    return { ok: true, product: updated }
  }

  // Mode 2: Direct update of 5-channel quantities for single or batch products
  const updates = Array.isArray(body?.items) ? body.items : [body]
  const results: any[] = []

  for (const u of updates) {
    const productId = Number(u?.productId || u?.id)
    if (!productId) continue
    const existing = await store.findById('products', productId)
    if (!existing) continue

    const sw = Math.max(0, Math.floor(Number(u.stockWeb ?? existing.stockWeb ?? 0)))
    const ss = Math.max(0, Math.floor(Number(u.stockShopee ?? existing.stockShopee ?? 0)))
    const sl = Math.max(0, Math.floor(Number(u.stockLazada ?? existing.stockLazada ?? 0)))
    const st = Math.max(0, Math.floor(Number(u.stockTiktok ?? existing.stockTiktok ?? 0)))
    const sd = Math.max(0, Math.floor(Number(u.stockDealer ?? existing.stockDealer ?? 0)))
    const total = sw + ss + sl + st + sd

    const patch: Record<string, any> = {
      stockWeb: sw,
      stockShopee: ss,
      stockLazada: sl,
      stockTiktok: st,
      stockDealer: sd,
      stock: total,
      updatedAt: new Date().toISOString()
    }
    const saved = await store.update('products', productId, patch)
    results.push(saved)
  }

  return { ok: true, updatedCount: results.length, items: results }
})
