export type ShapeType = "RECT" | "ELLIPSE" | "DIAMOND" | "LINE" | "ARROW" | "TEXT" | "FREEHAND";

export type ToolType =
  | "select"
  | "rectangle"
  | "diamond"
  | "ellipse"
  | "arrow"
  | "line"
  | "text"
  | "freehand"
  | "eraser"
  | "pan";

export interface Point {
  x: number;
  y: number;
}

export interface StylingOptions {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  strokeStyle: "solid" | "dashed";
  fontSize: number;
  fontFamily: string;
}

export interface BaseShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  strokeStyle: "solid" | "dashed";
}

export interface RectShape extends BaseShape {
  type: "RECT";
  width: number;
  height: number;
}

export interface EllipseShape extends BaseShape {
  type: "ELLIPSE";
  width: number;
  height: number;
}

export interface DiamondShape extends BaseShape {
  type: "DIAMOND";
  width: number;
  height: number;
}

export interface LineShape extends BaseShape {
  type: "LINE";
  points: Point[];
}

export interface ArrowShape extends BaseShape {
  type: "ARROW";
  points: Point[];
}

export interface TextShape extends BaseShape {
  type: "TEXT";
  text: string;
  fontSize: number;
  fontFamily: string;
}

export interface FreehandShape extends BaseShape {
  type: "FREEHAND";
  points: Point[];
}

export type Shape = RectShape | EllipseShape | DiamondShape | LineShape | ArrowShape | TextShape | FreehandShape;

export interface Viewport {
  offsetX: number;
  offsetY: number;
  zoom: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HistoryEntry {
  shapes: Shape[];
  selectedIds: Set<string>;
}

export interface DrawingState {
  shapes: Shape[];
  selectedIds: Set<string>;
  activeTool: ToolType;
  styling: StylingOptions;
  viewport: Viewport;
  showGrid: boolean;
  history: Shape[][];
  historyIndex: number;
}

export const DEFAULT_STYLING: StylingOptions = {
  strokeColor: "#ffffff",
  fillColor: "transparent",
  strokeWidth: 2,
  opacity: 100,
  strokeStyle: "solid",
  fontSize: 20,
  fontFamily: "sans-serif",
};

export const DEFAULT_VIEWPORT: Viewport = {
  offsetX: 0,
  offsetY: 0,
  zoom: 1,
};

export function createId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function shapeToMessage(shape: Shape) {
  return {
    id: shape.id,
    type: shape.type,
    data: JSON.stringify(serializeShape(shape)),
  };
}

export function serializeShape(shape: Shape): Record<string, unknown> {
  return {
    x: shape.x,
    y: shape.y,
    width: "width" in shape ? shape.width : undefined,
    height: "height" in shape ? shape.height : undefined,
    points: "points" in shape ? shape.points : undefined,
    text: "text" in shape ? shape.text : undefined,
    fontSize: "fontSize" in shape ? shape.fontSize : undefined,
    fontFamily: "fontFamily" in shape ? shape.fontFamily : undefined,
    strokeColor: shape.strokeColor,
    fillColor: shape.fillColor,
    strokeWidth: shape.strokeWidth,
    opacity: shape.opacity,
    strokeStyle: shape.strokeStyle,
  };
}

export function deserializeShape(type: ShapeType, data: Record<string, unknown>, id: string): Shape {
  const base = {
    id,
    type,
    strokeColor: (data.strokeColor as string) || "#ffffff",
    fillColor: (data.fillColor as string) || "transparent",
    strokeWidth: (data.strokeWidth as number) || 2,
    opacity: (data.opacity as number) || 100,
    strokeStyle: (data.strokeStyle as "solid" | "dashed") || "solid",
    x: (data.x as number) || 0,
    y: (data.y as number) || 0,
  };

  switch (type) {
    case "RECT":
      return { ...base, type: "RECT", width: (data.width as number) || 0, height: (data.height as number) || 0 };
    case "ELLIPSE":
      return { ...base, type: "ELLIPSE", width: (data.width as number) || 0, height: (data.height as number) || 0 };
    case "DIAMOND":
      return { ...base, type: "DIAMOND", width: (data.width as number) || 0, height: (data.height as number) || 0 };
    case "LINE":
      return { ...base, type: "LINE", points: (data.points as Point[]) || [] };
    case "ARROW":
      return { ...base, type: "ARROW", points: (data.points as Point[]) || [] };
    case "TEXT":
      return {
        ...base,
        type: "TEXT",
        text: (data.text as string) || "",
        fontSize: (data.fontSize as number) || 20,
        fontFamily: (data.fontFamily as string) || "sans-serif",
      };
    case "FREEHAND":
      return { ...base, type: "FREEHAND", points: (data.points as Point[]) || [] };
  }
}
