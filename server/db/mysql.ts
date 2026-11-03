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
const JSON_COLUMNS = new Set([
  'images',
  'specs',
  'badges',
  'product_ids',
  'services',
  'aseo_faqs',
  'permissions'
])

function jsonify(col: string, value: any): any {
  if (JSON_COLUMNS.has(col) && value !== null && value !== undefined && typeof value !== 'string') {
    return JSON.stringify(value)
  }
  if (typeof value === 'boolean') return value ? 1 : 0
  return value
}

const MIGRATION_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS \`promotions\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`slug\` VARCHAR(160) NOT NULL,
    \`title\` VARCHAR(220) NOT NULL,
    \`title_th\` VARCHAR(220) NULL,
    \`title_en\` VARCHAR(220) NULL,
    \`subtitle\` VARCHAR(320) NULL,
    \`subtitle_th\` VARCHAR(320) NULL,
    \`subtitle_en\` VARCHAR(320) NULL,
    \`banner\` VARCHAR(500) NULL,
    \`mobile_banner\` VARCHAR(500) NULL,
    \`channel\` VARCHAR(40) NOT NULL DEFAULT 'website',
    \`badge\` VARCHAR(80) NULL,
    \`coupon_code\` VARCHAR(64) NULL,
    \`discount_label\` VARCHAR(80) NULL,
    \`link\` VARCHAR(500) NULL,
    \`target_blank\` TINYINT(1) NOT NULL DEFAULT 0,
    \`show_on_home\` TINYINT(1) NOT NULL DEFAULT 0,
    \`home_columns\` INT NOT NULL DEFAULT 4,
    \`product_ids\` JSON NULL,
    \`starts_at\` VARCHAR(40) NULL,
    \`ends_at\` VARCHAR(40) NULL,
    \`sort_order\` INT NOT NULL DEFAULT 0,
    \`active\` TINYINT(1) NOT NULL DEFAULT 1,
    \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`promotions_slug_unique\` (\`slug\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS \`coupons\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`code\` VARCHAR(64) NOT NULL,
    \`title\` VARCHAR(200) NOT NULL,
    \`title_th\` VARCHAR(200) NULL,
    \`title_en\` VARCHAR(200) NULL,
    \`description\` VARCHAR(320) NULL,
    \`type\` VARCHAR(24) NOT NULL DEFAULT 'percent',
    \`value\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    \`min_spend\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    \`max_discount\` DECIMAL(12,2) NULL,
    \`brand_slug\` VARCHAR(80) NULL,
    \`expires_at\` VARCHAR(40) NULL,
    \`usage_limit\` INT NOT NULL DEFAULT 0,
    \`used_count\` INT NOT NULL DEFAULT 0,
    \`active\` TINYINT(1) NOT NULL DEFAULT 1,
    \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`coupons_code_unique\` (\`code\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS \`branches\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`slug\` VARCHAR(160) NOT NULL,
    \`name\` VARCHAR(200) NOT NULL,
    \`name_th\` VARCHAR(200) NULL,
    \`name_en\` VARCHAR(200) NULL,
    \`zone\` VARCHAR(40) NOT NULL DEFAULT 'bangkok',
    \`address\` TEXT NULL,
    \`address_en\` TEXT NULL,
    \`phone\` VARCHAR(60) NULL,
    \`hours\` VARCHAR(120) NULL,
    \`line_url\` VARCHAR(300) NULL,
    \`map_url\` VARCHAR(500) NULL,
    \`services\` JSON NULL,
    \`sort_order\` INT NOT NULL DEFAULT 0,
    \`active\` TINYINT(1) NOT NULL DEFAULT 1,
    \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`branches_slug_unique\` (\`slug\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS \`pages\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`slug\` VARCHAR(160) NOT NULL,
    \`category\` VARCHAR(40) NOT NULL DEFAULT 'legal',
    \`title\` VARCHAR(220) NOT NULL,
    \`title_th\` VARCHAR(220) NULL,
    \`title_en\` VARCHAR(220) NULL,
    \`summary\` TEXT NULL,
    \`summary_en\` TEXT NULL,
    \`content_th\` LONGTEXT NULL,
    \`content_en\` LONGTEXT NULL,
    \`banner\` VARCHAR(500) NULL,
    \`seo_title\` VARCHAR(220) NULL,
    \`seo_description\` VARCHAR(360) NULL,
    \`seo_keywords\` VARCHAR(360) NULL,
    \`og_image\` VARCHAR(500) NULL,
    \`canonical_url\` VARCHAR(360) NULL,
    \`aseo_summary\` TEXT NULL,
    \`aseo_faqs\` JSON NULL,
    \`schema_type\` VARCHAR(60) NULL DEFAULT 'WebPage',
    \`status\` VARCHAR(24) NOT NULL DEFAULT 'published',
    \`sort_order\` INT NOT NULL DEFAULT 0,
    \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`pages_slug_unique\` (\`slug\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS \`chats\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`session_id\` VARCHAR(80) NULL,
    \`customer_name\` VARCHAR(160) NULL,
    \`customer_contact\` VARCHAR(160) NULL,
    \`channel\` VARCHAR(40) NOT NULL DEFAULT 'webchat',
    \`product_slug\` VARCHAR(220) NULL,
    \`message\` TEXT NOT NULL,
    \`sender\` VARCHAR(24) NOT NULL DEFAULT 'customer',
    \`status\` VARCHAR(24) NOT NULL DEFAULT 'open',
    \`reply\` TEXT NULL,
    \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS \`events\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`title\` VARCHAR(260) NOT NULL,
    \`cat\` VARCHAR(40) NOT NULL DEFAULT 'campaign',
    \`date\` VARCHAR(20) NOT NULL,
    \`end_date\` VARCHAR(20) NULL,
    \`start_time\` VARCHAR(12) NULL DEFAULT '09:00',
    \`end_time\` VARCHAR(12) NULL DEFAULT '10:00',
    \`allday\` TINYINT(1) NOT NULL DEFAULT 0,
    \`location\` VARCHAR(240) NULL,
    \`notes\` TEXT NULL,
    \`ref_code\` VARCHAR(80) NULL,
    \`assignee\` VARCHAR(120) NULL,
    \`status\` VARCHAR(24) NOT NULL DEFAULT 'active',
    \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS \`ai_runs\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`agent_code\` VARCHAR(40) NOT NULL DEFAULT 'OP-COPY',
    \`task\` VARCHAR(80) NOT NULL,
    \`model\` VARCHAR(120) NULL,
    \`provider\` VARCHAR(60) NULL,
    \`prompt_summary\` VARCHAR(320) NULL,
    \`output_preview\` TEXT NULL,
    \`tokens\` INT NOT NULL DEFAULT 0,
    \`duration_ms\` INT NOT NULL DEFAULT 0,
    \`status\` VARCHAR(24) NOT NULL DEFAULT 'done',
    \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `ALTER TABLE \`products\` ADD COLUMN \`seo_title\` VARCHAR(220) NULL`,
  `ALTER TABLE \`products\` ADD COLUMN \`seo_description\` VARCHAR(360) NULL`,
  `ALTER TABLE \`products\` ADD COLUMN \`seo_keywords\` VARCHAR(360) NULL`,
  `ALTER TABLE \`products\` ADD COLUMN \`aseo_summary\` TEXT NULL`,
  `ALTER TABLE \`products\` ADD COLUMN \`aseo_faqs\` JSON NULL`,
  `ALTER TABLE \`products\` ADD COLUMN \`shopee_url\` VARCHAR(500) NULL`,
  `ALTER TABLE \`products\` ADD COLUMN \`shopee_item_id\` VARCHAR(80) NULL`,
  `ALTER TABLE \`products\` ADD COLUMN \`video_url\` VARCHAR(500) NULL`,
  `ALTER TABLE \`products\` ADD COLUMN \`gift_wrap_available\` TINYINT(1) NOT NULL DEFAULT 1`,
  `ALTER TABLE \`products\` ADD COLUMN \`points_multiplier\` DECIMAL(5,2) NOT NULL DEFAULT 1.00`,
  `ALTER TABLE \`customers\` ADD COLUMN \`role\` VARCHAR(24) NOT NULL DEFAULT 'member'`,
  `ALTER TABLE \`customers\` ADD COLUMN \`department\` VARCHAR(100) NULL`,
  `ALTER TABLE \`customers\` ADD COLUMN \`position\` VARCHAR(100) NULL`,
  `ALTER TABLE \`customers\` ADD COLUMN \`permissions\` JSON NULL`,
  `ALTER TABLE \`customers\` ADD COLUMN \`status\` VARCHAR(24) NOT NULL DEFAULT 'active'`,
  `ALTER TABLE \`customers\` ADD COLUMN \`last_login_at\` VARCHAR(40) NULL`,
  `ALTER TABLE \`orders\` ADD COLUMN \`tracking_no\` VARCHAR(80) NULL`,
  `ALTER TABLE \`orders\` ADD COLUMN \`carrier\` VARCHAR(80) NULL`,
  `ALTER TABLE \`orders\` ADD COLUMN \`confirmed_at\` VARCHAR(40) NULL`,
  `ALTER TABLE \`orders\` ADD COLUMN \`shipped_at\` VARCHAR(40) NULL`,
  `ALTER TABLE \`orders\` ADD COLUMN \`delivered_at\` VARCHAR(40) NULL`,
  `ALTER TABLE \`orders\` ADD COLUMN \`coupon_code\` VARCHAR(64) NULL`,
  `ALTER TABLE \`orders\` ADD COLUMN \`gift_wrap\` TINYINT(1) NOT NULL DEFAULT 0`,
  `ALTER TABLE \`orders\` ADD COLUMN \`gift_message\` VARCHAR(300) NULL`,
  `ALTER TABLE \`orders\` ADD COLUMN \`branch_slug\` VARCHAR(120) NULL`,
  `ALTER TABLE \`orders\` ADD COLUMN \`points_redeemed\` INT NOT NULL DEFAULT 0`,
  `ALTER TABLE \`orders\` ADD COLUMN \`points_earned\` INT NOT NULL DEFAULT 0`,
  `ALTER TABLE \`orders\` ADD COLUMN \`channel\` VARCHAR(40) NULL DEFAULT 'website'`,
  `ALTER TABLE \`order_items\` ADD COLUMN \`wrist_size\` VARCHAR(40) NULL`
]

