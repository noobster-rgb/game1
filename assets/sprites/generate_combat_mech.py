"""
Generate a 64x64 pixel art sprite for the Combat Mech - octopus monster style.
Based on the hand-drawn image: big rounded head, dark slash markings on top,
multiple purple tentacles with suction cups, menacing eyes.
"""

from PIL import Image, ImageDraw

img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))

# Color palette
OUTLINE = (40, 40, 40, 255)
HEAD_LIGHT = (210, 190, 195, 255)
HEAD_MID = (185, 165, 170, 255)
HEAD_DARK = (160, 140, 148, 255)
RED_TINT = (195, 140, 130, 255)
ORANGE_TINT = (210, 155, 120, 255)
PURPLE_TENT = (140, 115, 185, 255)
PURPLE_DARK = (105, 80, 150, 255)
PURPLE_LIGHT = (170, 145, 215, 255)
SUCKER = (200, 180, 120, 255)
SUCKER_DARK = (170, 150, 95, 255)
SLASH_DARK = (50, 45, 45, 255)
EYE_GLOW = (220, 200, 50, 255)
EYE_PUPIL = (180, 40, 30, 255)
GREEN_ACC = (100, 170, 90, 255)

def px(x, y, color):
    if 0 <= x < 64 and 0 <= y < 64:
        img.putpixel((x, y), color)

def hline(x1, x2, y, color):
    for x in range(x1, x2 + 1):
        px(x, y, color)

def fill_rows(rows, color):
    for y, (x1, x2) in rows.items():
        hline(x1, x2, y, color)

def outline_rows(rows):
    for y, (x1, x2) in rows.items():
        px(x1, y, OUTLINE)
        px(x2, y, OUTLINE)
    # top edge
    ys = sorted(rows.keys())
    if ys:
        hline(rows[ys[0]][0], rows[ys[0]][1], ys[0], OUTLINE)

# === BIG ROUND OCTOPUS HEAD ===
head = {
    4:  (25, 38),
    5:  (22, 41),
    6:  (20, 43),
    7:  (18, 45),
    8:  (16, 47),
    9:  (15, 48),
    10: (14, 49),
    11: (13, 50),
    12: (12, 51),
    13: (12, 51),
    14: (11, 52),
    15: (11, 52),
    16: (11, 52),
    17: (11, 52),
    18: (12, 51),
    19: (12, 51),
    20: (13, 50),
    21: (13, 50),
    22: (14, 49),
    23: (15, 48),
    24: (16, 47),
    25: (17, 46),
    26: (18, 45),
    27: (19, 44),
    28: (20, 43),
}

# Fill head
fill_rows(head, HEAD_LIGHT)
# Shadow on lower portion
for y in range(20, 29):
    if y in head:
        x1, x2 = head[y]
        hline(x1 + 1, x2 - 1, y, HEAD_MID)
for y in range(24, 29):
    if y in head:
        x1, x2 = head[y]
        hline(x1 + 2, x2 - 2, y, HEAD_DARK)

# Red/orange tinting across head
for y in range(8, 24):
    if y not in head:
        continue
    x1, x2 = head[y]
    for x in range(x1 + 2, x2 - 1):
        if (x * 7 + y * 13) % 9 == 0:
            px(x, y, RED_TINT)
        elif (x * 11 + y * 7) % 11 == 0:
            px(x, y, ORANGE_TINT)

# Green accent highlights
for coord in [(20, 10), (21, 10), (42, 10), (43, 10), (18, 17), (45, 17)]:
    px(coord[0], coord[1], GREEN_ACC)

# Outline head
outline_rows(head)

# === DARK SLASH MARKINGS on top of head ===
slashes = [
    # Slash 1
    [(24, 5), (25, 5), (25, 6), (26, 6), (27, 7), (26, 8), (25, 9)],
    # Slash 2
    [(29, 5), (30, 5), (30, 6), (31, 6), (32, 7), (31, 8), (30, 9)],
    # Slash 3
    [(34, 5), (35, 5), (35, 6), (36, 6), (37, 7), (36, 8), (35, 9)],
    # Slash 4
    [(39, 6), (40, 6), (40, 7), (39, 8)],
]
for slash in slashes:
    for (x, y) in slash:
        px(x, y, SLASH_DARK)

# === EYES - menacing yellow with red pupils ===
# Left eye
for (x, y) in [(23, 17), (24, 17), (25, 17), (23, 18), (24, 18), (25, 18), (24, 19)]:
    px(x, y, EYE_GLOW)
for (x, y) in [(24, 17), (24, 18)]:
    px(x, y, EYE_PUPIL)

# Right eye
for (x, y) in [(38, 17), (39, 17), (40, 17), (38, 18), (39, 18), (40, 18), (39, 19)]:
    px(x, y, EYE_GLOW)
