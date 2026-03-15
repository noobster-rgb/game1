import { TILE_SIZE, TEAM, PHASE } from '../constants.js';
import { getUnitAt } from '../state.js';
import { getMovementRange, getAttackRange } from '../utils/grid.js';
import { emit } from '../utils/events.js';

let gameState = null;
let initialized = false;

export function initInput(canvas, state) {
  gameState = state;
  if (!initialized) {
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousemove', handleMouseMove);
    initialized = true;
  }
}

export function updateInputState(state) {
  gameState = state;
}

function getGridPos(e) {
  const rect = e.target.getBoundingClientRect();
  const scaleX = e.target.width / rect.width;
  const scaleY = e.target.height / rect.height;
  const x = Math.floor((e.clientX - rect.left) * scaleX / TILE_SIZE);
  const y = Math.floor((e.clientY - rect.top) * scaleY / TILE_SIZE);
  return { x, y };
}

function handleClick(e) {
  if (!gameState || gameState.phase !== PHASE.PLAYER_PHASE) return;
  if (gameState.animations.length > 0) return;

  const { x, y } = getGridPos(e);
  const clickedUnit = getUnitAt(gameState, x, y);
  const selectedUnit = gameState.selectedUnitId
    ? gameState.units.find(u => u.id === gameState.selectedUnitId)
    : null;

  // If we have an ability selected, try to use it
  if (selectedUnit && gameState.selectedAbility) {
    const isValidTarget = gameState.attackTargetTiles.some(t => t.x === x && t.y === y);
    if (isValidTarget) {
      emit('attack', { unitId: selectedUnit.id, ability: gameState.selectedAbility, targetX: x, targetY: y });
      return;
    }
    // Clicking elsewhere cancels ability
    emit('cancelAbility');
    return;
  }

  // If we have a selected unit with movement range showing
  if (selectedUnit && !selectedUnit.moved && gameState.highlightedTiles.length > 0) {
    const isValidMove = gameState.highlightedTiles.some(t => t.x === x && t.y === y);
    if (isValidMove) {
      emit('move', { unitId: selectedUnit.id, targetX: x, targetY: y });
      return;
    }
  }

  // Click on a player unit to select it
  if (clickedUnit && clickedUnit.team === TEAM.PLAYER && clickedUnit.hp > 0) {
    if (clickedUnit.id === gameState.selectedUnitId) {
      emit('deselect');
    } else {
      emit('select', { unitId: clickedUnit.id });
    }
    return;
  }

  // Click on empty space to deselect
  emit('deselect');
}

function handleMouseMove(e) {
  if (!gameState) return;
  const { x, y } = getGridPos(e);
  emit('hover', { x, y });
}
