import { PHASE } from './constants.js';

let nextId = 1;
export function generateId() {
  return nextId++;
}

export function createState(mission) {
  nextId = 1;
  return {
    phase: PHASE.PLAYER_PHASE,
    turnNumber: 1,
    maxTurns: mission.maxTurns || 5,
    gridPower: mission.gridPower || 7,
    maxGridPower: mission.gridPower || 7,

    grid: structuredClone(mission.grid),
    units: mission.units.map(u => ({
      ...u,
      id: generateId(),
      hp: u.maxHp,
      moved: false,
      acted: false,
    })),

    selectedUnitId: null,
    selectedAbility: null,
    highlightedTiles: [],
    attackTargetTiles: [],

    mission: {
      name: mission.name,
      objectives: mission.objectives,
    },

    animations: [],
    pendingEnemyActions: [],
    message: null,
    messageTimer: 0,
  };
}

export function getUnitAt(state, x, y) {
  return state.units.find(u => u.x === x && u.y === y && u.hp > 0);
}

export function getAliveUnits(state, team) {
  return state.units.filter(u => u.hp > 0 && (!team || u.team === team));
}

export function getTile(state, x, y) {
  if (x < 0 || x >= state.grid.width || y < 0 || y >= state.grid.height) return null;
  return state.grid.tiles[y][x];
}
