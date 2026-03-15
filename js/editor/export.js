/**
 * Serialize ability/unit configs to valid JS source text for copy-paste.
 */

export function exportAbilitiesJS(abilities) {
  let code = 'export const ABILITIES = {\n';
  for (const [id, a] of Object.entries(abilities)) {
    code += `  ${id}: {\n`;
    code += `    id: '${a.id}',\n`;
    code += `    name: '${a.name}',\n`;
    if (a.description) code += `    description: '${a.description}',\n`;
    code += `    damage: ${a.damage},\n`;
    code += `    targetType: '${a.targetType}',\n`;
    code += `    range: ${a.range},\n`;
    if (a.minRange != null && a.minRange > 0) code += `    minRange: ${a.minRange},\n`;
    code += `    push: ${!!a.push},\n`;
    if (a.pushDirection) code += `    pushDirection: '${a.pushDirection}',\n`;
    if (a.aoe) code += `    aoe: true,\n`;
    if (a.icon) code += `    icon: '${a.icon}',\n`;
    if (a.vfx) code += `    vfx: { type: '${a.vfx.type}', color: '${a.vfx.color}' },\n`;
    if (a.sound) code += `    sound: '${a.sound}',\n`;
    code += '  },\n';
  }
  code += '};\n';
  return code;
}

export function exportUnitsJS(units) {
  let code = "import { TEAM } from '../constants.js';\n\n";
  code += 'export const UNIT_TYPES = {\n';
  for (const [id, u] of Object.entries(units)) {
    code += `  ${id}: {\n`;
    code += `    type: '${u.type}',\n`;
    code += `    name: '${u.name}',\n`;
    code += `    team: TEAM.${u.team === 'player' ? 'PLAYER' : 'ENEMY'},\n`;
    code += `    maxHp: ${u.maxHp},\n`;
    code += `    moveRange: ${u.moveRange},\n`;

    // Abilities as string IDs
    const abilityIds = u.abilities.map(a => typeof a === 'string' ? a : a.id);
    code += `    abilities: [${abilityIds.map(id => `'${id}'`).join(', ')}],\n`;

    // Sprite
    if (u.sprite) {
      code += `    sprite: { body: '${u.sprite.body}', accent: '${u.sprite.accent}', symbol: '${u.sprite.symbol}' },\n`;
    }

    // SpriteSheet
    if (u.spriteSheet) {
      const ss = u.spriteSheet;
      code += `    spriteSheet: {\n`;
      code += `      src: '${ss.src}',\n`;
      code += `      frameWidth: ${ss.frameWidth}, frameHeight: ${ss.frameHeight},\n`;
      code += `      idle: [${(ss.idle || []).join(', ')}], attack: ${ss.attack}, hurt: ${ss.hurt}, idleSpeed: ${ss.idleSpeed},\n`;
      code += `    },\n`;
    }

    // Portrait
    if (u.portrait) {
      code += `    portrait: '${u.portrait}',\n`;
    }

    // AI priority
    if (u.aiPriority) {
      code += `    aiPriority: '${u.aiPriority}',\n`;
    }

    code += '  },\n';
  }
  code += '};\n';
  return code;
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
}
