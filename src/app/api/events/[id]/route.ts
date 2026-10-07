import { NextResponse } from 'next/server';
import { query, queryOne, execute, transaction } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { isSuperAdmin } from '@/lib/auth/rbac';
import { Event, Task } from '@/types';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rawEvent = queryOne<any>(`
      SELECT 
        e.*,
        u.name as creator_name,
        (SELECT COUNT(*) FROM tasks WHERE event_id = e.id) as task_count,
        (SELECT COUNT(*) FROM tasks WHERE event_id = e.id AND status = 'APPROVED') as completed_task_count
      FROM events e
      JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `, [params.id]);

    if (!rawEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Participating domains with domain task stats
    const participatingDomains = query<any>(`
      SELECT 
        d.*,
        (SELECT COUNT(*) FROM tasks WHERE event_id = ? AND domain_id = d.id) as domain_task_count,
        (SELECT COUNT(*) FROM tasks WHERE event_id = ? AND domain_id = d.id AND status = 'APPROVED') as domain_completed_task_count
      FROM domains d
      JOIN event_domains ed ON d.id = ed.domain_id
      WHERE ed.event_id = ?
    `, [params.id, params.id, params.id]);

    // Tasks under this event
    const tasks = query<Task>(`
      SELECT 
        t.*, 
        d.name as domain_name,
        u.name as assigned_member_name,
        u.profile_image as assigned_member_avatar
      FROM tasks t
      JOIN domains d ON t.domain_id = d.id
      LEFT JOIN users u ON t.assigned_member_id = u.id
      WHERE t.event_id = ?
      ORDER BY t.priority DESC, t.deadline ASC
    `, [params.id]);

    const progress = rawEvent.task_count > 0 
      ? Math.round((rawEvent.completed_task_count / rawEvent.task_count) * 100) 
      : 0;

    const event: Event = {
      ...rawEvent,
      participating_domains: participatingDomains,
      progress_percentage: progress
    };

    return NextResponse.json({ event, tasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, description, start_date, end_date, status, cover_image, domain_ids } = await req.json();
    const now = new Date().toISOString();

    transaction((db) => {
      db.prepare(`
        UPDATE events 
        SET name = COALESCE(?, name),
            description = COALESCE(?, description),
            start_date = COALESCE(?, start_date),
            end_date = COALESCE(?, end_date),
            status = COALESCE(?, status),
            cover_image = COALESCE(?, cover_image),
            updated_at = ?
        WHERE id = ?
      `).run(name, description, start_date, end_date, status, cover_image, now, params.id);

      if (Array.isArray(domain_ids)) {
        db.prepare('DELETE FROM event_domains WHERE event_id = ?').run(params.id);
        for (const domId of domain_ids) {
          db.prepare('INSERT INTO event_domains (event_id, domain_id) VALUES (?, ?)').run(params.id, domId);
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
