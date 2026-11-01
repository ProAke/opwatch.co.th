// Shared helpers for the CLI scripts (no framework dependency).
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

export function loadEnv() {
  const file = path.join(process.cwd(), ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

export function config({ withDatabase = true } = {}) {
  loadEnv();
  const required = ["DB_HOST", "DB_USER", "DB_NAME"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`✗ ไม่พบค่า ${missing.join(", ")} — ตั้งค่าใน .env ก่อน (ดู .env.example)`);
    process.exit(1);
  }
  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: withDatabase ? process.env.DB_NAME : undefined,
    multipleStatements: true,
    charset: "utf8mb4",
  };
}

export const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/;

export function sqlValue(v) {
  if (v === undefined || v === null) return null;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "string" && ISO_RE.test(v)) {
    return new Date(v).toISOString().slice(0, 19).replace("T", " ");
  }
  if (v instanceof Date) return v.toISOString().slice(0, 19).replace("T", " ");
  if (typeof v === "object") return JSON.stringify(v);
  return v;
}

export async function connect(options) {
  return mysql.createConnection(options);
}
