import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentUser } from '@/lib/auth/session';
import { isReviewer, isSuperAdmin } from '@/lib/auth/rbac';
import { Shield, Users, FileCheck, Coins, LayoutDashboard } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || !isReviewer(user)) {
    redirect('/dashboard');
  }

  return (
    <AppShell initialUser={user}>
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">Epoch Admin Portal</h1>
          </div>
          <p className="text-xs text-slate-400">
            Club operations, member directory, deliverable reviews, and audit ledger controls.
          </p>

          <div className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-none">
            <Link
              href="/admin"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors shrink-0"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
              <span>Dashboard Overview</span>
            </Link>
            {isSuperAdmin(user) && (
              <Link
                href="/admin/users"
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors shrink-0"
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>User Directory</span>
              </Link>
            )}
            <Link
              href="/admin/reviews"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors shrink-0"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Review Submissions</span>
            </Link>
            {isSuperAdmin(user) && (
              <Link
                href="/admin/points"
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors shrink-0"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Points & Penalties</span>
              </Link>
            )}
          </div>
        </div>

        {children}
      </div>
    </AppShell>
  );
}
