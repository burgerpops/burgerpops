import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const config = { apiKey: "AIzaSyD_l5r2S8Z_9CC64cviB72MYhh2BX1Q97Y", authDomain: "burgerpops-121224.firebaseapp.com", projectId: "burgerpops-121224", storageBucket: "burgerpops-121224.appspot.com", messagingSenderId: "1204666668", appId: "1:1204666668:web:37ac2f645f411702aa6c89" };
const app = getApps().length ? getApp() : initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const notice = document.getElementById("notice");
const saveButton = document.getElementById("save");
const sharedDoodle = doc(db, "ourSpace", "latestDoodle");

function drawImage(source) {
  const image = new Image();
  image.onload = () => {
    context.fillStyle = "#fffafa";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    notice.textContent = "Your shared doodle is here.";
  };
  image.src = source;
}

function compressedDrawing() {
  const small = document.createElement("canvas");
  small.width = 600;
  small.height = 375;
  const smallContext = small.getContext("2d");
  smallContext.fillStyle = "#fffafa";
  smallContext.fillRect(0, 0, small.width, small.height);
  smallContext.drawImage(canvas, 0, 0, small.width, small.height);
  return small.toDataURL("image/jpeg", 0.72);
}

onAuthStateChanged(auth, user => {
  if (!user) {
    notice.textContent = "Log in through the hosted site to view the shared doodle.";
    return;
  }
  onSnapshot(sharedDoodle, snapshot => {
    const image = snapshot.data()?.image;
    if (image) drawImage(image);
    else notice.textContent = "No shared doodle yet. Make the first one.";
  }, () => { notice.textContent = "The shared doodle is not available yet."; });
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
    const image = compressedDrawing();
    if (image.length > 850000) throw new Error("Doodle is too large");
    await setDoc(sharedDoodle, { image, updatedAt: serverTimestamp() });
    notice.textContent = "Saved for both of you with love.";
  } catch {
    notice.textContent = "This doodle is too detailed to save. Try a simpler sketch.";
  } finally {
    saveButton.disabled = false;
  }
}, true);
