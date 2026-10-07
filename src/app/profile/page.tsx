'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { User, Task, Achievement, PointTransaction } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  User as UserIcon,
  Phone,
  Calendar,
  Layers,
  Award,
  Trophy,
  CheckCircle2,
  Clock,
  Edit2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentPoints, setRecentPoints] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.user) {
          const detailRes = await fetch(`/api/users/${meData.user.id}`);
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            setCurrentUser(detailData.user);
            setCompletedTasks(detailData.completedTasks || []);
            setAchievements(detailData.achievements || []);
            setRecentPoints(detailData.recentPoints || []);
            setEditName(detailData.user.name);
            setEditPosition(detailData.user.position || '');
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          position: editPosition.trim()
        })
      });

      if (res.ok) {
        setIsEditOpen(false);
        fetchProfile();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="p-12 text-center text-slate-400">Loading member profile...</div>
      </AppShell>
    );
  }

  if (!currentUser) {
    return (
      <AppShell>
        <div className="p-12 text-center text-slate-400">Profile not found. Please log in.</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <Card className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar
                src={currentUser.profile_image}
                name={currentUser.name}
                size="xl"
                className="ring-4 ring-indigo-500/30"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-black text-white">{currentUser.name}</h1>
                  <Badge variant="primary" size="sm" className="capitalize">
                    {currentUser.role.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-xs text-indigo-400 font-semibold">
                  {currentUser.position || 'Club Contributor'} • {currentUser.domain_name || 'Epoch Domain'}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5" /> {currentUser.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Member since {formatDate(currentUser.join_date)}
                  </span>
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} className="self-start sm:self-center">
              <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
            </Button>
          </div>

          {/* 4 Stats Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Total Points</span>
              <span className="text-xl font-extrabold text-indigo-400">+{currentUser.total_points || 0} pts</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Club Rank</span>
              <span className="text-xl font-extrabold text-amber-300">#{currentUser.rank || 1}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Completed Tasks</span>
              <span className="text-xl font-extrabold text-emerald-400">{currentUser.completed_tasks_count || 0}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Active Tasks</span>
              <span className="text-xl font-extrabold text-purple-400">{currentUser.pending_tasks_count || 0}</span>
            </div>
          </div>
        </Card>

        {/* 2-Column Split: Achievements & Completed Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Achievements Badges */}
          <Card className="border-slate-800 space-y-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <CardTitle>Badges & Accolades ({achievements.length})</CardTitle>
              </div>
            </CardHeader>

            {achievements.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-500">
                Complete tasks and deliver before deadlines to unlock badges!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-indigo-500/20 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20 font-bold">
                      🏆
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate">{ach.title}</p>
                      <p className="text-[10px] text-indigo-400 font-semibold">+{ach.points_reward} pts bonus</p>
                      <p className="text-[10px] text-slate-500">{formatDate(ach.unlocked_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Completed Deliverables History */}
          <Card className="border-slate-800 space-y-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <CardTitle>Verified Deliverables ({completedTasks.length})</CardTitle>
              </div>
            </CardHeader>

            {completedTasks.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-500">
                No approved tasks yet. Claim an open task to get started.
              </p>
            ) : (
              <div className="space-y-2.5">
                {completedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-slate-200 truncate">{t.title}</p>
                      <p className="text-[10px] text-slate-400">{t.event_name} • {t.domain_name}</p>
                    </div>
                    <span className="font-bold text-emerald-400 shrink-0 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      +{t.points} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Edit Profile Modal */}
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Profile"
          description="Update your display name and club position."
          maxWidth="md"
        >
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Full Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
            <Input
              label="Club Position"
              value={editPosition}
              onChange={(e) => setEditPosition(e.target.value)}
              required
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={saving}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
