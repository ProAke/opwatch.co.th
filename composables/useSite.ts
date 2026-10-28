export interface SiteSettings {
  name: string
  tagline: string
  email: string
  phone: string
  currency: string
  currencySymbol: string
  defaultLocale: string
  announcement: string
  shippingFee: number
  freeShippingThreshold: number
}

export interface Category {
  id: number
  slug: string
  name: string
  nameEn: string
  nameTh: string
  description?: string
  descriptionEn?: string
  descriptionTh?: string
  image?: string
  sortOrder?: number
}

export interface SiteInfo {
  installed: boolean
  site: SiteSettings | null
  categories: Category[]
}

const DEFAULT_SITE: SiteSettings = {
  name: 'Opwatch',
  tagline: 'Time, beautifully kept',
  email: 'hello@opwatch.co.th',
  phone: '+66 2 000 0000',
  currency: 'THB',
  currencySymbol: '฿',
  defaultLocale: 'th',
  announcement: '',
  shippingFee: 0,
  freeShippingThreshold: 0
}

export const useSite = () => {
  const state = useState<SiteInfo>('opwatch-site', () => ({
    installed: false,
    site: null,
    categories: []
  }))

  async function load(force = false): Promise<SiteInfo> {
    if (!force && state.value.site) return state.value
    try {
      const data = await $fetch<SiteInfo>('/api/site')
      state.value = {
        installed: data.installed,
        site: data.site || DEFAULT_SITE,
        categories: (data.categories || []) as Category[]
      }
    } catch {
      state.value = { installed: false, site: DEFAULT_SITE, categories: [] }
    }
    return state.value
  }

  if (!state.value.site) load()

  return {
    site: computed(() => state.value.site || DEFAULT_SITE),
    categories: computed(() => state.value.categories),
    installed: computed(() => state.value.installed),
    load
  }
}
