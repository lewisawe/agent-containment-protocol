import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "containment.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    scope_attempted TEXT,
    allowed INTEGER,
    trust_delta INTEGER DEFAULT 0,
    trust_after INTEGER DEFAULT 100,
    injection_detected INTEGER DEFAULT 0,
    raw_detail TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS trust (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    score INTEGER DEFAULT 100
  )
`);

db.exec(`INSERT OR IGNORE INTO trust (id, score) VALUES (1, 100)`);

export function getTrustScore(): number {
  return (db.prepare("SELECT score FROM trust WHERE id = 1").get() as any)
    ?.score ?? 100;
}

export function updateTrustScore(delta: number): number {
  const current = getTrustScore();
  const next = Math.max(0, Math.min(100, current + delta));
  db.prepare("UPDATE trust SET score = ? WHERE id = 1").run(next);
  return next;
}

export function logAction(action: {
  type: string;
  description: string;
  scope_attempted?: string;
  allowed?: boolean;
  trust_delta: number;
  injection_detected?: boolean;
  raw_detail?: string;
}): { id: number; trust_after: number } {
  const newScore = updateTrustScore(action.trust_delta);
  const result = db.prepare(`
    INSERT INTO actions (type, description, scope_attempted, allowed, trust_delta, trust_after, injection_detected, raw_detail)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    action.type,
    action.description,
    action.scope_attempted ?? null,
    action.allowed !== undefined ? (action.allowed ? 1 : 0) : null,
    action.trust_delta,
    newScore,
    action.injection_detected ? 1 : 0,
    action.raw_detail ?? null
  );
  return { id: Number(result.lastInsertRowid), trust_after: newScore };
}

export function getActions(limit = 50) {
  return db
    .prepare("SELECT * FROM actions ORDER BY id DESC LIMIT ?")
    .all(limit);
}

export function resetAll() {
  db.exec("DELETE FROM actions");
  db.exec("UPDATE trust SET score = 100 WHERE id = 1");
}

export default db;
