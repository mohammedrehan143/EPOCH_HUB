import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { queryOne } from '../db';
import { User } from '@/types';

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'epoch_hub_super_secret_jwt_key_2026_production_grade_32bytes_min'
);

const COOKIE_NAME = 'epoch_session';

export interface SessionPayload {
  userId: string;
  phone: string;
  role: string;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.userId) return null;

    const user = queryOne<User>(`
      SELECT u.*, d.name as domain_name,
        COALESCE((SELECT SUM(points) FROM point_transactions WHERE user_id = u.id), 0) as total_points,
        (SELECT COUNT(*) FROM tasks WHERE assigned_member_id = u.id AND status = 'APPROVED') as completed_tasks_count,
        (SELECT COUNT(*) FROM tasks WHERE assigned_member_id = u.id AND status IN ('CLAIMED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW')) as pending_tasks_count
      FROM users u
      LEFT JOIN domains d ON u.domain_id = d.id
      WHERE u.id = ? AND u.is_active = 1
    `, [payload.userId]);

    return user || null;
  } catch {
    return null;
  }
}

export function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  });
}

export function deleteSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}
