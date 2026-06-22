'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, CalendarDays, Globe } from 'lucide-react';
import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';
import { SearchForm } from '@/components/search/SearchForm';
import { TrendingDestinations, TrendingDest } from '@/components/landing/TrendingDestinations';
import { useSearchForm } from '@/hooks/useSearchForm';
import { useAuth } from '@/lib/auth-context';

const FEATURES = [
  {
    icon: TrendingUp,
    title: 'Real Price History',
    desc: '12-month sparkline charts on every result so you can see if a price is genuinely cheap or just looks cheap.',
  },
  {
    icon: CalendarDays,
    title: 'Flexible Date Search',
    desc: 'No fixed dates needed. Search by Spring, Summer, Fall, Winter, or Anytime — we find the cheapest windows.',
  },
  {
    icon: Globe,
    title: 'Region & Anywhere Search',
    desc: 'Type "Southeast Asia" or "Anywhere" and we surface the best-priced destinations across the whole region.',
  },
];

const TRUST_ITEMS = [
  { strong: '2M+', rest: ' flights searched' },
  { strong: 'Live prices', rest: ' from 750+ airlines' },
  { strong: 'No booking fees', rest: ' — compare and book direct' },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07, ease: EASE } }),
};

export default function Home() {
  const hook = useSearchForm();
  const { user, loading: authLoading } = useAuth();
  const homeAirport = user?.user_metadata?.home_airport as string | undefined;
  const homeAirportName = user?.user_metadata?.home_airport_name as string | undefined;
  const router = useRouter();
  const [needsOrigin, setNeedsOrigin] = useState(false);

  // Priority: typed origin > home airport (account) > geolocation
  // Wait for auth to finish loading before falling back to geo, so we
  // don't start a geo request for a user who actually has a home airport set.
  useEffect(() => {
    if (authLoading) return;                          // wait for auth to resolve
    if (homeAirport || hook.form.origin) return;      // already have an origin
    if (!('geolocation' in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`/api/nearest-airport?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          if (!res.ok) return;
          const data = await res.json();
          if (data.iataCode && !hook.form.origin) {
            hook.updateField('origin', data.iataCode);
            hook.updateField('originName', data.label || data.iataCode);
          }
        } catch {}
      },
      () => {} // permission denied — silently skip
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, homeAirport]);

  function handleTrendingSelect(dest: TrendingDest) {
    const origin = hook.form.origin;
    if (!origin) {
      setNeedsOrigin(true);
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('input[placeholder*="City, airport"]');
        input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input?.focus();
      }, 50);
      return;
    }

    setNeedsOrigin(false);

    // Go directly to the Google Flights link for this exact flight
    if (dest.bookingUrl) {
      window.open(dest.bookingUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // Fallback: results page locked to the tile's date
    hook.updateField('destination', dest.destination);
    const params = new URLSearchParams({
      origin,
      originName: hook.form.originName || origin,
      destination: dest.destination,
      tripDays: String(hook.form.tripDays ?? 7),
      cabinClass: hook.form.cabinClass ?? 'economy',
      travelers: String(hook.form.travelers ?? 1),
    });
    if (dest.departureDate) {
      const end = new Date(dest.departureDate + 'T00:00:00');
      end.setDate(end.getDate() + 4);
      params.set('flexibility', 'custom');
      params.set('customDateStart', dest.departureDate);
      params.set('customDateEnd', end.toISOString().split('T')[0]);
    } else {
      params.set('flexibility', hook.form.flexibility);
    }
    router.push(`/results?${params.toString()}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Nav activePage="flights" />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #023e8a 0%, #0077b6 55%, #00b4d8 100%)' }} className="pt-14 pb-20 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Headline */}
          <div className="text-center mb-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3"
            >
              Find flights at prices<br className="hidden sm:block" /> you&apos;ll actually love.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-white/75 text-lg"
            >
              Flexible dates · Real price history · Book direct
            </motion.p>
          </div>

          {/* Search form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl mx-auto"
          >
            {needsOrigin && (
              <div className="mb-3 px-4 py-2.5 rounded-xl bg-white/15 border border-white/30 text-white text-sm font-medium flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2c-.5.1-.9.5-.7 1l2.3 4c.3.5.9.7 1.5.5L9 10.5 11 13l-2 3.5c-.3.5-.1 1.1.4 1.4l4 2.3c.5.2 1 0 1-.5z" />
                </svg>
                Destination set! Now enter your departure city to search.
              </div>
            )}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <SearchForm hook={hook} />
            </div>
          </motion.div>

        </div>
      </section>

      {/* Trust bar */}
      <div className="bg-slate-50 border-b border-slate-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 text-xs text-slate-500">
          {TRUST_ITEMS.map((item, i) => (
            <motion.span
              key={item.strong}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className={i > 0 ? (i === 1 ? 'hidden sm:inline' : 'hidden md:inline') : ''}
            >
              {i > 0 && <span className="text-slate-300 mr-6 hidden sm:inline">·</span>}
              <strong className="text-slate-700">{item.strong}</strong>{item.rest}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Trending destinations */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <TrendingDestinations
            onSelect={handleTrendingSelect}
            origin={hook.form.origin || homeAirport}
            originName={hook.form.originName || homeAirportName || hook.form.origin || homeAirport}
          />
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-10 text-center"
          >
            Why FliteSmart
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex gap-5 p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition"
              >
                <div className="shrink-0 mt-0.5 w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-brand" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
