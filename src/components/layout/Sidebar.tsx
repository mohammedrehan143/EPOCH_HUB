'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  Calendar,
  CheckSquare,
  Trophy,
  Award,
  History,
  User as UserIcon,
  Shield,
  Users,
  FileCheck,
  Coins,
  Settings,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@/types';

export interface SidebarProps {
  currentUser: User | null;
}

export function Sidebar({ currentUser }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = currentUser?.role === 'super_admin';
  const isReviewer = currentUser?.role === 'reviewer' || currentUser?.role === 'domain_head' || isAdmin;

  const mainNav = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Domains', href: '/domains', icon: Layers },
    { label: 'Events', href: '/events', icon: Calendar },
    { label: 'Tasks', href: '/tasks', icon: CheckSquare },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { label: 'Achievements', href: '/achievements', icon: Award },
    { label: 'Point History', href: '/points', icon: History },
    { label: 'My Profile', href: '/profile', icon: UserIcon },
  ];

  const adminNav = [
    { label: 'Overview', href: '/admin', icon: Shield },
    { label: 'User Directory', href: '/admin/users', icon: Users },
    { label: 'Review Submissions', href: '/admin/reviews', icon: FileCheck },
    { label: 'Manage Points', href: '/admin/points', icon: Coins },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-slate-950 border-r border-slate-800/80 p-4 shrink-0 z-40 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-indigo-600/30">
          E
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
            EPOCH HUB
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">Internal Club Platform</p>
        </div>
      </div>

      {/* User Point Summary Card */}
      {currentUser && (
        <div className="mx-2 mb-5 p-3 rounded-xl bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-500/20">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="text-[11px] font-medium text-slate-400">Total Score</span>
            <span className="text-[11px] font-semibold text-indigo-400">Rank #{currentUser.rank || 1}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-white tracking-tight">
              {currentUser.total_points || 0}
            </span>
            <span className="text-xs text-indigo-400 font-semibold">Club Points</span>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 scrollbar-none">
        <div>
          <span className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Menu
          </span>
          <nav className="mt-2 space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-400')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Navigation */}
        {(isAdmin || isReviewer) && (
          <div>
            <div className="flex items-center justify-between px-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Leadership & Review
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">
                ADMIN
              </span>
            </div>
            <nav className="mt-2 space-y-1">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                      isActive
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-400')} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-800/80 px-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>Epoch Society v1.0</span>
        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </div>
    </aside>
  );
}
