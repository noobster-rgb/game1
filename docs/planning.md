# Mech Tactics — Updated Planning Document

## Context

Mech Tactics is a browser-based tactical RPG built with vanilla JS + HTML5 Canvas. Inspired by Into The Breach's push mechanics with classic TRPG turn structure. The original planning docs covered two areas: (1) the core game implementation across 10 phases, and (2) a sprite integration system. This update reflects the current state of the repo — what's done, what's changed, and what remains.

---

## Tech Stack (unchanged)

- HTML5 Canvas for grid rendering + DOM overlay for UI
- Vanilla JS with ES modules (`<script type="module">`) — no build tools
- Opens directly in browser via `index.html`

## File Structure (current)

```
game1/
  index.html
  css/style.css
  js/
    main.js
    constants.js
    state.js
    systems/
      renderer.js
      input.js
      turn.js
      movement.js
      combat.js
      enemy-ai.js
      objectives.js
      ui.js
      animation.js
      sprites.js          # Added (sprite system)
      audio.js             # Added (procedural Web Audio)
    data/
      units.js
      missions.js
      abilities.js
    utils/
      grid.js
      events.js
  assets/
    sprites/
      combatMech.png       # 4-frame idle, 64x64 per frame
      cannonMech.png        # 4-frame idle, 64x64 per frame
      generate_combat_mech.py
      generate_cannon_mech.py
    portraits/
      combatMech_portrait.png    # 512x512
      cannonMech_portrait.png    # 512x512
```

**New files not in original plan:** `audio.js` (procedural sound FX via Web Audio API), `sprites.js` (sprite loading/frame system), Python sprite generators, portrait assets.

---

## Core Architecture Status

### Game State (`state.js`) — COMPLETE
Single state object: phase, grid (8x8), units[], gridPower, selectedUnitId, selectedAbility, highlightedTiles, animations, message/messageTimer. Helper functions: `createState()`, `getUnitAt()`, `getAliveUnits()`, `getTile()`.

### Turn Flow (`turn.js`) — COMPLETE
PLAYER_PHASE → ENEMY_PHASE → TURN_END → repeat. Auto-end when all player mechs exhausted. Enemy reinforcement spawning on specified turns.

### Push/Pull Mechanics (`combat.js`) — COMPLETE
- Push into blocked terrain/edge → +1 bump damage
- Push into water/chasm → instant kill
- Push into another unit → both take +1 bump damage
- Push into building → building destroyed, +1 to pushed unit
- Chain reactions supported
- Attack preview shows projected results

### Enemy AI (`enemy-ai.js`) — COMPLETE
- Per-type priority modes: `nearest` (hornet), `buildings` (scarab, beetle leader), `ranged` (firefly)
- Greedy approach: check attack range first → else move toward target → check again
- Sequential execution with 600ms animated delays

### VFX System (`renderer.js`) — COMPLETE (not in original plan)
5 VFX types: impact ring, arc projectile, beam, explosion, slash. All with particle effects.

### Audio System (`audio.js`) — COMPLETE (not in original plan)
Procedural Web Audio API sounds for: move, melee, cannon, artillery, explosion, hit, push, death.

### Portrait System (`renderer.js`) — COMPLETE (not in original plan)
512x512 portrait canvas in left panel. Renders portrait image if available, else sprite frame (2x), else procedural drawing.

---

## Unit Definitions (current)

### Player Mechs

| Mech | HP | Move | Ability | Effect |
|------|-----|------|---------|--------|
| Combat Mech | 3 | 3 | Titan Fist (melee) | 2 dmg + push |
| Artillery Mech | 2 | 3 | Artemis Artillery (ranged 4, min 2) | 1 dmg + push adjacent AoE |
| Cannon Mech | 3 | 3 | Taurus Cannon (line 8) | 1 dmg + linear push |

### Enemies

