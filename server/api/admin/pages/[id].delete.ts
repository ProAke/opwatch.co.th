export default defineEventHandler(async (event) => {
  await requireOfficer(event, 'pages')
  const id = Number(getRouterParam(event, 'id'))
  const store = useStore()
  const existing = await store.findById('pages', id)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Page not found' })
  if (existing.isSystem) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่สามารถลบหน้าหลักของระบบได้ (ซ่อนด้วยสถานะ Draft แทนได้)' })
  }
  const ok = await store.remove('pages', id)
  return { ok }
})
