/**
 * Kid-friendly editor wizard — main orchestrator.
 * Manages the dual-mode toggle, wizard state, navigation, and template selection.
 */

import { ABILITIES } from '../data/abilities.js';
import { UNIT_TYPES } from '../data/units.js';
import { initRegistry } from '../data/registry.js';
import { ABILITY_TEMPLATES, UNIT_TEMPLATES } from './kid-templates.js';
import { renderAbilityStep, readAbilityStepValues, validateAbilityStep } from './kid-ability-wizard.js';
import { renderUnitStep, readUnitStepValues, validateUnitStep } from './kid-unit-wizard.js';
import { stopAbilityPreview } from './kid-preview.js';
import { stopUnitPreview } from './kid-preview.js';
import { celebrate, playClickSound, playErrorSound, showKidToast } from './kid-feedback.js';

let overlay = null;
let cssLoaded = false;

let wizardState = {
  tab: 'ability',       // 'ability' | 'unit'
  step: 0,              // 0 = templates, 1-3/4 = wizard steps
  values: {},
  editingId: null,       // non-null when editing existing item
};

function ensureCSS() {
  if (cssLoaded) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'js/editor/kid-editor.css';
  document.head.appendChild(link);
  cssLoaded = true;
}

/**
 * Build and show the kid editor overlay.
 * @param {function} onSwitchMode - callback to switch to pro mode
 * @param {function} onClose - callback to close editor
 */
export function buildKidEditor(onSwitchMode, onClose) {
  ensureCSS();

  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'kid-editor-overlay';

  // Top bar
  const topbar = document.createElement('div');
  topbar.className = 'kid-topbar';

  const title = document.createElement('div');
  title.className = 'kid-topbar-title';
  title.textContent = '\u{1F3AE} Game Workshop';
  topbar.appendChild(title);

  const actions = document.createElement('div');
  actions.className = 'kid-topbar-actions';

  const modeBtn = document.createElement('button');
  modeBtn.className = 'kid-mode-toggle';
  modeBtn.textContent = '\u{2699}\u{FE0F} Pro Mode';
  modeBtn.addEventListener('click', () => {
    cleanup();
    onSwitchMode();
  });
  actions.appendChild(modeBtn);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'kid-close-btn';
  closeBtn.textContent = '\u{2715}';
  closeBtn.addEventListener('click', () => {
    cleanup();
    onClose();
  });
  actions.appendChild(closeBtn);

  topbar.appendChild(actions);
  overlay.appendChild(topbar);

  // Tabs
  const tabs = document.createElement('div');
  tabs.className = 'kid-tabs';
  tabs.id = 'kid-tabs';
  overlay.appendChild(tabs);

  // Existing items strip
  const strip = document.createElement('div');
  strip.className = 'kid-items-strip';
  strip.id = 'kid-items-strip';
  overlay.appendChild(strip);

  // Main wizard content
  const content = document.createElement('div');
  content.className = 'kid-wizard-content';
  content.id = 'kid-wizard-content';
  overlay.appendChild(content);

  // Navigation
  const nav = document.createElement('div');
  nav.className = 'kid-nav';
  nav.id = 'kid-nav';
  overlay.appendChild(nav);

  document.body.appendChild(overlay);

  // Reset state
  wizardState = { tab: 'ability', step: 0, values: {}, editingId: null };

  renderAll();
}

export function removeKidEditor() {
  cleanup();
  if (overlay) {
    overlay.remove();
    overlay = null;
  }
}

function cleanup() {
  stopAbilityPreview();
  stopUnitPreview();
}

function getMaxSteps() {
  return wizardState.tab === 'ability' ? 3 : 4;
}

function renderAll() {
  renderTabs();
  renderItemStrip();
  renderContent();
  renderNav();
}

// ===== Tabs =====

function renderTabs() {
  const tabs = document.getElementById('kid-tabs');
  if (!tabs) return;

  const tabData = [
    { key: 'ability', icon: '\u{2694}\u{FE0F}', label: 'Make an Attack' },
    { key: 'unit', icon: '\u{1F916}', label: 'Build a Robot' },
  ];

  tabs.innerHTML = '';
  for (const t of tabData) {
    const btn = document.createElement('button');
    btn.className = `kid-tab ${wizardState.tab === t.key ? 'active' : ''}`;
    btn.innerHTML = `<span class="kid-tab-icon">${t.icon}</span>${t.label}`;
    btn.addEventListener('click', () => {
      if (wizardState.tab !== t.key) {
        cleanup();
        wizardState.tab = t.key;
        wizardState.step = 0;
        wizardState.values = {};
        wizardState.editingId = null;
        renderAll();
      }
    });
    tabs.appendChild(btn);
  }
}

