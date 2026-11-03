import { ENTITIES } from '../../db/types'
import { ensureCatalogReady } from '../../utils/seed'

const TABLE_LABELS: Record<string, string> = {
  products: 'สินค้า (products)',
  brands: 'แบรนด์ (brands)',
  categories: 'หมวดหมู่ (categories)',
  orders: 'คำสั่งซื้อ (orders)',
  order_items: 'รายการในบิล (order_items)',
  customers: 'สมาชิก & พนักงาน (customers)',
  promotions: 'แคมเปญโปรโมชั่น (promotions)',
  coupons: 'โค้ดคูปอง (coupons)',
  branches: 'สาขา & จุดรับสินค้า (branches)',
  pages: 'หน้าเว็บไซต์ CMS (pages)',
  chats: 'แชทลูกค้า (chats)',
  events: 'ปฏิทินกิจกรรม (events)',
  ai_runs: 'ประวัติสั่งงาน AI (ai_runs)',
  reviews: 'รีวิวสินค้า (reviews)',
  campaigns: 'คอลเลกชัน (campaigns)'
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const t0 = Date.now()
  const store = useStore()
  await ensureCatalogReady(store)

  const modules = await Promise.all(
    ENTITIES.map(async (entity) => {
      try {
        const rows = await store.count(entity)
        return { entity, label: TABLE_LABELS[entity] || entity, rows, ok: true }
      } catch {
        return { entity, label: TABLE_LABELS[entity] || entity, rows: 0, ok: false }
      }
    })
  )

  return {
    driver: store.driver,
    latencyMs: Math.max(2, Date.now() - t0),
    modules
  }
})
