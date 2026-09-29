// Eyes-closed cues: vibration (Android; iPhone browsers don't support it) and spoken prompts

// Desktop Chrome has navigator.vibrate but no motor, so also require a touch screen
export const canVibrate =
  typeof navigator !== 'undefined' &&
  'vibrate' in navigator &&
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: coarse)').matches;
export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

const PATTERNS = { inhale: [60], hold: [30, 80, 30], exhale: [140], rest: [20] };
const WORDS = { ready: 'Get ready', inhale: 'Breathe in', hold: 'Hold', exhale: 'Breathe out', rest: 'Rest' };

export function cue(phase, { vibrate, voice, muted }) {
  if (vibrate && canVibrate && PATTERNS[phase]) navigator.vibrate(PATTERNS[phase]);
  if (voice && !muted && canSpeak && WORDS[phase]) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(WORDS[phase]);
    u.lang = 'en-GB';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }
}

export function stopCues() {
  if (canSpeak) window.speechSynthesis.cancel();
  if (canVibrate) navigator.vibrate(0);
}
