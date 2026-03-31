import { getSupabase } from './client';

export interface UserAlert {
  id: string;
  email: string;
  origin: string;
  origin_name?: string;
  destination: string;
  max_price: number;
  flexibility?: string;
  custom_date_start?: string;
  custom_date_end?: string;
  trip_days?: number;
  created_at: string;
  last_alerted_at: string | null;
  is_active: boolean;
}

export async function getUserAlerts(): Promise<UserAlert[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('price_alerts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as UserAlert[];
}

export async function deactivateAlert(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('price_alerts')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteAlert(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('price_alerts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function reactivateAlert(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('price_alerts')
    .update({ is_active: true })
    .eq('id', id);

  if (error) throw error;
}

export async function updateAlert(
  id: string,
  fields: { origin: string; origin_name?: string; destination: string; max_price: number; flexibility?: string; custom_date_start?: string; custom_date_end?: string; trip_days?: number },
) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('price_alerts')
    .update(fields)
    .eq('id', id);

  if (error) throw error;
}
