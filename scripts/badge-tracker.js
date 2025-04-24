function updateBadgeTrack() {
  const currentXP = parseInt(localStorage.getItem("xp")) || 0;
  const badges = [
    { id: "badgeCloudwalker", threshold: 50 },
    { id: "badgeLunaguide", threshold: 100 },
    { id: "badgePetalmind", threshold: 150 }
  ];

  badges.forEach(badge => {
    const el = document.getElementById(badge.id);
    if (el && currentXP >= badge.threshold) {
      el.classList.remove("locked");
      el.classList.add("unlocked");
    }
  });
}