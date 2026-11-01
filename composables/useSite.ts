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
  parentId?: number | null
  description?: string
  descriptionEn?: string
  descriptionTh?: string
  image?: string
  icon?: string
  bannerImage?: string
  sortOrder?: number
}

export interface Brand {
  id: number
  slug: string
  name: string
  nameEn: string
  nameTh: string
  country?: string
  countryEn?: string
  movement?: string
  movementEn?: string
  positioning?: string
  tagline?: string
  taglineEn?: string
  story?: string
  storyEn?: string
  accentColor?: string
  logo?: string
  heroImage?: string
  sortOrder?: number
  active?: boolean
}

export interface SiteInfo {
  installed: boolean
  site: SiteSettings | null
  categories: Category[]
  brands: Brand[]
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
    categories: [],
    brands: []
  }))

  async function load(force = false): Promise<SiteInfo> {
    if (!force && state.value.site) return state.value
    try {
      const reqFetch = useRequestFetch()
      const data = await reqFetch<SiteInfo>('/api/site')
      state.value = {
        installed: data.installed,
        site: data.site || DEFAULT_SITE,
        categories: (data.categories || []) as Category[],
        brands: (data.brands || []) as Brand[]
      }
    } catch {
      state.value = { installed: false, site: DEFAULT_SITE, categories: [], brands: [] }
    }
    return state.value
  }

  if (!state.value.site) load()

  return {
    site: computed(() => state.value.site || DEFAULT_SITE),
    categories: computed(() => state.value.categories),
    brands: computed(() => state.value.brands),
    installed: computed(() => state.value.installed),
    load
  }
}
