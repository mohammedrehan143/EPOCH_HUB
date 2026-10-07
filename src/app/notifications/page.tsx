'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Notification } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  Bell,
  Check,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  Inbox,
  Clock
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true })
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
  };

  const handleMarkSingleRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: 1 } : n));
  };

  const filtered = notifications.filter(n => filter === 'all' || n.read === 0);
  const unreadCount = notifications.filter(n => n.read === 0).length;

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Bell className="w-7 h-7 text-indigo-400" />
              <span>Notification Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Stay updated on review decisions, task deadlines, point rewards, and club announcements.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <Check className="w-3.5 h-3.5 mr-1.5" /> Mark All as Read
            </Button>
          )}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'unread' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <Card className="p-0 border-slate-800 overflow-hidden divide-y divide-slate-800/60">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading notifications...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              You're all caught up! No notifications to display.
            </div>
          ) : (
            filtered.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                  notif.read === 0 ? 'bg-indigo-950/20' : 'hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    notif.type === 'submission_approved' || notif.type === 'points_awarded'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : notif.type === 'submission_rejected' || notif.type === 'task_missed'
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                  }`}>
                    {notif.type === 'submission_approved' || notif.type === 'points_awarded' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : notif.type === 'task_missed' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-slate-100">{notif.title}</h4>
                      {notif.read === 0 && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 pt-1">
                      <Clock className="w-3 h-3" /> {formatDateTime(notif.created_at)}
                    </p>
                  </div>
                </div>

                {notif.read === 0 && (
                  <button
                    onClick={() => handleMarkSingleRead(notif.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </Card>
      </div>
    </AppShell>
  );
}
