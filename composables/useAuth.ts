export interface Customer {
  id: number
  name: string
  email: string
  phone?: string | null
  address?: string | null
  city?: string | null
  postalCode?: string | null
  country?: string | null
  isAdmin: boolean
  points: number
  totalSpent: number
  createdAt?: string
}

export const useAuth = () => {
  const customer = useState<Customer | null>('opwatch-customer', () => null)
  const ready = useState<boolean>('opwatch-auth-ready', () => false)

  async function refresh(): Promise<Customer | null> {
    try {
      // useRequestFetch keeps the call bound to the incoming request on the
      // server, so the session cookie is forwarded during SSR too.
      const reqFetch = useRequestFetch()
      const res = await reqFetch<{ customer: Customer | null }>('/api/auth/me')
      customer.value = res.customer ?? null
    } catch {
      customer.value = null
    }
    ready.value = true
    return customer.value
  }

  if (!ready.value) refresh()

  async function login(email: string, password: string) {
    const res = await $fetch<{ customer: Customer }>('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    customer.value = res.customer
    ready.value = true
    return res.customer
  }

  async function register(payload: { name: string; email: string; password: string; phone?: string }) {
    const res = await $fetch<{ customer: Customer }>('/api/auth/register', {
      method: 'POST',
      body: payload
    })
    customer.value = res.customer
    ready.value = true
    return res.customer
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    customer.value = null
  }

  return {
    customer: computed(() => customer.value),
    ready: computed(() => ready.value),
    isAdmin: computed(() => !!customer.value?.isAdmin),
    isAuthenticated: computed(() => !!customer.value),
    refresh,
    login,
    register,
    logout
  }
}
