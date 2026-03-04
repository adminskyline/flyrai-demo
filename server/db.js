import initSqlJs from "sql.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "data", "flyrai.db");

// Ensure data dir exists
const dataDir = join(__dirname, "data");
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

let db;

export async function initDB() {
  const SQL = await initSqlJs();
  if (existsSync(DB_PATH)) {
    const buf = readFileSync(DB_PATH);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }

  db.run("PRAGMA foreign_keys = ON");

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      account_type TEXT NOT NULL CHECK(account_type IN ('lo','realtor')),
      name TEXT NOT NULL DEFAULT '',
      title TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      company TEXT DEFAULT '',
      nmls TEXT DEFAULT '',
      company_nmls TEXT DEFAULT '',
      license TEXT DEFAULT '',
      states TEXT DEFAULT '["FL"]',
      headshot_url TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id INTEGER PRIMARY KEY REFERENCES users(id),
      ai_provider TEXT DEFAULT NULL,
      api_key_enc TEXT DEFAULT NULL,
      api_key_iv TEXT DEFAULT NULL
    )
  `);

  // Add logo_url column to users
  try {
    db.run("ALTER TABLE users ADD COLUMN logo_url TEXT DEFAULT NULL");
  } catch { /* column already exists */ }

  // Add pexels_key columns (sql.js lacks IF NOT EXISTS for columns)
  try {
    db.run("ALTER TABLE user_settings ADD COLUMN pexels_key_enc TEXT DEFAULT NULL");
  } catch { /* column already exists */ }
  try {
    db.run("ALTER TABLE user_settings ADD COLUMN pexels_key_iv TEXT DEFAULT NULL");
  } catch { /* column already exists */ }

  db.run(`
    CREATE TABLE IF NOT EXISTS saved_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      item_type TEXT NOT NULL CHECK(item_type IN ('flyer','playbook')),
      asset_id TEXT NOT NULL,
      label TEXT DEFAULT '',
      generated_data TEXT NOT NULL,
      property_data TEXT DEFAULT NULL,
      profile_data TEXT NOT NULL,
      partner_data TEXT DEFAULT NULL,
      settings_data TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  save();
  return db;
}

export function save() {
  if (!db) return;
  const data = db.export();
  writeFileSync(DB_PATH, Buffer.from(data));
}

// Helper: run a statement and return { lastInsertRowid, changes }
export function run(sql, params = []) {
  db.run(sql, params);
  const result = db.exec("SELECT last_insert_rowid() as id, changes() as changes");
  save();
  return {
    lastInsertRowid: result[0]?.values[0][0],
    changes: result[0]?.values[0][1],
  };
}

// Helper: get one row as object
export function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const cols = stmt.getColumnNames();
    const vals = stmt.get();
    stmt.free();
    const row = {};
    cols.forEach((c, i) => (row[c] = vals[i]));
    return row;
  }
  stmt.free();
  return null;
}

// Helper: get all rows as array of objects
export function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  const cols = stmt.getColumnNames();
  while (stmt.step()) {
    const vals = stmt.get();
    const row = {};
    cols.forEach((c, i) => (row[c] = vals[i]));
    rows.push(row);
  }
  stmt.free();
  return rows;
}

export default { initDB, run, get, all, save };
