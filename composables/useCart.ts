export interface CartLine {
  productId: number
  slug: string
  name: string
  nameEn: string
  nameTh: string
  price: number
  image: string
  quantity: number
  maxStock: number
  sku?: string
}

const STORAGE_KEY = 'opwatch_cart'

export const useCart = () => {
  const items = useState<CartLine[]>('opwatch-cart', () => [])
  const drawerOpen = useState<boolean>('opwatch-cart-open', () => false)
  const toast = useToast()

  // Restore from localStorage on the client after hydration.
  onMounted(() => {
    if (items.value.length) return
    if (typeof localStorage === 'undefined') return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) items.value = parsed
      } catch { /* ignore */ }
    }
  })

  // Persist on every change.
  watch(
    items,
    (value) => {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    },
    { deep: true }
  )

  function persist() {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
  }

  async function add(line: Omit<CartLine, 'quantity'> & { quantity?: number }, qty = 1) {
    const quantity = Math.max(1, Number(qty || line.quantity || 1))
    const existing = items.value.find((i) => i.productId === line.productId)
    if (existing) {
      existing.quantity = Math.min(existing.maxStock || 99, existing.quantity + quantity)
    } else {
      items.value.push({ ...line, quantity: Math.min(line.maxStock || 99, quantity) })
    }
    persist()
    drawerOpen.value = true
    toast?.success?.('common.addedToCart')
  }

  function setQuantity(productId: number, quantity: number) {
    const line = items.value.find((i) => i.productId === productId)
    if (!line) return
    const max = line.maxStock || 99
    line.quantity = Math.max(1, Math.min(max, Number(quantity) || 1))
    persist()
  }

  function remove(productId: number) {
    items.value = items.value.filter((i) => i.productId !== productId)
    persist()
  }

  function clear() {
    items.value = []
    persist()
  }

  const count = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))
  const subtotal = computed(() => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0))

  return {
    items: computed(() => items.value),
    drawerOpen: computed({
      get: () => drawerOpen.value,
      set: (v: boolean) => (drawerOpen.value = v)
    }),
    add,
    setQuantity,
    remove,
    clear,
    count,
    subtotal
  }
}
