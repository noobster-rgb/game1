import { PHASE } from './constants.js';

let nextId = 1;
let abilityResolver = null;

export function generateId() {
  return nextId++;
}

/**
 * Set the function used to resolve ability string IDs to objects.
 * Called by initRegistry() after ABILITIES is loaded.
 */
export function setAbilityResolver(fn) {
  abilityResolver = fn;
}

function resolveAbilities(abilities) {
  if (!abilityResolver) return abilities;
  return abilities.map(a => typeof a === 'string' ? abilityResolver(a) : a);
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
      abilities: resolveAbilities(u.abilities),
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
