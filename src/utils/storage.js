const bus = {};

export function get(key, fallback = null) {
  const v = localStorage.getItem(key);
  return v === null ? fallback : v;
}

export function set(key, value) {
  localStorage.setItem(key, value);
}

export function remove(key) {
  localStorage.removeItem(key);
}

export function getNumber(key, fallback = 0) {
  const v = get(key, null);
  if (v === null) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function setNumber(key, n) {
  set(key, String(n));
}

export function subscribe(event, handler) {
  if (!bus[event]) bus[event] = new Set();
  bus[event].add(handler);
  return () => bus[event].delete(handler);
}

export function emit(event, payload) {
  if (!bus[event]) return;
  bus[event].forEach((h) => {
    try {
      h(payload);
    } catch {}
  });
}
