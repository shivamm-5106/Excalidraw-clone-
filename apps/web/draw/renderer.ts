import type { Shape, DrawingState } from "./types";
import type { DrawingState as State } from "./state";
import * as rectModule from "./shapes/rectangle";
import * as ellipseModule from "./shapes/ellipse";
import * as diamondModule from "./shapes/diamond";
import * as lineModule from "./shapes/line";
import * as arrowModule from "./shapes/arrow";
import * as textModule from "./shapes/text";
import * as freehandModule from "./shapes/freehand";
import { getShapeBounds } from "./utils/geometry";

const renderers: Record<string, (ctx: CanvasRenderingContext2D, shape: any) => void> = {
  RECT: rectModule.render,
  ELLIPSE: ellipseModule.render,
  DIAMOND: diamondModule.render,
  LINE: lineModule.render,
  ARROW: arrowModule.render,
  TEXT: textModule.render,
  FREEHAND: freehandModule.render,
};

export function renderShape(ctx: CanvasRenderingContext2D, shape: Shape, isSelected: boolean) {
  const render = renderers[shape.type];
  if (render) render(ctx, shape);

  if (isSelected) {
    drawSelectionIndicators(ctx, shape);
  }
}

function drawSelectionIndicators(ctx: CanvasRenderingContext2D, shape: Shape) {
  const bounds = getShapeBounds(shape);
  const handleSize = 8;

  ctx.save();
  ctx.strokeStyle = "#4a90d9";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(bounds.x - 2, bounds.y - 2, bounds.width + 4, bounds.height + 4);
  ctx.setLineDash([]);

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#4a90d9";
  ctx.lineWidth = 1.5;

  const positions = [
    { x: bounds.x, y: bounds.y },
    { x: bounds.x + bounds.width / 2, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
    { x: bounds.x, y: bounds.y + bounds.height },
    { x: bounds.x, y: bounds.y + bounds.height / 2 },
  ];

  for (const pos of positions) {
    ctx.fillRect(pos.x - handleSize / 2, pos.y - handleSize / 2, handleSize, handleSize);
    ctx.strokeRect(pos.x - handleSize / 2, pos.y - handleSize / 2, handleSize, handleSize);
  }

  ctx.restore();
}

export function renderCanvas(state: State, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  const vp = state.viewport;
  ctx.translate(vp.offsetX, vp.offsetY);
  ctx.scale(vp.zoom, vp.zoom);

  if (state.showGrid) {
    drawGrid(ctx, vp.zoom);
  }

  for (const shape of state.getShapes()) {
    renderShape(ctx, shape, state.selectedIds.has(shape.id));
  }

  ctx.restore();
}

function drawGrid(ctx: CanvasRenderingContext2D, zoom: number) {
  if (zoom < 0.3) return;
  const gridSize = 20;
  const step = zoom < 0.5 ? gridSize * 5 : zoom < 1 ? gridSize * 2 : gridSize;
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 0.5;
  for (let x = -5000; x <= 5000; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, -5000);
    ctx.lineTo(x, 5000);
    ctx.stroke();
  }
  for (let y = -5000; y <= 5000; y += step) {
    ctx.beginPath();
    ctx.moveTo(-5000, y);
    ctx.lineTo(5000, y);
    ctx.stroke();
  }
  ctx.restore();
}
