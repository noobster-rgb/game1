"""
Generate a 256x64 (4 frames) animated sprite sheet for the Combat Mech.
Sharp angular head, 6 eyes, dark slash markings, purple tentacles with suction cups.
Tentacles sway across 4 frames.
"""
import math
from PIL import Image

FRAMES = 4
img = Image.new('RGBA', (64 * FRAMES, 64), (0, 0, 0, 0))

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
SLASH_DARK = (50, 45, 45, 255)
EYE_GLOW = (220, 200, 50, 255)
EYE_PUPIL = (180, 40, 30, 255)
GREEN_ACC = (100, 170, 90, 255)


def px(x, y, color, frame_offset=0):
    ax = x + frame_offset * 64
    if 0 <= ax < 64 * FRAMES and 0 <= y < 64:
        img.putpixel((ax, y), color)


def hline(x1, x2, y, color, fo=0):
    for x in range(x1, x2 + 1):
        px(x, y, color, fo)


def draw_head(fo):
    """Draw the head (same for all frames)."""
    head = {
        2:  (31, 32),
        3:  (29, 34),
        4:  (27, 36),
        5:  (25, 38),
        6:  (23, 40),
        7:  (21, 42),
        8:  (19, 44),
        9:  (17, 46),
        10: (15, 48),
        11: (13, 50),
        12: (11, 52),
        13: (11, 52),
        14: (11, 52),
        15: (11, 52),
        16: (12, 51),
        17: (12, 51),
        18: (13, 50),
        19: (13, 50),
        20: (14, 49),
        21: (15, 48),
        22: (16, 47),
        23: (17, 46),
        24: (18, 45),
        25: (19, 44),
        26: (20, 43),
        27: (21, 42),
    }

    # Fill
    for y, (x1, x2) in head.items():
        hline(x1, x2, y, HEAD_LIGHT, fo)

    # Shadow
    for y in range(19, 28):
        if y in head:
            x1, x2 = head[y]
            hline(x1 + 1, x2 - 1, y, HEAD_MID, fo)
    for y in range(23, 28):
        if y in head:
            x1, x2 = head[y]
            hline(x1 + 2, x2 - 2, y, HEAD_DARK, fo)

    # Red/orange tinting
    for y in range(6, 22):
        if y not in head:
            continue
        x1, x2 = head[y]
        for x in range(x1 + 2, x2 - 1):
            if (x * 7 + y * 13) % 9 == 0:
                px(x, y, RED_TINT, fo)
            elif (x * 11 + y * 7) % 11 == 0:
                px(x, y, ORANGE_TINT, fo)

    # Green accents
    for coord in [(19, 9), (20, 9), (43, 9), (44, 9), (16, 14), (47, 14)]:
        px(coord[0], coord[1], GREEN_ACC, fo)

    # Outline
    for y, (x1, x2) in head.items():
        px(x1, y, OUTLINE, fo)
        px(x2, y, OUTLINE, fo)
    ys = sorted(head.keys())
    hline(head[ys[0]][0], head[ys[0]][1], ys[0], OUTLINE, fo)

    # Angular ridges
    for (x, y) in [(13, 12), (12, 13), (11, 14), (11, 15)]:
        px(x - 1, y, OUTLINE, fo)
    for (x, y) in [(50, 12), (51, 13), (52, 14), (52, 15)]:
        px(x + 1, y, OUTLINE, fo)

    # Slash markings
    slashes = [
        [(25, 4), (26, 4), (26, 5), (27, 5), (28, 6), (27, 7), (26, 8)],
        [(30, 3), (31, 3), (31, 4), (32, 4), (33, 5), (32, 6), (31, 7)],
        [(35, 4), (36, 4), (36, 5), (37, 5), (38, 6), (37, 7), (36, 8)],
        [(40, 5), (41, 5), (41, 6), (40, 7)],
    ]
    for slash in slashes:
        for (x, y) in slash:
            px(x, y, SLASH_DARK, fo)

    # 6 Eyes
    def draw_eye(cx, cy):
        for (x, y) in [(cx-1, cy), (cx, cy), (cx+1, cy), (cx-1, cy+1), (cx, cy+1), (cx+1, cy+1)]:
            px(x, y, EYE_GLOW, fo)
        px(cx, cy, EYE_PUPIL, fo)
        px(cx, cy+1, EYE_PUPIL, fo)

    draw_eye(24, 12)
    draw_eye(39, 12)
    draw_eye(22, 16)
    draw_eye(41, 16)
    draw_eye(25, 20)
    draw_eye(38, 20)


