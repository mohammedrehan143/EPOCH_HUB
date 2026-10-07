import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatDateTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function formatTimeRemaining(deadlineStr: string | null | undefined): { label: string; isPast: boolean; urgent: boolean } {
  if (!deadlineStr) return { label: 'No deadline', isPast: false, urgent: false };
  const deadline = new Date(deadlineStr).getTime();
  const now = Date.now();
  const diff = deadline - now;

  if (diff < 0) {
    const hoursPast = Math.floor(Math.abs(diff) / (1000 * 60 * 60));
    if (hoursPast < 24) return { label: `${hoursPast}h overdue`, isPast: true, urgent: true };
    const daysPast = Math.floor(hoursPast / 24);
    return { label: `${daysPast}d overdue`, isPast: true, urgent: true };
  }

  const hoursRemaining = Math.floor(diff / (1000 * 60 * 60));
  if (hoursRemaining < 24) {
    return { label: `${hoursRemaining}h remaining`, isPast: false, urgent: true };
  }
  const daysRemaining = Math.floor(hoursRemaining / 24);
  return { label: `${daysRemaining} days left`, isPast: false, urgent: daysRemaining <= 2 };
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
