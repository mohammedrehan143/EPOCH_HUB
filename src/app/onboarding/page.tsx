'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Sparkles, ArrowRight } from 'lucide-react';

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '+91';

  const [name, setName] = useState('');
  const [domainId, setDomainId] = useState('dom-tech');
  const [position, setPosition] = useState('Core Member');
  const [avatarSeed, setAvatarSeed] = useState('epoch-user');
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/domains')
      .then(res => res.json())
      .then(data => {
        if (data.domains) {
          setDomains(data.domains);
          if (data.domains.length > 0) {
            setDomainId(data.domains[0].id);
          }
        }
      })
      .catch(() => {});
  }, []);

  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || avatarSeed)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          name: name.trim(),
          domain_id: domainId,
          position: position.trim(),
          profile_image: avatarUrl
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete profile setup');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-xl mb-2 shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Complete Your Profile</h1>
          <p className="text-xs text-slate-400">
            Welcome to Epoch Hub! Tell us about yourself to finish setting up your account.
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar Preview */}
            <div className="flex flex-col items-center justify-center gap-2 pb-2">
              <Avatar src={avatarUrl} name={name || 'User'} size="xl" />
              <button
                type="button"
                onClick={() => setAvatarSeed(Math.random().toString(36).slice(2, 8))}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Randomize Avatar
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Mobile Number</label>
              <input
                type="text"
                disabled
                value={phone}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-sm text-slate-400 font-mono"
              />
            </div>

            <Input
              label="Full Name *"
              placeholder="e.g. Alex Turner"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Select
              label="Primary Club Domain *"
              value={domainId}
              onChange={(e) => setDomainId(e.target.value)}
              options={domains.map(d => ({ value: d.id, label: `${d.name} Domain` }))}
            />

            <Input
              label="Position / Role *"
              placeholder="e.g. Junior Developer, Visual Designer"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            />

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full py-2.5" isLoading={loading}>
              <span>Enter Epoch Hub</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">Loading onboarding...</div>}>
      <OnboardingForm />
    </Suspense>
  );
}
