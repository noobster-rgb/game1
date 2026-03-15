/**
 * Fun feedback system for the kid-friendly editor.
 * Provides particle celebrations, sounds, and toast notifications.
 */

// ===== Sound effects using Web Audio API =====

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(freq, duration, volume, type = 'triangle', freqEnd) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);
  }
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

/** Short click sound for step transitions */
export function playClickSound() {
  playTone(800, 0.05, 0.15, 'triangle');
}

/** Rising arpeggio for celebration */
export function playCelebrationSound() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  const notes = [523, 659, 784]; // C5, E5, G5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t + i * 0.12);
    gain.gain.linearRampToValueAtTime(0.2, t + i * 0.12 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t + i * 0.12);
    osc.stop(t + i * 0.12 + 0.3);
  });

  // Cymbal shimmer
  const bufSize = ctx.sampleRate * 0.4;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 8000;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, t + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(t + 0.3);
}

/** Error buzz sound */
export function playErrorSound() {
  playTone(200, 0.15, 0.1, 'square', 150);
}

// ===== Particle celebration =====

let particleCanvas = null;
let particleCtx = null;
let particles = [];
let particleRafId = null;

function ensureParticleCanvas() {
  if (particleCanvas) return;
  particleCanvas = document.createElement('canvas');
  particleCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:701;pointer-events:none;';
  particleCanvas.width = window.innerWidth;
  particleCanvas.height = window.innerHeight;
  particleCtx = particleCanvas.getContext('2d');
}

function createParticle(x, y) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 3 + Math.random() * 6;
  const colors = ['#ff6666', '#66cc66', '#6688ff', '#ffd700', '#ff66cc', '#66ddff'];
  return {
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 4,
    life: 1,
    decay: 0.012 + Math.random() * 0.008,
    size: 4 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    star: Math.random() > 0.5,
  };
}

function drawStar(ctx, x, y, size) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const method = i === 0 ? 'moveTo' : 'lineTo';
    ctx[method](x + Math.cos(angle) * size, y + Math.sin(angle) * size);
  }
  ctx.closePath();
  ctx.fill();
}

function animateParticles() {
  particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15; // gravity
    p.life -= p.decay;

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    particleCtx.globalAlpha = p.life;
    particleCtx.fillStyle = p.color;

    if (p.star) {
      drawStar(particleCtx, p.x, p.y, p.size);
    } else {
      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      particleCtx.fill();
    }
  }

  particleCtx.globalAlpha = 1;

  if (particles.length > 0) {
    particleRafId = requestAnimationFrame(animateParticles);
  } else {
    cleanupParticles();
  }
}

function cleanupParticles() {
  if (particleRafId) {
    cancelAnimationFrame(particleRafId);
    particleRafId = null;
  }
  if (particleCanvas && particleCanvas.parentNode) {
    particleCanvas.parentNode.removeChild(particleCanvas);
  }
  particleCanvas = null;
  particleCtx = null;
}

/**
 * Burst particles from screen center.
 * @param {number} [count=40]
 */
export function burstParticles(count = 40) {
  ensureParticleCanvas();
  document.body.appendChild(particleCanvas);

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  for (let i = 0; i < count; i++) {
    particles.push(createParticle(cx, cy));
  }

  if (!particleRafId) {
    particleRafId = requestAnimationFrame(animateParticles);
  }
}

/**
 * Small sparkle burst at a specific position (for color changes etc.)
 */
export function sparkleAt(x, y, count = 8) {
  ensureParticleCanvas();
  if (!particleCanvas.parentNode) document.body.appendChild(particleCanvas);

  for (let i = 0; i < count; i++) {
    particles.push(createParticle(x, y));
  }

  if (!particleRafId) {
    particleRafId = requestAnimationFrame(animateParticles);
  }
}

// ===== Toast notifications =====

/**
 * Show a large celebratory toast.
 * @param {string} message
 * @param {string} [icon='']
 * @param {number} [duration=3000]
 */
export function showKidToast(message, icon = '', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'kid-toast';
  toast.innerHTML = icon ? `<span style="font-size:28px">${icon}</span> ${message}` : message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Full celebration sequence: particles + sound + toast.
 */
export function celebrate(itemName, icon) {
  playCelebrationSound();
  burstParticles(45);
  showKidToast(`You created ${itemName}!`, icon);
}
