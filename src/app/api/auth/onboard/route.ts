import { NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { User } from '@/types';

export async function POST(req: Request) {
  try {
    const { phone, name, domain_id, position, profile_image } = await req.json();

    if (!phone || !name) {
      return NextResponse.json({ error: 'Phone and Name are required' }, { status: 400 });
    }

    const normalizedPhone = phone.replace(/[\s-]/g, '');
    const userId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const joinDate = now.split('T')[0];

    execute(`
      INSERT INTO users (id, name, phone, profile_image, role, domain_id, position, join_date, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'member', ?, ?, ?, 1, ?, ?)
    `, [
      userId,
      name.trim(),
      normalizedPhone,
      profile_image || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      domain_id || null,
      position || 'Member',
      joinDate,
      now,
      now
    ]);

    const user = queryOne<User>('SELECT * FROM users WHERE id = ?', [userId]);

    const token = await createSessionToken({
      userId,
      phone: normalizedPhone,
      role: 'member'
    });

    setSessionCookie(token);

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Onboarding failed' }, { status: 500 });
  }
}
