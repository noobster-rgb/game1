import { ANIM_MOVE_DURATION, ANIM_ATTACK_DURATION, ANIM_PUSH_DURATION } from '../constants.js';

export function createMoveAnimation(unit, fromX, fromY, toX, toY, onComplete) {
  return {
    unitId: unit.id,
    type: 'move',
    fromX, fromY, toX, toY,
    currentX: fromX, currentY: fromY,
    startTime: performance.now(),
    duration: ANIM_MOVE_DURATION,
    onComplete,
  };
}

export function createAttackAnimation(unit, targetX, targetY, onComplete) {
  const dx = (targetX - unit.x) * 0.3;
  const dy = (targetY - unit.y) * 0.3;
  return {
    unitId: unit.id,
    type: 'attack',
    fromX: unit.x, fromY: unit.y,
    toX: unit.x + dx, toY: unit.y + dy,
    currentX: unit.x, currentY: unit.y,
    startTime: performance.now(),
    duration: ANIM_ATTACK_DURATION,
    returnToStart: true,
    onComplete,
  };
}

export function createPushAnimation(unit, fromX, fromY, toX, toY, onComplete) {
  return {
    unitId: unit.id,
    type: 'push',
    fromX, fromY, toX, toY,
    currentX: fromX, currentY: fromY,
    startTime: performance.now(),
    duration: ANIM_PUSH_DURATION,
    onComplete,
  };
}

export function updateAnimations(state) {
  const now = performance.now();
  const completed = [];

  for (const anim of state.animations) {
    const elapsed = now - anim.startTime;
    let t = Math.min(elapsed / anim.duration, 1);

    // Ease out
    t = 1 - (1 - t) * (1 - t);

    if (anim.returnToStart && t > 0.5) {
      // Bounce back for attack animations
      const t2 = (t - 0.5) * 2;
      anim.currentX = anim.toX + (anim.fromX - anim.toX) * t2;
      anim.currentY = anim.toY + (anim.fromY - anim.toY) * t2;
    } else if (anim.returnToStart) {
      const t2 = t * 2;
      anim.currentX = anim.fromX + (anim.toX - anim.fromX) * t2;
      anim.currentY = anim.fromY + (anim.toY - anim.fromY) * t2;
    } else {
      anim.currentX = anim.fromX + (anim.toX - anim.fromX) * t;
      anim.currentY = anim.fromY + (anim.toY - anim.fromY) * t;
    }

    if (elapsed >= anim.duration) {
      completed.push(anim);
    }
  }

  for (const anim of completed) {
    state.animations = state.animations.filter(a => a !== anim);
    if (anim.onComplete) anim.onComplete();
  }
}
