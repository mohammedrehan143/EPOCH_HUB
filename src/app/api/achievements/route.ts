import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { Achievement } from '@/types';

export async function GET() {
  try {
    const user = await getCurrentUser();

    const rawAchievements = query<any>(`
      SELECT 
        a.*,
        ua.unlocked_at,
        CASE WHEN ua.id IS NOT NULL THEN 1 ELSE 0 END as is_unlocked
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
      ORDER BY a.points_reward ASC
    `, [user?.id || '']);

    const achievements: Achievement[] = rawAchievements.map(a => ({
      id: a.id,
      code: a.code,
      title: a.title,
      description: a.description,
      icon: a.icon,
      points_reward: a.points_reward,
      created_at: a.created_at,
      unlocked: !!a.is_unlocked,
      unlocked_at: a.unlocked_at
    }));

    return NextResponse.json({ achievements });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
