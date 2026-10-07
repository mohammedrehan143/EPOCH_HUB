'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  Users,
  Layers,
  Calendar,
  CheckSquare,
  FileCheck,
  AlertTriangle,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cronRunning, setCronRunning] = useState(false);
  const [cronResult, setCronResult] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRunDeadlinesCheck = async () => {
    setCronRunning(true);
    setCronResult(null);
    try {
      const res = await fetch('/api/cron/check-deadlines', { method: 'POST' });
      const data = await res.json();
      setCronResult(data.message || 'Deadline check completed.');
      fetchStats();
    } catch (err: any) {
      setCronResult('Failed to run deadline check');
    } finally {
      setCronRunning(false);
    }
  };

  if (loading || !stats) {
    return <div className="p-12 text-center text-slate-400">Loading admin analytics...</div>;
  }

  const { overview, domainStats, eventStats } = stats;

  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-slate-100">Automated Club Deadline Engine</h2>
          <p className="text-xs text-slate-400">
            Automatically scan active tasks, identify missed deadlines, and deduplicate -1 penalty applications.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleRunDeadlinesCheck}
          isLoading={cronRunning}
          className="border-amber-500/30 text-amber-300 hover:bg-slate-800 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Run Deadlines Scan Now
        </Button>
      </div>

      {cronResult && (
        <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs">
          {cronResult}
        </div>
      )}

      {/* 8 Metric KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Members</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-black text-white">{overview.totalMembers}</span>
        </Card>

        <Card className="p-4 border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active Events</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-black text-white">{overview.activeEvents}</span>
        </Card>

        <Card className="p-4 border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active Tasks</span>
            <CheckSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-black text-white">{overview.activeTasks}</span>
        </Card>

        <Card className="p-4 border-slate-800 bg-purple-950/20 border-purple-500/20">
          <div className="flex items-center justify-between text-xs text-purple-300 mb-1">
            <span>Pending Reviews</span>
            <FileCheck className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-2xl font-black text-purple-300">{overview.pendingReviews}</span>
        </Card>

        <Card className="p-4 border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Completed Tasks</span>
            <CheckSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400">{overview.completedTasks}</span>
        </Card>

        <Card className="p-4 border-slate-800 bg-rose-950/20 border-rose-500/20">
          <div className="flex items-center justify-between text-xs text-rose-300 mb-1">
            <span>Missed Tasks</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-black text-rose-400">{overview.missedTasks}</span>
        </Card>

        <Card className="p-4 border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Club Domains</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-black text-white">{overview.totalDomains}</span>
        </Card>

        <Card className="p-4 border-slate-800 bg-amber-950/20 border-amber-500/20">
          <div className="flex items-center justify-between text-xs text-amber-300 mb-1">
            <span>Points Distributed</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-amber-300">+{overview.totalPointsDistributed}</span>
        </Card>
      </div>

      {/* Domain Performance Breakdown */}
      <Card className="p-0 border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <CardTitle>Domain Performance & Completion Rates</CardTitle>
          <span className="text-xs text-slate-400">All 8 Domains</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4 text-center">Total Tasks</th>
                <th className="py-3 px-4 text-center">Completed</th>
                <th className="py-3 px-4 text-center">Missed</th>
                <th className="py-3 px-4">Completion %</th>
                <th className="py-3 px-4 text-right">Points Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {domainStats.map((ds: any) => {
                const total = ds.total_tasks || 0;
                const completed = ds.completed_tasks || 0;
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                return (
                  <tr key={ds.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-100">{ds.name}</td>
                    <td className="py-3 px-4 text-center">{total}</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-semibold">{completed}</td>
                    <td className="py-3 px-4 text-center text-rose-400">{ds.missed_tasks || 0}</td>
                    <td className="py-3 px-4 w-44">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-semibold">{percentage}%</span>
                        <ProgressBar value={percentage} color={percentage > 70 ? 'emerald' : 'indigo'} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-amber-400">
                      +{ds.points_earned || 0} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Events Progress Status */}
      <Card className="border-slate-800 space-y-4">
        <CardHeader>
          <CardTitle>Active Event Progress</CardTitle>
          <Link href="/events" className="text-xs text-indigo-400 hover:text-indigo-300">
            View all &rarr;
          </Link>
        </CardHeader>

        <div className="space-y-3">
          {eventStats.map((ev: any) => {
            const total = ev.total_tasks || 0;
            const completed = ev.completed_tasks || 0;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            return (
              <div key={ev.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{ev.name}</span>
                  <span className="text-indigo-400 font-bold">{completed} / {total} Tasks ({percentage}%)</span>
                </div>
                <ProgressBar value={percentage} color="gradient" />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
