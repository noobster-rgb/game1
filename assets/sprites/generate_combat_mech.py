"""
Generate a 64x64 pixel art sprite for the Combat Mech based on the hand-drawn image.
The drawing shows:
- Dome/bell-shaped body (light gray/white with black outline)
- Two purple tentacle arms with yellow/gold suction cup dots
- Two orange lightning bolt horns on top
- Two yellow eyes with dark pupils
- Three looping tentacle legs at the bottom
"""

from PIL import Image, ImageDraw

img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Color palette
OUTLINE = (40, 40, 40, 255)
BODY = (220, 215, 210, 255)
BODY_SHADOW = (190, 185, 180, 255)
PURPLE_TENT = (140, 120, 190, 255)
PURPLE_DARK = (100, 80, 150, 255)
SUCKER = (200, 180, 80, 255)
SUCKER_DARK = (160, 140, 60, 255)
LIGHTNING = (220, 130, 60, 255)
LIGHTNING_DARK = (190, 100, 40, 255)
EYE_YELLOW = (220, 200, 80, 255)
EYE_PUPIL = (60, 30, 30, 255)
LEG = (200, 195, 190, 255)

def pixel(x, y, color):
    if 0 <= x < 64 and 0 <= y < 64:
        img.putpixel((x, y), color)

def draw_pixels(coords, color):
    for (x, y) in coords:
        pixel(x, y, color)

# === LEFT LIGHTNING BOLT HORN ===
# Bolt shape going up-left from head
bolt1 = [
    # Main bolt
    (22, 5), (23, 5), (24, 5),
    (23, 6), (24, 6), (25, 6),
    (21, 7), (22, 7), (23, 7),
    (22, 8), (23, 8), (24, 8),
    (20, 9), (21, 9), (22, 9),
    (21, 10), (22, 10), (23, 10),
    (23, 11), (24, 11),
    (24, 12), (25, 12),
]
draw_pixels(bolt1, LIGHTNING)
# Outline/detail on bolts
bolt1_outline = [
    (21, 5), (25, 5),
    (22, 6), (26, 6),
    (20, 7), (24, 7),
    (21, 8), (25, 8),
    (19, 9), (23, 9),
    (20, 10), (24, 10),
    (22, 11), (25, 11),
    (23, 12), (26, 12),
]
draw_pixels(bolt1_outline, LIGHTNING_DARK)

# === RIGHT LIGHTNING BOLT HORN ===
bolt2 = [
    (38, 5), (39, 5), (40, 5),
    (37, 6), (38, 6), (39, 6),
    (39, 7), (40, 7), (41, 7),
    (38, 8), (39, 8), (40, 8),
    (40, 9), (41, 9), (42, 9),
    (39, 10), (40, 10), (41, 10),
    (38, 11), (39, 11),
    (37, 12), (38, 12),
]
draw_pixels(bolt2, LIGHTNING)
bolt2_outline = [
    (37, 5), (41, 5),
    (36, 6), (40, 6),
    (38, 7), (42, 7),
    (37, 8), (41, 8),
    (39, 9), (43, 9),
    (38, 10), (42, 10),
    (37, 11), (40, 11),
    (36, 12), (39, 12),
]
draw_pixels(bolt2_outline, LIGHTNING_DARK)

# === LEFT TENTACLE ARM ===
# Curved arm going up-left with suction cups
left_arm_outline = [
    (8, 18), (9, 18),
    (6, 19), (7, 19),
    (4, 20), (5, 20),
    (3, 21), (4, 21),
    (2, 22), (3, 22),
    (2, 23), (3, 23),
    (2, 24), (3, 24),
    (3, 25), (4, 25),
    (4, 26), (5, 26),
    (6, 27), (7, 27),
    (8, 28), (9, 28),
    (10, 29), (11, 29),
    (12, 30), (13, 30),
    (14, 31), (15, 31),
]
draw_pixels(left_arm_outline, OUTLINE)

left_arm_fill = [
    (5, 21), (6, 21), (7, 21), (8, 21),
    (4, 22), (5, 22), (6, 22), (7, 22),
    (4, 23), (5, 23), (6, 23), (7, 23),
    (4, 24), (5, 24), (6, 24), (7, 24),
    (5, 25), (6, 25), (7, 25), (8, 25),
    (6, 26), (7, 26), (8, 26), (9, 26),
    (8, 27), (9, 27), (10, 27),
    (10, 28), (11, 28), (12, 28),
    (12, 29), (13, 29),
]
draw_pixels(left_arm_fill, PURPLE_TENT)

# Suction cups on left arm
left_suckers = [
    (5, 22), (7, 23), (5, 24), (7, 25), (6, 26), (9, 27), (11, 28),
]
draw_pixels(left_suckers, SUCKER)

# === RIGHT TENTACLE ARM ===
right_arm_outline = [
    (53, 18), (54, 18),
    (55, 19), (56, 19),
    (57, 20), (58, 20),
    (58, 21), (59, 21),
    (59, 22), (60, 22),
    (59, 23), (60, 23),
    (59, 24), (60, 24),
    (58, 25), (59, 25),
    (57, 26), (58, 26),
    (55, 27), (56, 27),
    (53, 28), (54, 28),
    (51, 29), (52, 29),
    (49, 30), (50, 30),
    (47, 31), (48, 31),
]
draw_pixels(right_arm_outline, OUTLINE)

right_arm_fill = [
    (54, 21), (55, 21), (56, 21), (57, 21),
    (55, 22), (56, 22), (57, 22), (58, 22),
    (55, 23), (56, 23), (57, 23), (58, 23),
    (55, 24), (56, 24), (57, 24), (58, 24),
    (54, 25), (55, 25), (56, 25), (57, 25),
    (53, 26), (54, 26), (55, 26), (56, 26),
    (52, 27), (53, 27), (54, 27),
    (50, 28), (51, 28), (52, 28),
    (49, 29), (50, 29),
]
draw_pixels(right_arm_fill, PURPLE_TENT)

