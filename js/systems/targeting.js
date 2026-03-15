// Target type plugin registry
// Each target type defines: getRange, getAffectedTiles, vfx

const registry = {};

export function registerTargetType(name, definition) {
  registry[name] = definition;
}

export function getTargetType(name) {
  return registry[name] || null;
}

export function getRegisteredTargetTypes() {
  return Object.keys(registry);
}
