'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, LogOut, Shield, ChevronDown, UserCheck, Sparkles, X } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { NotificationBell } from './NotificationBell';
import { User } from '@/types';

export interface HeaderProps {
  currentUser: User | null;
}

export function Header({ currentUser }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const switchRef = useRef<HTMLDivElement>(null);

  // Search debouncing
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch {
        // ignore
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listeners
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults(null);
      }
      if (switchRef.current && !switchRef.current.contains(e.target as Node)) {
        setShowSwitchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleDevSwitch = async (role: string) => {
    await fetch('/api/auth/dev-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    setShowSwitchDropdown(false);
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Brand logo for mobile (sidebar handles desktop) */}
      <div className="flex items-center gap-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
            E
          </div>
          <span className="font-bold text-sm tracking-tight text-white">EPOCH HUB</span>
        </Link>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md relative hidden sm:block" ref={searchRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, events, domains, members..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults(null); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResults && (
          <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 max-h-96 overflow-y-auto space-y-3">
            {searchResults.tasks?.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 px-2">Tasks</span>
                <div className="mt-1 space-y-1">
                  {searchResults.tasks.map((t: any) => (
                    <Link
                      key={t.id}
                      href={`/tasks/${t.id}`}
                      onClick={() => setSearchResults(null)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 transition-colors"
                    >
                      <span className="font-medium truncate">{t.title}</span>
                      <span className="text-[10px] text-indigo-400 font-bold shrink-0">+{t.points} pts</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {searchResults.events?.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 px-2">Events</span>
                <div className="mt-1 space-y-1">
                  {searchResults.events.map((e: any) => (
                    <Link
                      key={e.id}
                      href={`/events/${e.id}`}
                      onClick={() => setSearchResults(null)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 transition-colors"
                    >
                      <span className="font-medium truncate">{e.name}</span>
                      <span className="text-[10px] text-slate-400">{e.status}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {searchResults.domains?.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 px-2">Domains</span>
                <div className="mt-1 space-y-1">
                  {searchResults.domains.map((d: any) => (
                    <Link
                      key={d.id}
                      href={`/domains/${d.id}`}
                      onClick={() => setSearchResults(null)}
                      className="block p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 transition-colors font-medium"
                    >
                      {d.name} Domain
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {searchResults.users?.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 px-2">Members</span>
                <div className="mt-1 space-y-1">
                  {searchResults.users.map((u: any) => (
                    <Link
                      key={u.id}
                      href={`/profile`}
                      onClick={() => setSearchResults(null)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 transition-colors"
                    >
                      <Avatar src={u.profile_image} name={u.name} size="sm" />
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.position || u.role}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!searchResults.tasks?.length && !searchResults.events?.length && !searchResults.domains?.length && !searchResults.users?.length && (
              <p className="p-4 text-center text-xs text-slate-400">No results found for "{searchQuery}"</p>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Role Switcher (Development helper) */}
        <div className="relative" ref={switchRef}>
          <button
            onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-indigo-300 font-medium transition-colors"
            title="Switch Test Account"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Switch Role</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showSwitchDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
              <span className="block px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400">Switch Test User</span>
              <button
                onClick={() => handleDevSwitch('super_admin')}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
              >
                <span>Mohammed Rehan</span>
                <span className="text-[10px] text-purple-400 font-semibold">Super Admin</span>
              </button>
              <button
                onClick={() => handleDevSwitch('domain_head')}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
              >
                <span>Sarah Jenkins</span>
                <span className="text-[10px] text-indigo-400 font-semibold">Tech Head</span>
              </button>
              <button
                onClick={() => handleDevSwitch('member')}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
              >
                <span>Alex Turner</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Member</span>
              </button>
              <button
                onClick={() => handleDevSwitch('reviewer')}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
              >
                <span>Dev Mehta</span>
                <span className="text-[10px] text-amber-400 font-semibold">Reviewer</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* User Info / Profile link */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <Link href="/profile" className="flex items-center gap-2.5 group">
              <Avatar
                src={currentUser.profile_image}
                name={currentUser.name}
                size="sm"
                className="ring-2 ring-indigo-500/20 group-hover:ring-indigo-500 transition-all"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-400 capitalize">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors ml-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-sm"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
