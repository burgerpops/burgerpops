import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const config = { apiKey:"AIzaSyD_l5r2S8Z_9CC64cviB72MYhh2BX1Q97Y", authDomain:"burgerpops-121224.firebaseapp.com", projectId:"burgerpops-121224", storageBucket:"burgerpops-121224.appspot.com", messagingSenderId:"1204666668", appId:"1:1204666668:web:37ac2f645f411702aa6c89" };
const app = getApps().length ? getApp() : initializeApp(config);
const db = getFirestore(app);
const form = document.getElementById("note-form");
const text = document.getElementById("note-text");
const notes = document.getElementById("notes");
const status = document.getElementById("status");
const noteCollection = collection(db, "ourSpace", "stickyNotes", "items");

function render(items) {
  notes.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No sticky notes yet. Leave the first little one.";
    notes.append(empty);
    return;
  }
  items.forEach((entry, index) => {
    const item = entry.data();
    const card = document.createElement("article");
    card.className = "note";
    card.style.setProperty("--tilt", `${[-1.2, .8, -.5, 1][index % 4]}deg`);
    const message = document.createElement("p");
    message.textContent = item.text || "";
    const date = document.createElement("small");
    date.textContent = item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString(undefined, { month:"short", day:"numeric" }) : "just now";
    const remove = document.createElement("button");
    remove.className = "delete-note";
    remove.type = "button";
    remove.setAttribute("aria-label", "Delete this sticky note");
    remove.textContent = "×";
    remove.addEventListener("click", async () => {
      if (!confirm("Delete this sticky note?")) return;
      remove.disabled = true;
      try {
        await deleteDoc(doc(noteCollection, entry.id));
      } catch {
        status.textContent = "That note could not be deleted. Please try again.";
        remove.disabled = false;
      }
    });
    card.append(message, date, remove);
    notes.append(card);
  });
}

onAuthStateChanged(getAuth(app), user => {
  if (!user) return;
  onSnapshot(query(noteCollection, orderBy("createdAt", "desc")), snapshot => {
    render(snapshot.docs);
  }, () => {
    notes.innerHTML = '<div class="empty">The notes could not load right now.</div>';
  });
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  const value = text.value.trim();
  if (!value) return;
  status.textContent = "Pinning it…";
  try {
    await addDoc(noteCollection, { text: value.slice(0, 240), createdAt: serverTimestamp() });
    text.value = "";
    status.textContent = "Pinned with love.";
  } catch {
    status.textContent = "That note could not be pinned. Please try again.";
  }
});
