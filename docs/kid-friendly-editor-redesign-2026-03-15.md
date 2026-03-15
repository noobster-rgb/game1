# Plan: Kid-Friendly Editor UI Redesign

## Context

The current in-game editor (F2) works but is designed for developers: 13+ form fields, 12-14px fonts, dark cyberpunk theme, technical labels like "targetType" and "aoeRadius". The goal is to make it usable by a 7-year-old — big, colorful, visual, guided, and fun — while preserving the existing Pro Mode for advanced users.

---

## Architecture: Dual-Mode Editor

The existing editor files (`editor.js`, `ability-form.js`, `unit-form.js`, `export.js`, `editor.css`) remain untouched as "Pro Mode." A new kid-friendly wizard system layers on top as "Fun Mode" (the default). A toggle button switches between them.

---

## Phase 1: Foundation

### `js/editor/editor.js` (modify)
- Add `let editorMode = 'kid'` module variable
- In `toggleEditor()`, route to `buildKidEditor()` (from `kid-wizard.js`) when in kid mode
- Add a toggle button in top-right: gear icon, "Pro Mode" / "Fun Mode" label. Clicking tears down current overlay and rebuilds with the other mode

### `js/editor/kid-editor.css` (new)
Light, bright theme — opposite of current dark cyberpunk:
- `--kid-bg: #f0f4ff`, `--kid-primary: #4488ff`, `--kid-success: #44cc66`, `--kid-danger: #ff5566`, `--kid-gold: #ffd700`
- `--kid-text: #333`, `--kid-card-bg: #fff`, `--kid-radius: 16px`
- Body text: min 18px. Labels/headings: 24-32px bold. Inputs: min-height 52px, font-size 22px
- Buttons: min-height 52px, min-width 120px, font-size 20px, border-radius 12px
- Nav buttons (Next/Back): 200x60px, font-size 22px
- Template cards: 200x200px, border-radius 20px
- CSS keyframes: `pulse-glow`, `slide-in-right`, `slide-out-left`, `shake`, `bounce-in`, `sparkle`

### `js/editor/kid-templates.js` (new)
Preset starting points with kid-friendly names:

**Ability templates:**
| Preset | Label | Icon | Defaults |
|--------|-------|------|----------|
| punch | "Big Punch" | fist emoji | melee, dmg 2, range 1, push true |
| laser | "Laser Beam" | ray emoji | line, dmg 1, range 6 |
| bomb | "Boom Blast" | explosion emoji | ranged, dmg 1, range 4, aoe true |
| custom | "Make Your Own" | star emoji | empty defaults |

**Unit templates:**
| Preset | Label | Icon | Defaults |
|--------|-------|------|----------|
| mech | "Tough Mech" | robot emoji | player, HP 3, move 3, blue |
| bug | "Scary Bug" | bug emoji | enemy, HP 2, move 4, red |
| tank | "Big Tank" | shield emoji | player, HP 5, move 2, green |
| custom | "Make Your Own" | star emoji | empty defaults |

---

## Phase 2: Wizard Shell

### `js/editor/kid-wizard.js` (new)
Manages wizard state and navigation:
- `wizardState = { mode: 'ability'|'unit', step: 0, values: {} }`
- Step 0 = template selection (large colorful cards)
- Step indicator: 3-4 large circles (44px) connected by a line, current step has pulsing glow
- Large "Next" (green, right arrow) and "Back" (grey) nav buttons at bottom
- Final step: "Create!" button (gold, sparkle emoji)
- Single-column centered layout (max-width 900px)
- Step transitions: CSS slide-left/slide-right animations (300ms)
- Tabs at top: "Make an Attack" / "Build a Robot" (with icons)
- Horizontal strip of existing items (100x80px cards) for click-to-edit

---

## Phase 3: Ability Wizard

### `js/editor/kid-ability-wizard.js` (new)
3 steps after template selection:

**Step 1 — "Name Your Attack"**
- Large text input (28px font, 60px tall, 80% width)
- Label: "Give your attack a cool name!"
- Emoji picker: 12-16 common emojis as 48px clickable buttons in a grid
- Selected emoji gets glowing border
- Auto-generates camelCase ID from name (hidden)

**Step 2 — "How Does It Work?"**
- 3 large illustrated cards for target type (replacing dropdown):
  - "Up Close" (red, fist icon) = melee
  - "Far Away" (blue, projectile icon) = ranged
  - "In a Line" (green, beam icon) = line
- "How hard does it hit?" — large +/- circle buttons (60x60px) flanking a 48px number
- "How far can it reach?" — slider with 1-8 ticks, large value display (shown for ranged/line only)
- **350x350px preview grid** on the right, updating live. Range tiles pulse gently. Center unit drawn as a colored mech sprite

**Step 3 — "Extra Powers" (optional)**
- iOS-style toggle switches (60x30px) instead of checkboxes:
  - "Does it push enemies?"
  - "Does it hit everything nearby?" (AoE)
