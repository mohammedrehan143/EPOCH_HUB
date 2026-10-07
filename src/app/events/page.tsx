'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Event, Domain, User } from '@/types';
import { formatDate } from '@/lib/utils';
import { isSuperAdmin } from '@/lib/auth/rbac';
import { Calendar, Plus, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Create Event state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
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

    fetch('/api/domains')
      .then(res => res.json())
      .then(d => setDomains(d.domains || []))
      .catch(() => {});

    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          start_date: startDate,
          end_date: endDate,
          status: 'Active',
          cover_image: coverImage,
          domain_ids: selectedDomains
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create event');
      }

      setIsCreateOpen(false);
      setName('');
      setDescription('');
      fetchEvents();
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredEvents = events.filter(e => {
    if (statusFilter === 'All') return true;
    return e.status === statusFilter;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-400" />
              <span>Club Events & Initiatives</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Major milestones, hackathons, workshops, and technical symposiums driven by Epoch Society.
            </p>
          </div>

          {isSuperAdmin(currentUser) && (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                const now = new Date();
                setStartDate(now.toISOString().slice(0, 10));
                setEndDate(new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10));
                setSelectedDomains(domains.map(d => d.id));
                setIsCreateOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Create Event
            </Button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Active', 'Upcoming', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === tab
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="No events in this category"
            description="Check other tabs or create a new event as club administrator."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => (
              <Card key={evt.id} className="p-0 overflow-hidden flex flex-col justify-between border-slate-800 group hover:border-slate-700 transition-all">
                <div>
                  <div className="h-44 relative bg-slate-800 overflow-hidden">
                    <img
                      src={evt.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                      alt={evt.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <Badge
                        variant={evt.status === 'Active' ? 'primary' : evt.status === 'Completed' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {evt.status}
                      </Badge>
                      <span className="text-[11px] text-slate-300 font-medium bg-slate-950/80 px-2 py-0.5 rounded-full">
                        {formatDate(evt.start_date)} - {formatDate(evt.end_date)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                      {evt.name}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>

                    {/* Participating Domains Badges */}
                    {evt.participating_domains && evt.participating_domains.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {evt.participating_domains.map(d => (
                          <span
                            key={d.id}
                            className="text-[10px] font-medium text-slate-300 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800"
                          >
                            {d.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-3">
                  <div className="pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
                      <span>Tasks Progress</span>
                      <span className="text-indigo-400 font-bold">{evt.progress_percentage || 0}%</span>
                    </div>
                    <ProgressBar value={evt.progress_percentage || 0} color="gradient" />
                  </div>

                  <Link href={`/events/${evt.id}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <span>View Event & Tasks</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Event Modal */}
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Club Event"
          description="Publish a flagship event and assign participating domains."
          maxWidth="lg"
        >
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <Input
              label="Event Name *"
              placeholder="e.g. Annual Tech Symposium 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Overview of the event, goals, and schedule..."
                rows={3}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Start Date *"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <Input
                label="End Date *"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <Input
              label="Cover Image URL"
              placeholder="https://..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Participating Domains</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {domains.map((d) => {
                  const isChecked = selectedDomains.includes(d.id);
                  return (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedDomains(selectedDomains.filter(id => id !== d.id));
                        } else {
                          setSelectedDomains([...selectedDomains, d.id]);
                        }
                      }}
                      className={`p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                        isChecked
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {d.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {createError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={createLoading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={createLoading}>
                <Plus className="w-4 h-4 mr-1.5" /> Publish Event
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
