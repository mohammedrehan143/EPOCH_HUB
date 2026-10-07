import { NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { User } from '@/types';

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
    }

    const normalizedPhone = phone.replace(/[\s-]/g, '');

    // Verify OTP against otps table
    const storedOtp = queryOne<{ phone: string; otp: string; expires_at: string }>(
      'SELECT * FROM otps WHERE phone = ?',
      [normalizedPhone]
    );

    const isDevFallback = process.env.NODE_ENV !== 'production' && otp === '123456';

    if (!isDevFallback) {
      if (!storedOtp) {
        return NextResponse.json({ error: 'No OTP requested for this phone number' }, { status: 400 });
      }

      if (storedOtp.otp !== otp) {
        return NextResponse.json({ error: 'Invalid OTP entered. Please try again.' }, { status: 400 });
      }

      if (new Date(storedOtp.expires_at).getTime() < Date.now()) {
        return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
      }
    }

    // Clean up used OTP
    execute('DELETE FROM otps WHERE phone = ?', [normalizedPhone]);

    // Check if user exists
    let user = queryOne<User>('SELECT * FROM users WHERE phone = ?', [normalizedPhone]);

    if (!user) {
      // New user! Return requiresOnboarding flag so the frontend redirects to profile setup
      return NextResponse.json({
        success: true,
        requiresOnboarding: true,
        phone: normalizedPhone
      });
    }

    if (user.is_active === 0) {
      return NextResponse.json({ error: 'Account is deactivated. Contact a club administrator.' }, { status: 403 });
    }

    // Generate JWT token and set HTTP-only cookie
    const token = await createSessionToken({
      userId: user.id,
      phone: user.phone,
      role: user.role
    });

    setSessionCookie(token);

    return NextResponse.json({
      success: true,
      requiresOnboarding: false,
      user
    });
  } catch (error: any) {
    console.error('verify-otp error:', error);
    return NextResponse.json({ error: error.message || 'OTP verification failed' }, { status: 500 });
  }
}
