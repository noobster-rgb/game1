/**
 * Kid-friendly ability creation wizard — 3 steps after template selection.
 */

import { EMOJI_OPTIONS } from './kid-templates.js';
import { startAbilityPreview, stopAbilityPreview } from './kid-preview.js';
import { playClickSound, playErrorSound } from './kid-feedback.js';

/**
 * Render a wizard step into the container.
 * @param {HTMLElement} container
 * @param {number} step - 1, 2, or 3
 * @param {object} values - current wizard values
 * @param {function} onChange - called when values change (for preview updates)
 */
export function renderAbilityStep(container, step, values, onChange) {
  container.innerHTML = '';

  const stepEl = document.createElement('div');
  stepEl.className = 'kid-step';

  if (step === 1) renderStep1(stepEl, values, onChange);
  else if (step === 2) renderStep2(stepEl, values, onChange);
  else if (step === 3) renderStep3(stepEl, values, onChange);

  container.appendChild(stepEl);
}

/** Read current form values from the active step. */
export function readAbilityStepValues(container, step, currentValues) {
  const vals = { ...currentValues };

  if (step === 1) {
    const nameInput = container.querySelector('#kid-ab-name');
    if (nameInput) vals.name = nameInput.value.trim();
    // Icon is set via click handler, already in vals
  } else if (step === 2) {
    // targetType, damage, range set via click/spinner handlers, already in vals
  } else if (step === 3) {
    const descInput = container.querySelector('#kid-ab-desc');
    if (descInput) vals.description = descInput.value.trim();
  }

  return vals;
}

/** Validate a step. Returns error message or null. */
export function validateAbilityStep(step, values) {
  if (step === 1 && !values.name) {
    return 'name';
  }
  return null;
}

// ===== Step 1: Name + Icon =====

