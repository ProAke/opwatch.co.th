import { ensureCatalogReady } from '../../utils/seed'

const ZONE_LABELS: Record<string, string> = {
  bangkok: 'กรุงเทพมหานคร',
  central: 'ภาคกลาง & ปริมณฑล',
  north: 'ภาคเหนือ (เชียงใหม่)',
  south: 'ภาคใต้ (ภูเก็ต)',
  northeast: 'ภาคตะวันออกเฉียงเหนือ',
  east: 'ภาคตะวันออก'
}

export default defineEventHandler(async () => {
  const store = useStore()
  await ensureCatalogReady(store)
  const items = (await store.find('branches', { orderBy: 'sortOrder', orderDir: 'asc' }))
    .filter((b) => b.active !== false)
    .map((b) => ({
      ...b,
      province: b.province || ZONE_LABELS[String(b.zone || '')] || b.zone || 'กรุงเทพมหานคร',
      district: b.district || 'Official Counter',
      addressTh: b.addressTh || b.address || '',
      hasPickup: b.hasPickup !== false && (!Array.isArray(b.services) || b.services.includes('click_collect'))
    }))
  return { items }
})
