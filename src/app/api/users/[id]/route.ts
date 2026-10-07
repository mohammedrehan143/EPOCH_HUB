import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { isSuperAdmin } from '@/lib/auth/rbac';
import { User, Task, Achievement, PointTransaction } from '@/types';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = queryOne<User>(`
      SELECT 
        u.*,
        d.name as domain_name,
        COALESCE((SELECT SUM(points) FROM point_transactions WHERE user_id = u.id), 0) as total_points,
        (SELECT COUNT(*) FROM tasks WHERE assigned_member_id = u.id AND status = 'APPROVED') as completed_tasks_count,
        (SELECT COUNT(*) FROM tasks WHERE assigned_member_id = u.id AND status IN ('CLAIMED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW')) as pending_tasks_count
      FROM users u
      LEFT JOIN domains d ON u.domain_id = d.id
      WHERE u.id = ?
    `, [params.id]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Rank calculation
    const rankRow = queryOne<{ rank: number }>(`
      WITH ranked AS (
        SELECT u.id, DENSE_RANK() OVER (ORDER BY COALESCE(SUM(pt.points), 0) DESC) as rk
        FROM users u
        LEFT JOIN point_transactions pt ON u.id = pt.user_id
        WHERE u.is_active = 1
        GROUP BY u.id
      )
      SELECT rk as rank FROM ranked WHERE id = ?
    `, [params.id]);

    const completedTasks = query<Task>(`
      SELECT t.*, e.name as event_name, d.name as domain_name
      FROM tasks t
      JOIN events e ON t.event_id = e.id
      JOIN domains d ON t.domain_id = d.id
      WHERE t.assigned_member_id = ? AND t.status = 'APPROVED'
      ORDER BY t.completed_at DESC
    `, [params.id]);

    const achievements = query<Achievement>(`
      SELECT a.*, ua.unlocked_at
      FROM achievements a
      JOIN user_achievements ua ON a.id = ua.achievement_id
      WHERE ua.user_id = ?
      ORDER BY ua.unlocked_at DESC
    `, [params.id]);

    const recentPoints = query<PointTransaction>(`
      SELECT pt.*, t.title as task_title, e.name as event_name
      FROM point_transactions pt
      LEFT JOIN tasks t ON pt.task_id = t.id
      LEFT JOIN events e ON pt.event_id = e.id
      WHERE pt.user_id = ?
      ORDER BY pt.created_at DESC
      LIMIT 10
    `, [params.id]);

    return NextResponse.json({
      user: {
        ...user,
        rank: rankRow ? rankRow.rank : null
      },
      completedTasks,
      achievements,
      recentPoints
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, domain_id, role, position, profile_image, is_active } = await req.json();

    // Only super_admin can change role, domain, or deactivation status
    if ((role || domain_id !== undefined || is_active !== undefined) && !isSuperAdmin(currentUser)) {
      return NextResponse.json({ error: 'Only administrators can update roles or status' }, { status: 403 });
    }

    // Users can only edit their own name or profile photo unless they are admin
    if (params.id !== currentUser.id && !isSuperAdmin(currentUser)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date().toISOString();
    execute(`
      UPDATE users 
      SET name = COALESCE(?, name),
          domain_id = COALESCE(?, domain_id),
          role = COALESCE(?, role),
          position = COALESCE(?, position),
          profile_image = COALESCE(?, profile_image),
          is_active = COALESCE(?, is_active),
          updated_at = ?
      WHERE id = ?
    `, [name, domain_id, role, position, profile_image, is_active, now, params.id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const POST = PATCH;
