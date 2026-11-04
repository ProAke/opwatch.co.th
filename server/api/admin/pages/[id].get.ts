export default defineEventHandler(async (event) => {
  await requireOfficer(event, 'pages')
  const id = Number(getRouterParam(event, 'id'))
  const page = await useStore().findById('pages', id)
  if (!page) throw createError({ statusCode: 404, statusMessage: 'Page not found' })
  return { page }
})
