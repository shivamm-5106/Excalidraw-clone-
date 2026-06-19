import type { Point, Shape, Bounds } from "../types";

export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function pointInRect(px: number, py: number, rx: number, ry: number, rw: number, rh: number): boolean {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

export function pointInEllipse(px: number, py: number, cx: number, cy: number, rx: number, ry: number): boolean {
  const dx = (px - cx) / rx;
  const dy = (py - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

export function pointInDiamond(px: number, py: number, cx: number, cy: number, hw: number, hh: number): boolean {
  const dx = Math.abs(px - cx);
  const dy = Math.abs(py - cy);
  return dx / hw + dy / hh <= 1;
}

export function pointNearLine(px: number, py: number, a: Point, b: Point, threshold: number): boolean {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const len2 = abx * abx + aby * aby;
  if (len2 === 0) return distance({ x: px, y: py }, a) <= threshold;
  let t = ((px - a.x) * abx + (py - a.y) * aby) / len2;
  t = Math.max(0, Math.min(1, t));
  const projx = a.x + t * abx;
  const projy = a.y + t * aby;
  return distance({ x: px, y: py }, { x: projx, y: projy }) <= threshold;
}

export function getPolygonBounds(points: Point[]): Bounds {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function getShapeBounds(shape: Shape): Bounds {
  if ("points" in shape && shape.points.length > 0) {
    const b = getPolygonBounds(shape.points);
    return { x: b.x, y: b.y, width: Math.max(b.width, 1), height: Math.max(b.height, 1) };
  }
  if (shape.type === "TEXT") {
    return { x: shape.x, y: shape.y, width: 200, height: shape.fontSize * 1.5 };
  }
  const s = shape as Shape & { width: number; height: number };
  return { x: shape.x, y: shape.y, width: Math.max(s.width, 1), height: Math.max(s.height, 1) };
}

export function getShapeCenter(shape: Shape): Point {
  const b = getShapeBounds(shape);
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

export function getResizeHandleAt(px: number, py: number, bounds: Bounds, handleSize: number): string | null {
  const hs = handleSize;
  const handles: Record<string, { x: number; y: number }> = {
    "nw": { x: bounds.x, y: bounds.y },
    "n": { x: bounds.x + bounds.width / 2, y: bounds.y },
    "ne": { x: bounds.x + bounds.width, y: bounds.y },
    "e": { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
    "se": { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    "s": { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
    "sw": { x: bounds.x, y: bounds.y + bounds.height },
    "w": { x: bounds.x, y: bounds.y + bounds.height / 2 },
  };
  for (const [key, pos] of Object.entries(handles)) {
    if (pointInRect(px, py, pos.x - hs / 2, pos.y - hs / 2, hs, hs)) {
      return key;
    }
  }
  return null;
}

export function normalizeRect(x1: number, y1: number, x2: number, y2: number): { x: number; y: number; width: number; height: number } {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

export function arrowHeadPoints(from: Point, to: Point, size: number): [Point, Point, Point] {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const a1 = angle + Math.PI / 6;
  const a2 = angle - Math.PI / 6;
  return [
    to,
    { x: to.x - size * Math.cos(a1), y: to.y - size * Math.sin(a1) },
    { x: to.x - size * Math.cos(a2), y: to.y - size * Math.sin(a2) },
  ];
}
