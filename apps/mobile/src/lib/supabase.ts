import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Optional sync layer. The app is offline-first from the bundled seed; when
 * EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY are unset this stays null
 * and every caller falls back gracefully.
 */
export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') || null;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || null;

let client: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !anonKey) return null;
  client ??= createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  return client;
}

export const isSupabaseConfigured = () => !!supabaseUrl && !!anonKey;
