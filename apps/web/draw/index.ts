import axios from "axios";
import { DrawingState } from "./state";
import { renderCanvas } from "./renderer";
import { getTool } from "./tools/registry";
import type { ShapeType, Shape, StylingOptions } from "./types";
import { deserializeShape, serializeShape } from "./types";

export function initDraw(
  canvas: HTMLCanvasElement,
  slug: string,
  socket: WebSocket,
  roomId: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const state = new DrawingState();

  loadShapes(slug, state, ctx, canvas);

  state.onNetworkSend = (shape, action) => {
    if (socket.readyState !== WebSocket.OPEN) return;
    if (action === "delete") {
      socket.send(JSON.stringify({
        type: "delete_shape",
        roomId,
        shapeId: shape.id,
      }));
    } else {
      socket.send(JSON.stringify({
        type: "chat",
        roomId,
        message: { id: shape.id, type: shape.type, data: serializeShape(shape) },
      }));
    }
  };
  state.onNetworkSync = (shapes) => {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({
      type: "sync_shapes",
      roomId,
      shapes: shapes.map(s => ({ id: s.id, type: s.type, data: serializeShape(s) })),
    }));
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "chat") {
        const msg = data.message;
        const shape = parseShapeFromMessage(msg);
        if (shape) {
          const existing = state.getShapes().findIndex(s => s.id === shape.id);
          if (existing !== -1) {
            state.shapes[existing] = shape;
          } else {
            state.shapes.push(shape);
          }
          renderCanvas(state, ctx, canvas);
        }
      }
      if (data.type === "delete_shape") {
        state.shapes = state.shapes.filter(s => s.id !== data.shapeId);
        state.selectedIds.delete(data.shapeId);
        renderCanvas(state, ctx, canvas);
      }
      if (data.type === "sync_shapes") {
        const shapes = data.shapes.map((msg: any) => parseShapeFromMessage(msg)).filter(Boolean);
        state.setShapes(shapes);
        renderCanvas(state, ctx, canvas);
      }
      if (data.type === "join_room") {
        renderCanvas(state, ctx, canvas);
      }
    } catch (e) {
      console.error(e);
    }
  };

  function getCanvasPoint(e: MouseEvent): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function dispatchMouseEvent(type: "down" | "move" | "up", e: MouseEvent) {
    const tool = getTool(state.activeTool);
    const pt = getCanvasPoint(e);
    const customEvent = {
      type: e.type,
      clientX: e.clientX,
      clientY: e.clientY,
      offsetX: pt.x,
      offsetY: pt.y,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      altKey: e.altKey,
      button: e.button,
      buttons: e.buttons,
      preventDefault: () => e.preventDefault(),
      stopPropagation: () => e.stopPropagation(),
    } as unknown as MouseEvent;

    canvas.style.cursor = tool.cursor;

    switch (type) {
      case "down":
        tool.onMouseDown(customEvent, state, canvas, ctx!);
        break;
      case "move":
        tool.onMouseMove(customEvent, state, canvas, ctx!);
        break;
      case "up":
        tool.onMouseUp(customEvent, state, canvas, ctx!);
        break;
    }
  }

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 1) {
      state.setTool("pan");
      getTool("pan").onMouseDown(e, state, canvas, ctx);
      return;
    }
    if (e.button === 0) {
      dispatchMouseEvent("down", e);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    dispatchMouseEvent("move", e);
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (e.button === 1) {
      getTool("pan").onMouseUp(e, state, canvas, ctx);
      if (state.activeTool !== "pan") {
        canvas.style.cursor = state.getCursorForTool();
      }
      return;
    }
    dispatchMouseEvent("up", e);
  };

  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      const newZoom = Math.max(0.1, Math.min(5, state.viewport.zoom * (1 + delta)));
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const newOffsetX = mx - (mx - state.viewport.offsetX) * (newZoom / state.viewport.zoom);
      const newOffsetY = my - (my - state.viewport.offsetY) * (newZoom / state.viewport.zoom);
      state.setViewport({ zoom: newZoom, offsetX: newOffsetX, offsetY: newOffsetY });
      renderCanvas(state, ctx, canvas);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

    switch (e.key.toLowerCase()) {
      case "v": state.setTool("select"); break;
      case "r": state.setTool("rectangle"); break;
      case "d": state.setTool("diamond"); break;
      case "o": state.setTool("ellipse"); break;
      case "a": state.setTool("arrow"); break;
      case "l": state.setTool("line"); break;
      case "t": state.setTool("text"); break;
      case "p": state.setTool("freehand"); break;
      case "e": state.setTool("eraser"); break;
      case "h": state.setTool("pan"); break;
      case "delete":
      case "backspace":
        if (state.selectedIds.size > 0) {
          state.deleteSelectedShapes();
          renderCanvas(state, ctx, canvas);
        }
        break;
      case "escape":
        state.clearSelection();
        renderCanvas(state, ctx, canvas);
        break;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      if (e.shiftKey) {
        if (state.performRedo()) {
          renderCanvas(state, ctx, canvas);
        }
      } else {
        if (state.performUndo()) {
          renderCanvas(state, ctx, canvas);
        }
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "d") {
      e.preventDefault();
      if (state.selectedIds.size > 0) {
        state.duplicateSelected();
        renderCanvas(state, ctx, canvas);
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "a") {
      e.preventDefault();
      state.selectAll();
      renderCanvas(state, ctx, canvas);
    }

    if (e.key === " " && !e.repeat) {
      e.preventDefault();
      state.setTool("pan");
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === " " && state.activeTool === "pan") {
      state.setTool("select");
    }
  };

  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  renderCanvas(state, ctx, canvas);

  const unsubscribe = state.subscribe(() => {
    renderCanvas(state, ctx, canvas);
  });

  return () => {
    canvas.removeEventListener("mousedown", handleMouseDown);
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("mouseup", handleMouseUp);
    canvas.removeEventListener("wheel", handleWheel);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    socket.onmessage = null;
    unsubscribe();
  };
}

async function loadShapes(slug: string, state: DrawingState, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${slug}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const messages: any[] = res.data.messages || [];
    const shapes: Shape[] = [];
    for (const msg of messages) {
      const shape = parseShapeFromMessage(msg);
      if (shape) shapes.push(shape);
    }
    state.setShapes(shapes);
    renderCanvas(state, ctx, canvas);
  } catch (e) {
    console.error("Failed to load shapes:", e);
  }
}

function parseShapeFromMessage(msg: any): Shape | null {
  try {
    let type = msg.type as string;
    if (type === "CIRCLE") type = "ELLIPSE";

    if (msg.data) {
      const data = typeof msg.data === "string" ? JSON.parse(msg.data) : msg.data;
      return deserializeShape(type as ShapeType, data, msg.id);
    }
    if (type === "RECT" && msg.x !== undefined) {
      return deserializeShape("RECT", {
        x: msg.x, y: msg.y, width: msg.width, height: msg.height,
        strokeColor: msg.strokeColor || "#ffffff",
        fillColor: msg.fillColor || "transparent",
        strokeWidth: msg.strokeWidth || 2,
        opacity: msg.opacity || 100,
        strokeStyle: msg.strokeStyle || "solid",
      }, msg.id);
    }
    return null;
  } catch {
    return null;
  }
}


