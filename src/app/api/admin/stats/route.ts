import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { isSuperAdmin } from '@/lib/auth/rbac';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const membersCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM users WHERE is_active = 1')?.count || 0;
    const domainsCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM domains')?.count || 0;
    const activeEventsCount = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM events WHERE status = 'Active'")?.count || 0;
    const activeTasksCount = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM tasks WHERE status IN ('AVAILABLE', 'CLAIMED', 'IN_PROGRESS')")?.count || 0;
    const pendingReviewsCount = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM submissions WHERE status = 'UNDER_REVIEW'")?.count || 0;
    const completedTasksCount = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM tasks WHERE status = 'APPROVED'")?.count || 0;
    const missedTasksCount = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM tasks WHERE status = 'MISSED'")?.count || 0;
    const totalPointsDistributed = queryOne<{ total: number }>("SELECT SUM(points) as total FROM point_transactions WHERE points > 0")?.total || 0;

    // Domain activity breakdown
    const domainStats = query(`
      SELECT 
        d.id,
        d.name,
        COUNT(t.id) as total_tasks,
        SUM(CASE WHEN t.status = 'APPROVED' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN t.status = 'MISSED' THEN 1 ELSE 0 END) as missed_tasks,
        COALESCE(SUM(CASE WHEN pt.points > 0 THEN pt.points ELSE 0 END), 0) as points_earned
      FROM domains d
      LEFT JOIN tasks t ON d.id = t.domain_id
      LEFT JOIN point_transactions pt ON t.id = pt.task_id
      GROUP BY d.id
      ORDER BY total_tasks DESC
    `);

    // Event progress breakdown
    const eventStats = query(`
      SELECT 
        e.id,
        e.name,
        e.status,
        COUNT(t.id) as total_tasks,
        SUM(CASE WHEN t.status = 'APPROVED' THEN 1 ELSE 0 END) as completed_tasks
      FROM events e
      LEFT JOIN tasks t ON e.id = t.event_id
      GROUP BY e.id
      ORDER BY e.start_date DESC
    `);

    return NextResponse.json({
      overview: {
        totalMembers: membersCount,
        totalDomains: domainsCount,
        activeEvents: activeEventsCount,
        activeTasks: activeTasksCount,
        pendingReviews: pendingReviewsCount,
        completedTasks: completedTasksCount,
        missedTasks: missedTasksCount,
        totalPointsDistributed
      },
      domainStats,
      eventStats
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
