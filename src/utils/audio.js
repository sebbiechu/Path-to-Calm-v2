// /src/utils/audio.js

let registry = {
  inhale: null,
  hold: null,
  exhale: null,
  done: null,
};
let currentKey = null;

function ensure(key, src) {
  if (!registry[key]) {
    const a = new Audio(src);
    a.loop = false;
    a.volume = 1.0;
    registry[key] = a;
  }
  return registry[key];
}

function allKeys() {
  return ['inhale', 'hold', 'exhale', 'done'];
}

export function stopAllSounds() {
  allKeys().forEach(k => {
    const a = registry[k];
    if (!a) return;
    try { a.pause(); a.currentTime = 0; } catch {}
  });
  currentKey = null;
}

export function pauseAllSounds() {
  allKeys().forEach(k => {
    const a = registry[k];
    if (!a) return;
    try { a.pause(); } catch {}
  });
}

export function resumeCurrentSound() {
  if (!currentKey) return;
  const a = registry[currentKey];
  if (!a) return;
  try { a.play(); } catch {}
}

export function playPhaseSound(phase) {
  const srcMap = {
    inhale: '/sounds/inhale.mp3',
    hold: '/sounds/hold.mp3',
    exhale: '/sounds/exhale.mp3',
    done: '/sounds/complete.mp3',
  };

  const key = (phase === 'inhale' || phase === 'hold' || phase === 'exhale') ? phase : 'done';
  const src = srcMap[key];
  if (!src) return;

  // stop anything else to avoid stacking
  stopAllSounds();

  const a = ensure(key, src);
  currentKey = key;
  try {
    a.currentTime = 0;
    a.play();
  } catch {}
}
