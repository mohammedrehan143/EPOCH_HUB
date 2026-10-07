import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { Notification } from '@/types';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const notifications = query<Notification>(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [user.id]);

    const unreadRow = query<{ count: number }>(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = ? AND read = 0
    `, [user.id])[0];

    return NextResponse.json({
      notifications,
      unreadCount: unreadRow ? unreadRow.count : 0
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, markAllRead } = await req.json();

    if (markAllRead) {
      execute('UPDATE notifications SET read = 1 WHERE user_id = ?', [user.id]);
    } else if (id) {
      execute('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?', [id, user.id]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
