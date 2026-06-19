import type { Tool } from "./registry";
import type { DrawingState } from "../state";
import type { ArrowShape } from "../types";
import { renderCanvas } from "../renderer";
import { arrowHeadPoints } from "../utils/geometry";

export class ArrowTool implements Tool {
  cursor = "crosshair";
  private startX = 0;
  private startY = 0;
  private isDrawing = false;

  onMouseDown(e: MouseEvent, state: DrawingState, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const vp = state.viewport;
    this.startX = (e.offsetX - vp.offsetX) / vp.zoom;
    this.startY = (e.offsetY - vp.offsetY) / vp.zoom;
    this.isDrawing = true;
  }

  onMouseMove(e: MouseEvent, state: DrawingState, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    if (!this.isDrawing) return;
    const vp = state.viewport;
    const mx = (e.offsetX - vp.offsetX) / vp.zoom;
    const my = (e.offsetY - vp.offsetY) / vp.zoom;
    renderCanvas(state, ctx, canvas);
    ctx.save();
    ctx.globalAlpha = state.styling.opacity / 100;
    ctx.strokeStyle = state.styling.strokeColor;
    ctx.fillStyle = state.styling.strokeColor;
    ctx.lineWidth = state.styling.strokeWidth;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(this.startX, this.startY);
    ctx.lineTo(mx, my);
    ctx.stroke();

    const head = arrowHeadPoints(
      { x: this.startX, y: this.startY },
      { x: mx, y: my },
      Math.max(10, state.styling.strokeWidth * 5)
    );
    ctx.beginPath();
    ctx.moveTo(head[0].x, head[0].y);
    ctx.lineTo(head[1].x, head[1].y);
    ctx.lineTo(head[2].x, head[2].y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  onMouseUp(e: MouseEvent, state: DrawingState, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    const vp = state.viewport;
    const mx = (e.offsetX - vp.offsetX) / vp.zoom;
    const my = (e.offsetY - vp.offsetY) / vp.zoom;
    const dx = mx - this.startX;
    const dy = my - this.startY;
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;

    const shape: ArrowShape = {
      id: Math.random().toString(36).substring(2, 11),
      type: "ARROW",
      x: Math.min(this.startX, mx),
      y: Math.min(this.startY, my),
      points: [{ x: this.startX, y: this.startY }, { x: mx, y: my }],
      strokeColor: state.styling.strokeColor,
      fillColor: "transparent",
      strokeWidth: state.styling.strokeWidth,
      opacity: state.styling.opacity,
      strokeStyle: state.styling.strokeStyle,
    };
    state.addShape(shape);
    renderCanvas(state, ctx, canvas);
  }
}
