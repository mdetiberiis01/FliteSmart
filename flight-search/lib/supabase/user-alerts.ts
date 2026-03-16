import { getSupabase } from './client';

export interface UserAlert {
  id: string;
  email: string;
  origin: string;
  origin_name?: string;
  destination: string;
  max_price: number;
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
