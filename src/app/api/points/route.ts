import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { isSuperAdmin } from '@/lib/auth/rbac';
import { PointTransaction } from '@/types';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const eventId = searchParams.get('eventId');
    const type = searchParams.get('type');
    const filter = searchParams.get('filter'); // positive, negative

    let sql = `
      SELECT 
        pt.*,
        u.name as user_name,
        t.title as task_title,
        e.name as event_name
      FROM point_transactions pt
      JOIN users u ON pt.user_id = u.id
      LEFT JOIN tasks t ON pt.task_id = t.id
      LEFT JOIN events e ON pt.event_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // If not super admin, only see own points ledger
    if (!isSuperAdmin(user)) {
      sql += ' AND pt.user_id = ?';
      params.push(user.id);
    } else if (userId) {
      sql += ' AND pt.user_id = ?';
      params.push(userId);
    }

    if (eventId) {
      sql += ' AND pt.event_id = ?';
      params.push(eventId);
    }
    if (type) {
      sql += ' AND pt.transaction_type = ?';
      params.push(type);
    }
    if (filter === 'positive') {
      sql += ' AND pt.points > 0';
    } else if (filter === 'negative') {
      sql += ' AND pt.points < 0';
    }

    sql += ' ORDER BY pt.created_at DESC';

    const transactions = query<PointTransaction>(sql, params);

    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
