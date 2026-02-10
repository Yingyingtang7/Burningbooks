// ===============================
// 1. TEXT SOURCES (F451 + Borges)
// ===============================

// NOTE: Replace the placeholder lines with your real text locally.
// Do NOT include long copyrighted text here in ChatGPT.
const SOURCE_TEXT = `
FAHRENHEIT 451 by Ray Bradbury FAHRENHEIT 451 The temperature at which book-paper catches fire and burns PART I IT WAS A PLEASURE TO BURN IT was a special pleasure to see things eaten, to see things blackened and changed. With the brass nozzle in his fists, with this great python spitting its venomous kerosene upon the world,the blood pounded in his head, and his hands were the hands of some amazing conductor playing all the symphonies of blazing and burning to bring down the tatters and charcoal ruins of history. With his symbolic helmet numbered 451 on his stolid head, and his eyes all orange flame with the thought of what came next, he flicked the igniter and the house jumped up in a gorging fire that burned the evening sky red and yellow and black. He strode in a swarm of fireflies. He wanted above all, like the old joke, to shove a marshmallow on a stick in the furnace, while the flapping pigeon-winged books died on the porch and lawn of the house. While the books went up in sparkling whirls and blew away on a wind turned dark with burning. 

`;

// Borges text for the ending.
// Replace this block with your actual lines if you want.
const BORGES_TEXT = `
The faithless say that if it were to burn,
History would burn with it. They are wrong.
Unceasing human work gave birth to this
Infinity of books. If of them all
Not even one remained, man would again
Beget each page and every line,
Each work and every love of Hercules,
And every teaching of every manuscript.
`;
const BORGES_SIGNATURE = "— Jorge Luis Borges";

// ===============================
// 2. DOM ELEMENTS
// ===============================

const textBlock = document.getElementById("textBlock");
const overlay = document.getElementById("overlay");
const startButton = document.getElementById("startButton");
const ending = document.getElementById("ending");
const restartButton = document.getElementById("restartButton");
const borgesTextEl = document.getElementById("borgesText");
const signatureTextEl = document.getElementById("signatureText");
const heatLayer = document.getElementById("heatLayer");

const fireSound = document.getElementById("fireSound");
const typeSound = document.getElementById("typeSound");

// ===============================
// 3. STATE
// ===============================

let totalLetters = 0;
let burnedLetters = 0;
let burningActive = false;
let endingShown = false;

// burning cursor state
document.body.classList.remove("burning-active");

// ===============================
// 4. RENDER SOURCE TEXT AS LETTER SPANS
// ===============================

function renderSourceText() {
  textBlock.innerHTML = "";
  totalLetters = 0;
  burnedLetters = 0;
  endingShown = false;

  for (let char of SOURCE_TEXT) {
    if (char === " " || char === "\n" || char === "\t") {
      const span = document.createElement("span");
      span.textContent = char;
      span.classList.add("whitespace");
      textBlock.appendChild(span);
    } else {
      const span = document.createElement("span");
      span.textContent = char;
      span.classList.add("letter");
      textBlock.appendChild(span);
      totalLetters++;
    }
  }
}

// ===============================
// 5. BURNING LOGIC
// ===============================

function handleBurnAtPoint(x, y) {
  if (!burningActive || endingShown) return;

  const radius = 30; // pixels around the mouse
  const letters = document.querySelectorAll(".letter:not(.burned)");

  letters.forEach(letter => {
    const rect = letter.getBoundingClientRect();
    const letterX = rect.left + rect.width / 2;
    const letterY = rect.top + rect.height / 2;

    const dx = letterX - x;
    const dy = letterY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < radius) {
      if (!letter.classList.contains("burning")) {
        letter.classList.add("burning");

        // After a short delay, fully burn it
        setTimeout(() => {
          if (!letter.classList.contains("burned")) {
            letter.classList.add("burned");
            burnedLetters++;
            checkBurnProgress();
          }
        }, 200 + Math.random() * 500);
      }
    }
  });
}

function checkBurnProgress() {
  const ratio = burnedLetters / totalLetters;

  if (!endingShown && ratio > 0.7) {
    triggerEnding();
  }
}

// ===============================
// 6. ENDING: SHOW BORGES TEXT WITH TYPING EFFECT
// ===============================

