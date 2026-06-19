import type { Shape, ToolType, StylingOptions, Viewport } from "./types";
import { DEFAULT_STYLING, DEFAULT_VIEWPORT } from "./types";
import { createHistory, pushHistory, undo, redo, canUndo, canRedo } from "./utils/history";

export type StateChangeListener = () => void;
export type ShapeAction = "add" | "update" | "delete" | "sync";

export class DrawingState {
  shapes: Shape[] = [];
  selectedIds: Set<string> = new Set();
  activeTool: ToolType = "select";
  styling: StylingOptions = { ...DEFAULT_STYLING };
  viewport: Viewport = { ...DEFAULT_VIEWPORT };
  showGrid: boolean = false;
  onNetworkSend: ((shape: Shape, action: ShapeAction) => void) | null = null;
  onNetworkSync: ((shapes: Shape[]) => void) | null = null;

  private history = createHistory();
  private listeners: StateChangeListener[] = [];

  subscribe(listener: StateChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    for (const l of this.listeners) l();
  }

  setTool(tool: ToolType) {
    this.activeTool = tool;
    this.notify();
  }

  setStyling(update: Partial<StylingOptions>) {
    Object.assign(this.styling, update);
    this.notify();
  }

  setViewport(update: Partial<Viewport>) {
    Object.assign(this.viewport, update);
    this.notify();
  }

  toggleGrid() {
    this.showGrid = !this.showGrid;
    this.notify();
  }

  getStylingForShape(): StylingOptions {
    return { ...this.styling };
  }

  addShape(shape: Shape) {
    this.shapes.push(shape);
    this.history = pushHistory(this.history, this.shapes);
    this.onNetworkSend?.(shape, "add");
    this.notify();
  }

  updateShape(id: string, updates: Partial<Shape>) {
    const idx = this.shapes.findIndex(s => s.id === id);
    if (idx === -1) return;
    this.shapes[idx] = { ...this.shapes[idx], ...updates } as Shape;
    this.notify();
  }

  deleteSelectedShapes() {
    const deleted = this.shapes.filter(s => this.selectedIds.has(s.id));
    this.shapes = this.shapes.filter(s => !this.selectedIds.has(s.id));
    this.selectedIds.clear();
    this.history = pushHistory(this.history, this.shapes);
    for (const s of deleted) this.onNetworkSend?.(s, "delete");
    this.notify();
  }

  selectShape(id: string, toggle: boolean = false) {
    if (toggle) {
      if (this.selectedIds.has(id)) {
        this.selectedIds.delete(id);
      } else {
        this.selectedIds.add(id);
      }
    } else {
      this.selectedIds.clear();
      this.selectedIds.add(id);
    }
    this.notify();
  }

  selectShapes(ids: string[], toggle: boolean = false) {
    if (toggle) {
      for (const id of ids) {
        if (this.selectedIds.has(id)) {
          this.selectedIds.delete(id);
        } else {
          this.selectedIds.add(id);
        }
      }
    } else {
      this.selectedIds.clear();
      for (const id of ids) this.selectedIds.add(id);
    }
    this.notify();
  }

  selectAll() {
    for (const s of this.shapes) {
      this.selectedIds.add(s.id);
    }
    this.notify();
  }

  clearSelection() {
    this.selectedIds.clear();
    this.notify();
  }

  getSelectedShapes(): Shape[] {
    return this.shapes.filter(s => this.selectedIds.has(s.id));
  }

  performUndo(): boolean {
    const shapes = undo(this.history);
    if (!shapes) return false;
    this.shapes = shapes;
    this.history.index--;
    this.selectedIds.clear();
    this.onNetworkSync?.(this.shapes);
    this.notify();
    return true;
  }

  performRedo(): boolean {
    const shapes = redo(this.history);
    if (!shapes) return false;
    this.shapes = shapes;
    this.history.index++;
    this.selectedIds.clear();
    this.onNetworkSync?.(this.shapes);
    this.notify();
    return true;
  }

