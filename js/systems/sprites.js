import { TILE_SIZE } from '../constants.js';

// Sprite definitions: maps unit type -> sprite config
// Each entry is added as the user provides hand-drawn sprites
const SPRITE_DEFS = {
  combatMech: {
    src: 'assets/sprites/combatMech.png',
    frameWidth: 64,
    frameHeight: 64,
    idle: [0, 1, 2, 3],
    attack: null,
    hurt: null,
    idleSpeed: 250,
  },
  cannonMech: {
    src: 'assets/sprites/cannonMech.png',
    frameWidth: 64,
    frameHeight: 64,
    idle: [0, 1, 2, 3],
    attack: null,
    hurt: null,
    idleSpeed: 250,
  },
};

// Loaded images: Map<unitType, HTMLImageElement>
const loadedSprites = new Map();

/**
 * Load all registered sprite images.
 * Returns a promise that resolves when all are loaded.
 * Safe to call even if no sprites are registered.
 */
export function loadSprites() {
  const promises = Object.entries(SPRITE_DEFS).map(([type, def]) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        loadedSprites.set(type, img);
        resolve();
      };
      img.onerror = () => {
        console.warn(`Failed to load sprite: ${def.src}`);
        resolve(); // Don't block on missing sprites
      };
      img.src = def.src;
    });
  });
  return Promise.all(promises);
}

/**
 * Get the loaded image for a unit type, or null if not available.
 */
export function getSprite(unitType) {
  return loadedSprites.get(unitType) || null;
}

/**
 * Get the sprite definition for a unit type, or null.
 */
export function getSpriteDef(unitType) {
  return SPRITE_DEFS[unitType] || null;
}

/**
 * Resolve which frame to draw for a unit.
 * Returns { image, sx, sy, sw, sh } or null if no sprite available.
 */
export function getSpriteFrame(unit, state) {
  const image = getSprite(unit.type);
  if (!image) return null;

  const def = SPRITE_DEFS[unit.type];
  if (!def) return null;

  const fw = def.frameWidth || TILE_SIZE;
  const fh = def.frameHeight || TILE_SIZE;
  let col = 0;

  // Check if unit is in an attack animation
  const isAttacking = state.animations.some(
    a => a.unitId === unit.id && a.type === 'attack'
  );

  // Check if unit was recently hurt
  const isHurt = unit.hurtUntil && performance.now() < unit.hurtUntil;

  if (isAttacking && def.attack != null) {
    col = def.attack;
  } else if (isHurt && def.hurt != null) {
    col = def.hurt;
  } else if (def.idle && def.idle.length > 0) {
    // Idle cycle using global tick
    const speed = def.idleSpeed || 200;
    const frameIndex = Math.floor(performance.now() / speed) % def.idle.length;
    col = def.idle[frameIndex];
  }

  return {
    image,
    sx: col * fw,
    sy: 0,
    sw: fw,
    sh: fh,
  };
}
