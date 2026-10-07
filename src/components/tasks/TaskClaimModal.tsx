'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Task } from '@/types';
import { formatDate, formatTimeRemaining } from '@/lib/utils';
import { Sparkles, Calendar, Award, AlertCircle } from 'lucide-react';

export interface TaskClaimModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess: () => void;
}

export function TaskClaimModal({ task, isOpen, onClose, onClaimSuccess }: TaskClaimModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!task) return null;

  const timeRemaining = formatTimeRemaining(task.deadline);

  const handleClaim = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${task.id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to claim task');
      }

      onClaimSuccess();
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
      title="Take Ownership of Task"
      description="Claim this task to start working on it and submit your output."
      maxWidth="md"
    >
      <div className="space-y-5">
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <h4 className="text-base font-semibold text-slate-100">{task.title}</h4>
          <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Award className="w-4 h-4" />
              <span>+{task.points} Club Points</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Due: {formatDate(task.deadline)}</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <p>
            Once claimed, you are expected to complete and submit work before the deadline.
            Missing the deadline will incur a <strong>-1 point penalty</strong>.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleClaim} isLoading={loading}>
            <Sparkles className="w-4 h-4 mr-1.5" /> Confirm & Take Task
          </Button>
        </div>
      </div>
    </Modal>
  );
}
