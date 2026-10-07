import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { SQLITE_SCHEMA } from './schema';
import { runSeed } from './seed';

let dbInstance: DatabaseSync | null = null;

export function getStoragePaths() {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless) {
    const tmpDir = os.tmpdir();
    return {
      dbPath: path.join(tmpDir, 'epoch_hub.db'),
      uploadsDir: path.join(tmpDir, 'uploads')
    };
  }

  let dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'epoch_hub.db');
  let uploadsDir = process.env.STORAGE_DIR || path.join(process.cwd(), 'data', 'uploads');

  if (!path.isAbsolute(dbPath)) {
    dbPath = path.resolve(process.cwd(), dbPath);
  }
  if (!path.isAbsolute(uploadsDir)) {
    uploadsDir = path.resolve(process.cwd(), uploadsDir);
  }

  return { dbPath, uploadsDir };
}

export function getDb(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  let { dbPath, uploadsDir } = getStoragePaths();

  // Ensure directories exist with fallback for read-only environments (Vercel serverless)
  try {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (err) {
    // If working directory is read-only, fallback to os.tmpdir()
    const tmpDir = os.tmpdir();
    dbPath = path.join(tmpDir, 'epoch_hub.db');
    uploadsDir = path.join(tmpDir, 'uploads');
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    } catch {}
  }

  // If running in temporary dir and bundled database exists, copy it over
  if (dbPath.startsWith(os.tmpdir()) && !fs.existsSync(dbPath)) {
    const bundledDb = path.join(process.cwd(), 'data', 'epoch_hub.db');
    if (fs.existsSync(bundledDb)) {
      try {
        fs.copyFileSync(bundledDb, dbPath);
      } catch {}
    }
  }

  dbInstance = new DatabaseSync(dbPath);

  // Configure SQLite for high concurrency, memory journal on serverless
  try {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    if (isServerless) {
      dbInstance.exec('PRAGMA journal_mode = MEMORY;');
    } else {
      dbInstance.exec('PRAGMA journal_mode = WAL;');
    }
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    dbInstance.exec('PRAGMA busy_timeout = 5000;');
  } catch (err) {
    console.warn('SQLite pragma warning:', err);
  }

  // Run migrations
  try {
    dbInstance.exec(SQLITE_SCHEMA);
  } catch (err) {
    console.error('Migration schema error:', err);
  }

  // Auto seed on initial startup
  try {
    runSeed(dbInstance);
  } catch (err) {
    console.error('Seed check error:', err);
  }

  return dbInstance;
}

export function query<T = any>(sql: string, params: any[] = []): T[] {
  try {
    const db = getDb();
    const stmt = db.prepare(sql);
    return stmt.all(...params) as T[];
  } catch (err) {
    console.error('SQLite query error on:', sql, err);
    return [];
  }
}

export function queryOne<T = any>(sql: string, params: any[] = []): T | undefined {
  try {
    const db = getDb();
    const stmt = db.prepare(sql);
    return stmt.get(...params) as T | undefined;
  } catch (err) {
    console.error('SQLite queryOne error on:', sql, err);
    return undefined;
  }
}

export function execute(sql: string, params: any[] = []): { changes: number | bigint; lastInsertRowid: number | bigint } {
  try {
    const db = getDb();
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  } catch (err) {
    console.error('SQLite execute error on:', sql, err);
    return { changes: 0, lastInsertRowid: 0 };
  }
}

export function transaction<T>(fn: (db: DatabaseSync) => T): T {
  const db = getDb();
  db.exec('BEGIN IMMEDIATE;');
  try {
    const result = fn(db);
    db.exec('COMMIT;');
    return result;
  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }
}
