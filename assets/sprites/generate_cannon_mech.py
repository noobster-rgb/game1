"""
Generate a 256x64 (4 frames) animated sprite sheet for the Cannon Mech.
Dome body, orange lightning bolt horns, purple tentacle arms with suction cups,
yellow eyes, tentacle legs - legs animate across frames.
"""
import math
from PIL import Image

FRAMES = 4
img = Image.new('RGBA', (64 * FRAMES, 64), (0, 0, 0, 0))

OUTLINE = (40, 40, 40, 255)
BODY = (220, 215, 210, 255)
BODY_SHADOW = (190, 185, 180, 255)
PURPLE_TENT = (140, 120, 190, 255)
PURPLE_DARK = (100, 80, 150, 255)
PURPLE_LIGHT = (165, 140, 210, 255)
SUCKER = (200, 180, 80, 255)
LIGHTNING = (220, 130, 60, 255)
LIGHTNING_DARK = (190, 100, 40, 255)
EYE_YELLOW = (220, 200, 80, 255)
EYE_PUPIL = (60, 30, 30, 255)
LEG = (200, 195, 190, 255)


def px(x, y, color, fo=0):
    ax = x + fo * 64
    if 0 <= ax < 64 * FRAMES and 0 <= y < 64:
        img.putpixel((ax, y), color)


def hline(x1, x2, y, color, fo=0):
    for x in range(x1, x2 + 1):
        px(x, y, color, fo)


def draw_body(fo):
    """Draw body, horns, eyes, arms (static across frames)."""

    # Lightning bolts
    bolt1 = [
        (22, 5), (23, 5), (24, 5), (23, 6), (24, 6), (25, 6),
        (21, 7), (22, 7), (23, 7), (22, 8), (23, 8), (24, 8),
        (20, 9), (21, 9), (22, 9), (21, 10), (22, 10), (23, 10),
        (23, 11), (24, 11), (24, 12), (25, 12),
    ]
    bolt1_out = [
        (21, 5), (25, 5), (22, 6), (26, 6), (20, 7), (24, 7),
        (21, 8), (25, 8), (19, 9), (23, 9), (20, 10), (24, 10),
        (22, 11), (25, 11), (23, 12), (26, 12),
    ]
    for (x, y) in bolt1: px(x, y, LIGHTNING, fo)
    for (x, y) in bolt1_out: px(x, y, LIGHTNING_DARK, fo)

    bolt2 = [
        (38, 5), (39, 5), (40, 5), (37, 6), (38, 6), (39, 6),
        (39, 7), (40, 7), (41, 7), (38, 8), (39, 8), (40, 8),
        (40, 9), (41, 9), (42, 9), (39, 10), (40, 10), (41, 10),
        (38, 11), (39, 11), (37, 12), (38, 12),
    ]
    bolt2_out = [
        (37, 5), (41, 5), (36, 6), (40, 6), (38, 7), (42, 7),
        (37, 8), (41, 8), (39, 9), (43, 9), (38, 10), (42, 10),
        (37, 11), (40, 11), (36, 12), (39, 12),
    ]
    for (x, y) in bolt2: px(x, y, LIGHTNING, fo)
    for (x, y) in bolt2_out: px(x, y, LIGHTNING_DARK, fo)

    # Dome body
    body = {
        14: (22, 41), 15: (20, 43), 16: (18, 45), 17: (16, 47),
        18: (14, 49), 19: (13, 50), 20: (12, 51), 21: (12, 51),
        22: (12, 51), 23: (12, 51), 24: (13, 50), 25: (13, 50),
        26: (14, 49), 27: (15, 48), 28: (16, 47), 29: (17, 46),
        30: (18, 45), 31: (19, 44), 32: (20, 43), 33: (21, 42),
        34: (22, 41),
    }
    for y, (x1, x2) in body.items():
        hline(x1, x2, y, BODY, fo)
    for y in range(28, 35):
        if y in body:
            x1, x2 = body[y]
            hline(x1, x2, y, BODY_SHADOW, fo)
    # Outline
    for y, (x1, x2) in body.items():
        px(x1, y, OUTLINE, fo)
        px(x2, y, OUTLINE, fo)
    hline(body[14][0], body[14][1], 14, OUTLINE, fo)
    hline(body[34][0], body[34][1], 34, OUTLINE, fo)

    # Eyes
    for (x, y) in [(26, 24), (27, 24), (28, 24), (26, 25), (27, 25), (28, 25)]:
        px(x, y, EYE_YELLOW, fo)
    px(27, 24, EYE_PUPIL, fo); px(27, 25, EYE_PUPIL, fo)

    for (x, y) in [(34, 24), (35, 24), (36, 24), (34, 25), (35, 25), (36, 25)]:
        px(x, y, EYE_YELLOW, fo)
    px(35, 24, EYE_PUPIL, fo); px(35, 25, EYE_PUPIL, fo)

    # Left arm (static)
    left_arm = [
        (13, 19), (12, 20), (11, 21), (10, 22), (9, 23), (8, 24),
        (7, 25), (6, 26), (5, 27), (5, 28), (6, 29), (7, 30),
        (8, 31), (9, 32),
    ]
    for i, (x, y) in enumerate(left_arm):
        px(x, y, PURPLE_DARK, fo)
        px(x + 1, y, PURPLE_TENT, fo)
        if i % 3 == 2: px(x + 1, y, SUCKER, fo)
        if i % 3 == 1: px(x + 1, y, PURPLE_LIGHT, fo)

    # Right arm (static)
    right_arm = [
        (50, 19), (51, 20), (52, 21), (53, 22), (54, 23), (55, 24),
        (56, 25), (57, 26), (58, 27), (58, 28), (57, 29), (56, 30),
        (55, 31), (54, 32),
    ]
    for i, (x, y) in enumerate(right_arm):
        px(x, y, PURPLE_DARK, fo)
        px(x - 1, y, PURPLE_TENT, fo)
        if i % 3 == 2: px(x - 1, y, SUCKER, fo)
        if i % 3 == 1: px(x - 1, y, PURPLE_LIGHT, fo)


