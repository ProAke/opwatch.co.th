export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  const store = useStore()

  const patch: Record<string, any> = {}
  if (typeof body?.name === 'string' && body.name.trim()) patch.name = body.name.trim().slice(0, 160)
  if (typeof body?.phone === 'string') patch.phone = body.phone.trim().slice(0, 40)
  if (typeof body?.address === 'string') patch.address = body.address.trim().slice(0, 255)
  if (typeof body?.city === 'string') patch.city = body.city.trim().slice(0, 100)
  if (typeof body?.postalCode === 'string') patch.postalCode = body.postalCode.trim().slice(0, 20)
  if (typeof body?.country === 'string') patch.country = body.country.trim().slice(0, 60)

  const updated = await store.update('customers', Number(user.id), patch)
  return { customer: publicUser(updated) }
})
