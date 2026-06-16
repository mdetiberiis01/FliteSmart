'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getUser } from '@/lib/supabase/auth';
import { OriginInput } from '@/components/search/OriginInput';
import { DestinationInput } from '@/components/search/DestinationInput';
import { DateFlexibilityPicker } from '@/components/search/DateFlexibilityPicker';
import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';
import type { SearchParams } from '@/types/search';
import type { User } from '@supabase/supabase-js';

type Status = 'idle' | 'submitting' | 'success' | 'error';
type Flexibility = SearchParams['flexibility'];

const TRIP_DAY_PRESETS = [3, 5, 7, 10, 14, 21];

function AddAlertContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [origin, setOrigin] = useState(searchParams.get('origin') || '');
  const [originName, setOriginName] = useState(searchParams.get('originName') || '');
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [maxPrice, setMaxPrice] = useState('');
  const [flexibility, setFlexibility] = useState<Flexibility>('anytime');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [tripDays, setTripDays] = useState<number>(7);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function load() {
      const u = await getUser();
      if (!u) {
        router.push('/login');
        return;
      }
      setUser(u);
    }
    load();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          origin,
          originName,
          destination,
          maxPrice: Number(maxPrice),
          userId: user.id,
          flexibility,
          customDateStart: flexibility === 'custom' ? customDateStart : undefined,
          customDateEnd: flexibility === 'custom' ? customDateEnd : undefined,
          tripDays,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
      toast.success('Price alert created');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">

      <Nav />

      <section className="bg-slate-50 border-b border-slate-200 pt-16 pb-24 px-4 flex-1">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Add a price alert</h1>
            <p className="text-slate-500 text-lg">
              We&apos;ll email you when prices drop below your target.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
            {status === 'success' ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-4">✓</div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Alert created!</h2>
                <p className="text-slate-500 text-sm">
                  We&apos;ll email you when prices drop below your target.
                </p>
                <button
                  onClick={() => router.push('/account')}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition"
                >
                  Back to my account
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1: From / To */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <OriginInput
                    value={origin}
                    displayName={originName}
                    onChange={(code, name) => {
                      setOrigin(code);
                      setOriginName(name);
                    }}
                  />
                  <DestinationInput
                    value={destination}
                    onChange={(val) => setDestination(val)}
                  />
                </div>

                {/* Row 2: When / Trip length */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-5 border-b border-slate-200">
                  <DateFlexibilityPicker
                    value={flexibility}
                    customStart={customDateStart}
                    customEnd={customDateEnd}
                    onChange={(f, start, end) => {
                      setFlexibility(f);
                      if (start !== undefined) setCustomDateStart(start);
                      if (end !== undefined) setCustomDateEnd(end);
                    }}
                  />

                  <div>
                    <label className="block text-sm text-slate-600 mb-2">Trip length</label>
                    <div className="flex flex-wrap items-center gap-2">
                      {TRIP_DAY_PRESETS.map((days) => (
                        <motion.button
                          key={days}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setTripDays(days)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                            tripDays === days
                              ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10'
                              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                        >
                          {days}d
                        </motion.button>
                      ))}
                      <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5">
                        <input
                          type="number"
                          min={1}
                          max={90}
                          value={TRIP_DAY_PRESETS.includes(tripDays) ? '' : tripDays}
                          onChange={(e) => {
                            const v = parseInt(e.target.value);
                            if (!isNaN(v) && v >= 1 && v <= 90) setTripDays(v);
                          }}
                          placeholder="Custom"
                          className="w-16 bg-transparent text-slate-700 text-sm focus:outline-none placeholder-slate-400 text-center"
                        />
                        <span className="text-slate-400 text-xs">days</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Max price */}
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Max price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">$</span>
                    <input
                      type="number"
                      required
                      min={1}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="800"
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
                    />
                  </div>
                </div>

                {status === 'error' && (
                  <p className="text-red-500 text-sm">{errorMsg}</p>
                )}

                <div className="flex items-center justify-between">
                  <Link href="/account" className="text-sm text-slate-400 hover:text-slate-900 transition">
                    Cancel
                  </Link>
                  <motion.button
                    type="submit"
                    disabled={status === 'submitting'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-10 py-3 rounded-xl font-semibold text-white bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg text-base"
                  >
                    {status === 'submitting' ? 'Saving…' : 'Add alert →'}
                  </motion.button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}

export default function AddAlertPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AddAlertContent />
    </Suspense>
  );
}
