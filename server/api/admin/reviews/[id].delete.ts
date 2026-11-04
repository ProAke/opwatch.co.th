import { requireOfficer } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireOfficer(event, 'pages')
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid review ID' })

  const store = useStore()
  await store.remove('reviews', id)
  return { ok: true }
})
