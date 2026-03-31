'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { signOut } from '@/lib/supabase/auth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface NavProps {
  activePage?: 'flights' | 'alerts' | 'how-it-works';
}

export function Nav({ activePage }: NavProps) {
  const { user } = useAuth();
  const router = useRouter();
  const name = user?.user_metadata?.full_name as string | undefined;

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  const linkClass = 'hover:text-black dark:hover:text-white transition';
  const activeClass = 'text-black dark:text-white';
  const dimClass = 'text-black/55 dark:text-white/55';

  return (
    <header className="relative z-10 border-b border-black/8 dark:border-white/10 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="font-bold text-lg tracking-tight text-black dark:text-white">
            ✈ FliteSmart
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm">
            <Link href="/" className={`${activePage === 'flights' ? activeClass : dimClass} ${linkClass}`}>Flights</Link>
            <Link href="/alerts" className={`${activePage === 'alerts' ? activeClass : dimClass} ${linkClass}`}>Price Alerts</Link>
            <Link href="/how-it-works" className={`${activePage === 'how-it-works' ? activeClass : dimClass} ${linkClass}`}>How it works</Link>
          </nav>
        </div>
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
      </div>
    </header>
  );
}
