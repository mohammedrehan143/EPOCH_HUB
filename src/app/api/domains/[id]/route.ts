import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { isSuperAdmin } from '@/lib/auth/rbac';
import { Domain, User, Task } from '@/types';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const domain = queryOne<Domain>(`
      SELECT 
        d.*,
        u.name as head_name,
        u.profile_image as head_avatar,
        (SELECT COUNT(*) FROM users WHERE domain_id = d.id AND is_active = 1) as member_count,
        (SELECT COUNT(*) FROM tasks WHERE domain_id = d.id AND status IN ('AVAILABLE', 'CLAIMED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW')) as active_tasks_count,
        (SELECT COUNT(*) FROM tasks WHERE domain_id = d.id AND status = 'APPROVED') as completed_tasks_count,
        COALESCE((
          SELECT SUM(pt.points)
          FROM point_transactions pt
          JOIN users u2 ON pt.user_id = u2.id
          WHERE u2.domain_id = d.id
        ), 0) as total_points
      FROM domains d
      LEFT JOIN users u ON d.head_id = u.id
      WHERE d.id = ?
    `, [params.id]);

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    const members = query<User>(`
      SELECT 
        u.*,
        COALESCE((SELECT SUM(points) FROM point_transactions WHERE user_id = u.id), 0) as total_points,
        (SELECT COUNT(*) FROM tasks WHERE assigned_member_id = u.id AND status = 'APPROVED') as completed_tasks_count
      FROM users u
      WHERE u.domain_id = ? AND u.is_active = 1
      ORDER BY total_points DESC, u.name ASC
    `, [params.id]);

    const tasks = query<Task>(`
      SELECT t.*, e.name as event_name, u.name as assigned_member_name, u.profile_image as assigned_member_avatar
      FROM tasks t
      JOIN events e ON t.event_id = e.id
      LEFT JOIN users u ON t.assigned_member_id = u.id
      WHERE t.domain_id = ?
      ORDER BY t.created_at DESC
    `, [params.id]);

    return NextResponse.json({ domain, members, tasks });
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

    const { name, description, head_id, icon } = await req.json();
    execute(`
      UPDATE domains 
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          head_id = COALESCE(?, head_id),
          icon = COALESCE(?, icon)
      WHERE id = ?
    `, [name, description, head_id, icon, params.id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
