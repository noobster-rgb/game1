import { TEAM } from '../constants.js';
import { ABILITIES } from './abilities.js';

export const UNIT_TYPES = {
  // Player mechs
  combatMech: {
    type: 'combatMech',
    name: 'Combat Mech',
    team: TEAM.PLAYER,
    maxHp: 3,
    moveRange: 3,
    abilities: [ABILITIES.titanFist],
    sprite: { body: '#4488cc', accent: '#2266aa', symbol: 'C' },
  },
  artilleryMech: {
    type: 'artilleryMech',
    name: 'Artillery Mech',
    team: TEAM.PLAYER,
    maxHp: 2,
    moveRange: 3,
    abilities: [ABILITIES.artemisArtillery],
    sprite: { body: '#cc8844', accent: '#aa6622', symbol: 'A' },
  },
  cannonMech: {
    type: 'cannonMech',
    name: 'Cannon Mech',
    team: TEAM.PLAYER,
    maxHp: 3,
    moveRange: 3,
    abilities: [ABILITIES.taurusCannon],
    sprite: { body: '#88cc44', accent: '#66aa22', symbol: 'T' },
  },

  // Enemies
  alphaHornet: {
    type: 'alphaHornet',
    name: 'Alpha Hornet',
    team: TEAM.ENEMY,
    maxHp: 1,
    moveRange: 4,
    abilities: [ABILITIES.hornetSting],
    sprite: { body: '#cc4444', accent: '#aa2222', symbol: 'H' },
    aiPriority: 'nearest',
  },
  scarab: {
    type: 'scarab',
    name: 'Scarab',
    team: TEAM.ENEMY,
    maxHp: 3,
    moveRange: 2,
    abilities: [ABILITIES.scarabCrush],
    sprite: { body: '#884488', accent: '#662266', symbol: 'S' },
    aiPriority: 'buildings',
  },
  firefly: {
    type: 'firefly',
    name: 'Firefly',
    team: TEAM.ENEMY,
    maxHp: 1,
    moveRange: 3,
    abilities: [ABILITIES.fireflyBeam],
    sprite: { body: '#cc8800', accent: '#aa6600', symbol: 'F' },
    aiPriority: 'ranged',
  },
  beetleLeader: {
    type: 'beetleLeader',
    name: 'Beetle Leader',
    team: TEAM.ENEMY,
    maxHp: 5,
    moveRange: 2,
    abilities: [ABILITIES.beetleSmash],
    sprite: { body: '#664444', accent: '#442222', symbol: 'B' },
    aiPriority: 'buildings',
  },
};
