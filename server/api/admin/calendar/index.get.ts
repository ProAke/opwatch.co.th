import { ensureCatalogReady } from '../../../utils/seed'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const store = useStore()
  await ensureCatalogReady(store)

  const [rawEvents, promotions, coupons, orders] = await Promise.all([
    store.all('events').catch(() => []),
    store.all('promotions').catch(() => []),
    store.all('coupons').catch(() => []),
    store.all('orders').catch(() => [])
  ])

  const customEvents = rawEvents.map((ev: any) => ({
    id: Number(ev.id),
    uid: `event:${ev.id}`,
    kind: 'event',
    editable: true,
    title: String(ev.title || ''),
    cat: String(ev.cat || 'campaign'),
    date: String(ev.date || '').slice(0, 10),
    endDate: ev.endDate ? String(ev.endDate).slice(0, 10) : '',
    startTime: String(ev.startTime || '09:00'),
    endTime: String(ev.endTime || '10:00'),
    allday: Boolean(ev.allday),
    location: String(ev.location || ''),
    notes: String(ev.notes || ''),
    refCode: String(ev.refCode || ''),
    assignee: String(ev.assignee || ''),
    status: String(ev.status || 'active')
  }))

  // Auto-surface live Promotions, Coupon Expirations, and Pending/Recent Orders on the Calendar!
  const derived: any[] = []
  for (const pr of promotions) {
    if (pr.startsAt) {
      derived.push({
        id: Number(pr.id),
        uid: `promo-start:${pr.id}`,
        kind: 'promotion',
        editable: false,
        title: `🚀 เริ่มโปรโมชั่น: ${pr.titleTh || pr.title}`,
        cat: 'campaign',
        date: String(pr.startsAt).slice(0, 10),
        endDate: '',
        startTime: '00:00',
        endTime: '23:59',
        allday: true,
        location: `ช่องทาง ${(pr.channel || 'website').toUpperCase()}`,
        notes: pr.subtitleTh || pr.subtitle || '',
        refCode: pr.couponCode || 'PROMO',
        assignee: 'ระบบโปรโมชั่นอัตโนมัติ',
        linkUrl: '/office/promotions'
      })
    }
    if (pr.endsAt) {
      derived.push({
        id: Number(pr.id),
        uid: `promo-end:${pr.id}`,
        kind: 'promotion',
        editable: false,
        title: `⏰ สิ้นสุดโปรโมชั่น: ${pr.titleTh || pr.title}`,
        cat: 'deadline',
        date: String(pr.endsAt).slice(0, 10),
        endDate: '',
        startTime: '23:59',
        endTime: '23:59',
        allday: true,
        location: `ช่องทาง ${(pr.channel || 'website').toUpperCase()}`,
        notes: pr.subtitleTh || pr.subtitle || '',
        refCode: pr.couponCode || 'PROMO',
        assignee: 'ระบบโปรโมชั่นอัตโนมัติ',
        linkUrl: '/office/promotions'
      })
    }
  }

  for (const cp of coupons) {
    if (cp.expiresAt && cp.active !== false) {
      derived.push({
        id: Number(cp.id),
        uid: `coupon:${cp.id}`,
        kind: 'coupon',
        editable: false,
        title: `🎟 หมดอายุคูปอง ${cp.code} (${cp.titleTh || cp.title})`,
        cat: 'deadline',
        date: String(cp.expiresAt).slice(0, 10),
        endDate: '',
        startTime: '23:59',
        endTime: '23:59',
        allday: true,
        location: 'ระบบคูปอง OPWatch',
        notes: cp.description || '',
        refCode: cp.code,
        assignee: 'ระบบคูปอง',
        linkUrl: '/office/promotions'
      })
    }
  }

  for (const ord of orders.slice(-20)) {
    if (ord.createdAt) {
      derived.push({
        id: Number(ord.id),
        uid: `order:${ord.id}`,
        kind: 'order',
        editable: false,
        title: `📦 คำสั่งซื้อ ${ord.orderNo || '#' + ord.id} · ${ord.customerName || 'ลูกค้า'}`,
        cat: 'order',
        date: String(ord.createdAt).slice(0, 10),
        endDate: '',
        startTime: String(ord.createdAt).slice(11, 16) || '10:00',
        endTime: '',
        allday: false,
        location: ord.pickupBranch ? `รับที่สาขา ${ord.pickupBranch}` : 'จัดส่งถึงบ้าน',
        notes: `ยอดสุทธิ ฿${Number(ord.total || 0).toLocaleString()} · สถานะ: ${ord.status}`,
        refCode: ord.orderNo || `#${ord.id}`,
        assignee: 'ฝ่ายจัดส่ง',
        linkUrl: `/office/orders/${ord.id}`
      })
    }
  }

  return {
    items: [...customEvents, ...derived].filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date))
  }
})
