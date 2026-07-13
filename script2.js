(() => {
  const startDate = new Date("2024-12-12T12:00:00");
  const timer = document.getElementById("timer-count");
  const anniversary = document.getElementById("anniversary-countdown");
  const updateLoveTimer = () => {
    const seconds = Math.max(0, Math.floor((Date.now() - startDate.getTime()) / 1000));
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    timer.textContent = `${days} days, ${hours} hours`;
    if (anniversary) {
      const now = new Date();
      let next = new Date(now.getFullYear(), 11, 12, 0, 0, 0);
      if (next <= now) next = new Date(now.getFullYear() + 1, 11, 12, 0, 0, 0);
      const remaining = Math.max(0, Math.floor((next - now) / 1000));
      anniversary.textContent = `Next anniversary: ${Math.floor(remaining / 86400)} days, ${Math.floor((remaining % 86400) / 3600)} hours`;
    }
  };
  updateLoveTimer();
  window.setInterval(updateLoveTimer, 60000);

  document.getElementById("logout-btn").addEventListener("click", () => { localStorage.removeItem("accessGranted"); location.href = "index.html"; });
})();
