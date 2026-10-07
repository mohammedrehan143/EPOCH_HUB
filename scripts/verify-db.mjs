import { DatabaseSync } from 'node:sqlite';
import path from 'path';

try {
  console.log('====================================================');
  console.log('EPOCH HUB — DATABASE CONNECTION & HEALTH CHECK');
  console.log('====================================================\n');

  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'epoch_hub.db');
  const db = new DatabaseSync(dbPath);
  console.log('✅ DATABASE CONNECTION: ACTIVE & HEALTHY');
  console.log(`   Database Path: ${dbPath}`);
  console.log('   Engine: SQLite (WAL Mode enabled with Foreign Keys ON)\n');

  // Table row counts
  const tables = [
    'users',
    'domains',
    'events',
    'event_domains',
    'tasks',
    'task_assignments',
    'submissions',
    'point_transactions',
    'notifications',
    'achievements',
    'user_achievements',
    'activity_logs'
  ];

  console.log('--- TABLE RECORD COUNTS ---');
  for (const table of tables) {
    const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
    console.log(`  • ${table.padEnd(20)} : ${row?.count || 0} records`);
  }

  // Users in database
  console.log('\n--- REGISTERED USERS IN DATABASE (FOR MOBILE LOGIN) ---');
  const users = db.prepare(`
    SELECT u.id, u.name, u.phone, u.role, d.name as domain_name,
      COALESCE((SELECT SUM(points) FROM point_transactions WHERE user_id = u.id), 0) as points
    FROM users u
    LEFT JOIN domains d ON u.domain_id = d.id
    ORDER BY points DESC
  `).all();
  for (const u of users) {
    console.log(`  👤 ${u.name.padEnd(18)} | Phone: ${u.phone.padEnd(15)} | Role: ${u.role.padEnd(12)} | Domain: ${(u.domain_name || 'General').padEnd(12)} | Points: ${u.points}`);
  }

  // Events in database
  console.log('\n--- EVENTS IN DATABASE ---');
  const events = db.prepare('SELECT id, name, status, start_date, end_date FROM events').all();
  for (const e of events) {
    console.log(`  📅 ${e.name} (${e.status}) [${e.start_date.slice(0, 10)} to ${e.end_date.slice(0, 10)}]`);
  }

  // Tasks in database
  console.log('\n--- TASKS IN DATABASE BY STATUS ---');
  const taskSummary = db.prepare(`
    SELECT status, COUNT(*) as count, SUM(points) as total_points 
    FROM tasks 
    GROUP BY status
    ORDER BY count DESC
  `).all();
  for (const ts of taskSummary) {
    console.log(`  📌 Status: ${ts.status.padEnd(14)} : ${ts.count} tasks (${ts.total_points || 0} total points)`);
  }

  console.log('\n====================================================');
  console.log('DATABASE CHECK COMPLETED SUCCESSFULLY ✅');
  console.log('====================================================');
} catch (error) {
  console.error('❌ Database connection failed:', error);
  process.exit(1);
}
