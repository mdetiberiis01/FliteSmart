'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getUser, updateHomeAirport, updateName } from '@/lib/supabase/auth';
import { getUserAlerts, deactivateAlert, deleteAlert, reactivateAlert, UserAlert } from '@/lib/supabase/user-alerts';
import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';
import { OriginInput } from '@/components/search/OriginInput';
import type { User } from '@supabase/supabase-js';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [alerts, setAlerts] = useState<UserAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const [nameValue, setNameValue] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [homeAirport, setHomeAirport] = useState('');
  const [homeAirportName, setHomeAirportName] = useState('');
  const [savingAirport, setSavingAirport] = useState(false);
  const [airportSaved, setAirportSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const u = await getUser();
      if (!u) {
        router.push('/login');
        return;
      }
      setUser(u);
      setNameValue((u.user_metadata?.full_name as string | undefined) ?? '');
      const savedCode = u.user_metadata?.home_airport as string | undefined;
      const savedName = u.user_metadata?.home_airport_name as string | undefined;
      if (savedCode) {
        setHomeAirport(savedCode);
        setHomeAirportName(savedName ?? savedCode);
      }
      try {
        const a = await getUserAlerts();
        setAlerts(a);
      } catch {
        // non-fatal
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSaveName() {
    if (!nameValue.trim()) return;
    setSavingName(true);
    try {
      await updateName(nameValue.trim());
      setUser((prev) => prev ? { ...prev, user_metadata: { ...prev.user_metadata, full_name: nameValue.trim() } } : prev);
      setEditingName(false);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
      toast.success('Name updated');
    } catch {
      toast.error('Failed to update name');
    } finally {
      setSavingName(false);
    }
  }

  async function handleSaveAirport() {
    if (!homeAirport) return;
    setSavingAirport(true);
    try {
      await updateHomeAirport(homeAirport, homeAirportName || homeAirport);
      setAirportSaved(true);
      setTimeout(() => setAirportSaved(false), 2500);
      toast.success('Home airport saved');
    } catch {
      toast.error('Failed to save airport');
    } finally {
      setSavingAirport(false);
    }
  }

  async function handleDeactivate(id: string) {
    await deactivateAlert(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_active: false } : a)));
    toast.success('Alert paused');
  }

  async function handleDelete(id: string) {
    await deleteAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success('Alert deleted');
  }

  async function handleReactivate(id: string) {
    await reactivateAlert(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_active: true } : a)));
    toast.success('Alert reactivated');
  }

  const name = nameValue || (user?.user_metadata?.full_name as string | undefined);
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Nav />

      <section className="bg-slate-50 border-b border-slate-200 pt-16 pb-24 px-4 flex-1">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Account Info */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">
              {name ? `Hey, ${name.split(' ')[0]}` : 'My Account'}
            </h1>
            <p className="text-slate-500 text-sm">{user?.email}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-slate-900">Account info</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 mb-1">Name</p>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') setEditingName(false);
                      }}
                      className="flex-1 min-w-0 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand transition"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={!nameValue.trim() || savingName}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-700 disabled:opacity-40 transition"
                    >
                      {savingName ? '…' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-slate-900 font-medium">
                      {name || '—'}{nameSaved && <span className="ml-2 text-green-500 text-xs">Saved ✓</span>}
                    </p>
                    <button
                      onClick={() => { setNameValue(name || ''); setEditingName(true); }}
                      className="text-xs text-slate-400 hover:text-slate-600 transition"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
              <div>
                <p className="text-slate-400 mb-1">Email</p>
                <p className="text-slate-900 font-medium">{user?.email}</p>
              </div>
              {memberSince && (
                <div>
                  <p className="text-slate-400 mb-1">Member since</p>
                  <p className="text-slate-900 font-medium">{memberSince}</p>
                </div>
              )}
              <div>
                <p className="text-slate-400 mb-1">User ID</p>
                <p className="text-slate-500 font-mono text-xs truncate">{user?.id}</p>
              </div>
            </div>

            {/* Home airport */}
            <div className="border-t border-slate-200 pt-5">
              <p className="text-sm font-medium text-slate-900 mb-1">Home airport</p>
              <p className="text-xs text-slate-400 mb-3">
                Used as the default departure airport across FliteSmart.
              </p>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <OriginInput
                    value={homeAirport}
                    displayName={homeAirportName}
                    onChange={(code, name) => {
                      setHomeAirport(code);
                      setHomeAirportName(name);
                      setAirportSaved(false);
                    }}
                  />
                </div>
                <button
                  onClick={handleSaveAirport}
                  disabled={!homeAirport || savingAirport}
                  className="shrink-0 px-4 py-3 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-40 transition"
                >
                  {savingAirport ? 'Saving…' : airportSaved ? 'Saved ✓' : 'Save'}
                </button>
              </div>
            </div>
          </div>

          {/* Price Alerts */}
          {loading ? (
            <div className="text-slate-400 text-sm">Loading…</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Your price alerts</h2>
                <Link
                  href="/account/add-alert"
                  className="text-sm px-4 py-1.5 rounded-full border border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900 transition"
                >
                  + Add alert
                </Link>
              </div>

              {alerts.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                  <p className="text-slate-400 text-sm mb-4">No alerts yet.</p>
                  <Link
                    href="/account/add-alert"
                    className="inline-block px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition"
                  >
                    Set your first alert
                  </Link>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`bg-white border rounded-2xl p-5 flex items-center justify-between gap-4 transition ${
                      alert.is_active
                        ? 'border-slate-200'
                        : 'border-slate-100 opacity-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 text-sm">
                        {alert.origin_name || alert.origin} → {alert.destination}
                      </div>
                      <div className="text-slate-400 text-xs mt-0.5">
                        Max ${alert.max_price}
                        {alert.flexibility && alert.flexibility !== 'anytime' && (
                          <> · {alert.flexibility.charAt(0).toUpperCase() + alert.flexibility.slice(1)}</>
                        )}
                        {alert.trip_days && <> · {alert.trip_days}d trip</>}
                        {' · '}Added {new Date(alert.created_at).toLocaleDateString()}
                        {alert.last_alerted_at && (
                          <> · Last alerted {new Date(alert.last_alerted_at).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {alert.is_active ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          Paused
                        </span>
                      )}
                      <Link
                        href={`/account/edit-alert/${alert.id}`}
                        className="text-xs text-slate-400 hover:text-slate-600 transition"
                      >
                        Edit
                      </Link>
                      {alert.is_active ? (
                        <button
                          onClick={() => handleDeactivate(alert.id)}
                          className="text-xs text-slate-400 hover:text-slate-600 transition"
                        >
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(alert.id)}
                          className="text-xs text-slate-400 hover:text-slate-600 transition"
                        >
                          Reactivate
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
