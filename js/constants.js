// Grid
export const GRID_WIDTH = 8;
export const GRID_HEIGHT = 8;
export const TILE_SIZE = 64;
export const CANVAS_WIDTH = GRID_WIDTH * TILE_SIZE;
export const CANVAS_HEIGHT = GRID_HEIGHT * TILE_SIZE;

// Terrain types
export const TERRAIN = {
  GROUND: 'ground',
  MOUNTAIN: 'mountain',
  WATER: 'water',
  BUILDING: 'building',
  CHASM: 'chasm',
};

// Terrain colors (pixel art palette)
export const TERRAIN_COLORS = {
  [TERRAIN.GROUND]:   { base: '#5a7a3a', detail: '#4a6a2a' },
  [TERRAIN.MOUNTAIN]: { base: '#8a8a7a', detail: '#6a6a5a' },
  [TERRAIN.WATER]:    { base: '#3a6a9a', detail: '#2a5a8a' },
  [TERRAIN.BUILDING]: { base: '#8a7a5a', detail: '#6a5a3a' },
  [TERRAIN.CHASM]:    { base: '#2a1a2a', detail: '#1a0a1a' },
};

// Teams
export const TEAM = {
  PLAYER: 'player',
  ENEMY: 'enemy',
};

// Turn phases
export const PHASE = {
  PLAYER_PHASE: 'PLAYER_PHASE',
  ENEMY_PHASE: 'ENEMY_PHASE',
  TURN_END: 'TURN_END',
  ANIMATING: 'ANIMATING',
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY',
};

// UI colors
export const COLORS = {
  SELECTION: 'rgba(255, 255, 100, 0.4)',
  MOVE_RANGE: 'rgba(80, 140, 255, 0.35)',
  ATTACK_RANGE: 'rgba(255, 60, 60, 0.35)',
  PUSH_PREVIEW: 'rgba(255, 180, 0, 0.5)',
  GRID_LINE: 'rgba(0, 0, 0, 0.15)',
  HP_BAR_BG: '#333',
  HP_BAR_PLAYER: '#4a4',
  HP_BAR_ENEMY: '#c44',
  MOVED_OVERLAY: 'rgba(0, 0, 0, 0.3)',
};

// Animation
export const ANIM_MOVE_DURATION = 200; // ms
export const ANIM_ENEMY_MOVE_DURATION = 250; // 25% slower than player
export const ANIM_ATTACK_DURATION = 300;
export const ANIM_PUSH_DURATION = 200;
export const ENEMY_ACTION_DELAY = 600; // ms between enemy actions
