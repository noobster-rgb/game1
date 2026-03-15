"""
Generate a 64x64 pixel art sprite for the Combat Mech based on the hand-drawn image.
The drawing shows:
- A wide, flat manta/stingray-shaped body
- Dark angular slash markings on top of the head
- Multiple purple tentacles hanging down with suction cups/dots
- Red/orange streaky coloring across the body
- Green accent highlights
"""

from PIL import Image, ImageDraw

img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Color palette
OUTLINE = (40, 40, 40, 255)
BODY_LIGHT = (225, 220, 215, 255)
BODY_MID = (200, 195, 190, 255)
RED_STREAK = (210, 130, 100, 255)
RED_DARK = (180, 100, 70, 255)
ORANGE_STREAK = (220, 150, 100, 255)
GREEN_ACC = (120, 180, 100, 255)
PURPLE_TENT = (140, 115, 185, 255)
PURPLE_DARK = (110, 85, 155, 255)
PURPLE_LIGHT = (165, 140, 210, 255)
SUCKER = (195, 175, 130, 255)
SLASH_DARK = (50, 45, 45, 255)
SLASH_MID = (80, 75, 75, 255)

def pixel(x, y, color):
    if 0 <= x < 64 and 0 <= y < 64:
        img.putpixel((x, y), color)

def hline(x1, x2, y, color):
    for x in range(x1, x2 + 1):
        pixel(x, y, color)

def draw_pixels(coords, color):
    for (x, y) in coords:
        pixel(x, y, color)

# === WIDE FLAT BODY (manta/stingray shape) ===
# The body is very wide and flat, pointed at the sides

# Top outline of body - wide angular shape
# Row by row from top
body_rows = {
    8:  (26, 37),   # narrow top
    9:  (23, 40),
    10: (20, 43),
    11: (17, 46),
    12: (14, 49),
    13: (11, 52),
    14: (8, 55),
    15: (6, 57),
    16: (4, 59),
    17: (3, 60),
    18: (2, 61),
    19: (1, 62),     # widest point
    20: (1, 62),
    21: (2, 61),
    22: (3, 60),
    23: (4, 59),
    24: (5, 58),
    25: (7, 56),
    26: (9, 54),
    27: (11, 52),
    28: (14, 49),
    29: (16, 47),
    30: (18, 45),
}

# Draw body fill
for y, (x1, x2) in body_rows.items():
    for x in range(x1, x2 + 1):
        pixel(x, y, BODY_LIGHT)

# Body shadow on lower half
for y in range(24, 31):
    if y in body_rows:
        x1, x2 = body_rows[y]
        for x in range(x1, x2 + 1):
            pixel(x, y, BODY_MID)

# Draw body outline
for y, (x1, x2) in body_rows.items():
    pixel(x1, y, OUTLINE)
    pixel(x2, y, OUTLINE)

# Top edge outline
for y in [8]:
    x1, x2 = body_rows[y]
    hline(x1, x2, y, OUTLINE)

# Bottom edge - connect the bottom rows
for y in [30]:
    x1, x2 = body_rows[y]
    hline(x1, x2, y, OUTLINE)

# === RED/ORANGE STREAKS across body ===
# Horizontal streaky coloring
for y in range(13, 28):
    if y not in body_rows:
        continue
    x1, x2 = body_rows[y]
    # Scattered red/orange pixels
    for x in range(x1 + 2, x2 - 1):
        if (x + y * 7) % 5 == 0:
            pixel(x, y, RED_STREAK)
        elif (x + y * 11) % 7 == 0:
            pixel(x, y, ORANGE_STREAK)
        elif (x + y * 13) % 11 == 0:
            pixel(x, y, RED_DARK)

# === GREEN ACCENT LINES ===
green_pixels = [
    (22, 15), (23, 15), (24, 16), (25, 17),
    (38, 15), (39, 15), (40, 16), (41, 17),
    (20, 22), (21, 22), (42, 22), (43, 22),
]
draw_pixels(green_pixels, GREEN_ACC)

# === DARK SLASH MARKINGS on top of head ===
# Angular dark marks like in the drawing - 3-4 slash marks

# Slash 1 (leftish)
slash1 = [
    (24, 9), (25, 9),
    (25, 10), (26, 10),
    (26, 11), (27, 11),
    (25, 12), (26, 12),
    (24, 13), (25, 13),
]
draw_pixels(slash1, SLASH_DARK)

# Slash 2
slash2 = [
    (29, 9), (30, 9),
    (30, 10), (31, 10),
    (31, 11), (32, 11),
    (30, 12), (31, 12),
    (29, 13), (30, 13),
]
draw_pixels(slash2, SLASH_DARK)

# Slash 3
slash3 = [
    (34, 9), (35, 9),
    (35, 10), (36, 10),
    (36, 11), (37, 11),
    (35, 12), (36, 12),
    (34, 13), (35, 13),
]
draw_pixels(slash3, SLASH_DARK)

