import { getSupabaseAdmin } from './client';

export interface PriceAlert {
  id?: string;
  email: string;
  origin: string;
  origin_name?: string;
  destination: string;
  max_price: number;
  user_id?: string;
  flexibility?: string;
  custom_date_start?: string;
  custom_date_end?: string;
  trip_days?: number;
  created_at?: string;
  last_alerted_at?: string | null;
  is_active?: boolean;
}

export async function saveAlert(alert: Omit<PriceAlert, 'id' | 'created_at' | 'last_alerted_at' | 'is_active'>) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('price_alerts')
    .insert({
      email: alert.email,
      origin: alert.origin,
      origin_name: alert.origin_name,
      destination: alert.destination,
      max_price: alert.max_price,
      user_id: alert.user_id ?? null,
      flexibility: alert.flexibility ?? null,
      custom_date_start: alert.custom_date_start ?? null,
      custom_date_end: alert.custom_date_end ?? null,
      trip_days: alert.trip_days ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PriceAlert;
}

export async function getActiveAlerts(): Promise<PriceAlert[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('price_alerts')
    .select('*')
    .eq('is_active', true);

  if (error) throw error;
  return (data ?? []) as PriceAlert[];
}

export async function markAlerted(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('price_alerts')
    .update({ last_alerted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}
