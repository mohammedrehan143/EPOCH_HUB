import { NextResponse } from 'next/server';
import { query, execute, transaction } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { isSuperAdmin } from '@/lib/auth/rbac';
import { Event } from '@/types';

export async function GET() {
  try {
    const rawEvents = query<any>(`
      SELECT 
        e.*,
        u.name as creator_name,
        (SELECT COUNT(*) FROM tasks WHERE event_id = e.id) as task_count,
        (SELECT COUNT(*) FROM tasks WHERE event_id = e.id AND status = 'APPROVED') as completed_task_count
      FROM events e
      JOIN users u ON e.created_by = u.id
      ORDER BY 
        CASE e.status 
          WHEN 'Active' THEN 1 
          WHEN 'Upcoming' THEN 2 
          WHEN 'Completed' THEN 3 
          ELSE 4 
        END, 
        e.start_date ASC
    `);

    const events: Event[] = rawEvents.map(evt => {
      const domains = query<any>(`
        SELECT d.* 
        FROM domains d
        JOIN event_domains ed ON d.id = ed.domain_id
        WHERE ed.event_id = ?
      `, [evt.id]);

      const progress = evt.task_count > 0 
        ? Math.round((evt.completed_task_count / evt.task_count) * 100) 
        : 0;

      return {
        ...evt,
        participating_domains: domains,
        progress_percentage: progress
      };
    });

    return NextResponse.json({ events });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: 'Only administrators can create events' }, { status: 403 });
    }

    const { name, description, start_date, end_date, status, cover_image, domain_ids } = await req.json();

    if (!name || !description || !start_date || !end_date) {
      return NextResponse.json({ error: 'Name, description, start date, and end date are required' }, { status: 400 });
    }

    const eventId = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    transaction((db) => {
      db.prepare(`
        INSERT INTO events (id, name, description, start_date, end_date, status, cover_image, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        eventId,
        name.trim(),
        description.trim(),
        start_date,
        end_date,
        status || 'Active',
        cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        user.id,
        now,
        now
      );

      if (Array.isArray(domain_ids)) {
        for (const domId of domain_ids) {
          db.prepare('INSERT INTO event_domains (event_id, domain_id) VALUES (?, ?)').run(eventId, domId);
        }
      }

      // Activity log
      db.prepare(`
        INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, metadata, created_at)
        VALUES (?, ?, 'EVENT_CREATED', 'event', ?, ?, ?)
      `).run(
        `act-${Date.now()}`,
        user.id,
        eventId,
        JSON.stringify({ name }),
        now
      );
    });

    return NextResponse.json({ success: true, eventId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
