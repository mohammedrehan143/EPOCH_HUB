import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { isSuperAdmin } from '@/lib/auth/rbac';
import { reversePenalty } from '@/lib/points/transactions';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: 'Only administrators can reverse penalties' }, { status: 403 });
    }

    const { transactionId, reason } = await req.json();
    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    reversePenalty(transactionId, user.id, reason || 'Penalty excused by administrator');

    return NextResponse.json({ success: true, message: 'Penalty reversed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to reverse penalty' }, { status: 400 });
  }
}
