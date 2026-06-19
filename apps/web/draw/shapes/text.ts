import type { Shape, TextShape } from "../types";

export function render(ctx: CanvasRenderingContext2D, shape: TextShape) {
  ctx.save();
  ctx.globalAlpha = shape.opacity / 100;
  ctx.strokeStyle = shape.strokeColor;
  ctx.fillStyle = shape.strokeColor;
  ctx.font = `${shape.fontSize}px ${shape.fontFamily}`;
  ctx.textBaseline = "top";

  const lines = shape.text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i] || "", shape.x, shape.y + i * shape.fontSize * 1.3);
  }

  ctx.restore();
}

export function hitTest(shape: Shape, px: number, py: number): boolean {
  const t = shape as TextShape;
  const lineHeight = t.fontSize * 1.3;
  const lines = t.text.split("\n");
  const height = lines.length * lineHeight;
  const maxWidth = Math.max(...lines.map(l => l.length)) * t.fontSize * 0.6;
  return px >= t.x && px <= t.x + maxWidth + 4 &&
         py >= t.y && py <= t.y + height + 4;
}
