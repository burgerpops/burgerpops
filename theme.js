(() => {
  const root = document.documentElement;
  const themeButton = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark" || savedTheme === "light") root.dataset.theme = savedTheme;
  const updateLabel = () => {
    if (!themeButton) return;
    const isDark = root.dataset.theme === "dark";
    themeButton.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
    themeButton.querySelector("[aria-hidden]").textContent = isDark ? "☀" : "☾";
  };
  updateLabel();
  themeButton?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", root.dataset.theme);
    updateLabel();
  });
})();

document.addEventListener("submit", async (event) => {
  if (event.target.id !== "login-form") return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const field = document.getElementById("secretInput");
  const error = document.getElementById("errorMessage");
  try {
    const response = await fetch("https://burgerpops-secret-login.jeztocj.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: field.value })
    });
    if (!response.ok) {
      error.textContent = "That secret word is not quite right.";
      field.select();
      return;
    }
    const { token } = await response.json();
    const [{ initializeApp, getApps, getApp }, { getAuth, signInWithCustomToken }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js")
    ]);
    const config = { apiKey: "AIzaSyD_l5r2S8Z_9CC64cviB72MYhh2BX1Q97Y", authDomain: "burgerpops-121224.firebaseapp.com", projectId: "burgerpops-121224", storageBucket: "burgerpops-121224.appspot.com", messagingSenderId: "1204666668", appId: "1:1204666668:web:37ac2f645f411702aa6c89" };
    const app = getApps().length ? getApp() : initializeApp(config);
    await signInWithCustomToken(getAuth(app), token);
  } catch (workerError) {
    console.warn("Private Firebase sign-in was not completed.", workerError);
    error.textContent = "Could not connect to our private space. Please try again.";
    return;
  }
  localStorage.setItem("accessGranted", "true");
  location.href = "EgZjaHJvbWUqBwgDEA.html";
}, true);

if (location.pathname.endsWith("canvas.html")) {
  const sharedDoodle = document.createElement("script");
  sharedDoodle.type = "module";
  sharedDoodle.src = "shared-doodle.js";
  document.head.append(sharedDoodle);
}
