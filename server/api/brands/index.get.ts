export default defineEventHandler(async () => {
  const store = useStore()
  // `active` is stored as a boolean on JSON and an int on MySQL, so filter in
  // JS rather than through the SQL/JSON `where` clause.
  const items = (await store.find('brands', { orderBy: 'sortOrder', orderDir: 'asc' })).filter(
    (b) => b.active !== false
  )
  return { items }
})
