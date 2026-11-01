export default defineNuxtRouteMiddleware(async (to) => {
  const localePath = useLocalePath()
  if (to.path === '/office/login' || to.path.endsWith('/office/login')) return

  const auth = useAuth()
  if (!auth.ready.value) await auth.refresh()
  if (!auth.customer.value) {
    return navigateTo(localePath('/office/login'))
  }
  if (!auth.customer.value.isAdmin) {
    return navigateTo(localePath('/'))
  }
})
