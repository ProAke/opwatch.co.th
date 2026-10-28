import { resolve } from 'node:path'
import { getConfig } from './config'
import { JsonStore } from '../db/json'
import { MysqlStore } from '../db/mysql'
import type { Store } from '../db/types'

export type { Entity, FindOptions, Store } from '../db/types'

let store: Store | null = null
let storeKey = ''

function keyFor(cfg: ReturnType<typeof getConfig>): string {
  return JSON.stringify({
    d: cfg.db.driver, h: cfg.db.host, p: cfg.db.port, u: cfg.db.user, db: cfg.db.database
  })
}

/** Returns the active store, rebuilding it when the config changes. */
export function useStore(): Store {
  const cfg = getConfig()
  const key = keyFor(cfg)
  if (store && storeKey === key) return store
  try { (store as any)?.close?.() } catch { /* ignore */ }

  if (cfg.db.driver === 'mysql') {
    store = new MysqlStore({
      host: cfg.db.host,
      port: Number(cfg.db.port) || 3306,
      user: cfg.db.user,
      password: cfg.db.password,
      database: cfg.db.database
    })
  } else {
    store = new JsonStore(resolve(process.cwd(), 'data'))
  }
  storeKey = key
  return store
}

export function resetStore(): void {
  store = null
  storeKey = ''
}
