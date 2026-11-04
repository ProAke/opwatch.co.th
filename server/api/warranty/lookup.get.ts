import { ensureCatalogReady } from '../../utils/seed'

function maskPhone(p: string): string {
  const digits = String(p || '').replace(/\D+/g, '')
  if (digits.length < 7) return p
  return `${digits.slice(0, 3)}-xxx-${digits.slice(-4)}`
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const term = String(q.q || '').trim().toLowerCase()
  if (term.length < 3) {
    return { warranties: [], repairs: [] }
  }

  const store = useStore()
  await ensureCatalogReady(store)

  const cleanDigits = term.replace(/\D+/g, '')
  const [allWarranties, allRepairs] = await Promise.all([
    store.all('warranties'),
    store.all('repairs')
  ])

  const matchRow = (r: any, codeField: string) => {
    const code = String(r[codeField] || '').toLowerCase()
    const serial = String(r.serialNo || '').toLowerCase()
    const phoneDigits = String(r.phone || '').replace(/\D+/g, '')
    if (code === term || code.includes(term)) return true
    if (serial && (serial === term || serial.includes(term))) return true
    if (cleanDigits.length >= 6 && phoneDigits.includes(cleanDigits)) return true
    return false
  }

  const warranties = allWarranties
    .filter((w) => matchRow(w, 'warrantyNo'))
    .map((w) => ({
      id: w.id,
      warrantyNo: w.warrantyNo,
      customerName: w.customerName,
      phoneMasked: maskPhone(w.phone),
      brandSlug: w.brandSlug,
      productSku: w.productSku,
      productName: w.productName,
      serialNo: w.serialNo,
      purchaseDate: w.purchaseDate,
      purchaseChannel: w.purchaseChannel,
      warrantyUntil: w.warrantyUntil,
      status: w.status,
      adminNote: w.adminNote,
      createdAt: w.createdAt
    }))

  const repairs = allRepairs
    .filter((r) => matchRow(r, 'ticketNo'))
    .map((r) => ({
      id: r.id,
      ticketNo: r.ticketNo,
      warrantyNo: r.warrantyNo,
      customerName: r.customerName,
      phoneMasked: maskPhone(r.phone),
      brandSlug: r.brandSlug,
      productSku: r.productSku,
      productName: r.productName,
      serialNo: r.serialNo,
      serviceType: r.serviceType,
      symptom: r.symptom,
      dropoffMethod: r.dropoffMethod,
      estimatedCost: r.estimatedCost,
      trackingReturn: r.trackingReturn,
      status: r.status,
      technicianNote: r.technicianNote,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }))

  return { warranties, repairs }
})
