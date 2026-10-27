import { readFileSync, writeFileSync, mkdirSync, existsSync, chmodSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { randomBytes } from 'node:crypto'

export interface StoreConfig {
  installed: boolean
  secret: string
  site: {
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
  installedAt: string
}

export const CONFIG_FILE = 'site.config.json'

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
      tagline: 'Time, beautifully kept',
      email: 'hello@opwatch.co.th',
      phone: '+66 2 000 0000',
      currency: 'THB',
      currencySymbol: '฿',
      defaultLocale: 'th',
      announcement: '',
      shippingFee: 0,
      freeShippingThreshold: 0
    },
    admin: { email: '', passwordHash: '' },
    db: { driver: 'json', host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'opwatch' },
    installedAt: ''
  }
}

export function publicSiteConfig() {
  const cfg = getConfig()
  const { admin, db, secret, ...rest } = cfg
  return rest
}
