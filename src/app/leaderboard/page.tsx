'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/SkeletonLoader';
import { LeaderboardEntry, Domain, Event } from '@/types';
import { Trophy, Medal, Award, CheckCircle2, Filter } from 'lucide-react';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [period, setPeriod] = useState<'all' | 'month' | 'semester'>('all');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/domains')
      .then(res => res.json())
      .then(d => setDomains(d.domains || []))
      .catch(() => {});

    fetch('/api/events')
      .then(res => res.json())
      .then(d => setEvents(d.events || []))
      .catch(() => {});
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('period', period);
      if (selectedDomain) params.append('domainId', selectedDomain);
      if (selectedEvent) params.append('eventId', selectedEvent);

      const res = await fetch(`/api/leaderboard?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [period, selectedDomain, selectedEvent]);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <AppShell>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-400" />
            <span>Club Leaderboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time rankings based on approved deliverables, event tasks, and club achievements.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Period Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setPeriod('all')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overall Time
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === 'month' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriod('semester')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === 'semester' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              This Semester
            </button>
          </div>

          {/* Domain & Event Dropdowns */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Domains</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Events</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Podium for Top 3 */}
        {!loading && top3.length >= 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            {/* 2nd Place */}
            <Card className="order-2 sm:order-1 flex flex-col items-center text-center p-6 bg-slate-900/80 border-slate-800 relative">
              <span className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 font-black text-sm flex items-center justify-center mb-3 shadow-md">
                2
              </span>
              <Avatar src={top3[1].profile_image} name={top3[1].name} size="lg" className="ring-4 ring-slate-700/50 mb-3" />
              <h3 className="text-base font-bold text-slate-100">{top3[1].name}</h3>
              <p className="text-xs text-slate-400 mb-3">{top3[1].domain_name || 'General'}</p>
              <div className="mt-auto pt-3 border-t border-slate-800 w-full flex items-center justify-around text-xs">
                <div>
                  <span className="font-extrabold text-white text-base block">{top3[1].total_points}</span>
                  <span className="text-[10px] text-slate-400">Points</span>
                </div>
                <div>
                  <span className="font-extrabold text-slate-300 text-base block">{top3[1].completed_tasks}</span>
                  <span className="text-[10px] text-slate-400">Tasks</span>
                </div>
              </div>
            </Card>

            {/* 1st Place (Champion) */}
            <Card className="order-1 sm:order-2 flex flex-col items-center text-center p-6 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/40 relative sm:-translate-y-3 shadow-2xl shadow-amber-500/10">
              <span className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center mb-3 shadow-lg shadow-amber-500/30">
                👑
              </span>
              <Avatar src={top3[0].profile_image} name={top3[0].name} size="xl" className="ring-4 ring-amber-500/60 mb-3" />
              <h3 className="text-lg font-extrabold text-white">{top3[0].name}</h3>
              <p className="text-xs text-amber-300 font-medium mb-3">{top3[0].domain_name || 'General'}</p>
              <div className="mt-auto pt-3 border-t border-slate-800 w-full flex items-center justify-around text-xs">
                <div>
                  <span className="font-extrabold text-amber-400 text-xl block">{top3[0].total_points}</span>
                  <span className="text-[10px] text-slate-400">Points</span>
                </div>
                <div>
                  <span className="font-extrabold text-slate-200 text-xl block">{top3[0].completed_tasks}</span>
                  <span className="text-[10px] text-slate-400">Tasks</span>
                </div>
              </div>
            </Card>

            {/* 3rd Place */}
            <Card className="order-3 sm:order-3 flex flex-col items-center text-center p-6 bg-slate-900/80 border-slate-800 relative">
              <span className="w-8 h-8 rounded-full bg-amber-800/80 text-amber-200 font-black text-sm flex items-center justify-center mb-3 shadow-md">
                3
              </span>
              <Avatar src={top3[2].profile_image} name={top3[2].name} size="lg" className="ring-4 ring-amber-800/40 mb-3" />
              <h3 className="text-base font-bold text-slate-100">{top3[2].name}</h3>
              <p className="text-xs text-slate-400 mb-3">{top3[2].domain_name || 'General'}</p>
              <div className="mt-auto pt-3 border-t border-slate-800 w-full flex items-center justify-around text-xs">
                <div>
                  <span className="font-extrabold text-white text-base block">{top3[2].total_points}</span>
                  <span className="text-[10px] text-slate-400">Points</span>
                </div>
                <div>
                  <span className="font-extrabold text-slate-300 text-base block">{top3[2].completed_tasks}</span>
                  <span className="text-[10px] text-slate-400">Tasks</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Full Table */}
        <Card className="p-0 border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Full Rankings Roster</h3>
            <span className="text-xs text-slate-400">{leaderboard.length} Members Listed</span>
          </div>

          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={6} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                    <th className="py-3.5 px-4">Member</th>
                    <th className="py-3.5 px-4">Domain</th>
                    <th className="py-3.5 px-4 text-center">Tasks Completed</th>
                    <th className="py-3.5 px-4 text-right">Total Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {leaderboard.map((row) => (
                    <tr key={row.user_id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-center font-bold">
                        {row.rank === 1 ? (
                          <span className="text-amber-400 text-sm">🥇 #1</span>
                        ) : row.rank === 2 ? (
                          <span className="text-slate-300 text-sm">🥈 #2</span>
                        ) : row.rank === 3 ? (
                          <span className="text-amber-600 text-sm">🥉 #3</span>
                        ) : (
                          <span className="text-slate-400">#{row.rank}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={row.profile_image} name={row.name} size="sm" />
                          <span className="font-semibold text-slate-100">{row.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
                          {row.domain_name || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-medium">
                        {row.completed_tasks} tasks
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-base font-extrabold text-indigo-400">
                          {row.total_points}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">pts</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
