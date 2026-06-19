import type { Tool } from "./registry";
import type { DrawingState } from "../state";
import type { Shape } from "../types";
import { getShapeBounds, getResizeHandleAt, pointInRect } from "../utils/geometry";
import { renderShape, renderCanvas } from "../renderer";
import * as rectModule from "../shapes/rectangle";
import * as ellipseModule from "../shapes/ellipse";
import * as diamondModule from "../shapes/diamond";
import * as lineModule from "../shapes/line";
import * as arrowModule from "../shapes/arrow";
import * as textModule from "../shapes/text";
import * as freehandModule from "../shapes/freehand";

const shapeModules: Record<string, { hitTest: (shape: Shape, px: number, py: number) => boolean }> = {
  RECT: rectModule,
  ELLIPSE: ellipseModule,
  DIAMOND: diamondModule,
  LINE: lineModule,
  ARROW: arrowModule,
  TEXT: textModule,
  FREEHAND: freehandModule,
};

export class SelectionTool implements Tool {
  cursor = "default";
  private isDragging = false;
  private isResizing = false;
  private isMultiSelecting = false;
  private resizeHandle: string | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private shapeStartPositions: { id: string; x: number; y: number }[] = [];
  private multiSelectRect: { x: number; y: number; width: number; height: number } | null = null;

  onMouseDown(e: MouseEvent, state: DrawingState, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const vp = state.viewport;
    const mx = (e.offsetX - vp.offsetX) / vp.zoom;
    const my = (e.offsetY - vp.offsetY) / vp.zoom;

    this.dragStartX = mx;
    this.dragStartY = my;

    const sortedShapes = [...state.getShapes()].reverse();
    let hitId: string | null = null;

    for (const shape of sortedShapes) {
      if (state.selectedIds.has(shape.id)) {
        const bounds = getShapeBounds(shape);
        const handle = getResizeHandleAt(mx, my, bounds, 10);
        if (handle) {
          this.isResizing = true;
          this.resizeHandle = handle;
          this.dragStartX = mx;
          this.dragStartY = my;
          return;
        }
      }
    }

    for (const shape of sortedShapes) {
      const module = shapeModules[shape.type];
      if (module && module.hitTest(shape, mx, my)) {
        hitId = shape.id;
        break;
      }
    }

    if (hitId) {
      if (e.shiftKey) {
        state.selectShape(hitId, true);
      } else if (!state.selectedIds.has(hitId)) {
        state.selectShape(hitId);
      }
      this.isDragging = true;
      this.shapeStartPositions = state.getSelectedShapes().map(s => ({ id: s.id, x: s.x, y: s.y }));
    } else {
      if (!e.shiftKey) state.clearSelection();
      this.isMultiSelecting = true;
      this.multiSelectRect = { x: mx, y: my, width: 0, height: 0 };
    }
    renderCanvas(state, ctx, canvas);
  }

  onMouseMove(e: MouseEvent, state: DrawingState, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const vp = state.viewport;
    const mx = (e.offsetX - vp.offsetX) / vp.zoom;
    const my = (e.offsetY - vp.offsetY) / vp.zoom;

    if (this.isResizing && this.resizeHandle) {
      const dx = (mx - this.dragStartX);
      const dy = (my - this.dragStartY);
      for (const id of state.selectedIds) {
        state.resizeShape(id, this.resizeHandle, dx, dy);
      }
      renderCanvas(state, ctx, canvas);
      return;
    }

    if (this.isDragging) {
      const dx = mx - this.dragStartX;
      const dy = my - this.dragStartY;
      for (const start of this.shapeStartPositions) {
        const idx = state.shapes.findIndex(s => s.id === start.id);
        if (idx !== -1) {
          state.shapes[idx] = { ...state.shapes[idx], x: start.x + dx, y: start.y + dy } as Shape;
        }
      }
      renderCanvas(state, ctx, canvas);
      return;
    }

    if (this.isMultiSelecting) {
      this.multiSelectRect = {
        x: Math.min(this.dragStartX, mx),
        y: Math.min(this.dragStartY, my),
        width: Math.abs(mx - this.dragStartX),
        height: Math.abs(my - this.dragStartY),
      };
      renderCanvas(state, ctx, canvas);
      if (this.multiSelectRect && this.multiSelectRect.width > 5) {
        ctx.save();
        ctx.strokeStyle = "#4a90d9";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(this.multiSelectRect.x, this.multiSelectRect.y, this.multiSelectRect.width, this.multiSelectRect.height);
        ctx.fillStyle = "rgba(74, 144, 217, 0.1)";
        ctx.fillRect(this.multiSelectRect.x, this.multiSelectRect.y, this.multiSelectRect.width, this.multiSelectRect.height);
        ctx.setLineDash([]);
        ctx.restore();
      }
      return;
    }

    const sortedShapes = [...state.getShapes()].reverse();
    let cursorSet = false;
    for (const shape of sortedShapes) {
      if (state.selectedIds.has(shape.id)) {
        const bounds = getShapeBounds(shape);
        const h = getResizeHandleAt(mx, my, bounds, 10);
        if (h) {
          canvas.style.cursor = getResizeCursor(h);
          cursorSet = true;
          break;
        }
      }
    }
    if (!cursorSet) {
      for (const shape of sortedShapes) {
        const module = shapeModules[shape.type];
        if (module && module.hitTest(shape, mx, my)) {
          canvas.style.cursor = "move";
          cursorSet = true;
          break;
        }
      }
    }
    if (!cursorSet) canvas.style.cursor = "default";
  }

  onMouseUp(e: MouseEvent, state: DrawingState, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const vp = state.viewport;
    const mx = (e.offsetX - vp.offsetX) / vp.zoom;
    const my = (e.offsetY - vp.offsetY) / vp.zoom;

    if (this.isDragging) {
      state.commitMove();
    }

    if (this.isResizing) {
      state.commitMove();
    }

    if (this.isMultiSelecting && this.multiSelectRect) {
      const r = this.multiSelectRect;
      if (r.width > 5 && r.height > 5) {
        const ids: string[] = [];
        for (const shape of state.getShapes()) {
          const bounds = getShapeBounds(shape);
          const inside = pointInRect(bounds.x, bounds.y, r.x, r.y, r.width, r.height) &&
            pointInRect(bounds.x + bounds.width, bounds.y + bounds.height, r.x, r.y, r.width, r.height);
          if (inside) ids.push(shape.id);
        }
        state.selectShapes(ids, e.shiftKey);
      }
    }

    this.isDragging = false;
    this.isResizing = false;
    this.isMultiSelecting = false;
    this.resizeHandle = null;
    this.multiSelectRect = null;
    this.shapeStartPositions = [];
    renderCanvas(state, ctx, canvas);
  }
}

function getResizeCursor(handle: string): string {
  const map: Record<string, string> = {
    nw: "nw-resize", n: "n-resize", ne: "ne-resize",
    e: "e-resize", se: "se-resize", s: "s-resize",
    sw: "sw-resize", w: "w-resize",
  };
  return map[handle] || "default";
}
