import type { Shape, DiamondShape } from "../types";
import { pointInDiamond } from "../utils/geometry";

export function render(ctx: CanvasRenderingContext2D, shape: DiamondShape) {
  const cx = shape.x + shape.width / 2;
  const cy = shape.y + shape.height / 2;
  const hw = Math.abs(shape.width) / 2;
  const hh = Math.abs(shape.height) / 2;

  ctx.save();
  ctx.globalAlpha = shape.opacity / 100;
  ctx.strokeStyle = shape.strokeColor;
  ctx.lineWidth = shape.strokeWidth;
  ctx.setLineDash(shape.strokeStyle === "dashed" ? [8, 4] : []);

  ctx.beginPath();
  ctx.moveTo(cx, cy - hh);
  ctx.lineTo(cx + hw, cy);
  ctx.lineTo(cx, cy + hh);
  ctx.lineTo(cx - hw, cy);
  ctx.closePath();

  if (shape.fillColor && shape.fillColor !== "transparent") {
    ctx.fillStyle = shape.fillColor;
    ctx.fill();
  }

  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

export function hitTest(shape: Shape, px: number, py: number): boolean {
  const d = shape as DiamondShape;
  const cx = d.x + d.width / 2;
  const cy = d.y + d.height / 2;
  const hw = Math.abs(d.width) / 2;
  const hh = Math.abs(d.height) / 2;
  return pointInDiamond(px, py, cx, cy, hw, hh);
}
