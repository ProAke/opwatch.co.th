import { readFileSync, writeFileSync, mkdirSync, existsSync, chmodSync } from 'node:fs'
import { resolve } from 'node:path'
import { randomBytes } from 'node:crypto'

export interface SiteConfigBlock {
  name: string
  companyName?: string
  tagline: string
  email: string
  phone: string
  address?: string
  addressEn?: string
  currency: string
  currencySymbol: string
  defaultLocale: string
  announcement: string
  shippingFee: number
  freeShippingThreshold: number
  // Social & Live Chat Channels
  lineId?: string
  lineUrl?: string
  facebookUrl?: string
  messengerUrl?: string
  tiktokUrl?: string
  shopeeUrl?: string
  instagramUrl?: string
  chatEnabled?: boolean
  chatGreetingTh?: string
  chatGreetingEn?: string
  // Services & Loyalty Privileges
  giftWrapEnabled?: boolean
  giftWrapFee?: number
  pointsPerBaht?: number
  bahtPerPoint?: number
  returnWindowDays?: number
  warrantyYears?: number
  giftCardEnabled?: boolean
  branchPickupEnabled?: boolean
  // Homepage Promotion Block
  promoHomeEnabled?: boolean
  promoHomeColumns?: 3 | 4 | 6
  promoHomeLimit?: number
}

export interface AiConfigBlock {
  provider: 'auto' | 'openai' | 'google' | 'anthropic' | 'custom'
  model: string
  apiKey: string
  baseUrl: string
  brandVoice: string
}

export interface StoreConfig {
  installed: boolean
  secret: string
  site: SiteConfigBlock
  admin: {
    email: string
    passwordHash: string
  }
  db: {
    driver: 'mysql' | 'json'
    host: string
    port: number
    user: string
    password: string
    database: string
  }
  ai?: AiConfigBlock
  installedAt: string
}

export const CONFIG_FILE = 'site.config.json'

export const DEFAULT_SITE_EXTRAS: Partial<SiteConfigBlock> = {
  companyName: 'บริษัท อินเตอร์ไทมส์ จำกัด',
  address: '1091/229 ซอย 35 ถนนเพชรบุรีตัดใหม่ แขวงมักกะสัน เขตราชเทวี กรุงเทพมหานคร 10400',
  addressEn: '1091/229 Soi 35, New Phetchaburi Rd., Makkasan, Ratchathewi, Bangkok 10400, Thailand',
  lineId: 'opwatch.th',
  lineUrl: 'https://line.me/ti/p/~opwatch.th',
  facebookUrl: 'https://www.facebook.com/OPwatchThailand',
  messengerUrl: 'https://m.me/OPwatchThailand',
  tiktokUrl: 'https://www.tiktok.com/@opwatchthailand',
  shopeeUrl: 'https://shopee.co.th/opwatchthailand',
  instagramUrl: '',
  chatEnabled: true,
  chatGreetingTh: 'สวัสดีครับ ยินดีต้อนรับสู่ OPWatch Boutique โดย บริษัท อินเตอร์ไทมส์ จำกัด สอบถามรุ่นนาฬิกา สต็อกสาขา หรือสถานะคำสั่งซื้อได้เลยครับ',
  chatGreetingEn: 'Welcome to OPWatch Thailand Official Boutique by Inter Times Co., Ltd. How may our watch specialist assist you today?',
  giftWrapEnabled: true,
  giftWrapFee: 0,
  pointsPerBaht: 50,
  bahtPerPoint: 1,
  returnWindowDays: 14,
  warrantyYears: 2,
  giftCardEnabled: true,
  branchPickupEnabled: true,
  promoHomeEnabled: true,
  promoHomeColumns: 4,
  promoHomeLimit: 8
}

export const DEFAULT_AI_CONFIG: AiConfigBlock = {
  provider: 'auto',
  model: '',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  brandVoice: 'หรูหรา น่าเชื่อถือ เป็นทางการในฐานะตัวแทนจำหน่ายนาฬิกาของแท้ในประเทศไทย บริษัท อินเตอร์ไทมส์ จำกัด'
}

export function configDir(): string {
  return resolve(process.cwd(), 'config')
}

export function configPath(): string {
  return resolve(configDir(), CONFIG_FILE)
}

export function loadConfig(): StoreConfig | null {
  try {
    const p = configPath()
    if (!existsSync(p)) return null
    const raw = readFileSync(p, 'utf-8')
    const parsed = JSON.parse(raw) as StoreConfig
    if (!parsed || typeof parsed !== 'object') return null
    parsed.site = { ...DEFAULT_SITE_EXTRAS, ...parsed.site }
    parsed.ai = { ...DEFAULT_AI_CONFIG, ...(parsed.ai || {}) }
    return parsed
  } catch (err) {
    console.error('[opwatch] Failed to load config:', err)
    return null
  }
}

export function saveConfig(cfg: StoreConfig): string {
  const dir = configDir()
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const p = configPath()
  writeFileSync(p, JSON.stringify(cfg, null, 2) + '\n', 'utf-8')
  try { chmodSync(p, 0o600) } catch {}
  return p
}

export function removeConfig(): boolean {
  try {
    const p = configPath()
    if (existsSync(p)) {
      writeFileSync(p, '')
      return true
    }
  } catch {}
  return false
}

export function isInstalled(): boolean {
  return loadConfig()?.installed === true
}

/** Returns the active config, or a sensible default for a fresh install. */
export function getConfig(): StoreConfig {
  const cfg = loadConfig()
  if (cfg) return cfg
  return {
    installed: false,
    secret: randomBytes(24).toString('hex'),
    site: {
      name: 'Opwatch',
      tagline: 'ตัวแทนจำหน่ายนาฬิกาของแท้ในประเทศไทย · บริษัท อินเตอร์ไทมส์ จำกัด',
      email: 'info@opwatch.co.th',
      phone: '02 251 5777',
      currency: 'THB',
      currencySymbol: '฿',
      defaultLocale: 'th',
      announcement: 'ฟรีบริการห่อของขวัญพรีเมียม · รับประกันศูนย์ไทย 2 ปีเต็ม · จัดส่งฟรีทั่วไทยเมื่อช้อปครบ ฿5,000',
      shippingFee: 0,
      freeShippingThreshold: 0,
      ...DEFAULT_SITE_EXTRAS
    },
    admin: { email: '', passwordHash: '' },
    db: { driver: 'json', host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'opwatch' },
    ai: { ...DEFAULT_AI_CONFIG },
    installedAt: ''
  }
}

export function publicSiteConfig() {
  const cfg = getConfig()
  const { admin, db, secret, ai, ...rest } = cfg
  return rest
}
