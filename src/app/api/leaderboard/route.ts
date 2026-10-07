import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { LeaderboardEntry } from '@/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domainId = searchParams.get('domainId');
    const eventId = searchParams.get('eventId');
    const period = searchParams.get('period') || 'all'; // all, month, semester

    let pointsDateFilter = '';
    const now = new Date();
    if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
      pointsDateFilter = `AND pt.created_at >= '${monthAgo}'`;
    } else if (period === 'semester') {
      const semAgo = new Date(now.getTime() - 120 * 86400000).toISOString();
      pointsDateFilter = `AND pt.created_at >= '${semAgo}'`;
    }

    let eventFilter = '';
    if (eventId) {
      eventFilter = `AND pt.event_id = '${eventId}'`;
    }

    let sql = `
      SELECT 
        u.id as user_id,
        u.name,
        u.profile_image,
        u.role,
        u.domain_id,
        d.name as domain_name,
        COALESCE((
          SELECT SUM(pt.points) 
          FROM point_transactions pt 
          WHERE pt.user_id = u.id ${pointsDateFilter} ${eventFilter}
        ), 0) as total_points,
        (
          SELECT COUNT(*) 
          FROM tasks t 
          WHERE t.assigned_member_id = u.id AND t.status = 'APPROVED'
          ${eventId ? `AND t.event_id = '${eventId}'` : ''}
        ) as completed_tasks
      FROM users u
      LEFT JOIN domains d ON u.domain_id = d.id
      WHERE u.is_active = 1
    `;

    const params: any[] = [];
    if (domainId) {
      sql += ' AND u.domain_id = ?';
      params.push(domainId);
    }

    sql += ' ORDER BY total_points DESC, completed_tasks DESC, u.name ASC';

    const rawEntries = query<any>(sql, params);

    // Compute rank
    const leaderboard: LeaderboardEntry[] = rawEntries.map((entry, index) => ({
      rank: index + 1,
      user_id: entry.user_id,
      name: entry.name,
      profile_image: entry.profile_image,
      domain_id: entry.domain_id,
      domain_name: entry.domain_name,
      role: entry.role,
      total_points: entry.total_points,
      completed_tasks: entry.completed_tasks
    }));

    return NextResponse.json({ leaderboard });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
