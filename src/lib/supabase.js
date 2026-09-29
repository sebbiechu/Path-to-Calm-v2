import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;

if (!supabase && import.meta.env.DEV) {
  console.info('Supabase env vars not set: session logging is off.');
}

// Anonymous count of sessions started. Fails silently so it never blocks breathing.
export async function logSessionStart() {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('sessions').insert({});
    if (error) console.warn('Session log failed:', error.message);
  } catch (err) {
    console.warn('Session log failed:', err);
  }
}
