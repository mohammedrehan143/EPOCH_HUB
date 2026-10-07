'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Domain } from '@/types';
import { Layers, Users, CheckCircle2, Award, ArrowRight, ShieldCheck } from 'lucide-react';

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/domains')
      .then(res => res.json())
      .then(d => {
        setDomains(d.domains || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-400" />
            <span>Club Domains Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Epoch Society is organized into 8 functional domains driving engineering, design, media, and operations.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading domains...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {domains.map((dom) => (
              <Card
                key={dom.id}
                className="flex flex-col justify-between hover:border-indigo-500/40 hover:shadow-xl transition-all duration-200 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                      {dom.name} Domain
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> {dom.total_points || 0} pts
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                      {dom.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {dom.description}
                    </p>
                  </div>

                  {/* Domain Head */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
                    <Avatar src={dom.head_avatar} name={dom.head_name || 'Lead'} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">
                        {dom.head_name || 'Unassigned'}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-indigo-400" /> Domain Head
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                      <span className="block text-[10px] text-slate-400">Members</span>
                      <span className="font-extrabold text-slate-200">{dom.member_count || 0}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                      <span className="block text-[10px] text-slate-400">Active</span>
                      <span className="font-extrabold text-indigo-400">{dom.active_tasks_count || 0}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                      <span className="block text-[10px] text-slate-400">Done</span>
                      <span className="font-extrabold text-emerald-400">{dom.completed_tasks_count || 0}</span>
                    </div>
                  </div>

                  <Link href={`/domains/${dom.id}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <span>Explore Domain</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
