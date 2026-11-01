import mysql from 'mysql2/promise'
import type { Entity, FindOptions, Store } from './types'
import { COLUMNS, pickColumns, rowToApi, toSnake } from './types'

export interface MysqlConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
}

/** Columns stored as JSON in MariaDB — must be stringified before binding. */
const JSON_COLUMNS = new Set(['images', 'specs', 'badges'])

function jsonify(col: string, value: any): any {
  if (JSON_COLUMNS.has(col) && value !== null && value !== undefined && typeof value !== 'string') {
    return JSON.stringify(value)
  }
  return value
}

export class MysqlStore implements Store {
  readonly driver = 'mysql'
  private pool: mysql.Pool

  constructor(private cfg: MysqlConfig) {
    this.pool = mysql.createPool({
      host: cfg.host || '127.0.0.1',
      port: Number(cfg.port) || 3306,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true,
      dateStrings: true,
      multipleStatements: false,
      charset: 'utf8mb4_unicode_ci'
    })
  }

  async ready(): Promise<void> { /* pool connects lazily */ }

  async close(): Promise<void> {
    await this.pool.end().catch(() => {})
  }

  async test(): Promise<boolean> {
    try {
      const [rows] = await this.pool.query('SELECT 1 AS ok')
      return !!(rows as any[]).length
    } catch {
      return false
    }
  }

  private validate(entity: Entity, col: string): string {
    const c = toSnake(col)
    if (!COLUMNS[entity].includes(c)) throw new Error(`Column "${col}" is not allowed for ${entity}`)
    return c
  }

  private buildWhere(entity: Entity, opts: FindOptions = {}) {
    const clauses: string[] = []
    const params: any[] = []
    if (opts.where) {
      for (const [k, v] of Object.entries(opts.where)) {
        if (v === undefined || v === null) continue
        clauses.push(`${this.validate(entity, k)} = ?`)
        params.push(v)
      }
    }
    if (opts.like) {
      const likeClauses: string[] = []
      for (const [k, v] of Object.entries(opts.like)) {
        if (v === undefined || v === null || v === '') continue
        likeClauses.push(`${this.validate(entity, k)} LIKE ?`)
        params.push(`%${v}%`)
      }
      if (likeClauses.length) {
        clauses.push(`(${likeClauses.join(' OR ')})`)
      }
    }
    if (opts.in) {
      for (const [k, arr] of Object.entries(opts.in)) {
        if (!Array.isArray(arr) || arr.length === 0) continue
        clauses.push(`${this.validate(entity, k)} IN (${arr.map(() => '?').join(', ')})`)
        params.push(...arr)
      }
    }
    return { sql: clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '', params }
  }

  async all(entity: Entity): Promise<Record<string, any>[]> {
    const [rows] = await this.pool.query(`SELECT * FROM \`${entity}\``)
    return (rows as any[]).map(rowToApi)
  }

  async find(entity: Entity, opts: FindOptions = {}): Promise<Record<string, any>[]> {
    const { sql, params } = this.buildWhere(entity, opts)
    let order = ' ORDER BY `id` ASC'
    if (opts.orderBy) {
      const col = this.validate(entity, opts.orderBy)
      order = ` ORDER BY \`${col}\` ${opts.orderDir === 'desc' ? 'DESC' : 'ASC'}`
    }
    let limit = ''
    if (opts.limit !== undefined) {
      limit = ` LIMIT ${Number(opts.limit)}`
      if (opts.offset) limit += ` OFFSET ${Number(opts.offset)}`
    }
    const [rows] = await this.pool.query(`SELECT * FROM \`${entity}\`${sql}${order}${limit}`, params)
    return (rows as any[]).map(rowToApi)
  }

  async findOne(entity: Entity, opts: FindOptions = {}): Promise<Record<string, any> | null> {
    const rows = await this.find(entity, { ...opts, limit: 1 })
    return rows[0] ?? null
  }

  async findById(entity: Entity, id: number | string): Promise<Record<string, any> | null> {
    const [rows] = await this.pool.query(`SELECT * FROM \`${entity}\` WHERE \`id\` = ? LIMIT 1`, [id])
    const row = (rows as any[])[0]
    return row ? rowToApi(row) : null
  }

  async count(entity: Entity, opts: FindOptions = {}): Promise<number> {
    const { sql, params } = this.buildWhere(entity, opts)
    const [rows] = await this.pool.query(`SELECT COUNT(*) AS c FROM \`${entity}\`${sql}`, params)
    return Number((rows as any[])[0]?.c ?? 0)
  }

  async create(entity: Entity, data: Record<string, any>): Promise<Record<string, any>> {
    const cols = pickColumns(entity, data, { excludeId: true })
    const keys = Object.keys(cols)
    if (!keys.length) throw new Error(`No valid columns for ${entity}`)
    const values = keys.map((k) => jsonify(k, cols[k]))
    const [res] = await this.pool.query(
      `INSERT INTO \`${entity}\` (${keys.map((k) => `\`${k}\``).join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`,
      values
    )
    const id = (res as any).insertId
    return (await this.findById(entity, id)) ?? {}
  }

  async update(entity: Entity, id: number, data: Record<string, any>): Promise<Record<string, any> | null> {
    const cols = pickColumns(entity, data, { excludeId: true })
    const keys = Object.keys(cols)
    if (!keys.length) return this.findById(entity, id)
    const sets = keys.map((k) => `\`${k}\` = ?`)
    const values = keys.map((k) => jsonify(k, cols[k]))
    const [res] = await this.pool.query(`UPDATE \`${entity}\` SET ${sets.join(', ')} WHERE \`id\` = ?`, [...values, id])
    if (!(res as any).affectedRows) return null
    return this.findById(entity, id)
  }

  async remove(entity: Entity, id: number): Promise<boolean> {
    const [res] = await this.pool.query(`DELETE FROM \`${entity}\` WHERE \`id\` = ?`, [id])
    return !!(res as any).affectedRows
  }

  async raw(sql: string, params: any[] = []): Promise<any[]> {
    const [rows] = await this.pool.query(sql, params)
    return rows as any[]
  }
}
