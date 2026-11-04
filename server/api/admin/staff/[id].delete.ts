export default defineEventHandler(async (event) => {
  const actor = await requireRole(event, ['ceo', 'it_admin'])
  const id = Number(getRouterParam(event, 'id'))
  if (Number(actor.id) === id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่สามารถลบบัญชีที่กำลังใช้งานอยู่ได้' })
  }
  const existing = await useStore().findById('officers', id)
  if (existing?.role === 'ceo' && actor.role !== 'ceo') {
    throw createError({ statusCode: 403, statusMessage: 'เฉพาะ CEO เท่านั้นที่ลบบัญชี CEO ได้' })
  }
  const ok = await useStore().remove('officers', id)
  return { ok }
})
