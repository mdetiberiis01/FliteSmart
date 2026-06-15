'use client';

import { useState } from 'react';
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
  const { user } = useAuth();
  const homeAirport = user?.user_metadata?.home_airport as string | undefined;
  const router = useRouter();
  const [needsOrigin, setNeedsOrigin] = useState(false);

  function handleTrendingSelect(dest: TrendingDest) {
    hook.updateField('destination', dest.destination);
    if (hook.form.origin) {
      setNeedsOrigin(false);
      const params = new URLSearchParams({
        origin: hook.form.origin,
        originName: hook.form.originName || hook.form.origin,
        destination: dest.destination,
        flexibility: hook.form.flexibility,
        tripDays: String(hook.form.tripDays ?? 7),
      });
      router.push(`/results?${params.toString()}`);
    } else {
      setNeedsOrigin(true);
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('input[placeholder*="City, airport"]');
        input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input?.focus();
      }, 50);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0a0a0a]">
      <Nav activePage="flights" />

      {/* Trust bar */}
      <div className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/8 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-white/40">
          {TRUST_ITEMS.map((item, i) => (
            <motion.span
              key={item.strong}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className={i > 0 ? (i === 1 ? 'hidden sm:inline' : 'hidden md:inline') : ''}
            >
              {i > 0 && <span className="text-slate-300 dark:text-white/20 mr-6 hidden sm:inline">·</span>}
              <strong className="text-slate-700 dark:text-white/70">{item.strong}</strong>{item.rest}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-sky-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/40 dark:to-[#0a0a0a] border-b border-slate-100 dark:border-white/8 pt-10 pb-14 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Headline */}
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-2"
            >
              Find your next flight.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-slate-500 dark:text-white/50 text-lg"
            >
              Flexible dates · Real price history · No booking fees
            </motion.p>
          </div>

          {/* Two-column layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 items-start"
          >
            <div>
              {needsOrigin && (
                <div className="mb-3 px-4 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-300 text-sm font-medium flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2c-.5.1-.9.5-.7 1l2.3 4c.3.5.9.7 1.5.5L9 10.5 11 13l-2 3.5c-.3.5-.1 1.1.4 1.4l4 2.3c.5.2 1 0 1-.5z" />
                  </svg>
                  Destination set! Now enter your departure city to search.
                </div>
              )}
              <SearchForm hook={hook} />
            </div>
            <TrendingDestinations onSelect={handleTrendingSelect} homeAirport={homeAirport} />
          </motion.div>

        </div>
      </section>

      {/* Features */}
      <section className="bg-white dark:bg-[#0a0a0a] py-20 px-6 flex-1">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-sm font-semibold uppercase tracking-widest text-slate-400 dark:text-white/40 mb-10 text-center"
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
                className="flex gap-5 p-6 rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] hover:border-slate-200 dark:hover:border-white/20 transition"
              >
                <div className="shrink-0 mt-0.5 w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-sky-500" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{f.title}</h3>
                  <p className="text-slate-500 dark:text-white/50 text-sm leading-relaxed">{f.desc}</p>
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