  canUndo(): boolean {
    return canUndo(this.history);
  }

  canRedo(): boolean {
    return canRedo(this.history);
  }

  setShapes(shapes: Shape[]) {
    this.shapes = shapes;
    this.history = createHistory();
    this.history = pushHistory(this.history, this.shapes);
    this.selectedIds.clear();
    this.notify();
  }

  commitMove() {
    this.history = pushHistory(this.history, this.shapes);
    for (const id of this.selectedIds) {
      const s = this.shapes.find(shape => shape.id === id);
      if (s) this.onNetworkSend?.(s, "update");
    }
  }

  getShapes(): Shape[] {
    return this.shapes;
  }

  moveSelectedShapes(dx: number, dy: number) {
    for (const id of this.selectedIds) {
      const idx = this.shapes.findIndex(s => s.id === id);
      if (idx === -1) continue;
      const s = this.shapes[idx]!;
      this.shapes[idx] = { ...s, x: s.x + dx, y: s.y + dy } as Shape;
    }
    this.notify();
  }

  duplicateSelected() {
    const newShapes: Shape[] = [];
    for (const s of this.shapes) {
      if (this.selectedIds.has(s.id)) {
        const dup = { ...s, id: Math.random().toString(36).substring(2, 11), x: s.x + 20, y: s.y + 20 };
        newShapes.push(dup as Shape);
      }
    }
    this.selectedIds.clear();
    for (const s of newShapes) {
      this.shapes.push(s);
      this.selectedIds.add(s.id);
      this.onNetworkSend?.(s, "add");
    }
    this.history = pushHistory(this.history, this.shapes);
    this.notify();
  }

  getCursorForTool(): string {
    switch (this.activeTool) {
      case "select": return "default";
      case "pan": return "grab";
      case "text": return "text";
      case "eraser": return "crosshair";
      default: return "crosshair";
    }
  }

  resizeShape(id: string, handle: string, dx: number, dy: number) {
    const idx = this.shapes.findIndex(s => s.id === id);
    if (idx === -1) return;
    const s = this.shapes[idx]!;
    const updated = { ...s };

    if ("width" in s && "height" in s) {
      const rect = s as Shape & { width: number; height: number };
      let rx = rect.x;
      let ry = rect.y;
      let rw = rect.width;
      let rh = rect.height;
      switch (handle) {
        case "nw": rx += dx; ry += dy; rw -= dx; rh -= dy; break;
        case "n": ry += dy; rh -= dy; break;
        case "ne": ry += dy; rw += dx; rh -= dy; break;
        case "e": rw += dx; break;
        case "se": rw += dx; rh += dy; break;
        case "s": rh += dy; break;
        case "sw": rx += dx; rw -= dx; rh += dy; break;
        case "w": rx += dx; rw -= dx; break;
      }
      if (rw < 5) { if (handle.includes("w")) rx -= 5 - rw; rw = 5; }
      if (rh < 5) { if (handle.includes("n")) ry -= 5 - rh; rh = 5; }
      (updated as any).x = rx;
      (updated as any).y = ry;
      (updated as any).width = rw;
      (updated as any).height = rh;
    }

    if ("points" in s && (s as any).points && (s as any).points.length > 0) {
      const poly = s as Shape & { points: { x: number; y: number }[] };
      let newDx = dx, newDy = dy;
      switch (handle) {
        case "nw": break;
        case "n": newDx = 0; break;
        case "ne": break;
        case "e": newDy = 0; break;
        case "se": break;
        case "s": newDx = 0; break;
        case "sw": break;
        case "w": newDy = 0; break;
      }
      (updated as any).points = poly.points.map(p => ({ x: p.x + newDx, y: p.y + newDy }));
    }

    this.shapes[idx] = updated as Shape;
    this.notify();
  }
}
