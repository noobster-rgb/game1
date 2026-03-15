/**
 * Preset templates for the kid-friendly editor wizard.
 * Each template provides kid-friendly labels and pre-filled defaults.
 */

export const ABILITY_TEMPLATES = [
  {
    key: 'punch',
    label: 'Big Punch',
    icon: '\u{1F44A}',
    color: '#ff6666',
    description: 'Hit enemies right next to you!',
    data: {
      name: 'Big Punch',
      icon: '\u{1F44A}',
      damage: 2,
      targetType: 'melee',
      range: 1,
      minRange: 0,
      push: true,
      aoe: false,
      description: 'A powerful close-range punch that pushes enemies back.',
    },
  },
  {
    key: 'laser',
    label: 'Laser Beam',
    icon: '\u{1F4A5}',
    color: '#6688ff',
    description: 'Zap enemies in a straight line!',
    data: {
      name: 'Laser Beam',
      icon: '\u{1F4A5}',
      damage: 1,
      targetType: 'line',
      range: 6,
      minRange: 0,
      push: true,
      pushDirection: 'linear',
      aoe: false,
      description: 'A long-range beam that pushes enemies along the line.',
    },
  },
  {
    key: 'bomb',
    label: 'Boom Blast',
    icon: '\u{1F4A3}',
    color: '#66cc66',
    description: 'Explode an area from far away!',
    data: {
      name: 'Boom Blast',
      icon: '\u{1F4A3}',
      damage: 1,
      targetType: 'ranged',
      range: 4,
      minRange: 2,
      push: true,
      aoe: true,
      description: 'An explosive ranged attack that pushes nearby enemies.',
    },
  },
  {
    key: 'custom',
    label: 'Make Your Own',
    icon: '\u{2B50}',
    color: '#ffd700',
    description: 'Start from scratch!',
    data: {
      name: '',
      icon: '',
      damage: 1,
      targetType: 'melee',
      range: 1,
      minRange: 0,
      push: false,
      aoe: false,
      description: '',
    },
  },
];

export const UNIT_TEMPLATES = [
  {
    key: 'mech',
    label: 'Tough Mech',
    icon: '\u{1F916}',
    color: '#4488cc',
    description: 'A strong robot for your team!',
    data: {
      name: 'Tough Mech',
      team: 'player',
      maxHp: 3,
      moveRange: 3,
      abilities: [],
      sprite: { body: '#4488cc', accent: '#2266aa', symbol: 'M' },
    },
  },
  {
    key: 'bug',
    label: 'Scary Bug',
    icon: '\u{1F41B}',
    color: '#cc4444',
    description: 'A creepy enemy bug!',
    data: {
      name: 'Scary Bug',
      team: 'enemy',
      maxHp: 2,
      moveRange: 4,
      abilities: [],
      sprite: { body: '#cc4444', accent: '#992222', symbol: 'B' },
      aiPriority: 'nearest',
    },
  },
  {
    key: 'tank',
    label: 'Big Tank',
    icon: '\u{1F6E1}\u{FE0F}',
    color: '#66cc66',
    description: 'Super tough but kinda slow!',
    data: {
      name: 'Big Tank',
      team: 'player',
      maxHp: 5,
      moveRange: 2,
      abilities: [],
      sprite: { body: '#448844', accent: '#226622', symbol: 'T' },
    },
  },
  {
    key: 'custom',
    label: 'Make Your Own',
    icon: '\u{2B50}',
    color: '#ffd700',
    description: 'Start from scratch!',
    data: {
      name: '',
      team: 'player',
      maxHp: 3,
      moveRange: 3,
      abilities: [],
      sprite: { body: '#4488cc', accent: '#2266aa', symbol: '?' },
    },
  },
];

/** Color palette presets for unit creation */
export const COLOR_PALETTES = [
  { label: 'Ocean', body: '#4488cc', accent: '#2266aa', symbol: '#aaddff' },
  { label: 'Fire', body: '#cc4444', accent: '#992222', symbol: '#ffaa66' },
  { label: 'Forest', body: '#448844', accent: '#226622', symbol: '#aaffaa' },
  { label: 'Royal', body: '#8844cc', accent: '#662299', symbol: '#ddaaff' },
  { label: 'Gold', body: '#ccaa44', accent: '#997722', symbol: '#ffddaa' },
  { label: 'Steel', body: '#668899', accent: '#445566', symbol: '#aabbcc' },
  { label: 'Shadow', body: '#444455', accent: '#222233', symbol: '#8888aa' },
  { label: 'Candy', body: '#cc44aa', accent: '#992277', symbol: '#ffaadd' },
];

/** Common emojis for the ability icon picker */
export const EMOJI_OPTIONS = [
  '\u{2694}\u{FE0F}', '\u{1F44A}', '\u{1F4A5}', '\u{1F4A3}',
  '\u{1F525}', '\u{2744}\u{FE0F}', '\u{26A1}', '\u{1F300}',
  '\u{1F6E1}\u{FE0F}', '\u{1F48E}', '\u{2B50}', '\u{1F680}',
  '\u{1F52B}', '\u{1F4AB}', '\u{1F311}', '\u{2764}\u{FE0F}',
];

/** Symbol options for unit symbol picker */
export const SYMBOL_OPTIONS = ['C', 'A', 'T', 'S', 'M', 'X', 'B', 'R', 'K', 'W', 'F', 'H'];
