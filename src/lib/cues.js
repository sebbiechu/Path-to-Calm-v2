// Vibration cues for breathing silently (phones only; iPhone browsers don't support vibration)

// Desktop Chrome has navigator.vibrate but no motor, so also require a touch screen
export const canVibrate =
  typeof navigator !== 'undefined' &&
  'vibrate' in navigator &&
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: coarse)').matches;

const PATTERNS = { inhale: [60], hold: [30, 80, 30], exhale: [140], rest: [20] };

export function cue(phase, { vibrate }) {
  if (vibrate && canVibrate && PATTERNS[phase]) navigator.vibrate(PATTERNS[phase]);
}

export function stopCues() {
  if (canVibrate) navigator.vibrate(0);
}
