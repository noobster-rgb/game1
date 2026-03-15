import { TILE_SIZE, TERRAIN_COLORS, COLORS, TEAM, TERRAIN, PHASE } from '../constants.js';
import { getUnitAt } from '../state.js';

let ctx;
let canvas;

export function initRenderer(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false; // pixel art look
}

export function render(state) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid(state);
  drawHighlights(state);
  drawUnits(state);
  drawAnimations(state);
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
  const s = unit.sprite || { body: '#888', accent: '#666', symbol: '?' };

  // Mech body - pixel art style
  const cx = px + TILE_SIZE / 2;
  const cy = py + TILE_SIZE / 2;
  const size = TILE_SIZE * 0.35;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(px + TILE_SIZE * 0.2, py + TILE_SIZE * 0.75, TILE_SIZE * 0.6, TILE_SIZE * 0.1);

  // Body
  ctx.fillStyle = s.body;
  if (isPlayer) {
    // Mech shape - squared
    ctx.fillRect(cx - size, cy - size * 1.1, size * 2, size * 2);
    // Shoulders
    ctx.fillStyle = s.accent;
    ctx.fillRect(cx - size * 1.2, cy - size * 0.8, size * 0.4, size * 1.2);
    ctx.fillRect(cx + size * 0.8, cy - size * 0.8, size * 0.4, size * 1.2);
    // Head
    ctx.fillStyle = s.body;
    ctx.fillRect(cx - size * 0.5, cy - size * 1.5, size, size * 0.5);
    // Visor
    ctx.fillStyle = '#aaddff';
    ctx.fillRect(cx - size * 0.35, cy - size * 1.35, size * 0.7, size * 0.2);
  } else {
    // Bug/creature shape - rounded
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 1.0, size * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(cx - size * 0.5, cy - size * 0.4, size * 0.25, size * 0.25);
    ctx.fillRect(cx + size * 0.25, cy - size * 0.4, size * 0.25, size * 0.25);
    // Accent marks
    ctx.fillStyle = s.accent;
    ctx.fillRect(cx - size * 0.2, cy + size * 0.1, size * 0.4, size * 0.15);
  }

  // Letter symbol
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.floor(TILE_SIZE * 0.22)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(s.symbol, cx, cy + 1);

  // HP bar
  const barWidth = TILE_SIZE * 0.7;
  const barHeight = 5;
  const barX = px + (TILE_SIZE - barWidth) / 2;
  const barY = py + TILE_SIZE - 10;
  ctx.fillStyle = COLORS.HP_BAR_BG;
  ctx.fillRect(barX, barY, barWidth, barHeight);
  const hpPercent = unit.hp / unit.maxHp;
  ctx.fillStyle = isPlayer ? COLORS.HP_BAR_PLAYER : COLORS.HP_BAR_ENEMY;
  ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);

  // Moved/acted overlay
  if (isPlayer && unit.moved && unit.acted && state.phase === PHASE.PLAYER_PHASE) {
    ctx.fillStyle = COLORS.MOVED_OVERLAY;
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
  }
}

function drawAnimations(state) {
  for (const anim of state.animations) {
    const unit = state.units.find(u => u.id === anim.unitId);
    if (!unit) continue;
    const px = anim.currentX * TILE_SIZE;
    const py = anim.currentY * TILE_SIZE;
    drawUnit(state, unit, px, py);
  }
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

export { drawUnit };
