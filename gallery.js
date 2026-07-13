import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const collageStyle = document.createElement("style");
collageStyle.textContent = `
  .wall{display:block!important;column-count:4!important;column-gap:12px!important}
  .photo,.photo.hero,.photo:nth-child(n){display:inline-block!important;width:100%!important;height:auto!important;min-height:0!important;margin:0 0 12px!important;border-radius:15px!important;break-inside:avoid!important;overflow:hidden!important}
  .photo img{display:block!important;width:100%!important;height:auto!important;object-fit:initial!important}
  @media(max-width:900px){.wall{column-count:3!important}}
  @media(max-width:700px){.wall{column-count:2!important;column-gap:9px!important}.photo,.photo.hero,.photo:nth-child(n){margin-bottom:9px!important;border-radius:12px!important}}
`;
document.head.append(collageStyle);

const config = { apiKey: "AIzaSyD_l5r2S8Z_9CC64cviB72MYhh2BX1Q97Y", authDomain: "burgerpops-121224.firebaseapp.com", projectId: "burgerpops-121224", storageBucket: "burgerpops-121224.appspot.com", messagingSenderId: "1204666668", appId: "1:1204666668:web:37ac2f645f411702aa6c89" };
const app = getApps().length ? getApp() : initializeApp(config);
const auth = getAuth(app), db = getFirestore(app);
const input = document.getElementById("photo-input"), gallery = document.getElementById("gallery"), status = document.getElementById("status"), lightbox = document.getElementById("lightbox"), lightboxImage = lightbox.querySelector("img");
const photos = collection(db, "ourSpace", "gallery", "photos");

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
        canvas.width = Math.round(image.width * ratio); canvas.height = Math.round(image.height * ratio);
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function render(items) {
  gallery.replaceChildren();
  if (!items.length) { gallery.innerHTML = '<div class="empty">No memories here yet. Add the first one.</div>'; return; }
  items.forEach(item => { const figure = document.createElement("figure"); figure.className = "photo"; const image = document.createElement("img"); image.src = item.image; image.alt = "A private shared memory"; figure.append(image); figure.addEventListener("click", () => { lightboxImage.src = item.image; lightbox.showModal(); }); gallery.append(figure); });
}

onAuthStateChanged(auth, user => {
  if (!user) return;
  onSnapshot(query(photos, orderBy("createdAt", "desc")), snapshot => render(snapshot.docs.map(item => item.data())), () => status.textContent = "Gallery could not load right now.");
});

lightbox.querySelector(".close").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", event => { if (event.target === lightbox) lightbox.close(); });

input.addEventListener("change", async () => {
  const files = [...input.files].slice(0, 6);
  if (!files.length) return;
  status.textContent = "Preparing your memories…";
  try {
    for (const file of files) {
      const image = await compress(file);
      if (image.length > 850000) throw new Error("Photo is too detailed");
      await addDoc(photos, { image, createdAt: serverTimestamp() });
    }
    status.textContent = "Added with love.";
  } catch { status.textContent = "One photo was too large to save. Try a smaller image."; }
  input.value = "";
});
