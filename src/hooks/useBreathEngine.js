// /src/hooks/useBreathEngine.js
import * as store from '../utils/storage.js';

/**
 * A robust breathing engine based on setTimeout with:
 * - Single active timeout at any time (guards late callbacks with a token)
 * - pause(): stores remaining time for the current phase; no ticking while paused
 * - resume(): continues same phase with the exact leftover ms
 * - start(): (re)starts from inhale with full breath count
 * - stop(): cancels everything (no onDone)
 *
 * onPhase(nextPhase, breathsLeft) is called on every phase entry.
 * onDone() is called once when breaths hit 0 after an exhale finishes.
 */
export default function useBreathEngine({
  inhaleMs,
  holdMs = 0,
  exhaleMs,
  breaths,
  onPhase,
  onDone,
}) {
  // mutable state held in closure
  let t = null;                         // active timeout id
  let token = 0;                        // increments to invalidate old timeouts
  let left = breaths;                   // breaths remaining
  let phase = 'inhale';                 // 'inhale' | 'hold' | 'exhale'
  let phaseStart = 0;                   // Date.now() when current phase started
  let phaseDue = 0;                     // Date.now() when current phase should end
  let paused = false;
  let doneFired = false;

  function clearTimer() {
    if (t) { clearTimeout(t); t = null; }
  }

  function now() { return Date.now(); }

  function durationFor(p) {
    if (p === 'inhale') return Math.max(0, inhaleMs);
    if (p === 'hold')   return Math.max(0, holdMs);
    return Math.max(0, exhaleMs); // 'exhale'
  }

  function nextPhaseOf(p) {
    if (p === 'inhale') return (holdMs > 0 ? 'hold' : 'exhale');
    if (p === 'hold')   return 'exhale';
    return 'inhale'; // exhale -> inhale
  }

  function schedule(ms) {
    const myToken = token;
    t = setTimeout(() => {
      if (myToken !== token || paused) return; // stale or paused
      advance();
    }, Math.max(0, ms));
  }

  function enterPhase(p) {
    phase = p;
    phaseStart = now();
    phaseDue = phaseStart + durationFor(p);
    onPhase?.(p, left);
    // If duration is 0, immediately advance (but yield to call stack)
    const dur = durationFor(p);
    clearTimer();
    if (dur === 0) {
      // Microtask to avoid deep recursion
      Promise.resolve().then(() => {
        if (!paused) advance();
      });
    } else {
      schedule(dur);
    }
  }

  function advance() {
    if (paused) return;
    // If we've just finished an exhale, a full breath completed
    if (phase === 'exhale') {
      left = Math.max(0, left - 1);
      if (left === 0) {
        if (!doneFired) {
          doneFired = true;
          clearTimer();
          onDone?.();
          // analytics ping (keep your existing behavior)
          store.emit('session_complete', { durationMin: 1 });
        }
        return;
      }
    }
    enterPhase(nextPhaseOf(phase));
  }

  function start() {
    stop();                   // hard guard: cancel any prior run
    token++;
    paused = false;
    doneFired = false;
    left = breaths;
    enterPhase('inhale');
  }

  function stop() {
    token++;
    paused = false;
    clearTimer();
  }

  function pause() {
    if (paused) return;
    paused = true;
    clearTimer();
    // compute leftover for current phase
    const remainingMs = Math.max(0, phaseDue - now());
    // stash remaining on the function object for resume()
    pause._remaining = remainingMs;
    pause._phase = phase;
  }

  function resume() {
    if (!paused) return;
    paused = false;
    token++;
    const remaining = Math.max(0, pause._remaining ?? 0);
    const p = pause._phase || phase;
    // Re-assert we are in phase p, but schedule with remaining time
    phase = p;
    phaseStart = now();
    phaseDue = phaseStart + remaining;
    // Do NOT call onPhase again here (we're still in the same phase visually/sound)
    schedule(remaining);
  }

  function restart() {
    start();
  }

  return { start, stop, pause, resume, restart };
}
