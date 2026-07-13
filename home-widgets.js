import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const config = { apiKey:"AIzaSyD_l5r2S8Z_9CC64cviB72MYhh2BX1Q97Y", authDomain:"burgerpops-121224.firebaseapp.com", projectId:"burgerpops-121224", storageBucket:"burgerpops-121224.appspot.com", messagingSenderId:"1204666668", appId:"1:1204666668:web:37ac2f645f411702aa6c89" };
const app = getApps().length ? getApp() : initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);
const button = document.getElementById("miss-you-btn");
const status = document.getElementById("miss-status");
const ping = doc(db, "ourSpace", "pings");

onAuthStateChanged(auth, user => {
  if (!user) return;
  if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
  onSnapshot(ping, snapshot => {
    const data = snapshot.data();
    const isFresh = data?.sentAt?.toMillis && Date.now() - data.sentAt.toMillis() < 15000;
    if (isFresh && data.sender !== sessionStorage.getItem("ping-id") && "Notification" in window && Notification.permission === "granted") {
      new Notification("A little ping from your love", { body: "I miss you ♡" });
    }
  });
  if (!button) return;
  button.addEventListener("click", async () => {
    sessionStorage.setItem("ping-id", crypto.randomUUID());
    try {
      await setDoc(ping, { sender: sessionStorage.getItem("ping-id"), sentAt: serverTimestamp() });
      status.textContent = "Sent with love.";
    } catch {
      status.textContent = "The ping could not be sent.";
    }
  });
});
