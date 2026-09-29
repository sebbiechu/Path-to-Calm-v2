import { describe, it, expect } from 'vitest';
import { applyCompletion, moodSummary } from '../stats.js';

const fresh = { totalSeconds: 0, sessions: 0, streak: 0, lastDay: '' };

describe('applyCompletion', () => {
  it('starts a streak on the first session', () => {
    expect(applyCompletion(fresh, 300, '2026-09-29')).toEqual({
      totalSeconds: 300, sessions: 1, streak: 1, lastDay: '2026-09-29',
    });
  });

  it('keeps the streak for a second session on the same day', () => {
    const s = applyCompletion(applyCompletion(fresh, 60, '2026-09-29'), 60, '2026-09-29');
    expect(s.streak).toBe(1);
    expect(s.sessions).toBe(2);
  });

  it('extends the streak on consecutive days, across a month end', () => {
    let s = applyCompletion(fresh, 60, '2026-09-30');
    s = applyCompletion(s, 60, '2026-10-01');
    expect(s.streak).toBe(2);
  });

  it('resets the streak after a missed day', () => {
    let s = applyCompletion(fresh, 60, '2026-09-27');
    s = applyCompletion(s, 60, '2026-09-29');
    expect(s.streak).toBe(1);
  });
});

describe('moodSummary', () => {
  it('returns null with no entries', () => expect(moodSummary([])).toBeNull());

  it('averages the change and finds the most helpful exercise', () => {
    const e = (preset, before, after) => ({ preset, before, after });
    const summary = moodSummary([e('478', 2, 5), e('478', 2, 4), e('coherent', 3, 3), e('coherent', 3, 4)]);
    expect(summary.change).toBe(1.5);
    expect(summary.best).toEqual({ preset: '478', change: 2.5 });
  });

  it('needs two exercises with two sessions each before naming a favourite', () => {
    const summary = moodSummary([{ preset: '478', before: 1, after: 5 }, { preset: '478', before: 1, after: 5 }]);
    expect(summary.best).toBeNull();
  });
});
