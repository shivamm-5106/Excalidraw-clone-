import type { Shape, FreehandShape } from "../types";
import { pointNearLine } from "../utils/geometry";

export function render(ctx: CanvasRenderingContext2D, shape: FreehandShape) {
  if (shape.points.length < 2) return;

  ctx.save();
  ctx.globalAlpha = shape.opacity / 100;
  ctx.strokeStyle = shape.strokeColor;
  ctx.lineWidth = shape.strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  const p0 = shape.points[0]!;
  ctx.moveTo(p0.x, p0.y);
  for (let i = 1; i < shape.points.length; i++) {
    const pi = shape.points[i]!;
    ctx.lineTo(pi.x, pi.y);
  }
  ctx.stroke();
  ctx.restore();
}

export function hitTest(shape: Shape, px: number, py: number): boolean {
  const f = shape as FreehandShape;
  if (f.points.length < 2) return false;
  const threshold = Math.max(8, f.strokeWidth + 4);
  for (let i = 1; i < f.points.length; i++) {
    const a = f.points[i - 1]!;
    const b = f.points[i]!;
    if (pointNearLine(px, py, a, b, threshold)) return true;
  }
  return false;
}
