export type OfficeRole = 'ceo' | 'it_admin' | 'marketing_sales' | 'warehouse' | 'dealer'

export interface Officer {
  id: number
  code?: string | null
  name: string
  email: string
  phone?: string | null
  role: OfficeRole
  roleLabelTh?: string
  roleLabelEn?: string
  roleBadgeColor?: string
  defaultHome?: string
  department?: string | null
  position?: string | null
  dealerCode?: string | null
  dealerName?: string | null
  dealerTier?: string | null
  discountPct?: number
  branchSlug?: string | null
  permissions?: string[]
  effectivePermissions?: string[]
  status?: string | null
  lastLoginAt?: string | null
}

export const useOfficeAuth = () => {
  const officer = useState<Officer | null>('opwatch-officer', () => null)
  const rolesMeta = useState<Record<string, any>>('opwatch-office-roles', () => ({}))
  const customerBlocked = useState<boolean>('opwatch-customer-blocked', () => false)
  const ready = useState<boolean>('opwatch-office-ready', () => false)

  async function refresh(): Promise<Officer | null> {
    try {
      const reqFetch = useRequestFetch()
      const res = await reqFetch<{
        officer: Officer | null
        roles?: Record<string, any>
        customerBlockedFromOffice?: boolean
      }>('/api/office/auth/me')
      officer.value = res.officer ?? null
      if (res.roles) rolesMeta.value = res.roles
      customerBlocked.value = Boolean(res.customerBlockedFromOffice)
    } catch {
      officer.value = null
    }
    ready.value = true
    return officer.value
  }

  if (!ready.value) refresh()

  async function login(email: string, password: string) {
    const res = await $fetch<{ officer: Officer; roles?: Record<string, any> }>('/api/office/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    officer.value = res.officer
    if (res.roles) rolesMeta.value = res.roles
    customerBlocked.value = false
    ready.value = true
    return res.officer
  }

  async function logout() {
    await $fetch('/api/office/auth/logout', { method: 'POST' })
    officer.value = null
  }

  function hasPermission(perm: string | string[]): boolean {
    const o = officer.value
    if (!o) return false
    if (o.role === 'ceo' || o.role === 'it_admin') return true
    const eff = new Set(o.effectivePermissions || o.permissions || [])
    if (eff.has('*')) return true
    const list = Array.isArray(perm) ? perm : [perm]
    return list.some((p) => eff.has(p))
  }

  function isRole(...allowed: OfficeRole[]): boolean {
    if (!officer.value) return false
    return allowed.includes(officer.value.role)
  }

  return {
    officer: computed(() => officer.value),
    role: computed(() => officer.value?.role || null),
    rolesMeta: computed(() => rolesMeta.value),
    customerBlockedFromOffice: computed(() => customerBlocked.value),
    ready: computed(() => ready.value),
    isAuthenticated: computed(() => Boolean(officer.value)),
    hasPermission,
    isRole,
    refresh,
    login,
    logout
  }
}
