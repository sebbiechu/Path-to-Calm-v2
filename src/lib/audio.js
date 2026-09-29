// Phase cues use the mp3s in /public/sounds. The completion chime is synthesised,
// so there is no extra file to ship.

const SOURCES = {
  inhale: '/sounds/inhale.mp3',
  hold: '/sounds/hold.mp3',
  exhale: '/sounds/exhale.mp3',
};

const cache = {};
let current = null;
let muted = false;

export function setMuted(value) {
  muted = value;
  if (muted) stopAll();
}

function get(key) {
  if (!cache[key]) {
    cache[key] = new Audio(SOURCES[key]);
    cache[key].preload = 'auto';
  }
  return cache[key];
}

// Call from a click handler so mobile browsers allow playback later
export function preload() {
  Object.keys(SOURCES).forEach(get);
}

function safePlay(a) {
  const p = a.play();
  if (p && p.catch) p.catch(() => {}); // autoplay blocked: ignore
}

export function playPhase(phase) {
  stopAll();
  if (muted || !SOURCES[phase]) return;
  const a = get(phase);
  a.currentTime = 0;
  current = a;
  safePlay(a);
}

export function pauseAll() {
  Object.values(cache).forEach((a) => a.pause());
}

export function resumeCurrent() {
  if (current && !muted) safePlay(current);
}

export function stopAll() {
  Object.values(cache).forEach((a) => {
    a.pause();
    a.currentTime = 0;
  });
  current = null;
}

export function playChime() {
  if (muted) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  try {
    const ctx = new Ctx();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = now + i * 0.18;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.7);
    });
    setTimeout(() => ctx.close(), 2500);
  } catch {
    // Web Audio unavailable: skip the chime
  }
}
