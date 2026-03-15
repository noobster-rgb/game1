import { TERRAIN } from '../constants.js';
import { UNIT_TYPES } from './units.js';

const G = TERRAIN.GROUND;
const M = TERRAIN.MOUNTAIN;
const W = TERRAIN.WATER;
const B = TERRAIN.BUILDING;
const C = TERRAIN.CHASM;

export const MISSIONS = [
  {
    name: 'Defend the Settlement',
    maxTurns: 5,
    gridPower: 7,
    objectives: ['Survive 5 turns', 'Protect buildings (Grid Power > 0)'],
    grid: {
      width: 8,
      height: 8,
      tiles: [
        [G, G, M, G, G, G, G, G],
        [G, G, G, G, B, G, G, G],
        [G, G, G, G, G, G, M, G],
        [G, B, G, G, G, G, G, G],
        [G, G, G, G, G, G, G, G],
        [G, G, M, G, G, B, G, G],
        [G, G, G, G, G, G, G, W],
        [G, G, G, G, G, W, W, W],
      ],
    },
    units: [
      // Player mechs - bottom left area
      { ...UNIT_TYPES.combatMech, x: 1, y: 5 },
      { ...UNIT_TYPES.artilleryMech, x: 0, y: 6 },
      { ...UNIT_TYPES.cannonMech, x: 2, y: 6 },
      // Enemies - top right area
      { ...UNIT_TYPES.alphaHornet, x: 6, y: 0 },
      { ...UNIT_TYPES.alphaHornet, x: 7, y: 1 },
      { ...UNIT_TYPES.scarab, x: 7, y: 0 },
      { ...UNIT_TYPES.firefly, x: 5, y: 1 },
    ],
    // Additional enemies spawn on these turns
    spawns: {
      3: [
        { ...UNIT_TYPES.alphaHornet, x: 7, y: 3 },
        { ...UNIT_TYPES.scarab, x: 0, y: 0 },
      ],
      5: [
        { ...UNIT_TYPES.beetleLeader, x: 7, y: 0 },
      ],
    },
  },
  {
    name: 'The Beetle Hive',
    maxTurns: 6,
    gridPower: 5,
    objectives: ['Survive 6 turns', 'Protect buildings (Grid Power > 0)'],
    grid: {
      width: 8,
      height: 8,
      tiles: [
        [G, G, G, C, G, G, G, G],
        [G, B, G, C, G, G, B, G],
        [G, G, G, G, G, G, G, G],
        [M, G, G, G, G, G, G, M],
        [M, G, G, G, G, G, G, M],
        [G, G, G, G, G, G, G, G],
        [G, B, G, G, G, G, B, G],
        [G, G, G, W, W, G, G, G],
      ],
    },
    units: [
      { ...UNIT_TYPES.combatMech, x: 3, y: 4 },
      { ...UNIT_TYPES.artilleryMech, x: 4, y: 4 },
      { ...UNIT_TYPES.cannonMech, x: 3, y: 5 },
      { ...UNIT_TYPES.beetleLeader, x: 4, y: 0 },
      { ...UNIT_TYPES.scarab, x: 0, y: 2 },
      { ...UNIT_TYPES.scarab, x: 7, y: 2 },
      { ...UNIT_TYPES.alphaHornet, x: 1, y: 0 },
      { ...UNIT_TYPES.alphaHornet, x: 6, y: 0 },
    ],
    spawns: {
      3: [
        { ...UNIT_TYPES.firefly, x: 0, y: 0 },
        { ...UNIT_TYPES.firefly, x: 7, y: 0 },
      ],
      5: [
        { ...UNIT_TYPES.alphaHornet, x: 0, y: 7 },
        { ...UNIT_TYPES.alphaHornet, x: 7, y: 7 },
      ],
    },
  },
];
