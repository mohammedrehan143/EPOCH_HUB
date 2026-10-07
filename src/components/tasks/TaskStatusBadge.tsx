import React from 'react';
import { Badge } from '../ui/Badge';
import { TaskStatus } from '@/types';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Sparkles, Send } from 'lucide-react';

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  switch (status) {
    case 'AVAILABLE':
      return (
        <Badge variant="primary" size="sm">
          <Sparkles className="w-3 h-3" /> Available
        </Badge>
      );
    case 'CLAIMED':
    case 'IN_PROGRESS':
      return (
        <Badge variant="warning" size="sm">
          <Clock className="w-3 h-3" /> In Progress
        </Badge>
      );
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
      return (
        <Badge variant="purple" size="sm">
          <Send className="w-3 h-3" /> Under Review
        </Badge>
      );
    case 'APPROVED':
      return (
        <Badge variant="success" size="sm">
          <CheckCircle2 className="w-3 h-3" /> Approved
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="danger" size="sm">
          <XCircle className="w-3 h-3" /> Changes Requested
        </Badge>
      );
    case 'MISSED':
      return (
        <Badge variant="danger" size="sm">
          <AlertTriangle className="w-3 h-3" /> Missed Deadline
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="default" size="sm">
          Cancelled
        </Badge>
      );
    default:
      return <Badge size="sm">{status}</Badge>;
  }
}
