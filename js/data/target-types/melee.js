import { registerTargetType } from '../../systems/targeting.js';
import { inBounds, DIRS, getPushDirection } from '../../utils/grid.js';

registerTargetType('melee', {
  getRange(unit, ability, state) {
    const tiles = [];
    for (const dir of DIRS) {
      const nx = unit.x + dir.x;
      const ny = unit.y + dir.y;
      if (inBounds(nx, ny)) tiles.push({ x: nx, y: ny });
    }
    return tiles;
  },

  getAffectedTiles(attacker, ability, targetX, targetY, state) {
    const pushDir = ability.push
      ? getPushDirection(attacker.x, attacker.y, targetX, targetY)
      : null;
    return [{ x: targetX, y: targetY, damage: ability.damage, pushDir }];
  },

  vfx: {
    type: 'slash',
    colorFn(ability) {
      if (ability.damage >= 3) return '#ff4444';
      if (ability.damage >= 2) return '#ffcc44';
      return '#ffffff';
    },
    soundKey: 'melee',
  },
});
