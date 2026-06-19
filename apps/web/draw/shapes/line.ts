import type { Shape, LineShape } from "../types";
import { pointNearLine } from "../utils/geometry";

export function render(ctx: CanvasRenderingContext2D, shape: LineShape) {
  if (shape.points.length < 2) return;

  ctx.save();
  ctx.globalAlpha = shape.opacity / 100;
  ctx.strokeStyle = shape.strokeColor;
  ctx.lineWidth = shape.strokeWidth;
  ctx.setLineDash(shape.strokeStyle === "dashed" ? [8, 4] : []);
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
  ctx.setLineDash([]);
  ctx.restore();
}

export function hitTest(shape: Shape, px: number, py: number): boolean {
  const l = shape as LineShape;
  if (l.points.length < 2) return false;
  const threshold = Math.max(8, l.strokeWidth + 4);
  for (let i = 1; i < l.points.length; i++) {
    const a = l.points[i - 1]!;
    const b = l.points[i]!;
    if (pointNearLine(px, py, a, b, threshold)) return true;
  }
  return false;
}
