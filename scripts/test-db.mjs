import { getDb, query } from '../src/lib/db/index.ts';

try {
  const db = getDb();
  console.log('Database initialized successfully!');
  const users = query('SELECT id, name, phone, role FROM users');
  console.log(`Loaded ${users.length} users:`, users.map(u => `${u.name} (${u.role})`));
  const tasks = query('SELECT id, title, status, points FROM tasks');
  console.log(`Loaded ${tasks.length} tasks.`);
} catch (e) {
  console.error('Database test failed:', e);
  process.exit(1);
}
