import { GRID_WIDTH, GRID_HEIGHT, TERRAIN } from '../constants.js';
import { getTile, getUnitAt } from '../state.js';
import { getTargetType } from '../systems/targeting.js';

export const DIRS = [
  { x: 0, y: -1, name: 'up' },
  { x: 1, y: 0, name: 'right' },
  { x: 0, y: 1, name: 'down' },
  { x: -1, y: 0, name: 'left' },
];

export function inBounds(x, y) {
  return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
}

export function manhattan(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

export function isWalkable(state, x, y) {
  if (!inBounds(x, y)) return false;
  const tile = getTile(state, x, y);
  if (tile === TERRAIN.MOUNTAIN || tile === TERRAIN.WATER || tile === TERRAIN.CHASM) return false;
  if (getUnitAt(state, x, y)) return false;
  return true;
}

export function isBlockingTerrain(tile) {
  return tile === TERRAIN.MOUNTAIN;
}

export function isLethalTerrain(tile) {
  return tile === TERRAIN.WATER || tile === TERRAIN.CHASM;
}

// BFS flood fill for movement range
export function getMovementRange(state, unit) {
  const range = unit.moveRange || 3;
  const visited = new Map();
  const queue = [{ x: unit.x, y: unit.y, dist: 0 }];
  visited.set(`${unit.x},${unit.y}`, 0);

  while (queue.length > 0) {
    const { x, y, dist } = queue.shift();
    if (dist >= range) continue;

    for (const dir of DIRS) {
      const nx = x + dir.x;
      const ny = y + dir.y;
      const key = `${nx},${ny}`;
      if (visited.has(key)) continue;
      if (!isWalkable(state, nx, ny)) continue;
      visited.set(key, dist + 1);
      queue.push({ x: nx, y: ny, dist: dist + 1 });
    }
  }

  // Remove the unit's own position
  visited.delete(`${unit.x},${unit.y}`);
  return [...visited.keys()].map(k => {
    const [x, y] = k.split(',').map(Number);
    return { x, y };
  });
}

// Get attack range tiles based on ability — delegates to target type plugin
export function getAttackRange(state, unit, ability) {
  if (!ability) return [];
  const tt = getTargetType(ability.targetType);
  return tt ? tt.getRange(unit, ability, state) : [];
}

// Get push direction from attacker to target
export function getPushDirection(fromX, fromY, toX, toY) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  if (Math.abs(dx) > Math.abs(dy)) {
    return { x: dx > 0 ? 1 : -1, y: 0 };
  } else {
    return { x: 0, y: dy > 0 ? 1 : -1 };
  }
}
