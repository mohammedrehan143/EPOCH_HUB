import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { isSuperAdmin, isDomainHead } from '@/lib/auth/rbac';
import { Task, Submission } from '@/types';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = queryOne<Task>(`
      SELECT t.*, 
             e.name as event_name, 
             d.name as domain_name,
             u.name as assigned_member_name,
             u.profile_image as assigned_member_avatar,
             u.phone as assigned_member_phone,
             c.name as creator_name
      FROM tasks t
      JOIN events e ON t.event_id = e.id
      JOIN domains d ON t.domain_id = d.id
      LEFT JOIN users u ON t.assigned_member_id = u.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.id = ?
    `, [params.id]);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const submissions = query<Submission>(`
      SELECT s.*, 
             u.name as user_name, 
             u.profile_image as user_avatar,
             r.name as reviewer_name
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN users r ON s.reviewer_id = r.id
      WHERE s.task_id = ?
      ORDER BY s.version DESC, s.submitted_at DESC
    `, [params.id]);

    return NextResponse.json({ task, submissions });
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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = queryOne<Task>('SELECT * FROM tasks WHERE id = ?', [params.id]);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (!isSuperAdmin(user) && !isDomainHead(user, task.domain_id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = await req.json();
    const allowedFields = ['title', 'description', 'points', 'priority', 'deadline', 'status', 'assigned_member_id'];
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fieldsToUpdate.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    if (fieldsToUpdate.length === 0) {
      return NextResponse.json({ message: 'No fields to update' });
    }

    values.push(params.id);
    execute(`UPDATE tasks SET ${fieldsToUpdate.join(', ')} WHERE id = ?`, values);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: 'Only administrators can delete tasks' }, { status: 403 });
    }

    execute('DELETE FROM tasks WHERE id = ?', [params.id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
