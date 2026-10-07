import React from 'react';
import Link from 'next/link';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { TaskStatusBadge } from './TaskStatusBadge';
import { Task, User } from '@/types';
import { formatTimeRemaining, formatDate } from '@/lib/utils';
import { Calendar, Award, ArrowRight, UploadCloud, Eye } from 'lucide-react';

export interface TaskCardProps {
  task: Task;
  currentUser?: User | null;
  onClaimClick?: (task: Task) => void;
  onSubmitClick?: (task: Task) => void;
  onReviewClick?: (task: Task) => void;
}

export function TaskCard({
  task,
  currentUser,
  onClaimClick,
  onSubmitClick,
  onReviewClick
}: TaskCardProps) {
  const timeRemaining = formatTimeRemaining(task.deadline);
  const isAssignee = currentUser && task.assigned_member_id === currentUser.id;
  const isAvailable = task.status === 'AVAILABLE';
  const canSubmit = isAssignee && ['CLAIMED', 'IN_PROGRESS', 'REJECTED'].includes(task.status);
  const isReviewable = ['UNDER_REVIEW', 'SUBMITTED'].includes(task.status) &&
    (currentUser?.role === 'super_admin' || currentUser?.role === 'reviewer' || (currentUser?.role === 'domain_head' && currentUser.domain_id === task.domain_id));

  const priorityVariants: Record<string, 'default' | 'warning' | 'danger' | 'primary'> = {
    LOW: 'default',
    MEDIUM: 'primary',
    HIGH: 'warning',
    URGENT: 'danger'
  };

  return (
    <Card className="flex flex-col justify-between hover:border-slate-700 hover:shadow-xl transition-all duration-200 group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              {task.domain_name || 'Domain'}
            </span>
            <Badge variant={priorityVariants[task.priority] || 'default'} size="sm">
              {task.priority}
            </Badge>
          </div>
          <TaskStatusBadge status={task.status} />
        </div>

        {/* Task Title & Event */}
        <Link href={`/tasks/${task.id}`} className="block group-hover:text-indigo-400 transition-colors">
          <h3 className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2 mb-1">
            {task.title}
          </h3>
        </Link>

        <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-2.5">
          <span>Event:</span>
          <span className="text-slate-300 font-medium truncate">{task.event_name || 'Event'}</span>
        </p>

        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {task.description}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-800/80 space-y-3">
        {/* Points & Deadline */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
            <Award className="w-3.5 h-3.5" />
            <span>+{task.points} pts</span>
          </div>

          <div
            className={`flex items-center gap-1 text-[11px] font-medium ${
              timeRemaining.urgent ? 'text-amber-400' : timeRemaining.isPast ? 'text-rose-400' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{timeRemaining.label}</span>
          </div>
        </div>

        {/* Assignee & Action CTA */}
        <div className="flex items-center justify-between pt-1 gap-2">
          {task.assigned_member_id ? (
            <div className="flex items-center gap-2 min-w-0">
              <Avatar
                src={task.assigned_member_avatar}
                name={task.assigned_member_name || 'Member'}
                size="sm"
              />
              <span className="text-xs text-slate-300 truncate max-w-[100px]">
                {task.assigned_member_name}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">Unassigned</span>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            {isAvailable && onClaimClick && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => onClaimClick(task)}
                className="text-xs py-1"
              >
                Take Task
              </Button>
            )}

            {canSubmit && onSubmitClick && (
              <Button
                size="sm"
                variant="success"
                onClick={() => onSubmitClick(task)}
                className="text-xs py-1"
              >
                <UploadCloud className="w-3.5 h-3.5 mr-1" /> Submit
              </Button>
            )}

            {isReviewable && onReviewClick && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onReviewClick(task)}
                className="text-xs py-1 border-indigo-500/30 text-indigo-300"
              >
                Review
              </Button>
            )}

            <Link href={`/tasks/${task.id}`}>
              <Button size="sm" variant="ghost" className="p-1.5 text-slate-400 hover:text-white">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
