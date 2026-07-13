(() => {
  const startDate = new Date("2024-12-12T12:00:00");
  const timer = document.getElementById("timer-count");
  const updateLoveTimer = () => {
    const seconds = Math.max(0, Math.floor((Date.now() - startDate.getTime()) / 1000));
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    timer.textContent = `${days} days, ${hours} hours`;
  };
  updateLoveTimer();
  window.setInterval(updateLoveTimer, 60000);

  document.getElementById("logout-btn").addEventListener("click", () => { localStorage.removeItem("accessGranted"); location.href = "index.html"; });
})();
