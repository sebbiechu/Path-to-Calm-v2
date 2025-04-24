document.getElementById("secretTrigger").addEventListener("click", () => {
  if (!isRunning) {
    // Sync memory state before calling finishSession()
    xp += XP_PER_SESSION;
    sessionCount += 1;
    localStorage.setItem("xp", xp);
    localStorage.setItem("sessionCount", sessionCount);
    finishSession();
  }
});