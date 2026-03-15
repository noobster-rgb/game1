import { getMovementRange } from '../utils/grid.js';
import { createMoveAnimation } from './animation.js';

export function showMovementRange(state, unit) {
  if (unit.moved) {
    state.highlightedTiles = [];
    return;
  }
  state.highlightedTiles = getMovementRange(state, unit);
}

export function moveUnit(state, unitId, targetX, targetY) {
  const unit = state.units.find(u => u.id === unitId);
  if (!unit || unit.moved) return;

  const fromX = unit.x;
  const fromY = unit.y;

  // Create movement animation
  const anim = createMoveAnimation(unit, fromX, fromY, targetX, targetY, () => {
    unit.x = targetX;
    unit.y = targetY;
    unit.moved = true;
  });

  state.animations.push(anim);
  state.highlightedTiles = [];
}
