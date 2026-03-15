/**
 * Enhanced animated canvas previews for the kid-friendly editor.
 * Provides pulsing range tiles and bouncing mech previews.
 */

let abilityRafId = null;
let unitRafId = null;

// ===== Ability Preview (350x350) =====

/**
 * Start an animated ability preview.
 * @param {HTMLCanvasElement} canvas
 * @param {object} ability - { targetType, range, minRange, damage, icon }
 * @returns {function} cleanup function to stop animation
 */
export function startAbilityPreview(canvas, ability) {
  stopAbilityPreview();

  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const gridSize = 7;
  const cellSize = size / gridSize;
  const cx = 3, cy = 3;
  let t = 0;

  function draw() {
    t += 0.02;
    ctx.clearRect(0, 0, size, size);

    // Draw grid with softer colors and rounded cells
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const color = (x + y) % 2 === 0 ? '#c8e0c8' : '#b8d4b8';
        roundRect(ctx, x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2, 4, color);
        ctx.strokeStyle = '#a0c0a0';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Compute and draw range tiles with pulsing glow
    const rangeTiles = getPreviewRange(ability, cx, cy, gridSize);
    const alpha = 0.25 + 0.15 * Math.sin(t * 3);

    ctx.globalAlpha = alpha;
    for (const tile of rangeTiles) {
      ctx.fillStyle = '#cc4444';
      roundRect(ctx, tile.x * cellSize + 2, tile.y * cellSize + 2, cellSize - 4, cellSize - 4, 4);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw center mech (simplified procedural)
    drawMiniMech(ctx, cx * cellSize, cy * cellSize, cellSize, '#4488cc', '#2266aa', 'U', t);

    // Draw directional arrows for line attacks
    if (ability.targetType === 'line') {
      drawLineArrows(ctx, cx, cy, cellSize, ability.range, gridSize);
    }

    abilityRafId = requestAnimationFrame(draw);
  }

  draw();

  return () => stopAbilityPreview();
}

export function stopAbilityPreview() {
  if (abilityRafId) {
    cancelAnimationFrame(abilityRafId);
    abilityRafId = null;
  }
}

/**
 * Update the ability being previewed (call when user changes values).
 * Restarts the animation with new data.
 */
export function updateAbilityPreview(canvas, ability) {
  startAbilityPreview(canvas, ability);
}

// ===== Unit Preview (250x250) =====

/**
 * Start an animated unit preview with idle bounce.
 * @param {HTMLCanvasElement} canvas
 * @param {object} unit - { name, maxHp, sprite: { body, accent, symbol }, team }
 * @returns {function} cleanup function
 */
export function startUnitPreview(canvas, unit) {
  stopUnitPreview();

  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  let t = 0;

  function draw() {
    t += 0.03;
    ctx.clearRect(0, 0, size, size);

    // Background ground tile
    roundRect(ctx, 0, 0, size, size, 14, '#c8e0c8');
    ctx.strokeStyle = '#a0c0a0';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Subtle grid lines
    ctx.strokeStyle = '#b0d0b0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.moveTo(0, size / 2);
    ctx.lineTo(size, size / 2);
    ctx.stroke();

    // Mech bounce offset
    const bounceY = Math.sin(t * 2) * 3;

    const body = unit.sprite?.body || '#4488cc';
    const accent = unit.sprite?.accent || '#2266aa';
    const symbol = unit.sprite?.symbol || '?';
    const isEnemy = unit.team === 'enemy';

    const pad = size * 0.2;
    const unitW = size - pad * 2;
    const unitH = size - pad * 2;
    const ux = pad;
    const uy = pad + bounceY;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(size / 2, size - pad + 10, unitW * 0.4, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = accent;
    roundRect(ctx, ux + unitW * 0.12, uy + unitH * 0.82, unitW * 0.25, unitH * 0.18, 4);
    ctx.fill();
    roundRect(ctx, ux + unitW * 0.63, uy + unitH * 0.82, unitW * 0.25, unitH * 0.18, 4);
    ctx.fill();

    // Body
    ctx.fillStyle = body;
    roundRect(ctx, ux, uy + unitH * 0.15, unitW, unitH * 0.7, 8);
    ctx.fill();

    // Head
    ctx.fillStyle = accent;
    roundRect(ctx, ux + unitW * 0.18, uy, unitW * 0.64, unitH * 0.35, 6);
    ctx.fill();

    // Eyes
    ctx.fillStyle = isEnemy ? '#ff4444' : '#aaddff';
    ctx.beginPath();
    ctx.arc(ux + unitW * 0.35, uy + unitH * 0.15, unitW * 0.06, 0, Math.PI * 2);
    ctx.arc(ux + unitW * 0.65, uy + unitH * 0.15, unitW * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Symbol
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${unitW * 0.3}px 'Segoe UI', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, size / 2, uy + unitH * 0.52);

    // Team indicator dot
    ctx.fillStyle = isEnemy ? '#cc4444' : '#4488cc';
    ctx.beginPath();
    ctx.arc(ux + unitW + 8, uy + 8, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // HP hearts below mech
    const maxHp = unit.maxHp || 3;
    const heartSize = Math.min(22, (size - pad * 2) / maxHp);
    const heartsWidth = maxHp * heartSize;
    const heartsX = (size - heartsWidth) / 2;
    const heartsY = size - pad + 20;

    for (let i = 0; i < maxHp; i++) {
      ctx.font = `${heartSize - 2}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u{2764}\u{FE0F}', heartsX + i * heartSize + heartSize / 2, heartsY);
    }

    // Name speech bubble above
    if (unit.name) {
      const name = unit.name;
      ctx.font = 'bold 16px "Segoe UI", sans-serif';
      const tw = ctx.measureText(name).width;
      const bx = (size - tw) / 2 - 12;
      const by = uy - 36;
      const bw = tw + 24;
      const bh = 28;

      ctx.fillStyle = '#ffffff';
      roundRect(ctx, bx, by, bw, bh, 10);
      ctx.fill();
      ctx.strokeStyle = '#dde4ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Arrow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(size / 2 - 6, by + bh);
      ctx.lineTo(size / 2 + 6, by + bh);
      ctx.lineTo(size / 2, by + bh + 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, size / 2, by + bh / 2);
    }

    unitRafId = requestAnimationFrame(draw);
  }

  draw();

  return () => stopUnitPreview();
}

export function stopUnitPreview() {
  if (unitRafId) {
    cancelAnimationFrame(unitRafId);
    unitRafId = null;
  }
}

export function updateUnitPreview(canvas, unit) {
  startUnitPreview(canvas, unit);
}

// ===== Helpers =====

function roundRect(ctx, x, y, w, h, r, fillColor) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
}

function drawMiniMech(ctx, x, y, cellSize, body, accent, symbol, t) {
  const pad = cellSize * 0.12;
  const bounce = Math.sin(t * 2) * 1.5;
  const mx = x + pad;
  const my = y + pad + bounce;
  const mw = cellSize - pad * 2;
  const mh = cellSize - pad * 2;

  // Body
  ctx.fillStyle = body;
  roundRect(ctx, mx, my + mh * 0.15, mw, mh * 0.7, 3);
  ctx.fill();

  // Head
  ctx.fillStyle = accent;
  roundRect(ctx, mx + mw * 0.2, my, mw * 0.6, mh * 0.35, 2);
  ctx.fill();

  // Legs
  ctx.fillRect(mx + mw * 0.15, my + mh * 0.85, mw * 0.25, mh * 0.15);
  ctx.fillRect(mx + mw * 0.6, my + mh * 0.85, mw * 0.25, mh * 0.15);

  // Symbol
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${mw * 0.35}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, x + cellSize / 2, my + mh * 0.52);
}

function drawLineArrows(ctx, cx, cy, cellSize, range, gridSize) {
  const dirs = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];

  ctx.strokeStyle = 'rgba(100, 200, 100, 0.5)';
  ctx.lineWidth = 2;

  for (const d of dirs) {
    const endX = cx + d.x * Math.min(range, gridSize - 1);
    const endY = cy + d.y * Math.min(range, gridSize - 1);

    if (endX < 0 || endX >= gridSize || endY < 0 || endY >= gridSize) continue;

    const sx = (cx + 0.5) * cellSize;
    const sy = (cy + 0.5) * cellSize;
    const ex = (endX + 0.5) * cellSize;
    const ey = (endY + 0.5) * cellSize;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(ey - sy, ex - sx);
    const headLen = 8;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - headLen * Math.cos(angle - 0.4), ey - headLen * Math.sin(angle - 0.4));
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - headLen * Math.cos(angle + 0.4), ey - headLen * Math.sin(angle + 0.4));
    ctx.stroke();
  }
}

/**
 * Compute preview range tiles (same logic as ability-form.js but exported).
 */
export function getPreviewRange(ability, cx, cy, gridSize) {
  const tiles = [];
  const range = ability.range || 1;
  const minRange = ability.minRange || 0;
  const inB = (x, y) => x >= 0 && x < gridSize && y >= 0 && y < gridSize;

  if (ability.targetType === 'melee') {
    const dirs = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
    for (const d of dirs) {
      const nx = cx + d.x, ny = cy + d.y;
      if (inB(nx, ny)) tiles.push({ x: nx, y: ny });
    }
  } else if (ability.targetType === 'ranged') {
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        if (dx === 0 && dy === 0) continue;
        const dist = Math.abs(dx) + Math.abs(dy);
        if (dist <= range && dist >= (minRange || 1)) {
          const nx = cx + dx, ny = cy + dy;
          if (inB(nx, ny)) tiles.push({ x: nx, y: ny });
        }
      }
    }
  } else if (ability.targetType === 'line') {
    const dirs = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
    for (const d of dirs) {
      for (let i = 1; i <= range; i++) {
        const nx = cx + d.x * i, ny = cy + d.y * i;
        if (!inB(nx, ny)) break;
        tiles.push({ x: nx, y: ny });
      }
    }
  } else {
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        if (dx === 0 && dy === 0) continue;
        if (Math.abs(dx) + Math.abs(dy) <= range) {
          const nx = cx + dx, ny = cy + dy;
          if (inB(nx, ny)) tiles.push({ x: nx, y: ny });
        }
      }
    }
  }

  return tiles;
}
