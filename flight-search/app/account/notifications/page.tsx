'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BellOff } from 'lucide-react';
import { getUser } from '@/lib/supabase/auth';
import { AccountShell } from '@/components/account/AccountShell';

export default function NotificationsPage() {
  const router = useRouter();

  useEffect(() => {
    getUser().then((u) => { if (!u) router.push('/login'); });
  }, [router]);

  return (
    <AccountShell title="Notifications">
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <BellOff className="w-6 h-6 text-slate-400" strokeWidth={1.75} />
        </div>
        <h2 className="font-semibold text-slate-900 mb-1">Notifications</h2>
        <p className="text-slate-400 text-sm">Notification preferences are coming soon.</p>
      </div>
    </AccountShell>
  );
}
