import { transaction } from '../db';
import { checkAndUnlockAchievements } from '../achievements/engine';

export interface AwardPointsResult {
  success: boolean;
  pointsAwarded: number;
  unlockedAchievements: string[];
}

export function awardTaskApprovalPoints(
  submissionId: string,
  reviewerId: string,
  reviewComment?: string
): AwardPointsResult {
  return transaction((db) => {
    const submission = db.prepare(`
      SELECT s.*, t.points, t.title as task_title, t.event_id, t.assigned_member_id
      FROM submissions s
      JOIN tasks t ON s.task_id = t.id
      WHERE s.id = ?
    `).get(submissionId) as any;

    if (!submission) {
      throw new Error('Submission not found');
    }

    const taskId = submission.task_id;
    const userId = submission.user_id;
    const points = submission.points || 5;
    const now = new Date().toISOString();

    // 1. CRITICAL: Check if points have ALREADY been awarded for this task
    const existingAward = db.prepare(`
      SELECT id FROM point_transactions 
      WHERE task_id = ? AND transaction_type = 'TASK_COMPLETION'
    `).get(taskId);

    if (existingAward) {
      throw new Error('Points have already been awarded for this task!');
    }

    // 2. Mark submission as APPROVED
    db.prepare(`
      UPDATE submissions 
      SET status = 'APPROVED', reviewer_id = ?, review_comment = ?, reviewed_at = ?
      WHERE id = ?
    `).run(reviewerId, reviewComment || 'Approved', now, submissionId);

    // 3. Mark task as APPROVED and record completion timestamp
    db.prepare(`
      UPDATE tasks 
      SET status = 'APPROVED', completed_at = ?
      WHERE id = ?
    `).run(now, taskId);

    // 4. Create ledger entry in point_transactions
    const transId = `pt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    db.prepare(`
      INSERT INTO point_transactions (id, user_id, points, transaction_type, reason, task_id, event_id, created_at)
      VALUES (?, ?, ?, 'TASK_COMPLETION', ?, ?, ?, ?)
    `).run(
      transId,
      userId,
      points,
      `Approved: ${submission.task_title}`,
      taskId,
      submission.event_id || null,
      now
    );

    // 5. Check achievements
    const unlockedAchievements = checkAndUnlockAchievements(db, userId, taskId);

    // 6. Send in-app notification to member
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, read, related_entity_type, related_entity_id, created_at)
      VALUES (?, ?, 'submission_approved', 'Submission Approved! 🎉', ?, 0, 'task', ?, ?)
    `).run(
      notifId,
      userId,
      `Your submission for "${submission.task_title}" has been approved! +${points} points awarded.`,
      taskId,
      now
    );

    // 7. Activity Log
    db.prepare(`
      INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, metadata, created_at)
      VALUES (?, ?, 'SUBMISSION_APPROVED', 'task', ?, ?, ?)
    `).run(
      `act-${Date.now()}`,
      reviewerId,
      taskId,
      JSON.stringify({ points, title: submission.task_title, studentId: userId }),
      now
    );

    return {
      success: true,
      pointsAwarded: points,
      unlockedAchievements
    };
  });
}

