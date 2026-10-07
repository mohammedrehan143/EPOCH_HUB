'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge';
import { TaskClaimModal } from '@/components/tasks/TaskClaimModal';
import { TaskSubmissionModal } from '@/components/tasks/TaskSubmissionModal';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import { Task, Submission, User } from '@/types';
import { formatDate, formatDateTime, formatTimeRemaining, formatFileSize } from '@/lib/utils';
import {
  Calendar,
  Award,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  UploadCloud,
  User as UserIcon,
  AlertTriangle,
  Send,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Submission | null>(null);

  const fetchTask = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        setSubmissions(data.submissions || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(d => setCurrentUser(d.user || null))
      .catch(() => {});

    fetchTask();
  }, [taskId]);

  if (loading) {
    return (
      <AppShell>
        <div className="p-12 text-center text-slate-400">Loading task details...</div>
      </AppShell>
    );
  }

  if (!task) {
    return (
      <AppShell>
        <div className="p-12 text-center space-y-3">
          <p className="text-slate-400">Task not found</p>
          <Link href="/tasks">
            <Button variant="outline">Back to Tasks</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const timeRemaining = formatTimeRemaining(task.deadline);
  const isAssignee = currentUser && task.assigned_member_id === currentUser.id;
  const isAvailable = task.status === 'AVAILABLE';
  const canSubmit = isAssignee && ['CLAIMED', 'IN_PROGRESS', 'REJECTED'].includes(task.status);
  const canReview = ['UNDER_REVIEW', 'SUBMITTED'].includes(task.status) &&
    (currentUser?.role === 'super_admin' || currentUser?.role === 'reviewer' || (currentUser?.role === 'domain_head' && currentUser.domain_id === task.domain_id));

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Tasks</span>
          </Link>
        </div>

        {/* Task Header Card */}
        <Card className="border-slate-800 bg-slate-900/90 p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                  {task.domain_name} Domain
                </span>
                <Badge variant={task.priority === 'URGENT' ? 'danger' : 'primary'}>
                  {task.priority} Priority
                </Badge>
              </div>
              <TaskStatusBadge status={task.status} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {task.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
              <span>Event:</span>
              <Link href={`/events/${task.event_id}`} className="text-indigo-400 hover:underline font-semibold">
                {task.event_name}
              </Link>
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Points Reward</span>
              <span className="text-base font-extrabold text-indigo-400 flex items-center gap-1">
                <Award className="w-4 h-4" /> +{task.points} pts
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Deadline</span>
              <span className="text-slate-200 font-semibold flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" /> {formatDate(task.deadline)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Time Status</span>
              <span className={`font-semibold ${timeRemaining.urgent ? 'text-amber-400' : timeRemaining.isPast ? 'text-rose-400' : 'text-emerald-400'}`}>
                {timeRemaining.label}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Assignee</span>
              {task.assigned_member_id ? (
                <div className="flex items-center gap-1.5 font-medium text-slate-200">
                  <Avatar src={task.assigned_member_avatar} name={task.assigned_member_name} size="sm" />
                  <span className="truncate">{task.assigned_member_name}</span>
                </div>
              ) : (
                <span className="text-slate-500 italic">Unassigned</span>
              )}
            </div>
          </div>

          {/* Task Description & Requirements */}
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Deliverable Description & Instructions
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              {task.description}
            </p>
          </div>

          {/* Action Button Bar */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs text-slate-400">
              Created on {formatDate(task.created_at)} by {task.creator_name || 'Admin'}
            </div>

            <div className="flex items-center gap-3">
              {isAvailable && (
                <Button variant="primary" size="md" onClick={() => setIsClaimOpen(true)}>
                  <Sparkles className="w-4 h-4 mr-1.5" /> Take This Task
                </Button>
              )}

              {canSubmit && (
                <Button variant="success" size="md" onClick={() => setIsSubmitOpen(true)}>
                  <UploadCloud className="w-4 h-4 mr-1.5" /> Submit Deliverable
                </Button>
              )}

              {canReview && submissions.length > 0 && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setSelectedReview(submissions[0])}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Review Deliverable
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Submissions & Review History */}
        <Card className="border-slate-800 space-y-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <CardTitle>Deliverable Submissions ({submissions.length})</CardTitle>
            </div>
          </CardHeader>

          {submissions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No submissions uploaded yet for this task.
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                        v{sub.version}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">{sub.file_name}</span>
                      <span className="text-[11px] text-slate-500">({formatFileSize(sub.file_size)})</span>
                    </div>

                    <Badge
                      variant={
                        sub.status === 'APPROVED' ? 'success' : sub.status === 'REJECTED' ? 'danger' : 'warning'
                      }
                      size="sm"
                    >
                      {sub.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {sub.comment && (
                    <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-slate-400 font-medium block mb-0.5">Member Comment:</span>
                      "{sub.comment}"
                    </div>
                  )}

                  {sub.review_comment && (
                    <div className={`text-xs p-2.5 rounded-lg border ${
                      sub.status === 'APPROVED' ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300' : 'bg-rose-950/30 border-rose-500/20 text-rose-300'
                    }`}>
                      <span className="font-semibold block mb-0.5">
                        Reviewer Feedback ({sub.reviewer_name || 'Lead'}):
                      </span>
                      "{sub.review_comment}"
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <span>Uploaded on {formatDateTime(sub.submitted_at)}</span>
                    <a
                      href={sub.file_url}
                      download={sub.file_name}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download File
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Claim Modal */}
        <TaskClaimModal
          task={task}
          isOpen={isClaimOpen}
          onClose={() => setIsClaimOpen(false)}
          onClaimSuccess={() => fetchTask()}
        />

        {/* Submit Modal */}
        <TaskSubmissionModal
          task={task}
          isOpen={isSubmitOpen}
          onClose={() => setIsSubmitOpen(false)}
          onSubmitSuccess={() => fetchTask()}
        />

        {/* Review Modal */}
        <ReviewModal
          submission={selectedReview}
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
          onReviewSuccess={() => fetchTask()}
        />
      </div>
    </AppShell>
  );
}
