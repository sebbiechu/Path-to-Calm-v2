// audio.js – handles sound logic using AudioContext for iOS stability

let audioCtx;
let audioBuffers = {};
const soundFiles = {
  "Breathe In": "sounds/inhale.mp3",
  "Hold": "sounds/hold.mp3",
  "Breathe Out": "sounds/exhale.mp3"
};

async function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const loadSound = async (label, url) => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    audioBuffers[label] = await audioCtx.decodeAudioData(arrayBuffer);
  };

  const promises = Object.entries(soundFiles).map(([label, url]) => loadSound(label, url));
  await Promise.all(promises);
}

function playPhaseSound(label) {
  if (!audioCtx || !audioBuffers[label]) return;
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffers[label];
  source.connect(audioCtx.destination);
  source.start(0);
}