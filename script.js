// Intro typing content
const introLines = [
  { element: document.getElementById("line1"), text: "Some mentors teach..." },
  { element: document.getElementById("line2"), text: "Some mentors guide..." },
  { element: document.getElementById("line3"), text: "But few mentors change lives..." }
];

const finalReveal = document.getElementById("finalReveal");
const openMessageBtn = document.getElementById("openMessageBtn");
const flipScene = document.getElementById("flipScene");
const musicToggle = document.getElementById("musicToggle");
const musicLabel = document.getElementById("musicLabel");
const musicIcon = document.getElementById("musicIcon");
const bgMusic = document.getElementById("bgMusic");
const tapHint = document.getElementById("tapHint");

let musicPlaying = false;
let fadeInterval;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function typeLine(target, text, speed = 65) {
  target.classList.add("active");

  for (let index = 0; index < text.length; index += 1) {
    target.textContent += text[index];
    await wait(speed);
  }

  target.classList.remove("active");
}

async function runIntroSequence() {
  for (const line of introLines) {
    await typeLine(line.element, line.text);
    await wait(520);
  }

  await wait(900);
  finalReveal.classList.add("visible");
  await wait(2100);
  document.body.classList.add("intro-complete");
}

// Lightweight particle network for the premium background atmosphere
function createParticles() {
  const canvas = document.getElementById("particle-canvas");
  const ctx = canvas.getContext("2d");
  let width = window.innerWidth;
  let height = window.innerHeight;
  let particles = [];
  let cursor = { x: width / 2, y: height / 2, active: false };
  let particleCount = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (prefersReducedMotion.matches) {
      particleCount = 20;
    } else if (width < 768) {
      particleCount = 28;
    } else if (width < 1024) {
      particleCount = 44;
    } else {
      particleCount = 68;
    }

    particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * (width < 768 ? 0.16 : 0.28),
      vy: (Math.random() - 0.5) * (width < 768 ? 0.16 : 0.28),
      size: Math.random() * 1.8 + 0.6
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > width) {
        particle.vx *= -1;
      }

      if (particle.y < 0 || particle.y > height) {
        particle.vy *= -1;
      }

      ctx.beginPath();
      ctx.fillStyle = "rgba(225, 187, 98, 0.72)";
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      for (let next = index + 1; next < particles.length; next += 1) {
        const sibling = particles[next];
        const dx = particle.x - sibling.x;
        const dy = particle.y - sibling.y;
        const distance = Math.hypot(dx, dy);

        const linkDistance = width < 768 ? 78 : 130;

        if (distance < linkDistance) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(112, 184, 255, ${0.1 - distance / (width < 768 ? 1000 : 1500)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(sibling.x, sibling.y);
          ctx.stroke();
        }
      }

      if (cursor.active) {
        const dx = particle.x - cursor.x;
        const dy = particle.y - cursor.y;
        const distance = Math.hypot(dx, dy);

        if (distance < (width < 768 ? 90 : 150)) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(225, 187, 98, ${0.22 - distance / (width < 768 ? 520 : 700)})`;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(cursor.x, cursor.y);
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    cursor = { x: event.clientX, y: event.clientY, active: true };
  });
  window.addEventListener("pointerleave", () => {
    cursor.active = false;
  });

  resize();
  draw();
}

// Cursor sparkles for the subtle wow effect
function enableCursorSparkles() {
  if (prefersReducedMotion.matches || !canHover.matches) {
    return;
  }

  let lastSparkleTime = 0;

  window.addEventListener("pointermove", (event) => {
    const now = performance.now();

    if (now - lastSparkleTime < 24) {
      return;
    }

    lastSparkleTime = now;
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.style.left = `${event.clientX - 5}px`;
    sparkle.style.top = `${event.clientY - 5}px`;
    document.body.appendChild(sparkle);

    window.setTimeout(() => sparkle.remove(), 900);
  });
}

// Scroll reveal and parallax motion
function enableScrollEffects() {
  const revealItems = document.querySelectorAll(".reveal");
  const parallaxItems = document.querySelectorAll("[data-parallax]");
  const allowParallax = () => !prefersReducedMotion.matches && window.innerWidth >= 768;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => observer.observe(item));

  function updateParallax() {
    if (!allowParallax()) {
      parallaxItems.forEach((item) => {
        item.style.setProperty("--parallax-y", "0px");
      });
      return;
    }

    const scrollY = window.scrollY;

    parallaxItems.forEach((item) => {
      const factor = Number(item.dataset.parallax || 0);
      item.style.setProperty("--parallax-y", `${scrollY * factor}px`);
    });
  }

  updateParallax();
  window.addEventListener("scroll", updateParallax, { passive: true });
}

function showTapHint() {
  tapHint.classList.add("visible");
  tapHint.classList.remove("hidden");
}

function hideTapHint() {
  tapHint.classList.remove("visible");
  tapHint.classList.add("hidden");
}

function updateMusicUi(isPlaying) {
  musicPlaying = isPlaying;
  musicToggle.classList.toggle("awaiting-play", !isPlaying);
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
  musicIcon.textContent = isPlaying ? "🔊" : "▶";
  musicLabel.textContent = isPlaying ? "Music On" : "Music Off";
}

function fadeInAudio(targetVolume = 0.25, duration = 2000) {
  clearInterval(fadeInterval);
  bgMusic.volume = 0;

  const interval = 100;
  const step = targetVolume / (duration / interval);

  fadeInterval = window.setInterval(() => {
    const nextVolume = Math.min(targetVolume, bgMusic.volume + step);
    bgMusic.volume = nextVolume;

    if (nextVolume >= targetVolume) {
      clearInterval(fadeInterval);
    }
  }, interval);
}

async function startMusic() {
  try {
    await bgMusic.play();
    fadeInAudio();
    updateMusicUi(true);
    hideTapHint();
  } catch (error) {
    updateMusicUi(false);
    showTapHint();
  }
}

function stopMusic() {
  clearInterval(fadeInterval);
  bgMusic.pause();
  updateMusicUi(false);
}

function setupMusicControls() {
  bgMusic.volume = 0.25;
  updateMusicUi(false);
  startMusic();

  musicToggle.addEventListener("click", async () => {
    if (!musicPlaying) {
      await startMusic();
      return;
    }

    stopMusic();
  });

  const unlockOnInteraction = async () => {
    if (!musicPlaying) {
      await startMusic();
    }
  };

  document.addEventListener("pointerdown", unlockOnInteraction, { once: true });
  document.addEventListener("keydown", unlockOnInteraction, { once: true });
}

function setupMessageCard() {
  openMessageBtn.addEventListener("click", () => {
    flipScene.classList.toggle("flipped");
    openMessageBtn.textContent = flipScene.classList.contains("flipped")
      ? "Close Message"
      : "Open Message";
  });
}

window.addEventListener("load", () => {
  runIntroSequence();
  createParticles();
  enableCursorSparkles();
  enableScrollEffects();
  setupMessageCard();
  setupMusicControls();
});