| Enemy | HP | Move | Attack | AI Priority |
|-------|-----|------|--------|-------------|
| Alpha Hornet | 1 | 4 | 1 dmg melee | nearest |
| Scarab | 3 | 2 | 2 dmg melee | buildings |
| Firefly | 1 | 3 | 1 dmg line | ranged |
| Beetle Leader | 5 | 2 | 3 dmg melee + push | buildings |

---

## Missions (current)

1. **Defend the Settlement** — 5 turns, 7 grid power. Spawns: turn 3 (hornet + scarab), turn 5 (beetle leader).
2. **The Beetle Hive** — 6 turns, 5 grid power. Chasm-heavy maze. Spawns: turn 3 (2 fireflies), turn 5 (2 hornets).

---

## Implementation Phases — Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Grid & Boilerplate | COMPLETE |
| 2 | Units | COMPLETE |
| 3 | Input & Selection | COMPLETE |
| 4 | Movement | COMPLETE |
| 5 | Combat & Abilities | COMPLETE |
| 6 | Enemy AI & Turn System | COMPLETE |
| 7 | Buildings & Grid Power | COMPLETE |
| 8 | Win/Lose & Mission Complete | COMPLETE |
| 9 | UI Polish | COMPLETE |
| 10 | Second Mission & Level Select | COMPLETE |

**All 10 original phases are implemented.** The game is a fully playable MVP.

### Beyond original plan (also complete):
- Procedural audio system
- VFX system (5 effect types with particles)
- Portrait rendering system
- Hover tooltips with unit info
- Mission select overlay
- Message banner system with auto-fade

---

## Sprite Integration — Status

### System (`sprites.js`) — COMPLETE
- `SPRITE_DEFS` registry mapping unit type → sprite config (src, frameWidth/Height, idle frames, attack/hurt frames, idleSpeed)
- `loadSprites()` — async image loading, fire-and-forget
- `getSprite(unitType)` / `getSpriteFrame(unit, state)` — frame resolution based on animation state
- Renderer checks for sprite first, falls back to procedural. Mixed rendering works.

### Sprite Assets — PARTIAL

| Unit Type | Sprite | Attack/Hurt Frames | Portrait |
|-----------|--------|-------------------|----------|
| combatMech | 4-frame idle | not yet | yes |
| cannonMech | 4-frame idle | not yet | yes |
| artilleryMech | **missing** | — | **missing** |
| alphaHornet | **missing** | — | — |
| scarab | **missing** | — | — |
| firefly | **missing** | — | — |
| beetleLeader | **missing** | — | — |

### Remaining sprite work:
1. **5 unit sprites needed:** artilleryMech, alphaHornet, scarab, firefly, beetleLeader (idle frames, 64x64 per frame)
2. **Attack/hurt frames** for all 7 units (currently `null` in SPRITE_DEFS for the 2 that exist)
3. **1 portrait needed:** artilleryMech (enemy portraits are optional)
4. **Register new sprites** in `SPRITE_DEFS` as each is provided
5. **`combat.js`** — set `unit.hurtUntil = performance.now() + 200` after damage for hurt-frame support (may already be partially implemented)

### Workflow per new sprite:
1. User provides hand-drawn image → analyze frames
2. Slice into expected format → save as `assets/sprites/{unitType}.png`
3. Add entry to `SPRITE_DEFS` in `sprites.js`
4. Game automatically uses it; others remain procedural

---

## Verification

1. Open `index.html` — grid renders with terrain, units display (mix of sprite + procedural)
2. Click mechs → selection highlights, movement range shows (blue)
3. Select ability → attack range shows (red), click target → attack executes with VFX
4. Push mechanics: wall bump (+1 dmg), water/chasm kill, unit collision (both +1 dmg)
5. End turn → enemy AI acts sequentially with animations → new turn
6. Buildings destroyed → grid power drops → game over at 0
7. Survive all turns with grid power > 0 → victory screen
8. Mission select works between two missions
9. Combat/cannon mechs render from sprites; artillery + all enemies render procedurally
