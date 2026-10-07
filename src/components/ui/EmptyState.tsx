import React from 'react';
import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40',
        className
      )}
    >
      <div className="p-3.5 rounded-2xl bg-slate-800/60 text-slate-400 mb-3.5 border border-slate-700/50">
        {icon || <Inbox className="w-7 h-7" />}
      </div>
      <h4 className="text-sm font-semibold text-slate-200 tracking-tight">{title}</h4>
      {description && <p className="text-xs text-slate-400 max-w-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
