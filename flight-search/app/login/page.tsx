'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from '@/lib/supabase/auth';
import { Nav } from '@/components/ui/Nav';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmed = searchParams.get('confirmed') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputClass =
    'w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.push('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {confirmed && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Email confirmed! You can now sign in.
        </div>
      )}

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Sign in</h1>
        <p className="text-slate-500 text-sm">Welcome back — manage your price alerts.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm text-slate-600">Password</label>
              <Link href="/forgot-password" className="text-xs text-slate-400 hover:text-slate-900 transition">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/alerts" className="text-slate-900 underline underline-offset-2">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">

      <Nav />

      <section className="bg-slate-50 border-b border-slate-200 pt-16 pb-24 px-4 flex-1">
        <Suspense fallback={<div className="max-w-md mx-auto text-center text-slate-400 text-sm">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </section>

      <footer className="border-t border-slate-200 py-8 px-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} FliteSmart · Prices sourced via Kiwi.com · Not affiliated with any airline
      </footer>

    </div>
  );
}