export function rejectTaskSubmission(
  submissionId: string,
  reviewerId: string,
  rejectionReason: string
) {
  if (!rejectionReason || !rejectionReason.trim()) {
    throw new Error('A rejection reason is required');
  }

  return transaction((db) => {
    const submission = db.prepare(`
      SELECT s.*, t.title as task_title, t.event_id 
      FROM submissions s
      JOIN tasks t ON s.task_id = t.id
      WHERE s.id = ?
    `).get(submissionId) as any;

    if (!submission) {
      throw new Error('Submission not found');
    }

    const taskId = submission.task_id;
    const userId = submission.user_id;
    const now = new Date().toISOString();

    // 1. Mark submission REJECTED
    db.prepare(`
      UPDATE submissions 
      SET status = 'REJECTED', reviewer_id = ?, review_comment = ?, reviewed_at = ?
      WHERE id = ?
    `).run(reviewerId, rejectionReason.trim(), now, submissionId);

    // 2. Mark task REJECTED
    db.prepare(`
      UPDATE tasks 
      SET status = 'REJECTED'
      WHERE id = ?
    `).run(taskId);

    // 3. Send Notification to member
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, read, related_entity_type, related_entity_id, created_at)
      VALUES (?, ?, 'submission_rejected', 'Changes Requested ✏️', ?, 0, 'task', ?, ?)
    `).run(
      notifId,
      userId,
      `Your submission for "${submission.task_title}" requires updates. Feedback: "${rejectionReason}"`,
      taskId,
      now
    );

    // 4. Activity Log
    db.prepare(`
      INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, metadata, created_at)
      VALUES (?, ?, 'SUBMISSION_REJECTED', 'task', ?, ?, ?)
    `).run(
      `act-${Date.now()}`,
      reviewerId,
      taskId,
      JSON.stringify({ reason: rejectionReason, title: submission.task_title }),
      now
    );

    return { success: true };
  });
}

export function checkAndApplyMissedPenalties(): { processedCount: number; penalizedCount: number } {
  return transaction((db) => {
    const now = new Date().toISOString();

    // Find all tasks where deadline has passed, currently in CLAIMED or IN_PROGRESS, and assigned to a member
    const expiredTasks = db.prepare(`
      SELECT id, title, points, deadline, assigned_member_id, event_id 
      FROM tasks 
      WHERE deadline < ? 
        AND status IN ('CLAIMED', 'IN_PROGRESS')
        AND assigned_member_id IS NOT NULL
    `).all(now) as any[];

    let penalizedCount = 0;

    for (const task of expiredTasks) {
      // CRITICAL: Check if penalty has already been applied for this task
      const alreadyPenalized = db.prepare(`
        SELECT id FROM point_transactions 
        WHERE task_id = ? AND transaction_type = 'MISSED_TASK_PENALTY'
      `).get(task.id);

      if (!alreadyPenalized) {
        // Mark task as MISSED
        db.prepare(`UPDATE tasks SET status = 'MISSED' WHERE id = ?`).run(task.id);

        // Deduct 1 point (-1)
        const transId = `pt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        db.prepare(`
          INSERT INTO point_transactions (id, user_id, points, transaction_type, reason, task_id, event_id, created_at)
          VALUES (?, ?, -1, 'MISSED_TASK_PENALTY', ?, ?, ?, ?)
        `).run(
          transId,
          task.assigned_member_id,
          `Missed Deadline: ${task.title}`,
          task.id,
          task.event_id || null,
          now
        );

        // Notify member
        const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        db.prepare(`
          INSERT INTO notifications (id, user_id, type, title, message, read, related_entity_type, related_entity_id, created_at)
          VALUES (?, ?, 'task_missed', 'Deadline Missed ⚠️', ?, 0, 'task', ?, ?)
        `).run(
          notifId,
          task.assigned_member_id,
          `The deadline for "${task.title}" has passed. A 1-point penalty has been applied.`,
          task.id,
          now
        );

        // Activity log
        db.prepare(`
          INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, metadata, created_at)
          VALUES (?, ?, 'TASK_MISSED_PENALTY', 'task', ?, ?, ?)
        `).run(
          `act-${Date.now()}`,
          task.assigned_member_id,
          task.id,
          JSON.stringify({ penalty: -1, title: task.title }),
          now
        );

        penalizedCount++;
      }
    }

    return {
      processedCount: expiredTasks.length,
      penalizedCount
    };
  });
}

export function reversePenalty(transactionId: string, adminId: string, reason: string) {
  return transaction((db) => {
    const origTrans = db.prepare(`
      SELECT * FROM point_transactions WHERE id = ?
    `).get(transactionId) as any;

    if (!origTrans) {
      throw new Error('Transaction not found');
    }

    if (origTrans.transaction_type !== 'MISSED_TASK_PENALTY') {
      throw new Error('Only missed task penalties can be reversed');
    }

    // Check if already reversed
    const alreadyReversed = db.prepare(`
      SELECT id FROM point_transactions 
      WHERE task_id = ? AND transaction_type = 'PENALTY_REVERSAL'
    `).get(origTrans.task_id);

    if (alreadyReversed) {
      throw new Error('This penalty has already been reversed');
    }

    const now = new Date().toISOString();
    const newTransId = `pt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Insert +1 reversal
    db.prepare(`
      INSERT INTO point_transactions (id, user_id, points, transaction_type, reason, task_id, event_id, created_at)
      VALUES (?, ?, 1, 'PENALTY_REVERSAL', ?, ?, ?, ?)
    `).run(
      newTransId,
      origTrans.user_id,
      `Penalty Reversed: ${reason || origTrans.reason}`,
      origTrans.task_id,
      origTrans.event_id,
      now
    );

    // Notify user
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, read, related_entity_type, related_entity_id, created_at)
      VALUES (?, ?, 'points_awarded', 'Penalty Excused / Reversed ✅', ?, 0, 'point_transaction', ?, ?)
    `).run(
      notifId,
      origTrans.user_id,
      `A previous penalty of -1 point was reversed by administrator. Reason: ${reason || 'Excused'}`,
      newTransId,
      now
    );

    return { success: true };
  });
}