export class MysqlStore implements Store {
  readonly driver = 'mysql'
  private pool: mysql.Pool
  private migratePromise: Promise<void> | null = null

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

  private ensureMigrated(): Promise<void> {
    if (!this.migratePromise) {
      this.migratePromise = (async () => {
        for (const stmt of MIGRATION_STATEMENTS) {
          try {
            await this.pool.query(stmt)
          } catch {
            // Column or table already exists
          }
        }
      })()
    }
    return this.migratePromise
  }

  async ready(): Promise<void> {
    await this.ensureMigrated()
  }

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
        params.push(typeof v === 'boolean' ? (v ? 1 : 0) : v)
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
    await this.ensureMigrated()
    const [rows] = await this.pool.query(`SELECT * FROM \`${entity}\``)
    return (rows as any[]).map(rowToApi)
  }

  async find(entity: Entity, opts: FindOptions = {}): Promise<Record<string, any>[]> {
    await this.ensureMigrated()
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
    await this.ensureMigrated()
    const [rows] = await this.pool.query(`SELECT * FROM \`${entity}\` WHERE \`id\` = ? LIMIT 1`, [id])
    const row = (rows as any[])[0]
    return row ? rowToApi(row) : null
  }

  async count(entity: Entity, opts: FindOptions = {}): Promise<number> {
    await this.ensureMigrated()
    const { sql, params } = this.buildWhere(entity, opts)
    const [rows] = await this.pool.query(`SELECT COUNT(*) AS c FROM \`${entity}\`${sql}`, params)
    return Number((rows as any[])[0]?.c ?? 0)
  }

  async create(entity: Entity, data: Record<string, any>): Promise<Record<string, any>> {
    await this.ensureMigrated()
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
    await this.ensureMigrated()
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
    await this.ensureMigrated()
    const [res] = await this.pool.query(`DELETE FROM \`${entity}\` WHERE \`id\` = ?`, [id])
    return !!(res as any).affectedRows
  }

  async raw(sql: string, params: any[] = []): Promise<any[]> {
    await this.ensureMigrated()
    const [rows] = await this.pool.query(sql, params)
    return rows as any[]
  }
}
