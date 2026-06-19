import type { Tool } from "./registry";
import type { DrawingState } from "../state";
import * as rectModule from "../shapes/rectangle";
import * as ellipseModule from "../shapes/ellipse";
import * as diamondModule from "../shapes/diamond";
import * as lineModule from "../shapes/line";
import * as arrowModule from "../shapes/arrow";
import * as textModule from "../shapes/text";
import * as freehandModule from "../shapes/freehand";
import type { Shape } from "../types";
import { renderCanvas } from "../renderer";

const shapeModules: Record<string, { hitTest: (shape: Shape, px: number, py: number) => boolean }> = {
  RECT: rectModule,
  ELLIPSE: ellipseModule,
  DIAMOND: diamondModule,
  LINE: lineModule,
  ARROW: arrowModule,
  TEXT: textModule,
  FREEHAND: freehandModule,
};

export class EraserTool implements Tool {
  cursor = "crosshair";

  onMouseDown(e: MouseEvent, state: DrawingState, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const vp = state.viewport;
    const mx = (e.offsetX - vp.offsetX) / vp.zoom;
    const my = (e.offsetY - vp.offsetY) / vp.zoom;

    const sorted = [...state.getShapes()].reverse();
    for (const shape of sorted) {
      const module = shapeModules[shape.type];
      if (module && module.hitTest(shape, mx, my)) {
        state.selectedIds.clear();
        state.selectedIds.add(shape.id);
        state.deleteSelectedShapes();
        renderCanvas(state, ctx, canvas);
        return;
      }
    }
  }

  onMouseMove(_e: MouseEvent, _state: DrawingState, _canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D) {}
  onMouseUp(_e: MouseEvent, _state: DrawingState, _canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D) {}
}