for (x, y) in [(39, 17), (39, 18)]:
    px(x, y, EYE_PUPIL)

# === TENTACLES - 5 dangling from below the head ===

def draw_tentacle(points, suckers):
    """Draw a tentacle from a list of (x,y) points with suckers at certain indices."""
    for i, (x, y) in enumerate(points):
        px(x, y, PURPLE_DARK)
        px(x + 1, y, PURPLE_DARK)
        # Fill interior
        px(x, y, PURPLE_DARK)
        if i > 0:
            px(x + 1, y, PURPLE_TENT)
    # Lighter highlights
    for i in range(1, len(points), 3):
        x, y = points[i]
        px(x + 1, y, PURPLE_LIGHT)
    # Suction cups
    for idx in suckers:
        if idx < len(points):
            x, y = points[idx]
            px(x + 1, y, SUCKER)

# Tentacle 1 (far left) - curls left
t1 = [(19, 27), (18, 28), (17, 29), (16, 30), (15, 31), (14, 32),
      (13, 33), (12, 34), (11, 35), (10, 36), (10, 37), (9, 38),
      (9, 39), (9, 40), (10, 41), (10, 42), (11, 43), (12, 44),
      (13, 45), (14, 46)]
for i, (x, y) in enumerate(t1):
    px(x, y, PURPLE_DARK)
    px(x + 1, y, PURPLE_TENT)
    if i % 3 == 1:
        px(x + 1, y, PURPLE_LIGHT)
for idx in [2, 5, 8, 11, 14, 17]:
    if idx < len(t1):
        px(t1[idx][0] + 1, t1[idx][1], SUCKER)

# Tentacle 2 (inner left)
t2 = [(23, 27), (22, 28), (22, 29), (21, 30), (21, 31), (21, 32),
      (21, 33), (22, 34), (22, 35), (23, 36), (23, 37), (24, 38),
      (25, 39), (26, 40), (27, 41), (28, 42), (29, 43)]
for i, (x, y) in enumerate(t2):
    px(x, y, PURPLE_DARK)
    px(x + 1, y, PURPLE_TENT)
    if i % 3 == 0:
        px(x + 1, y, PURPLE_LIGHT)
for idx in [1, 4, 7, 10, 13, 16]:
    if idx < len(t2):
        px(t2[idx][0] + 1, t2[idx][1], SUCKER)

# Tentacle 3 (center) - hangs straight down
t3 = [(31, 27), (31, 28), (31, 29), (30, 30), (30, 31), (30, 32),
      (31, 33), (31, 34), (32, 35), (32, 36), (32, 37), (32, 38),
      (31, 39), (31, 40), (31, 41), (32, 42), (32, 43), (33, 44),
      (33, 45), (33, 46), (34, 47)]
for i, (x, y) in enumerate(t3):
    px(x, y, PURPLE_DARK)
    px(x + 1, y, PURPLE_TENT)
    if i % 3 == 2:
        px(x + 1, y, PURPLE_LIGHT)
for idx in [2, 5, 8, 11, 14, 17, 20]:
    if idx < len(t3):
        px(t3[idx][0] + 1, t3[idx][1], SUCKER)

# Tentacle 4 (inner right)
t4 = [(38, 27), (39, 28), (39, 29), (40, 30), (40, 31), (40, 32),
      (40, 33), (39, 34), (39, 35), (38, 36), (38, 37), (37, 38),
      (36, 39), (35, 40), (35, 41), (34, 42)]
for i, (x, y) in enumerate(t4):
    px(x, y, PURPLE_DARK)
    px(x + 1, y, PURPLE_TENT)
    if i % 3 == 1:
        px(x + 1, y, PURPLE_LIGHT)
for idx in [1, 4, 7, 10, 13]:
    if idx < len(t4):
        px(t4[idx][0] + 1, t4[idx][1], SUCKER)

# Tentacle 5 (far right) - curls right
t5 = [(43, 27), (44, 28), (45, 29), (46, 30), (47, 31), (48, 32),
      (49, 33), (50, 34), (51, 35), (52, 36), (52, 37), (53, 38),
      (53, 39), (53, 40), (52, 41), (52, 42), (51, 43), (50, 44),
      (49, 45), (48, 46)]
for i, (x, y) in enumerate(t5):
    px(x, y, PURPLE_DARK)
    px(x - 1, y, PURPLE_TENT)  # mirrored
    if i % 3 == 1:
        px(x - 1, y, PURPLE_LIGHT)
for idx in [2, 5, 8, 11, 14, 17]:
    if idx < len(t5):
        px(t5[idx][0] - 1, t5[idx][1], SUCKER)

img.save('/home/user/game1/assets/sprites/combatMech.png')
print("Saved combatMech.png (64x64)")
