import { registerTargetType } from '../../systems/targeting.js';
import { inBounds, DIRS } from '../../utils/grid.js';

registerTargetType('ranged', {
  getRange(unit, ability, state) {
    const tiles = [];
    for (let dx = -ability.range; dx <= ability.range; dx++) {
      for (let dy = -ability.range; dy <= ability.range; dy++) {
        if (dx === 0 && dy === 0) continue;
        const dist = Math.abs(dx) + Math.abs(dy);
        if (dist <= ability.range && dist >= (ability.minRange || 1)) {
          const nx = unit.x + dx;
          const ny = unit.y + dy;
          if (inBounds(nx, ny)) tiles.push({ x: nx, y: ny });
        }
      }
    }
    return tiles;
  },

  getAffectedTiles(attacker, ability, targetX, targetY, state) {
    const effects = [{ x: targetX, y: targetY, damage: ability.damage, pushDir: null }];

    if (ability.aoe) {
      for (const dir of DIRS) {
        const adjX = targetX + dir.x;
        const adjY = targetY + dir.y;
        effects.push({ x: adjX, y: adjY, damage: 0, pushDir: { x: dir.x, y: dir.y }, pushOnly: true });
      }
    }

    return effects;
  },

  vfx: {
    type: 'projectile',
    colorFn(ability) {
      return '#ff6622';
    },
    soundKey: 'artillery',
  },
});
