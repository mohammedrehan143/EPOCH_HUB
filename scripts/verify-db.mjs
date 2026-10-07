import { getDb, query, queryOne } from '../src/lib/db/index.ts';

try {
  console.log('====================================================');
  console.log('EPOCH HUB — DATABASE CONNECTION & HEALTH CHECK');
  console.log('====================================================\n');

  const db = getDb();
  console.log('✅ DATABASE CONNECTION: ACTIVE & HEALTHY');
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
    const row = queryOne(`SELECT COUNT(*) as count FROM ${table}`);
    console.log(`  • ${table.padEnd(20)} : ${row?.count || 0} records`);
  }

  // Users in database
  console.log('\n--- REGISTERED USERS IN DATABASE (FOR MOBILE LOGIN) ---');
  const users = query(`
    SELECT u.id, u.name, u.phone, u.role, d.name as domain_name,
      COALESCE((SELECT SUM(points) FROM point_transactions WHERE user_id = u.id), 0) as points
    FROM users u
    LEFT JOIN domains d ON u.domain_id = d.id
    ORDER BY points DESC
  `);
  for (const u of users) {
    console.log(`  👤 ${u.name.padEnd(18)} | Phone: ${u.phone.padEnd(15)} | Role: ${u.role.padEnd(12)} | Domain: ${(u.domain_name || 'General').padEnd(12)} | Points: ${u.points}`);
  }

  // Events in database
  console.log('\n--- EVENTS IN DATABASE ---');
  const events = query('SELECT id, name, status, start_date, end_date FROM events');
  for (const e of events) {
    console.log(`  📅 ${e.name} (${e.status}) [${e.start_date.slice(0, 10)} to ${e.end_date.slice(0, 10)}]`);
  }

  // Tasks in database
  console.log('\n--- TASKS IN DATABASE BY STATUS ---');
  const taskSummary = query(`
    SELECT status, COUNT(*) as count, SUM(points) as total_points 
    FROM tasks 
    GROUP BY status
  `);
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
