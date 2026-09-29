// Breathing engine: turns settings into a flat list of timed steps, then plays them.
// Plain JS (not a React hook) so it can live in a ref without breaking hook rules.

// Longest single hold we allow, however many rounds or increases are set
export const HOLD_CAP_MS = 30000;

export function buildSteps(s) {
  const steps = [];
  const sec = (n) => Math.round(Math.max(0, Number(n) || 0) * 1000);

  if (sec(s.getReady) > 0) steps.push({ phase: 'ready', ms: sec(s.getReady), round: 1, breath: 1 });

  for (let round = 1; round <= s.rounds; round++) {
    const holdMs = Math.min(HOLD_CAP_MS, sec(s.hold) + (round - 1) * sec(s.holdIncrease));
    for (let breath = 1; breath <= s.breaths; breath++) {
      steps.push({ phase: 'inhale', ms: sec(s.inhale), round, breath });
      if (holdMs > 0) steps.push({ phase: 'hold', ms: holdMs, round, breath });
      steps.push({ phase: 'exhale', ms: sec(s.exhale), round, breath });
    }
    if (round < s.rounds && sec(s.rest) > 0) {
      steps.push({ phase: 'rest', ms: sec(s.rest), round, breath: s.breaths });
    }
  }
  return steps.filter((st) => st.ms > 0);
}

export const totalMs = (steps) => steps.reduce((sum, st) => sum + st.ms, 0);

export function createEngine(steps, { onStep, onDone } = {}) {
  let index = -1;
  let timer = null;
  let stepStart = 0; // performance.now() when the current run of this step began
  let banked = 0; // ms already spent in this step before a pause
  let completedMs = 0; // ms of fully finished steps
  let paused = false;
  let done = false;

  const now = () => performance.now();
  const clear = () => {
    clearTimeout(timer);
    timer = null;
  };

  function enter(i) {
    index = i;
    banked = 0;
    stepStart = now();
    onStep?.(steps[i], i);
    clear();
    timer = setTimeout(next, steps[i].ms);
  }

  function next() {
    completedMs += steps[index].ms;
    if (index + 1 >= steps.length) {
      done = true;
      clear();
      onDone?.();
      return;
    }
    enter(index + 1);
  }

  function stepElapsed() {
    if (index < 0 || done) return 0;
    return Math.min(steps[index].ms, banked + (paused ? 0 : now() - stepStart));
  }

  return {
    start() {
      clear();
      index = -1;
      paused = false;
      done = false;
      completedMs = 0;
      if (steps.length) enter(0);
      else {
        done = true;
        onDone?.();
      }
    },
    stop() {
      clear();
      paused = false;
    },
    pause() {
      if (paused || done || index < 0) return;
      banked += now() - stepStart;
      paused = true;
      clear();
    },
    resume() {
      if (!paused || done) return;
      paused = false;
      stepStart = now();
      timer = setTimeout(next, Math.max(0, steps[index].ms - banked));
    },
    // For animation frames: where are we right now?
    snapshot() {
      const step = done ? null : steps[index] || null;
      const e = stepElapsed();
      return {
        step,
        progress: step ? e / step.ms : 0,
        stepLeftMs: step ? step.ms - e : 0,
        elapsedMs: done ? completedMs : completedMs + e,
      };
    },
  };
}