// ===== Existing items strip =====

function renderItemStrip() {
  const strip = document.getElementById('kid-items-strip');
  if (!strip) return;
  strip.innerHTML = '';

  const items = wizardState.tab === 'ability' ? ABILITIES : UNIT_TYPES;

  for (const [id, item] of Object.entries(items)) {
    const card = document.createElement('div');
    card.className = `kid-item-card ${wizardState.editingId === id ? 'active' : ''}`;

    const icon = document.createElement('span');
    icon.className = 'kid-item-card-icon';
    if (wizardState.tab === 'ability') {
      icon.textContent = item.icon || '\u{2694}\u{FE0F}';
    } else {
      icon.textContent = item.team === 'enemy' ? '\u{1F41B}' : '\u{1F916}';
    }
    card.appendChild(icon);

    const name = document.createElement('span');
    name.className = 'kid-item-card-name';
    name.textContent = item.name || id;
    card.appendChild(name);

    card.addEventListener('click', () => {
      cleanup();
      wizardState.editingId = id;
      wizardState.step = 1;

      // Clone the item data for editing
      if (wizardState.tab === 'ability') {
        wizardState.values = {
          name: item.name || '',
          icon: item.icon || '',
          damage: item.damage ?? 1,
          targetType: item.targetType || 'melee',
          range: item.range ?? 1,
          minRange: item.minRange ?? 0,
          push: !!item.push,
          pushDirection: item.pushDirection,
          aoe: !!item.aoe,
          description: item.description || '',
          vfx: item.vfx ? { ...item.vfx } : undefined,
          sound: item.sound,
        };
      } else {
        const abilityIds = (item.abilities || []).map(a => typeof a === 'string' ? a : a.id);
        wizardState.values = {
          name: item.name || '',
          team: item.team || 'player',
          maxHp: item.maxHp ?? 3,
          moveRange: item.moveRange ?? 3,
          abilities: abilityIds,
          sprite: item.sprite ? { ...item.sprite } : { body: '#4488cc', accent: '#2266aa', symbol: '?' },
          aiPriority: item.aiPriority,
        };
      }

      renderAll();
    });

    strip.appendChild(card);
  }
}

// ===== Main content =====

function renderContent() {
  const content = document.getElementById('kid-wizard-content');
  if (!content) return;
  content.innerHTML = '';

  if (wizardState.step === 0) {
    renderTemplateSelection(content);
  } else {
    // Step indicator
    renderStepIndicator(content);

    // Step content
    const stepContainer = document.createElement('div');
    stepContainer.id = 'kid-step-container';
    stepContainer.style.flex = '1';
    stepContainer.style.display = 'flex';
    stepContainer.style.flexDirection = 'column';
    content.appendChild(stepContainer);

    const onChange = (values) => {
      wizardState.values = values;
      // Re-render preview if the step has one
      // Preview updates are handled within the step renderers
    };

    if (wizardState.tab === 'ability') {
      renderAbilityStep(stepContainer, wizardState.step, wizardState.values, onChange);
    } else {
      renderUnitStep(stepContainer, wizardState.step, wizardState.values, onChange);
    }
  }
}

function renderTemplateSelection(content) {
  const title = document.createElement('div');
  title.className = 'kid-step-title';
  title.textContent = wizardState.tab === 'ability'
    ? 'What kind of attack do you want to make?'
    : 'What kind of robot do you want to build?';
  content.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'kid-template-grid';

  const templates = wizardState.tab === 'ability' ? ABILITY_TEMPLATES : UNIT_TEMPLATES;

  for (const tmpl of templates) {
    const card = document.createElement('div');
    card.className = 'kid-template-card';
    card.innerHTML = `
      <div class="kid-template-icon">${tmpl.icon}</div>
      <div class="kid-template-label">${tmpl.label}</div>
      <div class="kid-template-desc">${tmpl.description}</div>
    `;
    card.addEventListener('click', () => {
      wizardState.values = structuredClone(tmpl.data);
      wizardState.step = 1;
      wizardState.editingId = null;
      playClickSound();
      renderAll();
    });
    grid.appendChild(card);
  }

  content.appendChild(grid);
}

