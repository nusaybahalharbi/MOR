import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export type Row = Record<string, unknown>;

export function text(row: Row, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return '—';
}

export function date(value: unknown) {
  if (typeof value !== 'string') return '—';
  return new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-arab', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
