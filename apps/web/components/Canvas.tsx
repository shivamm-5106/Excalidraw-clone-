"use client";

import { useEffect, useRef, useMemo } from "react";
import { initDraw } from "../draw";
import Toolbar from "./Toolbar";
import PropertyPanel from "./PropertyPanel";

type CanvasProps = {
  slug: string;
  socket: WebSocket;
  roomId: number;
};

export default function Canvas({ slug, socket, roomId }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toolPanel = useMemo(() => (
    <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 8, zIndex: 10 }}>
      <Toolbar />
      <PropertyPanel />
    </div>
  ), []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const cleanup = initDraw(canvasRef.current, slug, socket, roomId);
    return () => {
      cleanup();
    };
  }, [slug, socket, roomId]);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      {toolPanel}
      <canvas
        ref={canvasRef}
        width={5000}
        height={5000}
        style={{ display: "block", width: "100vw", height: "100vh", background: "#1e1e1e" }}
      />
    </div>
  );
}
