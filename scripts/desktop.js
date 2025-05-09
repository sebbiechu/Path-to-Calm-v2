

if (window.innerWidth > 600) {
  window.addEventListener("DOMContentLoaded", function () {
    console.log("Desktop breathing loaded");

    // DOM Elements
    const pulseCircle = document.getElementById("pulseCircle");
    const gradientOverlay = document.getElementById("gradientOverlay");
    const phaseLabel = document.getElementById("phaseLabel");
    const startBtn = document.getElementById("controlBtn");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const overlay = document.getElementById("overlay");
    const restartBtn = document.getElementById("restartBtn");
    const repeatBtn = document.getElementById("repeatBtn");
    const xpLabel = document.getElementById("xpLabel");
    const xpFill = document.getElementById("xpFill");
    const progressEl = document.getElementById("progress");
    const techniqueTitle = document.getElementById("techniqueTitle");
    const inhaleDuration = document.getElementById("inhaleDuration");
    const holdDuration = document.getElementById("holdDuration");
    const exhaleDuration = document.getElementById("exhaleDuration");
    const achievementTitle = document.getElementById("achievementTitle");
    const achievementDescription = document.getElementById("achievementDescription");
    const achievementImage = document.getElementById("achievementImage");

    const techniqueOrder = [
      { name: "Classic" },
      { name: "Box Breathing" },
      { name: "4-7-8 Breathing" }
    ];

    let currentTechniqueIndex = 0;
    let currentTechnique = techniqueOrder[currentTechniqueIndex];
    let phases = [];
    let currentPhaseIndex = 0;
    let isRunning = false;
    let cycleCount = 0;
    const totalCycles = 2;

    function setPhases(technique) {
      if (technique.name === "Classic") {
        phases = [
          { label: "Breathe In", duration: 3000 },
          { label: "Hold", duration: 3000 },
          { label: "Breathe Out", duration: 3000 }
        ];
        inhaleDuration.textContent = "Inhale: 3s";
        holdDuration.textContent = "Hold: 3s";
        exhaleDuration.textContent = "Exhale: 3s";
      } else if (technique.name === "Box Breathing") {
        phases = [
          { label: "Breathe In", duration: 4000 },
          { label: "Hold", duration: 4000 },
          { label: "Breathe Out", duration: 4000 },
          { label: "Hold", duration: 4000 }
        ];
        inhaleDuration.textContent = "Inhale: 4s";
        holdDuration.textContent = "Hold: 4s";
        exhaleDuration.textContent = "Exhale: 4s";
      } else if (technique.name === "4-7-8 Breathing") {
        phases = [
          { label: "Breathe In", duration: 4000 },
          { label: "Hold", duration: 7000 },
          { label: "Breathe Out", duration: 8000 }
        ];
        inhaleDuration.textContent = "Inhale: 4s";
        holdDuration.textContent = "Hold: 7s";
        exhaleDuration.textContent = "Exhale: 8s";
      }
    }

    function fadeText(text) {
      phaseLabel.classList.remove("show");
      setTimeout(() => {
        phaseLabel.textContent = text;
        phaseLabel.classList.add("show");
      }, 250);
    }

    function runPhase(index) {
      if (!isRunning) return;

      const phase = phases[index];
      let seconds = Math.floor(phase.duration / 1000);

      fadeText(phase.label);
      playPhaseSound(phase.label);
      
      if (phase.label === "Breathe In") {
        pulseCircle.style.transform = "scale(1.3)";
        gradientOverlay.style.background = "linear-gradient(135deg, #ffecd2, #fcb69f)";
        gradientOverlay.style.opacity = 1;
      } else if (phase.label === "Hold") {
        pulseCircle.style.transform = pulseCircle.style.transform;
        gradientOverlay.style.background = "linear-gradient(135deg, #e1e1e1, #cfcfcf)";
        gradientOverlay.style.opacity = 1;
      } else if (phase.label === "Breathe Out") {
        pulseCircle.style.transform = "scale(0.9)";
        gradientOverlay.style.background = "linear-gradient(135deg, #c2e9fb, #a1c4fd)";
        gradientOverlay.style.opacity = 1;
      }

      let countdownInterval = setInterval(() => {
        if (!isRunning) {
          clearInterval(countdownInterval);
          return;
        }
        seconds--;
        if (seconds > 0) {
          fadeText(seconds.toString());
        } else {
          clearInterval(countdownInterval);
        }
      }, 1000);

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
      }, phase.duration);
    }

    async function startBreathing() {
      await prepareAudio();  // 🔥    
      if (isRunning) return;
      isRunning = true;
      cycleCount = 0;
      progressEl.textContent = "0 / 2";
      setPhases(currentTechnique);
      currentPhaseIndex = 0;
      fadeText(phases[0].label);

      startBtn.style.display = "none";
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";

      setTimeout(() => runPhase(currentPhaseIndex), 1000);
    }

    function finishSession() {
      isRunning = false;
      pulseCircle.style.transform = "scale(1)";
      gradientOverlay.style.opacity = 0;
      overlay.style.display = "flex";

      if (typeof updateXP === "function") {
        updateXP();
      }

      let currentXP = parseInt(localStorage.getItem("xp")) || 0;
      if (currentXP > 150) currentXP = 150;
      localStorage.setItem("xp", currentXP);

      xpFill.style.width = `${(currentXP / 150) * 100}%`;
      xpLabel.textContent = `XP: ${currentXP} / 150`;

      if (typeof updateBadgeTrack === "function") {
        updateBadgeTrack();
      }

      // Show the correct achievement
      let achievement = null;

if (currentXP >= 150) {
  achievement = achievements.find(a => a.id === "petalmind");
} else if (currentXP >= 100) {
  achievement = achievements.find(a => a.id === "lunaguide");
} else if (currentXP >= 50) {
  achievement = achievements.find(a => a.id === "cloudwalker");
}

if (achievement) {
  achievementTitle.textContent = achievement.title;
  achievementDescription.innerHTML = achievement.description;
  achievementImage.src = achievement.image;
}

    }

    function restart() {
      overlay.style.display = "none";
      pulseCircle.style.transform = "scale(1)";
      gradientOverlay.style.opacity = 0;

      let currentXP = parseInt(localStorage.getItem("xp")) || 0;

      if (currentXP >= 150) {
        const thankYouOverlay = document.getElementById("thankYouOverlay");
        if (thankYouOverlay) {
          thankYouOverlay.style.display = "flex";
        }
      } else {
        startBtn.style.display = "inline-block";
        prevBtn.style.display = "inline-block";
        nextBtn.style.display = "inline-block";
        phaseLabel.textContent = "Ready";
        isRunning = false;
      }
    }

    function repeatSession() {
      overlay.style.display = "none";
      startBreathing();
    }

    function updateTechnique(direction) {
      currentTechniqueIndex = (direction === "next")
        ? (currentTechniqueIndex + 1) % techniqueOrder.length
        : (currentTechniqueIndex - 1 + techniqueOrder.length) % techniqueOrder.length;

      currentTechnique = techniqueOrder[currentTechniqueIndex];
      techniqueTitle.textContent = currentTechnique.name;
      phaseLabel.textContent = "Ready";
      pulseCircle.style.transform = "scale(1)";
      gradientOverlay.style.opacity = 0;
      setPhases(currentTechnique);
    }

    startBtn.onclick = startBreathing;
    prevBtn.onclick = () => updateTechnique("prev");
    nextBtn.onclick = () => updateTechnique("next");
    restartBtn.onclick = restart;
    repeatBtn.onclick = repeatSession;

    // Welcome Modal Logic
    const modal = document.getElementById("onboardingModal");
    if (modal) {
      const slides = document.querySelectorAll(".onboarding-slide");
      const dots = document.querySelectorAll(".dot");
      const nextSlideBtn = document.getElementById("nextSlideBtn");
      const skipIntroBtn = document.getElementById("skipIntroBtn");

      let currentSlide = 0;

      function showSlide(index) {
        slides.forEach((slide, i) => {
          slide.classList.toggle("active", i === index);
          dots[i].classList.toggle("active", i === index);
        });

        nextSlideBtn.textContent = (index === slides.length - 1) ? "Let's Begin" : "Next";
      }

      nextSlideBtn.addEventListener("click", () => {
        if (currentSlide < slides.length - 1) {
          currentSlide++;
          showSlide(currentSlide);
        } else {
          modal.style.display = "none";
          localStorage.setItem("hasSeenIntro", "true");
          setPhases(currentTechnique); // <<< FIX: load breathing immediately
        }
      });

      skipIntroBtn.addEventListener("click", () => {
        modal.style.display = "none";
        localStorage.setItem("hasSeenIntro", "true");
        setPhases(currentTechnique); // <<< FIX: load breathing immediately
      });

      if (localStorage.getItem("hasSeenIntro")) {
        modal.style.display = "none";
        setPhases(currentTechnique); // <<< FIX: load breathing immediately
      } else {
        showSlide(currentSlide);
      }
    }
  });
}

setInterval(function() {
  const element = document.getElementById('bounceDiv');
  
  // Reset the animation by removing and re-adding the class
  element.classList.remove('keepmewell');
  
  // Trigger reflow by reading offsetWidth (to restart animation)
  void element.offsetWidth;
  
  // Re-add the class to trigger the bounce animation again
  element.classList.add('keepmewell');
}, 10000);  // Trigger every 10 seconds
