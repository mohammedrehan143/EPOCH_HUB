import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { isSuperAdmin } from '@/lib/auth/rbac';
import { User } from '@/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domainId = searchParams.get('domainId');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    let sql = `
      SELECT 
        u.*,
        d.name as domain_name,
        COALESCE((SELECT SUM(points) FROM point_transactions WHERE user_id = u.id), 0) as total_points,
        (SELECT COUNT(*) FROM tasks WHERE assigned_member_id = u.id AND status = 'APPROVED') as completed_tasks_count,
        (SELECT COUNT(*) FROM tasks WHERE assigned_member_id = u.id AND status IN ('CLAIMED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW')) as pending_tasks_count
      FROM users u
      LEFT JOIN domains d ON u.domain_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (domainId) {
      sql += ' AND u.domain_id = ?';
      params.push(domainId);
    }
    if (role) {
      sql += ' AND u.role = ?';
      params.push(role);
    }
    if (search) {
      sql += ' AND (u.name LIKE ? OR u.phone LIKE ? OR u.position LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY total_points DESC, u.name ASC';

    const users = query<User>(sql, params);
    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
