import mysql from "mysql2/promise";

// ─────────────────────────────────────────────────────────────────────────────
// MariaDB connection + tiny persistence helpers.
// When DB_HOST is empty the console runs in DEMO mode with seeded in-memory
// data (handy for previews); set DB_* to switch to MariaDB with zero code change.
// ─────────────────────────────────────────────────────────────────────────────

export const dbEnabled = () => Boolean(process.env.DB_HOST);

type Pool = mysql.Pool;
const globalForDb = globalThis as unknown as { __uareaPool?: Pool | null };

export function getPool(): Pool {
  if (!dbEnabled()) throw new Error("DB disabled");
  if (!globalForDb.__uareaPool) {
    globalForDb.__uareaPool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || "ai_uarea",
      waitForConnections: true,
      connectionLimit: 8,
      timezone: "Z",
      dateStrings: false,
      charset: "utf8mb4",
    });
  }
  return globalForDb.__uareaPool;
}

export const JSON_COLUMNS: Record<string, string[]> = {
  agents: ["tools"],
  models: ["strengths"],
  flows: ["steps", "tags", "browsers"],
  schedules: ["notify"],
  docs: [],
  integrations: ["config"],
  issues: ["labels"],
  policies: ["options", "value"],
};

export const TABLE_NAMES: Record<string, string> = {
  projects: "projects",
  agents: "agents",
  models: "ai_models",
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

export type Row = Record<string, unknown>;

export function normalizeRow(table: string, row: Row): Row {
  const jsonCols = JSON_COLUMNS[table] ?? [];
  const out: Row = {};
  for (const [k, v] of Object.entries(row)) {
    if (jsonCols.includes(k) && typeof v === "string") {
      try {
        out[k] = JSON.parse(v);
      } catch {
        out[k] = v;
      }
    } else if (v instanceof Date) {
      out[k] = v.toISOString();
    } else if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
      out[k] = v;
    } else if (v !== null && typeof v === "bigint") {
      out[k] = Number(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}


const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/;

/** MariaDB DATETIME cannot take a JS ISO string — normalise it. */
function sqlValue(v: unknown): unknown {
  if (typeof v === "string" && ISO_RE.test(v)) {
    return new Date(v).toISOString().slice(0, 19).replace("T", " ");
  }
  return v ?? null;
}

export async function selectAll(table: string, orderBy?: string): Promise<Row[]> {
  const pool = getPool();
  const [rows] = await pool.query(`SELECT * FROM \`${table}\`${orderBy ? ` ORDER BY ${orderBy}` : ""}`);
  return (rows as Row[]).map((r) => normalizeRow(table, r));
}

export async function insertRow(table: string, data: Row): Promise<void> {
  const jsonCols = JSON_COLUMNS[table] ?? [];
  const keys = Object.keys(data);
  const sql = `INSERT INTO \`${table}\` (${keys.map((k) => `\`${k}\``).join(", ")}) VALUES (${keys
    .map(() => "?")
    .join(", ")})`;
  const values = keys.map((k) => (jsonCols.includes(k) ? JSON.stringify(data[k] ?? null) : sqlValue(data[k])));
  const pool = getPool();
  await pool.query(sql, values);
}

export async function updateRow(table: string, id: string, patch: Row): Promise<void> {
  const jsonCols = JSON_COLUMNS[table] ?? [];
  const keys = Object.keys(patch);
  if (!keys.length) return;
  const sql = `UPDATE \`${table}\` SET ${keys.map((k) => `\`${k}\` = ?`).join(", ")} WHERE id = ?`;
  const values = keys.map((k) => (jsonCols.includes(k) ? JSON.stringify(patch[k] ?? null) : sqlValue(patch[k])));
  const pool = getPool();
  await pool.query(sql, [...values, id]);
}

export async function deleteRow(table: string, id: string): Promise<void> {
  const pool = getPool();
  await pool.query(`DELETE FROM \`${table}\` WHERE id = ?`, [id]);
}

/** Insert-or-update by primary key `id` — keeps call sites branch-free. */
export async function upsertRow(table: string, data: Row): Promise<void> {
  const jsonCols = JSON_COLUMNS[table] ?? [];
  const keys = Object.keys(data);
  const insert = `INSERT INTO \`${table}\` (${keys.map((k) => `\`${k}\``).join(", ")}) VALUES (${keys
    .map(() => "?")
    .join(", ")})`;
  const update = keys
    .filter((k) => k !== "id")
    .map((k) => `\`${k}\` = VALUES(\`${k}\`)`)
    .join(", ");
  const sql = update ? `${insert} ON DUPLICATE KEY UPDATE ${update}` : insert;
  const values = keys.map((k) => (jsonCols.includes(k) ? JSON.stringify(data[k] ?? null) : sqlValue(data[k])));
  const pool = getPool();
  await pool.query(sql, values);
}
