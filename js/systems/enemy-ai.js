import { TEAM, TERRAIN, ENEMY_ACTION_DELAY, ANIM_ENEMY_MOVE_DURATION } from '../constants.js';
import { getUnitAt, getAliveUnits, getTile } from '../state.js';
import { getMovementRange, getAttackRange, manhattan, inBounds, isWalkable, DIRS } from '../utils/grid.js';
import { createMoveAnimation } from './animation.js';
import { executeAttack } from './combat.js';
import { playMoveSound } from './audio.js';

export function runEnemyPhase(state, onComplete) {
  const enemies = getAliveUnits(state, TEAM.ENEMY);
  if (enemies.length === 0) {
    onComplete();
    return;
  }

  let index = 0;

  function processNextEnemy() {
    if (index >= enemies.length) {
      onComplete();
      return;
    }

    const enemy = enemies[index];
    if (enemy.hp <= 0) {
      index++;
      processNextEnemy();
      return;
    }

    const action = decideAction(state, enemy);

    const afterMove = () => {
      if (action.attackTarget && enemy.hp > 0) {
        const ability = enemy.abilities[0];
        setTimeout(() => {
          if (enemy.hp <= 0) {
            index++;
            processNextEnemy();
            return;
          }
          executeAttack(state, enemy.id, ability, action.attackTarget.x, action.attackTarget.y);
          enemy.acted = true;
          setTimeout(() => {
            index++;
            processNextEnemy();
          }, ENEMY_ACTION_DELAY);
        }, ENEMY_ACTION_DELAY / 2);
      } else {
        enemy.acted = true;
        setTimeout(() => {
          index++;
          processNextEnemy();
        }, ENEMY_ACTION_DELAY);
      }
    };

    if (action.moveTarget) {
      playMoveSound();
      const fromX = enemy.x;
      const fromY = enemy.y;
      const anim = createMoveAnimation(
        enemy, fromX, fromY,
        action.moveTarget.x, action.moveTarget.y,
        () => {
          enemy.x = action.moveTarget.x;
          enemy.y = action.moveTarget.y;
          enemy.moved = true;
          afterMove();
        },
        ANIM_ENEMY_MOVE_DURATION,
      );
      state.animations.push(anim);
    } else {
      afterMove();
    }
  }

  processNextEnemy();
}

function decideAction(state, enemy) {
  const ability = enemy.abilities[0];
  const targets = findTargets(state, enemy);

  if (targets.length === 0) {
    return { moveTarget: null, attackTarget: null };
  }

  // Sort targets by priority
  targets.sort((a, b) => a.priority - b.priority);

  // Try to attack from current position first
  const currentAttackRange = getAttackRange(state, enemy, ability);
  for (const target of targets) {
    const canAttack = currentAttackRange.some(t => t.x === target.x && t.y === target.y);
    if (canAttack) {
      return { moveTarget: null, attackTarget: { x: target.x, y: target.y } };
    }
  }

  // Otherwise move toward best target and try to attack
  const bestTarget = targets[0];
  const moveRange = getMovementRange(state, enemy);

  let bestMove = null;
  let bestDist = manhattan(enemy.x, enemy.y, bestTarget.x, bestTarget.y);

  for (const tile of moveRange) {
    const dist = manhattan(tile.x, tile.y, bestTarget.x, bestTarget.y);
    if (dist < bestDist) {
      bestDist = dist;
      bestMove = tile;
    }
  }

  if (bestMove) {
    // Check if we can attack from new position
    const movedEnemy = { ...enemy, x: bestMove.x, y: bestMove.y };
    const newAttackRange = getAttackRange(state, movedEnemy, ability);

    for (const target of targets) {
      const canAttack = newAttackRange.some(t => t.x === target.x && t.y === target.y);
      if (canAttack) {
        return { moveTarget: bestMove, attackTarget: { x: target.x, y: target.y } };
      }
    }

    return { moveTarget: bestMove, attackTarget: null };
  }

  return { moveTarget: null, attackTarget: null };
}

function findTargets(state, enemy) {
  const targets = [];
  const aiPriority = enemy.aiPriority || 'nearest';

  // Find buildings
  for (let y = 0; y < state.grid.height; y++) {
    for (let x = 0; x < state.grid.width; x++) {
      if (state.grid.tiles[y][x] === TERRAIN.BUILDING) {
        const dist = manhattan(enemy.x, enemy.y, x, y);
        targets.push({
          x, y, type: 'building',
          priority: aiPriority === 'buildings' ? dist : dist + 100,
        });
      }
    }
  }

  // Find player mechs
  const mechs = getAliveUnits(state, TEAM.PLAYER);
  for (const mech of mechs) {
    const dist = manhattan(enemy.x, enemy.y, mech.x, mech.y);
    targets.push({
      x: mech.x, y: mech.y, type: 'mech',
      priority: aiPriority === 'nearest' ? dist : dist + 50,
    });
  }

  return targets;
}
