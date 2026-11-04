import { ensureCatalogReady } from '../../utils/seed'

export default defineEventHandler(async (event) => {
  const store = useStore()
  await ensureCatalogReady(store)

  const body = await readBody(event)
  const customerName = String(body?.customerName || '').trim()
  const phone = String(body?.phone || '').trim()
  const productSku = String(body?.productSku || '').trim()
  const symptom = String(body?.symptom || '').trim()

  if (!customerName || !phone || !productSku || !symptom) {
    throw createError({
      statusCode: 400,
      statusMessage: 'กรุณากรอกชื่อ-นามสกุล เบอร์โทรศัพท์ รหัสรุ่น และอาการที่ต้องการส่งซ่อมให้ครบถ้วน'
    })
  }

  const officer = await currentOfficer(event)
  const submittedByDealer = officer?.role === 'dealer'
    ? String(officer.dealerCode || officer.code || '')
    : String(body?.submittedByDealer || '').trim() || null

  const allProducts = await store.all('products')
  const matchedProd = allProducts.find(
    (p) => String(p.sku || '').toLowerCase() === productSku.toLowerCase()
  )

  const ticketNo = orderNo('REP')
  const images = Array.isArray(body?.images)
    ? body.images.map((x: any) => String(x)).filter(Boolean)
    : []

  const created = await store.create('repairs', {
    ticketNo,
    warrantyNo: String(body?.warrantyNo || '').trim() || null,
    customerName,
    phone,
    email: String(body?.email || '').trim() || null,
    lineId: String(body?.lineId || '').trim() || null,
    brandSlug: String(body?.brandSlug || matchedProd?.brand || 'olympianus').trim(),
    productSku: matchedProd?.sku || productSku,
    productName: String(body?.productName || matchedProd?.nameTh || matchedProd?.name || productSku).trim(),
    serialNo: String(body?.serialNo || '').trim() || null,
    serviceType: String(body?.serviceType || 'warranty_claim').trim(),
    symptom,
    images,
    dropoffMethod: String(body?.dropoffMethod || 'head_office').trim(),
    branchSlug: String(body?.branchSlug || officer?.branchSlug || '').trim() || null,
    estimatedCost: 0,
    trackingReturn: null,
    status: 'received',
    technicianNote: 'รับเรื่องแจ้งซ่อมเข้าสู่ระบบศูนย์บริการอินเตอร์ไทมส์เรียบร้อยแล้ว',
    submittedByDealer,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })

  return { ok: true, item: created }
})
