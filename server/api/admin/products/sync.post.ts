import { syncOfficialCatalog } from '../../../utils/seed'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event).catch(() => ({}))
  const store = useStore()
  const result = await syncOfficialCatalog(store, { force: body?.force !== false })
  return {
    ok: true,
    ...result
  }
})
