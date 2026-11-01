#!/usr/bin/env node
// Loads the demo dataset (projects, agents, flows, runs, issues, schedules…) into MariaDB.
// Safe to re-run: rows are upserted by primary key.
import { config, connect, sqlValue } from "./_db.mjs";
import { buildSeed } from "../lib/seed-data.ts";

const TABLES = {
  projects: "projects",
  models: "ai_models",
  agents: "agents",
  flows: "flows",
  runs: "runs",
  issues: "issues",
  schedules: "schedules",
  events: "events",
  docs: "docs",
  integrations: "integrations",
  policies: "policies",
  users: "users",
  runSteps: "run_steps",
};

async function upsert(conn, table, rows) {
  if (!rows?.length) return 0;
  let count = 0;
  for (const row of rows) {
    const keys = Object.keys(row).filter((k) => row[k] !== undefined);
    const placeholders = keys.map(() => "?").join(", ");
    const updates = keys
      .filter((k) => k !== "id")
      .map((k) => `\`${k}\` = VALUES(\`${k}\`)`)
      .join(", ");
    const sql = `INSERT INTO \`${table}\` (${keys.map((k) => `\`${k}\``).join(", ")}) VALUES (${placeholders})${
      updates ? ` ON DUPLICATE KEY UPDATE ${updates}` : ""
    }`;
    await conn.query(sql, keys.map((k) => sqlValue(row[k])));
    count += 1;
  }
  return count;
}

const snapshot = buildSeed();
const conn = await connect(config());
console.log(`→ seed ข้อมูลลงฐาน ${process.env.DB_NAME}`);

let total = 0;
try {
  for (const [key, table] of Object.entries(TABLES)) {
    const rows = snapshot[key] ?? [];
    const n = await upsert(conn, table, rows);
    total += n;
    console.log(`  ✓ ${table.padEnd(14)} ${n} แถว`);
  }
  console.log(`✓ seed สำเร็จทั้งหมด ${total} แถว`);
} catch (err) {
  console.error("✗ seed ล้มเหลว:", err.message);
  process.exitCode = 1;
} finally {
  await conn.end();
}
