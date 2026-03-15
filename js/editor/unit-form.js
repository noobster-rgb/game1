import { TEAM } from '../constants.js';

/**
 * Render the unit editing form into the given container.
 */
export function renderUnitForm(container, unit, allAbilities, previewCanvas) {
  const abilityIds = (unit.abilities || []).map(a => typeof a === 'string' ? a : a.id);

  container.innerHTML = `
    <div class="editor-form">
      <div class="editor-row">
        <div class="editor-field">
          <label>Type (ID)</label>
          <input type="text" id="ed-u-type" value="${unit.type || ''}" placeholder="e.g. combatMech">
        </div>
        <div class="editor-field">
          <label>Name</label>
          <input type="text" id="ed-u-name" value="${unit.name || ''}" placeholder="e.g. Combat Mech">
        </div>
      </div>

      <div class="editor-row">
        <div class="editor-field">
          <label>Team</label>
          <select id="ed-u-team">
            <option value="${TEAM.PLAYER}" ${unit.team === TEAM.PLAYER ? 'selected' : ''}>Player</option>
            <option value="${TEAM.ENEMY}" ${unit.team === TEAM.ENEMY ? 'selected' : ''}>Enemy</option>
          </select>
        </div>
        <div class="editor-field">
          <label>Max HP</label>
          <input type="number" id="ed-u-maxHp" value="${unit.maxHp ?? 3}" min="1" max="99">
        </div>
        <div class="editor-field">
          <label>Move Range</label>
          <input type="number" id="ed-u-moveRange" value="${unit.moveRange ?? 3}" min="0" max="20">
        </div>
      </div>

      <div class="editor-field">
        <label>Abilities</label>
        <div class="ability-checklist" id="ed-u-abilities">
          ${Object.entries(allAbilities).map(([id, a]) => `
            <label>
              <input type="checkbox" value="${id}" ${abilityIds.includes(id) ? 'checked' : ''}>
              ${a.icon || ''} ${a.name || id} (${a.damage} dmg, ${a.targetType})
            </label>
          `).join('')}
        </div>
      </div>

      <div class="editor-row">
        <div class="editor-field">
          <label>Body Color</label>
          <input type="color" id="ed-u-body" value="${unit.sprite?.body || '#4488cc'}">
        </div>
        <div class="editor-field">
          <label>Accent Color</label>
          <input type="color" id="ed-u-accent" value="${unit.sprite?.accent || '#2266aa'}">
        </div>
        <div class="editor-field">
          <label>Symbol</label>
          <input type="text" id="ed-u-symbol" value="${unit.sprite?.symbol || ''}" maxlength="1" style="width:40px">
        </div>
      </div>

      <div class="editor-field" id="ed-u-ai-row" style="display:${unit.team === TEAM.ENEMY ? 'flex' : 'none'}">
        <label>AI Priority</label>
        <select id="ed-u-aiPriority">
          <option value="nearest" ${unit.aiPriority === 'nearest' ? 'selected' : ''}>Nearest</option>
          <option value="buildings" ${unit.aiPriority === 'buildings' ? 'selected' : ''}>Buildings</option>
          <option value="ranged" ${unit.aiPriority === 'ranged' ? 'selected' : ''}>Ranged</option>
        </select>
      </div>

      <div class="editor-field">
        <label>Portrait Path (optional)</label>
        <input type="text" id="ed-u-portrait" value="${unit.portrait || ''}" placeholder="assets/portraits/unit_portrait.png">
      </div>

      <div class="editor-field">
        <label>Sprite Sheet Path (optional)</label>
        <input type="text" id="ed-u-spriteSrc" value="${unit.spriteSheet?.src || ''}" placeholder="assets/sprites/unit.png">
      </div>
    </div>
  `;

  // Toggle AI row on team change
  const teamSelect = container.querySelector('#ed-u-team');
  const aiRow = container.querySelector('#ed-u-ai-row');
  teamSelect.addEventListener('change', () => {
    aiRow.style.display = teamSelect.value === TEAM.ENEMY ? 'flex' : 'none';
  });

  // Draw preview
  if (previewCanvas) {
    drawUnitPreview(previewCanvas, unit);
    // Redraw on color/symbol change
    for (const sel of ['#ed-u-body', '#ed-u-accent', '#ed-u-symbol']) {
      container.querySelector(sel).addEventListener('input', () => {
        drawUnitPreview(previewCanvas, getUnitFormValues(container));
      });
    }
  }
}

