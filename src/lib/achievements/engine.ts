import { DatabaseSync } from 'node:sqlite';

export function checkAndUnlockAchievements(db: DatabaseSync, userId: string, taskId?: string): string[] {
  const unlockedAchievements: string[] = [];
  const now = new Date().toISOString();

  // Helper to award achievement
  const grant = (code: string) => {
    const ach = db.prepare('SELECT id, points_reward, title FROM achievements WHERE code = ?').get(code) as { id: string; points_reward: number; title: string } | undefined;
    if (!ach) return;

    const alreadyGranted = db.prepare('SELECT 1 FROM user_achievements WHERE user_id = ? AND achievement_id = ?').get(userId, ach.id);
    if (!alreadyGranted) {
      db.prepare(`
        INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at)
        VALUES (?, ?, ?, ?)
      `).run(`uach-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, userId, ach.id, now);

      // Notification
      db.prepare(`
        INSERT INTO notifications (id, user_id, type, title, message, read, related_entity_type, related_entity_id, created_at)
        VALUES (?, ?, ?, ?, ?, 0, 'achievement', ?, ?)
      `).run(`notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, userId, 'points_awarded', `Achievement Unlocked: ${ach.title}! 🏆`, `You earned the "${ach.title}" achievement badge!`, ach.id, now);

      // Award bonus points if any
      if (ach.points_reward > 0) {
        db.prepare(`
          INSERT INTO point_transactions (id, user_id, points, transaction_type, reason, task_id, event_id, created_at)
          VALUES (?, ?, ?, 'BONUS', ?, ?, NULL, ?)
        `).run(`pt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, userId, ach.points_reward, `Achievement Reward: ${ach.title}`, taskId || null, now);
      }

      unlockedAchievements.push(ach.title);
    }
  };

  // 1. Completed tasks count check
  const countRow = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE assigned_member_id = ? AND status = ?').get(userId, 'APPROVED') as { count: number };
  const completedCount = countRow ? countRow.count : 0;

  if (completedCount >= 1) {
    grant('FIRST_TASK');
  }
  if (completedCount >= 10) {
    grant('TEN_TASKS');
  }

  // 2. Fast executor check
  if (taskId) {
    const task = db.prepare('SELECT deadline, completed_at FROM tasks WHERE id = ?').get(taskId) as { deadline: string; completed_at: string } | undefined;
    if (task && task.deadline && task.completed_at) {
      const deadlineMs = new Date(task.deadline).getTime();
      const completedMs = new Date(task.completed_at).getTime();
      // Completed at least 24 hours (86400000 ms) before deadline
      if (deadlineMs - completedMs >= 86400000) {
        grant('FAST_EXECUTOR');
      }
    }
  }

  return unlockedAchievements;
}
