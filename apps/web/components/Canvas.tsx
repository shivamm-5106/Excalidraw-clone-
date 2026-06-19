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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    const cleanup = initDraw(canvas, slug, socket, roomId);

    return () => {
      cleanup();
      window.removeEventListener("resize", updateSize);
    };
  }, [slug, socket, roomId]);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 8, zIndex: 10 }}>
        <Toolbar />
        <PropertyPanel />
      </div>
      <canvas
        ref={canvasRef}
        style={{ display: "block", background: "#1e1e1e" }}
      />
    </div>
  );
}
