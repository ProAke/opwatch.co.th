export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()
  if (!auth.ready.value) await auth.refresh()
  if (!auth.customer.value) {
    return navigateTo({ path: '/account/login', query: { redirect: to.fullPath } })
  }
})
