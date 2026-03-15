import { TILE_SIZE, TERRAIN_COLORS, COLORS, TEAM, TERRAIN, PHASE } from '../constants.js';
import { getUnitAt } from '../state.js';
import { getSpriteFrame } from './sprites.js';

let ctx;
let canvas;
let portraitCtx;
let portraitCanvas;

// Portrait images keyed by unit type
const portraitImages = {};
const PORTRAIT_PATHS = {
  cannonMech: 'assets/portraits/cannonMech_sprite.png',
  combatMech: 'assets/portraits/combatMech_sprite.png',
};

function loadPortraits() {
  for (const [type, src] of Object.entries(PORTRAIT_PATHS)) {
    const img = new Image();
    img.onload = () => { portraitImages[type] = img; };
    img.onerror = () => { console.warn(`Failed to load portrait: ${src}`); };
    img.src = src;
  }
}

export function initRenderer(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false; // pixel art look

  portraitCanvas = document.getElementById('portrait-canvas');
  if (portraitCanvas) {
    portraitCtx = portraitCanvas.getContext('2d');
    portraitCtx.imageSmoothingEnabled = true;
    portraitCtx.imageSmoothingQuality = 'high';
  }

  loadPortraits();
}

export function render(state) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid(state);
  drawHighlights(state);
  drawUnits(state);
  drawAnimations(state);
  drawVFX(state);
  drawMessage(state);
}

function drawGrid(state) {
  const { grid } = state;
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const tile = grid.tiles[y][x];
      const colors = TERRAIN_COLORS[tile];
      const px = x * TILE_SIZE;
      const py = y * TILE_SIZE;

      // Base fill
      ctx.fillStyle = colors.base;
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

      // Pixel art terrain details
      drawTerrainDetail(tile, px, py);

      // Grid line
      ctx.strokeStyle = COLORS.GRID_LINE;
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
    }
  }
}

