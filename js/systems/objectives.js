import { TEAM } from '../constants.js';
import { getAliveUnits } from '../state.js';

export function getObjectiveStatus(state) {
  const results = [];
  const playerAlive = getAliveUnits(state, TEAM.PLAYER).length > 0;
  const enemyAlive = getAliveUnits(state, TEAM.ENEMY).length > 0;

  results.push({
    text: `Survive ${state.maxTurns} turns`,
    completed: state.turnNumber > state.maxTurns,
    failed: !playerAlive,
  });

  results.push({
    text: `Grid Power: ${state.gridPower}/${state.maxGridPower}`,
    completed: state.gridPower > 0,
    failed: state.gridPower <= 0,
  });

  return results;
}
