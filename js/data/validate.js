import { getTargetType } from '../systems/targeting.js';
import { TEAM } from '../constants.js';

export function validateAbility(id, ability) {
  const errors = [];
  if (!ability.id || ability.id !== id) errors.push(`id mismatch: expected "${id}", got "${ability.id}"`);
  if (!ability.name) errors.push('missing name');
  if (typeof ability.damage !== 'number') errors.push('damage must be a number');
  if (!ability.targetType) errors.push('missing targetType');
  else if (!getTargetType(ability.targetType)) errors.push(`unknown targetType "${ability.targetType}"`);
  if (typeof ability.range !== 'number' || ability.range < 0) errors.push('range must be >= 0');
  return errors;
}

export function validateUnit(id, unit, abilitiesMap) {
  const errors = [];
  if (!unit.type || unit.type !== id) errors.push(`type mismatch: expected "${id}", got "${unit.type}"`);
  if (!unit.name) errors.push('missing name');
  if (!unit.team) errors.push('missing team');
  if (typeof unit.maxHp !== 'number' || unit.maxHp < 1) errors.push('maxHp must be >= 1');
  if (typeof unit.moveRange !== 'number' || unit.moveRange < 0) errors.push('moveRange must be >= 0');
  if (!Array.isArray(unit.abilities) || unit.abilities.length === 0) errors.push('needs at least one ability');

  // Check ability references (after resolution, abilities are objects)
  for (const a of (unit.abilities || [])) {
    if (typeof a === 'string') {
      if (!abilitiesMap[a]) errors.push(`unknown ability "${a}"`);
    } else if (typeof a === 'object' && a.id) {
      if (!abilitiesMap[a.id]) errors.push(`unknown ability "${a.id}"`);
    }
  }

  if (!unit.sprite) errors.push('missing sprite fallback (procedural rendering config)');
  if (unit.team === TEAM.ENEMY && !unit.aiPriority) errors.push('enemy unit missing aiPriority');
  return errors;
}

export function validateAll(abilities, units) {
  let hasErrors = false;

  for (const [id, a] of Object.entries(abilities)) {
    const errs = validateAbility(id, a);
    if (errs.length) {
      console.error(`[Validate] Ability "${id}":`, errs.join(', '));
      hasErrors = true;
    }
  }

  for (const [id, u] of Object.entries(units)) {
    const errs = validateUnit(id, u, abilities);
    if (errs.length) {
      console.error(`[Validate] Unit "${id}":`, errs.join(', '));
      hasErrors = true;
    }
  }

  if (!hasErrors) {
    console.log('[Validate] All abilities and units passed validation.');
  }

  return !hasErrors;
}
