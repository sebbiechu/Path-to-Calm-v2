import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildSteps, totalMs, createEngine, HOLD_CAP_MS } from '../engine.js';

const base = { inhale: 4, hold: 0, exhale: 6, breaths: 2, rounds: 1, rest: 0, holdIncrease: 0, getReady: 0 };
const phases = (steps) => steps.map((s) => s.phase);

describe('buildSteps', () => {
  it('builds a simple in/out session', () => {
    const steps = buildSteps(base);
    expect(phases(steps)).toEqual(['inhale', 'exhale', 'inhale', 'exhale']);
    expect(totalMs(steps)).toBe(20000);
  });

  it('adds get-ready, holds, rounds and rest between rounds only', () => {
    const steps = buildSteps({ ...base, hold: 2, breaths: 1, rounds: 3, rest: 10, getReady: 3 });
    expect(phases(steps)).toEqual([
      'ready', 'inhale', 'hold', 'exhale', 'rest', 'inhale', 'hold', 'exhale', 'rest', 'inhale', 'hold', 'exhale',
    ]);
  });

  it('lengthens the hold each round', () => {
    const holds = buildSteps({ ...base, hold: 5, breaths: 1, rounds: 3, holdIncrease: 4 })
      .filter((s) => s.phase === 'hold')
      .map((s) => s.ms);
    expect(holds).toEqual([5000, 9000, 13000]);
  });

  it('caps any single hold at 30 seconds', () => {
    const holds = buildSteps({ ...base, hold: 20, breaths: 1, rounds: 10, holdIncrease: 30 })
      .filter((s) => s.phase === 'hold')
      .map((s) => s.ms);
    expect(Math.max(...holds)).toBe(HOLD_CAP_MS);
  });

  it('tags each step with its round and breath', () => {
    const last = buildSteps({ ...base, breaths: 3, rounds: 2 }).at(-1);
    expect(last).toMatchObject({ round: 2, breath: 3 });
  });
});

describe('createEngine', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance', 'Date'] }));
  afterEach(() => vi.useRealTimers());

  it('plays every step in order, then finishes once', () => {
    const steps = buildSteps(base);
    const seen = [];
    const onDone = vi.fn();
    const engine = createEngine(steps, { onStep: (s) => seen.push(s.phase), onDone });
    engine.start();
    vi.advanceTimersByTime(20000);
    expect(seen).toEqual(phases(steps));
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(engine.snapshot().elapsedMs).toBe(20000);
  });

  it('does not count paused time', () => {
    const onDone = vi.fn();
    const engine = createEngine(buildSteps(base), { onDone });
    engine.start();
    vi.advanceTimersByTime(3000);
    engine.pause();
    vi.advanceTimersByTime(60000); // paused for a minute
    expect(onDone).not.toHaveBeenCalled();
    expect(engine.snapshot().elapsedMs).toBe(3000);
    engine.resume();
    vi.advanceTimersByTime(17000);
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(engine.snapshot().elapsedMs).toBe(20000);
  });

  it('reports progress through the current step', () => {
    const engine = createEngine(buildSteps(base));
    engine.start();
    vi.advanceTimersByTime(1000);
    const snap = engine.snapshot();
    expect(snap.step.phase).toBe('inhale');
    expect(snap.progress).toBeCloseTo(0.25);
    expect(snap.stepLeftMs).toBe(3000);
  });

  it('restarts cleanly', () => {
    const onDone = vi.fn();
    const engine = createEngine(buildSteps(base), { onDone });
    engine.start();
    vi.advanceTimersByTime(15000);
    engine.start();
    vi.advanceTimersByTime(15000);
    expect(onDone).not.toHaveBeenCalled();
    vi.advanceTimersByTime(5000);
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

describe('preset defaults', async () => {
  const { PRESETS } = await import('../../data/presets.js');
  it('keep every exercise to about 3 minutes or less', () => {
    PRESETS.forEach((p) => {
      const ms = totalMs(buildSteps({ ...base, ...p, rounds: 1 }));
      expect(ms).toBeLessThanOrEqual(3 * 60 * 1000);
    });
  });
  it('starts 4-7-8 at 4 breaths', () => {
    expect(PRESETS.find((p) => p.id === '478').breaths).toBe(4);
  });
});
