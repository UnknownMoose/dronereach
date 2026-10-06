#!/usr/bin/env python3
"""Rebuild the static terrain artwork. Development only; no browser dependency.

Requires NumPy and contourpy. A single smooth height field produces all
16 elevation levels, so related contours nest and merge naturally at saddles.
The coordinate distortion and overlapping shoulders avoid regular ellipses.
"""

from pathlib import Path

import contourpy
import numpy as np


WIDTH, HEIGHT = 1600, 1000
STEP = 4
x = np.arange(0, WIDTH + STEP, STEP, dtype=float)
y = np.arange(0, HEIGHT + STEP, STEP, dtype=float)
xx, yy = np.meshgrid(x, y)
u, v = xx / WIDTH, yy / HEIGHT

# Low-frequency warping preserves a smooth landscape while varying its outlines.
wx = xx + 90 * np.sin(2 * np.pi * v + .25)
wx += 35 * np.sin(2 * np.pi * (.45 * u + .8 * v))
wx += 48 * np.sin(2 * np.pi * (2.1 * u + 1.3 * v) + .7)
wy = yy + 58 * np.sin(2 * np.pi * (.7 * u + .25 * v))
wy += 27 * np.sin(2 * np.pi * (.8 * u - 1.15 * v))
wy += 38 * np.sin(2 * np.pi * (1.4 * u - 1.6 * v) + 1.2)


def hill(cx, cy, sx, sy, angle, elevation):
    a = np.deg2rad(angle)
    dx, dy = wx - cx, wy - cy
    rx = dx * np.cos(a) + dy * np.sin(a)
    ry = -dx * np.sin(a) + dy * np.cos(a)
    return elevation * np.exp(-.5 * ((rx / sx) ** 2 + (ry / sy) ** 2))


terrain = hill(240, 195, 220, 180, -30, 1.25)
terrain += hill(1135, 220, 300, 180, 20, 1.12)
terrain += hill(900, 820, 250, 210, -20, 1.15)
terrain += hill(1620, 700, 260, 220, 25, .58)
terrain += hill(-110, 820, 280, 240, -15, .48)
# Off-axis shoulders give neighbouring hills different, asymmetric contours.
terrain += hill(480, 110, 190, 140, 30, .35)
terrain += hill(1280, 430, 150, 240, -20, .3)
terrain += hill(770, 1010, 155, 130, 40, .28)
terrain += hill(1040, 135, 110, 95, -10, .42)
terrain += hill(1250, 390, 130, 100, 15, .46)
terrain += hill(1060, 875, 115, 95, -25, .37)
terrain += hill(415, 235, 85, 125, -15, .34)
terrain += hill(90, 165, 70, 80, -10, .19)
# Broad depressions connect the summits through valleys and saddle passages.
terrain += hill(580, 555, 240, 210, -30, -.62)
terrain += hill(1440, 930, 230, 180, 15, -.33)
terrain += hill(1135, 255, 85, 115, -20, -.21)
terrain += .025 * np.sin(2 * np.pi * (1.4 * u + .6 * v))
terrain += .025 * np.sin(2 * np.pi * (.55 * u - 1.2 * v))

levels = np.linspace(-.24, 1.56, 16)
generator = contourpy.contour_generator(x=x, y=y, z=terrain, line_type="Separate")


def simplify(points, tolerance=.5):
    """Ramer–Douglas–Peucker, preserving subpixel accuracy at the SVG scale."""
    if len(points) < 3:
        return points
    start, end = points[0], points[-1]
    delta = end - start
    length = np.dot(delta, delta)
    if length == 0:
        distances = np.linalg.norm(points - start, axis=1)
    else:
        t = np.clip(((points - start) @ delta) / length, 0, 1)
        distances = np.linalg.norm(points - (start + t[:, None] * delta), axis=1)
    split = int(np.argmax(distances))
    if distances[split] <= tolerance:
        return points[[0, -1]]
    return np.concatenate((simplify(points[:split + 1], tolerance)[:-1],
                           simplify(points[split:], tolerance)))


paths = []
for level in levels:
    for points in generator.lines(level):
        closed = np.array_equal(points[0], points[-1])
        points = simplify(points)
        pairs = [f"{px:.1f},{py:.1f}" for px, py in points]
        path = "M" + "L".join(pairs)
        if closed:
            path += "Z"
        paths.append(f'<path d="{path}"/>')

svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" '
       'fill="none" stroke="#2B9FD6" stroke-width="1" '
       'stroke-linecap="round" stroke-linejoin="round" '
       'preserveAspectRatio="xMidYMid slice">\n'
       '<!-- 16 elevations of one smooth, warped terrain field. -->\n'
       + '\n'.join(paths) + '\n</svg>\n')
destination = Path(__file__).resolve().parents[1] / 'public/patterns/contours.svg'
destination.write_text(svg)
print(f'{destination.name}: {len(levels)} levels, {len(paths)} paths, '
      f'{len(svg.encode()):,} bytes')
