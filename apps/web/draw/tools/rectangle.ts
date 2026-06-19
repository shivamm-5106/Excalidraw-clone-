import type { Tool } from "./registry";
import type { DrawingState } from "../state";
import type { RectShape } from "../types";
import { renderCanvas } from "../renderer";

export class RectangleTool implements Tool {
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
    const x = Math.min(this.startX, mx);
    const y = Math.min(this.startY, my);
    const w = Math.abs(mx - this.startX);
    const h = Math.abs(my - this.startY);
    ctx.save();
    ctx.globalAlpha = state.styling.opacity / 100;
    ctx.strokeStyle = state.styling.strokeColor;
    ctx.lineWidth = state.styling.strokeWidth;
    if (state.styling.strokeStyle === "dashed") ctx.setLineDash([8, 4]);
    if (state.styling.fillColor && state.styling.fillColor !== "transparent") {
      ctx.fillStyle = state.styling.fillColor;
      ctx.fillRect(x, y, w, h);
    }
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
    ctx.restore();
  }

  onMouseUp(e: MouseEvent, state: DrawingState, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    const vp = state.viewport;
    const mx = (e.offsetX - vp.offsetX) / vp.zoom;
    const my = (e.offsetY - vp.offsetY) / vp.zoom;
    const x = Math.min(this.startX, mx);
    const y = Math.min(this.startY, my);
    const w = Math.abs(mx - this.startX);
    const h = Math.abs(my - this.startY);
    if (w < 2 && h < 2) return;

    const shape: RectShape = {
      id: Math.random().toString(36).substring(2, 11),
      type: "RECT",
      x, y, width: w, height: h,
      strokeColor: state.styling.strokeColor,
      fillColor: state.styling.fillColor,
      strokeWidth: state.styling.strokeWidth,
      opacity: state.styling.opacity,
      strokeStyle: state.styling.strokeStyle,
    };
    state.addShape(shape);
    renderCanvas(state, ctx, canvas);
  }
}
