import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getStorage, ref, getDownloadURL, uploadString } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const config = { apiKey: "AIzaSyD_l5r2S8Z_9CC64cviB72MYhh2BX1Q97Y", authDomain: "burgerpops-121224.firebaseapp.com", projectId: "burgerpops-121224", storageBucket: "burgerpops-121224.appspot.com", messagingSenderId: "1204666668", appId: "1:1204666668:web:37ac2f645f411702aa6c89" };
const app = getApps().length ? getApp() : initializeApp(config);
const auth = getAuth(app);
const storage = getStorage(app);
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const notice = document.getElementById("notice");
const saveButton = document.getElementById("save");
const sharedDoodle = ref(storage, "our-space/latest-doodle.png");

function drawImage(url) {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => {
    context.fillStyle = "#fffafa";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    notice.textContent = "Your shared doodle is here.";
  };
  image.src = url;
}

onAuthStateChanged(auth, async user => {
  if (!user) {
    notice.textContent = "Log in through the hosted site to view the shared doodle.";
    return;
  }
  try {
    drawImage(await getDownloadURL(sharedDoodle));
  } catch (error) {
    if (error.code === "storage/object-not-found") notice.textContent = "No shared doodle yet. Make the first one.";
    else notice.textContent = "The shared doodle is not available yet.";
  }
});

saveButton.addEventListener("click", async event => {
  event.preventDefault();
  event.stopImmediatePropagation();
  if (!auth.currentUser) {
    notice.textContent = "Please log in through the hosted site first.";
    return;
  }
  saveButton.disabled = true;
  notice.textContent = "Saving for both of you…";
  try {
    await uploadString(sharedDoodle, canvas.toDataURL("image/png"), "data_url", { contentType: "image/png" });
    notice.textContent = "Saved for both of you with love.";
  } catch {
    notice.textContent = "Could not save the shared doodle yet.";
  } finally {
    saveButton.disabled = false;
  }
}, true);
