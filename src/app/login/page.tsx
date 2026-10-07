'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Phone, ArrowRight, Sparkles, Shield, User, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('+919876543210');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter your mobile number');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/phone-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Mobile number not found');
      }

      // Successful login - comes straight in!
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMember = (phoneNumber: string) => {
    setPhone(phoneNumber);
    setError(null);
  };

  const registeredMembers = [
    { name: 'Mohammed Rehan', role: 'Super Admin', phone: '+919876543210', badgeColor: 'text-purple-400 border-purple-500/30' },
    { name: 'Sarah Jenkins', role: 'Tech Head', phone: '+919876543211', badgeColor: 'text-indigo-400 border-indigo-500/30' },
    { name: 'Rohan Sharma', role: 'Design Head', phone: '+919876543215', badgeColor: 'text-pink-400 border-pink-500/30' },
    { name: 'Alex Turner', role: 'Tech Member', phone: '+919876543212', badgeColor: 'text-emerald-400 border-emerald-500/30' },
    { name: 'Priya Nair', role: 'Design Member', phone: '+919876543213', badgeColor: 'text-cyan-400 border-cyan-500/30' },
    { name: 'Dev Mehta', role: 'Reviewer', phone: '+919876543214', badgeColor: 'text-amber-400 border-amber-500/30' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-black text-2xl shadow-xl shadow-indigo-600/30 mb-2">
            E
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            EPOCH HUB
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            One Club. One Community. One Place to Get Things Done.
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl p-6 sm:p-8 space-y-6">
          <form onSubmit={handlePhoneLogin} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-slate-100">Sign in with Mobile Number</h2>
              <p className="text-xs text-slate-400">
                Enter your registered club mobile number to sign in directly.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Registered Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210 or 9876543210"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                />
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full py-3 font-semibold text-sm" isLoading={loading}>
              <span>Enter Epoch Hub</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* Quick Select Registered Test Numbers */}
          <div className="pt-5 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Registered Database Accounts
              </span>
              <span className="text-[10px] text-slate-500">Click to fill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {registeredMembers.map((m) => (
                <button
                  type="button"
                  key={m.phone}
                  onClick={() => handleSelectMember(m.phone)}
                  className={`p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border text-left transition-all ${
                    phone === m.phone ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-800'
                  }`}
                >
                  <p className="font-semibold text-slate-200">{m.name}</p>
                  <div className="flex items-center justify-between text-[10px] mt-0.5">
                    <span className={`font-medium ${m.badgeColor}`}>{m.role}</span>
                    <span className="text-slate-500 font-mono">{m.phone.slice(-10)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
