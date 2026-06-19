import type { Shape, EllipseShape } from "../types";
import { pointInEllipse } from "../utils/geometry";

export function render(ctx: CanvasRenderingContext2D, shape: EllipseShape) {
  const cx = shape.x + shape.width / 2;
  const cy = shape.y + shape.height / 2;
  const rx = Math.abs(shape.width) / 2;
  const ry = Math.abs(shape.height) / 2;

  ctx.save();
  ctx.globalAlpha = shape.opacity / 100;
  ctx.strokeStyle = shape.strokeColor;
  ctx.lineWidth = shape.strokeWidth;
  ctx.setLineDash(shape.strokeStyle === "dashed" ? [8, 4] : []);

  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);

  if (shape.fillColor && shape.fillColor !== "transparent") {
    ctx.fillStyle = shape.fillColor;
    ctx.fill();
  }

  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

export function hitTest(shape: Shape, px: number, py: number): boolean {
  const e = shape as EllipseShape;
  const cx = e.x + e.width / 2;
  const cy = e.y + e.height / 2;
  const rx = Math.abs(e.width) / 2;
  const ry = Math.abs(e.height) / 2;
  return pointInEllipse(px, py, cx, cy, rx, ry);
}
