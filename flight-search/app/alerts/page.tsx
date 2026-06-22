'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingDown, Zap, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';
import { OriginInput } from '@/components/search/OriginInput';
import { DestinationInput } from '@/components/search/DestinationInput';
import { DateFlexibilityPicker } from '@/components/search/DateFlexibilityPicker';
import { useAuth } from '@/lib/auth-context';
import { signIn } from '@/lib/supabase/auth';
import type { SearchParams } from '@/types/search';

type Step = 'form' | 'auth' | 'pending' | 'success';
type AuthMode = 'signin' | 'signup';
type Flexibility = SearchParams['flexibility'];
type Status = 'idle' | 'submitting' | 'error';

const TRIP_DAY_PRESETS = [3, 5, 7, 10, 14, 21];

const inputClass =
  'w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition text-sm';

function flexLabel(f: Flexibility, start?: string, end?: string): string {
  if (f === 'custom' && start && end) return `${start} – ${end}`;
  return { anytime: 'Anytime', spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter', custom: 'Custom' }[f] ?? f;
}

export default function AlertsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect logged-in users straight to the add-alert page
  useEffect(() => {
    if (!loading && user) router.replace('/account/add-alert');
  }, [user, loading, router]);

  // ── Alert form state ──────────────────────────────────────────────────────
  const [origin, setOrigin] = useState('');
  const [originName, setOriginName] = useState('');
  const [destination, setDestination] = useState('');
  const [flexibility, setFlexibility] = useState<Flexibility>('anytime');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [tripDays, setTripDays] = useState(7);
  const [maxPrice, setMaxPrice] = useState('');
  const [formError, setFormError] = useState('');

  // ── Auth state ────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('form');
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authStatus, setAuthStatus] = useState<Status>('idle');
  const [authError, setAuthError] = useState('');

  // ── Step 1: validate form and advance ────────────────────────────────────
  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!origin) { setFormError('Please enter a departure airport.'); return; }
    if (!destination) { setFormError('Please enter a destination.'); return; }
    if (!maxPrice || Number(maxPrice) <= 0) { setFormError('Please enter a max price.'); return; }
    setFormError('');
    setStep('auth');
  }

  // ── Step 2: save alert after auth ─────────────────────────────────────────
  async function saveAlert(userId: string, userEmail: string) {
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        origin,
        originName,
        destination,
        maxPrice: Number(maxPrice),
        userId,
        flexibility,
        customDateStart: flexibility === 'custom' ? customDateStart : undefined,
        customDateEnd: flexibility === 'custom' ? customDateEnd : undefined,
        tripDays,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Could not save alert');
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setAuthStatus('submitting');
    setAuthError('');
    try {
      const data = await signIn(email, password);
      const userId = data.user?.id;
      if (!userId) throw new Error('Sign in failed');
      await saveAlert(userId, email);
      setStep('success');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Something went wrong');
      setAuthStatus('error');
    } finally {
      if (authStatus !== 'error') setAuthStatus('idle');
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setAuthStatus('submitting');
    setAuthError('');
    try {
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      if (!signupRes.ok) {
        const data = await signupRes.json().catch(() => ({}));
        throw new Error(data.error || 'Could not create account');
      }
      const { userId, pendingConfirmation } = await signupRes.json();
      await saveAlert(userId, email);
      setStep(pendingConfirmation ? 'pending' : 'success');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Something went wrong');
      setAuthStatus('error');
    } finally {
      if (authStatus !== 'error') setAuthStatus('idle');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Nav activePage="alerts" />

      <section className="bg-slate-50 border-b border-slate-200 pt-16 pb-24 px-4 flex-1">
        <div className="max-w-2xl mx-auto">

          {/* Hero text */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
              Price Alerts
            </h1>
            <p className="text-slate-500 text-lg max-w-lg mx-auto">
              Tell us your route and target price — we'll email you when fares drop.
            </p>
          </div>

          <AnimatePresence mode="wait">

            {/* ── Step 1: Alert form ─────────────────────────────────────── */}
            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                  <form onSubmit={handleFormSubmit} className="space-y-5">

                    {/* From / To */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <OriginInput
                        value={origin}
                        displayName={originName}
                        onChange={(code, name) => { setOrigin(code); setOriginName(name); }}
                      />
                      <DestinationInput
                        value={destination}
                        onChange={setDestination}
                      />
                    </div>

                    {/* When / Trip length */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-5 border-b border-slate-100">
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
                            <button
                              key={days}
                              type="button"
                              onClick={() => setTripDays(days)}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                                tripDays === days
                                  ? 'bg-brand border-brand text-white'
                                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {days}d
                            </button>
                          ))}
                          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5">
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
                              className="w-14 bg-transparent text-slate-700 text-sm focus:outline-none placeholder-slate-400 text-center"
                            />
                            <span className="text-slate-400 text-xs">days</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Max price */}
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Alert me when price drops below</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">$</span>
                        <input
                          type="number"
                          min={1}
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="800"
                          className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition text-sm"
                        />
                      </div>
                    </div>

                    {formError && <p className="text-red-500 text-sm">{formError}</p>}

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand-dark transition"
                    >
                      Set alert →
                    </button>
                  </form>
                </div>

                {/* Feature bullets */}
                <ul className="mt-8 space-y-3 text-sm text-slate-500">
                  {[
                    { Icon: TrendingDown, text: 'Notified when price drops below your max' },
                    { Icon: Zap, text: 'Flash deals 30%+ below the 12-month average' },
                    { Icon: Mail, text: <><span>Weekly digest of best prices</span> <span className="text-slate-400">(coming soon)</span></> },
                  ].map(({ Icon, text }, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-brand" strokeWidth={2} />
                      </div>
                      {text}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* ── Step 2: Auth prompt ───────────────────────────────────── */}
            {step === 'auth' && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {/* Alert summary pill */}
                <div className="mb-6 bg-brand/5 border border-brand/20 rounded-xl px-5 py-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <span className="font-medium text-slate-900">{originName || origin} → <span className="capitalize">{destination}</span></span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600">{flexLabel(flexibility, customDateStart, customDateEnd)}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600">{tripDays} days</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600">Under ${Number(maxPrice).toLocaleString()}</span>
                  <button
                    onClick={() => setStep('form')}
                    className="ml-auto text-xs text-slate-400 hover:text-brand transition"
                  >
                    Edit
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  {/* Tabs */}
                  <div className="flex border-b border-slate-200">
                    {(['signup', 'signin'] as AuthMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => { setAuthMode(mode); setAuthError(''); }}
                        className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                          authMode === mode
                            ? 'text-slate-900 border-b-2 border-brand bg-white'
                            : 'text-slate-400 hover:text-slate-600 bg-slate-50'
                        }`}
                      >
                        {mode === 'signup' ? 'Create account' : 'Sign in'}
                      </button>
                    ))}
                  </div>

                  <div className="p-8">
                    <p className="text-sm text-slate-500 mb-5">
                      {authMode === 'signup'
                        ? 'Create a free account to save this alert and manage it any time.'
                        : 'Sign in to attach this alert to your existing account.'}
                    </p>

                    {authMode === 'signup' ? (
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Name</label>
                          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" className={inputClass} />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Email</label>
                          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Password</label>
                          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className={inputClass} />
                        </div>
                        {authError && <p className="text-red-500 text-sm">{authError}</p>}
                        <button
                          type="submit"
                          disabled={authStatus === 'submitting'}
                          className="w-full py-3 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {authStatus === 'submitting' ? 'Creating account…' : 'Create account & save alert'}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Email</label>
                          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Password</label>
                          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={inputClass} />
                        </div>
                        {authError && <p className="text-red-500 text-sm">{authError}</p>}
                        <button
                          type="submit"
                          disabled={authStatus === 'submitting'}
                          className="w-full py-3 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {authStatus === 'submitting' ? 'Signing in…' : 'Sign in & save alert'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Pending email confirmation ───────────────────── */}
            {step === 'pending' && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-5">
                  <Mail className="w-7 h-7 text-brand" strokeWidth={1.75} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Check your inbox</h2>
                <p className="text-slate-500 text-sm mb-1">
                  We sent a confirmation link to{' '}
                  <span className="font-medium text-slate-700">{email}</span>.
                </p>
                <p className="text-slate-400 text-xs mt-1 mb-6">
                  Click the link in the email to confirm your account — your alert is already saved and will activate once you do.
                </p>
                <a
                  href="/login"
                  className="inline-block px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:border-slate-300 transition"
                >
                  Go to sign in
                </a>
              </motion.div>
            )}

            {/* ── Step 4: Success ───────────────────────────────────────── */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Alert saved!</h2>
                <p className="text-slate-500 text-sm mb-1">
                  We'll email <span className="font-medium text-slate-700">{email}</span> when{' '}
                  <span className="font-medium text-slate-700 capitalize">{originName || origin} → {destination}</span> drops below{' '}
                  <span className="font-medium text-slate-700">${Number(maxPrice).toLocaleString()}</span>.
                </p>
                <p className="text-slate-400 text-xs mt-1 mb-6">Checks run daily.</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => router.push('/account')}
                    className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition"
                  >
                    My account
                  </button>
                  <button
                    onClick={() => { setStep('form'); setOrigin(''); setOriginName(''); setDestination(''); setMaxPrice(''); setFlexibility('anytime'); setTripDays(7); setName(''); setEmail(''); setPassword(''); }}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:border-slate-300 transition"
                  >
                    Add another alert
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </div>
  );
}