- VFX picker: 4 small animated canvas thumbnails (slash/beam/projectile/explosion)
- Sound picker: 4 speaker-icon buttons that play the sound on click
- "Show more options" expandable for pushDirection, description textarea

---

## Phase 4: Unit Wizard

### `js/editor/kid-unit-wizard.js` (new)
4 steps after template selection:

**Step 1 — "Name Your Robot"**
- Large text input for name
- Team selection: 2 large cards — "Your Team" (blue mech) vs "Enemy Team" (red bug)
- Symbol picker: clickable character buttons (C, A, T, S, M, X, B, R) at 36px

**Step 2 — "Paint Your Robot"**
- 8 pre-made color scheme palettes as 80x80px mech previews ("Ocean Blue", "Fire Red", etc.). Click one to set all 3 colors at once
- 3 individual color pickers (80x80 swatches) for body/accent/symbol
- **250x250px unit preview** updating live with idle bounce animation
- Label: "Pick colors for your robot!"

**Step 3 — "Power Up Your Robot"**
- HP as clickable heart icons (40x40px, up to 10). Filled hearts = current HP, grey outlines = empty slots
- Move range as clickable boot/footstep icons (same pattern, up to 8)
- Labels: "How tough is your robot?" / "How far can it walk?"

**Step 4 — "Give It Attacks"**
- Ability cards (150x100px): icon (32px), name (18px bold), one-line summary, small 3x3 range preview
- Scrollable flex-wrap grid. Bright border when selected, grey when not. Click to toggle
- "Create a New Attack" card at the end links to ability wizard
- "More Options" expandable for aiPriority, portrait, spriteSheet paths

---

## Phase 5: Enhanced Previews

### `js/editor/kid-preview.js` (new)
Reuses `drawAbilityPreview`/`getPreviewRange` logic from `ability-form.js` but enhanced:

**Ability preview (350x350px):**
- Rounded-corner grid cells, softer colors
- Center unit drawn as a proper mech (not just "U" square)
- Range tiles pulse with alpha 0.2-0.5 over ~1s (requestAnimationFrame loop)
- Transition animation when target type changes: old tiles fade, new tiles scale-in
- Directional arrows for line attacks

**Unit preview (250x250px):**
- Mech drawn at 4x size with idle bounce (sine wave, 2px bob)
- Green ground tile background
- HP hearts below the mech
- Unit name in speech-bubble above

Both previews use their own rAF loops, started on step mount, cancelled on unmount/close.

---

## Phase 6: Fun Feedback

### `js/editor/kid-feedback.js` (new)

**On "Create!" click:**
1. Celebratory sound: rising 3-note arpeggio (C5-E5-G5, triangle wave) via existing Web Audio API pattern from `audio.js`
2. Particle burst: 30-50 colored circles/stars from center, flying outward with gravity, fading over 1.5s. Temporary full-screen canvas (z-index 601)
3. Large toast: "You created [NAME]!" at 28px with item icon, bounce-in from top, auto-dismiss 3s

**Step transitions:** Soft "click" sound (800Hz triangle, 0.05s)

**Interactive:**
- Buttons: `transform: scale(1.05)` on hover
- Selected cards: bouncing glow border (box-shadow animation)
- +/- buttons: number flashes bigger (48px→56px, 200ms)
- Color changes: small sparkle particle burst on preview canvas

**Errors:**
- Empty name: input shakes (CSS keyframe), turns red briefly
- Speech-bubble tooltip: "Don't forget to give it a name!"

---

## Phase 7: Polish

- Edit mode: skip template step, pre-fill all fields, "Create!" becomes "Save Changes"
- Summary card after creation: "Make Another" or "Done" buttons
- Auto-deduplicate IDs (append number if ID exists)
- Responsive: preview stacks below form on narrow viewports

---

## File Summary

### New files (7)
```
js/editor/kid-wizard.js        — wizard shell, step management, navigation
js/editor/kid-ability-wizard.js — 3-step ability creation wizard
js/editor/kid-unit-wizard.js    — 4-step unit creation wizard
js/editor/kid-preview.js        — enhanced animated canvas previews
js/editor/kid-templates.js      — preset templates for abilities and units
js/editor/kid-feedback.js       — particles, sounds, celebrations
js/editor/kid-editor.css        — bright light theme, large sizes, animations
```

### Modified files (1)
```
js/editor/editor.js — add mode toggle (kid/pro), route to kid-wizard in kid mode
```

---

## Verification

1. Press F2 — editor opens in Fun Mode by default with bright colorful UI
2. Click "Make an Attack" → see template cards → pick "Big Punch" → wizard pre-fills melee values
3. Walk through all 3 steps — large inputs, emoji picker, target type cards, +/- buttons, preview updates live at 350x350
4. Click "Create!" — particles burst, sound plays, toast shows "You created [name]!"
5. Click "Build a Robot" → walk through 4 steps — heart HP, color palettes, ability card selection
6. Toggle to "Pro Mode" — existing dark editor appears unchanged
7. Edit an existing item in Fun Mode — fields pre-filled, no template step
8. Verify created items work in-game: select unit, use new ability, effects fire correctly
