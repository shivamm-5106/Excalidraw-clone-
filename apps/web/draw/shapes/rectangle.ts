import type { Shape, RectShape } from "../types";
import { pointInRect } from "../utils/geometry";

export function render(ctx: CanvasRenderingContext2D, shape: RectShape) {
  ctx.save();
  ctx.globalAlpha = shape.opacity / 100;
  ctx.strokeStyle = shape.strokeColor;
  ctx.lineWidth = shape.strokeWidth;
  ctx.setLineDash(shape.strokeStyle === "dashed" ? [8, 4] : []);

  if (shape.fillColor && shape.fillColor !== "transparent") {
    ctx.fillStyle = shape.fillColor;
    ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
  }

  ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
  ctx.setLineDash([]);
  ctx.restore();
}

export function hitTest(shape: Shape, px: number, py: number): boolean {
  const r = shape as RectShape;
  return pointInRect(px, py, r.x, r.y, r.width, r.height);
}
