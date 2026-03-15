import { registerTargetType } from '../../systems/targeting.js';
import { inBounds, DIRS } from '../../utils/grid.js';
import { getTile, getUnitAt } from '../../state.js';
import { TERRAIN } from '../../constants.js';

registerTargetType('line', {
  getRange(unit, ability, state) {
    const tiles = [];
    for (const dir of DIRS) {
      for (let i = 1; i <= (ability.range || 8); i++) {
        const nx = unit.x + dir.x * i;
        const ny = unit.y + dir.y * i;
        if (!inBounds(nx, ny)) break;
        tiles.push({ x: nx, y: ny });
        const t = getTile(state, nx, ny);
        if (t === TERRAIN.MOUNTAIN) break;
        if (getUnitAt(state, nx, ny)) break;
      }
    }
    return tiles;
  },

  getAffectedTiles(attacker, ability, targetX, targetY, state) {
    const dx = targetX - attacker.x;
    const dy = targetY - attacker.y;
    const pushDir = ability.push
      ? { x: dx !== 0 ? (dx > 0 ? 1 : -1) : 0, y: dy !== 0 ? (dy > 0 ? 1 : -1) : 0 }
      : null;
    return [{ x: targetX, y: targetY, damage: ability.damage, pushDir }];
  },

  vfx: {
    type: 'beam',
    colorFn(ability) {
      return ability.push ? '#44ccff' : '#ff4444';
    },
    soundKey: 'cannon',
  },
});
