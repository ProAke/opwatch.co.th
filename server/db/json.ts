import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Entity, FindOptions, Store } from './types'
import { ENTITIES, shape } from './types'

/**
 * File-backed JSON store.
 *
 * Used for local development and the sandbox preview so the app is fully
 * usable without a MariaDB server. Production installs use the MySQL adapter;
 * both implement the identical `Store` interface.
 */
export class JsonStore implements Store {
  readonly driver = 'json'
  private data: Record<Entity, any[]>
  private maxId: Record<Entity, number>
  private readonly file: string

  constructor(private baseDir: string) {
    this.file = resolve(baseDir, 'store.json')
    this.data = this.load()
    this.maxId = this.computeMaxId()
  }

  private load(): Record<Entity, any[]> {
    const empty = () => ENTITIES.reduce((acc, e) => ({ ...acc, [e]: [] }), {} as Record<Entity, any[]>)
    try {
      if (existsSync(this.file)) {
        const parsed = JSON.parse(readFileSync(this.file, 'utf-8'))
        const out = empty()
        for (const e of ENTITIES) out[e] = Array.isArray(parsed[e]) ? parsed[e] : []
        return out
      }
    } catch (err) {
      console.error('[opwatch] Failed to read JSON store:', err)
    }
    return empty()
  }

  private computeMaxId(): Record<Entity, number> {
    const out = ENTITIES.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<Entity, number>)
    for (const e of ENTITIES) {
      for (const row of this.data[e] as any[]) {
        const id = Number(row?.id)
        if (id && id > out[e]) out[e] = id
      }
    }
    return out
  }

  private persist(): void {
    try {
      if (!existsSync(this.baseDir)) mkdirSync(this.baseDir, { recursive: true })
      writeFileSync(this.file, JSON.stringify(this.data, null, 2) + '\n', 'utf-8')
    } catch (err) {
      console.error('[opwatch] Failed to persist JSON store:', err)
    }
  }

  async ready(): Promise<void> { /* no-op */ }
  async close(): Promise<void> { /* no-op */ }

  async all(entity: Entity): Promise<Record<string, any>[]> {
    return (this.data[entity] as any[]).map((r) => shape(r))
  }

  async find(entity: Entity, opts: FindOptions = {}): Promise<Record<string, any>[]> {
    let rows = [...(this.data[entity] as any[])]
    if (opts.where) {
      for (const [k, v] of Object.entries(opts.where)) {
        if (v === undefined || v === null) continue
        rows = rows.filter((r) => r[k] === v)
      }
    }
    if (opts.like) {
      const entries = Object.entries(opts.like).filter(([, v]) => Boolean(v))
      if (entries.length) {
        rows = rows.filter((r) =>
          entries.some(([k, v]) => String(r[k] ?? '').toLowerCase().includes(String(v).toLowerCase()))
        )
      }
    }
    if (opts.in) {
      for (const [k, arr] of Object.entries(opts.in)) {
        if (!Array.isArray(arr) || arr.length === 0) continue
        rows = rows.filter((r) => arr.includes(r[k]))
      }
    }
    if (opts.orderBy) {
      const dir = opts.orderDir === 'desc' ? -1 : 1
      const key = opts.orderBy
      rows = rows.sort((a, b) => {
        const av = a[key]
        const bv = b[key]
        if (av == null) return 1
        if (bv == null) return -1
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
        return String(av).localeCompare(String(bv)) * dir
      })
    }
    if (opts.offset) rows = rows.slice(Number(opts.offset))
    if (opts.limit !== undefined) rows = rows.slice(0, Number(opts.limit))
    return rows.map((r) => shape(r))
  }

  async findOne(entity: Entity, opts: FindOptions = {}): Promise<Record<string, any> | null> {
    const rows = await this.find(entity, { ...opts, limit: 1 })
    return rows[0] ?? null
  }

  async findById(entity: Entity, id: number | string): Promise<Record<string, any> | null> {
    const num = Number(id)
    const row = (this.data[entity] as any[]).find((r) => Number(r.id) === num)
    return row ? shape(row) : null
  }

  async count(entity: Entity, opts: FindOptions = {}): Promise<number> {
    return (await this.find(entity, opts)).length
  }

  async create(entity: Entity, data: Record<string, any>): Promise<Record<string, any>> {
    const row: any = { ...data }
    const id = (this.maxId[entity] || 0) + 1
    row.id = id
    this.maxId[entity] = id
    if (row.createdAt === undefined) row.createdAt = new Date().toISOString()
    if (entity === 'products' && row.updatedAt === undefined) row.updatedAt = row.createdAt
    if (row.images && !Array.isArray(row.images)) row.images = [row.images]
    if (typeof row.specs === 'string') {
      try { row.specs = JSON.parse(row.specs) } catch { row.specs = {} }
    }
    this.data[entity].push(row)
    this.persist()
    return shape(row)
  }

  async update(entity: Entity, id: number, data: Record<string, any>): Promise<Record<string, any> | null> {
    const num = Number(id)
    const rows = this.data[entity] as any[]
    const idx = rows.findIndex((r) => Number(r.id) === num)
    if (idx < 0) return null
    const updated: any = { ...rows[idx], ...data, id: rows[idx].id }
    if (entity === 'products' && !updated.updatedAt) updated.updatedAt = new Date().toISOString()
    rows[idx] = updated
    this.persist()
    return shape(updated)
  }

  async remove(entity: Entity, id: number): Promise<boolean> {
    const num = Number(id)
    const rows = this.data[entity] as any[]
    const idx = rows.findIndex((r) => Number(r.id) === num)
    if (idx < 0) return false
    rows.splice(idx, 1)
    this.persist()
    return true
  }

  async raw(): Promise<any[]> {
    throw new Error('Raw SQL is not supported by the JSON store')
  }

  /** Rebuild the store from scratch (used by the installer). */
  reset(seed?: Record<Entity, any[]>): void {
    if (seed) {
      for (const e of ENTITIES) this.data[e] = Array.isArray(seed[e]) ? seed[e] : []
    } else {
      for (const e of ENTITIES) this.data[e] = []
    }
    this.maxId = this.computeMaxId()
    this.persist()
  }
}