function renderStepIndicator(content) {
  const maxSteps = getMaxSteps();
  const indicator = document.createElement('div');
  indicator.className = 'kid-step-indicator';

  for (let i = 1; i <= maxSteps; i++) {
    const dot = document.createElement('div');
    dot.className = 'kid-step-dot';
    if (i === wizardState.step) dot.classList.add('active');
    else if (i < wizardState.step) dot.classList.add('completed');
    dot.textContent = i < wizardState.step ? '\u{2713}' : i;
    indicator.appendChild(dot);

    if (i < maxSteps) {
      const line = document.createElement('div');
      line.className = `kid-step-line ${i < wizardState.step ? 'completed' : ''}`;
      indicator.appendChild(line);
    }
  }

  content.appendChild(indicator);
}

// ===== Navigation =====

function renderNav() {
  const nav = document.getElementById('kid-nav');
  if (!nav) return;
  nav.innerHTML = '';

  const maxSteps = getMaxSteps();
  const isTemplateStep = wizardState.step === 0;
  const isLastStep = wizardState.step === maxSteps;
  const isEditing = !!wizardState.editingId;

  if (isTemplateStep) {
    // No nav on template selection
    nav.style.display = 'none';
    return;
  }

  nav.style.display = 'flex';

  // Back button
  const backBtn = document.createElement('button');
  backBtn.className = 'kid-nav-btn back';
  backBtn.innerHTML = '\u{2190} Back';
  backBtn.addEventListener('click', () => {
    cleanup();
    // Save current step values before going back
    saveCurrentStepValues();
    wizardState.step--;
    if (wizardState.step === 0 && isEditing) {
      wizardState.step = 1; // Don't go to templates when editing
    }
    playClickSound();
    renderContent();
    renderNav();
  });
  nav.appendChild(backBtn);

  // Next / Create button
  if (isLastStep) {
    const createBtn = document.createElement('button');
    createBtn.className = `kid-nav-btn ${isEditing ? 'next' : 'create'}`;
    createBtn.innerHTML = isEditing
      ? '\u{1F4BE} Save Changes'
      : '\u{2728} Create!';
    createBtn.addEventListener('click', () => {
      if (!validateCurrentStep()) return;
      saveCurrentStepValues();
      applyItem();
    });
    nav.appendChild(createBtn);
  } else {
    const nextBtn = document.createElement('button');
    nextBtn.className = 'kid-nav-btn next';
    nextBtn.innerHTML = 'Next \u{2192}';
    nextBtn.addEventListener('click', () => {
      if (!validateCurrentStep()) return;
      cleanup();
      saveCurrentStepValues();
      wizardState.step++;
      playClickSound();
      renderContent();
      renderNav();
    });
    nav.appendChild(nextBtn);
  }
}

function saveCurrentStepValues() {
  const container = document.getElementById('kid-step-container');
  if (!container) return;

  if (wizardState.tab === 'ability') {
    wizardState.values = readAbilityStepValues(container, wizardState.step, wizardState.values);
  } else {
    wizardState.values = readUnitStepValues(container, wizardState.step, wizardState.values);
  }
}

function validateCurrentStep() {
  const container = document.getElementById('kid-step-container');
  if (!container) return true;

  // Read latest values
  saveCurrentStepValues();

  let errorField;
  if (wizardState.tab === 'ability') {
    errorField = validateAbilityStep(wizardState.step, wizardState.values);
  } else {
    errorField = validateUnitStep(wizardState.step, wizardState.values);
  }

  if (errorField === 'name') {
    const nameInput = container.querySelector('#kid-ab-name, #kid-u-name');
    if (nameInput) {
      nameInput.classList.add('shake');
      setTimeout(() => nameInput.classList.remove('shake'), 300);

      // Speech bubble
      const bubble = document.createElement('div');
      bubble.className = 'kid-speech-bubble';
      bubble.textContent = "Don't forget to give it a name!";
      bubble.style.left = nameInput.offsetLeft + 'px';
      bubble.style.top = (nameInput.offsetTop - 40) + 'px';
      nameInput.parentNode.style.position = 'relative';
      nameInput.parentNode.appendChild(bubble);
      setTimeout(() => bubble.remove(), 2000);
    }
    playErrorSound();
    return false;
  }

  return true;
}

