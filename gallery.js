import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const config = { apiKey:"AIzaSyD_l5r2S8Z_9CC64cviB72MYhh2BX1Q97Y", authDomain:"burgerpops-121224.firebaseapp.com", projectId:"burgerpops-121224", storageBucket:"burgerpops-121224.appspot.com", messagingSenderId:"1204666668", appId:"1:1204666668:web:37ac2f645f411702aa6c89" };
document.querySelector(".intro h1").innerHTML = "Our <em>moments</em>, in frames.";
const headingStyle = document.createElement("style");
headingStyle.textContent = ".intro{width:100%;margin-inline:auto!important;text-align:center!important}.intro h1,.intro>p:last-child{margin-left:auto!important;margin-right:auto!important;text-align:center!important}";
document.head.append(headingStyle);

const app = getApps().length ? getApp() : initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);
const gallery = document.getElementById("gallery");
const input = document.getElementById("photo-input");
const status = document.getElementById("status");
const counter = document.getElementById("counter");
const photos = collection(db, "ourSpace", "gallery", "photos");
const removeButton = document.createElement("button");
removeButton.type = "button";
removeButton.className = "gallery-delete";
removeButton.textContent = "Delete photo";
removeButton.setAttribute("aria-label", "Delete the photo currently in view");
document.querySelector(".controls").after(removeButton);
let memories = [];
let active = 0;
let startX = 0;

function position(index) {
  const total = memories.length;
  let offset = index - active;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

function render() {
  gallery.replaceChildren();
  removeButton.disabled = !memories.length;
  if (!memories.length) {
    gallery.innerHTML = '<div class="empty">No memories here yet. Add the first one.</div>';
    counter.textContent = "—";
    return;
  }
  counter.textContent = `${active + 1} / ${memories.length}`;
  memories.forEach((memory, index) => {
    const offset = position(index);
    const slide = document.createElement("figure");
    const image = document.createElement("img");
    slide.className = `slide${Math.abs(offset) > 2 ? " is-hidden" : ""}`;
    image.src = memory.image;
    image.alt = "A private shared memory";
    slide.append(image);
    slide.style.zIndex = String(20 - Math.abs(offset));
    slide.style.opacity = Math.abs(offset) > 2 ? "0" : String(offset === 0 ? "1" : ".62");
    slide.style.filter = offset === 0 ? "none" : "saturate(.75) brightness(.86)";
    slide.style.transform = `translate(-50%,-50%) translateX(${offset * 62}%) translateZ(${Math.abs(offset) * -130}px) rotateY(${offset * -25}deg) scale(${offset === 0 ? 1 : .78})`;
    slide.addEventListener("click", () => { active = index; render(); });
    gallery.append(slide);
  });
}

function move(step) {
  if (!memories.length) return;
  active = (active + step + memories.length) % memories.length;
  render();
}

document.getElementById("previous").addEventListener("click", () => move(-1));
document.getElementById("next").addEventListener("click", () => move(1));
gallery.addEventListener("pointerdown", event => { startX = event.clientX; });
gallery.addEventListener("pointerup", event => {
  const delta = event.clientX - startX;
  if (Math.abs(delta) > 35) move(delta < 0 ? 1 : -1);
});
removeButton.addEventListener("click", async () => {
  const memory = memories[active];
  if (!memory || !confirm("Delete this photo permanently?")) return;
  removeButton.disabled = true;
  try {
    await deleteDoc(doc(photos, memory.id));
    status.textContent = "Photo deleted.";
  } catch {
    status.textContent = "That photo could not be deleted. Please try again.";
    removeButton.disabled = false;
  }
});

function compress(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const ratio = Math.min(1, 1000 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * ratio);
        canvas.height = Math.round(image.height * ratio);
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", .72));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

onAuthStateChanged(auth, user => {
  if (!user) return;
  onSnapshot(query(photos, orderBy("createdAt", "desc")), snapshot => {
    memories = snapshot.docs.map(entry => ({ id: entry.id, ...entry.data() }));
    active = Math.min(active, Math.max(0, memories.length - 1));
    render();
  }, () => { status.textContent = "Gallery could not load right now."; });
});

input.addEventListener("change", async () => {
  const files = [...input.files].slice(0, 6);
  if (!files.length) return;
  status.textContent = "Preparing your memories…";
  try {
    for (const file of files) {
      const image = await compress(file);
      if (image.length > 850000) throw new Error();
      await addDoc(photos, { image, createdAt: serverTimestamp() });
    }
    status.textContent = "Added with love.";
  } catch {
    status.textContent = "One photo was too large to save. Try a smaller image.";
  }
  input.value = "";
});
