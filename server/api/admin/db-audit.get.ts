import { ENTITIES } from '../../db/types'
import { ensureCatalogReady } from '../../utils/seed'

const TABLE_LABELS: Record<string, string> = {
  products: 'สินค้าและสต็อก 5 ช่องทาง (products)',
  brands: 'แบรนด์หลัก (brands)',
  categories: 'หมวดหมู่ (categories)',
  officers: 'เจ้าหน้าที่และตัวแทนจำหน่าย (officers)',
  dealer_stocks: 'คลังสินค้าตัวแทนเอง (dealer_stocks)',
  warranties: 'ลงทะเบียนรับประกันออนไลน์ (warranties)',
  repairs: 'ระบบแจ้งซ่อมออนไลน์ (repairs)',
  customers: 'สมาชิกและลูกค้าหน้าเว็บ (customers)',
  orders: 'คำสั่งซื้อและการรับหน้าร้าน (orders)',
  order_items: 'รายการในบิล (order_items)',
  promotions: 'แคมเปญโปรโมชั่น (promotions)',
  coupons: 'โค้ดคูปอง (coupons)',
  branches: 'สาขา & เคาน์เตอร์ (branches)',
  pages: 'โครงสร้างหน้าเว็บ Tree CMS (pages)',
  chats: 'แชทลูกค้า (chats)',
  events: 'ปฏิทินกิจกรรม (events)',
  ai_runs: 'ประวัติสั่งงาน AI (ai_runs)',
  reviews: 'รีวิวสินค้า (reviews)',
  campaigns: 'คอลเลกชันหน้าแรก (campaigns)'
}

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ceo', 'it_admin'])
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
