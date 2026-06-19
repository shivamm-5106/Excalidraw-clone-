import type { Shape } from "../types";

export interface History {
  entries: Shape[][];
  index: number;
}

export function createHistory(): History {
  return { entries: [[]], index: 0 };
}

export function pushHistory(history: History, shapes: Shape[]): History {
  const newEntries = history.entries.slice(0, history.index + 1);
  newEntries.push(shapes.map(s => ({ ...s })));
  if (newEntries.length > 50) newEntries.shift();
  return { entries: newEntries, index: newEntries.length - 1 };
}

export function undo(history: History): Shape[] | null {
  if (history.index <= 0) return null;
  const newIndex = history.index - 1;
  return (history.entries[newIndex] || []).map(s => ({ ...s }));
}

export function redo(history: History): Shape[] | null {
  if (history.index >= history.entries.length - 1) return null;
  const newIndex = history.index + 1;
  return (history.entries[newIndex] || []).map(s => ({ ...s }));
}

export function canUndo(history: History): boolean {
  return history.index > 0;
}

export function canRedo(history: History): boolean {
  return history.index < history.entries.length - 1;
}