def draw_tentacle(points, fo, mirror=False):
    for i, (x, y) in enumerate(points):
        px(x, y, PURPLE_DARK, fo)
        off = -1 if mirror else 1
        px(x + off, y, PURPLE_TENT, fo)
        if i % 3 == 1: px(x + off, y, PURPLE_LIGHT, fo)
        if i % 3 == 2: px(x + off, y, SUCKER, fo)


# Base leg paths
legs_base = [
    # Left leg
    ([(22, 34), (21, 35), (20, 36), (19, 37), (18, 38), (17, 39),
      (17, 40), (17, 41), (18, 42), (18, 43), (19, 44), (20, 45),
      (21, 46), (22, 47), (23, 48), (24, 49)], False),
    # Center-left leg
    ([(27, 34), (27, 35), (27, 36), (26, 37), (26, 38), (26, 39),
      (27, 40), (27, 41), (28, 42), (28, 43), (29, 44), (30, 45),
      (31, 46)], False),
    # Center-right leg
    ([(36, 34), (36, 35), (36, 36), (37, 37), (37, 38), (37, 39),
      (36, 40), (36, 41), (35, 42), (35, 43), (34, 44), (33, 45),
      (32, 46)], True),
    # Right leg
    ([(41, 34), (42, 35), (43, 36), (44, 37), (45, 38), (46, 39),
      (46, 40), (46, 41), (45, 42), (45, 43), (44, 44), (43, 45),
      (42, 46), (41, 47), (40, 48), (39, 49)], True),
]

# Generate all 4 frames
for frame in range(FRAMES):
    draw_body(frame)
    for idx, (base_pts, mirror) in enumerate(legs_base):
        phase_offset = idx * 0.8
        phase = ((frame / FRAMES) + phase_offset / FRAMES) * 2 * math.pi
        swayed = []
        for i, (bx, by) in enumerate(base_pts):
            t = i / max(len(base_pts) - 1, 1)
            offset = math.sin(phase + t * math.pi * 1.3) * 3.0 * t
            swayed.append((round(bx + offset), by))
        draw_tentacle(swayed, frame, mirror)

img.save('/home/user/game1/assets/sprites/cannonMech.png')
print(f"Saved cannonMech.png ({64 * FRAMES}x64, {FRAMES} frames)")
