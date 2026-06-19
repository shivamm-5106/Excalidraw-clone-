import type { Tool } from "./registry";
import type { DrawingState } from "../state";
import type { FreehandShape, Point } from "../types";
import { renderCanvas } from "../renderer";

export class FreehandTool implements Tool {
  cursor = "crosshair";
  private isDrawing = false;
  private points: Point[] = [];

  onMouseDown(e: MouseEvent, state: DrawingState, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const vp = state.viewport;
    this.isDrawing = true;
    this.points = [{
      x: (e.offsetX - vp.offsetX) / vp.zoom,
      y: (e.offsetY - vp.offsetY) / vp.zoom,
    }];
  }

  onMouseMove(e: MouseEvent, state: DrawingState, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    if (!this.isDrawing) return;
    const vp = state.viewport;
    this.points.push({
      x: (e.offsetX - vp.offsetX) / vp.zoom,
      y: (e.offsetY - vp.offsetY) / vp.zoom,
    });
    renderCanvas(state, ctx, canvas);
    if (this.points.length < 2) return;
    ctx.save();
    ctx.globalAlpha = state.styling.opacity / 100;
    ctx.strokeStyle = state.styling.strokeColor;
    ctx.lineWidth = state.styling.strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    const fp0 = this.points[0]!;
    ctx.moveTo(fp0.x, fp0.y);
    for (let i = 1; i < this.points.length; i++) {
      const fpi = this.points[i]!;
      ctx.lineTo(fpi.x, fpi.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  onMouseUp(e: MouseEvent, state: DrawingState, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    if (this.points.length < 2) return;

    const minX = Math.min(...this.points.map(p => p.x));
    const minY = Math.min(...this.points.map(p => p.y));

    const shape: FreehandShape = {
      id: Math.random().toString(36).substring(2, 11),
      type: "FREEHAND",
      x: minX,
      y: minY,
      points: [...this.points],
      strokeColor: state.styling.strokeColor,
      fillColor: "transparent",
      strokeWidth: state.styling.strokeWidth,
      opacity: state.styling.opacity,
      strokeStyle: state.styling.strokeStyle,
    };
    state.addShape(shape);
    this.points = [];
    renderCanvas(state, ctx, canvas);
  }
}
