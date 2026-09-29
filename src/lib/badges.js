import { PRESETS } from '../data/presets.js';
import { localDay } from './storage.js';

// Days since 1970-01-01 for a 'YYYY-MM-DD' string
const dayNumber = (day) => {
  const [y, m, d] = day.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
};

// Monday-based week number (1970-01-01 was a Thursday)
export const weekNumber = (day) => Math.floor((dayNumber(day) + 3) / 7);

// Distinct days with a completed session in the current week
export function daysThisWeek(history, today = localDay()) {
  const week = weekNumber(today);
  return new Set(history.filter((h) => weekNumber(h.day) === week).map((h) => h.day)).size;
}

function longestWeekRun(history) {
  const weeks = [...new Set(history.map((h) => weekNumber(h.day)))].sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  weeks.forEach((w, i) => {
    run = i > 0 && w === weeks[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  });
  return best;
}

function bestDaysInAWeek(history) {
  const byWeek = {};
  history.forEach((h) => (byWeek[weekNumber(h.day)] ||= new Set()).add(h.day));
  return Math.max(0, ...Object.values(byWeek).map((s) => s.size));
}

// For every badge: is it done, and how far along (for goals with a count)?
export function evaluateBadges({ history, moods, totalSeconds }) {
  const presetsTried = new Set(history.map((h) => h.preset)).size;
  const calmer = moods.filter((m) => m.after > m.before).length;
  const cap = (n, target) => ({ done: n >= target, progress: [Math.min(n, target), target] });

  return {
    first: { done: history.length > 0 },
    explorer: cap(presetsTried, PRESETS.length),
    week3: cap(bestDaysInAWeek(history), 3),
    evening: { done: history.some((h) => h.hour >= 20 || h.hour < 4) },
    rounds: { done: history.some((h) => h.rounds >= 2) },
    hour: cap(Math.floor(totalSeconds / 60), 60),
    calmer5: cap(calmer, 5),
    rhythm4: cap(longestWeekRun(history), 4),
  };
}
