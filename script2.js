const musicToggleBtn = document.getElementById('music-toggle-btn');
const music = document.getElementById('bg-music');

musicToggleBtn.addEventListener('click', () => {
  if (music.paused) {
    music.play();
    musicToggleBtn.textContent = '🔇 Mute';
  } else {
    music.pause();
    musicToggleBtn.textContent = '🔊 Unmute';
  }
});

window.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', () => {
    const button = document.getElementById('music-toggle-btn');
    if (button) {
      button.style.display = 'block';
    }
  }, { once: true }); // 'once' ensures it only runs the first time
});

async function sha256(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input.trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function checkSecret() {
  const input = document.getElementById("secretInput").value;
  const hash = await sha256(input);
  const expected = "3c3ee49961a0fdb9ee1d8dc8d07c8f4991d1f141e392845fe72637db99c5ed2d"; // hash of orangesinlove

  if (hash === expected) {
    localStorage.setItem("accessGranted", "true");
    window.location.href = "gallery.html";
  } else {
    document.getElementById("errorMessage").style.display = "block";
  }
}

// SVG icons as strings
const icons = {
  heart: `<svg viewBox="0 0 24 24" fill="#D16F6F" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 
          4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 
          16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 
          11.54L12 21.35z"/>
      </svg>`,

  orange: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="40" height="40" aria-label="Orange slice" role="img">
  <!-- Orange circle base -->
  <circle cx="32" cy="32" r="30" fill="#FFA500" stroke="#FF8C00" stroke-width="3"/>
  
  <!-- Segment lines -->
  <g stroke="#FFB733" stroke-width="2">
    <line x1="32" y1="2" x2="32" y2="62"/>
    <line x1="12" y1="10" x2="52" y2="54"/>
    <line x1="12" y1="54" x2="52" y2="10"/>
    <line x1="4" y1="32" x2="60" y2="32"/>
  </g>
  
  <!-- Inner highlights -->
  <circle cx="32" cy="32" r="22" fill="url(#orangeGradient)" />
  
  <defs>
    <radialGradient id="orangeGradient" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#FFF3E0" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#FFA500" stop-opacity="0" />
    </radialGradient>
  </defs>
</svg>
`,



  lollipop: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="40" height="40" aria-label="Lollipop" role="img">
  <!-- Stick -->
  <rect x="30" y="28" width="4" height="26" rx="2" fill="#AD1457" />
  <rect x="31.5" y="28" width="1" height="26" rx="1" fill="#7B0F39" />
  
  <!-- Candy circle -->
  <circle cx="32" cy="20" r="14" fill="#F48FB1" stroke="#AD1457" stroke-width="3"/>
  
  <!-- Swirl pattern -->
  <path d="
    M 32 6
    A 14 14 0 1 1 31.9 34
    M 32 10
    A 10 10 0 1 0 31.9 30
    M 32 14
    A 6 6 0 1 1 31.9 26
  " stroke="#E91E63" stroke-width="2" fill="none" />
</svg>
`
};

// Generate floating icons on screen
const container = document.getElementById("floating-icons-container");
const totalIcons = 20; // how many floating icons

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

for (let i = 0; i < totalIcons; i++) {
  const iconTypes = Object.keys(icons);
  const iconType = iconTypes[Math.floor(Math.random() * iconTypes.length)];
  const div = document.createElement("div");
  div.className = "floating-icon";
  div.style.left = `${randomRange(0, 95)}vw`;
  div.style.animationDuration = `${randomRange(10, 20)}s`;
  div.style.animationDelay = `${randomRange(0, 20)}s`;
  div.innerHTML = icons[iconType];
  container.appendChild(div);
}

const heartContainer = document.getElementById('heart-explosion-container');

document.addEventListener('click', (e) => {
  for (let i = 0; i < 10; i++) {
    const heart = document.createElement('div');
    heart.classList.add('explosion-heart');
    heart.style.left = e.clientX + 'px';
    heart.style.top = e.clientY + 'px';

    const angle = Math.random() * 2 * Math.PI;
    const radius = 60 + Math.random() * 40;
    const x = Math.cos(angle) * radius + 'px';
    const y = Math.sin(angle) * radius + 'px';

    heart.style.setProperty('--x', x);
    heart.style.setProperty('--y', y);

    heartContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
  }
});


function playMusic() {
  const music = document.getElementById('bg-music');
  music.play().then(() => {
    console.log("Music started.");
  }).catch(err => {
    console.log("Music autoplay blocked:", err);
  });

  // Remove this listener after first interaction
  document.removeEventListener('click', playMusic);
}

// Start music on first click anywhere on the page
document.addEventListener('click', playMusic);


function updateLoveTimer() {
  const startDate = new Date("2024-12-12T12:00:00");
  const now = new Date();
  const diff = now - startDate;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById("timer-count").textContent =
    `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(updateLoveTimer, 1000);
updateLoveTimer(); // call once on load

// Floating romantic words
const words = ["Bloody Burger!", "12/12/2024", "Forever", "Mmwahh!", "Nte Chakkuuu", "Rain", "18/01/2025"];
const wordCount = 12; // how many total floating words

for (let i = 0; i < wordCount; i++) {
  const word = document.createElement("div");
  word.className = "floating-word";
  word.textContent = words[i % words.length];
  word.style.left = `${Math.random() * 90}vw`;
  word.style.animationDuration = `${10 + Math.random() * 10}s`;
  word.style.animationDelay = `${Math.random() * 15}s`;
  container.appendChild(word);
}

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('accessGranted');
  // Redirect to login or homepage (adjust as needed)
  window.location.href = 'index.html';
});

const pressHeart = document.getElementById('press-hold-heart');
let pressTimer = null;

function startPress() {
  if (pressTimer === null) {
    pressTimer = setTimeout(() => {
      triggerHeartRain(); // call your existing function to create falling hearts
    }, 800); // hold time (ms)
  }
}

function cancelPress() {
  if (pressTimer !== null) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
}

// Desktop events
pressHeart.addEventListener('mousedown', startPress);
pressHeart.addEventListener('mouseup', cancelPress);
pressHeart.addEventListener('mouseleave', cancelPress);

// Mobile / touch events
pressHeart.addEventListener('touchstart', (e) => {
  e.preventDefault(); // Prevents scrolling or zooming
  startPress();
}, { passive: false });

pressHeart.addEventListener('touchend', cancelPress);
pressHeart.addEventListener('touchcancel', cancelPress);


function triggerHeartRain() {
  for (let i = 0; i < 20; i++) {
    const heart = document.createElement('div');
    heart.classList.add('heart-rain');
    heart.textContent = '🍔';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.fontSize = `${Math.random() * 1.5 + 1}rem`;
    document.body.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 3000); // Match animation duration
  }
}


document.getElementById('guestbook-btn').addEventListener('click', () => {
  window.location.href = 'guestbook.html';
});
