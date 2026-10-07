import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge';
import { getCurrentUser } from '@/lib/auth/session';
import { query, queryOne } from '@/lib/db';
import { formatDate, formatTimeRemaining } from '@/lib/utils';
import {
  Trophy,
  Award,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  UploadCloud,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';

export default async function DashboardPage() {
  try {
    const user = await getCurrentUser();

    // If no session, redirect to login
    if (!user) {
      return (
        <div className="p-8 text-center text-slate-400">
          <Link href="/login" className="text-indigo-400 underline">
            Please login to view dashboard
          </Link>
        </div>
      );
    }

    // Active tasks assigned to current user
    const activeTasks = query<any>(`
      SELECT t.*, e.name as event_name, d.name as domain_name
      FROM tasks t
      JOIN events e ON t.event_id = e.id
      JOIN domains d ON t.domain_id = d.id
      WHERE t.assigned_member_id = ? AND t.status IN ('CLAIMED', 'IN_PROGRESS', 'REJECTED')
      ORDER BY t.deadline ASC
    `, [user.id]) || [];

    // Available tasks in user's domain (or all if not assigned)
    const availableTasks = query<any>(`
      SELECT t.*, e.name as event_name, d.name as domain_name
      FROM tasks t
      JOIN events e ON t.event_id = e.id
      JOIN domains d ON t.domain_id = d.id
      WHERE t.status = 'AVAILABLE' ${user.domain_id ? `AND t.domain_id = '${user.domain_id}'` : ''}
      ORDER BY t.priority DESC, t.deadline ASC
      LIMIT 4
    `) || [];

    // Active events
    const activeEvents = query<any>(`
      SELECT e.*, 
        (SELECT COUNT(*) FROM tasks WHERE event_id = e.id) as task_count,
        (SELECT COUNT(*) FROM tasks WHERE event_id = e.id AND status = 'APPROVED') as completed_task_count
      FROM events e
      WHERE e.status = 'Active'
      ORDER BY e.start_date ASC
      LIMIT 2
    `) || [];

    // Leaderboard Top 5 preview
    const topLeaderboard = query<any>(`
      SELECT 
        u.id, u.name, u.profile_image, u.role, d.name as domain_name,
        COALESCE((SELECT SUM(points) FROM point_transactions WHERE user_id = u.id), 0) as total_points,
        (SELECT COUNT(*) FROM tasks WHERE assigned_member_id = u.id AND status = 'APPROVED') as completed_tasks
      FROM users u
      LEFT JOIN domains d ON u.domain_id = d.id
      WHERE u.is_active = 1
      ORDER BY total_points DESC, completed_tasks DESC
      LIMIT 5
    `) || [];

    // Recent activity logs
    const recentActivity = query<any>(`
      SELECT a.*, u.name as user_name, u.profile_image as user_avatar
      FROM activity_logs a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 6
    `) || [];

    // Time-of-day greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
      <AppShell initialUser={user}>
        <div className="space-y-8">
          {/* Top Hero Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{user.domain_name || 'Epoch'} Domain</span>
                <span>•</span>
                <span className="capitalize">{user.position || user.role}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {greeting}, {user.name} 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Track your deliverables, discover new tasks for upcoming events, and earn points on the club leaderboard.
              </p>
            </div>

            <div className="flex items-center gap-3 relative z-10 shrink-0">
              <Link href="/tasks">
                <Button variant="primary" size="md">
                  <span>Explore Tasks</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="secondary" size="md">
                  <Trophy className="w-4 h-4 mr-1.5 text-amber-400" />
                  <span>Leaderboard</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* 4 Key Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-indigo-500/20 bg-slate-900/90">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-medium">Total Points</span>
                <Award className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {user.total_points || 0}
                </span>
                <span className="text-xs text-indigo-400 font-semibold">pts</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Based on approved club work</p>
            </Card>

            <Card className="border-amber-500/20 bg-slate-900/90">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-medium">Club Rank</span>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                  #{user.rank || 1}
                </span>
                <span className="text-xs text-slate-400">overall</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Top tier contributor</p>
            </Card>

            <Card className="border-emerald-500/20 bg-slate-900/90">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-medium">Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-300 tracking-tight">
                  {user.completed_tasks_count || 0}
                </span>
                <span className="text-xs text-slate-400">tasks</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Outputs verified & accepted</p>
            </Card>

            <Card className="border-purple-500/20 bg-slate-900/90">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-medium">In Progress</span>
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-purple-300 tracking-tight">
                  {user.pending_tasks_count || 0}
                </span>
                <span className="text-xs text-slate-400">claimed</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Awaiting delivery or review</p>
            </Card>
          </div>

          {/* Active Claimed Tasks (Actionable Section) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100 tracking-tight">My Active Tasks</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400">
                  {activeTasks.length}
                </span>
              </div>
              <Link href="/tasks" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                <span>View all tasks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeTasks.length === 0 ? (
              <Card className="p-8 text-center bg-slate-900/50 border-dashed border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-200">You have no pending tasks!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                  You're all caught up! Browse open tasks for Tech Fest 2026 and HackEpoch to start contributing.
                </p>
                <Link href="/tasks">
                  <Button variant="primary" size="sm">
                    Browse Available Tasks
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTasks.map((task: any) => {
                  const rem = formatTimeRemaining(task.deadline);
                  return (
                    <Card key={task.id} className="border-slate-800 flex flex-col justify-between hover:border-slate-700">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                            {task.domain_name}
                          </span>
                          <TaskStatusBadge status={task.status} />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-100 line-clamp-1 mb-1">{task.title}</h4>
                        <p className="text-[11px] text-slate-400 mb-2 truncate">Event: {task.event_name}</p>
                        <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 mt-4 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-indigo-400">+{task.points} pts</span>
                          <span className={`text-[11px] font-medium flex items-center gap-1 ${rem.urgent ? 'text-amber-400' : 'text-slate-400'}`}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{rem.label}</span>
                          </span>
                        </div>

                        <Link href={`/tasks/${task.id}`}>
                          <Button variant="success" size="sm" className="w-full">
                            <UploadCloud className="w-4 h-4 mr-1.5" /> Submit Deliverable
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2-Column Split: Active Events & Leaderboard Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Events (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <span>Active Club Events</span>
                </h2>
                <Link href="/events" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                  <span>View all events</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeEvents.map((evt: any) => {
                  const progress = evt.task_count > 0 ? Math.round((evt.completed_task_count / evt.task_count) * 100) : 0;
                  return (
                    <Card key={evt.id} className="overflow-hidden p-0 border-slate-800 flex flex-col justify-between group">
                      <div className="h-32 relative bg-slate-800 overflow-hidden">
                        <img
                          src={evt.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                          alt={evt.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                          <Badge variant="primary" size="sm">Active Event</Badge>
                          <span className="text-[11px] text-slate-300 font-medium bg-slate-950/80 px-2 py-0.5 rounded-full">
                            {formatDate(evt.start_date)}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <h4 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                            {evt.name}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                            {evt.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80">
                          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
                            <span>Event Progress</span>
                            <span className="text-indigo-400 font-bold">{progress}%</span>
                          </div>
                          <ProgressBar value={progress} color="gradient" />
                        </div>

                        <Link href={`/events/${evt.id}`}>
                          <Button variant="outline" size="sm" className="w-full mt-1 text-xs">
                            <span>View Event Details & Tasks</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Quick Open Tasks Callout */}
              {availableTasks.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" /> Open Tasks in Your Domain
                    </span>
                    <Link href="/tasks" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                      Explore all &rarr;
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableTasks.map((t: any) => (
                      <Link
                        key={t.id}
                        href={`/tasks/${t.id}`}
                        className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/30 flex items-center justify-between text-xs transition-all"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-slate-200 truncate">{t.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{t.event_name}</p>
                        </div>
                        <span className="font-bold text-indigo-400 shrink-0 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                          +{t.points} pts
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Leaderboard Top 5 & Recent Activity */}
            <div className="space-y-6">
              {/* Leaderboard Top 5 */}
              <Card className="border-slate-800">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <CardTitle>Top Contributors</CardTitle>
                  </div>
                  <Link href="/leaderboard" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                    Full Board &rarr;
                  </Link>
                </CardHeader>

                <div className="space-y-2">
                  {topLeaderboard.map((item: any, idx: number) => {
                    const isCurrent = item.id === user.id;
                    const rankBadge = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                          isCurrent ? 'bg-indigo-950/40 border border-indigo-500/30' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 text-center text-xs font-bold text-slate-400">{rankBadge}</span>
                          <Avatar src={item.profile_image} name={item.name} size="sm" />
                          <div className="min-w-0">
                            <p className={`font-semibold truncate ${isCurrent ? 'text-indigo-300' : 'text-slate-200'}`}>
                              {item.name} {isCurrent && '(You)'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{item.domain_name || 'General'}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-white">{item.total_points}</span>
                          <span className="text-[10px] text-indigo-400 font-medium ml-1">pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Recent Club Activity Feed */}
              <Card className="border-slate-800">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <CardTitle>Club Activity Feed</CardTitle>
                  </div>
                </CardHeader>

                <div className="space-y-3">
                  {recentActivity.map((log: any) => {
                    let meta: any = {};
                    try {
                      meta = JSON.parse(log.metadata || '{}');
                    } catch {}

                    const actionLabels: Record<string, string> = {
                      TASK_CLAIMED: 'claimed task',
                      SUBMISSION_UPLOADED: 'submitted work for review',
                      SUBMISSION_APPROVED: 'earned points for',
                      TASK_MISSED_PENALTY: 'received penalty for missed task',
                      EVENT_CREATED: 'published new event',
                      TASK_CREATED: 'created new task'
                    };

                    return (
                      <div key={log.id} className="flex items-start gap-2.5 text-xs">
                        <Avatar src={log.user_avatar} name={log.user_name} size="sm" className="mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-slate-200 leading-snug">
                            <strong>{log.user_name}</strong>{' '}
                            <span className="text-slate-400">{actionLabels[log.action] || log.action}</span>{' '}
                            {meta.title && <span className="text-slate-200 font-medium">"{meta.title}"</span>}
                            {meta.points && <span className="text-emerald-400 font-bold ml-1">+{meta.points} pts</span>}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(log.created_at)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </AppShell>
    );
  } catch (error: any) {
    console.error('CRITICAL DASHBOARD ERROR:', error);
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-2xl mx-auto bg-red-950/40 border border-red-500/30 rounded-2xl p-6 space-y-4">
          <h1 className="text-xl font-bold text-red-400">Dashboard Render Error</h1>
          <p className="text-sm text-slate-200"><strong>Error Message:</strong> {error?.message || String(error)}</p>
          <pre className="text-xs bg-slate-900 p-4 rounded border border-slate-800 text-slate-400 overflow-auto whitespace-pre-wrap">
            {error?.stack}
          </pre>
          <Link href="/login" className="inline-block px-4 py-2 bg-indigo-600 rounded text-xs font-semibold text-white">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }
}
