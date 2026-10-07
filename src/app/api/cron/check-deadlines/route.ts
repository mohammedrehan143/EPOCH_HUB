import { NextResponse } from 'next/server';
import { checkAndApplyMissedPenalties } from '@/lib/points/transactions';

export async function POST() {
  try {
    const result = checkAndApplyMissedPenalties();
    return NextResponse.json({
      success: true,
      message: `Deadlines evaluated. ${result.penalizedCount} tasks penalized out of ${result.processedCount} expired tasks.`,
      ...result
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  // Allow GET for simple webhook/cron invocations
  return POST();
}
