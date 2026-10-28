export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/admin/login')) return

  const auth = useAuth()
  if (!auth.ready.value) await auth.refresh()
  if (!auth.customer.value) return navigateTo('/admin/login')
  if (!auth.customer.value.isAdmin) return navigateTo('/')
})