function renderStep1(stepEl, values, onChange) {
  const title = document.createElement('div');
  title.className = 'kid-step-title';
  title.textContent = 'Give your attack a cool name!';
  stepEl.appendChild(title);

  const body = document.createElement('div');
  body.className = 'kid-step-body';

  const form = document.createElement('div');
  form.className = 'kid-step-form';

  // Name input
  const nameLabel = document.createElement('div');
  nameLabel.className = 'kid-input-label';
  nameLabel.textContent = 'Attack Name';
  form.appendChild(nameLabel);

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'kid-input';
  nameInput.id = 'kid-ab-name';
  nameInput.placeholder = 'Type a name...';
  nameInput.value = values.name || '';
  nameInput.maxLength = 30;
  nameInput.addEventListener('input', () => {
    values.name = nameInput.value.trim();
    onChange(values);
  });
  form.appendChild(nameInput);

  // Emoji picker
  const emojiLabel = document.createElement('div');
  emojiLabel.className = 'kid-input-label';
  emojiLabel.style.marginTop = '20px';
  emojiLabel.textContent = 'Pick a picture for it!';
  form.appendChild(emojiLabel);

  const emojiGrid = document.createElement('div');
  emojiGrid.className = 'kid-emoji-grid';

  for (const emoji of EMOJI_OPTIONS) {
    const btn = document.createElement('button');
    btn.className = `kid-emoji-btn ${values.icon === emoji ? 'selected' : ''}`;
    btn.textContent = emoji;
    btn.addEventListener('click', () => {
      values.icon = emoji;
      emojiGrid.querySelectorAll('.kid-emoji-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      playClickSound();
      onChange(values);
    });
    emojiGrid.appendChild(btn);
  }

  form.appendChild(emojiGrid);
  body.appendChild(form);
  stepEl.appendChild(body);
}

// ===== Step 2: Target Type + Damage + Range =====

function renderStep2(stepEl, values, onChange) {
  const title = document.createElement('div');
  title.className = 'kid-step-title';
  title.textContent = 'How does it work?';
  stepEl.appendChild(title);

  const body = document.createElement('div');
  body.className = 'kid-step-body';

  const form = document.createElement('div');
  form.className = 'kid-step-form';

  // Target type cards
  const ttLabel = document.createElement('div');
  ttLabel.className = 'kid-input-label';
  ttLabel.textContent = 'Pick an attack style';
  form.appendChild(ttLabel);

  const targetCards = document.createElement('div');
  targetCards.className = 'kid-target-cards';

  const types = [
    { type: 'melee', icon: '\u{1F44A}', label: 'Up Close', desc: 'Hit enemies right next to you' },
    { type: 'ranged', icon: '\u{1F3AF}', label: 'Far Away', desc: 'Attack from a distance' },
    { type: 'line', icon: '\u{1F4A5}', label: 'In a Line', desc: 'Zap everything in a row' },
  ];

  for (const tt of types) {
    const card = document.createElement('div');
    card.className = `kid-target-card ${values.targetType === tt.type ? 'selected' : ''}`;
    card.dataset.type = tt.type;
    card.innerHTML = `
      <div class="kid-target-icon">${tt.icon}</div>
      <div class="kid-target-label">${tt.label}</div>
      <div class="kid-target-desc">${tt.desc}</div>
    `;
    card.addEventListener('click', () => {
      values.targetType = tt.type;
      if (tt.type === 'melee') {
        values.range = 1;
        values.minRange = 0;
      }
      targetCards.querySelectorAll('.kid-target-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      playClickSound();
      updateRangeVisibility();
      onChange(values);
    });
    targetCards.appendChild(card);
  }

  form.appendChild(targetCards);

  // Damage spinner
  const dmgLabel = document.createElement('div');
  dmgLabel.className = 'kid-input-label';
  dmgLabel.style.marginTop = '20px';
  dmgLabel.textContent = 'How hard does it hit?';
  form.appendChild(dmgLabel);

  form.appendChild(createSpinner(values, 'damage', 0, 10, onChange));

  // Range spinner (hidden for melee)
  const rangeSection = document.createElement('div');
  rangeSection.id = 'kid-range-section';

  const rangeLabel = document.createElement('div');
  rangeLabel.className = 'kid-input-label';
  rangeLabel.style.marginTop = '20px';
  rangeLabel.textContent = 'How far can it reach?';
  rangeSection.appendChild(rangeLabel);

  rangeSection.appendChild(createSpinner(values, 'range', 1, 8, onChange));

  form.appendChild(rangeSection);

  function updateRangeVisibility() {
    rangeSection.style.display = values.targetType === 'melee' ? 'none' : 'block';
  }
  updateRangeVisibility();

  // Preview area
  const previewArea = document.createElement('div');
  previewArea.className = 'kid-step-preview';

  const previewCanvas = document.createElement('canvas');
  previewCanvas.width = 350;
  previewCanvas.height = 350;
  previewCanvas.style.width = '350px';
  previewCanvas.style.height = '350px';
  previewCanvas.className = 'kid-preview-canvas';
  previewArea.appendChild(previewCanvas);

  body.appendChild(form);
  body.appendChild(previewArea);
  stepEl.appendChild(body);

  // Start animated preview
  startAbilityPreview(previewCanvas, values);

  // Store canvas ref for cleanup
  stepEl._previewCanvas = previewCanvas;
}

// ===== Step 3: Extra Powers =====

function renderStep3(stepEl, values, onChange) {
  const title = document.createElement('div');
  title.className = 'kid-step-title';
  title.textContent = 'Extra Powers!';
  stepEl.appendChild(title);

  const body = document.createElement('div');
  body.className = 'kid-step-body';

  const form = document.createElement('div');
  form.className = 'kid-step-form';

  // Push toggle
  form.appendChild(createToggle('Does it push enemies?', values.push, (val) => {
    values.push = val;
    onChange(values);
  }));

  // AoE toggle
  form.appendChild(createToggle('Does it hit everything nearby?', values.aoe, (val) => {
    values.aoe = val;
    onChange(values);
  }));

  // VFX picker
  const vfxLabel = document.createElement('div');
  vfxLabel.className = 'kid-input-label';
  vfxLabel.style.marginTop = '20px';
  vfxLabel.textContent = 'What does it look like?';
  form.appendChild(vfxLabel);

  const vfxRow = document.createElement('div');
  vfxRow.className = 'kid-picker-row';

  const vfxOptions = [
    { type: '', icon: '\u{2728}', label: 'Auto' },
    { type: 'slash', icon: '\u{2694}\u{FE0F}', label: 'Slash' },
    { type: 'beam', icon: '\u{1F4A0}', label: 'Beam' },
    { type: 'projectile', icon: '\u{1F680}', label: 'Shot' },
    { type: 'explosion', icon: '\u{1F4A5}', label: 'Boom' },
  ];

  const currentVfx = values.vfx?.type || '';

  for (const opt of vfxOptions) {
    const btn = document.createElement('button');
    btn.className = `kid-picker-btn ${currentVfx === opt.type ? 'selected' : ''}`;
    btn.innerHTML = `<span class="kid-picker-btn-icon">${opt.icon}</span>${opt.label}`;
    btn.addEventListener('click', () => {
      if (opt.type) {
        values.vfx = { type: opt.type, color: values.vfx?.color || '#ffffff' };
      } else {
        values.vfx = undefined;
      }
      vfxRow.querySelectorAll('.kid-picker-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      playClickSound();
      onChange(values);
    });
    vfxRow.appendChild(btn);
  }

  form.appendChild(vfxRow);

  // Sound picker
  const sndLabel = document.createElement('div');
  sndLabel.className = 'kid-input-label';
  sndLabel.style.marginTop = '16px';
  sndLabel.textContent = 'What does it sound like?';
  form.appendChild(sndLabel);

  const sndRow = document.createElement('div');
  sndRow.className = 'kid-picker-row';

  const sndOptions = [
    { key: '', icon: '\u{1F50A}', label: 'Auto' },
    { key: 'melee', icon: '\u{1F44A}', label: 'Punch' },
    { key: 'cannon', icon: '\u{1F4A3}', label: 'Boom' },
    { key: 'artillery', icon: '\u{1F680}', label: 'Blast' },
  ];

  for (const opt of sndOptions) {
    const btn = document.createElement('button');
    btn.className = `kid-picker-btn ${(values.sound || '') === opt.key ? 'selected' : ''}`;
    btn.innerHTML = `<span class="kid-picker-btn-icon">${opt.icon}</span>${opt.label}`;
    btn.addEventListener('click', () => {
      values.sound = opt.key || undefined;
      sndRow.querySelectorAll('.kid-picker-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      playClickSound();
      onChange(values);
    });
    sndRow.appendChild(btn);
  }

  form.appendChild(sndRow);

  // Expandable description
  const expandable = document.createElement('div');
  expandable.className = 'kid-expandable';

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'kid-expandable-toggle';
  toggleBtn.innerHTML = '\u{25B6} Show more options';

  const expandContent = document.createElement('div');
  expandContent.className = 'kid-expandable-content';

  const descLabel = document.createElement('div');
  descLabel.className = 'kid-input-label';
  descLabel.textContent = 'Describe your attack';
  expandContent.appendChild(descLabel);

  const descInput = document.createElement('textarea');
  descInput.className = 'kid-input';
  descInput.id = 'kid-ab-desc';
  descInput.style.height = '80px';
  descInput.style.fontSize = '18px';
  descInput.placeholder = 'What does this attack do?';
  descInput.value = values.description || '';
  descInput.addEventListener('input', () => {
    values.description = descInput.value.trim();
  });
  expandContent.appendChild(descInput);

  toggleBtn.addEventListener('click', () => {
    const isOpen = expandContent.classList.toggle('open');
    toggleBtn.innerHTML = isOpen ? '\u{25BC} Hide more options' : '\u{25B6} Show more options';
  });

  expandable.appendChild(toggleBtn);
  expandable.appendChild(expandContent);
  form.appendChild(expandable);

  // Preview area
  const previewArea = document.createElement('div');
  previewArea.className = 'kid-step-preview';

  const previewCanvas = document.createElement('canvas');
  previewCanvas.width = 350;
  previewCanvas.height = 350;
  previewCanvas.style.width = '350px';
  previewCanvas.style.height = '350px';
  previewCanvas.className = 'kid-preview-canvas';
  previewArea.appendChild(previewCanvas);

  body.appendChild(form);
  body.appendChild(previewArea);
  stepEl.appendChild(body);

  startAbilityPreview(previewCanvas, values);
  stepEl._previewCanvas = previewCanvas;
}

// ===== Helpers =====

function createSpinner(values, key, min, max, onChange) {
  const spinner = document.createElement('div');
  spinner.className = 'kid-spinner';

  const minusBtn = document.createElement('button');
  minusBtn.className = 'kid-spinner-btn';
  minusBtn.textContent = '\u{2212}';

  const valueEl = document.createElement('div');
  valueEl.className = 'kid-spinner-value';
  valueEl.textContent = values[key] ?? 1;

  const plusBtn = document.createElement('button');
  plusBtn.className = 'kid-spinner-btn';
  plusBtn.textContent = '+';

  function update(delta) {
    values[key] = Math.max(min, Math.min(max, (values[key] ?? 1) + delta));
    valueEl.textContent = values[key];
    // Bump animation
    valueEl.classList.add('bump');
    setTimeout(() => valueEl.classList.remove('bump'), 150);
    playClickSound();
    onChange(values);
  }

  minusBtn.addEventListener('click', () => update(-1));
  plusBtn.addEventListener('click', () => update(1));

  spinner.appendChild(minusBtn);
  spinner.appendChild(valueEl);
  spinner.appendChild(plusBtn);

  return spinner;
}

function createToggle(label, checked, onToggle) {
  const row = document.createElement('div');
  row.className = 'kid-toggle-row';

  const toggle = document.createElement('label');
  toggle.className = 'kid-toggle';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = !!checked;
  input.addEventListener('change', () => {
    playClickSound();
    onToggle(input.checked);
  });

  const track = document.createElement('span');
  track.className = 'kid-toggle-track';

  const thumb = document.createElement('span');
  thumb.className = 'kid-toggle-thumb';

  toggle.appendChild(input);
  toggle.appendChild(track);
  toggle.appendChild(thumb);

  const labelEl = document.createElement('span');
  labelEl.className = 'kid-toggle-label';
  labelEl.textContent = label;

  row.appendChild(toggle);
  row.appendChild(labelEl);

  return row;
}
