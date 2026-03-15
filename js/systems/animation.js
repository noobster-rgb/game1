import { ANIM_MOVE_DURATION, ANIM_ATTACK_DURATION, ANIM_PUSH_DURATION, TILE_SIZE } from '../constants.js';

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

// --- VFX animations (visual only, no unitId) ---

export function createImpactVFX(targetX, targetY, color = '#ffcc44') {
  return {
    type: 'vfx_impact',
    x: targetX,
    y: targetY,
    color,
    startTime: performance.now(),
    duration: 350,
  };
}

export function createProjectileVFX(fromX, fromY, toX, toY, color = '#ff8844', onArrive) {
  return {
    type: 'vfx_projectile',
    fromX, fromY, toX, toY,
    currentX: fromX, currentY: fromY,
    color,
    startTime: performance.now(),
    duration: 300,
    onComplete: onArrive,
  };
}

export function createBeamVFX(fromX, fromY, toX, toY, color = '#44ccff') {
  return {
    type: 'vfx_beam',
    fromX, fromY, toX, toY,
    color,
    startTime: performance.now(),
    duration: 400,
  };
}

export function createExplosionVFX(centerX, centerY, radius = 1, color = '#ff6622') {
  return {
    type: 'vfx_explosion',
    x: centerX,
    y: centerY,
    radius,
    color,
    startTime: performance.now(),
    duration: 500,
  };
}

export function createSlashVFX(targetX, targetY, color = '#ffffff') {
  return {
    type: 'vfx_slash',
    x: targetX,
    y: targetY,
    color,
    startTime: performance.now(),
    duration: 300,
  };
}

export function updateAnimations(state) {
  const now = performance.now();
  const completed = [];

  for (const anim of state.animations) {
    const elapsed = now - anim.startTime;
    let t = Math.min(elapsed / anim.duration, 1);

    // VFX animations just track progress
    if (anim.type.startsWith('vfx_')) {
      anim.progress = t;
      if (anim.type === 'vfx_projectile') {
        const eased = 1 - (1 - t) * (1 - t);
        anim.currentX = anim.fromX + (anim.toX - anim.fromX) * eased;
        anim.currentY = anim.fromY + (anim.toY - anim.fromY) * eased;
      }
      if (elapsed >= anim.duration) {
        completed.push(anim);
      }
      continue;
    }

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
