import { ensureCatalogReady } from '../../utils/seed'

function addTwoYears(isoDate: string): string {
  const m = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) {
    const d = new Date()
    d.setFullYear(d.getFullYear() + 2)
    return d.toISOString().slice(0, 10)
  }
  return `${Number(m[1]) + 2}-${m[2]}-${m[3]}`
}

export default defineEventHandler(async (event) => {
  const store = useStore()
  await ensureCatalogReady(store)

  const body = await readBody(event)
  const customerName = String(body?.customerName || '').trim()
  const phone = String(body?.phone || '').trim()
  const productSku = String(body?.productSku || '').trim()
  const serialNo = String(body?.serialNo || '').trim()
  const purchaseDate = String(body?.purchaseDate || new Date().toISOString().slice(0, 10)).trim()

  if (!customerName || !phone || !productSku || !serialNo) {
    throw createError({
      statusCode: 400,
      statusMessage: 'กรุณากรอกชื่อ-นามสกุล เบอร์โทรศัพท์ รหัสรุ่น (SKU) และหมายเลขตัวเรือน (Serial No.) ให้ครบถ้วน'
    })
  }

  // Check if an officer/dealer is currently logged in and submitting on behalf of a customer
  const officer = await currentOfficer(event)
  const registeredByDealer = officer?.role === 'dealer'
    ? String(officer.dealerCode || officer.code || '')
    : String(body?.registeredByDealer || '').trim() || null

  // Match product name if SKU exists in catalog
  const allProducts = await store.all('products')
  const matchedProd = allProducts.find(
    (p) => String(p.sku || '').toLowerCase() === productSku.toLowerCase()
  )

  const warrantyNo = orderNo('WRT')
  const warrantyUntil = addTwoYears(purchaseDate)

  const created = await store.create('warranties', {
    warrantyNo,
    customerName,
    phone,
    email: String(body?.email || '').trim() || null,
    lineId: String(body?.lineId || '').trim() || null,
    brandSlug: String(body?.brandSlug || matchedProd?.brand || 'olympianus').trim(),
    productSku: matchedProd?.sku || productSku,
    productName: String(body?.productName || matchedProd?.nameTh || matchedProd?.name || productSku).trim(),
    serialNo,
    purchaseDate,
    purchaseChannel: String(body?.purchaseChannel || 'website').trim(),
    dealerOrBranch: String(body?.dealerOrBranch || (officer?.dealerName || '')).trim() || null,
    receiptImage: String(body?.receiptImage || '').trim() || null,
    watchImage: String(body?.watchImage || '').trim() || null,
    warrantyUntil,
    registeredByDealer,
    status: officer ? 'verified' : 'pending',
    adminNote: officer
      ? `ลงทะเบียนและยืนยันโดย ${officer.roleLabelTh || officer.name}`
      : 'รับข้อมูลลงทะเบียนออนไลน์เรียบร้อย รอเจ้าหน้าที่ตรวจสอบใบเสร็จ',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })

  return { ok: true, item: created }
})
