'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { signOut } from '@/lib/supabase/auth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface NavProps {
  activePage?: 'flights' | 'alerts' | 'how-it-works';
}

export function Nav({ activePage }: NavProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const name = user?.user_metadata?.full_name as string | undefined;

  async function handleSignOut() {
    await signOut();
    router.push('/');
    setMenuOpen(false);
  }

  const linkClass = 'hover:text-black dark:hover:text-white transition';
  const activeClass = 'text-black dark:text-white';
  const dimClass = 'text-black/55 dark:text-white/55';

  return (
    <header className="relative z-10 border-b border-black/8 dark:border-white/10 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="font-bold text-base md:text-lg tracking-tight text-black dark:text-white">
            ✈ FliteSmart
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm">
            <Link href="/" className={`${activePage === 'flights' ? activeClass : dimClass} ${linkClass}`}>Flights</Link>
            <Link href="/alerts" className={`${activePage === 'alerts' ? activeClass : dimClass} ${linkClass}`}>Price Alerts</Link>
            <Link href="/how-it-works" className={`${activePage === 'how-it-works' ? activeClass : dimClass} ${linkClass}`}>How it works</Link>
          </nav>
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link href="/account" className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition">
                {name || user.email}
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-black/80 dark:hover:bg-white/80 transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={`${dimClass} ${linkClass}`}>Sign in</Link>
              <Link href="/alerts" className="px-4 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-black/80 dark:hover:bg-white/80 transition">
                Sign up
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-black/8 dark:border-white/10 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm px-4 py-4 flex flex-col gap-4 text-sm">
          <Link href="/" onClick={() => setMenuOpen(false)} className={`${activePage === 'flights' ? activeClass : dimClass} ${linkClass}`}>Flights</Link>
          <Link href="/alerts" onClick={() => setMenuOpen(false)} className={`${activePage === 'alerts' ? activeClass : dimClass} ${linkClass}`}>Price Alerts</Link>
          <Link href="/how-it-works" onClick={() => setMenuOpen(false)} className={`${activePage === 'how-it-works' ? activeClass : dimClass} ${linkClass}`}>How it works</Link>
          <div className="border-t border-black/8 dark:border-white/10 pt-4 flex flex-col gap-3">
            {user ? (
              <>
                <Link href="/account" onClick={() => setMenuOpen(false)} className="text-black/60 dark:text-white/60">
                  {name || user.email}
                </Link>
                <button onClick={handleSignOut} className="text-left text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className={`${dimClass} ${linkClass}`}>Sign in</Link>
                <Link href="/alerts" onClick={() => setMenuOpen(false)} className="inline-block w-fit px-4 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