# Slash 4
slash4 = [
    (38, 10), (39, 10),
    (39, 11), (40, 11),
    (38, 12), (39, 12),
]
draw_pixels(slash4, SLASH_MID)

# === TENTACLES hanging down ===
# 4 purple tentacles with suction cups hanging from the body

# Tentacle 1 (far left)
t1_outline = [
    (12, 28), (13, 28),
    (11, 29), (12, 29),
    (10, 30), (11, 30),
    (9, 31), (10, 31),
    (9, 32), (10, 32),
    (9, 33), (10, 33),
    (10, 34), (11, 34),
    (10, 35), (11, 35),
    (11, 36), (12, 36),
    (11, 37), (12, 37),
    (12, 38), (13, 38),
    (12, 39), (13, 39),
    (13, 40), (14, 40),
    (13, 41), (14, 41),
    (14, 42), (15, 42),
    (15, 43),
]
draw_pixels(t1_outline, PURPLE_DARK)
t1_fill = [
    (11, 31), (11, 32), (11, 33), (11, 34),
    (12, 35), (12, 36), (12, 37), (13, 38),
    (13, 39), (14, 40), (14, 41),
]
draw_pixels(t1_fill, PURPLE_TENT)
t1_suckers = [(11, 32), (12, 35), (12, 37), (13, 39), (14, 41)]
draw_pixels(t1_suckers, SUCKER)

# Tentacle 2 (center-left)
t2_outline = [
    (22, 29), (23, 29),
    (21, 30), (22, 30),
    (21, 31), (22, 31),
    (20, 32), (21, 32),
    (20, 33), (21, 33),
    (20, 34), (21, 34),
    (21, 35), (22, 35),
    (21, 36), (22, 36),
    (22, 37), (23, 37),
    (22, 38), (23, 38),
    (23, 39), (24, 39),
    (24, 40), (25, 40),
    (25, 41), (26, 41),
    (26, 42), (27, 42),
    (27, 43), (28, 43),
    (28, 44),
]
draw_pixels(t2_outline, PURPLE_DARK)
t2_fill = [
    (22, 31), (21, 32), (21, 33), (21, 34),
    (22, 35), (22, 36), (23, 37), (23, 38),
    (24, 39), (25, 40), (26, 41), (27, 42),
]
draw_pixels(t2_fill, PURPLE_TENT)
t2_suckers = [(22, 32), (21, 34), (22, 36), (23, 38), (25, 40), (27, 42)]
draw_pixels(t2_suckers, SUCKER)

# Tentacle 3 (center-right)
t3_outline = [
    (34, 29), (35, 29),
    (34, 30), (35, 30),
    (35, 31), (36, 31),
    (35, 32), (36, 32),
    (36, 33), (37, 33),
    (36, 34), (37, 34),
    (36, 35), (37, 35),
    (37, 36), (38, 36),
    (37, 37), (38, 37),
    (37, 38), (38, 38),
    (38, 39), (39, 39),
    (38, 40), (39, 40),
    (39, 41), (40, 41),
    (39, 42),
]
draw_pixels(t3_outline, PURPLE_DARK)
t3_fill = [
    (35, 31), (36, 32), (36, 33), (37, 34),
    (37, 35), (37, 36), (38, 37), (38, 38),
    (38, 39), (39, 40), (39, 41),
]
draw_pixels(t3_fill, PURPLE_TENT)
t3_suckers = [(36, 32), (37, 34), (37, 36), (38, 38), (39, 40)]
draw_pixels(t3_suckers, SUCKER)

# Tentacle 4 (far right)
t4_outline = [
    (46, 28), (47, 28),
    (47, 29), (48, 29),
    (48, 30), (49, 30),
    (49, 31), (50, 31),
    (49, 32), (50, 32),
    (50, 33), (51, 33),
    (50, 34), (51, 34),
    (50, 35), (51, 35),
    (50, 36), (51, 36),
    (49, 37), (50, 37),
    (49, 38), (50, 38),
    (48, 39), (49, 39),
    (48, 40), (49, 40),
    (47, 41), (48, 41),
    (47, 42),
]
draw_pixels(t4_outline, PURPLE_DARK)
t4_fill = [
    (49, 31), (50, 32), (50, 33), (51, 34),
    (51, 35), (51, 36), (50, 37), (50, 38),
    (49, 39), (49, 40), (48, 41),
]
draw_pixels(t4_fill, PURPLE_TENT)
t4_suckers = [(50, 32), (51, 34), (51, 36), (50, 38), (49, 40)]
draw_pixels(t4_suckers, SUCKER)

# === Add some lighter purple highlights to tentacles ===
highlights = [
    (10, 31), (12, 36), (14, 40),
    (22, 31), (22, 35), (24, 39), (26, 41),
    (36, 31), (36, 34), (38, 37), (39, 41),
    (48, 30), (50, 34), (50, 37), (48, 40),
]
draw_pixels(highlights, PURPLE_LIGHT)

img.save('/home/user/game1/assets/sprites/combatMech.png')
print("Saved combatMech.png (64x64)")
