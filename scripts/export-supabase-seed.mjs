import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'epoch_hub.db');
const db = new DatabaseSync(dbPath);

const tables = [
  'domains',
  'users',
  'events',
  'event_domains',
  'achievements',
  'tasks',
  'task_assignments',
  'submissions',
  'point_transactions',
  'user_achievements',
  'notifications',
  'activity_logs'
];

let sql = `-- =========================================================
-- EPOCH HUB — FULL PRODUCTION DEMO DATA SEED SCRIPT
-- Generated from local Epoch Hub SQLite Database
-- Run this in your Supabase SQL Editor to populate all tables
-- =========================================================

`;

for (const table of tables) {
  const rows = db.prepare(`SELECT * FROM ${table}`).all();
  if (!rows || rows.length === 0) continue;

  sql += `-- ---------------------------------------------------------\n`;
  sql += `-- Table: ${table} (${rows.length} records)\n`;
  sql += `-- ---------------------------------------------------------\n`;

  const cols = Object.keys(rows[0]);
  const colList = cols.join(', ');

  for (const row of rows) {
    const valList = cols.map(c => {
      const v = row[c];
      if (v === null || v === undefined) return 'NULL';
      if (typeof v === 'number') return v;
      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
      // String escape single quotes
      return `'${String(v).replace(/'/g, "''")}'`;
    }).join(', ');

    sql += `INSERT INTO public.${table} (${colList}) VALUES (${valList}) ON CONFLICT DO NOTHING;\n`;
  }
  sql += '\n';
}

// Also update domain head_ids if any
const domainHeads = db.prepare(`SELECT id, head_id FROM domains WHERE head_id IS NOT NULL`).all();
if (domainHeads && domainHeads.length > 0) {
  sql += `-- Update Domain Heads\n`;
  for (const dh of domainHeads) {
    sql += `UPDATE public.domains SET head_id = '${dh.head_id}' WHERE id = '${dh.id}';\n`;
  }
  sql += '\n';
}

const outputPath = path.join(process.cwd(), 'supabase', 'seed.sql');
fs.writeFileSync(outputPath, sql, 'utf-8');
console.log(`✅ Successfully generated ${outputPath} with all demo records!`);
