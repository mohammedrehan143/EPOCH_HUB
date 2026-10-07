'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { User } from '@/types';

export interface AppShellProps {
  children: React.ReactNode;
  initialUser?: User | null;
}

export function AppShell({ children, initialUser }: AppShellProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser || null);

  useEffect(() => {
    if (!initialUser) {
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setCurrentUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, [initialUser]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Desktop Persistent Sidebar */}
      <Sidebar currentUser={currentUser} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header currentUser={currentUser} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