export function getUnitFormValues(container) {
  const abilityCheckboxes = container.querySelectorAll('#ed-u-abilities input[type="checkbox"]:checked');
  const abilities = Array.from(abilityCheckboxes).map(cb => cb.value);
  const team = container.querySelector('#ed-u-team').value;
  const spriteSrc = container.querySelector('#ed-u-spriteSrc').value.trim();
  const portrait = container.querySelector('#ed-u-portrait').value.trim();

  const result = {
    type: container.querySelector('#ed-u-type').value.trim(),
    name: container.querySelector('#ed-u-name').value.trim(),
    team,
    maxHp: parseInt(container.querySelector('#ed-u-maxHp').value) || 1,
    moveRange: parseInt(container.querySelector('#ed-u-moveRange').value) || 3,
    abilities,
    sprite: {
      body: container.querySelector('#ed-u-body').value,
      accent: container.querySelector('#ed-u-accent').value,
      symbol: container.querySelector('#ed-u-symbol').value.trim() || '?',
    },
  };

  if (team === 'enemy') {
    result.aiPriority = container.querySelector('#ed-u-aiPriority').value;
  }

  if (portrait) result.portrait = portrait;

  if (spriteSrc) {
    result.spriteSheet = {
      src: spriteSrc,
      frameWidth: 64, frameHeight: 64,
      idle: [0, 1, 2, 3], attack: null, hurt: null, idleSpeed: 250,
    };
  }

  return result;
}

function drawUnitPreview(canvas, unit) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  ctx.clearRect(0, 0, size, size);

  // Background tile
  ctx.fillStyle = '#2a3a2a';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#1a2a1a';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, size, size);

  const body = unit.sprite?.body || '#4488cc';
  const accent = unit.sprite?.accent || '#2266aa';
  const symbol = unit.sprite?.symbol || '?';
  const isEnemy = unit.team === TEAM.ENEMY || unit.team === 'enemy';

  const pad = size * 0.15;
  const unitSize = size - pad * 2;

  // Body
  ctx.fillStyle = body;
  ctx.fillRect(pad, pad + unitSize * 0.15, unitSize, unitSize * 0.7);

  // Head
  ctx.fillStyle = accent;
  ctx.fillRect(pad + unitSize * 0.2, pad, unitSize * 0.6, unitSize * 0.35);

  // Legs
  ctx.fillRect(pad + unitSize * 0.15, pad + unitSize * 0.85, unitSize * 0.25, unitSize * 0.15);
  ctx.fillRect(pad + unitSize * 0.6, pad + unitSize * 0.85, unitSize * 0.25, unitSize * 0.15);

  // Symbol
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${unitSize * 0.35}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, size / 2, size / 2 + unitSize * 0.05);

  // HP bar
  const barY = size - pad * 0.7;
  const barH = 6;
  ctx.fillStyle = '#333';
  ctx.fillRect(pad, barY, unitSize, barH);
  ctx.fillStyle = isEnemy ? '#cc4444' : '#44cc44';
  ctx.fillRect(pad, barY, unitSize, barH);

  // Team indicator
  ctx.fillStyle = isEnemy ? '#cc4444' : '#4488cc';
  ctx.beginPath();
  ctx.arc(size - pad * 0.5, pad * 0.5, 5, 0, Math.PI * 2);
  ctx.fill();
}
