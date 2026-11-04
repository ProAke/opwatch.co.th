import { ensureCatalogReady } from '../../../utils/seed'

export default defineEventHandler(async (event) => {
  const officer = await requirePermission(event, 'warranty')
  const q = getQuery(event)
  const store = useStore()
  await ensureCatalogReady(store)

  const search = String(q.q || '').trim().toLowerCase()
  const statusFilter = String(q.status || '').trim()

  let [warranties, repairs] = await Promise.all([
    store.find('warranties', { orderBy: 'id', orderDir: 'desc' }),
    store.find('repairs', { orderBy: 'id', orderDir: 'desc' })
  ])

  // If dealer role, show records submitted by their dealer code OR matching an explicit search query (serial/phone lookup at counter)
  if (officer.role === 'dealer' && !search) {
    const dCode = String(officer.dealerCode || officer.code || '')
    warranties = warranties.filter(
      (w) => String(w.registeredByDealer || '') === dCode || String(w.dealerOrBranch || '').includes(dCode)
    )
    repairs = repairs.filter(
      (r) => String(r.submittedByDealer || '') === dCode || (officer.branchSlug && r.branchSlug === officer.branchSlug)
    )
  }

  if (search) {
    const matchText = (row: any) =>
      JSON.stringify([
        row.warrantyNo, row.ticketNo, row.customerName, row.phone,
        row.productSku, row.productName, row.serialNo, row.dealerOrBranch
      ])
        .toLowerCase()
        .includes(search)
    warranties = warranties.filter(matchText)
    repairs = repairs.filter(matchText)
  }

  if (statusFilter) {
    warranties = warranties.filter((w) => w.status === statusFilter)
    repairs = repairs.filter((r) => r.status === statusFilter)
  }

  return {
    viewerRole: officer.role,
    dealerCode: officer.dealerCode || null,
    warranties,
    repairs,
    stats: {
      totalWarranties: warranties.length,
      pendingWarranties: warranties.filter((w) => w.status === 'pending').length,
      totalRepairs: repairs.length,
      openRepairs: repairs.filter((r) => !['completed', 'returned', 'cancelled'].includes(String(r.status))).length
    }
  }
})
