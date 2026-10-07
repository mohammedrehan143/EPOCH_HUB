import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { isReviewer } from '@/lib/auth/rbac';
import { Submission } from '@/types';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const domainId = searchParams.get('domainId');
    const userId = searchParams.get('userId');

    let sql = `
      SELECT s.*, 
             u.name as user_name, 
             u.profile_image as user_avatar,
             t.title as task_title,
             t.points as task_points,
             t.domain_id,
             d.name as domain_name,
             e.name as event_name,
             r.name as reviewer_name
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      JOIN tasks t ON s.task_id = t.id
      JOIN domains d ON t.domain_id = d.id
      JOIN events e ON t.event_id = e.id
      LEFT JOIN users r ON s.reviewer_id = r.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Non-reviewers can only see their own submissions
    if (!isReviewer(user)) {
      sql += ' AND s.user_id = ?';
      params.push(user.id);
    } else if (userId) {
      sql += ' AND s.user_id = ?';
      params.push(userId);
    }

    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }
    if (domainId) {
      sql += ' AND t.domain_id = ?';
      params.push(domainId);
    }

    sql += ' ORDER BY s.submitted_at DESC';

    const submissions = query<Submission>(sql, params);
    return NextResponse.json({ submissions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
