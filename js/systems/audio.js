// Procedural sound effects using Web Audio API
let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// Ensure audio context is resumed on first user interaction
function ensureResumed() {
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

function playNoise(ctx, duration, volume, filterFreq, filterType = 'lowpass') {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = filterFreq;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

function playTone(ctx, freq, duration, volume, type = 'sine', freqEnd) {
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

// --- Public sound effects ---

export function playMoveSound() {
  const ctx = ensureResumed();
  // Mech servo/step: two quick low tones
  playTone(ctx, 120, 0.06, 0.15, 'square', 80);
  setTimeout(() => playTone(ctx, 100, 0.06, 0.12, 'square', 70), 70);
}

export function playMeleeSound() {
  const ctx = ensureResumed();
  // Heavy punch impact
  playNoise(ctx, 0.15, 0.3, 800, 'lowpass');
  playTone(ctx, 200, 0.1, 0.2, 'sawtooth', 60);
  setTimeout(() => playTone(ctx, 80, 0.08, 0.15, 'square', 40), 50);
}

export function playCannonSound() {
  const ctx = ensureResumed();
  // Beam/cannon: rising tone then sustained
  playTone(ctx, 300, 0.3, 0.15, 'sawtooth', 900);
  playTone(ctx, 600, 0.25, 0.1, 'sine', 800);
  playNoise(ctx, 0.1, 0.1, 2000, 'highpass');
}

export function playArtillerySound() {
  const ctx = ensureResumed();
  // Launch: rising whistle
  playTone(ctx, 200, 0.25, 0.12, 'sine', 1200);
  playNoise(ctx, 0.08, 0.15, 600, 'lowpass');
}

export function playExplosionSound() {
  const ctx = ensureResumed();
  // Boom: low rumble + noise burst
  playNoise(ctx, 0.4, 0.35, 400, 'lowpass');
  playTone(ctx, 60, 0.3, 0.25, 'sine', 30);
  playTone(ctx, 100, 0.15, 0.15, 'square', 40);
}

export function playHitSound() {
  const ctx = ensureResumed();
  // Getting hit: short impact
  playNoise(ctx, 0.1, 0.2, 1200, 'lowpass');
  playTone(ctx, 300, 0.08, 0.15, 'square', 100);
}

export function playPushSound() {
  const ctx = ensureResumed();
  // Whoosh + thud
  playNoise(ctx, 0.15, 0.12, 3000, 'highpass');
  setTimeout(() => {
    playTone(ctx, 100, 0.1, 0.12, 'sine', 50);
    playNoise(ctx, 0.08, 0.1, 500, 'lowpass');
  }, 100);
}

export function playDeathSound() {
  const ctx = ensureResumed();
  // Destruction: descending tone + crash
  playTone(ctx, 400, 0.3, 0.2, 'sawtooth', 50);
  playNoise(ctx, 0.3, 0.2, 600, 'lowpass');
  setTimeout(() => playNoise(ctx, 0.2, 0.15, 300, 'lowpass'), 150);
}

// --- Sound registry for config-driven lookup ---

const SOUND_REGISTRY = {
  melee: playMeleeSound,
  cannon: playCannonSound,
  artillery: playArtillerySound,
  explosion: playExplosionSound,
  move: playMoveSound,
  hit: playHitSound,
  push: playPushSound,
  death: playDeathSound,
};

export function playSoundByKey(key) {
  const fn = SOUND_REGISTRY[key];
  if (fn) fn();
}

export function registerSound(key, fn) {
  SOUND_REGISTRY[key] = fn;
}
