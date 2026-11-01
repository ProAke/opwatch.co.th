export default defineNuxtRouteMiddleware(async (to) => {
  // Redirect legacy /admin or /en/admin paths cleanly to /office
  if (/^(\/[a-z]{2})?\/admin(\/|$)/.test(to.path)) {
    const targetPath = to.path.replace(/^(\/[a-z]{2})?\/admin(\/|$)/, '$1/office$2')
    return navigateTo({ path: targetPath, query: to.query, hash: to.hash }, { redirectCode: 301 })
  }

  // The installer itself is always reachable (in any locale).
  if (to.path === '/install' || to.path.endsWith('/install')) return

  const site = useSite()
  if (!site.installed.value) {
    try {
      await site.load()
    } catch {
      /* server not ready — let the page handle it */
    }
  }

  if (!site.installed.value) {
    const localePath = useLocalePath()
    return navigateTo(localePath('/install'))
  }
})
