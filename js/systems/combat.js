import { TERRAIN } from '../constants.js';
import { getTile, getUnitAt } from '../state.js';
import { inBounds, isBlockingTerrain, isLethalTerrain, getPushDirection, DIRS } from '../utils/grid.js';
import {
  createAttackAnimation, createPushAnimation,
  createImpactVFX, createProjectileVFX, createBeamVFX,
  createExplosionVFX, createSlashVFX,
} from './animation.js';
import { emit } from '../utils/events.js';
import { playSoundByKey, playHitSound, playPushSound, playDeathSound } from './audio.js';
import { getTargetType } from './targeting.js';

// VFX factory lookup — maps vfx type string to a function that
// creates the visual effect and calls onDone when effects should be applied
const VFX_FACTORIES = {
  slash(state, attacker, targetX, targetY, color, onDone) {
    state.animations.push(createSlashVFX(targetX, targetY, color));
    state.animations.push(createImpactVFX(targetX, targetY, color));
    onDone();
  },
  beam(state, attacker, targetX, targetY, color, onDone) {
    const beam = createBeamVFX(attacker.x, attacker.y, targetX, targetY, color);
    beam.onComplete = () => {
      state.animations.push(createImpactVFX(targetX, targetY, color));
      onDone();
    };
    state.animations.push(beam);
  },
  projectile(state, attacker, targetX, targetY, color, onDone) {
    const proj = createProjectileVFX(attacker.x, attacker.y, targetX, targetY, color, () => {
      playSoundByKey('explosion');
      state.animations.push(createExplosionVFX(targetX, targetY, 1, color));
      onDone();
    });
    state.animations.push(proj);
  },
  explosion(state, attacker, targetX, targetY, color, onDone) {
    state.animations.push(createExplosionVFX(targetX, targetY, 1, color));
    onDone();
  },
};

export function executeAttack(state, attackerId, ability, targetX, targetY) {
  const attacker = state.units.find(u => u.id === attackerId);
  if (!attacker) return;

  const tt = getTargetType(ability.targetType);
  if (!tt) return;

  // Resolve VFX config: ability-level override > target type default
  const vfxType = ability.vfx?.type || tt.vfx.type;
  const vfxColor = ability.vfx?.color || tt.vfx.colorFn(ability);
  const soundKey = ability.sound || tt.vfx.soundKey;

  const anim = createAttackAnimation(attacker, targetX, targetY, () => {
    playSoundByKey(soundKey);

    const vfxFactory = VFX_FACTORIES[vfxType] || VFX_FACTORIES.slash;
    vfxFactory(state, attacker, targetX, targetY, vfxColor, () => {
      applyAttackEffects(state, attacker, ability, targetX, targetY);
      attacker.acted = true;
      state.selectedAbility = null;
      state.attackTargetTiles = [];
      emit('actionComplete');
    });
  });
  state.animations.push(anim);
}

function applyAttackEffects(state, attacker, ability, targetX, targetY) {
  const tt = getTargetType(ability.targetType);
  if (!tt) return;

  const effects = tt.getAffectedTiles(attacker, ability, targetX, targetY, state);

  for (const effect of effects) {
    const { x, y, damage, pushDir, pushOnly } = effect;

    // Apply damage (skip for push-only effects like AoE adjacent pushes)
    if (!pushOnly && damage > 0) {
      applyDamageAt(state, x, y, damage);
    }

    // Apply push if direction specified
    if (pushDir) {
      const unit = getUnitAt(state, x, y);
      if (unit && unit.id !== attacker.id) {
        applyPush(state, unit, pushDir.x, pushDir.y);
      }
    }
  }
}

export function applyDamage(state, unit, damage) {
  unit.hp = Math.max(0, unit.hp - damage);
  unit.hurtUntil = performance.now() + 200;
  playHitSound();
  emit('unitDamaged', { unitId: unit.id, damage, hp: unit.hp });
  if (unit.hp <= 0) {
    playDeathSound();
    emit('unitKilled', { unitId: unit.id, unit });
  }
}

function applyDamageAt(state, x, y, damage) {
  const unit = getUnitAt(state, x, y);
  if (unit) {
    applyDamage(state, unit, damage);
    return;
  }

  const tile = getTile(state, x, y);
  if (tile === TERRAIN.BUILDING) {
    state.gridPower = Math.max(0, state.gridPower - 1);
    state.grid.tiles[y][x] = TERRAIN.GROUND;
    emit('buildingDestroyed', { x, y, gridPower: state.gridPower });
  }
}

export function applyPush(state, unit, dx, dy) {
  if (unit.hp <= 0) return;
  playPushSound();

  const newX = unit.x + dx;
  const newY = unit.y + dy;

  if (!inBounds(newX, newY)) {
    applyDamage(state, unit, 1);
    state.animations.push(createImpactVFX(unit.x, unit.y, '#ff8844'));
    return;
  }

  const tile = getTile(state, newX, newY);

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

  if (isBlockingTerrain(tile)) {
    applyDamage(state, unit, 1);
    state.animations.push(createImpactVFX(unit.x, unit.y, '#ff8844'));
    return;
  }

  const blockingUnit = getUnitAt(state, newX, newY);
  if (blockingUnit) {
    applyDamage(state, unit, 1);
    applyDamage(state, blockingUnit, 1);
    state.animations.push(createImpactVFX(unit.x, unit.y, '#ff8844'));
    return;
  }

  if (tile === TERRAIN.BUILDING) {
    state.gridPower = Math.max(0, state.gridPower - 1);
    state.grid.tiles[newY][newX] = TERRAIN.GROUND;
    emit('buildingDestroyed', { x: newX, y: newY, gridPower: state.gridPower });
    applyDamage(state, unit, 1);
    state.animations.push(createImpactVFX(newX, newY, '#ff8844'));
    return;
  }

  const fromX = unit.x;
  const fromY = unit.y;
  const anim = createPushAnimation(unit, fromX, fromY, newX, newY, () => {
    unit.x = newX;
    unit.y = newY;
  });
  state.animations.push(anim);
}
