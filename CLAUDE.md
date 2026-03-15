# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Project

```bash
python -m http.server 8080
```
Open `http://localhost:8080`. No build tools — vanilla JS ES modules served directly. The `.claude/launch.json` configures this as `game-server` for Claude Preview.

Press **F2** in-game to open the dev editor for abilities/units.

## Architecture

Browser-based tactical RPG. HTML5 Canvas for the grid, DOM overlay for UI panels. Single-page app entry at `index.html`.

### Game Loop (`main.js`)
```
requestAnimationFrame → updateAnimations → updateInputState → render → renderPortrait → updateUI → repeat
```

### Turn Flow (`systems/turn.js`)
```
PLAYER_PHASE → ENEMY_PHASE (sequential AI actions with animation delays) → TURN_END (spawns, win/lose check) → repeat
```

### State (`state.js`)
Single mutable state object created per mission via `createState(mission)`. Key fields: `phase`, `units[]`, `grid` (8x8 tiles), `gridPower`, `selectedUnitId`, `selectedAbility`, `highlightedTiles`, `attackTargetTiles`, `animations[]`.

### Event Bus (`utils/events.js`)
All input-to-logic communication uses `on(event, fn)` / `emit(event, data)`. Core events: `select`, `deselect`, `move`, `abilityClick`, `attack`, `actionComplete`, `endTurn`, `unitKilled`, `buildingDestroyed`, `gameOver`.

### Data Flow: Abilities & Units
1. **Define**: `data/abilities.js` (ABILITIES object) and `data/units.js` (UNIT_TYPES object). Units reference abilities by **string ID** (e.g., `abilities: ['titanFist']`), and declare `spriteSheet`/`portrait` paths inline.
2. **Resolve**: `data/registry.js` `initRegistry()` runs at startup — resolves ability string IDs to objects, auto-registers sprite/portrait paths from unit configs, and validates all configs.
3. **Instantiate**: `state.js` `createState(mission)` spreads unit templates from missions, adds runtime fields (`id`, `hp`, `moved`, `acted`), and resolves any remaining string ability IDs via `setAbilityResolver`.
4. **Consume**: Combat, AI, UI, and renderer all read from the resolved ability objects on each unit.

### Target Type Plugin System (`systems/targeting.js`)
Targeting patterns are pluggable. Each target type defines `getRange()`, `getAffectedTiles()`, and `vfx` config. Three built-in types in `data/target-types/`: `melee`, `ranged`, `line`. To add a new one, create a file that calls `registerTargetType(name, definition)` and import it in `data/target-types/index.js`.

`grid.js` `getAttackRange()` and `combat.js` `executeAttack()`/`applyAttackEffects()` delegate entirely to these plugins — no hardcoded ability or unit type checks anywhere.

### Combat (`systems/combat.js`)
`executeAttack()` resolves VFX type/color/sound from ability config (with target type defaults as fallback), creates attack animation, plays VFX via `VFX_FACTORIES` lookup, then calls `applyAttackEffects()` which uses the target type's `getAffectedTiles()` to apply damage and pushes.

Push mechanics: blocked by mountains/edges (+1 bump damage), lethal terrain (water/chasm = instant kill), collision with another unit (both take +1 damage). Chain reactions supported.

### Sprite System (`systems/sprites.js`)
Sprites load async (fire-and-forget). Units without sprites fall back to procedural rendering automatically. `getSpriteFrame(unit, state)` resolves idle/attack/hurt frames based on animation state.

### Validation (`data/validate.js`)
Runs at startup via `initRegistry()`. Checks required fields, verifies ability IDs exist, confirms enemies have `aiPriority`. Logs errors to console but doesn't block the game.

### Dev Editor (`editor/`)
F2-toggled DOM overlay. Two tabs (Abilities/Units) with forms, live preview canvases, and Export (copies valid JS to clipboard). Changes apply to live game state but don't persist on reload.

## Workflow Rules

- **Plan Mode**: Before executing any new plan created via Plan Mode, save the plan to `docs/` as a markdown file with a descriptive name and the date/time in the filename (e.g., `docs/plan-add-cone-targeting-2026-03-15-1430.md`). Then proceed with implementation.

## Key Conventions

- **Adding a unit**: Add one object to `UNIT_TYPES` in `data/units.js` with `abilities` as string IDs and optional `spriteSheet`/`portrait` inline. Add corresponding ability to `data/abilities.js` if needed. No other files need editing.
- **Adding a target type**: Create `data/target-types/yourtype.js`, call `registerTargetType()`, import in `data/target-types/index.js`.
- **Adding sounds**: Call `registerSound(key, fn)` from `systems/audio.js`. Reference by key in ability's `sound` field.
- **Terrain types**: `GROUND`, `MOUNTAIN` (blocks movement/projectiles), `WATER`/`CHASM` (lethal on push), `BUILDING` (destructible, reduces grid power).
- `imageSmoothingEnabled = false` is set on all canvases for pixel art rendering.
- Animations use `performance.now()` timing with `requestAnimationFrame`.
