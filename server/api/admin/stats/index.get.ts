import { ensureCatalogReady } from '../../../utils/seed'

export default defineEventHandler(async (event) => {
  const officer = await requireAdmin(event)
  const store = useStore()
  await ensureCatalogReady(store)

  const [orders, products, customers, officers, warranties, repairs, orderItems, brands, categories, promotions, coupons, chats, pages, events, aiRuns] = await Promise.all([
    store.all('orders'),
    store.all('products'),
    store.all('customers'),
    store.all('officers').catch(() => []),
    store.all('warranties').catch(() => []),
    store.all('repairs').catch(() => []),
    store.all('order_items'),
    store.all('brands'),
    store.all('categories'),
    store.all('promotions').catch(() => []),
    store.all('coupons').catch(() => []),
    store.all('chats').catch(() => []),
    store.all('pages').catch(() => []),
    store.all('events').catch(() => []),
    store.all('ai_runs').catch(() => [])
  ])

  const validOrders = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
  const revenue = validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
  const ymPrefix = new Date().toISOString().slice(0, 7)
  const monthRevenue = validOrders
    .filter((o) => String(o.createdAt || '').startsWith(ymPrefix))
    .reduce((sum, o) => sum + Number(o.total || 0), 0)

  const ordersWithItems = await Promise.all(
    orders
      .slice()
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, 8)
      .map(async (o) => ({
        ...o,
        customer: o.customer || { name: o.customerName, email: o.customerEmail, phone: o.phone },
        items: await store.find('order_items', { where: { orderId: Number(o.id) } })
      }))
  )

  const prodById = new Map(products.map((p) => [Number(p.id), p]))
  const brandById = new Map(brands.map((b) => [Number(b.id), b]))
  const catById = new Map(categories.map((c) => [Number(c.id), c]))

  const sales: Record<number, { name: string; sku: string; quantity: number; revenue: number }> = {}
  const brandSales: Record<string, { slug: string; name: string; revenue: number; quantity: number; count: number; catalogCount: number; stockValue: number; color: string }> = {}
  const catSales: Record<string, { slug: string; name: string; revenue: number; quantity: number; count: number; catalogCount: number; stockValue: number }> = {}

  for (const b of brands) {
    brandSales[String(b.slug)] = {
      slug: String(b.slug),
      name: String(b.name),
      revenue: 0,
      quantity: 0,
      count: 0,
      catalogCount: 0,
      stockValue: 0,
      color: b.slug === 'ogival' ? '#f472b6' : b.slug === 'olympia-star' ? '#a78bfa' : '#22d3ee'
    }
  }
  for (const c of categories) {
    catSales[String(c.slug)] = {
      slug: String(c.slug),
      name: String(c.nameTh || c.name),
      revenue: 0,
      quantity: 0,
      count: 0,
      catalogCount: 0,
      stockValue: 0
    }
  }

  for (const p of products) {
    const bObj = p.brandId ? brandById.get(Number(p.brandId)) : null
    const bSlug = String(bObj?.slug || p.brand || 'olympianus')
    const sVal = Number(p.price || 0) * Math.max(1, Number(p.stock || 1))
    if (brandSales[bSlug]) {
      brandSales[bSlug].catalogCount++
      brandSales[bSlug].count++
      brandSales[bSlug].stockValue += sVal
    }
    const cObj = p.categoryId ? catById.get(Number(p.categoryId)) : null
    if (cObj && catSales[String(cObj.slug)]) {
      catSales[String(cObj.slug)].catalogCount++
      catSales[String(cObj.slug)].count++
      catSales[String(cObj.slug)].stockValue += sVal
    }
  }

  for (const it of orderItems) {
    const pid = Number(it.productId)
    const lineRev = Number(it.price || 0) * Number(it.quantity || 1)
    const p = prodById.get(pid)
    if (!sales[pid]) {
      sales[pid] = { name: it.name || p?.name || `#${pid}`, sku: it.sku || p?.sku || '', quantity: 0, revenue: 0 }
    }
    sales[pid].quantity += Number(it.quantity || 1)
    sales[pid].revenue += lineRev

    const bObj = p?.brandId ? brandById.get(Number(p.brandId)) : null
    const bSlug = String(bObj?.slug || p?.brand || 'olympianus')
    if (brandSales[bSlug]) {
      brandSales[bSlug].revenue += lineRev
      brandSales[bSlug].quantity += Number(it.quantity || 1)
    }

    const cObj = p?.categoryId ? catById.get(Number(p.categoryId)) : null
    if (cObj && catSales[String(cObj.slug)]) {
      catSales[String(cObj.slug)].revenue += lineRev
      catSales[String(cObj.slug)].quantity += Number(it.quantity || 1)
    }
  }

  const topProducts = Object.entries(sales)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 6)
    .map(([id, v]) => ({ id: Number(id), ...v }))

  const lowStock = products
    .filter((p) => Number(p.stock) <= 10)
    .sort((a, b) => Number(a.stock) - Number(b.stock))
    .slice(0, 8)

  const dailySeries: { date: string; label: string; orders: number; revenue: number }[] = []
  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400_000)
    const iso = d.toISOString().slice(0, 10)
    const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
    const dayOrders = validOrders.filter((o) => String(o.createdAt || '').slice(0, 10) === iso)
    dailySeries.push({
      date: iso,
      label,
      orders: dayOrders.length,
      revenue: dayOrders.reduce((s, o) => s + Number(o.total || 0), 0)
    })
  }

  const orderStatusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  const funnel = [
    { stage: 'pending', label: 'รอยืนยันคำสั่งซื้อ (Pending)', count: orderStatusCounts.pending || 0 },
    { stage: 'paid', label: 'ยืนยันแล้ว / ชำระแล้ว (Confirmed)', count: orderStatusCounts.paid || 0 },
    { stage: 'shipped', label: 'ส่งมอบขนส่งแล้ว (Shipped)', count: orderStatusCounts.shipped || 0 },
    { stage: 'completed', label: 'จัดส่งสำเร็จ (Completed)', count: orderStatusCounts.completed || 0 },
    { stage: 'cancelled', label: 'ยกเลิกรายการ (Cancelled)', count: orderStatusCounts.cancelled || 0 }
  ]

  const payMap: Record<string, { method: string; count: number; revenue: number }> = {}
  for (const o of validOrders) {
    const m = String(o.paymentMethod || 'offline')
    if (!payMap[m]) payMap[m] = { method: m, count: 0, revenue: 0 }
    payMap[m].count++
    payMap[m].revenue += Number(o.total || 0)
  }

  const staffCount = officers.length
  const memberCount = customers.length
  const openChats = chats.filter((c: any) => c.status !== 'closed').length
  const openRepairs = repairs.filter((r: any) => !['completed', 'returned', 'cancelled'].includes(String(r.status))).length
  const pendingWarranties = warranties.filter((w: any) => w.status === 'pending').length
  const avgOrder = validOrders.length ? Math.round((revenue / validOrders.length) * 100) / 100 : 0

  if (officer.role === 'dealer') {
    return {
      driver: store.driver,
      totals: {
        pendingOrders: 0,
        openChats: 0,
        events: 0,
        openRepairs,
        pendingWarranties,
        warranties: warranties.length,
        repairs: repairs.length,
        promotions: promotions.length,
        products: products.length
      },
      recentOrders: [],
      calendarEvents: []
    }
  }

  return {
    driver: store.driver,
    totals: {
      revenue: Math.round(revenue * 100) / 100,
      monthRevenue: Math.round(monthRevenue * 100) / 100,
      orders: orders.length,
      validOrders: validOrders.length,
      pendingOrders: orderStatusCounts.pending || 0,
      shippedOrders: orderStatusCounts.shipped || 0,
      customers: memberCount,
      members: memberCount,
      staff: staffCount,
      staffCount,
      warranties: warranties.length,
      pendingWarranties,
      repairs: repairs.length,
      openRepairs,
      products: products.length,
      activeProducts: products.filter((p) => p.status !== 'draft').length,
      promotions: promotions.length,
      coupons: coupons.length,
      pages: pages.length,
      events: events.length,
      aiRuns: aiRuns.length,
      openChats,
      avgOrder,
      avgOrderValue: avgOrder
    },
    dailySeries,
    brandBreakdown: Object.values(brandSales),
    categoryBreakdown: Object.values(catSales).filter((c) => c.count > 0),
    paymentBreakdown: Object.values(payMap),
    funnel,
    recentOrders: ordersWithItems,
    topProducts,
    lowStock,
    orderStatusCounts,
    calendarEvents: events,
    recentAiRuns: aiRuns.slice().sort((a: any, b: any) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))).slice(0, 8)
  }
})
