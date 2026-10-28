#!/usr/bin/env node
/**
 * Opwatch — database bootstrap for MariaDB / MySQL.
 *
 *   node scripts/init-db.mjs
 *
 * Reads config/site.config.json and applies server/db/schema.sql to the
 * configured database. The installer at /install does this automatically;
 * this script is for manual / CLI setups.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const configPath = resolve(root, 'config/site.config.json')

if (!existsSync(configPath)) {
  console.error('\n  config/site.config.json not found.')
  console.error('  Run the installer instead:  npm run dev  →  http://localhost:3000/install\n')
  process.exit(1)
}

const cfg = JSON.parse(readFileSync(configPath, 'utf-8'))

if (cfg.db?.driver !== 'mysql') {
  console.error(`\n  Configured driver is "${cfg.db?.driver}".`)
  console.error('  No MariaDB server required — the JSON store is already ready in data/store.json.\n')
  process.exit(0)
}

const { host, port, user, password, database } = cfg.db

const server = await mysql.createConnection({ host, port: Number(port) || 3306, user, password, multipleStatements: false })
await server.query(
  `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
)
await server.end()

const pool = mysql.createPool({ host, port: Number(port) || 3306, user, password, database, connectionLimit: 4 })
const schema = readFileSync(resolve(root, 'server/db/schema.sql'), 'utf-8')

const statements = schema
  .split(';')
  .map((s) => s.trim())
  .filter((s) => s && !s.startsWith('--'))

for (const stmt of statements) {
  await pool.query(stmt)
}
await pool.end()

console.log(`\n  ✔ Schema applied to ${database}@${host}:${port || 3306}`)
console.log('  Next: start the app with npm run dev and sign in to the admin panel.\n')
