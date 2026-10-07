'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/SkeletonLoader';
import { PointTransaction, Event } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import { History, TrendingUp, TrendingDown, Award, Calendar, CheckCircle2 } from 'lucide-react';

export default function PointHistoryPage() {
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(d => setEvents(d.events || []))
      .catch(() => {});
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('filter', filter);
      if (selectedEvent) params.append('eventId', selectedEvent);

      const res = await fetch(`/api/points?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filter, selectedEvent]);

  const totalPoints = transactions.reduce((acc, t) => acc + t.points, 0);

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <History className="w-7 h-7 text-indigo-400" />
              <span>Point Transaction Ledger</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Verifiable audit trail of all approved task awards, achievements, and penalty deductions.
            </p>
          </div>

          <div className="p-3.5 px-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Ledger Total</span>
              <span className={`text-xl font-extrabold ${totalPoints >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                {totalPoints > 0 ? `+${totalPoints}` : totalPoints} pts
              </span>
            </div>
            <Award className="w-6 h-6 text-indigo-400" />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setFilter('positive')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'positive' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Points Earned (+)
            </button>
            <button
              onClick={() => setFilter('negative')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'negative' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Penalties (-)
            </button>
          </div>

          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Events</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        {/* Transactions Table */}
        <Card className="p-0 border-slate-800 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={5} />
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              No point transactions recorded matching this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3.5 px-4 w-28">Type</th>
                    <th className="py-3.5 px-4">Reason / Activity</th>
                    <th className="py-3.5 px-4">Event</th>
                    <th className="py-3.5 px-4 text-center">Timestamp</th>
                    <th className="py-3.5 px-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {transactions.map((tr) => {
                    const isPositive = tr.points > 0;
                    return (
                      <tr key={tr.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              tr.transaction_type === 'TASK_COMPLETION'
                                ? 'success'
                                : tr.transaction_type === 'MISSED_TASK_PENALTY'
                                ? 'danger'
                                : tr.transaction_type === 'PENALTY_REVERSAL'
                                ? 'primary'
                                : 'purple'
                            }
                            size="sm"
                          >
                            {tr.transaction_type.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-100">{tr.reason}</p>
                          {tr.task_title && (
                            <p className="text-[11px] text-slate-400 mt-0.5">Task: {tr.task_title}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {tr.event_name || 'General Club Activity'}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400">
                          {formatDateTime(tr.created_at)}
                        </td>
                        <td className="py-3 px-4 text-right font-black">
                          <span className={`text-sm px-2 py-0.5 rounded-lg ${
                            isPositive
                              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                              : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                          }`}>
                            {isPositive ? `+${tr.points}` : tr.points} pts
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
