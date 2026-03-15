import { CANVAS_WIDTH, CANVAS_HEIGHT, PHASE, TEAM } from './constants.js';
import { createState } from './state.js';
import { initRenderer, render } from './systems/renderer.js';
import { initInput, updateInputState } from './systems/input.js';
import { updateAnimations } from './systems/animation.js';
import { showMovementRange } from './systems/movement.js';
import { moveUnit } from './systems/movement.js';
import { executeAttack } from './systems/combat.js';
import { endPlayerTurn, checkAutoEndTurn } from './systems/turn.js';
import { initUI, updateUI, showMissionSelect, hideMissionSelect } from './systems/ui.js';
import { getAttackRange } from './utils/grid.js';
import { on, emit } from './utils/events.js';
import { MISSIONS } from './data/missions.js';

let state = null;

function init() {
  const canvas = document.getElementById('game-canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  initRenderer(canvas);
  initUI();

  // Event handlers
  on('select', ({ unitId }) => {
    if (!state || state.phase !== PHASE.PLAYER_PHASE) return;
    const unit = state.units.find(u => u.id === unitId);
    if (!unit || unit.team !== TEAM.PLAYER) return;

    state.selectedUnitId = unitId;
    state.selectedAbility = null;
    state.attackTargetTiles = [];
    showMovementRange(state, unit);
    updateUI(state);
  });

  on('deselect', () => {
    if (!state) return;
    state.selectedUnitId = null;
    state.selectedAbility = null;
    state.highlightedTiles = [];
    state.attackTargetTiles = [];
    updateUI(state);
  });

  on('move', ({ unitId, targetX, targetY }) => {
    if (!state || state.phase !== PHASE.PLAYER_PHASE) return;
    moveUnit(state, unitId, targetX, targetY);
  });

  on('selectAbility', ({ ability, unit }) => {
    if (!state || state.phase !== PHASE.PLAYER_PHASE) return;
    if (state.selectedAbility && state.selectedAbility.id === ability.id) {
      // Deselect ability
      state.selectedAbility = null;
      state.attackTargetTiles = [];
      if (!unit.moved) showMovementRange(state, unit);
      updateUI(state);
      return;
    }
    state.selectedAbility = ability;
    state.highlightedTiles = [];
    state.attackTargetTiles = getAttackRange(state, unit, ability);
    updateUI(state);
  });

  on('cancelAbility', () => {
    if (!state) return;
    state.selectedAbility = null;
    state.attackTargetTiles = [];
    const unit = state.selectedUnitId
      ? state.units.find(u => u.id === state.selectedUnitId)
      : null;
    if (unit && !unit.moved) showMovementRange(state, unit);
    updateUI(state);
  });

  on('attack', ({ unitId, ability, targetX, targetY }) => {
    if (!state || state.phase !== PHASE.PLAYER_PHASE) return;
    executeAttack(state, unitId, ability, targetX, targetY);
  });

  on('actionComplete', () => {
    if (!state) return;
    updateUI(state);
    // Check if all player units have acted
    if (checkAutoEndTurn(state)) {
      setTimeout(() => endPlayerTurn(state), 500);
    }
  });

  on('endTurn', () => {
    if (!state || state.phase !== PHASE.PLAYER_PHASE) return;
    endPlayerTurn(state);
  });

  on('restart', () => {
    showMissionSelect(MISSIONS, startMission);
  });

  on('hover', ({ x, y }) => {
    const tooltip = document.getElementById('hover-tooltip');
    if (!state) { tooltip.style.display = 'none'; return; }
    const unit = state.units.find(u => u.x === x && u.y === y && u.hp > 0);
    if (unit) {
      const ability = unit.abilities[0];
      tooltip.innerHTML = `<div class="tooltip-name">${unit.name}</div>
        <div class="tooltip-hp">HP: ${unit.hp}/${unit.maxHp}</div>
        ${ability ? `<div class="tooltip-ability">${ability.name}: ${ability.damage} dmg</div>` : ''}`;
      tooltip.style.display = 'block';
      tooltip.style.left = `${(x + 1) * (512 / 8) + 4}px`;
      tooltip.style.top = `${y * (512 / 8)}px`;
    } else {
      tooltip.style.display = 'none';
    }
  });

  on('unitKilled', ({ unit }) => {
    if (!state) return;
    updateUI(state);
  });

  on('buildingDestroyed', () => {
    if (!state) return;
    updateUI(state);
  });

  on('gameOver', () => {
    if (!state) return;
    updateUI(state);
  });

  // Start with mission select
  showMissionSelect(MISSIONS, startMission);

  // Game loop
  requestAnimationFrame(gameLoop);
}

function startMission(index) {
  const mission = MISSIONS[index];
  state = createState(mission);
  state._missionData = mission;
  state.message = `Turn 1 - ${mission.name}`;
  state.messageTimer = 90;

  const canvas = document.getElementById('game-canvas');
  initInput(canvas, state);
  updateUI(state);
}

function gameLoop() {
  if (state) {
    updateAnimations(state);
    updateInputState(state);

    // Decrement message timer
    if (state.messageTimer > 0) {
      state.messageTimer--;
      if (state.messageTimer <= 0) {
        state.message = null;
      }
    }

    render(state);
    updateUI(state);
  }

  requestAnimationFrame(gameLoop);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
