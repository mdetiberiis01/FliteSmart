'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getUser, updateHomeAirport, updateName } from '@/lib/supabase/auth';
import { AccountShell } from '@/components/account/AccountShell';
import { OriginInput } from '@/components/search/OriginInput';
import type { User } from '@supabase/supabase-js';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
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

  const name = nameValue || (user?.user_metadata?.full_name as string | undefined);
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <AccountShell title={loading ? '' : (name ? `Hey, ${name.split(' ')[0]}` : 'Account Info')}>
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-24 bg-white border border-slate-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
      <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
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
        </div>
      )}
    </AccountShell>
  );
}
