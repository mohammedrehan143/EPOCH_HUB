'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FileUploader } from '../ui/FileUploader';
import { Task } from '@/types';
import { Send, CheckCircle2 } from 'lucide-react';

export interface TaskSubmissionModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export function TaskSubmissionModal({ task, isOpen, onClose, onSubmitSuccess }: TaskSubmissionModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('comment', comment);

      const res = await fetch(`/api/tasks/${task.id}/submit`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit task');
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setFile(null);
        setComment('');
        onSubmitSuccess();
        onClose();
      }, 1200);
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
      title={`Submit Output: ${task.title}`}
      description="Upload your final deliverable for domain lead review."
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-base font-semibold text-slate-100">Work Submitted for Review!</h4>
          <p className="text-xs text-slate-400">
            Your domain lead and reviewers will review your submission soon.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FileUploader
            onFileSelect={setFile}
            selectedFile={file}
            error={error || undefined}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Notes or Comments for Reviewer (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Attached final vector PDF with CMYK color profile, also included editable Figma link..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              <Send className="w-4 h-4 mr-1.5" /> Submit Deliverable
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
