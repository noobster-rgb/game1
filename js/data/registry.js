import { ABILITIES } from './abilities.js';
import { UNIT_TYPES } from './units.js';
import { registerSpriteDefs } from '../systems/sprites.js';
import { registerPortraits } from '../systems/renderer.js';
import { validateAll } from './validate.js';
import { setAbilityResolver } from '../state.js';

let resolved = false;

/**
 * Initialize the data registry:
 * 1. Set the ability resolver for createState
 * 2. Resolve ability string IDs to ability objects on each unit template
 * 3. Auto-register sprite sheets and portraits from unit configs
 * 4. Run validation
 */
export function initRegistry() {
  if (resolved) return;

  // Set the resolver so createState can resolve string IDs on spawned/mission units
  setAbilityResolver(id => ABILITIES[id]);

  // Resolve ability IDs → objects
  for (const unit of Object.values(UNIT_TYPES)) {
    if (Array.isArray(unit.abilities) && typeof unit.abilities[0] === 'string') {
      unit.abilities = unit.abilities.map(id => {
        const ability = ABILITIES[id];
        if (!ability) {
          console.error(`Unit "${unit.type}": unknown ability "${id}"`);
          return { id, name: id, damage: 0, targetType: 'melee', range: 1 };
        }
        return ability;
      });
    }
  }

  // Auto-register sprite sheets from unit configs
  registerSpriteDefs(UNIT_TYPES);

  // Auto-register portraits from unit configs
  registerPortraits(UNIT_TYPES);

  // Validate
  validateAll(ABILITIES, UNIT_TYPES);

  resolved = true;
}

export { ABILITIES, UNIT_TYPES };
