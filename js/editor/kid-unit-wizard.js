/**
 * Kid-friendly unit creation wizard — 4 steps after template selection.
 */

import { SYMBOL_OPTIONS, COLOR_PALETTES } from './kid-templates.js';
import { ABILITIES } from '../data/abilities.js';
import { startUnitPreview, stopUnitPreview } from './kid-preview.js';
import { playClickSound } from './kid-feedback.js';

/**
 * Render a wizard step into the container.
 */
export function renderUnitStep(container, step, values, onChange) {
  container.innerHTML = '';

  const stepEl = document.createElement('div');
  stepEl.className = 'kid-step';

  if (step === 1) renderStep1(stepEl, values, onChange);
  else if (step === 2) renderStep2(stepEl, values, onChange);
  else if (step === 3) renderStep3(stepEl, values, onChange);
  else if (step === 4) renderStep4(stepEl, values, onChange);

  container.appendChild(stepEl);
}

/** Read current form values from the active step. */
export function readUnitStepValues(container, step, currentValues) {
  const vals = { ...currentValues };

  if (step === 1) {
    const nameInput = container.querySelector('#kid-u-name');
    if (nameInput) vals.name = nameInput.value.trim();
  }

  return vals;
}

/** Validate a step. Returns error field name or null. */
export function validateUnitStep(step, values) {
  if (step === 1 && !values.name) return 'name';
  return null;
}

// ===== Step 1: Name + Team + Symbol =====

