export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const store = useStore()
  const all = await store.all('customers')
  let items = all
    .map((u) => publicUser(u)!)
    .sort((a, b) => {
      const rank: Record<string, number> = { ceo: 0, admin: 1, staff: 2, member: 3 }
      return (rank[a.role || 'member'] ?? 9) - (rank[b.role || 'member'] ?? 9)
    })
  if (q.role) {
    items = items.filter((u) => String(u.role || 'member') === String(q.role))
  }
  return { items }
})
