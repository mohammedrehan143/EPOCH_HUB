import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { isReviewer } from '@/lib/auth/rbac';
import { awardTaskApprovalPoints, rejectTaskSubmission } from '@/lib/points/transactions';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, reviewComment } = await req.json();

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Action must be APPROVE or REJECT' }, { status: 400 });
    }

    // Fetch submission with task domain
    const submission = queryOne<any>(`
      SELECT s.*, t.domain_id 
      FROM submissions s
      JOIN tasks t ON s.task_id = t.id
      WHERE s.id = ?
    `, [params.id]);

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Role check
    if (!isReviewer(user, submission.domain_id)) {
      return NextResponse.json({ error: 'You are not authorized to review this submission' }, { status: 403 });
    }

    // Critical: members cannot approve or review their own submission
    if (submission.user_id === user.id) {
      return NextResponse.json({ error: 'You cannot review or approve your own submission!' }, { status: 403 });
    }

    if (action === 'APPROVE') {
      const result = awardTaskApprovalPoints(params.id, user.id, reviewComment);
      return NextResponse.json({
        success: true,
        action: 'APPROVED',
        pointsAwarded: result.pointsAwarded,
        unlockedAchievements: result.unlockedAchievements
      });
    } else {
      if (!reviewComment || !reviewComment.trim()) {
        return NextResponse.json({ error: 'A rejection reason is required' }, { status: 400 });
      }
      rejectTaskSubmission(params.id, user.id, reviewComment);
      return NextResponse.json({
        success: true,
        action: 'REJECTED'
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Review processing failed' }, { status: 400 });
  }
}
