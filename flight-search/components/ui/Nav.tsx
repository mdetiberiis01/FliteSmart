'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { signOut } from '@/lib/supabase/auth';

interface NavProps {
  activePage?: 'flights' | 'alerts' | 'how-it-works';
}

const DROPDOWN_ITEMS = [
  { label: 'Price Alerts', href: '/account/alerts' },
  { label: 'My Trips', href: '/account/trips' },
  { label: 'Saved Flights', href: '/account/saved' },
  { label: 'Notifications', href: '/account/notifications' },
  { label: 'Account Info', href: '/account' },
];

export function Nav({ activePage }: NavProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const name = user?.user_metadata?.full_name as string | undefined;

  async function handleSignOut() {
    await signOut();
    router.push('/');
    setMenuOpen(false);
    setDropdownOpen(false);
  }

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [dropdownOpen]);

  const activeClass = 'text-slate-900 font-medium';
  const dimClass = 'text-slate-500 hover:text-slate-900 transition';

  return (
    <header className="relative z-10 border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2 font-bold text-base md:text-lg tracking-tight text-slate-900">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand" aria-hidden="true">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2c-.5.1-.9.5-.7 1l2.3 4c.3.5.9.7 1.5.5L9 10.5 11 13l-2 3.5c-.3.5-.1 1.1.4 1.4l4 2.3c.5.2 1 0 1-.5z" />
            </svg>
            FliteSmart
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm">
            <Link href="/" className={activePage === 'flights' ? activeClass : dimClass}>Flights</Link>
            <Link href="/alerts" className={activePage === 'alerts' ? activeClass : dimClass}>Price Alerts</Link>
            <Link href="/how-it-works" className={activePage === 'how-it-works' ? activeClass : dimClass}>How it works</Link>
          </nav>
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3 text-sm">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition font-medium"
              >
                {name || user.email}
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
                  className={`opacity-50 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
                  {DROPDOWN_ITEMS.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-slate-200" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className={dimClass}>Sign in</Link>
              <Link href="/alerts" className="px-4 py-1.5 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand-dark transition">
                Sign up free
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
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
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 flex flex-col gap-4 text-sm">
          <Link href="/" onClick={() => setMenuOpen(false)} className={activePage === 'flights' ? activeClass : dimClass}>Flights</Link>
          <Link href="/alerts" onClick={() => setMenuOpen(false)} className={activePage === 'alerts' ? activeClass : dimClass}>Price Alerts</Link>
          <Link href="/how-it-works" onClick={() => setMenuOpen(false)} className={activePage === 'how-it-works' ? activeClass : dimClass}>How it works</Link>
          <div className="border-t border-slate-200 pt-4 flex flex-col gap-3">
            {user ? (
              <>
                <p className="text-slate-400 text-xs font-medium">{name || user.email}</p>
                {DROPDOWN_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={dimClass}
                  >
                    {item.label}
                  </Link>
                ))}
                <button onClick={handleSignOut} className="text-left text-red-500 hover:text-red-600 transition">
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className={dimClass}>Sign in</Link>
                <Link href="/alerts" onClick={() => setMenuOpen(false)} className="inline-block w-fit px-4 py-1.5 rounded-full bg-brand text-white text-sm font-medium">
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
