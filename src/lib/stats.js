import { localDay, daysBetween } from './storage.js';

// Record a completed session: minutes, session count and last day
export function applyCompletion(stats, seconds, today = localDay()) {
  const gap = stats.lastDay ? daysBetween(stats.lastDay, today) : null;
  const streak = gap === 0 ? stats.streak || 1 : gap === 1 ? stats.streak + 1 : 1;
  return { totalSeconds: stats.totalSeconds + seconds, sessions: stats.sessions + 1, streak, lastDay: today };
}

const round1 = (n) => Math.round(n * 10) / 10;

// Average change in mood, plus the exercise that helps most (needs 2+ sessions each)
export function moodSummary(entries) {
  if (!entries.length) return null;
  const avg = (list) => list.reduce((sum, e) => sum + (e.after - e.before), 0) / list.length;

  const byPreset = {};
  entries.forEach((e) => (byPreset[e.preset] ||= []).push(e));
  const ranked = Object.entries(byPreset)
    .filter(([, list]) => list.length >= 2)
    .map(([preset, list]) => ({ preset, change: round1(avg(list)) }))
    .sort((a, b) => b.change - a.change);

  return {
    count: entries.length,
    change: round1(avg(entries)),
    best: ranked.length >= 2 && ranked[0].change > 0 ? ranked[0] : null,
  };
}
