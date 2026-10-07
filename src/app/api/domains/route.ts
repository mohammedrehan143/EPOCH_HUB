import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { isSuperAdmin } from '@/lib/auth/rbac';
import { Domain } from '@/types';

export async function GET() {
  try {
    const domains = query<Domain>(`
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
      ORDER BY d.name ASC
    `);

    return NextResponse.json({ domains });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: 'Only super admins can create domains' }, { status: 403 });
    }

    const { name, description, head_id, icon } = await req.json();
    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    const id = `dom-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const now = new Date().toISOString();

    execute(`
      INSERT INTO domains (id, name, description, head_id, icon, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, name, description, head_id || null, icon || 'Layers', now]);

    return NextResponse.json({ success: true, domainId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
