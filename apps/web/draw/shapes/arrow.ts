import type { Shape, ArrowShape } from "../types";
import { pointNearLine, arrowHeadPoints } from "../utils/geometry";

export function render(ctx: CanvasRenderingContext2D, shape: ArrowShape) {
  if (shape.points.length < 2) return;

  ctx.save();
  ctx.globalAlpha = shape.opacity / 100;
  ctx.strokeStyle = shape.strokeColor;
  ctx.fillStyle = shape.strokeColor;
  ctx.lineWidth = shape.strokeWidth;
  ctx.setLineDash(shape.strokeStyle === "dashed" ? [8, 4] : []);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  const ap0 = shape.points[0]!;
  ctx.moveTo(ap0.x, ap0.y);
  for (let i = 1; i < shape.points.length; i++) {
    const api = shape.points[i]!;
    ctx.lineTo(api.x, api.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  const from = shape.points[shape.points.length - 2]!;
  const to = shape.points[shape.points.length - 1]!;
  const headSize = Math.max(10, shape.strokeWidth * 5);
  const head = arrowHeadPoints(from, to, headSize);
  ctx.beginPath();
  ctx.moveTo(head[0].x, head[0].y);
  ctx.lineTo(head[1].x, head[1].y);
  ctx.lineTo(head[2].x, head[2].y);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

export function hitTest(shape: Shape, px: number, py: number): boolean {
  const a = shape as ArrowShape;
  if (a.points.length < 2) return false;
  const threshold = Math.max(8, a.strokeWidth + 4);
  for (let i = 1; i < a.points.length; i++) {
    const ap1 = a.points[i - 1]!;
    const ap2 = a.points[i]!;
    if (pointNearLine(px, py, ap1, ap2, threshold)) return true;
  }
  return false;
}
