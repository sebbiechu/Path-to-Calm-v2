import { describe, it, expect } from 'vitest';
import { evaluateBadges, daysThisWeek, weekNumber } from '../badges.js';

const h = (day, extra = {}) => ({ day, hour: 12, preset: 'abdominal', seconds: 300, rounds: 1, ...extra });
const none = { history: [], moods: [], totalSeconds: 0 };

describe('weeks', () => {
  it('starts weeks on Monday', () => {
    expect(weekNumber('2026-09-28')).toBe(weekNumber('2026-10-04')); // Mon and Sun
    expect(weekNumber('2026-10-05')).toBe(weekNumber('2026-10-04') + 1);
  });

  it('counts distinct days this week', () => {
    const history = [h('2026-09-28'), h('2026-09-28'), h('2026-09-29'), h('2026-09-20')];
    expect(daysThisWeek(history, '2026-09-30')).toBe(2);
  });
});

describe('evaluateBadges', () => {
  it('awards nothing with no history', () => {
    expect(Object.values(evaluateBadges(none)).some((b) => b.done)).toBe(false);
  });

  it('awards the first session badge', () => {
    expect(evaluateBadges({ ...none, history: [h('2026-09-29')] }).first.done).toBe(true);
  });

  it('tracks exercises tried', () => {
    const history = ['abdominal', 'pursed', '478'].map((p) => h('2026-09-29', { preset: p }));
    expect(evaluateBadges({ ...none, history }).explorer).toEqual({ done: false, progress: [3, 5] });
  });

  it('needs 3 days within the same week, not across weeks', () => {
    const split = [h('2026-10-03'), h('2026-10-04'), h('2026-10-05')]; // Sat, Sun, Mon
    expect(evaluateBadges({ ...none, history: split }).week3.done).toBe(false);
    const same = [h('2026-09-28'), h('2026-09-30'), h('2026-10-02')];
    expect(evaluateBadges({ ...none, history: same }).week3.done).toBe(true);
  });

  it('counts evening and late-night sessions', () => {
    expect(evaluateBadges({ ...none, history: [h('2026-09-29', { hour: 21 })] }).evening.done).toBe(true);
    expect(evaluateBadges({ ...none, history: [h('2026-09-29', { hour: 1 })] }).evening.done).toBe(true);
    expect(evaluateBadges({ ...none, history: [h('2026-09-29', { hour: 19 })] }).evening.done).toBe(false);
  });

  it('uses total minutes, including time from ended-early sessions', () => {
    expect(evaluateBadges({ ...none, totalSeconds: 3599 }).hour.done).toBe(false);
    expect(evaluateBadges({ ...none, totalSeconds: 3600 }).hour.done).toBe(true);
  });

  it('counts only sessions that ended calmer', () => {
    const moods = [{ before: 2, after: 4 }, { before: 3, after: 3 }, { before: 4, after: 2 }];
    expect(evaluateBadges({ ...none, moods }).calmer5.progress).toEqual([1, 5]);
  });

  it('needs four consecutive weeks for the rhythm badge', () => {
    const gap = ['2026-09-07', '2026-09-14', '2026-09-28', '2026-10-05'].map((d) => h(d));
    expect(evaluateBadges({ ...none, history: gap }).rhythm4.progress).toEqual([2, 4]);
    const run = ['2026-09-07', '2026-09-14', '2026-09-21', '2026-09-28'].map((d) => h(d));
    expect(evaluateBadges({ ...none, history: run }).rhythm4.done).toBe(true);
  });
});
