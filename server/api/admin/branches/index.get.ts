import { ensureCatalogReady } from '../../../utils/seed'

const ZONE_LABELS: Record<string, string> = {
  bangkok: 'กรุงเทพมหานคร',
  central: 'ภาคกลาง & ปริมณฑล',
  north: 'ภาคเหนือ (เชียงใหม่)',
  south: 'ภาคใต้ (ภูเก็ต)',
  northeast: 'ภาคตะวันออกเฉียงเหนือ',
  east: 'ภาคตะวันออก'
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const store = useStore()
  await ensureCatalogReady(store)
  const raw = await store.find('branches', { orderBy: 'sortOrder', orderDir: 'asc' })
  const items = raw.map((b) => ({
    ...b,
    province: b.province || ZONE_LABELS[String(b.zone || '')] || b.zone || 'กรุงเทพมหานคร',
    addressTh: b.addressTh || b.address || '',
    hasPickup: b.hasPickup !== false
  }))
  return { items }
})
