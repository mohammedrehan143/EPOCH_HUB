import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { User } from '@/types';

export async function POST(req: Request) {
  try {
    const { role, userId } = await req.json();

    let user: User | undefined;
    if (userId) {
      user = queryOne<User>('SELECT * FROM users WHERE id = ?', [userId]);
    } else if (role) {
      user = queryOne<User>('SELECT * FROM users WHERE role = ? AND is_active = 1 LIMIT 1', [role]);
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const token = await createSessionToken({
      userId: user.id,
      phone: user.phone,
      role: user.role
    });

    setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
