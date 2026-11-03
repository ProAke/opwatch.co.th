import { ensureCatalogReady } from '../../utils/seed'

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || '').trim().toLowerCase()
  const store = useStore()
  await ensureCatalogReady(store)

  const page = await store.findOne('pages', { where: { slug } })
  if (!page || page.status === 'draft') {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' })
  }
  return {
    page: {
      ...page,
      excerptTh: page.excerptTh || page.summary || '',
      published: page.status !== 'draft'
    }
  }
})
