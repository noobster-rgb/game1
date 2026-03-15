import { PHASE, TEAM } from '../constants.js';
import { getAliveUnits } from '../state.js';
import { generateId } from '../state.js';
import { runEnemyPhase } from './enemy-ai.js';
import { emit } from '../utils/events.js';

export function endPlayerTurn(state) {
  if (state.phase !== PHASE.PLAYER_PHASE) return;

  // Clear selections
  state.selectedUnitId = null;
  state.selectedAbility = null;
  state.highlightedTiles = [];
  state.attackTargetTiles = [];

  // Start enemy phase
  state.phase = PHASE.ENEMY_PHASE;
  state.message = 'Enemy Phase';
  state.messageTimer = 60;

  setTimeout(() => {
    runEnemyPhase(state, () => {
      endEnemyTurn(state);
    });
  }, 800);
}

function endEnemyTurn(state) {
  state.phase = PHASE.TURN_END;

  // Check win/lose
  if (state.gridPower <= 0) {
    state.phase = PHASE.GAME_OVER;
    state.message = 'DEFEAT - Grid Power Lost';
    emit('gameOver', { victory: false });
    return;
  }

  const playerUnits = getAliveUnits(state, TEAM.PLAYER);
  if (playerUnits.length === 0) {
    state.phase = PHASE.GAME_OVER;
    state.message = 'DEFEAT - All Mechs Destroyed';
    emit('gameOver', { victory: false });
    return;
  }

  if (state.turnNumber >= state.maxTurns) {
    state.phase = PHASE.VICTORY;
    state.message = 'VICTORY!';
    emit('gameOver', { victory: true });
    return;
  }

  // Spawn enemies for next turn
  const mission = state._missionData;
  if (mission && mission.spawns) {
    const nextTurn = state.turnNumber + 1;
    const spawns = mission.spawns[nextTurn];
    if (spawns) {
      for (const spawnDef of spawns) {
        const unit = {
          ...spawnDef,
          id: generateId(),
          hp: spawnDef.maxHp,
          moved: false,
          acted: false,
        };
        state.units.push(unit);
      }
      state.message = `Reinforcements incoming!`;
      state.messageTimer = 90;
    }
  }

  // Advance turn
  state.turnNumber++;

  // Reset all units for new turn
  for (const unit of state.units) {
    if (unit.hp > 0) {
      unit.moved = false;
      unit.acted = false;
    }
  }

  // Start player phase
  state.phase = PHASE.PLAYER_PHASE;
  state.message = `Turn ${state.turnNumber}`;
  state.messageTimer = 60;

  emit('turnStart', { turn: state.turnNumber });
}

export function checkAutoEndTurn(state) {
  if (state.phase !== PHASE.PLAYER_PHASE) return false;
  const playerUnits = getAliveUnits(state, TEAM.PLAYER);
  return playerUnits.every(u => u.moved && u.acted);
}
