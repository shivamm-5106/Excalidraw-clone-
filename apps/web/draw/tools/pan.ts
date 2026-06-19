import type { Tool } from "./registry";
import type { DrawingState } from "../state";

export class PanTool implements Tool {
  cursor = "grab";
  private isPanning = false;
  private startX = 0;
  private startY = 0;
  private startOffsetX = 0;
  private startOffsetY = 0;

  onMouseDown(e: MouseEvent, state: DrawingState, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.isPanning = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startOffsetX = state.viewport.offsetX;
    this.startOffsetY = state.viewport.offsetY;
    canvas.style.cursor = "grabbing";
  }

  onMouseMove(e: MouseEvent, state: DrawingState, _canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D) {
    if (!this.isPanning) return;
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    state.setViewport({
      offsetX: this.startOffsetX + dx,
      offsetY: this.startOffsetY + dy,
    });
  }

  onMouseUp(_e: MouseEvent, _state: DrawingState, canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D) {
    this.isPanning = false;
    canvas.style.cursor = "grab";
  }
}
