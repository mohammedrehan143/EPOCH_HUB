import { NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Valid phone number is required' }, { status: 400 });
    }

    // Normalize phone (strip spaces, dashes)
    const normalizedPhone = phone.replace(/[\s-]/g, '');
    if (normalizedPhone.length < 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number' }, { status: 400 });
    }

    // Default development OTP or generate
    const otp = process.env.DEV_OTP || '123456';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins
    const now = new Date().toISOString();

    // Store in otps table
    execute(`
      INSERT INTO otps (phone, otp, expires_at, created_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(phone) DO UPDATE SET otp = excluded.otp, expires_at = excluded.expires_at, created_at = excluded.created_at
    `, [normalizedPhone, otp, expiresAt, now]);

    // Check if user already exists
    const existingUser = queryOne('SELECT id, name, role FROM users WHERE phone = ?', [normalizedPhone]);

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${normalizedPhone}`,
      isExistingUser: !!existingUser,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error: any) {
    console.error('send-otp error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
  }
}
