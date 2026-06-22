'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Luggage } from 'lucide-react';
import { getUser } from '@/lib/supabase/auth';
import { AccountShell } from '@/components/account/AccountShell';

export default function TripsPage() {
  const router = useRouter();

  useEffect(() => {
    getUser().then((u) => { if (!u) router.push('/login'); });
  }, [router]);

  return (
    <AccountShell title="My Trips">
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Luggage className="w-6 h-6 text-slate-400" strokeWidth={1.75} />
        </div>
        <h2 className="font-semibold text-slate-900 mb-1">My Trips</h2>
        <p className="text-slate-400 text-sm">Trip tracking is coming soon.</p>
      </div>
    </AccountShell>
  );
}