function drawTerrainDetail(tile, px, py) {
  const colors = TERRAIN_COLORS[tile];
  const s = TILE_SIZE / 8; // pixel size for 8x8 detail

  ctx.fillStyle = colors.detail;

  if (tile === TERRAIN.MOUNTAIN) {
    // Triangle mountain shape
    ctx.beginPath();
    ctx.moveTo(px + TILE_SIZE * 0.2, py + TILE_SIZE * 0.85);
    ctx.lineTo(px + TILE_SIZE * 0.5, py + TILE_SIZE * 0.15);
    ctx.lineTo(px + TILE_SIZE * 0.8, py + TILE_SIZE * 0.85);
    ctx.closePath();
    ctx.fill();
    // Snow cap
    ctx.fillStyle = '#ddd';
    ctx.beginPath();
    ctx.moveTo(px + TILE_SIZE * 0.38, py + TILE_SIZE * 0.4);
    ctx.lineTo(px + TILE_SIZE * 0.5, py + TILE_SIZE * 0.15);
    ctx.lineTo(px + TILE_SIZE * 0.62, py + TILE_SIZE * 0.4);
    ctx.closePath();
    ctx.fill();
  } else if (tile === TERRAIN.WATER) {
    // Wave lines
    for (let i = 0; i < 3; i++) {
      const wy = py + TILE_SIZE * (0.25 + i * 0.25);
      ctx.beginPath();
      ctx.moveTo(px + 4, wy);
      ctx.quadraticCurveTo(px + TILE_SIZE * 0.25, wy - 4, px + TILE_SIZE * 0.5, wy);
      ctx.quadraticCurveTo(px + TILE_SIZE * 0.75, wy + 4, px + TILE_SIZE - 4, wy);
      ctx.strokeStyle = colors.detail;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  } else if (tile === TERRAIN.BUILDING) {
    // Building shape
    const bx = px + TILE_SIZE * 0.15;
    const by = py + TILE_SIZE * 0.2;
    const bw = TILE_SIZE * 0.7;
    const bh = TILE_SIZE * 0.65;
    ctx.fillStyle = '#9a8a6a';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = colors.detail;
    ctx.fillRect(bx, by, bw, bh * 0.15); // roof
    // Windows
    ctx.fillStyle = '#aaccee';
    const ws = bw * 0.15;
    for (let wy = 0; wy < 2; wy++) {
      for (let wx = 0; wx < 3; wx++) {
        ctx.fillRect(
          bx + bw * 0.12 + wx * (ws + bw * 0.12),
          by + bh * 0.3 + wy * (ws + bh * 0.12),
          ws, ws
        );
      }
    }
  } else if (tile === TERRAIN.CHASM) {
    // Crack lines
    ctx.strokeStyle = '#4a2a4a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + TILE_SIZE * 0.2, py + TILE_SIZE * 0.1);
    ctx.lineTo(px + TILE_SIZE * 0.5, py + TILE_SIZE * 0.5);
    ctx.lineTo(px + TILE_SIZE * 0.3, py + TILE_SIZE * 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px + TILE_SIZE * 0.5, py + TILE_SIZE * 0.5);
    ctx.lineTo(px + TILE_SIZE * 0.8, py + TILE_SIZE * 0.7);
    ctx.stroke();
  } else if (tile === TERRAIN.GROUND) {
    // Random grass tufts
    ctx.fillStyle = colors.detail;
    const seed = (px * 7 + py * 13) % 17;
    for (let i = 0; i < 3; i++) {
      const gx = px + ((seed + i * 23) % 50) + 7;
      const gy = py + ((seed + i * 37) % 50) + 7;
      ctx.fillRect(gx, gy, s, s);
    }
  }
}

function drawHighlights(state) {
  // Movement range
  for (const tile of state.highlightedTiles) {
    ctx.fillStyle = COLORS.MOVE_RANGE;
    ctx.fillRect(tile.x * TILE_SIZE, tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  // Attack range
  for (const tile of state.attackTargetTiles) {
    ctx.fillStyle = COLORS.ATTACK_RANGE;
    ctx.fillRect(tile.x * TILE_SIZE, tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  // Selected unit highlight
  if (state.selectedUnitId != null) {
    const unit = state.units.find(u => u.id === state.selectedUnitId);
    if (unit && unit.hp > 0) {
      ctx.fillStyle = COLORS.SELECTION;
      ctx.fillRect(unit.x * TILE_SIZE, unit.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }
}

function drawUnits(state) {
  for (const unit of state.units) {
    if (unit.hp <= 0) continue;
    // Skip units being animated
    if (state.animations.some(a => a.unitId === unit.id)) continue;
    drawUnit(state, unit, unit.x * TILE_SIZE, unit.y * TILE_SIZE);
  }
}

function drawUnit(state, unit, px, py) {
  const isPlayer = unit.team === TEAM.PLAYER;

  // Try sprite-based rendering first
  const frame = getSpriteFrame(unit, state);
  if (frame) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(px + TILE_SIZE * 0.2, py + TILE_SIZE * 0.75, TILE_SIZE * 0.6, TILE_SIZE * 0.1);
    // Draw sprite frame
    ctx.drawImage(
      frame.image,
      frame.sx, frame.sy, frame.sw, frame.sh,
      px, py, TILE_SIZE, TILE_SIZE
    );
    drawHpBar(unit, px, py, isPlayer);
    drawMovedOverlay(state, unit, px, py, isPlayer);
    return;
  }

  // Procedural fallback
  const s = unit.sprite || { body: '#888', accent: '#666', symbol: '?' };
  const cx = px + TILE_SIZE / 2;
  const cy = py + TILE_SIZE / 2;
  const size = TILE_SIZE * 0.35;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(px + TILE_SIZE * 0.2, py + TILE_SIZE * 0.75, TILE_SIZE * 0.6, TILE_SIZE * 0.1);

  // Body
  ctx.fillStyle = s.body;
  if (isPlayer) {
    ctx.fillRect(cx - size, cy - size * 1.1, size * 2, size * 2);
    ctx.fillStyle = s.accent;
    ctx.fillRect(cx - size * 1.2, cy - size * 0.8, size * 0.4, size * 1.2);
    ctx.fillRect(cx + size * 0.8, cy - size * 0.8, size * 0.4, size * 1.2);
    ctx.fillStyle = s.body;
    ctx.fillRect(cx - size * 0.5, cy - size * 1.5, size, size * 0.5);
    ctx.fillStyle = '#aaddff';
    ctx.fillRect(cx - size * 0.35, cy - size * 1.35, size * 0.7, size * 0.2);
  } else {
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 1.0, size * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(cx - size * 0.5, cy - size * 0.4, size * 0.25, size * 0.25);
    ctx.fillRect(cx + size * 0.25, cy - size * 0.4, size * 0.25, size * 0.25);
    ctx.fillStyle = s.accent;
    ctx.fillRect(cx - size * 0.2, cy + size * 0.1, size * 0.4, size * 0.15);
  }

  // Letter symbol
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.floor(TILE_SIZE * 0.22)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(s.symbol, cx, cy + 1);

  drawHpBar(unit, px, py, isPlayer);
  drawMovedOverlay(state, unit, px, py, isPlayer);
}

function drawHpBar(unit, px, py, isPlayer) {
  const barWidth = TILE_SIZE * 0.7;
  const barHeight = 5;
  const barX = px + (TILE_SIZE - barWidth) / 2;
  const barY = py + TILE_SIZE - 10;
  ctx.fillStyle = COLORS.HP_BAR_BG;
  ctx.fillRect(barX, barY, barWidth, barHeight);
  const hpPercent = unit.hp / unit.maxHp;
  ctx.fillStyle = isPlayer ? COLORS.HP_BAR_PLAYER : COLORS.HP_BAR_ENEMY;
  ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
}

function drawMovedOverlay(state, unit, px, py, isPlayer) {
  if (isPlayer && unit.moved && unit.acted && state.phase === PHASE.PLAYER_PHASE) {
    ctx.fillStyle = COLORS.MOVED_OVERLAY;
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
  }
}

function drawAnimations(state) {
  for (const anim of state.animations) {
    if (anim.type.startsWith('vfx_')) continue; // drawn separately
    const unit = state.units.find(u => u.id === anim.unitId);
    if (!unit) continue;
    const px = anim.currentX * TILE_SIZE;
    const py = anim.currentY * TILE_SIZE;
    drawUnit(state, unit, px, py);
  }
}

function drawVFX(state) {
  for (const anim of state.animations) {
    if (!anim.type.startsWith('vfx_')) continue;
    const t = anim.progress || 0;

    if (anim.type === 'vfx_impact') {
      drawImpactEffect(anim, t);
    } else if (anim.type === 'vfx_projectile') {
      drawProjectileEffect(anim, t);
    } else if (anim.type === 'vfx_beam') {
      drawBeamEffect(anim, t);
    } else if (anim.type === 'vfx_explosion') {
      drawExplosionEffect(anim, t);
    } else if (anim.type === 'vfx_slash') {
      drawSlashEffect(anim, t);
    }
  }
}

function drawImpactEffect(anim, t) {
  const cx = (anim.x + 0.5) * TILE_SIZE;
  const cy = (anim.y + 0.5) * TILE_SIZE;
  const maxRadius = TILE_SIZE * 0.6;

  ctx.save();
  // Expanding ring
  const ringRadius = maxRadius * t;
  const alpha = 1 - t;
  ctx.strokeStyle = anim.color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 4 * (1 - t) + 1;
  ctx.beginPath();
  ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner flash (first half)
  if (t < 0.5) {
    const flashAlpha = 1 - t * 2;
    ctx.globalAlpha = flashAlpha * 0.6;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, maxRadius * 0.3 * (1 - t), 0, Math.PI * 2);
    ctx.fill();
  }

  // Spark particles
  ctx.globalAlpha = alpha;
  ctx.fillStyle = anim.color;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + t * 2;
    const dist = ringRadius * 0.8 + t * TILE_SIZE * 0.2;
    const sx = cx + Math.cos(angle) * dist;
    const sy = cy + Math.sin(angle) * dist;
    const size = 3 * (1 - t);
    ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
  }
  ctx.restore();
}

function drawProjectileEffect(anim, t) {
  const cx = (anim.currentX + 0.5) * TILE_SIZE;
  const cy = (anim.currentY + 0.5) * TILE_SIZE;

  ctx.save();
  // Arc height (parabola peaking at midpoint)
  const arcHeight = -TILE_SIZE * 1.5 * Math.sin(t * Math.PI);
  const drawY = cy + arcHeight;

  // Shadow on ground
  ctx.globalAlpha = 0.3 * (1 - t * 0.5);
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(cx, cy + TILE_SIZE * 0.3, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Projectile glow
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = anim.color;
  ctx.beginPath();
  ctx.arc(cx, drawY, 10, 0, Math.PI * 2);
  ctx.fill();

  // Projectile core
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, drawY, 4, 0, Math.PI * 2);
  ctx.fill();

  // Trail
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = anim.color;
  const trailLen = 3;
  for (let i = 1; i <= trailLen; i++) {
    const tt = Math.max(0, t - i * 0.05);
    const eased = 1 - (1 - tt) * (1 - tt);
    const tx = (anim.fromX + (anim.toX - anim.fromX) * eased + 0.5) * TILE_SIZE;
    const ty = (anim.fromY + (anim.toY - anim.fromY) * eased + 0.5) * TILE_SIZE + (-TILE_SIZE * 1.5 * Math.sin(tt * Math.PI));
    ctx.globalAlpha = 0.3 * (1 - i / (trailLen + 1));
    ctx.beginPath();
    ctx.arc(tx, ty, 3 - i * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBeamEffect(anim, t) {
  const fromCx = (anim.fromX + 0.5) * TILE_SIZE;
  const fromCy = (anim.fromY + 0.5) * TILE_SIZE;
  const toCx = (anim.toX + 0.5) * TILE_SIZE;
  const toCy = (anim.toY + 0.5) * TILE_SIZE;

  ctx.save();
  // Beam appears, holds, then fades
  let beamAlpha;
  let beamWidth;
  if (t < 0.15) {
    // Charge up
    beamAlpha = t / 0.15;
    beamWidth = 2 + 6 * (t / 0.15);
  } else if (t < 0.7) {
    // Full beam
    beamAlpha = 1;
    beamWidth = 8;
  } else {
    // Fade out
    beamAlpha = 1 - (t - 0.7) / 0.3;
    beamWidth = 8 * beamAlpha;
  }

  // Outer glow
  ctx.globalAlpha = beamAlpha * 0.3;
  ctx.strokeStyle = anim.color;
  ctx.lineWidth = beamWidth * 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(fromCx, fromCy);
  ctx.lineTo(toCx, toCy);
  ctx.stroke();

  // Core beam
  ctx.globalAlpha = beamAlpha * 0.8;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = beamWidth;
  ctx.beginPath();
  ctx.moveTo(fromCx, fromCy);
  ctx.lineTo(toCx, toCy);
  ctx.stroke();

  // Inner bright core
  ctx.globalAlpha = beamAlpha;
  ctx.strokeStyle = anim.color;
  ctx.lineWidth = beamWidth * 0.4;
  ctx.beginPath();
  ctx.moveTo(fromCx, fromCy);
  ctx.lineTo(toCx, toCy);
  ctx.stroke();

  // Impact flash at end
  if (t > 0.1 && t < 0.8) {
    ctx.globalAlpha = beamAlpha * 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(toCx, toCy, beamWidth * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawExplosionEffect(anim, t) {
  const cx = (anim.x + 0.5) * TILE_SIZE;
  const cy = (anim.y + 0.5) * TILE_SIZE;
  const maxRadius = TILE_SIZE * (0.6 + anim.radius * 0.4);

  ctx.save();
  // Expanding fireball (first half)
  if (t < 0.4) {
    const fireT = t / 0.4;
    const radius = maxRadius * fireT;
    ctx.globalAlpha = 0.7 * (1 - fireT * 0.5);
    ctx.fillStyle = anim.color;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // White core
    ctx.globalAlpha = 0.9 * (1 - fireT);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Expanding rings
  const ringAlpha = 1 - t;
  ctx.globalAlpha = ringAlpha * 0.6;
  ctx.strokeStyle = anim.color;
  ctx.lineWidth = 3 * (1 - t);
  ctx.beginPath();
  ctx.arc(cx, cy, maxRadius * t, 0, Math.PI * 2);
  ctx.stroke();

  // Second ring (delayed)
  if (t > 0.15) {
    const t2 = (t - 0.15) / 0.85;
    ctx.globalAlpha = (1 - t2) * 0.4;
    ctx.lineWidth = 2 * (1 - t2);
    ctx.beginPath();
    ctx.arc(cx, cy, maxRadius * 1.3 * t2, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Debris particles
  ctx.fillStyle = anim.color;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + 0.3;
    const speed = 0.7 + (i % 3) * 0.3;
    const dist = maxRadius * t * speed;
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist - (1 - t) * TILE_SIZE * 0.3;
    const size = 4 * (1 - t);
    ctx.globalAlpha = (1 - t) * 0.8;
    ctx.fillRect(px - size / 2, py - size / 2, size, size);
  }
  ctx.restore();
}

function drawSlashEffect(anim, t) {
  const cx = (anim.x + 0.5) * TILE_SIZE;
  const cy = (anim.y + 0.5) * TILE_SIZE;
  const size = TILE_SIZE * 0.7;

  ctx.save();
  ctx.translate(cx, cy);

  const alpha = t < 0.5 ? 1 : 1 - (t - 0.5) * 2;
  ctx.globalAlpha = alpha;

  // Slash arc 1
  ctx.strokeStyle = anim.color;
  ctx.lineWidth = 3 * (1 - t) + 1;
  ctx.lineCap = 'round';
  const slashProgress = Math.min(t * 3, 1);
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.5, -Math.PI * 0.7, -Math.PI * 0.7 + Math.PI * 1.2 * slashProgress);
  ctx.stroke();

  // Slash arc 2 (delayed, opposite)
  if (t > 0.15) {
    const t2 = Math.min((t - 0.15) * 3, 1);
    ctx.globalAlpha = alpha * 0.7;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.35, Math.PI * 0.3, Math.PI * 0.3 + Math.PI * 1.0 * t2);
    ctx.stroke();
  }

  // Impact sparks
  ctx.fillStyle = anim.color;
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + t * 3;
    const dist = size * 0.4 * t;
    ctx.globalAlpha = (1 - t) * 0.6;
    const sx = Math.cos(angle) * dist;
    const sy = Math.sin(angle) * dist;
    ctx.fillRect(sx - 2, sy - 2, 4 * (1 - t), 4 * (1 - t));
  }

  ctx.restore();
}

function drawMessage(state) {
  if (!state.message) return;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  const msgWidth = Math.min(canvas.width * 0.8, 400);
  const msgHeight = 50;
  const mx = (canvas.width - msgWidth) / 2;
  const my = canvas.height * 0.15;
  ctx.fillRect(mx, my, msgWidth, msgHeight);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.message, canvas.width / 2, my + msgHeight / 2);
}

export function renderPortrait(state) {
  if (!portraitCtx) return;
  const pw = portraitCanvas.width;
  const ph = portraitCanvas.height;
  portraitCtx.clearRect(0, 0, pw, ph);

  // Dark background
  portraitCtx.fillStyle = '#0e1525';
  portraitCtx.fillRect(0, 0, pw, ph);

  if (state.selectedUnitId == null) return;
  const unit = state.units.find(u => u.id === state.selectedUnitId);
  if (!unit || unit.hp <= 0) return;

  const isPlayer = unit.team === TEAM.PLAYER;

  // Try portrait image first
  const portraitImg = portraitImages[unit.type];
  if (portraitImg) {
    portraitCtx.drawImage(portraitImg, 0, 0, pw, ph);
    drawPortraitOverlay(unit, isPlayer, pw, ph);
    return;
  }

  // Try sprite-based rendering
  const frame = getSpriteFrame(unit, state);
  if (frame) {
    portraitCtx.drawImage(
      frame.image,
      frame.sx, frame.sy, frame.sw, frame.sh,
      8, 8, pw - 16, ph - 16,
    );
    drawPortraitOverlay(unit, isPlayer, pw, ph);
    return;
  }

  // Procedural portrait (larger version of the unit)
  const s = unit.sprite || { body: '#888', accent: '#666', symbol: '?' };
  const cx = pw / 2;
  const cy = ph / 2;
  const size = pw * 0.28;

  // Background glow
  portraitCtx.fillStyle = isPlayer ? 'rgba(68, 136, 204, 0.15)' : 'rgba(204, 68, 68, 0.15)';
  portraitCtx.beginPath();
  portraitCtx.arc(cx, cy, size * 1.8, 0, Math.PI * 2);
  portraitCtx.fill();

  // Body
  portraitCtx.fillStyle = s.body;
  if (isPlayer) {
    // Mech body
    portraitCtx.fillRect(cx - size, cy - size * 1.1, size * 2, size * 2);
    // Arms
    portraitCtx.fillStyle = s.accent;
    portraitCtx.fillRect(cx - size * 1.3, cy - size * 0.8, size * 0.5, size * 1.4);
    portraitCtx.fillRect(cx + size * 0.8, cy - size * 0.8, size * 0.5, size * 1.4);
    // Head
    portraitCtx.fillStyle = s.body;
    portraitCtx.fillRect(cx - size * 0.6, cy - size * 1.7, size * 1.2, size * 0.7);
    // Visor
    portraitCtx.fillStyle = '#aaddff';
    portraitCtx.fillRect(cx - size * 0.4, cy - size * 1.5, size * 0.8, size * 0.3);
    // Visor glow
    portraitCtx.fillStyle = 'rgba(170, 221, 255, 0.3)';
    portraitCtx.fillRect(cx - size * 0.5, cy - size * 1.55, size * 1.0, size * 0.4);
  } else {
    // Bug body
    portraitCtx.beginPath();
    portraitCtx.ellipse(cx, cy, size * 1.2, size * 1.0, 0, 0, Math.PI * 2);
    portraitCtx.fill();
    // Eyes
    portraitCtx.fillStyle = '#ff4444';
    portraitCtx.fillRect(cx - size * 0.6, cy - size * 0.5, size * 0.35, size * 0.35);
    portraitCtx.fillRect(cx + size * 0.25, cy - size * 0.5, size * 0.35, size * 0.35);
    // Mandibles
    portraitCtx.fillStyle = s.accent;
    portraitCtx.fillRect(cx - size * 0.3, cy + size * 0.2, size * 0.6, size * 0.2);
  }

  // Symbol
  portraitCtx.fillStyle = '#fff';
  portraitCtx.font = `bold ${Math.floor(pw * 0.2)}px monospace`;
  portraitCtx.textAlign = 'center';
  portraitCtx.textBaseline = 'middle';
  portraitCtx.fillText(s.symbol, cx, cy + 2);

  drawPortraitOverlay(unit, isPlayer, pw, ph);
}

function drawPortraitOverlay(unit, isPlayer, pw, ph) {
  // Team color border accent (inner glow)
  const borderColor = isPlayer ? 'rgba(68, 136, 204, 0.5)' : 'rgba(204, 68, 68, 0.5)';
  portraitCtx.strokeStyle = borderColor;
  portraitCtx.lineWidth = 2;
  portraitCtx.strokeRect(1, 1, pw - 2, ph - 2);
}

export { drawUnit };
