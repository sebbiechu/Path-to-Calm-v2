import * as store from '../utils/storage.js';

export default function useBreathEngine({ inhaleMs, holdMs = 0, exhaleMs, breaths, onPhase, onDone }) {
  let t = null, left = breaths, phase = 'inhale';
  let startMin = 0;

  function schedule(ms, next) { t = setTimeout(next, ms); }
  function step() {
    if (left <= 0) { clearTimeout(t); onDone?.(); store.emit('session_complete', { durationMin: 1 }); return; }
    onPhase?.(phase, left);
    if (phase === 'inhale') {
      schedule(inhaleMs, () => { phase = holdMs > 0 ? 'hold' : 'exhale'; step(); });
    } else if (phase === 'hold') {
      schedule(holdMs, () => { phase = 'exhale'; step(); });
    } else if (phase === 'exhale') {
      schedule(exhaleMs, () => { left -= 1; phase = 'inhale'; step(); });
    }
  }
  function start(){ stop(); startMin = Date.now()/60000; left = breaths; phase='inhale'; step(); }
  function stop(){ if (t) clearTimeout(t); }
  return { start, stop };
}
