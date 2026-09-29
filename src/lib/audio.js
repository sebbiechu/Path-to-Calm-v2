// Sound cues via the Web Audio API.
// Why not <audio> elements: phones (especially iPhones) block them when a timer starts
// playback, they load lazily so early cues get missed, and they don't play reliably
// from the offline cache. Here, one AudioContext is unlocked on the Start tap and all
// sounds are decoded into memory up front.

const SOURCES = {
  inhale: '/sounds/inhale.mp3',
  hold: '/sounds/hold.mp3',
  exhale: '/sounds/exhale.mp3',
};

let ctx = null;
let master = null;
let loading = null;
const buffers = {};
let current = null; // the playing AudioBufferSourceNode
let wanted = null; // { phase, at } requested before its buffer finished loading
let muted = false;

function context() {
  if (ctx) return ctx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  ctx = new Ctx();
  master = ctx.createGain();
  master.connect(ctx.destination);
  master.gain.value = muted ? 0 : 1;
  return ctx;
}

function load() {
  if (loading || !ctx) return loading;
  loading = Promise.all(
    Object.entries(SOURCES).map(async ([key, url]) => {
      try {
        const res = await fetch(url);
        const data = await res.arrayBuffer();
        buffers[key] = await new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject));
        // A cue asked for while this was loading: start it now, skipping the time already passed
        if (wanted?.phase === key) {
          start(key, ctx.currentTime - wanted.at);
          wanted = null;
        }
      } catch (err) {
        console.warn(`Could not load ${url}:`, err);
      }
    })
  );
  return loading;
}

// Call from a tap or click (the Start button). Unlocks audio for the whole session.
export function unlock() {
  const c = context();
  if (!c) return;
  // Safari 16.4+: play through the silent switch, like a media app
  try {
    if (navigator.audioSession) navigator.audioSession.type = 'playback';
  } catch {
    // not supported: fine
  }
  if (c.state !== 'running') c.resume().catch(() => {});
  // A one-sample silent buffer fully unlocks older iOS versions
  const silent = c.createBufferSource();
  silent.buffer = c.createBuffer(1, 1, 22050);
  silent.connect(c.destination);
  silent.start(0);
  load();
}

function start(key, offset = 0) {
  const buffer = buffers[key];
  if (!buffer || offset >= buffer.duration) return;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.connect(master);
  src.onended = () => {
    if (current === src) current = null;
  };
  src.start(0, Math.max(0, offset));
  current = src;
}

export function playPhase(phase) {
  stopAll();
  if (!SOURCES[phase] || !context()) return;
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
  if (buffers[phase]) {
    start(phase);
  } else {
    wanted = { phase, at: ctx.currentTime };
    load();
  }
}

export function stopAll() {
  wanted = null;
  if (current) {
    try {
      current.stop();
    } catch {
      // already stopped
    }
    current = null;
  }
}

// Pause and resume freeze the audio clock, so a cue picks up exactly where it was
export function pauseAll() {
  if (ctx && ctx.state === 'running') ctx.suspend().catch(() => {});
}

export function resumeCurrent() {
  if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
}

export function setMuted(value) {
  muted = value;
  if (master) master.gain.value = muted ? 0 : 1;
}

export function playChime() {
  if (muted || !context()) return;
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
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
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + 1.7);
  });
}
