// achievements.js – XP tracking and achievement logic

const XP_PER_SESSION = 50;
const LEVEL_UP_XP = 150;
let sessionCount = parseInt(localStorage.getItem("sessionCount")) || 0;
let xp = parseInt(localStorage.getItem("xp")) || 0;

const achievements = [
  {
    id: "cloudwalker",
    title: "Cloudwalker",
    image: "images/cloudwalker.png",
    description: "You’ve just completed your very first breathing session. Like a monk rising above the misty mountains, you’ve taken your first step on a journey toward inner peace. Breathe it in—this is your moment."
  },
  {
    id: "lunaguide",
    title: "Lunaguide",
    image: "images/lunaguide.png",
    description: "With steady breath and mindful flow, you've synced with the natural cycles. Your breath waxes and wanes like the moon—effortless and eternal."
  },
  {
    id: "petalmind",
    title: "Petalmind",
    image: "images/petalmind.png",
    description: "Your awareness has softened, unfolding like a lotus with every breath. You are now a Petalmind — gentle in thought, strong in presence."
  }
];

function updateXP() {
  xp += XP_PER_SESSION;
  sessionCount += 1;
  localStorage.setItem("xp", xp);
  localStorage.setItem("sessionCount", sessionCount);
}