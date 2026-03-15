import { ABILITIES } from '../data/abilities.js';
import { UNIT_TYPES } from '../data/units.js';
import { renderAbilityForm, getAbilityFormValues } from './ability-form.js';
import { renderUnitForm, getUnitFormValues } from './unit-form.js';
import { exportAbilitiesJS, exportUnitsJS, copyToClipboard } from './export.js';
import { initRegistry } from '../data/registry.js';
import { buildKidEditor, removeKidEditor } from './kid-wizard.js';

let overlay = null;
let currentTab = 'abilities'; // 'abilities' | 'units'
let currentItemId = null;
let cssLoaded = false;
let editorMode = 'kid'; // 'kid' | 'pro'

function ensureCSS() {
  if (cssLoaded) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'js/editor/editor.css';
  document.head.appendChild(link);
  cssLoaded = true;
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'editor-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

function getItems() {
  return currentTab === 'abilities' ? ABILITIES : UNIT_TYPES;
}

export function toggleEditor() {
  // Close if already open (either mode)
  if (overlay || document.getElementById('kid-editor-overlay')) {
    if (overlay) { overlay.remove(); overlay = null; }
    removeKidEditor();
    return;
  }

  if (editorMode === 'kid') {
    buildKidEditor(
      () => { removeKidEditor(); editorMode = 'pro'; ensureCSS(); buildEditor(); },
      () => toggleEditor()
    );
  } else {
    ensureCSS();
    buildEditor();
  }
}

function buildEditor() {
  overlay = document.createElement('div');
  overlay.id = 'editor-overlay';

  // Sidebar
  const sidebar = document.createElement('div');
  sidebar.className = 'editor-sidebar';

  // Tabs
  const tabs = document.createElement('div');
  tabs.className = 'editor-tabs';
  tabs.innerHTML = `
    <button class="editor-tab ${currentTab === 'abilities' ? 'active' : ''}" data-tab="abilities">Abilities</button>
    <button class="editor-tab ${currentTab === 'units' ? 'active' : ''}" data-tab="units">Units</button>
  `;
  tabs.addEventListener('click', (e) => {
    const tab = e.target.dataset.tab;
    if (tab) {
      currentTab = tab;
      currentItemId = null;
      rebuildSidebar();
      renderMainArea();
    }
  });
  sidebar.appendChild(tabs);

  // List header + new button
  const listHeader = document.createElement('div');
  listHeader.className = 'editor-list-header';
  listHeader.id = 'editor-list-header';
  sidebar.appendChild(listHeader);

  // Item list
  const list = document.createElement('div');
  list.className = 'editor-list';
  list.id = 'editor-list';
  sidebar.appendChild(list);

  overlay.appendChild(sidebar);

  // Main area
  const main = document.createElement('div');
  main.className = 'editor-main';
  main.id = 'editor-main';
  overlay.appendChild(main);

  document.body.appendChild(overlay);

  rebuildSidebar();
  renderMainArea();
}

function addModeToggleToToolbar(toolbar) {
  const btn = document.createElement('button');
  btn.className = 'editor-btn editor-btn-export';
  btn.textContent = '\u{1F3AE} Fun Mode';
  btn.addEventListener('click', () => {
    if (overlay) { overlay.remove(); overlay = null; }
    editorMode = 'kid';
    buildKidEditor(
      () => { removeKidEditor(); editorMode = 'pro'; ensureCSS(); buildEditor(); },
      () => toggleEditor()
    );
  });
  toolbar.appendChild(btn);
}

function rebuildSidebar() {
  const items = getItems();
  const list = document.getElementById('editor-list');
  const header = document.getElementById('editor-list-header');

  // Header
  header.innerHTML = `
    <span>${Object.keys(items).length} ${currentTab}</span>
    <button class="editor-new-btn" id="editor-new-btn">+ New</button>
  `;
  header.querySelector('#editor-new-btn').addEventListener('click', () => {
    currentItemId = null;
    renderMainArea();
  });

  // List items
  list.innerHTML = '';
  for (const [id, item] of Object.entries(items)) {
    const el = document.createElement('div');
    el.className = `editor-list-item ${id === currentItemId ? 'active' : ''}`;
    if (currentTab === 'abilities') {
      el.innerHTML = `
        <div class="item-name">${item.icon || ''} ${item.name || id}</div>
        <div class="item-sub">${item.targetType} | ${item.damage} dmg</div>
      `;
    } else {
      el.innerHTML = `
        <div class="item-name">${item.name || id}</div>
        <div class="item-sub">${item.team} | HP:${item.maxHp} | MV:${item.moveRange}</div>
      `;
    }
    el.addEventListener('click', () => {
      currentItemId = id;
      rebuildSidebar();
      renderMainArea();
    });
    list.appendChild(el);
  }
}

function renderMainArea() {
  const main = document.getElementById('editor-main');
  const items = getItems();
  const item = currentItemId ? items[currentItemId] : null;
  const isNew = !item;

  // Toolbar
  main.innerHTML = '';

  const toolbar = document.createElement('div');
  toolbar.className = 'editor-toolbar';

  const title = document.createElement('h2');
  title.textContent = isNew
    ? `New ${currentTab === 'abilities' ? 'Ability' : 'Unit'}`
    : `Edit: ${item.name || currentItemId}`;
  toolbar.appendChild(title);

  const actions = document.createElement('div');
  actions.className = 'editor-toolbar-actions';

  // Apply button
  const applyBtn = document.createElement('button');
  applyBtn.className = 'editor-btn editor-btn-apply';
  applyBtn.textContent = isNew ? 'Create' : 'Apply';
  actions.appendChild(applyBtn);

  // Export button
  const exportBtn = document.createElement('button');
  exportBtn.className = 'editor-btn editor-btn-export';
  exportBtn.textContent = 'Export All';
  actions.appendChild(exportBtn);

  // Delete button (only for existing items)
  if (!isNew) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'editor-btn editor-btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      delete items[currentItemId];
      currentItemId = null;
      rebuildSidebar();
      renderMainArea();
      showToast(`Deleted from live game.`);
    });
    actions.appendChild(deleteBtn);
  }

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'editor-btn editor-btn-close';
  closeBtn.textContent = 'Close [F2]';
  closeBtn.addEventListener('click', toggleEditor);
  actions.appendChild(closeBtn);

  toolbar.appendChild(actions);
  addModeToggleToToolbar(actions);
  main.appendChild(toolbar);

  // Form area
  const formArea = document.createElement('div');
  formArea.className = 'editor-form-area';

  const formContainer = document.createElement('div');
  formContainer.style.flex = '1';
  formArea.appendChild(formContainer);

  // Preview
  const previewArea = document.createElement('div');
  previewArea.className = 'editor-preview';
  const previewTitle = document.createElement('h3');
  previewTitle.textContent = 'Preview';
  previewArea.appendChild(previewTitle);

  const previewCanvas = document.createElement('canvas');
  const previewSize = currentTab === 'abilities' ? 210 : 120;
  previewCanvas.width = previewSize;
  previewCanvas.height = previewSize;
  previewCanvas.style.width = `${previewSize}px`;
  previewCanvas.style.height = `${previewSize}px`;
  previewArea.appendChild(previewCanvas);
  formArea.appendChild(previewArea);

  main.appendChild(formArea);

  // Render the appropriate form
  const defaults = currentTab === 'abilities'
    ? { id: '', name: '', description: '', damage: 1, targetType: 'melee', range: 1, minRange: 0, push: false, aoe: false, icon: '' }
    : { type: '', name: '', team: 'player', maxHp: 3, moveRange: 3, abilities: [], sprite: { body: '#4488cc', accent: '#2266aa', symbol: '?' } };

  if (currentTab === 'abilities') {
    renderAbilityForm(formContainer, item || defaults, previewCanvas);
  } else {
    renderUnitForm(formContainer, item || defaults, ABILITIES, previewCanvas);
  }

  // Apply handler
  applyBtn.addEventListener('click', () => {
    if (currentTab === 'abilities') {
      const values = getAbilityFormValues(formContainer);
      if (!values.id) { showToast('ID is required'); return; }
      if (!values.name) { showToast('Name is required'); return; }

      // Clean up undefined fields
      const cleaned = {};
      for (const [k, v] of Object.entries(values)) {
        if (v !== undefined) cleaned[k] = v;
      }

      ABILITIES[values.id] = cleaned;

      // If editing and ID changed, remove old key
      if (currentItemId && currentItemId !== values.id) {
        delete ABILITIES[currentItemId];
      }

      currentItemId = values.id;
      showToast(`Ability "${values.name}" applied to live game.`);
    } else {
      const values = getUnitFormValues(formContainer);
      if (!values.type) { showToast('Type ID is required'); return; }
      if (!values.name) { showToast('Name is required'); return; }

      UNIT_TYPES[values.type] = values;

      // Re-resolve abilities from string IDs
      initRegistry();

      if (currentItemId && currentItemId !== values.type) {
        delete UNIT_TYPES[currentItemId];
      }

      currentItemId = values.type;
      showToast(`Unit "${values.name}" applied to live game.`);
    }

    rebuildSidebar();
    renderMainArea();
  });

  // Export handler
  exportBtn.addEventListener('click', async () => {
    let code;
    if (currentTab === 'abilities') {
      code = exportAbilitiesJS(ABILITIES);
    } else {
      code = exportUnitsJS(UNIT_TYPES);
    }

    const ok = await copyToClipboard(code);
    showToast(ok ? 'Copied to clipboard!' : 'Copy failed — check console.');
    if (!ok) console.log(code);
  });
}
