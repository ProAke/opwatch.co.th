export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const patch: Record<string, any> = {}
  if (body?.reply !== undefined) patch.reply = String(body.reply)
  if (body?.status !== undefined) patch.status = String(body.status)
  const item = await useStore().update('chats', id, patch)
  return { item }
})
