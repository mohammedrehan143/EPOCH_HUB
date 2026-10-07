import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { User } from '@/types';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json({ error: 'Please enter your registered mobile number' }, { status: 400 });
    }

    // Clean up input
    const rawDigits = phone.replace(/\D/g, '');
    const cleanPhone = phone.trim().replace(/[\s-]/g, '');

    // Search by exact phone, with +91, without +91, or matching last 10 digits
    const user = queryOne<User>(`
      SELECT * FROM users 
      WHERE phone = ? 
         OR phone = ?
         OR phone = ?
         OR phone LIKE ?
      LIMIT 1
    `, [
      cleanPhone,
      `+91${rawDigits.slice(-10)}`,
      rawDigits.slice(-10),
      `%${rawDigits.slice(-10)}`
    ]);

    if (!user) {
      return NextResponse.json({
        error: `Mobile number (${phone}) not found in Epoch club database. Only registered club members can access the hub.`
      }, { status: 404 });
    }

    if (user.is_active === 0) {
      return NextResponse.json({
        error: 'Your account has been deactivated. Please contact a club administrator.'
      }, { status: 403 });
    }

    // Generate authenticated session token
    const token = await createSessionToken({
      userId: user.id,
      phone: user.phone,
      role: user.role
    });

    setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user
    });
  } catch (error: any) {
    console.error('phone-login error:', error);
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
