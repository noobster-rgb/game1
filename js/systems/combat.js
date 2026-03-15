import { TERRAIN } from '../constants.js';
import { getTile, getUnitAt } from '../state.js';
import { inBounds, isBlockingTerrain, isLethalTerrain, getPushDirection, DIRS } from '../utils/grid.js';
import { createAttackAnimation, createPushAnimation } from './animation.js';
import { emit } from '../utils/events.js';

export function executeAttack(state, attackerId, ability, targetX, targetY) {
  const attacker = state.units.find(u => u.id === attackerId);
  if (!attacker) return;

  // Attack animation on attacker
  const anim = createAttackAnimation(attacker, targetX, targetY, () => {
    applyAttackEffects(state, attacker, ability, targetX, targetY);
    attacker.acted = true;
    state.selectedAbility = null;
    state.attackTargetTiles = [];
    emit('actionComplete');
  });

  state.animations.push(anim);
}

function applyAttackEffects(state, attacker, ability, targetX, targetY) {
  if (ability.aoe) {
    // AoE: damage target tile + push all adjacent units
    applyDamageAt(state, targetX, targetY, ability.damage);

    // Push units adjacent to the blast center
    for (const dir of DIRS) {
      const adjX = targetX + dir.x;
      const adjY = targetY + dir.y;
      const adjUnit = getUnitAt(state, adjX, adjY);
      if (adjUnit && adjUnit.id !== attacker.id) {
        applyPush(state, adjUnit, dir.x, dir.y);
      }
    }
  } else if (ability.targetType === 'line') {
    // Line attack: hit first unit in line
    const dir = getLineDirection(attacker.x, attacker.y, targetX, targetY);
    // Find the unit at target position
    const target = getUnitAt(state, targetX, targetY);
    if (target) {
      applyDamage(state, target, ability.damage);
      if (ability.push) {
        applyPush(state, target, dir.x, dir.y);
      }
    } else {
      // Check if it's a building
      applyDamageAt(state, targetX, targetY, ability.damage);
    }
  } else {
    // Standard attack on target tile
    const target = getUnitAt(state, targetX, targetY);
    if (target) {
      applyDamage(state, target, ability.damage);
      if (ability.push) {
        const pushDir = getPushDirection(attacker.x, attacker.y, targetX, targetY);
        applyPush(state, target, pushDir.x, pushDir.y);
      }
    } else {
      // Hit building at this tile
      applyDamageAt(state, targetX, targetY, ability.damage);
    }
  }
}

function getLineDirection(fromX, fromY, toX, toY) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  if (dx !== 0) return { x: dx > 0 ? 1 : -1, y: 0 };
  return { x: 0, y: dy > 0 ? 1 : -1 };
}

export function applyDamage(state, unit, damage) {
  unit.hp = Math.max(0, unit.hp - damage);
  emit('unitDamaged', { unitId: unit.id, damage, hp: unit.hp });
  if (unit.hp <= 0) {
    emit('unitKilled', { unitId: unit.id, unit });
  }
}

function applyDamageAt(state, x, y, damage) {
  const unit = getUnitAt(state, x, y);
  if (unit) {
    applyDamage(state, unit, damage);
    return;
  }

  // Damage building
  const tile = getTile(state, x, y);
  if (tile === TERRAIN.BUILDING) {
    state.gridPower = Math.max(0, state.gridPower - 1);
    // Destroy building tile
    state.grid.tiles[y][x] = TERRAIN.GROUND;
    emit('buildingDestroyed', { x, y, gridPower: state.gridPower });
  }
}

export function applyPush(state, unit, dx, dy) {
  if (unit.hp <= 0) return;

  const newX = unit.x + dx;
  const newY = unit.y + dy;

  // Out of bounds = bump
  if (!inBounds(newX, newY)) {
    applyDamage(state, unit, 1); // bump damage
    return;
  }

  const tile = getTile(state, newX, newY);

  // Lethal terrain
  if (isLethalTerrain(tile)) {
    const anim = createPushAnimation(unit, unit.x, unit.y, newX, newY, () => {
      unit.x = newX;
      unit.y = newY;
      unit.hp = 0;
      emit('unitKilled', { unitId: unit.id, unit });
    });
    state.animations.push(anim);
    return;
  }

  // Blocked by mountain
  if (isBlockingTerrain(tile)) {
    applyDamage(state, unit, 1);
    return;
  }

  // Collision with another unit
  const blockingUnit = getUnitAt(state, newX, newY);
  if (blockingUnit) {
    applyDamage(state, unit, 1);
    applyDamage(state, blockingUnit, 1);
    return;
  }

  // Pushed into building destroys building
  if (tile === TERRAIN.BUILDING) {
    state.gridPower = Math.max(0, state.gridPower - 1);
    state.grid.tiles[newY][newX] = TERRAIN.GROUND;
    emit('buildingDestroyed', { x: newX, y: newY, gridPower: state.gridPower });
    // unit takes bump damage hitting building
    applyDamage(state, unit, 1);
    return;
  }

  // Clear push - move the unit
  const fromX = unit.x;
  const fromY = unit.y;
  const anim = createPushAnimation(unit, fromX, fromY, newX, newY, () => {
    unit.x = newX;
    unit.y = newY;
  });
  state.animations.push(anim);
}
