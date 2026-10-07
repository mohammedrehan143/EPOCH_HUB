'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskClaimModal } from '@/components/tasks/TaskClaimModal';
import { TaskSubmissionModal } from '@/components/tasks/TaskSubmissionModal';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import { Event, Task, User, Submission } from '@/types';
import { formatDate } from '@/lib/utils';
import { Calendar, ArrowLeft, Layers, CheckSquare, Sparkles } from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [domainFilter, setDomainFilter] = useState('');

  // Modals
  const [claimTask, setClaimTask] = useState<Task | null>(null);
  const [submitTask, setSubmitTask] = useState<Task | null>(null);
  const [reviewSubmission, setReviewSubmission] = useState<Submission | null>(null);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
        setTasks(data.tasks || []);
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

    fetchEvent();
  }, [eventId]);

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

  if (loading) {
    return (
      <AppShell>
        <div className="p-12 text-center text-slate-400">Loading event details...</div>
      </AppShell>
    );
  }

  if (!event) {
    return (
      <AppShell>
        <div className="p-12 text-center space-y-3">
          <p className="text-slate-400">Event not found</p>
          <Link href="/events">
            <Button variant="outline">Back to Events</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const filteredTasks = domainFilter ? tasks.filter(t => t.domain_id === domainFilter) : tasks;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Events</span>
          </Link>
        </div>

        {/* Hero Cover */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="h-56 sm:h-72 w-full relative">
            <img
              src={event.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={event.status === 'Active' ? 'primary' : 'success'}>
                  {event.status}
                </Badge>
                <span className="text-xs text-slate-300 font-medium bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-800">
                  {formatDate(event.start_date)} - {formatDate(event.end_date)}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {event.name}
              </h1>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              {event.description}
            </p>

            {/* Overall Progress */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">Overall Event Completion</span>
                <span className="text-indigo-400 font-bold text-sm">{event.progress_percentage || 0}%</span>
              </div>
              <ProgressBar value={event.progress_percentage || 0} color="gradient" />
            </div>

            {/* Participating Domains Breakdown Cards */}
            <div>
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Domain Breakdown & Task Allocations</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {event.participating_domains?.map((dom: any) => {
                  const isSelected = domainFilter === dom.id;
                  return (
                    <button
                      key={dom.id}
                      onClick={() => setDomainFilter(isSelected ? '' : dom.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-200">{dom.name} Domain</p>
                      <p className="text-lg font-black text-indigo-400 mt-1">
                        {dom.domain_task_count || 0} <span className="text-[11px] font-normal text-slate-400">Tasks</span>
                      </p>
                      <p className="text-[10px] text-emerald-400 font-medium">
                        {dom.domain_completed_task_count || 0} Completed
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-400" />
              <span>Event Tasks ({filteredTasks.length})</span>
            </h2>
            {domainFilter && (
              <Button variant="ghost" size="sm" onClick={() => setDomainFilter('')} className="text-xs">
                Clear Domain Filter
              </Button>
            )}
          </div>

          {filteredTasks.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-500">
              No tasks currently listed under this domain for this event.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTasks.map((task) => (
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
        </div>

        {/* Claim Modal */}
        <TaskClaimModal
          task={claimTask}
          isOpen={!!claimTask}
          onClose={() => setClaimTask(null)}
          onClaimSuccess={() => fetchEvent()}
        />

        {/* Submit Modal */}
        <TaskSubmissionModal
          task={submitTask}
          isOpen={!!submitTask}
          onClose={() => setSubmitTask(null)}
          onSubmitSuccess={() => fetchEvent()}
        />

        {/* Review Modal */}
        <ReviewModal
          submission={reviewSubmission}
          isOpen={!!reviewSubmission}
          onClose={() => setReviewSubmission(null)}
          onReviewSuccess={() => fetchEvent()}
        />
      </div>
    </AppShell>
  );
}
