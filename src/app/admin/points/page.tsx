'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PointTransaction } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { Coins, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AdminPointsPage() {
  const [penalties, setPenalties] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Reverse modal
  const [selectedPenalty, setSelectedPenalty] = useState<PointTransaction | null>(null);
  const [reversalReason, setReversalReason] = useState('Medical leave / excused by head');
  const [reversing, setReversing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchPenalties = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/points?type=MISSED_TASK_PENALTY');
      if (res.ok) {
        const data = await res.json();
        setPenalties(data.transactions || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenalties();
  }, []);

  const handleReversePenalty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPenalty) return;

    setReversing(true);
    try {
      const res = await fetch('/api/points/reverse-penalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: selectedPenalty.id,
          reason: reversalReason.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reverse penalty');
      }

      setMsg('Penalty successfully reversed and +1 point returned to member.');
      setSelectedPenalty(null);
      fetchPenalties();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setReversing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-400" />
          <span>Penalty Audits & Excusal Management</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Review all automatic -1 point deductions for overdue deliverables and reverse or excuse penalties with justification.
        </p>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg(null)} className="text-emerald-400 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Penalties List */}
      <Card className="p-0 border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <CardTitle>Automatic Overdue Penalties ({penalties.length})</CardTitle>
          <span className="text-xs text-slate-400">Strict Single-Deduction Safeguard Active</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading penalty records...</div>
        ) : penalties.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            No active penalties found in the club ledger.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Reason & Task</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4 text-center">Applied At</th>
                  <th className="py-3 px-4 text-center">Deduction</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {penalties.map((pen) => (
                  <tr key={pen.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-100">{pen.user_name}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-rose-300">{pen.reason}</p>
                      {pen.task_title && (
                        <p className="text-[10px] text-slate-400">Task: {pen.task_title}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{pen.event_name || 'N/A'}</td>
                    <td className="py-3 px-4 text-center text-slate-400">{formatDateTime(pen.created_at)}</td>
                    <td className="py-3 px-4 text-center font-bold text-rose-400">-1 pt</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedPenalty(pen)}
                        className="text-xs py-1 text-amber-300 hover:text-white"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" /> Excuse / Reverse
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Reverse Penalty Modal */}
      <Modal
        isOpen={!!selectedPenalty}
        onClose={() => setSelectedPenalty(null)}
        title="Reverse Penalty / Mark Task Excused"
        description={`Member: ${selectedPenalty?.user_name} (Task: ${selectedPenalty?.task_title || selectedPenalty?.reason})`}
        maxWidth="md"
      >
        <form onSubmit={handleReversePenalty} className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
            Reversing this penalty will add a +1 point "PENALTY_REVERSAL" transaction to the user's ledger and restore their leaderboard score.
          </div>

          <Input
            label="Excusal Reason / Justification *"
            value={reversalReason}
            onChange={(e) => setReversalReason(e.target.value)}
            placeholder="e.g. Approved extension granted by Tech Domain Lead"
            required
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setSelectedPenalty(null)} disabled={reversing}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={reversing} className="bg-amber-600 hover:bg-amber-700">
              Confirm Reversal (+1 pt)
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
