import type { Tool } from "./registry";
import type { DrawingState } from "../state";
import type { TextShape } from "../types";
import { renderCanvas } from "../renderer";

export class TextTool implements Tool {
  cursor = "text";

  onMouseDown(e: MouseEvent, state: DrawingState, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const vp = state.viewport;
    const mx = (e.offsetX - vp.offsetX) / vp.zoom;
    const my = (e.offsetY - vp.offsetY) / vp.zoom;

    const shape: TextShape = {
      id: Math.random().toString(36).substring(2, 11),
      type: "TEXT",
      x: mx,
      y: my,
      text: "Text",
      fontSize: state.styling.fontSize,
      fontFamily: state.styling.fontFamily,
      strokeColor: state.styling.strokeColor,
      fillColor: "transparent",
      strokeWidth: state.styling.strokeWidth,
      opacity: state.styling.opacity,
      strokeStyle: state.styling.strokeStyle,
    };
    state.addShape(shape);
    state.setTool("select");
    state.selectShape(shape.id);
    renderCanvas(state, ctx, canvas);
  }

  onMouseMove(_e: MouseEvent, _state: DrawingState, _canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D) {}
  onMouseUp(_e: MouseEvent, _state: DrawingState, _canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D) {}
}
