import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const config = { apiKey:"AIzaSyD_l5r2S8Z_9CC64cviB72MYhh2BX1Q97Y", authDomain:"burgerpops-121224.firebaseapp.com", projectId:"burgerpops-121224", storageBucket:"burgerpops-121224.appspot.com", messagingSenderId:"1204666668", appId:"1:1204666668:web:37ac2f645f411702aa6c89" };
const app = getApps().length ? getApp() : initializeApp(config);
const db = getFirestore(app);
const form = document.getElementById("bucket-form");
const text = document.getElementById("bucket-text");
const list = document.getElementById("list");
const status = document.getElementById("status");
const bucketCollection = collection(db, "ourSpace", "bucketList", "items");

function render(items) {
  list.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Nothing here yet. Add your first someday.";
    list.append(empty);
    return;
  }
  items.forEach(entry => {
    const item = entry.data();
    const row = document.createElement("div");
    row.className = `item${item.done ? " done" : ""}`;
    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = Boolean(item.done);
    check.setAttribute("aria-label", `Mark ${item.text || "item"} as done`);
    check.addEventListener("change", async () => {
      check.disabled = true;
      try { await updateDoc(doc(bucketCollection, entry.id), { done: check.checked }); }
      catch { status.textContent = "That change could not be saved."; check.checked = !check.checked; }
      finally { check.disabled = false; }
    });
    const label = document.createElement("span");
    label.textContent = item.text || "";
    const remove = document.createElement("button");
    remove.className = "bucket-delete";
    remove.type = "button";
    remove.textContent = "Delete";
    remove.addEventListener("click", async () => {
      if (!confirm("Delete this bucket-list item?")) return;
      remove.disabled = true;
      try { await deleteDoc(doc(bucketCollection, entry.id)); }
      catch { status.textContent = "That item could not be deleted. Please try again."; remove.disabled = false; }
    });
    row.append(check, label, remove);
    list.append(row);
  });
}

onAuthStateChanged(getAuth(app), user => {
  if (!user) return;
  onSnapshot(query(bucketCollection, orderBy("createdAt", "asc")), snapshot => {
    render(snapshot.docs);
  }, () => { list.innerHTML = '<div class="empty">The bucket list could not load right now.</div>'; });
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  const value = text.value.trim();
  if (!value) return;
  status.textContent = "Adding it…";
  try {
    await addDoc(bucketCollection, { text: value.slice(0, 240), done: false, createdAt: serverTimestamp() });
    text.value = "";
    status.textContent = "Added to your someday list.";
  } catch {
    status.textContent = "That dream could not be added. Please try again.";
  }
});
