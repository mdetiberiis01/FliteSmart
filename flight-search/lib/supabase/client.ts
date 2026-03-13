import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

function getAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

function getServiceKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

export function getSupabase(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getAnonKey();
  if (!url || !key) {
    // Return a dummy client that won't throw at import time
    // Real calls will fail gracefully in each function
    if (!_supabase) {
      _supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
    }
    return _supabase;
  }
  if (!_supabase) {
    _supabase = createClient(url, key);
  }
  return _supabase;
}

export function getSupabaseAdmin(): SupabaseClient {
  const url = getSupabaseUrl();
  const serviceKey = getServiceKey();
  const anonKey = getAnonKey();
  const key = serviceKey || anonKey;
  if (!url || !key) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = createClient('https://placeholder.supabase.co', 'placeholder-key');
    }
    return _supabaseAdmin;
  }
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(url, key);
  }
  return _supabaseAdmin;
}

// Keep named exports for backward compatibility
export const supabase = {
  from: (...args: Parameters<SupabaseClient['from']>) => getSupabase().from(...args),
};

export const supabaseAdmin = {
  from: (...args: Parameters<SupabaseClient['from']>) => getSupabaseAdmin().from(...args),
};