function triggerEnding() {
  endingShown = true;

  // Fade out the main text block
  textBlock.style.transition = "opacity 1.2s ease-out";
  textBlock.style.opacity = "0";

  // Fade out fire sound
  fadeOutAudio(fireSound, 1200);

  if (heatLayer) {
    heatLayer.classList.remove("heat-visible");
    heatLayer.classList.add("heat-hidden");
  }
  document.body.classList.remove("burning-active");
  restartButton.classList.add("hidden");

  setTimeout(() => {
    ending.classList.remove("hidden");
    ending.classList.add("visible");
    signatureTextEl.textContent = "";

    // Extra safety: ensure fire audio is fully stopped before typing starts
    if (fireSound) {
      fireSound.pause();
      fireSound.currentTime = 0;
      fireSound.volume = 1;
    }

    // Start typing Borges text
    typeText(BORGES_TEXT.trim(), borgesTextEl, () => {
      typeText(BORGES_SIGNATURE, signatureTextEl, () => {
        stopTypingSound();
        const restartButton = document.getElementById("restartButton");
        restartButton.classList.remove("hidden");
      });
    });
  }, 1300);
}

// Simple typing effect
function typeText(fullText, targetEl, callback) {
  targetEl.textContent = "";
  let index = 0;

  function step() {
    if (index < fullText.length) {
      const char = fullText[index];
      targetEl.textContent += char;
      index++;

      // Play type sound for visible characters
      if (char !== "\n" && char !== " ") {
        playTypeSound();
      }

      setTimeout(step, 45); // typing speed
    } else if (typeof callback === "function") {
      callback();
    }
  }

  step();
}

// Play typewriter sound briefly
function playTypeSound() {
  if (!typeSound) return;
  if (!typeSound.paused) return;
  try {
    typeSound.currentTime = 0;
    typeSound.play().catch(() => {
      // Ignore autoplay issues
    });
  } catch (e) {
    // Ignore autoplay issues
  }
}

function stopTypingSound() {
  if (!typeSound) return;
  typeSound.pause();
  typeSound.currentTime = 0;
}

// Fade out any audio element over a duration in ms
function fadeOutAudio(audio, duration) {
  if (!audio) return;
  const steps = 15;
  const stepTime = duration / steps;
  const volumeStep = audio.volume / steps;

  let currentStep = 0;

  const fadeInterval = setInterval(() => {
    currentStep++;
    audio.volume = Math.max(0, audio.volume - volumeStep);

    if (currentStep >= steps) {
      clearInterval(fadeInterval);
      audio.pause();
      audio.volume = 1; // reset for next time
    }
  }, stepTime);
}

// ===============================
// 7. EVENT HANDLERS: START / RESTART
// ===============================

startButton.addEventListener("click", () => {
  overlay.style.display = "none";
  burningActive = true;

  if (heatLayer) {
    heatLayer.classList.remove("heat-hidden");
    heatLayer.classList.add("heat-visible");
  }

  // Ensure typing sound is off before burn phase starts
  stopTypingSound();

  // Prime typing sound under user gesture (helps Safari/iOS autoplay policy).
  if (typeSound) {
    const wasMuted = typeSound.muted;
    typeSound.muted = true;
    typeSound.play().then(() => {
      typeSound.pause();
      typeSound.currentTime = 0;
      typeSound.muted = wasMuted;
    }).catch(() => {
      typeSound.muted = wasMuted;
    });
  }

  // Start fire sound when burning begins
  if (fireSound) {
    fireSound.pause();
    fireSound.currentTime = 0;
    fireSound.volume = 0.7;
    fireSound.play().catch(() => {
      // Autoplay may be blocked; that's fine
    });
  }

  document.body.classList.add("burning-active");
});

restartButton.addEventListener("click", () => {
  // Stop and reset both sounds
  if (fireSound) {
    fireSound.pause();
    fireSound.currentTime = 0;
    fireSound.volume = 1;
  }
  if (typeSound) {
    typeSound.pause();
    typeSound.currentTime = 0;
  }

  // Reset state and UI
  ending.classList.remove("visible");
  burningActive = false;
  restartButton.classList.add("hidden");
  document.body.classList.remove("burning-active");
  if (heatLayer) {
    heatLayer.classList.remove("heat-visible");
    heatLayer.classList.add("heat-hidden");
  }

  setTimeout(() => {
    ending.classList.add("hidden");
    textBlock.style.opacity = "1";
    borgesTextEl.textContent = "";
    signatureTextEl.textContent = "";
    renderSourceText();
    overlay.style.display = "flex";
  }, 800);
});

document.addEventListener("mousemove", (e) => {
  handleBurnAtPoint(e.clientX, e.clientY);
});

document.addEventListener("touchstart", (e) => {
  if (!burningActive || endingShown) return;
  const touch = e.touches[0];
  if (!touch) return;
  e.preventDefault();
  handleBurnAtPoint(touch.clientX, touch.clientY);
}, { passive: false });

document.addEventListener("touchmove", (e) => {
  if (!burningActive || endingShown) return;
  const touch = e.touches[0];
  if (!touch) return;
  e.preventDefault();
  handleBurnAtPoint(touch.clientX, touch.clientY);
}, { passive: false });

// ===============================
// 8. INITIALIZE
// ===============================

renderSourceText();
