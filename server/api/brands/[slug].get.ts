export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || '')
  const store = useStore()

  const brand = (await store.find('brands', { where: { slug } })).find((b) => b.active !== false)
  if (!brand) throw createError({ statusCode: 404, statusMessage: 'brand.notFound' })

  const products = await store.find('products', {
    where: { brandId: Number(brand.id) },
    orderBy: 'sortOrder',
    orderDir: 'asc'
  })

  const root = (await store.find('categories', { where: { parentId: null } }))[0] || null
  const subcategories = root
    ? await store.find('categories', { where: { parentId: Number(root.id) }, orderBy: 'sortOrder', orderDir: 'asc' })
    : []

  const campaigns = (await store.find('campaigns', { orderBy: 'sortOrder', orderDir: 'asc' }))
    .filter((c) => c.active !== false && c.type === 'brand-day' && Number(c.brandId) === Number(brand.id))

  return { brand, products, subcategories, campaigns }
})
