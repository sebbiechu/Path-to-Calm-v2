export function aboutMinutes(ms) {
  const min = Math.round(ms / 60000);
  if (min < 1) return 'under a minute';
  return `about ${min} min`;
}

export function clock(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
