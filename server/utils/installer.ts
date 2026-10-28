import mysql from 'mysql2/promise'
import { resolve } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import { useStore, resetStore } from './store'
import { hashPassword, newSecret } from './auth'
import { seedStore } from './seed'
import type { StoreConfig } from './config'

export interface InstallPayload {
  site: {
    name: string
    tagline: string
    email: string
    phone: string
    currency: string
    currencySymbol: string
    defaultLocale: string
    announcement?: string
    shippingFee?: number | string
    freeShippingThreshold?: number | string
  }
  admin: { email: string; password: string }
  db: {
    driver: 'mysql' | 'json'
    host: string
    port: string | number
    user: string
    password: string
    database: string
  }
}

export interface InstallResult {
  ok: boolean
  errors: string[]
  warnings: string[]
  config?: StoreConfig
}

const DB_NAME_RE = /^[A-Za-z0-9_]+$/

async function createMysqlSchema(db: {
  host: string
  port: number
  user: string
  password: string
  database: string
}): Promise<void> {
  // 1. Ensure the database exists (connect without selecting it first).
  const server = await mysql.createConnection({
    host: db.host,
    port: Number(db.port) || 3306,
    user: db.user,
    password: db.password,
    multipleStatements: false
  })
  if (!DB_NAME_RE.test(db.database)) {
    throw new Error(`Invalid database name "${db.database}"`)
  }
  await server.query(
    `CREATE DATABASE IF NOT EXISTS \`${db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  )
  await server.end()

  // 2. Apply the schema.
  const pool = mysql.createPool({
    host: db.host,
    port: Number(db.port) || 3306,
    user: db.user,
    password: db.password,
    database: db.database,
    waitForConnections: true,
    connectionLimit: 5,
    decimalNumbers: true,
    dateStrings: true
  })
  try {
    const schemaPath = resolve(process.cwd(), 'server/db/schema.sql')
    if (!existsSync(schemaPath)) throw new Error('Schema file missing: server/db/schema.sql')
    const sql = readFileSync(schemaPath, 'utf-8')
    for (const stmt of sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('--'))) {
      await pool.query(stmt)
    }
  } finally {
    await pool.end()
  }
}

export async function testMysqlConnection(db: {
  host: string
  port: number
  user: string
  password: string
  database: string
}): Promise<{ ok: boolean; message: string }> {
  try {
    const pool = mysql.createPool({
      host: db.host,
      port: Number(db.port) || 3306,
      user: db.user,
      password: db.password,
      database: db.database,
      waitForConnections: true,
      connectionLimit: 2,
      connectTimeout: 6000
    })
    const [rows] = await pool.query('SELECT 1 AS ok')
    await pool.end()
    return { ok: true, message: 'Connection successful' }
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Connection failed' }
  }
}

export async function runInstall(payload: InstallPayload): Promise<InstallResult> {
  const errors: string[] = []
  const warnings: string[] = []

  const siteName = String(payload.site?.name || '').trim()
  const adminEmail = String(payload.admin?.email || '').trim().toLowerCase()
  const adminPassword = String(payload.admin?.password || '')

  if (!siteName) errors.push('storeNameRequired')
  if (!adminEmail) errors.push('adminEmailRequired')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adminEmail)) errors.push('adminEmailInvalid')
  if (adminPassword.length < 6) errors.push('adminPasswordWeak')

  const driver = payload.db?.driver === 'mysql' ? 'mysql' : 'json'
  if (driver === 'mysql') {
    const host = String(payload.db?.host || '127.0.0.1').trim()
    const port = Number(payload.db?.port) || 3306
    const user = String(payload.db?.user || '').trim()
    const password = String(payload.db?.password || '')
    const database = String(payload.db?.database || '').trim()
    if (!user) errors.push('dbUserRequired')
    if (!database) errors.push('dbNameRequired')
    if (database && !DB_NAME_RE.test(database)) errors.push('dbNameInvalid')

    if (errors.length === 0) {
      const test = await testMysqlConnection({ host, port, user, password, database })
      if (!test.ok) {
        errors.push('dbConnectionFailed')
      } else {
        try {
          await createMysqlSchema({ host, port, user, password, database })
        } catch (err: any) {
          errors.push('dbSchemaFailed')
          warnings.push(err?.message || 'Schema creation failed')
        }
      }
    }
  } else {
    warnings.push('jsonDriverNotice')
  }

  if (errors.length) return { ok: false, errors, warnings }

  // Build config + seed + write.
  const passwordHash = await hashPassword(adminPassword)
  const cfg: StoreConfig = {
    installed: true,
    secret: newSecret(),
    site: {
      name: siteName,
      tagline: String(payload.site?.tagline || '').trim(),
      email: String(payload.site?.email || '').trim(),
      phone: String(payload.site?.phone || '').trim(),
      currency: String(payload.site?.currency || 'THB').trim(),
      currencySymbol: String(payload.site?.currencySymbol || '฿').trim(),
      defaultLocale: payload.site?.defaultLocale === 'en' ? 'en' : 'th',
      announcement: String(payload.site?.announcement || ''),
      shippingFee: Number(payload.site?.shippingFee ?? 0) || 0,
      freeShippingThreshold: Number(payload.site?.freeShippingThreshold ?? 0) || 0
    },
    admin: { email: adminEmail, passwordHash },
    db: {
      driver,
      host: driver === 'mysql' ? String(payload.db?.host || '127.0.0.1') : '127.0.0.1',
      port: Number(payload.db?.port) || 3306,
      user: driver === 'mysql' ? String(payload.db?.user || '') : 'root',
      password: driver === 'mysql' ? String(payload.db?.password || '') : '',
      database: driver === 'mysql' ? String(payload.db?.database || 'opwatch') : 'opwatch'
    },
    installedAt: new Date().toISOString()
  }

  const { saveConfig } = await import('./config')
  saveConfig(cfg)
  resetStore()

  // Seed catalogue.
  try {
    const store = useStore()
    if (store.driver === 'json') (store as any).reset?.()
    await seedStore(store, { reset: true })
  } catch (err: any) {
    warnings.push('seedFailed')
    console.error('[opwatch] seed error:', err)
  }

  // Ensure the administrator exists as a customer row.
  try {
    const store = useStore()
    const existing = await store.findOne('customers', { where: { email: cfg.admin.email } })
    if (!existing) {
      await store.create('customers', {
        name: 'Administrator',
        email: cfg.admin.email,
        passwordHash: cfg.admin.passwordHash,
        isAdmin: true,
        points: 0,
        totalSpent: 0
      })
    } else {
      await store.update('customers', Number(existing.id), {
        passwordHash: cfg.admin.passwordHash,
        isAdmin: true
      })
    }
  } catch (err: any) {
    console.error('[opwatch] admin create error:', err)
  }

  resetStore()
  return { ok: true, errors, warnings, config: cfg }
}