# Suction cups on right arm
right_suckers = [
    (57, 22), (55, 23), (57, 24), (55, 25), (56, 26), (53, 27), (51, 28),
]
draw_pixels(right_suckers, SUCKER)

# === DOME BODY ===
# Dome/bell shape - outline
body_outline_top = []
# Top curve of dome
for x in range(22, 42):
    body_outline_top.append((x, 14))
# Sides curving down
for y in range(15, 35):
    # Left side
    left_x = max(14, 22 - (y - 14) * 1)
    if y < 20:
        left_x = 22 - (y - 14)
    elif y < 25:
        left_x = 16 - (y - 20)
    else:
        left_x = 11
    body_outline_top.append((left_x, y))
    # Right side
    right_x = min(52, 41 + (y - 14) * 1)
    if y < 20:
        right_x = 41 + (y - 14)
    elif y < 25:
        right_x = 47 + (y - 20)
    else:
        right_x = 52
    body_outline_top.append((right_x, y))
draw_pixels(body_outline_top, OUTLINE)

# Fill body
for y in range(15, 35):
    if y < 20:
        left_x = 22 - (y - 14) + 1
        right_x = 41 + (y - 14)
    elif y < 25:
        left_x = 16 - (y - 20) + 1
        right_x = 47 + (y - 20)
    else:
        left_x = 12
        right_x = 52
    for x in range(left_x, right_x):
        pixel(x, y, BODY)

# Slight shadow on lower body
for y in range(28, 35):
    if y < 20:
        left_x = 22 - (y - 14) + 1
        right_x = 41 + (y - 14)
    elif y < 25:
        left_x = 16 - (y - 20) + 1
        right_x = 47 + (y - 20)
    else:
        left_x = 12
        right_x = 52
    for x in range(left_x, right_x):
        pixel(x, y, BODY_SHADOW)

# === EYES ===
# Left eye
left_eye = [(26, 25), (27, 25), (26, 26), (27, 26), (28, 25), (28, 26)]
draw_pixels(left_eye, EYE_YELLOW)
draw_pixels([(27, 25), (27, 26)], EYE_PUPIL)

# Right eye
right_eye = [(34, 25), (35, 25), (34, 26), (35, 26), (36, 25), (36, 26)]
draw_pixels(right_eye, EYE_YELLOW)
draw_pixels([(35, 25), (35, 26)], EYE_PUPIL)

# === TENTACLE LEGS ===
# Three looping tentacle legs at the bottom

# Left leg - loops down and back
left_leg = [
    (16, 35), (17, 35),
    (15, 36), (16, 36),
    (14, 37), (15, 37),
    (14, 38), (15, 38),
    (14, 39), (15, 39),
    (15, 40), (16, 40),
    (16, 41), (17, 41),
    (17, 42), (18, 42),
    (18, 43), (19, 43),
    (19, 44), (20, 44),
    (20, 45), (21, 45),
    (21, 46), (22, 46),
    (22, 47), (23, 47),
    (23, 48), (24, 48),
    (24, 49), (25, 49),
    (25, 48), (26, 48),
    (26, 47), (27, 47),
    (27, 46),
]
draw_pixels(left_leg, OUTLINE)
# Fill
left_leg_fill = [
    (15, 38), (15, 39), (16, 41),
    (18, 43), (20, 45), (22, 47), (24, 49), (25, 48),
]
draw_pixels(left_leg_fill, LEG)

# Center leg
center_leg = [
    (28, 35), (29, 35),
    (28, 36), (29, 36),
    (28, 37), (29, 37),
    (27, 38), (28, 38),
    (27, 39), (28, 39),
    (27, 40), (28, 40),
    (28, 41), (29, 41),
    (29, 42), (30, 42),
    (30, 43), (31, 43),
    (31, 44), (32, 44),
    (32, 45), (33, 45),
    (33, 46), (34, 46),
    (34, 47), (35, 47),
    (35, 46), (36, 46),
    (36, 45), (37, 45),
    (37, 44),
]
draw_pixels(center_leg, OUTLINE)

# Right leg
right_leg = [
    (38, 35), (39, 35),
    (39, 36), (40, 36),
    (40, 37), (41, 37),
    (41, 38), (42, 38),
    (42, 39), (43, 39),
    (43, 40), (44, 40),
    (44, 41), (45, 41),
    (45, 42), (46, 42),
    (46, 43), (47, 43),
    (47, 44), (48, 44),
    (47, 45), (48, 45),
    (46, 46), (47, 46),
    (45, 47), (46, 47),
    (44, 48), (45, 48),
    (43, 49), (44, 49),
    (42, 48), (43, 48),
    (41, 47),
]
draw_pixels(right_leg, OUTLINE)

# Bottom outline of body connecting legs
bottom_outline = [
    (11, 35),
    (12, 35), (13, 35), (14, 35), (15, 35),
    (18, 35), (19, 35), (20, 35), (21, 35),
    (22, 35), (23, 35), (24, 35), (25, 35),
    (26, 35), (27, 35),
    (30, 35), (31, 35), (32, 35), (33, 35),
    (34, 35), (35, 35), (36, 35), (37, 35),
    (40, 35), (41, 35), (42, 35), (43, 35),
    (44, 35), (45, 35), (46, 35), (47, 35),
    (48, 35), (49, 35), (50, 35), (51, 35), (52, 35),
]
draw_pixels(bottom_outline, OUTLINE)

img.save('/home/user/game1/assets/sprites/combatMech.png')
print("Saved combatMech.png (64x64)")
print(f"Image size: {img.size}")
