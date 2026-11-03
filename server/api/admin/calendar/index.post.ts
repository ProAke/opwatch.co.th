export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const store = useStore()

  const title = String(body?.title || '').trim()
  const date = String(body?.date || '').slice(0, 10)
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุชื่อกิจกรรมและวันที่ให้ครบถ้วน' })
  }

  const now = new Date().toISOString()
  const created = await store.create('events', {
    title,
    cat: String(body?.cat || 'campaign'),
    date,
    endDate: body?.endDate ? String(body.endDate).slice(0, 10) : date,
    startTime: String(body?.startTime || '09:00'),
    endTime: String(body?.endTime || '10:00'),
    allday: Boolean(body?.allday),
    location: String(body?.location || '').trim(),
    notes: String(body?.notes || '').trim(),
    refCode: String(body?.refCode || '').trim(),
    assignee: String(body?.assignee || '').trim(),
    status: String(body?.status || 'active'),
    createdAt: now,
    updatedAt: now
  })

  return { ok: true, item: created }
})
