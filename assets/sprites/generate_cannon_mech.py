"""
Generate a 256x64 (4 frames) animated sprite sheet for the Cannon Mech.
Original design: dome body, orange lightning bolt horns, purple tentacle arms
with suction cups, yellow eyes, three looping tentacle legs at the bottom.
Legs animate across frames.
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
SUCKER = (200, 180, 80, 255)
SUCKER_DARK = (160, 140, 60, 255)
LIGHTNING = (220, 130, 60, 255)
LIGHTNING_DARK = (190, 100, 40, 255)
EYE_YELLOW = (220, 200, 80, 255)
EYE_PUPIL = (60, 30, 30, 255)
LEG = (200, 195, 190, 255)


def px(x, y, color, fo=0):
    ax = x + fo * 64
    if 0 <= ax < 64 * FRAMES and 0 <= y < 64:
        img.putpixel((ax, y), color)


def draw_pixels(coords, color, fo=0):
    for (x, y) in coords:
        px(x, y, color, fo)


def draw_static(fo):
    """Draw everything that doesn't animate: horns, arms, body, eyes, bottom outline."""

    # === LEFT LIGHTNING BOLT HORN ===
    bolt1 = [
        (22, 5), (23, 5), (24, 5),
        (23, 6), (24, 6), (25, 6),
        (21, 7), (22, 7), (23, 7),
        (22, 8), (23, 8), (24, 8),
        (20, 9), (21, 9), (22, 9),
        (21, 10), (22, 10), (23, 10),
        (23, 11), (24, 11),
        (24, 12), (25, 12),
    ]
    draw_pixels(bolt1, LIGHTNING, fo)
    bolt1_outline = [
        (21, 5), (25, 5), (22, 6), (26, 6), (20, 7), (24, 7),
        (21, 8), (25, 8), (19, 9), (23, 9), (20, 10), (24, 10),
        (22, 11), (25, 11), (23, 12), (26, 12),
    ]
    draw_pixels(bolt1_outline, LIGHTNING_DARK, fo)

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
    draw_pixels(bolt2, LIGHTNING, fo)
    bolt2_outline = [
        (37, 5), (41, 5), (36, 6), (40, 6), (38, 7), (42, 7),
        (37, 8), (41, 8), (39, 9), (43, 9), (38, 10), (42, 10),
        (37, 11), (40, 11), (36, 12), (39, 12),
    ]
    draw_pixels(bolt2_outline, LIGHTNING_DARK, fo)

    # === LEFT TENTACLE ARM ===
    left_arm_outline = [
        (8, 18), (9, 18), (6, 19), (7, 19), (4, 20), (5, 20),
        (3, 21), (4, 21), (2, 22), (3, 22), (2, 23), (3, 23),
        (2, 24), (3, 24), (3, 25), (4, 25), (4, 26), (5, 26),
        (6, 27), (7, 27), (8, 28), (9, 28), (10, 29), (11, 29),
        (12, 30), (13, 30), (14, 31), (15, 31),
    ]
    draw_pixels(left_arm_outline, OUTLINE, fo)
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
    draw_pixels(left_arm_fill, PURPLE_TENT, fo)
    left_suckers = [(5, 22), (7, 23), (5, 24), (7, 25), (6, 26), (9, 27), (11, 28)]
    draw_pixels(left_suckers, SUCKER, fo)

    # === RIGHT TENTACLE ARM ===
    right_arm_outline = [
        (53, 18), (54, 18), (55, 19), (56, 19), (57, 20), (58, 20),
        (58, 21), (59, 21), (59, 22), (60, 22), (59, 23), (60, 23),
        (59, 24), (60, 24), (58, 25), (59, 25), (57, 26), (58, 26),
        (55, 27), (56, 27), (53, 28), (54, 28), (51, 29), (52, 29),
        (49, 30), (50, 30), (47, 31), (48, 31),
    ]
    draw_pixels(right_arm_outline, OUTLINE, fo)
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
    draw_pixels(right_arm_fill, PURPLE_TENT, fo)
    right_suckers = [(57, 22), (55, 23), (57, 24), (55, 25), (56, 26), (53, 27), (51, 28)]
    draw_pixels(right_suckers, SUCKER, fo)

    # === DOME BODY ===
    body_outline_top = []
    for x in range(22, 42):
        body_outline_top.append((x, 14))
    for y in range(15, 35):
        if y < 20:
            left_x = 22 - (y - 14)
        elif y < 25:
            left_x = 16 - (y - 20)
        else:
            left_x = 11
        if y < 20:
            right_x = 41 + (y - 14)
        elif y < 25:
            right_x = 47 + (y - 20)
        else:
            right_x = 52
        body_outline_top.append((left_x, y))
        body_outline_top.append((right_x, y))
    draw_pixels(body_outline_top, OUTLINE, fo)

    # Fill body
    for y in range(15, 35):
        if y < 20:
            lx = 22 - (y - 14) + 1
            rx = 41 + (y - 14)
        elif y < 25:
            lx = 16 - (y - 20) + 1
            rx = 47 + (y - 20)
        else:
            lx = 12
            rx = 52
        for x in range(lx, rx):
            px(x, y, BODY, fo)

    # Shadow on lower body
    for y in range(28, 35):
        lx = 12
        rx = 52
        for x in range(lx, rx):
            px(x, y, BODY_SHADOW, fo)

    # === EYES ===
    left_eye = [(26, 25), (27, 25), (26, 26), (27, 26), (28, 25), (28, 26)]
    draw_pixels(left_eye, EYE_YELLOW, fo)
    draw_pixels([(27, 25), (27, 26)], EYE_PUPIL, fo)

    right_eye = [(34, 25), (35, 25), (34, 26), (35, 26), (36, 25), (36, 26)]
    draw_pixels(right_eye, EYE_YELLOW, fo)
    draw_pixels([(35, 25), (35, 26)], EYE_PUPIL, fo)

    # Bottom outline of body connecting legs
    bottom_outline = [
        (11, 35), (12, 35), (13, 35), (14, 35), (15, 35),
        (18, 35), (19, 35), (20, 35), (21, 35),
        (22, 35), (23, 35), (24, 35), (25, 35),
        (26, 35), (27, 35),
        (30, 35), (31, 35), (32, 35), (33, 35),
        (34, 35), (35, 35), (36, 35), (37, 35),
        (40, 35), (41, 35), (42, 35), (43, 35),
        (44, 35), (45, 35), (46, 35), (47, 35),
        (48, 35), (49, 35), (50, 35), (51, 35), (52, 35),
    ]
    draw_pixels(bottom_outline, OUTLINE, fo)


