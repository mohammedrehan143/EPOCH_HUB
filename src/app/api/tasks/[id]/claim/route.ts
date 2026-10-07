import { NextResponse } from 'next/server';
import { transaction } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to claim tasks' }, { status: 401 });
    }

    const taskId = params.id;
    const now = new Date().toISOString();

    const claimResult = transaction((db) => {
      // Check current task status
      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as any;
      if (!task) {
        throw new Error('Task not found');
      }

      if (task.status !== 'AVAILABLE') {
        throw new Error(`This task is no longer available (current status: ${task.status})`);
      }

      // Atomic update: only if status is still AVAILABLE (race condition safeguard)
      const updateResult = db.prepare(`
        UPDATE tasks 
        SET status = 'CLAIMED', assigned_member_id = ? 
        WHERE id = ? AND status = 'AVAILABLE'
      `).run(user.id, taskId);

      if (updateResult.changes === 0) {
        throw new Error('Another member has just claimed this task! Please refresh.');
      }

      // Insert assignment record
      const assignmentId = `asg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      db.prepare(`
        INSERT INTO task_assignments (id, task_id, user_id, assigned_at, status)
        VALUES (?, ?, ?, ?, 'ACTIVE')
      `).run(assignmentId, taskId, user.id, now);

      // Notification
      const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      db.prepare(`
        INSERT INTO notifications (id, user_id, type, title, message, read, related_entity_type, related_entity_id, created_at)
        VALUES (?, ?, 'task_claimed', 'Task Claimed! 🎯', ?, 0, 'task', ?, ?)
      `).run(
        notifId,
        user.id,
        `You successfully claimed "${task.title}". Complete and submit your work before the deadline!`,
        taskId,
        now
      );

      // Activity log
      db.prepare(`
        INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, metadata, created_at)
        VALUES (?, ?, 'TASK_CLAIMED', 'task', ?, ?, ?)
      `).run(
        `act-${Date.now()}`,
        user.id,
        taskId,
        JSON.stringify({ title: task.title, points: task.points }),
        now
      );

      return { success: true, taskTitle: task.title };
    });

    return NextResponse.json(claimResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to claim task' }, { status: 400 });
  }
}