function applyItem() {
  const values = wizardState.values;
  const isEditing = !!wizardState.editingId;

  if (wizardState.tab === 'ability') {
    // Generate ID from name
    const id = isEditing ? wizardState.editingId : toCamelCase(values.name);
    const deduped = isEditing ? id : deduplicateId(id, ABILITIES);

    const ability = {
      id: deduped,
      name: values.name,
      description: values.description || '',
      damage: values.damage ?? 1,
      targetType: values.targetType || 'melee',
      range: values.range ?? 1,
      minRange: values.minRange ?? 0,
      push: !!values.push,
      aoe: !!values.aoe,
      icon: values.icon || undefined,
    };

    if (values.push && values.pushDirection) {
      ability.pushDirection = values.pushDirection;
    }
    if (values.vfx) ability.vfx = values.vfx;
    if (values.sound) ability.sound = values.sound;

    ABILITIES[deduped] = ability;

    if (isEditing && wizardState.editingId !== deduped) {
      delete ABILITIES[wizardState.editingId];
    }

    if (isEditing) {
      showKidToast(`Saved ${values.name}!`, values.icon || '\u{2694}\u{FE0F}');
      playClickSound();
    } else {
      celebrate(values.name, values.icon || '\u{2694}\u{FE0F}');
    }

  } else {
    // Generate type ID from name
    const typeId = isEditing ? wizardState.editingId : toCamelCase(values.name);
    const deduped = isEditing ? typeId : deduplicateId(typeId, UNIT_TYPES);

    const unit = {
      type: deduped,
      name: values.name,
      team: values.team || 'player',
      maxHp: values.maxHp ?? 3,
      moveRange: values.moveRange ?? 3,
      abilities: values.abilities || [],
      sprite: values.sprite || { body: '#4488cc', accent: '#2266aa', symbol: '?' },
    };

    if (values.team === 'enemy') {
      unit.aiPriority = values.aiPriority || 'nearest';
    }

    UNIT_TYPES[deduped] = unit;
    initRegistry();

    if (isEditing && wizardState.editingId !== deduped) {
      delete UNIT_TYPES[wizardState.editingId];
    }

    const icon = values.team === 'enemy' ? '\u{1F41B}' : '\u{1F916}';
    if (isEditing) {
      showKidToast(`Saved ${values.name}!`, icon);
      playClickSound();
    } else {
      celebrate(values.name, icon);
    }
  }

  // Show summary
  cleanup();
  showSummary();
}

function showSummary() {
  const content = document.getElementById('kid-wizard-content');
  if (!content) return;
  content.innerHTML = '';

  const summary = document.createElement('div');
  summary.className = 'kid-summary';

  const icon = document.createElement('div');
  icon.className = 'kid-summary-icon';
  if (wizardState.tab === 'ability') {
    icon.textContent = wizardState.values.icon || '\u{2694}\u{FE0F}';
  } else {
    icon.textContent = wizardState.values.team === 'enemy' ? '\u{1F41B}' : '\u{1F916}';
  }
  summary.appendChild(icon);

  const title = document.createElement('div');
  title.className = 'kid-summary-title';
  title.textContent = wizardState.editingId ? 'Changes Saved!' : 'Created!';
  summary.appendChild(title);

  const nameEl = document.createElement('div');
  nameEl.style.fontSize = '24px';
  nameEl.style.fontWeight = '700';
  nameEl.textContent = wizardState.values.name;
  summary.appendChild(nameEl);

  const actions = document.createElement('div');
  actions.className = 'kid-summary-actions';

  const makeMore = document.createElement('button');
  makeMore.className = 'kid-summary-btn primary';
  makeMore.textContent = '\u{2795} Make Another';
  makeMore.addEventListener('click', () => {
    wizardState.step = 0;
    wizardState.values = {};
    wizardState.editingId = null;
    renderAll();
  });
  actions.appendChild(makeMore);

  const done = document.createElement('button');
  done.className = 'kid-summary-btn secondary';
  done.textContent = 'Done';
  done.addEventListener('click', () => {
    const nav = document.getElementById('kid-nav');
    if (nav) nav.style.display = 'none';
    removeKidEditor();
  });
  actions.appendChild(done);

  summary.appendChild(actions);
  content.appendChild(summary);

  // Hide nav
  const nav = document.getElementById('kid-nav');
  if (nav) nav.style.display = 'none';

  // Refresh item strip
  renderItemStrip();
}

// ===== Utility =====

function toCamelCase(str) {
  if (!str) return 'unnamed';
  return str
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .map((word, i) => {
      if (!word) return '';
      return i === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

function deduplicateId(id, collection) {
  if (!id) id = 'unnamed';
  if (!collection[id]) return id;
  let i = 2;
  while (collection[id + i]) i++;
  return id + i;
}
