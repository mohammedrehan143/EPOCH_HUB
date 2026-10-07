import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ tasks: [], events: [], domains: [], users: [] });
    }

    const term = `%${q}%`;

    const tasks = query(`
      SELECT t.id, t.title, t.points, t.priority, t.status, d.name as domain_name, e.name as event_name
      FROM tasks t
      JOIN domains d ON t.domain_id = d.id
      JOIN events e ON t.event_id = e.id
      WHERE t.title LIKE ? OR t.description LIKE ?
      LIMIT 5
    `, [term, term]);

    const events = query(`
      SELECT id, name, status, start_date, end_date
      FROM events
      WHERE name LIKE ? OR description LIKE ?
      LIMIT 5
    `, [term, term]);

    const domains = query(`
      SELECT id, name, description
      FROM domains
      WHERE name LIKE ? OR description LIKE ?
      LIMIT 5
    `, [term, term]);

    const users = query(`
      SELECT u.id, u.name, u.role, u.position, u.profile_image, d.name as domain_name
      FROM users u
      LEFT JOIN domains d ON u.domain_id = d.id
      WHERE u.is_active = 1 AND (u.name LIKE ? OR u.position LIKE ? OR u.phone LIKE ?)
      LIMIT 5
    `, [term, term, term]);

    return NextResponse.json({ tasks, events, domains, users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
