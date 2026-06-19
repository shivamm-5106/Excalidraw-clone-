import type { ToolType, Shape } from "../types";
import type { DrawingState } from "../state";
import { SelectionTool } from "./selection";
import { RectangleTool } from "./rectangle";
import { EllipseTool } from "./ellipse";
import { DiamondTool } from "./diamond";
import { LineTool } from "./line";
import { ArrowTool } from "./arrow";
import { TextTool } from "./text";
import { FreehandTool } from "./freehand";
import { EraserTool } from "./eraser";
import { PanTool } from "./pan";

export interface Tool {
  cursor: string;
  onMouseDown(e: MouseEvent, state: DrawingState, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void;
  onMouseMove(e: MouseEvent, state: DrawingState, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void;
  onMouseUp(e: MouseEvent, state: DrawingState, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void;
  onDblClick?(e: MouseEvent, state: DrawingState, canvas: HTMLCanvasElement): void;
}

const tools: Record<ToolType, Tool> = {
  select: new SelectionTool(),
  rectangle: new RectangleTool(),
  ellipse: new EllipseTool(),
  diamond: new DiamondTool(),
  line: new LineTool(),
  arrow: new ArrowTool(),
  text: new TextTool(),
  freehand: new FreehandTool(),
  eraser: new EraserTool(),
  pan: new PanTool(),
};

export function getTool(type: ToolType): Tool {
  return tools[type];
}

export type { ToolType };
