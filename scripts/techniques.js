// techniques.js – attaches sound labels for use by audio.js

const techniqueOrder = ["classic", "box", "478"];
let currentTechniqueIndex = 0;
let currentTechnique = techniqueOrder[currentTechniqueIndex];
let phases = [];

const inhaleDurationLabel = document.getElementById("inhaleDuration");
const holdDurationLabel = document.getElementById("holdDuration");
const exhaleDurationLabel = document.getElementById("exhaleDuration");
const techniqueTitle = document.getElementById("techniqueTitle");
const techniqueOverview = document.getElementById("techniqueOverview");
const techniqueTips = document.getElementById("techniqueTips");

function setPhases(key) {
  const data = techniqueData[key];
  techniqueTitle.textContent = data.name;
  techniqueOverview.textContent = data.overview;
  techniqueTips.textContent = data.tips;

  inhaleDurationLabel.textContent = `Inhale: ${data.inhale / 1000}s`;
  exhaleDurationLabel.textContent = `Exhale: ${data.exhale / 1000}s`;
  holdDurationLabel.textContent = `Hold: ${key === "478" ? 7 : 5}s`;

  phases = [
    { label: "Breathe In", duration: data.inhale, sound: "Breathe In" },
    { label: "Hold", duration: key === "478" ? 7000 : 5000, sound: "Hold" },
    { label: "Breathe Out", duration: data.exhale, sound: "Breathe Out" },
    { label: "Hold", duration: key === "478" ? 0 : 5000, sound: "Hold" }
  ];
}

const techniqueData = {
  classic: {
    name: "Classic",
    inhale: 3000,
    exhale: 3000,
    overview: "A balanced technique ideal for beginners. Helps create rhythm and calm the nervous system.",
    tips: "Breathe in through your nose, hold gently, and exhale through the mouth. Stay relaxed."
  },
  box: {
    name: "Box Breathing",
    inhale: 4000,
    exhale: 4000,
    overview: "Box breathing balances breath with equal parts inhale, hold, exhale, and hold. Often used by athletes and military.",
    tips: "Visualize each side of a square as you breathe: Inhale → Hold → Exhale → Hold."
  },
  "478": {
    name: "4-7-8 Breathing",
    inhale: 4000,
    exhale: 8000,
    overview: "A calming method that promotes deep relaxation. Great for sleep and stress relief.",
    tips: "Inhale through the nose for 4s, hold for 7s, and exhale slowly through the mouth for 8s."
  }
};