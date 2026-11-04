const ROUTE_PERMISSIONS: Array<{ prefix: string; perms: string[] }> = [
  { prefix: '/office/staff', perms: ['staff_manage'] }, // ceo & it_admin have '*'
  { prefix: '/office/settings', perms: ['settings_manage'] }, // ceo & it_admin have '*'
  { prefix: '/office/customers', perms: ['customers'] },
  { prefix: '/office/pages', perms: ['pages'] },
  { prefix: '/office/warehouse', perms: ['warehouse', 'warehouse_5ch', 'warehouse_dealer', 'dealer_portal'] },
  { prefix: '/office/warranty', perms: ['warranty'] },
  { prefix: '/office/promotions', perms: ['promotions', 'promotions_view'] },
  { prefix: '/office/products/new', perms: ['products_edit'] },
  { prefix: '/office/products', perms: ['products_view', 'products_retail', 'products_stock', 'products_dealer'] },
  { prefix: '/office/orders', perms: ['orders', 'orders_fulfill', 'orders_pickup'] },
  { prefix: '/office/brands', perms: ['brands'] },
  { prefix: '/office/categories', perms: ['categories'] },
  { prefix: '/office/branches', perms: ['branches'] },
  { prefix: '/office/reports', perms: ['reports'] },
  { prefix: '/office/ai', perms: ['ai'] },
  { prefix: '/office/calendar', perms: ['calendar'] }
]

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/office/login' || to.path.endsWith('/office/login')) return

  const officeAuth = useOfficeAuth()
  if (!officeAuth.ready.value) {
    await officeAuth.refresh()
  }

  const current = officeAuth.officer.value
  if (!current) {
    const query = officeAuth.customerBlockedFromOffice.value ? { blocked: 'member' } : undefined
    return navigateTo({ path: '/office/login', query })
  }

  // Exact `/office` root check: dealers land on their Dealer Portal `/office/warehouse`
  if (to.path === '/office' || to.path === '/office/') {
    if (!officeAuth.hasPermission('dashboard')) {
      return navigateTo(current.defaultHome || '/office/warehouse')
    }
    return
  }

  // Check prefix permissions
  for (const rule of ROUTE_PERMISSIONS) {
    if (to.path === rule.prefix || to.path.startsWith(`${rule.prefix}/`)) {
      if (!officeAuth.hasPermission(rule.perms)) {
        return navigateTo(current.defaultHome || '/office')
      }
      break
    }
  }
})
