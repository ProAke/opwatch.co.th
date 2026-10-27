export default defineNuxtRouteMiddleware(async (to) => {
  // The installer itself is always reachable.
  if (to.path.startsWith('/install')) return

  const site = useSite()
  if (!site.installed.value) {
    try {
      await site.load()
    } catch {
      /* server not ready — let the page handle it */
    }
  }

  if (!site.installed.value) {
    return navigateTo('/install')
  }
})
