'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Bell, Plus } from 'lucide-react';
import { getUser } from '@/lib/supabase/auth';
import { getUserAlerts, deactivateAlert, deleteAlert, reactivateAlert, UserAlert } from '@/lib/supabase/user-alerts';
import { AccountShell } from '@/components/account/AccountShell';

const FLEX_LABELS: Record<string, string> = {
  anytime: 'Anytime', spring: 'Spring', summer: 'Summer',
  fall: 'Fall', winter: 'Winter', custom: 'Custom dates',
};

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<UserAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const u = await getUser();
      if (!u) { router.push('/login'); return; }
      try {
        setAlerts(await getUserAlerts());
      } catch {
        toast.error('Could not load alerts');
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleDeactivate(id: string) {
    await deactivateAlert(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_active: false } : a)));
    toast.success('Alert paused');
  }

  async function handleReactivate(id: string) {
    await reactivateAlert(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_active: true } : a)));
    toast.success('Alert reactivated');
  }

  async function handleDelete(id: string) {
    await deleteAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success('Alert deleted');
  }

  const active = alerts.filter((a) => a.is_active);
  const paused = alerts.filter((a) => !a.is_active);

  return (
    <AccountShell
      title="Price Alerts"
      action={
        <Link
          href="/account/add-alert"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition"
        >
          <Plus className="w-4 h-4" />
          New alert
        </Link>
      }
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-6 h-6 text-slate-400" strokeWidth={1.75} />
          </div>
          <h2 className="font-semibold text-slate-900 mb-1">No alerts yet</h2>
          <p className="text-slate-400 text-sm mb-6">
            Create an alert and we'll email you when prices drop.
          </p>
          <Link
            href="/account/add-alert"
            className="inline-block px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition"
          >
            Create your first alert
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active ({active.length})</p>
              {active.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onDeactivate={handleDeactivate}
                  onReactivate={handleReactivate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
          {paused.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Paused ({paused.length})</p>
              {paused.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onDeactivate={handleDeactivate}
                  onReactivate={handleReactivate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </AccountShell>
  );
}

function AlertCard({
  alert,
  onDeactivate,
  onReactivate,
  onDelete,
}: {
  alert: UserAlert;
  onDeactivate: (id: string) => void;
  onReactivate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const flex = FLEX_LABELS[alert.flexibility ?? 'anytime'] ?? alert.flexibility;
  const isCustom = alert.flexibility === 'custom';
  const dateRange = isCustom && alert.custom_date_start && alert.custom_date_end
    ? `${alert.custom_date_start} – ${alert.custom_date_end}`
    : flex;

  return (
    <div className={`bg-white border rounded-2xl p-5 transition ${alert.is_active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-slate-900 text-sm">
              {alert.origin_name || alert.origin} → <span className="capitalize">{alert.destination}</span>
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              alert.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {alert.is_active ? 'Active' : 'Paused'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
            <span>Under ${alert.max_price.toLocaleString()}</span>
            <span>·</span>
            <span>{dateRange}</span>
            {alert.trip_days && <><span>·</span><span>{alert.trip_days}d trip</span></>}
            <span>·</span>
            <span>Added {new Date(alert.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            {alert.last_alerted_at && (
              <><span>·</span><span>Last alerted {new Date(alert.last_alerted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs">
          <Link href={`/account/edit-alert/${alert.id}`} className="text-slate-400 hover:text-slate-700 transition font-medium">
            Edit
          </Link>
          {alert.is_active ? (
            <button onClick={() => onDeactivate(alert.id)} className="text-slate-400 hover:text-slate-700 transition font-medium">
              Pause
            </button>
          ) : (
            <button onClick={() => onReactivate(alert.id)} className="text-slate-400 hover:text-slate-700 transition font-medium">
              Resume
            </button>
          )}
          <button onClick={() => onDelete(alert.id)} className="text-red-400 hover:text-red-600 transition font-medium">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
