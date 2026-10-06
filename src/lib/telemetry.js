// Anonymous logging to Supabase via its REST API.
// Two small fetch calls instead of the full supabase-js library.

const BASE = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function insert(table, row) {
  if (!BASE || !KEY) return;
  try {
    const res = await fetch(`${BASE}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
      keepalive: true, // still sends if the page is closing
    });
    if (!res.ok) console.warn(`Logging to ${table} failed: ${res.status}`);
  } catch (err) {
    console.warn(`Logging to ${table} failed:`, err);
  }
}

// A session started: exercise, planned length and anonymous context. No user data.
export const logSessionStart = ({ preset, plannedSeconds, audience, device, installed, visit }) =>
  insert('sessions', { preset, planned_seconds: plannedSeconds, audience, device, installed, visit });

// A session ended, either finished or ended early. Sessions with no end row were abandoned (tab closed).
export const logSessionEnd = ({ preset, plannedSeconds, seconds, completed, audience, device }) =>
  insert('session_ends', { preset, planned_seconds: plannedSeconds, seconds, completed, audience, device });

// Only called when the user has opted in. Scores, exercise and length only.
export const shareMood = ({ preset, before, after, seconds }) =>
  insert('mood_checks', { preset, mood_before: before, mood_after: after, seconds });
