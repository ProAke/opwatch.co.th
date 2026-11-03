export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid event ID' })

  const body = await readBody(event)
  const store = useStore()
  const existing = await store.findById('events', id)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'ไม่พบกิจกรรมนี้ในระบบ' })

  const patch: Record<string, any> = { updatedAt: new Date().toISOString() }
  if (body?.title !== undefined) patch.title = String(body.title).trim()
  if (body?.cat !== undefined) patch.cat = String(body.cat)
  if (body?.date !== undefined) patch.date = String(body.date).slice(0, 10)
  if (body?.endDate !== undefined) patch.endDate = String(body.endDate).slice(0, 10)
  if (body?.startTime !== undefined) patch.startTime = String(body.startTime)
  if (body?.endTime !== undefined) patch.endTime = String(body.endTime)
  if (body?.allday !== undefined) patch.allday = Boolean(body.allday)
  if (body?.location !== undefined) patch.location = String(body.location).trim()
  if (body?.notes !== undefined) patch.notes = String(body.notes).trim()
  if (body?.refCode !== undefined) patch.refCode = String(body.refCode).trim()
  if (body?.assignee !== undefined) patch.assignee = String(body.assignee).trim()
  if (body?.status !== undefined) patch.status = String(body.status)

  const updated = await store.update('events', id, patch)
  return { ok: true, item: updated }
})
