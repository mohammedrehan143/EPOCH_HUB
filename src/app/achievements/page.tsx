'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Achievement } from '@/types';
import { formatDate } from '@/lib/utils';
import { Award, Zap, Trophy, ShieldCheck, CheckCircle2, Lock, Sparkles } from 'lucide-react';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/achievements')
      .then(res => res.json())
      .then(data => {
        setAchievements(data.achievements || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getIcon = (code: string) => {
    switch (code) {
      case 'FIRST_TASK': return <CheckCircle2 className="w-6 h-6 text-emerald-400" />;
      case 'TEN_TASKS': return <Award className="w-6 h-6 text-indigo-400" />;
      case 'FAST_EXECUTOR': return <Zap className="w-6 h-6 text-amber-400" />;
      case 'TOP_CONTRIBUTOR': return <Trophy className="w-6 h-6 text-amber-300" />;
      case 'PERFECT_EVENT': return <ShieldCheck className="w-6 h-6 text-purple-400" />;
      case 'DOMAIN_CHAMPION': return <Sparkles className="w-6 h-6 text-rose-400" />;
      default: return <Award className="w-6 h-6 text-indigo-400" />;
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Award className="w-7 h-7 text-indigo-400" />
              <span>Badges & Achievements</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Unlock prestigious club badges and earn bonus points through consistent contributions.
            </p>
          </div>

          <div className="p-3 px-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/20 text-xs flex items-center gap-3 shrink-0">
            <div>
              <span className="text-slate-400 block text-[10px]">Unlocked</span>
              <span className="font-extrabold text-white text-base">
                {unlockedCount} / {achievements.length}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              🏆
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading achievements...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {achievements.map((ach) => (
              <Card
                key={ach.id}
                className={`p-6 flex flex-col justify-between border transition-all ${
                  ach.unlocked
                    ? 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/40 border-slate-800/80 opacity-70'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                      ach.unlocked
                        ? 'bg-slate-800/80 border-indigo-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-600'
                    }`}>
                      {ach.unlocked ? getIcon(ach.code) : <Lock className="w-5 h-5 text-slate-600" />}
                    </div>

                    <Badge variant={ach.unlocked ? 'success' : 'outline'} size="sm">
                      {ach.unlocked ? 'Unlocked' : 'Locked'}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-100">{ach.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ach.description}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs">
                  <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                    +{ach.points_reward} Bonus Points
                  </span>

                  {ach.unlocked_at && (
                    <span className="text-[10px] text-slate-400">
                      Earned {formatDate(ach.unlocked_at)}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
