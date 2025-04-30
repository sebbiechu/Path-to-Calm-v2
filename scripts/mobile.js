function setMobileViewportHeight() {
  const mobileApp = document.querySelector('.mobile-app');
  if (mobileApp) {
    const height = window.innerHeight;
    mobileApp.style.height = `${height}px`;
    mobileApp.style.maxHeight = `${height}px`;
    console.log(`📏 .mobile-app height set to ${height}px`);
  }
}

// Run after layout is stable
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(setMobileViewportHeight, 100); // delay ensures accurate height
});

// Update on resize or orientation change
window.addEventListener('resize', () => {
  setTimeout(setMobileViewportHeight, 100);
});


function initMobileApp() {
    const techniques = [
      { name: "Classic", inhale: 3, hold: 3, exhale: 3 },
      { name: "Box Breathing", inhale: 4, hold: 4, exhale: 4 },
      { name: "4-7-8 Breathing", inhale: 4, hold: 7, exhale: 8 }
    ];

    let currentTechniqueIndex = 0;
    let currentTechnique = techniques[currentTechniqueIndex];

 
    // DOM elements
    const mobileApp = document.querySelector(".mobile-app");
    const infoBtn = document.querySelector(".info-btn");
    const infoModal = document.getElementById("infoModal");
    const closeInfo = document.getElementById("closeInfo");
    const mobileStartBtn = document.querySelector(".start-btn");
    const mobileCircle = document.querySelector(".breathing-circle");
    const mobilePhaseLabel = document.getElementById("mobilePhaseLabel");

    const overlay = document.getElementById("overlay");
    const achievementImage = document.getElementById("achievementImage");
    const achievementTitle = document.getElementById("achievementTitle");
    const achievementDescription = document.getElementById("achievementDescription");
    const restartBtn = document.getElementById("restartBtn");
    const repeatBtn = document.getElementById("repeatBtn");

    let lastMobileScale = "scale(1)";
    let mobilePhases = [];
    let mobilePhaseIndex = 0;
    let mobileCycleCount = 0;
    const totalMobileCycles = 2; // Set total cycles to 2
    let mobileRunning = false;

  
    // Badge element map
    const badgeMap = {
      "Classic": "badgeCloudwalkerMobile",
      "Box Breathing": "badgeLunaguideMobile",
      "4-7-8 Breathing": "badgePetalmindMobile"
    };

    let badgeProgress = 0; // Track the current badge progress (0, 1, or 2)

    // Swipe logic
    let touchStartX = 0;
    let touchEndX = 0;

    mobileApp.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    mobileApp.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });

    function handleSwipe() {
      let newTechnique;
      if (touchEndX < touchStartX - 50) newTechnique = nextTechnique();
      else if (touchEndX > touchStartX + 50) newTechnique = prevTechnique();

      if (newTechnique) updateMobileUI(newTechnique);
    }

    function nextTechnique() {
      currentTechniqueIndex = (currentTechniqueIndex + 1) % techniques.length;
      currentTechnique = techniques[currentTechniqueIndex];
      return currentTechnique;
    }

    function prevTechnique() {
      currentTechniqueIndex = (currentTechniqueIndex - 1 + techniques.length) % techniques.length;
      currentTechnique = techniques[currentTechniqueIndex];
      return currentTechnique;
    }

    function updateMobileUI(technique) {
      document.querySelector(".technique-title").textContent = technique.name;
      updateMobileDurations(technique);
      updateDotIndicator(currentTechniqueIndex);
    }

    function updateMobileDurations(technique) {
      document.querySelector(".top-bar .icon:nth-child(1) span").textContent = `Inhale: ${technique.inhale}s`;
      document.querySelector(".top-bar .icon:nth-child(2) span").textContent = `Hold: ${technique.hold}s`;
      document.querySelector(".top-bar .icon:nth-child(3) span").textContent = `Exhale: ${technique.exhale}s`;
    }

    function updateDotIndicator(index) {
      const dots = document.querySelectorAll(".technique-indicators .dot");
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
      });
    }

    infoBtn?.addEventListener("click", () => {
      infoModal.classList.remove("hidden");
    });

    closeInfo?.addEventListener("click", () => {
      infoModal.classList.add("hidden");
    });

    function unlockBadge(badgeId) {
      const badge = document.getElementById(badgeId);
      if (badge) {
        badge.classList.remove("locked");
        badge.classList.add("unlocked");
        console.log(`${badgeId} is now unlocked`);
      }
    
      // This will also update the bottom badge highlight
const bottomBadge = document.querySelector(`#${badgeId}`);
if (bottomBadge) {
  bottomBadge.classList.remove("locked");
  bottomBadge.classList.add("unlocked"); // Highlight the badge on the bottom row
}
    }  

    function setMobilePhases(technique) {
      mobilePhases = [
        { label: "Breathe In", duration: technique.inhale * 1000, sound: "inhale" },
        { label: "Hold", duration: technique.hold * 1000, sound: "hold" },
        { label: "Breathe Out", duration: technique.exhale * 1000, sound: "exhale" }
      ];
    }

    function updateMobileVisuals(phase) {
      const colors = {
        "Breathe In": ["#ffecd2", "#fcb69f"],
        "Hold": ["#e1e1e1", "#cfcfcf"],
        "Breathe Out": ["#c2e9fb", "#a1c4fd"]
      }[phase.label] || ["#ffffff", "#dddddd"];

      mobileCircle.style.background = `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;

      if (phase.label === "Breathe In") {
        lastMobileScale = "scale(1.25)";
        mobileCircle.style.transform = lastMobileScale;
      } else if (phase.label === "Breathe Out") {
        lastMobileScale = "scale(0.9)";
        mobileCircle.style.transform = lastMobileScale;
      } else {
        mobileCircle.style.transform = lastMobileScale;
      }
    }

    function playMobileSound(type) {
      const labelMap = {
        inhale: "Breathe In",
        exhale: "Breathe Out",
        hold: "Hold"
      };
      playPhaseSound(labelMap[type]);
    }

    function fadeMobileText(element, text, delay = 0) {
      setTimeout(() => {
        element.classList.remove("show");
        setTimeout(() => {
          element.textContent = text;
          element.classList.add("show");
        }, 250);
      }, delay);
    }

    function runMobilePhase() {
      if (!mobileRunning) return;
    
      const phase = mobilePhases[mobilePhaseIndex];
      const seconds = Math.floor(phase.duration / 1000);
    
      updateMobileVisuals(phase);
      fadeMobileText(mobilePhaseLabel, phase.label);
      setTimeout(() => playMobileSound(phase.sound), 200);
    
      let countdown = seconds;
    
      function countdownTick() {
        if (countdown > 0) {
          fadeMobileText(mobilePhaseLabel, countdown.toString());
          countdown--;
          setTimeout(countdownTick, 1000);
        } else {
          // Only after the full countdown ends:
          if (phase.label === "Breathe Out") {
            mobileCycleCount++;
            const progressEl = document.getElementById("mobileProgress");
            if (progressEl) {
              progressEl.textContent = `${mobileCycleCount} / ${totalMobileCycles}`;
            }
            if (mobileCycleCount >= totalMobileCycles) {
              finishMobileSession();
              return;
            }
          }
    
          // Move to the next phase
          mobilePhaseIndex++;
          if (mobilePhaseIndex >= mobilePhases.length) {
            mobilePhaseIndex = 0; // Reset to first phase after complete cycle
          }
          runMobilePhase();
        }
      }
    
      // Start countdown after a short delay
      setTimeout(countdownTick, 1000);
    }
    
    

    mobileStartBtn.addEventListener("click", async () => {
     await prepareAudio();
      if (mobileRunning) return;
      mobileRunning = true;
      mobileCycleCount = 0;
      mobilePhaseIndex = 0;
      const progressEl = document.getElementById("mobileProgress");
if (progressEl) {
progressEl.textContent = `0 / ${totalMobileCycles}`;
}
      setMobilePhases(currentTechnique);
      runMobilePhase();
      mobileStartBtn.style.display = "none";
    });

    function finishMobileSession() {
      mobileRunning = false;
    
      mobileCircle.style.transform = "scale(1)";
      mobileCircle.style.background = "linear-gradient(135deg, #f7b2d9, #b2d9f7)";
      mobilePhaseLabel.textContent = "";
    
      let achievementData = {};
    
      if (badgeProgress === 0) {
        achievementData = {
          title: "Cloudwalker",
          desc: "You’ve just completed your very first breathing session...",
          image: "images/cloudwalker.png"
        };
      } else if (badgeProgress === 1) {
        achievementData = {
          title: "Lunaguide",
          desc: "With steady breath and mindful flow...",
          image: "images/lunaguide.png"
        };
      } else if (badgeProgress === 2) {
        achievementData = {
          title: "Petalmind",
          desc: "Your awareness has softened, unfolding like a lotus...",
          image: "images/petalmind.png"
        };
      }
    
      achievementImage.src = achievementData.image;
      achievementTitle.textContent = achievementData.title;
      achievementDescription.innerHTML = achievementData.desc;
    
      let currentXP = parseInt(localStorage.getItem("xp")) || 0;
      currentXP += 50;
      localStorage.setItem("xp", currentXP);
    
      if (badgeProgress === 0) {
        unlockBadge("badgeCloudwalkerMobile");
      } else if (badgeProgress === 1) {
        unlockBadge("badgeLunaguideMobile");
      } else if (badgeProgress === 2) {
        unlockBadge("badgePetalmindMobile");
      }
    
      if (typeof updateBadgeTrack === "function") {
        updateBadgeTrack();
      }
    
      overlay.style.display = "flex";
    }
         

    restartBtn.addEventListener("click", () => {
      if (badgeProgress === 2) {
        // After finishing Petalmind, show Thank You page after Close
        const thankYouOverlay = document.getElementById("thankYouOverlay");
        if (thankYouOverlay) {
          overlay.style.display = "none";
          thankYouOverlay.style.display = "flex";
        }
        badgeProgress++; // Make sure badgeProgress becomes 3 after Thank You
        return;
      }
    
      badgeProgress++; // Normal progress after Cloudwalker and Lunaguide
    
      overlay.style.display = "none";
      mobileStartBtn.textContent = "Start Again";
      mobileStartBtn.style.display = "inline-block";
    
      mobilePhaseLabel.textContent = "Ready";
    });
    
    
    

    repeatBtn.addEventListener("click", () => {
      // Increment the badgeProgress to unlock the next badge
      badgeProgress++;

      // If we've completed all the badges, reset progress to 0
      if (badgeProgress > 2) badgeProgress = 0;

      // Unlock the next badge
      const badgeId = badgeMap[badgeProgress];
      unlockBadge(badgeId);

      overlay.style.display = "none";
      mobileStartBtn.style.display = "none";
      mobileRunning = true;
      mobileCycleCount = 0;
      mobilePhaseIndex = 0;
      setMobilePhases(currentTechnique);
      runMobilePhase();
    });

    updateMobileUI(currentTechnique);
  }

  window.addEventListener("load", () => {
    // ✅ Runs only when EVERYTHING (DOM + styles + layout) is ready
    const interval = setInterval(() => {
      const mobileLayout = document.querySelector(".mobile-layout");
      const startButton = document.querySelector(".start-btn");
  
      const isVisible =
        mobileLayout &&
        getComputedStyle(mobileLayout).display !== "none" &&
        startButton;
  
      if (isVisible) {
        console.log("✅ Fully loaded on mobile, starting app.");
        clearInterval(interval);
        initMobileApp();
        console.log("initMobileApp running...");
        console.log("Found .start-btn:", document.querySelector(".start-btn"));
        console.log("Found .mobile-layout:", document.querySelector(".mobile-layout"));

      }
    }, 100);
  });
  
  
  
  
  
