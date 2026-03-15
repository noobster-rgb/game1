import { getRegisteredTargetTypes } from '../systems/targeting.js';

/**
 * Render the ability editing form into the given container.
 * Returns an object with getValues() to read current form state.
 */
export function renderAbilityForm(container, ability, previewCanvas) {
  const targetTypes = getRegisteredTargetTypes();

  container.innerHTML = `
    <div class="editor-form">
      <div class="editor-row">
        <div class="editor-field">
          <label>ID</label>
          <input type="text" id="ed-ab-id" value="${ability.id || ''}" placeholder="e.g. titanFist">
        </div>
        <div class="editor-field">
          <label>Name</label>
          <input type="text" id="ed-ab-name" value="${ability.name || ''}" placeholder="e.g. Titan Fist">
        </div>
      </div>

      <div class="editor-field">
        <label>Description</label>
        <textarea id="ed-ab-desc" rows="2">${ability.description || ''}</textarea>
      </div>

      <div class="editor-row">
        <div class="editor-field">
          <label>Damage</label>
          <input type="number" id="ed-ab-damage" value="${ability.damage ?? 1}" min="0" max="99">
        </div>
        <div class="editor-field">
          <label>Target Type</label>
          <select id="ed-ab-targetType">
            ${targetTypes.map(t => `<option value="${t}" ${t === ability.targetType ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="editor-row">
        <div class="editor-field">
          <label>Range</label>
          <input type="number" id="ed-ab-range" value="${ability.range ?? 1}" min="0" max="20">
        </div>
        <div class="editor-field">
          <label>Min Range</label>
          <input type="number" id="ed-ab-minRange" value="${ability.minRange ?? 0}" min="0" max="20">
        </div>
        <div class="editor-field">
          <label>Icon</label>
          <input type="text" id="ed-ab-icon" value="${ability.icon || ''}" placeholder="emoji" maxlength="4">
        </div>
      </div>

      <div class="editor-row">
        <div class="editor-checkbox">
          <input type="checkbox" id="ed-ab-push" ${ability.push ? 'checked' : ''}>
          <label for="ed-ab-push">Push</label>
        </div>
        <div class="editor-checkbox">
          <input type="checkbox" id="ed-ab-aoe" ${ability.aoe ? 'checked' : ''}>
          <label for="ed-ab-aoe">AoE</label>
        </div>
      </div>

      <div class="editor-row" id="ed-ab-push-row" style="display:${ability.push ? 'flex' : 'none'}">
        <div class="editor-field">
          <label>Push Direction</label>
          <select id="ed-ab-pushDir">
            <option value="away" ${ability.pushDirection !== 'linear' ? 'selected' : ''}>Away from attacker</option>
            <option value="linear" ${ability.pushDirection === 'linear' ? 'selected' : ''}>Along line</option>
          </select>
        </div>
      </div>

      <div class="editor-row">
        <div class="editor-field">
          <label>VFX Type (optional)</label>
          <select id="ed-ab-vfxType">
            <option value="">Default (from target type)</option>
            <option value="slash" ${ability.vfx?.type === 'slash' ? 'selected' : ''}>Slash</option>
            <option value="beam" ${ability.vfx?.type === 'beam' ? 'selected' : ''}>Beam</option>
            <option value="projectile" ${ability.vfx?.type === 'projectile' ? 'selected' : ''}>Projectile</option>
            <option value="explosion" ${ability.vfx?.type === 'explosion' ? 'selected' : ''}>Explosion</option>
          </select>
        </div>
        <div class="editor-field">
          <label>VFX Color</label>
          <input type="color" id="ed-ab-vfxColor" value="${ability.vfx?.color || '#ffffff'}">
        </div>
      </div>

      <div class="editor-field">
        <label>Sound (optional)</label>
        <select id="ed-ab-sound">
          <option value="">Default (from target type)</option>
          <option value="melee" ${ability.sound === 'melee' ? 'selected' : ''}>Melee</option>
          <option value="cannon" ${ability.sound === 'cannon' ? 'selected' : ''}>Cannon</option>
          <option value="artillery" ${ability.sound === 'artillery' ? 'selected' : ''}>Artillery</option>
          <option value="explosion" ${ability.sound === 'explosion' ? 'selected' : ''}>Explosion</option>
        </select>
      </div>
    </div>
  `;

  // Toggle push direction row visibility
  const pushCheck = container.querySelector('#ed-ab-push');
  const pushRow = container.querySelector('#ed-ab-push-row');
  pushCheck.addEventListener('change', () => {
    pushRow.style.display = pushCheck.checked ? 'flex' : 'none';
  });

  // Draw target preview
  if (previewCanvas) {
    drawAbilityPreview(previewCanvas, ability);
    // Redraw on target type change
    container.querySelector('#ed-ab-targetType').addEventListener('change', () => {
      drawAbilityPreview(previewCanvas, getAbilityFormValues(container));
    });
    container.querySelector('#ed-ab-range').addEventListener('input', () => {
      drawAbilityPreview(previewCanvas, getAbilityFormValues(container));
    });
  }
}

export function getAbilityFormValues(container) {
  const vfxType = container.querySelector('#ed-ab-vfxType').value;
  const vfxColor = container.querySelector('#ed-ab-vfxColor').value;
  const sound = container.querySelector('#ed-ab-sound').value;
  const pushDir = container.querySelector('#ed-ab-pushDir').value;
  const push = container.querySelector('#ed-ab-push').checked;

  return {
    id: container.querySelector('#ed-ab-id').value.trim(),
    name: container.querySelector('#ed-ab-name').value.trim(),
    description: container.querySelector('#ed-ab-desc').value.trim(),
    damage: parseInt(container.querySelector('#ed-ab-damage').value) || 0,
    targetType: container.querySelector('#ed-ab-targetType').value,
    range: parseInt(container.querySelector('#ed-ab-range').value) || 1,
    minRange: parseInt(container.querySelector('#ed-ab-minRange').value) || 0,
    push,
    pushDirection: push && pushDir === 'linear' ? 'linear' : undefined,
    aoe: container.querySelector('#ed-ab-aoe').checked,
    icon: container.querySelector('#ed-ab-icon').value.trim() || undefined,
    vfx: vfxType ? { type: vfxType, color: vfxColor } : undefined,
    sound: sound || undefined,
  };
}

function drawAbilityPreview(canvas, ability) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const gridSize = 7;
  const cellSize = size / gridSize;
  const centerX = 3;
  const centerY = 3;

  ctx.clearRect(0, 0, size, size);

  // Draw grid
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#2a3a2a' : '#253525';
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      ctx.strokeStyle = '#1a2a1a';
      ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  // Compute range tiles
  const rangeTiles = getPreviewRange(ability, centerX, centerY, gridSize);

  // Draw range tiles
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#cc4444';
  for (const t of rangeTiles) {
    ctx.fillRect(t.x * cellSize, t.y * cellSize, cellSize, cellSize);
  }
  ctx.globalAlpha = 1;

  // Draw center unit
  ctx.fillStyle = '#4488cc';
  const pad = cellSize * 0.2;
  ctx.fillRect(centerX * cellSize + pad, centerY * cellSize + pad, cellSize - pad * 2, cellSize - pad * 2);
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${cellSize * 0.4}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('U', centerX * cellSize + cellSize / 2, centerY * cellSize + cellSize / 2);
}

function getPreviewRange(ability, cx, cy, gridSize) {
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
    // Generic fallback: show manhattan range
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
