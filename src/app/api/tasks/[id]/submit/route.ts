import { NextResponse } from 'next/server';
import { transaction } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { saveUploadedFile } from '@/lib/storage/file-manager';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to submit work' }, { status: 401 });
    }

    const taskId = params.id;
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const comment = (formData.get('comment') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'Please select a file to upload' }, { status: 400 });
    }

    // Save file securely to object storage
    const savedFile = await saveUploadedFile(file, user.id, taskId);
    const now = new Date().toISOString();

    const submissionResult = transaction((db) => {
      // Validate task ownership
      const task = db.prepare(`
        SELECT t.*, d.head_id as domain_head_id 
        FROM tasks t
        JOIN domains d ON t.domain_id = d.id
        WHERE t.id = ?
      `).get(taskId) as any;

      if (!task) {
        throw new Error('Task not found');
      }

      if (task.assigned_member_id !== user.id) {
        throw new Error('You can only submit work for tasks assigned to you');
      }

      const validStatuses = ['CLAIMED', 'IN_PROGRESS', 'REJECTED'];
      if (!validStatuses.includes(task.status)) {
        throw new Error(`Cannot submit for task in status "${task.status}"`);
      }

      // Check current max version
      const versionRow = db.prepare('SELECT MAX(version) as max_v FROM submissions WHERE task_id = ?').get(taskId) as any;
      const nextVersion = (versionRow?.max_v || 0) + 1;

      // Insert submission
      const subId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      db.prepare(`
        INSERT INTO submissions (id, task_id, user_id, file_url, file_name, file_type, file_size, comment, status, submitted_at, version)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'UNDER_REVIEW', ?, ?)
      `).run(
        subId,
        taskId,
        user.id,
        savedFile.fileUrl,
        savedFile.fileName,
        savedFile.fileType,
        savedFile.fileSize,
        comment.trim() || null,
        now,
        nextVersion
      );

      // Update task status
      db.prepare("UPDATE tasks SET status = 'UNDER_REVIEW' WHERE id = ?").run(taskId);

      // Notify domain head
      if (task.domain_head_id && task.domain_head_id !== user.id) {
        const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        db.prepare(`
          INSERT INTO notifications (id, user_id, type, title, message, read, related_entity_type, related_entity_id, created_at)
          VALUES (?, ?, 'new_task', 'New Task Submission for Review 📋', ?, 0, 'submission', ?, ?)
        `).run(
          notifId,
          task.domain_head_id,
          `${user.name} submitted work for "${task.title}" (v${nextVersion}).`,
          subId,
          now
        );
      }

      // Log activity
      db.prepare(`
        INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, metadata, created_at)
        VALUES (?, ?, 'SUBMISSION_UPLOADED', 'task', ?, ?, ?)
      `).run(
        `act-${Date.now()}`,
        user.id,
        taskId,
        JSON.stringify({ fileName: savedFile.fileName, version: nextVersion }),
        now
      );

      return {
        success: true,
        submissionId: subId,
        version: nextVersion,
        fileUrl: savedFile.fileUrl
      };
    });

    return NextResponse.json(submissionResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Submission failed' }, { status: 400 });
  }
}
