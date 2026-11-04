import { syncOfficialCatalog } from '../../../utils/seed'

export default defineEventHandler(async (event) => {
  await requireOfficer(event, 'products_edit')
  const body = await readBody(event).catch(() => ({}))
  const store = useStore()
  const result = await syncOfficialCatalog(store, { force: body?.force !== false })
  return {
    ok: true,
    ...result
  }
})
