'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getUser } from '@/lib/supabase/auth';
import { OriginInput } from '@/components/search/OriginInput';
import { DestinationInput } from '@/components/search/DestinationInput';
import { DateFlexibilityPicker } from '@/components/search/DateFlexibilityPicker';
import { Nav } from '@/components/ui/Nav';
import type { SearchParams } from '@/types/search';
import type { User } from '@supabase/supabase-js';

type Status = 'idle' | 'submitting' | 'success' | 'error';
type Flexibility = SearchParams['flexibility'];

const TRIP_DAY_PRESETS = [3, 5, 7, 10, 14, 21];

export default function AddAlertPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [origin, setOrigin] = useState('');
  const [originName, setOriginName] = useState('');
  const [destination, setDestination] = useState('');
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
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen flex flex-col">

      <Nav />

      {/* Content */}
      <section className="bg-gradient-to-b from-sky-50 via-sky-50/40 to-white dark:from-slate-900 dark:via-slate-900/40 dark:to-[#0a0a0a] pt-16 pb-24 px-4 flex-1">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-3 tracking-tight">Add a price alert</h1>
            <p className="text-black/50 dark:text-white/50 text-lg">
              We&apos;ll email you when prices drop below your target.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/40 p-6 md:p-8">
            {status === 'success' ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-4">✓</div>
                <h2 className="text-xl font-semibold text-black dark:text-white mb-2">Alert created!</h2>
                <p className="text-black/55 dark:text-white/55 text-sm">
                  We&apos;ll email you when prices drop below your target.
                </p>
                <button
                  onClick={() => router.push('/account')}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-semibold hover:bg-black/80 dark:hover:bg-white/80 transition"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-5 border-b border-black/8 dark:border-white/8">
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
                    <label className="block text-sm text-black/60 dark:text-white/60 mb-2">Trip length</label>
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
                              ? 'bg-black border-black text-white shadow-lg shadow-black/10 dark:bg-white dark:border-white dark:text-black dark:shadow-white/10'
                              : 'bg-black/5 border-black/20 text-black/70 hover:bg-black/10 hover:text-black dark:bg-white/5 dark:border-white/20 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white'
                          }`}
                        >
                          {days}d
                        </motion.button>
                      ))}
                      <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-full px-3 py-1.5">
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
                          className="w-16 bg-transparent text-black/70 dark:text-white/70 text-sm focus:outline-none placeholder-black/30 dark:placeholder-white/30 text-center"
                        />
                        <span className="text-black/40 dark:text-white/40 text-xs">days</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Max price */}
                <div>
                  <label className="block text-sm text-black/60 dark:text-white/60 mb-1">Max price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 text-sm select-none">$</span>
                    <input
                      type="number"
                      required
                      min={1}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="800"
                      className="w-full bg-black/5 dark:bg-white/10 border border-black/20 dark:border-white/20 rounded-xl pl-8 pr-4 py-3 text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/40 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {status === 'error' && (
                  <p className="text-red-500 text-sm">{errorMsg}</p>
                )}

                <div className="flex items-center justify-between">
                  <Link href="/account" className="text-sm text-black/45 dark:text-white/45 hover:text-black dark:hover:text-white transition">
                    Cancel
                  </Link>
                  <motion.button
                    type="submit"
                    disabled={status === 'submitting'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-10 py-3 rounded-xl font-semibold text-white bg-black hover:bg-black/85 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-black/10 text-base dark:text-black dark:bg-white dark:hover:bg-white/85 dark:shadow-white/10"
                  >
                    {status === 'submitting' ? 'Saving…' : 'Add alert →'}
                  </motion.button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-black/8 dark:border-white/8 py-8 px-6 text-center text-xs text-black/35 dark:text-white/35">
        © {new Date().getFullYear()} FliteSmart · Prices sourced via Kiwi.com · Not affiliated with any airline
      </footer>

    </div>
  );
}
