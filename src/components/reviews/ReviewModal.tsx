'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Submission } from '@/types';
import { formatDate, formatFileSize } from '@/lib/utils';
import { CheckCircle2, XCircle, Download, FileText, User as UserIcon, Calendar, Award } from 'lucide-react';

export interface ReviewModalProps {
  submission: Submission | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewSuccess: () => void;
}

export function ReviewModal({ submission, isOpen, onClose, onReviewSuccess }: ReviewModalProps) {
  const [reviewMode, setReviewMode] = useState<'decision' | 'reject'>('decision');
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!submission) return null;

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/submissions/${submission.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE',
          reviewComment: approvalNote.trim() || 'Approved'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve submission');
      }

      onReviewSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a specific feedback reason for rejection');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/submissions/${submission.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REJECT',
          reviewComment: rejectionReason.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reject submission');
      }

      onReviewSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Deliverable Submission"
      description={`Task: ${submission.task_title || 'Club Task'}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Member and Task Info */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <UserIcon className="w-4 h-4 text-slate-400" />
              <span>Submitted by <strong>{submission.user_name}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Award className="w-4 h-4" />
              <span>+{submission.task_points || 5} Points</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Submitted: {formatDate(submission.submitted_at)} (v{submission.version})</span>
            </div>
            <span className="text-slate-400">Domain: {submission.domain_name}</span>
          </div>
        </div>

        {/* Deliverable File Download & Preview */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">{submission.file_name}</p>
                <p className="text-xs text-slate-400">{formatFileSize(submission.file_size)} • {submission.file_type}</p>
              </div>
            </div>

            <a
              href={submission.file_url}
              download={submission.file_name}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Download / View
            </a>
          </div>

          {submission.comment && (
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
              <span className="text-slate-400 block font-medium mb-1">Member Notes:</span>
              "{submission.comment}"
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Decision Mode */}
        {reviewMode === 'decision' ? (
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Approval Note (Optional)
              </label>
              <input
                type="text"
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="e.g. Excellent work! Clean implementation."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="danger"
                onClick={() => setReviewMode('reject')}
                disabled={loading}
              >
                <XCircle className="w-4 h-4 mr-1.5" /> Request Changes
              </Button>
              <Button
                type="button"
                variant="success"
                onClick={handleApprove}
                isLoading={loading}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve & Award +{submission.task_points || 5} Points
              </Button>
            </div>
          </div>
        ) : (
          /* Rejection / Feedback Mode */
          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <strong>Specific feedback is required:</strong> The member will receive your comments and will be able to resubmit an updated version.
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Reason for Rejection / Required Revisions *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Please update the event date to Oct 12 and use our official typography tokens..."
                rows={3}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReviewMode('decision')}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleReject}
                isLoading={loading}
              >
                <XCircle className="w-4 h-4 mr-1.5" /> Send Feedback & Reject
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
