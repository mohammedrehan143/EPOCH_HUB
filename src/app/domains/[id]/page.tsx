'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskClaimModal } from '@/components/tasks/TaskClaimModal';
import { TaskSubmissionModal } from '@/components/tasks/TaskSubmissionModal';
import { Domain, User, Task } from '@/types';
import { Layers, Users, CheckCircle2, Award, ArrowLeft, Trophy, ShieldCheck } from 'lucide-react';

export default function DomainDetailPage() {
  const params = useParams();
  const domainId = params.id as string;

  const [domain, setDomain] = useState<Domain | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'members' | 'leaderboard'>('tasks');

  // Modals
  const [claimTask, setClaimTask] = useState<Task | null>(null);
  const [submitTask, setSubmitTask] = useState<Task | null>(null);

  const fetchDomain = async () => {
    try {
      const res = await fetch(`/api/domains/${domainId}`);
      if (res.ok) {
        const data = await res.json();
        setDomain(data.domain);
        setMembers(data.members || []);
        setTasks(data.tasks || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(d => setCurrentUser(d.user || null))
      .catch(() => {});

    fetchDomain();
  }, [domainId]);

  if (loading) {
    return (
      <AppShell>
        <div className="p-12 text-center text-slate-400">Loading domain profile...</div>
      </AppShell>
    );
  }

  if (!domain) {
    return (
      <AppShell>
        <div className="p-12 text-center space-y-3">
          <p className="text-slate-400">Domain not found</p>
          <Link href="/domains">
            <Button variant="outline">Back to Domains</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <Link
            href="/domains"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Domains</span>
          </Link>
        </div>

        {/* Domain Overview Card */}
        <Card className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-indigo-950/40 border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                Official Domain
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {domain.name} Domain
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {domain.description}
              </p>
            </div>

            {/* Domain Head Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0 flex items-center gap-3">
              <Avatar src={domain.head_avatar} name={domain.head_name || 'Lead'} size="lg" />
              <div>
                <p className="text-xs font-bold text-slate-100">{domain.head_name || 'Unassigned'}</p>
                <p className="text-[11px] text-indigo-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Domain Head
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Domain Members</span>
              <span className="text-lg font-black text-slate-100">{domain.member_count || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Active Tasks</span>
              <span className="text-lg font-black text-indigo-400">{domain.active_tasks_count || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Completed Tasks</span>
              <span className="text-lg font-black text-emerald-400">{domain.completed_tasks_count || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Total Points</span>
              <span className="text-lg font-black text-amber-300">+{domain.total_points || 0} pts</span>
            </div>
          </div>
        </Card>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'tasks'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Domain Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'members'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Members Roster ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Domain Leaderboard
          </button>
        </div>

        {/* Tab 1: Tasks */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <Card className="p-8 text-center text-xs text-slate-500">
                No tasks currently available in this domain.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    currentUser={currentUser}
                    onClaimClick={(t) => setClaimTask(t)}
                    onSubmitClick={(t) => setSubmitTask(t)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Members Roster */}
        {activeTab === 'members' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((mem) => (
              <Card key={mem.id} className="p-4 flex items-center justify-between border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={mem.profile_image} name={mem.name} size="md" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{mem.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{mem.position || mem.role}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold text-indigo-400">+{mem.total_points || 0}</span>
                  <span className="text-[10px] text-slate-400 block">{mem.completed_tasks_count || 0} tasks</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tab 3: Domain Leaderboard */}
        {activeTab === 'leaderboard' && (
          <Card className="p-0 border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <CardTitle>Top Domain Contributors</CardTitle>
            </div>
            <div className="divide-y divide-slate-800/80">
              {members.map((m, idx) => (
                <div key={m.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-900/60">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-slate-400">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <Avatar src={m.profile_image} name={m.name} size="sm" />
                    <div>
                      <p className="font-semibold text-slate-200">{m.name}</p>
                      <p className="text-[10px] text-slate-400">{m.position || m.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-white text-sm">{m.total_points || 0}</span>
                    <span className="text-[10px] text-indigo-400 ml-1">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Claim Modal */}
        <TaskClaimModal
          task={claimTask}
          isOpen={!!claimTask}
          onClose={() => setClaimTask(null)}
          onClaimSuccess={() => fetchDomain()}
        />

        {/* Submit Modal */}
        <TaskSubmissionModal
          task={submitTask}
          isOpen={!!submitTask}
          onClose={() => setSubmitTask(null)}
          onSubmitSuccess={() => fetchDomain()}
        />
      </div>
    </AppShell>
  );
}
