'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import { Submission } from '@/types';
import { formatDate, formatDateTime, formatFileSize } from '@/lib/utils';
import { FileCheck, Download, Award, Clock, FileText, CheckCircle2 } from 'lucide-react';

export default function AdminReviewsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [statusFilter, setStatusFilter] = useState('UNDER_REVIEW');
  const [selectedReview, setSelectedReview] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await fetch(`/api/submissions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <span>Deliverables Review Queue</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review uploaded student work, inspect file attachments, award completion points, or provide feedback.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => setStatusFilter('UNDER_REVIEW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'UNDER_REVIEW' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending ({submissions.filter(s => s.status === 'UNDER_REVIEW').length || (statusFilter === 'UNDER_REVIEW' ? submissions.length : 0)})
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'APPROVED' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'REJECTED' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Submissions
          </button>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading submissions queue...</div>
      ) : submissions.length === 0 ? (
        <Card className="p-10 text-center text-xs text-slate-500 border-dashed border-slate-800">
          No submissions matching the "{statusFilter}" status filter.
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <Card
              key={sub.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    {sub.domain_name}
                  </span>
                  <Badge
                    variant={sub.status === 'APPROVED' ? 'success' : sub.status === 'REJECTED' ? 'danger' : 'warning'}
                    size="sm"
                  >
                    {sub.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-[11px] text-slate-400">v{sub.version}</span>
                </div>

                <h3 className="text-base font-bold text-slate-100">{sub.task_title}</h3>

                <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Avatar src={sub.user_avatar} name={sub.user_name} size="sm" />
                    <span className="text-slate-300 font-medium">{sub.user_name}</span>
                  </div>
                  <span>•</span>
                  <span>Event: {sub.event_name}</span>
                  <span>•</span>
                  <span>Submitted {formatDateTime(sub.submitted_at)}</span>
                </div>

                {sub.comment && (
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 max-w-xl">
                    <span className="text-slate-400 font-medium block text-[10px]">Notes:</span>
                    "{sub.comment}"
                  </p>
                )}
              </div>

              {/* Action Side */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <div className="text-right">
                  <span className="font-extrabold text-indigo-400 text-sm">+{sub.task_points || 5} pts</span>
                  <a
                    href={sub.file_url}
                    download={sub.file_name}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-[11px] text-slate-400 hover:text-white mt-0.5 underline"
                  >
                    {sub.file_name} ({formatFileSize(sub.file_size)})
                  </a>
                </div>

                <Button
                  variant={sub.status === 'UNDER_REVIEW' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedReview(sub)}
                  className="text-xs"
                >
                  <FileCheck className="w-3.5 h-3.5 mr-1.5" />
                  {sub.status === 'UNDER_REVIEW' ? 'Review & Award' : 'Re-examine'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        submission={selectedReview}
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        onReviewSuccess={() => fetchSubmissions()}
      />
    </div>
  );
}
