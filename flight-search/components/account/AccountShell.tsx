'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';

const TABS = [
  { label: 'Price Alerts', href: '/account/alerts' },
  { label: 'My Trips', href: '/account/trips' },
  { label: 'Saved Flights', href: '/account/saved' },
  { label: 'Notifications', href: '/account/notifications' },
  { label: 'Account Info', href: '/account' },
];

interface Props {
  children: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
}

export function AccountShell({ children, title, action }: Props) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Nav />

      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    active
                      ? 'border-brand text-brand'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <section className="bg-slate-50 flex-1 px-4 py-10">
        <div className="max-w-3xl mx-auto">
          {(title || action) && (
            <div className="flex items-center justify-between mb-6">
              {title && <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>}
              {action}
            </div>
          )}
          {children}
        </div>
      </section>

      <Footer />
    </div>
  );
}
