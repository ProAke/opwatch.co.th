#!/usr/bin/env node
// Creates the ai_uarea database + schema (idempotent).
//   npm run db:migrate            → create DB + tables
//   npm run db:migrate -- --seed  → …then load the demo dataset
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { config, connect } from "./_db.mjs";

const opts = config({ withDatabase: false });
const dbName = process.env.DB_NAME;

console.log(`→ เชื่อมต่อ MariaDB ที่ ${opts.host}:${opts.port} ในฐานะ ${opts.user}`);

const conn = await connect(opts);
try {
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  console.log(`✓ ฐานข้อมูล ${dbName} พร้อมใช้`);
  await conn.query(`USE \`${dbName}\``);

  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  const statements = sql
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("--"));

  for (const statement of statements) {
    await conn.query(statement);
  }
  console.log(`✓ สร้าง/ตรวจสอบตารางทั้งหมด ${statements.length} คำสั่งเรียบร้อย`);

  const [tables] = await conn.query(
    "SELECT TABLE_NAME AS name FROM information_schema.tables WHERE table_schema = ? ORDER BY TABLE_NAME",
    [dbName],
  );
  console.log(`✓ ตารางในฐานข้อมูล: ${tables.map((t) => t.name).join(", ")}`);
} catch (err) {
  console.error("✗ migration ล้มเหลว:", err.message);
  process.exitCode = 1;
} finally {
  await conn.end();
}

if (process.argv.includes("--seed") && !process.exitCode) {
  execFileSync(process.execPath, ["--experimental-strip-types", "--no-warnings", "scripts/seed.mjs"], {
    stdio: "inherit",
    env: process.env,
  });
}