function renderStep1(stepEl, values, onChange) {
  const title = document.createElement('div');
  title.className = 'kid-step-title';
  title.textContent = 'Name your robot!';
  stepEl.appendChild(title);

  const body = document.createElement('div');
  body.className = 'kid-step-body';

  const form = document.createElement('div');
  form.className = 'kid-step-form';

  // Name input
  const nameLabel = document.createElement('div');
  nameLabel.className = 'kid-input-label';
  nameLabel.textContent = 'Robot Name';
  form.appendChild(nameLabel);

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'kid-input';
  nameInput.id = 'kid-u-name';
  nameInput.placeholder = 'Type a name...';
  nameInput.value = values.name || '';
  nameInput.maxLength = 30;
  nameInput.addEventListener('input', () => {
    values.name = nameInput.value.trim();
    onChange(values);
  });
  form.appendChild(nameInput);

  // Team selection
  const teamLabel = document.createElement('div');
  teamLabel.className = 'kid-input-label';
  teamLabel.style.marginTop = '20px';
  teamLabel.textContent = 'Which team?';
  form.appendChild(teamLabel);

  const teamCards = document.createElement('div');
  teamCards.className = 'kid-team-cards';

  const teams = [
    { team: 'player', icon: '\u{1F916}', label: 'Your Team' },
    { team: 'enemy', icon: '\u{1F41B}', label: 'Enemy Team' },
  ];

  for (const t of teams) {
    const card = document.createElement('div');
    card.className = `kid-team-card ${values.team === t.team ? 'selected' : ''}`;
    card.dataset.team = t.team;
    card.innerHTML = `
      <div class="kid-team-icon">${t.icon}</div>
      <div class="kid-team-label">${t.label}</div>
    `;
    card.addEventListener('click', () => {
      values.team = t.team;
      if (t.team === 'enemy' && !values.aiPriority) {
        values.aiPriority = 'nearest';
      }
      teamCards.querySelectorAll('.kid-team-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      playClickSound();
      onChange(values);
    });
    teamCards.appendChild(card);
  }

  form.appendChild(teamCards);

  // Symbol picker
  const symLabel = document.createElement('div');
  symLabel.className = 'kid-input-label';
  symLabel.style.marginTop = '20px';
  symLabel.textContent = 'Pick a letter!';
  form.appendChild(symLabel);

  const symGrid = document.createElement('div');
  symGrid.className = 'kid-symbol-grid';

  for (const sym of SYMBOL_OPTIONS) {
    const btn = document.createElement('button');
    btn.className = `kid-symbol-btn ${values.sprite?.symbol === sym ? 'selected' : ''}`;
    btn.textContent = sym;
    btn.addEventListener('click', () => {
      if (!values.sprite) values.sprite = { body: '#4488cc', accent: '#2266aa', symbol: '?' };
      values.sprite.symbol = sym;
      symGrid.querySelectorAll('.kid-symbol-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      playClickSound();
      onChange(values);
    });
    symGrid.appendChild(btn);
  }

  form.appendChild(symGrid);
  body.appendChild(form);
  stepEl.appendChild(body);
}

// ===== Step 2: Paint (colors) =====

function renderStep2(stepEl, values, onChange) {
  const title = document.createElement('div');
  title.className = 'kid-step-title';
  title.textContent = 'Pick colors for your robot!';
  stepEl.appendChild(title);

  const body = document.createElement('div');
  body.className = 'kid-step-body';

  const form = document.createElement('div');
  form.className = 'kid-step-form';

  // Palette presets
  const palLabel = document.createElement('div');
  palLabel.className = 'kid-input-label';
  palLabel.textContent = 'Quick colors';
  form.appendChild(palLabel);

  const palGrid = document.createElement('div');
  palGrid.className = 'kid-palette-grid';

  for (const pal of COLOR_PALETTES) {
    const card = document.createElement('div');
    card.className = 'kid-palette-card';

    // Draw mini mech preview on a small canvas
    const miniCanvas = document.createElement('canvas');
    miniCanvas.width = 80;
    miniCanvas.height = 80;
    drawPaletteMech(miniCanvas, pal);
    miniCanvas.style.width = '100%';
    miniCanvas.style.height = '100%';
    card.appendChild(miniCanvas);

    const label = document.createElement('div');
    label.className = 'kid-palette-label';
    label.textContent = pal.label;
    card.appendChild(label);

    card.addEventListener('click', () => {
      if (!values.sprite) values.sprite = {};
      values.sprite.body = pal.body;
      values.sprite.accent = pal.accent;
      // Update color pickers
      const bodyPicker = form.querySelector('#kid-color-body');
      const accentPicker = form.querySelector('#kid-color-accent');
      if (bodyPicker) bodyPicker.value = pal.body;
      if (accentPicker) accentPicker.value = pal.accent;

      palGrid.querySelectorAll('.kid-palette-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      playClickSound();
      onChange(values);
    });

    palGrid.appendChild(card);
  }

  form.appendChild(palGrid);

  // Individual color pickers
  const colorLabel = document.createElement('div');
  colorLabel.className = 'kid-input-label';
  colorLabel.style.marginTop = '20px';
  colorLabel.textContent = 'Or pick your own';
  form.appendChild(colorLabel);

  const colorRow = document.createElement('div');
  colorRow.className = 'kid-color-row';

  const bodyPicker = createColorPicker('Body', values.sprite?.body || '#4488cc', 'kid-color-body', (color) => {
    if (!values.sprite) values.sprite = {};
    values.sprite.body = color;
    onChange(values);
  });

  const accentPicker = createColorPicker('Head', values.sprite?.accent || '#2266aa', 'kid-color-accent', (color) => {
    if (!values.sprite) values.sprite = {};
    values.sprite.accent = color;
    onChange(values);
  });

  colorRow.appendChild(bodyPicker);
  colorRow.appendChild(accentPicker);
  form.appendChild(colorRow);

  // Preview
  const previewArea = document.createElement('div');
  previewArea.className = 'kid-step-preview';

  const previewCanvas = document.createElement('canvas');
  previewCanvas.width = 250;
  previewCanvas.height = 250;
  previewCanvas.style.width = '250px';
  previewCanvas.style.height = '250px';
  previewCanvas.className = 'kid-preview-canvas';
  previewArea.appendChild(previewCanvas);

  body.appendChild(form);
  body.appendChild(previewArea);
  stepEl.appendChild(body);

  startUnitPreview(previewCanvas, values);
  stepEl._previewCanvas = previewCanvas;
}

// ===== Step 3: Power Up (HP + Move) =====

function renderStep3(stepEl, values, onChange) {
  const title = document.createElement('div');
  title.className = 'kid-step-title';
  title.textContent = 'Power up your robot!';
  stepEl.appendChild(title);

  const body = document.createElement('div');
  body.className = 'kid-step-body';

  const form = document.createElement('div');
  form.className = 'kid-step-form';

  // HP hearts
  const hpLabel = document.createElement('div');
  hpLabel.className = 'kid-input-label';
  hpLabel.textContent = 'How tough is your robot?';
  form.appendChild(hpLabel);

  const hpRow = document.createElement('div');
  hpRow.className = 'kid-icon-row';

  function renderHearts() {
    hpRow.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
      const heart = document.createElement('span');
      heart.className = `kid-heart ${i <= values.maxHp ? 'filled' : 'empty'}`;
      heart.textContent = '\u{2764}\u{FE0F}';
      heart.addEventListener('click', () => {
        values.maxHp = i;
        playClickSound();
        renderHearts();
        onChange(values);
      });
      hpRow.appendChild(heart);
    }
  }
  renderHearts();
  form.appendChild(hpRow);

  // Move range boots
  const moveLabel = document.createElement('div');
  moveLabel.className = 'kid-input-label';
  moveLabel.style.marginTop = '24px';
  moveLabel.textContent = 'How far can it walk?';
  form.appendChild(moveLabel);

  const moveRow = document.createElement('div');
  moveRow.className = 'kid-icon-row';

  function renderBoots() {
    moveRow.innerHTML = '';
    for (let i = 1; i <= 8; i++) {
      const boot = document.createElement('span');
      boot.className = `kid-boot ${i <= values.moveRange ? 'filled' : 'empty'}`;
      boot.textContent = '\u{1F97E}';
      boot.addEventListener('click', () => {
        values.moveRange = i;
        playClickSound();
        renderBoots();
        onChange(values);
      });
      moveRow.appendChild(boot);
    }
  }
  renderBoots();
  form.appendChild(moveRow);

  // Preview
  const previewArea = document.createElement('div');
  previewArea.className = 'kid-step-preview';

  const previewCanvas = document.createElement('canvas');
  previewCanvas.width = 250;
  previewCanvas.height = 250;
  previewCanvas.style.width = '250px';
  previewCanvas.style.height = '250px';
  previewCanvas.className = 'kid-preview-canvas';
  previewArea.appendChild(previewCanvas);

  body.appendChild(form);
  body.appendChild(previewArea);
  stepEl.appendChild(body);

  startUnitPreview(previewCanvas, values);
  stepEl._previewCanvas = previewCanvas;
}

// ===== Step 4: Abilities =====

function renderStep4(stepEl, values, onChange) {
  const title = document.createElement('div');
  title.className = 'kid-step-title';
  title.textContent = 'Give it attacks!';
  stepEl.appendChild(title);

  const body = document.createElement('div');
  body.className = 'kid-step-body';

  const form = document.createElement('div');
  form.className = 'kid-step-form';

  const abilityGrid = document.createElement('div');
  abilityGrid.className = 'kid-ability-grid';

  const selectedAbilities = new Set(values.abilities || []);

  for (const [id, ability] of Object.entries(ABILITIES)) {
    const card = document.createElement('div');
    card.className = `kid-ability-card ${selectedAbilities.has(id) ? 'selected' : ''}`;
    card.innerHTML = `
      <span class="kid-ability-card-icon">${ability.icon || '\u{2694}\u{FE0F}'}</span>
      <div class="kid-ability-card-name">${ability.name}</div>
      <div class="kid-ability-card-desc">${ability.damage} damage \u{00B7} ${ability.targetType}</div>
    `;
    card.addEventListener('click', () => {
      if (selectedAbilities.has(id)) {
        selectedAbilities.delete(id);
        card.classList.remove('selected');
      } else {
        selectedAbilities.add(id);
        card.classList.add('selected');
      }
      values.abilities = Array.from(selectedAbilities);
      playClickSound();
      onChange(values);
    });
    abilityGrid.appendChild(card);
  }

  form.appendChild(abilityGrid);

  // Expandable advanced options
  const expandable = document.createElement('div');
  expandable.className = 'kid-expandable';

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'kid-expandable-toggle';
  toggleBtn.innerHTML = '\u{25B6} More options';

  const expandContent = document.createElement('div');
  expandContent.className = 'kid-expandable-content';

  // AI Priority (for enemies)
  if (values.team === 'enemy') {
    const aiLabel = document.createElement('div');
    aiLabel.className = 'kid-input-label';
    aiLabel.textContent = 'How should the enemy think?';
    expandContent.appendChild(aiLabel);

    const aiCards = document.createElement('div');
    aiCards.className = 'kid-target-cards';

    const aiOptions = [
      { value: 'nearest', icon: '\u{1F3C3}', label: 'Chase closest', desc: 'Goes after the nearest target' },
      { value: 'buildings', icon: '\u{1F3E0}', label: 'Smash buildings', desc: 'Attacks buildings first' },
      { value: 'ranged', icon: '\u{1F3AF}', label: 'Sniper', desc: 'Attacks from far away' },
    ];

    for (const opt of aiOptions) {
      const card = document.createElement('div');
      card.className = `kid-target-card ${values.aiPriority === opt.value ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="kid-target-icon">${opt.icon}</div>
        <div class="kid-target-label">${opt.label}</div>
        <div class="kid-target-desc">${opt.desc}</div>
      `;
      card.addEventListener('click', () => {
        values.aiPriority = opt.value;
        aiCards.querySelectorAll('.kid-target-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        playClickSound();
        onChange(values);
      });
      aiCards.appendChild(card);
    }

    expandContent.appendChild(aiCards);
  }

  toggleBtn.addEventListener('click', () => {
    const isOpen = expandContent.classList.toggle('open');
    toggleBtn.innerHTML = isOpen ? '\u{25BC} Fewer options' : '\u{25B6} More options';
  });

  expandable.appendChild(toggleBtn);
  expandable.appendChild(expandContent);
  form.appendChild(expandable);

  body.appendChild(form);
  stepEl.appendChild(body);
}

// ===== Helpers =====

function createColorPicker(label, value, id, onChange) {
  const picker = document.createElement('div');
  picker.className = 'kid-color-picker';

  const lbl = document.createElement('label');
  lbl.textContent = label;
  picker.appendChild(lbl);

  const input = document.createElement('input');
  input.type = 'color';
  input.id = id;
  input.value = value;
  input.addEventListener('input', () => {
    onChange(input.value);
  });
  picker.appendChild(input);

  return picker;
}

function drawPaletteMech(canvas, palette) {
  const ctx = canvas.getContext('2d');
  const s = canvas.width;

  // Background
  ctx.fillStyle = '#e8f0e8';
  ctx.fillRect(0, 0, s, s);

  const pad = s * 0.15;
  const w = s - pad * 2;
  const h = s - pad * 2;

  // Body
  ctx.fillStyle = palette.body;
  ctx.fillRect(pad, pad + h * 0.15, w, h * 0.7);

  // Head
  ctx.fillStyle = palette.accent;
  ctx.fillRect(pad + w * 0.2, pad, w * 0.6, h * 0.35);

  // Legs
  ctx.fillRect(pad + w * 0.15, pad + h * 0.85, w * 0.25, h * 0.15);
  ctx.fillRect(pad + w * 0.6, pad + h * 0.85, w * 0.25, h * 0.15);

  // Eyes
  ctx.fillStyle = '#aaddff';
  ctx.beginPath();
  ctx.arc(pad + w * 0.35, pad + h * 0.15, 3, 0, Math.PI * 2);
  ctx.arc(pad + w * 0.65, pad + h * 0.15, 3, 0, Math.PI * 2);
  ctx.fill();
}
