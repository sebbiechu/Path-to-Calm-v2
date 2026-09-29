// Thin localStorage wrapper that never throws (private mode, full quota, etc.)

export function read(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: progress just won't persist this visit
  }
}

export function readNumber(key, fallback = 0) {
  const raw = read(key, null);
  const n = Number(raw);
  return raw !== null && Number.isFinite(n) ? n : fallback;
}

export function readJSON(key, fallback) {
  try {
    const v = read(key, null);
    return v ? { ...fallback, ...JSON.parse(v) } : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  write(key, JSON.stringify(value));
}

// Local calendar date (not UTC), so late-evening sessions count for today
export function localDay(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(a, b) {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}
