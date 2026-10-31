export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const store = useStore()

  const items = await store.find('categories', { orderBy: 'sortOrder', orderDir: 'asc' })

  // Build a parent/child tree for mega-menu and category navigation.
  const tree = items
    .filter((c) => !c.parentId)
    .map((parent) => ({
      ...parent,
      children: items.filter((c) => Number(c.parentId) === Number(parent.id))
    }))

  const filtered = q.parent
    ? items.filter((c) => Number(c.parentId) === Number(q.parent))
    : items

  return { items: filtered, tree }
})
