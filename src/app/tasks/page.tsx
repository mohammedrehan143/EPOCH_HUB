'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskClaimModal } from '@/components/tasks/TaskClaimModal';
import { TaskSubmissionModal } from '@/components/tasks/TaskSubmissionModal';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';
import { Task, Domain, Event, User, Submission } from '@/types';
import { canCreateTask } from '@/lib/auth/rbac';
import { Search, Plus, Filter, CheckSquare, Sparkles } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Modals state
  const [claimTask, setClaimTask] = useState<Task | null>(null);
  const [submitTask, setSubmitTask] = useState<Task | null>(null);
  const [reviewSubmission, setReviewSubmission] = useState<Submission | null>(null);

  // Create Task Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEventId, setNewEventId] = useState('');
  const [newDomainId, setNewDomainId] = useState('');
  const [newPoints, setNewPoints] = useState('10');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [newDeadline, setNewDeadline] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Load User & Metadata
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(d => setCurrentUser(d.user || null))
      .catch(() => {});

    fetch('/api/domains')
      .then(res => res.json())
      .then(d => setDomains(d.domains || []))
      .catch(() => {});

    fetch('/api/events')
      .then(res => res.json())
      .then(d => setEvents(d.events || []))
      .catch(() => {});
  }, []);

  // Fetch Tasks with filters
  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedDomain) params.append('domainId', selectedDomain);
      if (selectedEvent) params.append('eventId', selectedEvent);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedPriority) params.append('priority', selectedPriority);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [search, selectedDomain, selectedEvent, selectedStatus, selectedPriority]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: newEventId || events[0]?.id,
          domain_id: newDomainId || domains[0]?.id,
          title: newTitle.trim(),
          description: newDesc.trim(),
          points: parseInt(newPoints),
          priority: newPriority,
          deadline: newDeadline
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create task');
      }

      setIsCreateOpen(false);
      setNewTitle('');
      setNewDesc('');
      loadTasks();
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleReviewTrigger = async (task: Task) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.submissions && data.submissions.length > 0) {
          setReviewSubmission(data.submissions[0]);
        }
      }
    } catch {
      // ignore
    }
  };

  const isUserAllowedToCreate = canCreateTask(currentUser);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-indigo-400" />
              <span>Task Discovery & Claiming</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Browse available tasks across domains, take ownership, deliver outputs, and earn club points.
            </p>
          </div>

          {isUserAllowedToCreate && (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                if (events.length > 0) setNewEventId(events[0].id);
                if (domains.length > 0) setNewDomainId(currentUser?.domain_id || domains[0].id);
                // default deadline in 3 days
                const d = new Date(Date.now() + 3 * 86400000);
                setNewDeadline(d.toISOString().slice(0, 16));
                setIsCreateOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Create Task
            </Button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative lg:col-span-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Domain Filter */}
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Domains</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            {/* Event Filter */}
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Events</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">✨ Available for Claim</option>
              <option value="CLAIMED">⏳ Claimed</option>
              <option value="UNDER_REVIEW">📋 Under Review</option>
              <option value="APPROVED">✅ Approved</option>
              <option value="REJECTED">✏️ Changes Requested</option>
              <option value="MISSED">⚠️ Missed Deadline</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value="URGENT">🚨 Urgent</option>
              <option value="HIGH">🔥 High</option>
              <option value="MEDIUM">⚡ Medium</option>
              <option value="LOW">🌱 Low</option>
            </select>
          </div>
        </div>

        {/* Task Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks match your filters"
            description="Try clearing your domain, event, or status filter to discover more club tasks."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setSelectedDomain('');
                  setSelectedEvent('');
                  setSelectedStatus('');
                  setSelectedPriority('');
                }}
              >
                Reset Filters
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                currentUser={currentUser}
                onClaimClick={(t) => setClaimTask(t)}
                onSubmitClick={(t) => setSubmitTask(t)}
                onReviewClick={(t) => handleReviewTrigger(t)}
              />
            ))}
          </div>
        )}

        {/* Claim Confirmation Modal */}
        <TaskClaimModal
          task={claimTask}
          isOpen={!!claimTask}
          onClose={() => setClaimTask(null)}
          onClaimSuccess={() => loadTasks()}
        />

        {/* Task Deliverable Submission Modal */}
        <TaskSubmissionModal
          task={submitTask}
          isOpen={!!submitTask}
          onClose={() => setSubmitTask(null)}
          onSubmitSuccess={() => loadTasks()}
        />

        {/* Review Deliverable Modal */}
        <ReviewModal
          submission={reviewSubmission}
          isOpen={!!reviewSubmission}
          onClose={() => setReviewSubmission(null)}
          onReviewSuccess={() => loadTasks()}
        />

        {/* Create Task Modal */}
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Club Task"
          description="Assign tasks to events and domains with point rewards and deadlines."
          maxWidth="lg"
        >
          <form onSubmit={handleCreateTask} className="space-y-4">
            <Input
              label="Task Title *"
              placeholder="e.g. Build Registration QR Scanner"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Description & Deliverables *</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Clearly describe the objective, expected deliverable formats, and instructions..."
                rows={3}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Associated Event *"
                value={newEventId}
                onChange={(e) => setNewEventId(e.target.value)}
                options={events.map(ev => ({ value: ev.id, label: ev.name }))}
              />

              <Select
                label="Domain *"
                value={newDomainId}
                onChange={(e) => setNewDomainId(e.target.value)}
                options={domains.map(d => ({ value: d.id, label: `${d.name} Domain` }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Points Reward *"
                value={newPoints}
                onChange={(e) => setNewPoints(e.target.value)}
                options={[
                  { value: '2', label: '+2 Points (Small)' },
                  { value: '5', label: '+5 Points (Normal)' },
                  { value: '10', label: '+10 Points (Important)' },
                  { value: '20', label: '+20 Points (Major)' },
                  { value: '30', label: '+30 Points (Critical)' },
                ]}
              />

              <Select
                label="Priority *"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                options={[
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'URGENT', label: 'Urgent' },
                ]}
              />

              <Input
                label="Deadline Date & Time *"
                type="datetime-local"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                required
              />
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
                <Plus className="w-4 h-4 mr-1.5" /> Publish Task
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
