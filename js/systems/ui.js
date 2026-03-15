import { PHASE, TEAM } from '../constants.js';
import { getAliveUnits } from '../state.js';
import { getAttackRange } from '../utils/grid.js';
import { getObjectiveStatus } from './objectives.js';
import { emit } from '../utils/events.js';

let elements = {};

export function initUI() {
  elements = {
    turnInfo: document.getElementById('turn-info'),
    phaseInfo: document.getElementById('phase-info'),
    gridPower: document.getElementById('grid-power'),
    gridPowerBar: document.getElementById('grid-power-bar'),
    unitInfo: document.getElementById('unit-info'),
    abilityPanel: document.getElementById('ability-panel'),
    endTurnBtn: document.getElementById('end-turn-btn'),
    restartBtn: document.getElementById('restart-btn'),
    messageOverlay: document.getElementById('message-overlay'),
    objectivesPanel: document.getElementById('objectives-panel'),
    missionSelect: document.getElementById('mission-select'),
  };

  elements.endTurnBtn.addEventListener('click', () => emit('endTurn'));
  elements.restartBtn.addEventListener('click', () => emit('restart'));
}

export function updateUI(state) {
  // Turn info
  elements.turnInfo.textContent = `Turn ${state.turnNumber}/${state.maxTurns}`;

  // Phase
  const phaseNames = {
    [PHASE.PLAYER_PHASE]: 'Your Turn',
    [PHASE.ENEMY_PHASE]: 'Enemy Turn',
    [PHASE.TURN_END]: 'Turn End',
    [PHASE.GAME_OVER]: 'Game Over',
    [PHASE.VICTORY]: 'Victory!',
  };
  elements.phaseInfo.textContent = phaseNames[state.phase] || '';
  elements.phaseInfo.className = `phase-display ${state.phase === PHASE.PLAYER_PHASE ? 'player-phase' : 'enemy-phase'}`;

  // Grid power
  elements.gridPower.textContent = `Grid Power: ${state.gridPower}/${state.maxGridPower}`;
  const powerPercent = (state.gridPower / state.maxGridPower) * 100;
  elements.gridPowerBar.style.width = `${powerPercent}%`;
  elements.gridPowerBar.className = `power-bar-fill ${powerPercent <= 30 ? 'critical' : ''}`;

  // End turn button
  elements.endTurnBtn.disabled = state.phase !== PHASE.PLAYER_PHASE;
  elements.endTurnBtn.style.display = (state.phase === PHASE.GAME_OVER || state.phase === PHASE.VICTORY) ? 'none' : 'block';

  // Restart button
  elements.restartBtn.style.display = (state.phase === PHASE.GAME_OVER || state.phase === PHASE.VICTORY) ? 'block' : 'none';

  // Selected unit info
  updateUnitInfo(state);

  // Ability buttons
  updateAbilityPanel(state);

  // Objectives
  updateObjectives(state);

  // Game over overlay
  if (state.phase === PHASE.GAME_OVER || state.phase === PHASE.VICTORY) {
    elements.messageOverlay.style.display = 'flex';
    elements.messageOverlay.querySelector('.overlay-title').textContent =
      state.phase === PHASE.VICTORY ? 'VICTORY!' : 'DEFEAT';
    elements.messageOverlay.querySelector('.overlay-subtitle').textContent =
      state.phase === PHASE.VICTORY
        ? 'Mission Complete - All objectives met!'
        : state.gridPower <= 0 ? 'Grid Power depleted...' : 'All mechs destroyed...';
    elements.messageOverlay.className = `message-overlay ${state.phase === PHASE.VICTORY ? 'victory' : 'defeat'}`;
  } else {
    elements.messageOverlay.style.display = 'none';
  }
}

function updateUnitInfo(state) {
  if (state.selectedUnitId == null) {
    elements.unitInfo.innerHTML = '<span class="no-selection">Click a mech to select</span>';
    return;
  }

  const unit = state.units.find(u => u.id === state.selectedUnitId);
  if (!unit || unit.hp <= 0) {
    elements.unitInfo.innerHTML = '<span class="no-selection">Click a mech to select</span>';
    return;
  }

  const hpBar = `<div class="hp-display">
    <span>${unit.name}</span>
    <div class="hp-bar-container">
      <div class="hp-bar" style="width:${(unit.hp / unit.maxHp) * 100}%"></div>
    </div>
    <span>HP: ${unit.hp}/${unit.maxHp}</span>
  </div>`;

  const status = [];
  if (unit.moved) status.push('Moved');
  if (unit.acted) status.push('Acted');
  const statusText = status.length > 0
    ? `<div class="unit-status">${status.join(' | ')}</div>`
    : '<div class="unit-status">Ready</div>';

  elements.unitInfo.innerHTML = hpBar + statusText;
}

function updateAbilityPanel(state) {
  const unit = state.selectedUnitId
    ? state.units.find(u => u.id === state.selectedUnitId)
    : null;

  if (!unit || unit.hp <= 0 || unit.team !== TEAM.PLAYER || unit.acted) {
    elements.abilityPanel.innerHTML = '';
    return;
  }

  let html = '';
  for (const ability of unit.abilities) {
    const isSelected = state.selectedAbility && state.selectedAbility.id === ability.id;
    html += `<button class="ability-btn ${isSelected ? 'selected' : ''}" data-ability="${ability.id}">
      <span class="ability-icon">${ability.icon || '⚔'}</span>
      <span class="ability-name">${ability.name}</span>
      <span class="ability-desc">${ability.description}</span>
    </button>`;
  }

  elements.abilityPanel.innerHTML = html;

  // Add click handlers
  elements.abilityPanel.querySelectorAll('.ability-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const abilityId = btn.dataset.ability;
      const ability = unit.abilities.find(a => a.id === abilityId);
      if (ability) {
        emit('selectAbility', { ability, unit });
      }
    });
  });
}

export function showMissionSelect(missions, onSelect) {
  elements.missionSelect.style.display = 'flex';
  let html = '<h2>Select Mission</h2><div class="mission-list">';
  missions.forEach((m, i) => {
    html += `<button class="mission-btn" data-index="${i}">
      <div class="mission-name">${m.name}</div>
      <div class="mission-objectives">${m.objectives.join(' | ')}</div>
    </button>`;
  });
  html += '</div>';
  elements.missionSelect.innerHTML = html;

  elements.missionSelect.querySelectorAll('.mission-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      elements.missionSelect.style.display = 'none';
      onSelect(index);
    });
  });
}

export function hideMissionSelect() {
  elements.missionSelect.style.display = 'none';
}

function updateObjectives(state) {
  const objectives = getObjectiveStatus(state);
  let html = '';
  for (const obj of objectives) {
    const cls = obj.failed ? 'failed' : obj.completed ? 'completed' : '';
    html += `<div class="objective ${cls}">${obj.text}</div>`;
  }
  elements.objectivesPanel.innerHTML = html;
}
