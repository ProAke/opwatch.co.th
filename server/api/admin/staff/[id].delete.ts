export default defineEventHandler(async (event) => {
  const actor = await requireRole(event, ['ceo', 'admin'])
  const id = Number(getRouterParam(event, 'id'))
  if (Number(actor.id) === id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่สามารถลบบัญชีที่กำลังใช้งานอยู่ได้' })
  }
  const ok = await useStore().remove('customers', id)
  return { ok }
})
