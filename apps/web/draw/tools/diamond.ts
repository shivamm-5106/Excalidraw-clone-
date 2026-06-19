import type { Tool } from "./registry";
import type { DrawingState } from "../state";
import type { DiamondShape } from "../types";
import { renderCanvas } from "../renderer";

export class DiamondTool implements Tool {
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
    const cx = x + w / 2;
    const cy = y + h / 2;
    const hw = w / 2;
    const hh = h / 2;

    ctx.save();
    ctx.globalAlpha = state.styling.opacity / 100;
    ctx.strokeStyle = state.styling.strokeColor;
    ctx.lineWidth = state.styling.strokeWidth;
    if (state.styling.strokeStyle === "dashed") ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy - hh);
    ctx.lineTo(cx + hw, cy);
    ctx.lineTo(cx, cy + hh);
    ctx.lineTo(cx - hw, cy);
    ctx.closePath();
    if (state.styling.fillColor && state.styling.fillColor !== "transparent") {
      ctx.fillStyle = state.styling.fillColor;
      ctx.fill();
    }
    ctx.stroke();
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

    const shape: DiamondShape = {
      id: Math.random().toString(36).substring(2, 11),
      type: "DIAMOND",
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
