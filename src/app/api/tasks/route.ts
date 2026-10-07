import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { canCreateTask } from '@/lib/auth/rbac';
import { Task } from '@/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domainId = searchParams.get('domainId');
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const assignedMemberId = searchParams.get('assignedMemberId');

    let sql = `
      SELECT t.*, 
             e.name as event_name, 
             d.name as domain_name,
             u.name as assigned_member_name,
             u.profile_image as assigned_member_avatar,
             c.name as creator_name
      FROM tasks t
      JOIN events e ON t.event_id = e.id
      JOIN domains d ON t.domain_id = d.id
      LEFT JOIN users u ON t.assigned_member_id = u.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (domainId) {
      sql += ' AND t.domain_id = ?';
      params.push(domainId);
    }
    if (eventId) {
      sql += ' AND t.event_id = ?';
      params.push(eventId);
    }
    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }
    if (priority) {
      sql += ' AND t.priority = ?';
      params.push(priority);
    }
    if (assignedMemberId) {
      sql += ' AND t.assigned_member_id = ?';
      params.push(assignedMemberId);
    }
    if (search) {
      sql += ' AND (t.title LIKE ? OR t.description LIKE ? OR e.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY CASE t.priority WHEN "URGENT" THEN 1 WHEN "HIGH" THEN 2 WHEN "MEDIUM" THEN 3 ELSE 4 END, t.deadline ASC';

    const tasks = query<Task>(sql, params);
    return NextResponse.json({ tasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_id, domain_id, title, description, points, priority, deadline } = await req.json();

    if (!canCreateTask(user, domain_id)) {
      return NextResponse.json({ error: 'You do not have permission to create tasks in this domain' }, { status: 403 });
    }

    if (!event_id || !domain_id || !title || !description || !deadline) {
      return NextResponse.json({ error: 'Missing required task fields' }, { status: 400 });
    }

    const taskId = `tsk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    execute(`
      INSERT INTO tasks (id, event_id, domain_id, title, description, points, priority, deadline, status, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE', ?, ?)
    `, [
      taskId,
      event_id,
      domain_id,
      title.trim(),
      description.trim(),
      parseInt(points) || 5,
      priority || 'MEDIUM',
      deadline,
      user.id,
      now
    ]);

    // Send notifications to domain members
    const domainMembers = query<{ id: string }>('SELECT id FROM users WHERE domain_id = ? AND id != ?', [domain_id, user.id]);
    for (const mem of domainMembers) {
      execute(`
        INSERT INTO notifications (id, user_id, type, title, message, read, related_entity_type, related_entity_id, created_at)
        VALUES (?, ?, 'new_task', 'New Task in your Domain! 🚀', ?, 0, 'task', ?, ?)
      `, [
        `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        mem.id,
        `New task "${title}" is available for claim (+${points} pts).`,
        taskId,
        now
      ]);
    }

    return NextResponse.json({ success: true, taskId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