def sway_points(base_points, frame, amplitude=2.0, frequency=1.0):
    """Apply a sinusoidal sway to tentacle points. Points lower down sway more."""
    result = []
    phase = (frame / FRAMES) * 2 * math.pi
    for i, (bx, by) in enumerate(base_points):
        # Sway increases with distance from attachment point
        t = i / max(len(base_points) - 1, 1)
        offset = math.sin(phase + t * math.pi * frequency) * amplitude * t
        result.append((round(bx + offset), by))
    return result


def draw_tentacle(points, fo, mirror=False):
    for i, (x, y) in enumerate(points):
        px(x, y, PURPLE_DARK, fo)
        off = -1 if mirror else 1
        px(x + off, y, PURPLE_TENT, fo)
        if i % 3 == 1:
            px(x + off, y, PURPLE_LIGHT, fo)
        if i % 3 == 2:
            px(x + off, y, SUCKER, fo)


# Base tentacle paths (frame 0 positions)
tentacles_base = [
    # T1 far left
    ([(20, 26), (19, 27), (18, 28), (17, 29), (16, 30), (15, 31),
      (14, 32), (13, 33), (12, 34), (11, 35), (10, 36), (10, 37),
      (9, 38), (9, 39), (10, 40), (10, 41), (11, 42), (12, 43),
      (13, 44), (14, 45)], False),
    # T2 inner left
    ([(24, 26), (23, 27), (23, 28), (22, 29), (22, 30), (22, 31),
      (22, 32), (23, 33), (23, 34), (24, 35), (24, 36), (25, 37),
      (26, 38), (27, 39), (28, 40), (29, 41)], False),
    # T3 center
    ([(31, 26), (31, 27), (31, 28), (30, 29), (30, 30), (30, 31),
      (31, 32), (31, 33), (32, 34), (32, 35), (32, 36), (32, 37),
      (31, 38), (31, 39), (31, 40), (32, 41), (32, 42), (33, 43),
      (33, 44), (33, 45), (34, 46)], False),
    # T4 inner right
    ([(39, 26), (40, 27), (40, 28), (41, 29), (41, 30), (41, 31),
      (41, 32), (40, 33), (40, 34), (39, 35), (39, 36), (38, 37),
      (37, 38), (36, 39), (35, 40), (34, 41)], True),
    # T5 far right
    ([(43, 26), (44, 27), (45, 28), (46, 29), (47, 30), (48, 31),
      (49, 32), (50, 33), (51, 34), (52, 35), (53, 36), (53, 37),
      (54, 38), (54, 39), (53, 40), (53, 41), (52, 42), (51, 43),
      (50, 44), (49, 45)], True),
]

# Generate all 4 frames
for frame in range(FRAMES):
    draw_head(frame)
    for idx, (base_pts, mirror) in enumerate(tentacles_base):
        # Stagger phase per tentacle for organic feel
        phase_offset = idx * 0.7
        swayed = []
        phase = ((frame / FRAMES) + phase_offset / FRAMES) * 2 * math.pi
        for i, (bx, by) in enumerate(base_pts):
            t = i / max(len(base_pts) - 1, 1)
            offset = math.sin(phase + t * math.pi * 1.2) * 3.0 * t
            swayed.append((round(bx + offset), by))
        draw_tentacle(swayed, frame, mirror)

img.save('/home/user/game1/assets/sprites/combatMech.png')
print(f"Saved combatMech.png ({64 * FRAMES}x64, {FRAMES} frames)")
