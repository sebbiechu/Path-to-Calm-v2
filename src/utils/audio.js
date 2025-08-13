let currentAudios = [];

export function playPhaseSound(phase) {
  // stop previous phase sound if you don't want overlap
  stopAllSounds();

  const srcMap = {
    inhale: '/sounds/inhale.mp3',
    hold: '/sounds/hold.mp3',
    exhale: '/sounds/exhale.mp3',
    done: '/sounds/complete.mp3'
  };

  const src = srcMap[phase];
  if (!src) return;

  const audio = new Audio(src);
  audio.loop = false;       // ensure no looping persists
  audio.volume = 1.0;
  audio.play().catch(() => {});
  currentAudios.push(audio);
}

export function stopAllSounds() {
  for (const a of currentAudios) {
    try {
      a.pause();
      a.currentTime = 0;
    } catch {}
  }
  currentAudios = [];
}