# Base leg paths — the three looping tentacle legs from the original
# Each leg is a list of (x, y) points tracing the loop
left_leg_base = [
    (16, 35), (15, 36), (14, 37), (14, 38), (14, 39),
    (15, 40), (16, 41), (17, 42), (18, 43), (19, 44),
    (20, 45), (21, 46), (22, 47), (23, 48), (24, 49),
    (25, 48), (26, 47), (27, 46),
]

center_leg_base = [
    (29, 35), (28, 36), (28, 37), (27, 38), (27, 39),
    (27, 40), (28, 41), (29, 42), (30, 43), (31, 44),
    (32, 45), (33, 46), (34, 47), (35, 46), (36, 45),
    (37, 44),
]

right_leg_base = [
    (39, 35), (40, 36), (41, 37), (42, 38), (43, 39),
    (44, 40), (45, 41), (46, 42), (47, 43), (47, 44),
    (47, 45), (46, 46), (45, 47), (44, 48), (43, 49),
    (42, 48), (41, 47),
]

legs_base = [
    (left_leg_base, 0.0),
    (center_leg_base, 0.8),
    (right_leg_base, 1.6),
]


def draw_leg(points, fo):
    """Draw a leg as outline with fill pixels."""
    for i, (x, y) in enumerate(points):
        px(x, y, OUTLINE, fo)
        px(x + 1, y, OUTLINE, fo)
        # Fill interior pixel
        if i > 0:
            px(x, y, OUTLINE, fo)
            # Add a lighter fill pixel adjacent
            if i % 2 == 0:
                px(x + 1, y, LEG, fo)


# Generate all 4 frames
for frame in range(FRAMES):
    draw_static(frame)

    for base_pts, phase_offset in legs_base:
        phase = ((frame / FRAMES) + phase_offset / FRAMES) * 2 * math.pi
        swayed = []
        for i, (bx, by) in enumerate(base_pts):
            t = i / max(len(base_pts) - 1, 1)
            offset = math.sin(phase + t * math.pi * 1.2) * 3.0 * t
            swayed.append((round(bx + offset), by))
        draw_leg(swayed, frame)

img.save('/home/user/game1/assets/sprites/cannonMech.png')
print(f"Saved cannonMech.png ({64 * FRAMES}x64, {FRAMES} frames)")
