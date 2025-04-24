const pulseCircle = document.getElementById("pulseCircle");
const gradientOverlay = document.getElementById("gradientOverlay");
const phaseLabel = document.getElementById("phaseLabel");
const button = document.getElementById("controlBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const overlay = document.getElementById("overlay");
const xpLabel = document.getElementById("xpLabel");
const xpFill = document.getElementById("xpFill");
const restartBtn = document.getElementById("restartBtn");
const repeatBtn = document.getElementById("repeatBtn");
const progressEl = document.getElementById("progress");
const achievementImage = document.getElementById("achievementImage");
const achievementTitle = document.getElementById("achievementTitle");
const achievementDescription = document.getElementById("achievementDescription");

let currentPhaseIndex = 0;
let isRunning = false;
let cycleCount = 0;
const totalCycles = 3;
let repeating = false;

function fadeText(text, delay = 0) {
  setTimeout(() => {
    phaseLabel.classList.remove("show");
    setTimeout(() => {
      phaseLabel.textContent = text;
      phaseLabel.classList.add("show");
    }, 250);
  }, delay);
}

function updateVisuals(phase) {
  const colors = {
    "Breathe In": ["#ffecd2", "#fcb69f"],
    "Hold": ["#e1e1e1", "#cfcfcf"],
    "Breathe Out": ["#c2e9fb", "#a1c4fd"]
  }[phase.label] || ["#ffffff", "#dddddd"];

  gradientOverlay.style.background = `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
  gradientOverlay.style.opacity = 1;

  if (phase.label === "Breathe In") {
    pulseCircle.style.transform = "scale(1.3)";
  } else if (phase.label === "Breathe Out") {
    pulseCircle.style.transform = "scale(0.9)";
  }
}

function runPhase(index) {
  if (!isRunning) return;

  const phase = phases[index];
  const seconds = Math.floor(phase.duration / 1000);

  updateVisuals(phase);
  if (phase.sound) playPhaseSound(phase.sound);

  fadeText(phase.label);
  for (let i = seconds; i >= 1; i--) {
    fadeText(i.toString(), (seconds - i + 1) * 1000);
  }

  const totalDelay = (seconds + 1) * 1000;
  setTimeout(() => {
    currentPhaseIndex = (index + 1) % phases.length;

    if (currentPhaseIndex === 0) {
      cycleCount++;
      progressEl.textContent = `${cycleCount} / ${totalCycles}`;
    }

    if (cycleCount >= totalCycles) {
      finishSession();
    } else {
      runPhase(currentPhaseIndex);
    }
  }, totalDelay);
}

function startBreathing() {
  if (isRunning) return;
  isRunning = true;
  cycleCount = 0;
  progressEl.textContent = `0 / ${totalCycles}`;
  setPhases(currentTechnique);
  currentPhaseIndex = 0;

  initAudioContext().then(() => {
    const firstPhase = phases[0];
    phaseLabel.textContent = firstPhase.label;
    phaseLabel.classList.add("show");
    pulseCircle.style.transform = "scale(1.3)";
    gradientOverlay.style.background = "linear-gradient(135deg, #ffecd2, #fcb69f)";
    gradientOverlay.style.opacity = 1;

    playPhaseSound(firstPhase.sound);

    const seconds = Math.floor(firstPhase.duration / 1000);
    for (let i = seconds; i >= 1; i--) {
      fadeText(i.toString(), (seconds - i + 1) * 1000);
    }

    const totalDelay = (seconds + 1) * 1000;
    setTimeout(() => {
      currentPhaseIndex = 1;
      runPhase(currentPhaseIndex);
    }, totalDelay);
  });

  button.style.display = "none";
  prevBtn.style.display = "none";
  nextBtn.style.display = "none";
}

function finishSession() {
  isRunning = false;
  pulseCircle.style.transform = "scale(1)";
  gradientOverlay.style.opacity = 0;

  if (!repeating) {
    updateXP();
  }

  const unlocked = Math.min(Math.floor(xp / XP_PER_SESSION), achievements.length);
  const achievement = achievements[unlocked - 1] || achievements[0];

  achievementImage.src = achievement.image;
  achievementTitle.textContent = achievement.title;
  achievementDescription.textContent = achievement.description;

  xpFill.style.width = `${(xp / LEVEL_UP_XP) * 100}%`;
  xpLabel.textContent = `XP: ${xp} / ${LEVEL_UP_XP}`;
  overlay.style.display = "flex";
}

function restart() {
  overlay.style.display = "none";
  pulseCircle.style.transform = "scale(1)";
  gradientOverlay.style.opacity = 0;
  button.textContent = "Start";
  button.style.display = "inline-block";
  prevBtn.style.display = "";
  nextBtn.style.display = "";
  phaseLabel.textContent = "Ready";
  isRunning = false;
  repeating = false;

  console.log("Restart triggered – updating badges now");
  updateBadgeTrack(); // 👈 This is the magic!
}

function repeatSession() {
  overlay.style.display = "none";
  repeating = true;
  startBreathing();
}

function updateTechnique(direction) {
  currentTechniqueIndex = (direction === "next")
    ? (currentTechniqueIndex + 1) % techniqueOrder.length
    : (currentTechniqueIndex - 1 + techniqueOrder.length) % techniqueOrder.length;

  currentTechnique = techniqueOrder[currentTechniqueIndex];
  setPhases(currentTechnique);
  phaseLabel.textContent = "Ready";
  pulseCircle.style.transform = "scale(1)";
  gradientOverlay.style.opacity = 0;
}

button.onclick = startBreathing;
restartBtn.onclick = () => {
  overlay.style.display = "none";

  // 👇 Show Thank You page if user has max XP
  if (xp >= LEVEL_UP_XP) {
    const thankYouOverlay = document.getElementById("thankYouOverlay");
    if (thankYouOverlay) {
      thankYouOverlay.style.display = "flex";
    } else {
      restart(); // fallback if modal missing
    }
  } else {
    restart();
  }
};

repeatBtn.onclick = repeatSession;
prevBtn.onclick = () => updateTechnique("prev");
nextBtn.onclick = () => updateTechnique("next");

window.onload = () => {
  setPhases(currentTechnique);
  xpFill.style.width = `${(xp / LEVEL_UP_XP) * 100}%`;
  xpLabel.textContent = `XP: ${xp} / ${LEVEL_UP_XP}`;

  updateBadgeTrack();

};




window.addEventListener("DOMContentLoaded", function () {
  const overlay = document.getElementById("instructionOverlay");
  const startBtn = document.getElementById("startAppBtn");

  if (localStorage.getItem("hasSeenInstructions")) {
    overlay.style.display = "none";
  }

  startBtn.addEventListener("click", function () {
    overlay.style.display = "none";
    localStorage.setItem("hasSeenInstructions", "true");
  });
});



// Pop-up Instruction Page
window.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("onboardingModal");
  const slides = document.querySelectorAll(".onboarding-slide");
  const dots = document.querySelectorAll(".dot");
  const nextBtn = document.getElementById("nextSlideBtn");
  const skipBtn = document.getElementById("skipIntroBtn");

  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
      dots[i].classList.toggle("active", i === index);
    });

    // Change button text on last slide
    if (index === slides.length - 1) {
      nextBtn.textContent = "Let’s Begin";
    } else {
      nextBtn.textContent = "Next";
    }
  }

  nextBtn.addEventListener("click", () => {
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      showSlide(currentSlide);
    } else {
      modal.style.display = "none";
      localStorage.setItem("hasSeenIntro", "true");
    }
  });

  skipBtn.addEventListener("click", () => {
    modal.style.display = "none";
    localStorage.setItem("hasSeenIntro", "true");
  });

  // Only show if user hasn’t seen it
  if (localStorage.getItem("hasSeenIntro")) {
    modal.style.display = "none";
  } else {
    showSlide(currentSlide);
  }
});


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/scripts/service-worker.js')
    .then(() => console.log('Service Worker registered!'))
    .catch((err) => console.log('Service Worker registration failed:', err));
}
