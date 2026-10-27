export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

let counter = 0

export const useToast = () => {
  const toasts = useState<Toast[]>('opwatch-toasts', () => [])

  function push(message: string, type: Toast['type'] = 'success', timeout = 2600) {
    const id = ++counter
    toasts.value.push({ id, message, type })
    setTimeout(() => dismiss(id), timeout)
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts: computed(() => toasts.value),
    push,
    dismiss,
    success: (m: string) => push(m, 'success'),
    error: (m: string) => push(m, 'error'),
    info: (m: string) => push(m, 'info')
  }
}
