'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Calendar, Trophy, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Tasks', href: '/tasks', icon: CheckSquare },
    { label: 'Events', href: '/events', icon: Calendar },
    { label: 'Ranks', href: '/leaderboard', icon: Trophy },
    { label: 'Profile', href: '/profile', icon: UserIcon },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-2 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all text-[10px] font-medium',
              isActive
                ? 'text-indigo-400 font-semibold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Icon className={cn('w-5 h-5 mb-0.5', isActive ? 'text-indigo-400' : 'text-slate-400')} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
